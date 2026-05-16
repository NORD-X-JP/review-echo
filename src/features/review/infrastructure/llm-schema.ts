import { z } from "zod";

// --- LLM Call 1: 前処理（分割・翻訳）用スキーマ ---
export const PreprocessOutputSchema = z.object({
  sentences: z.array(z.object({
    sequenceNum: z.number().describe('0から始まる連番'),
    originalText: z.string().describe('元の口コミの1文（意味的な区切り）'),
    translatedText: z.string().nullable().describe('原文が日本語以外の場合は日本語訳。日本語の場合はnull')
  })).describe('口コミを意味的な1文ごとに分割した配列。和訳が併記されている場合は、外国語と和訳を1つの文としてまとめて扱うこと。')
});

// --- LLM Call 2: 分析・推論用スキーマ ---
export const TopicAnalysisSchema = z.object({
  label: z
    .enum(["PRAISE", "COMPLAINT", "REQUEST", "INQUIRY", "NEUTRAL"])
    .describe("そのトピックに対する顧客の感情や意図"),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe("1(非常に不満)から5(非常に満足)までの5段階評価"),
  evidenceSequenceNums: z
    .array(z.number())
    .describe(
      "この評価の根拠となった文の sequenceNum の配列。該当なしの場合は空配列",
    ),
});

export const ReviewAnalysisOutputSchema = z.object({
  primaryLanguage: z
    .string()
    .describe(
      '口コミの主言語（例: "ja", "en", "zh-TW"）。日本語以外の言語を優先的に選択',
    ),
  secondaryLanguages: z
    .array(z.string())
    .describe("混ざっている副言語。なければ空配列"),

  // 属性推論
  nationality: z.object({
    value: z
      .string()
      .describe(
        '推定される国籍や地域（わからない場合は強引に推定せず "UNKNOWN"）',
      ),
    confidence: z.number().min(0).max(1).describe("推論の自信度（0.0〜1.0）"),
    reason: z.string().describe("その国籍を推定した根拠。本文のニュアンス等"),
  }),
  gender: z.object({
    value: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  }),
  companion: z.object({
    value: z.enum(["SOLO", "COUPLE", "FAMILY", "GROUP", "UNKNOWN"]),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  }),

  // 全体評価
  overallLabel: z.object({
    value: z.enum(["PRAISE", "COMPLAINT", "REQUEST", "INQUIRY", "NEUTRAL"]),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  }),

  // トピック別分析（null を許容することで、「言及されていない」ことを表現）
  topics: z.object({
    FOOD: TopicAnalysisSchema.nullable().describe(
      "食事、レストラン、朝食などに関する言及",
    ),
    ROOM: TopicAnalysisSchema.nullable().describe(
      "客室、清掃状態、アメニティなどに関する言及",
    ),
    BATH: TopicAnalysisSchema.nullable().describe(
      "風呂、温泉、大浴場などに関する言及",
    ),
    SERVICE: TopicAnalysisSchema.nullable().describe(
      "接客、スタッフの対応、フロントなどに関する言及",
    ),
    LOCATION: TopicAnalysisSchema.nullable().describe(
      "立地、アクセス、周辺環境などに関する言及",
    ),
    OTHER:
      TopicAnalysisSchema.nullable().describe(
        "上記に当てはまらない設備や体験など",
      ),
  }),
});

// TypeScriptの型もZodから自動生成
export type ReviewAnalysisOutput = z.infer<typeof ReviewAnalysisOutputSchema>;
