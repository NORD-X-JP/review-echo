import { findReviewsWithDetailsByHotelId } from "../infrastructure/query-repository";
import {
  Review,
  ReviewAnalysis,
  TopicEvaluation,
  Sentence,
  Provenance,
  TopicType,
  ReviewLabel,
  Gender,
  CompanionType,
} from "../domain/types";
import { parseNationalityCode } from "../domain/nationality";

// 許可される期間指定の型
export type DateRangeOption = "all" | "7days" | "30days" | "90days";

/**
 * ダッシュボード表示用の口コミデータを取得し、ドメインモデルに変換して返す
 */
export async function fetchDashboardDataUseCase(
  hotelId: string,
  rangeOption: DateRangeOption = "all", // デフォルトは全期間
): Promise<Review[]> {
  // 1. 文字列のオプションから、具体的な日付（startDate）を計算する
  let startDate: Date | undefined = undefined;

  if (rangeOption !== "all") {
    const now = new Date();
    startDate = new Date();

    if (rangeOption === "7days") {
      startDate.setDate(now.getDate() - 7);
    } else if (rangeOption === "30days") {
      startDate.setDate(now.getDate() - 30);
    } else if (rangeOption === "90days") {
      startDate.setDate(now.getDate() - 90);
    }
  }

  // 2. 計算した日付を使ってインフラ層からデータを取得
  const rawReviews = await findReviewsWithDetailsByHotelId(hotelId, startDate);

  // 3. DBの型からドメインモデルの型へマッピング
  return rawReviews.map((raw): Review => {
    // --- A. AI分析データ (ReviewAnalysis) の再構築 ---
    let analysis: ReviewAnalysis | undefined = undefined;
    if (raw.analysis) {
      analysis = {
        primaryLanguage: raw.analysis.primaryLanguage,
        secondaryLanguages: raw.analysis.secondaryLanguages,

        // フラット化されていたDBのカラムを、InferredValue型（オブジェクト）に包み直す
        nationality: {
          value: parseNationalityCode(raw.analysis.nationalityValue),
          provenance: raw.analysis.nationalityProv as Provenance,
          confidence: raw.analysis.nationalityConf,
          reason: raw.analysis.nationalityReason,
        },
        gender: {
          value: raw.analysis.genderValue as Gender,
          provenance: raw.analysis.genderProv as Provenance,
          confidence: raw.analysis.genderConf,
          reason: raw.analysis.genderReason,
        },
        companion: {
          value: raw.analysis.companionValue as CompanionType,
          provenance: raw.analysis.companionProv as Provenance,
          confidence: raw.analysis.companionConf,
          reason: raw.analysis.companionReason,
        },
        overallLabel: {
          value: raw.analysis.overallLabelValue as ReviewLabel,
          provenance: raw.analysis.overallLabelProv as Provenance,
          confidence: raw.analysis.overallLabelConf,
          reason: raw.analysis.overallLabelReason,
        },
      };
    }

    // --- B. トピック評価 (TopicEvaluation) の再構築 ---
    const topics: TopicEvaluation[] = raw.topics.map((t) => ({
      topic: t.topic as TopicType,
      label: t.label as ReviewLabel,
      rating: t.rating,
      evidenceSequenceNums: t.evidenceSequenceNums,
    }));

    // --- C. 分割された文 (Sentence) の再構築 ---
    const sentences: Sentence[] = raw.sentences.map((s) => ({
      sequenceNum: s.sequenceNum,
      originalText: s.originalText,
      translatedText: s.translatedText,
    }));

    // --- D. 最終的な集約ルート (Review) の構築 ---
    return {
      id: raw.id,
      hotelId: raw.userId,
      sourceReviewId: raw.sourceReviewId,
      reviewUrl: raw.reviewUrl,
      overallRating: raw.overallRating,
      postedAt: raw.postedAt,
      reviewerName: raw.reviewerName,
      sourceUserId: raw.sourceUserId,
      avatarUrl: raw.avatarUrl,
      sentences,
      analysis,
      topics,
    };
  });
}
