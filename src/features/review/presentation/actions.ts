"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Result } from "@/lib/result";
import {
  processReviewUseCase,
  RawReviewInput,
} from "../application/analyze-workflow";
import {
  ensureUserRecord,
  getOrganizationId,
} from "../application/workspace-workflow";

export async function submitTestReviewAction(
  text: string,
  postedAt?: string,
): Promise<Result<string>> {
  if (!text || text.trim() === "") {
    return { success: false, error: "口コミ本文が入力されていません。" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "ログインが必要です。" };
  }

  const clerkUser = await currentUser();
  await ensureUserRecord(userId, clerkUser);

  const organizationId = await getOrganizationId(userId);
  if (!organizationId) {
    return {
      success: false,
      error: "このアカウントには利用権限がありません。",
    };
  }

  try {
    const mockInput: RawReviewInput = {
      organizationId,
      sourceReviewId: `test-${Date.now()}`,
      reviewUrl: "https://example.com/review",
      overallRating: 3,
      postedAt: postedAt ? new Date(postedAt) : new Date(),
      reviewerName: "テスト太郎",
      sourceUserId: "user-123",
      avatarUrl: null,
      text: text.trim(),
    };

    await processReviewUseCase(mockInput);

    return {
      success: true,
      data: "分析が完了し、データベースに保存されました！",
    };
  } catch (error) {
    console.error("Action Error:", error);
    return {
      success: false,
      error: "AIによる分析処理中にエラーが発生しました。",
    };
  }
}
