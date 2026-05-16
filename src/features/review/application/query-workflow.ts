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

/**
 * ダッシュボード表示用の口コミデータを取得し、ドメインモデルに変換して返すユースケース
 *
 * @param hotelId 宿泊事業者のシステム内部ID
 * @returns 完全に型付けされた純粋な Review ドメインモデルの配列
 */
export async function fetchDashboardDataUseCase(
  hotelId: string,
): Promise<Review[]> {
  // 1. インフラ層からDBの生データを取得
  const rawReviews = await findReviewsWithDetailsByHotelId(hotelId);

  // 2. DBの型からドメインモデルの型へマッピング（リハイドレーション）
  return rawReviews.map((raw): Review => {
    // --- A. AI分析データ (ReviewAnalysis) の再構築 ---
    let analysis: ReviewAnalysis | undefined = undefined;
    if (raw.analysis) {
      analysis = {
        primaryLanguage: raw.analysis.primaryLanguage,
        secondaryLanguages: raw.analysis.secondaryLanguages,

        // フラット化されていたDBのカラムを、InferredValue型（オブジェクト）に包み直す
        nationality: {
          value: raw.analysis.nationalityValue,
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

    // --- D. 最終的な集約ルート (Review) の構築と返却 ---
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
