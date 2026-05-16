import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google"; // OpenAIにする場合は '@ai-sdk/openai' に変更
import {
  PreprocessOutputSchema,
  ReviewAnalysisOutputSchema,
} from "./llm-schema";

// 1. 分割・翻訳を行う関数
export async function extractAndTranslate(rawReviewText: string) {
  const { output } = await generateText({
    model: google("gemini-1.5-flash-latest"),
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
export async function analyzeReview(sentences: any[]) {
  const formattedText = sentences
    .map((s) => `[ID: ${s.sequenceNum}] ${s.text}`)
    .join("\n");

  const { output } = await generateText({
    model: google("gemini-1.5-flash-latest"), // OpenAIなら openai('gpt-4o-mini') とする
    output: Output.object({
      schema: ReviewAnalysisOutputSchema,
    }),
    system: `
      示される口コミテキストを分析し、以下のJSONスキーマに従って、主言語・副言語の特定、属性推論（国籍、性別、同行者）、トピック別分析（食事、客室、風呂、サービス、立地、その他）を行ってください。
      提供される口コミテキストは、文ごとに分割され [ID: X] というタグが付けられています。

      【指示】
      1. 指定されたJSONスキーマに従い、口コミの属性とトピックごとの感情・意図を分析してください。
      2. 「推論（INFERRED）」を行う場合、必ず根拠となる理由(reason)と自信度(confidence)を記述してください。不明な場合は 'UNKNOWN' としてください。
      3. トピック評価の根拠として、必ず該当する文の ID (sequenceNum) を配列で指定してください。LLM自身でテキストを捏造せず、必ず提供されたIDのみを使用してください。
      4. 言及されていないトピックは必ず null を設定してください。
    `,
    prompt: `以下の口コミを分析してください:\n\n${formattedText}`,
  });

  return output;
}