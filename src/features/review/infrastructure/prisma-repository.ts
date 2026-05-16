import { prisma } from "@/lib/prisma";
import { Review } from "../domain/types";

/**
 * ドメインモデルのReviewを受け取り、データベースにUPSERT（新規作成 or 更新）する
 *
 * @param review ドメイン層で構築された純粋な Review オブジェクト
 */
export async function saveReview(review: Review): Promise<void> {
  // 1. トピック分析データの整形 (オブジェクト配列への変換)
  const topicEvaluations = [];
  if (review.topics) {
    for (const topic of review.topics) {
      topicEvaluations.push({
        topic: topic.topic,
        label: topic.label,
        rating: topic.rating,
        evidenceSequenceNums: [...topic.evidenceSequenceNums],
      });
    }
  }

  // 2. 分割された文データの整形
  const sentencesData = review.sentences.map((s) => ({
    sequenceNum: s.sequenceNum,
    originalText: s.originalText,
    translatedText: s.translatedText,
  }));

  // 3. AI推論データ (ReviewAnalysis) の整形 (フラット化)
  const analysisData = review.analysis
    ? {
        primaryLanguage: review.analysis.primaryLanguage,
        secondaryLanguages: [...review.analysis.secondaryLanguages],

        // 属性推論のフラット展開
        nationalityValue: review.analysis.nationality.value,
        nationalityProv: review.analysis.nationality.provenance,
        nationalityConf: review.analysis.nationality.confidence,
        nationalityReason: review.analysis.nationality.reason,

        genderValue: review.analysis.gender.value,
        genderProv: review.analysis.gender.provenance,
        genderConf: review.analysis.gender.confidence,
        genderReason: review.analysis.gender.reason,

        companionValue: review.analysis.companion.value,
        companionProv: review.analysis.companion.provenance,
        companionConf: review.analysis.companion.confidence,
        companionReason: review.analysis.companion.reason,

        overallLabelValue: review.analysis.overallLabel.value,
        overallLabelProv: review.analysis.overallLabel.provenance,
        overallLabelConf: review.analysis.overallLabel.confidence,
        overallLabelReason: review.analysis.overallLabel.reason,
      }
    : undefined;

  // 4. データベースへの UPSERT 実行
  await prisma.review.upsert({
    // 【検索条件】宿泊事業者ID と 口コミID の複合キーで既存レコードを探す
    where: {
      userId_sourceReviewId: {
        userId: review.hotelId,
        sourceReviewId: review.sourceReviewId,
      },
    },

    // 【更新処理】すでに口コミが存在する場合の上書きロジック
    update: {
      reviewUrl: review.reviewUrl,
      overallRating: review.overallRating,
      postedAt: review.postedAt,
      reviewerName: review.reviewerName,
      sourceUserId: review.sourceUserId,
      avatarUrl: review.avatarUrl,

      // 文データ: 古いものをすべて削除し、新しいものを入れ直す
      sentences: {
        deleteMany: {},
        create: sentencesData,
      },

      // 分析データ (1対1): 存在すれば更新、なければ新規作成
      ...(analysisData && {
        analysis: {
          upsert: {
            create: analysisData,
            update: analysisData,
          },
        },
      }),

      // トピック分析データ: 古いものをすべて削除し、新しいものを入れ直す
      topics: {
        deleteMany: {},
        ...(topicEvaluations.length > 0 && {
          create: topicEvaluations,
        }),
      },
    },

    // 【新規作成処理】口コミがDBに存在しない場合のINSERTロジック
    create: {
      userId: review.hotelId,
      sourceReviewId: review.sourceReviewId,
      reviewUrl: review.reviewUrl,
      overallRating: review.overallRating,
      postedAt: review.postedAt,
      reviewerName: review.reviewerName,
      sourceUserId: review.sourceUserId,
      avatarUrl: review.avatarUrl,

      // 関連データの同時作成 (Nested Writes)
      sentences: {
        create: sentencesData,
      },

      ...(analysisData && {
        analysis: {
          create: analysisData,
        },
      }),

      ...(topicEvaluations.length > 0 && {
        topics: {
          create: topicEvaluations,
        },
      }),
    },
  });
}
