import { z } from "zod";
import { google } from "@ai-sdk/google"; // OpenAIにする場合は '@ai-sdk/openai' に変更
import { generateText, Output } from "ai";
import {
  PreprocessOutputSchema,
  ReviewAnalysisOutputSchema,
} from "./llm-schema";

type PreprocessedSentences = z.infer<
  typeof PreprocessOutputSchema
>["sentences"];

// 1. 分割・翻訳を行う関数
export async function extractAndTranslate(rawReviewText: string) {
  const { output } = await generateText({
    model: google("gemini-3.1-flash-lite"),
    output: Output.object({
      schema: PreprocessOutputSchema,
    }),
    system: `
      与えられた口コミテキストを意味的な「1文」ごとに分割してください。
      改行や句読点の乱れを補正して読み取ってください。
      外国語の場合は日本語に翻訳してください。外国語と和訳が併記されている場合は、それらを照らし合わせて1つの文セットとして分割してください。
    `,
    prompt: rawReviewText,
  });
  return output.sentences; // Array<{ sequenceNum, originalText, translatedText }>
}

// 2. 構造化分析を行う関数
export async function analyzeReview(sentences: PreprocessedSentences) {
  const formattedText = sentences
    .map((s) => {
      if (s.translatedText) {
        return `[ID: ${s.sequenceNum}]\n原文: ${s.originalText}\n和訳: ${s.translatedText}\n`;
      } else {
        return `[ID: ${s.sequenceNum}]\n原文: ${s.originalText}\n`;
      }
    })
    .join("\n");

  console.log("[DEBUG] 分析AIに渡すテキスト:\n", formattedText);

  const { output } = await generateText({
    model: google("gemini-3.1-flash-lite"), // OpenAIなら openai('gpt-4o-mini') とする
    output: Output.object({
      schema: ReviewAnalysisOutputSchema,
    }),
    system: `
      示される口コミテキストを分析し、以下のJSONスキーマに従って、主言語・副言語の特定、属性推論（国籍、性別、同行者）、トピック別分析（食事、客室、風呂、サービス、立地、その他）を行ってください。
      提供される口コミテキストは、文ごとに分割され [ID: X] というタグが付けられています。
      テキストには「原文」と、それが外国語の場合のみ「和訳」が併記されています。

      【重要ルール】
      1. 言語判定・属性推論: \`primaryLanguage\` や国籍などは、必ず「原文」の言語やニュアンスをもとに推論してください。
      2. トピック抽出: 口コミの中に「部屋」「食事」「接客」「風呂」「立地」「その他」に関する言及があれば、絶対に省略せずすべて抽出して topics 配列に追加してください。意味の解釈には「和訳」を利用してください。
      3. 該当する文の ID (sequenceNum) を配列で指定してください。

      【出力の具体例】
      入力テキスト: 
      [ID: 0]
      原文: The room was beautiful but the breakfast was terrible.
      和訳: 部屋は美しかったですが、朝食はひどいものでした。
      [ID: 1]
      原文: また、フロントのスタッフの対応はとても良かったです。

      この場合、topics配列には必ず以下の3つの要素を含めること:
      - topic: "ROOM", label: "PRAISE", rating: 5, evidenceSequenceNums: [0]
      - topic: "FOOD", label: "COMPLAINT", rating: 1, evidenceSequenceNums: [0]
      - topic: "SERVICE", label: "PRAISE", rating: 5, evidenceSequenceNums: [1]
      `,
    prompt: `以下の口コミを分析してください:\n\n${formattedText}`,
  });

  return output;
}
