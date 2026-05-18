"use server";

import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/result";
import {
  processReviewUseCase,
  RawReviewInput,
} from "../application/analyze-workflow";

/**
 * テスト用の口コミを送信し、AI分析パイプラインを起動するAction
 */
export async function submitTestReviewAction(
  text: string,
): Promise<Result<string>> {
  // 1. 入力値のバリデーション
  if (!text || text.trim() === "") {
    return { success: false, error: "口コミ本文が入力されていません。" };
  }

  try {
    // 2. モックデータの準備（テスト用ユーザーの取得）
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: { email: "test@example.com", name: "テストホテル札幌" },
      });
    }

    const mockInput: RawReviewInput = {
      hotelId: testUser.id,
      sourceReviewId: `test-${Date.now()}`,
      reviewUrl: "https://example.com/review",
      overallRating: 3,
      postedAt: new Date(),
      reviewerName: "テスト太郎",
      sourceUserId: "user-123",
      avatarUrl: null,
      text: text.trim(),
    };

    // 3. ユースケースの実行
    await processReviewUseCase(mockInput);

    // 4. 成功結果を返す
    return {
      success: true,
      data: "分析が完了し、データベースに保存されました！",
    };
  } catch (error) {
    console.error("Action Error:", error);
    // 5. 失敗結果を返す（システムエラーを直接ブラウザに露出させない）
    return {
      success: false,
      error: "AIによる分析処理中にエラーが発生しました。",
    };
  }
}
