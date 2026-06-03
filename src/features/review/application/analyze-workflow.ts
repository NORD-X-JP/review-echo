import {
  extractAndTranslate,
  analyzeReview,
} from "../infrastructure/ai-adapter";
import { saveReview } from "../infrastructure/prisma-repository";
import {
  Review,
  ReviewAnalysis,
  TopicEvaluation,
  Provenance,
  TopicType,
} from "../domain/types";

// APIや画面から受け取る生の口コミデータ（FACT）の型
export interface RawReviewInput {
  organizationId: string;
  sourceReviewId: string;
  reviewUrl: string | null;
  overallRating: number;
  postedAt: Date;
  reviewerName: string;
  sourceUserId: string | null;
  avatarUrl: string | null;
  text: string; // 口コミ本文
}

/**
 * 口コミを分析してデータベースに保存するユースケース
 */
export async function processReviewUseCase(
  input: RawReviewInput,
): Promise<void> {
  console.log(`[Workflow] 開始: レビューID ${input.sourceReviewId}`);

  // 1. 【前処理】AIによる意味的な文分割と翻訳 (LLM Call 1)
  console.log("[Workflow] 1. 文分割・翻訳を実行中...");
  const sentences = await extractAndTranslate(input.text);

  // 2. 【分析】AIによるアスペクト分析と属性推論 (LLM Call 2)
  console.log("[Workflow] 2. 構造化分析を実行中...");
  const aiResult = await analyzeReview(sentences);
  console.log(
    "[DEBUG] AIの抽出したトピック:",
    JSON.stringify(aiResult.topics, null, 2),
  );

  // 3. 【マッピング】AIの出力結果を「純粋なドメインモデル (types.ts)」に変換する
  console.log("[Workflow] 3. ドメインモデルを構築中...");

  // 分析データ (ReviewAnalysis) の構築
  const analysis: ReviewAnalysis = {
    primaryLanguage: aiResult.primaryLanguage,
    secondaryLanguages: aiResult.secondaryLanguages,
    nationality: { ...aiResult.nationality, provenance: "INFERRED" },
    gender: { ...aiResult.gender, provenance: "INFERRED" },
    companion: { ...aiResult.companion, provenance: "INFERRED" },
    overallLabel: { ...aiResult.overallLabel, provenance: "INFERRED" },
  };

  // トピック評価 (TopicEvaluation) の構築
  const topics: TopicEvaluation[] = aiResult.topics.map((t) => ({
    topic: t.topic as TopicType,
    label: t.label,
    rating: t.rating,
    evidenceSequenceNums: [...t.evidenceSequenceNums],
  }));

  // 完全な集約ルート (Review) の構築
  const reviewDomainModel: Review = {
    id: crypto.randomUUID(), // システム内部IDを生成
    organizationId: input.organizationId,
    sourceReviewId: input.sourceReviewId,
    reviewUrl: input.reviewUrl,
    overallRating: input.overallRating,
    postedAt: input.postedAt,
    reviewerName: input.reviewerName,
    sourceUserId: input.sourceUserId,
    avatarUrl: input.avatarUrl,
    sentences: sentences,
    analysis: analysis,
    topics: topics,
  };

  // 4. 【永続化】データベースへ保存 (UPSERT)
  console.log("[Workflow] 4. データベースへ保存中...");
  await saveReview(reviewDomainModel);

  console.log(`[Workflow] 完了: レビューの処理が成功しました！`);
}
