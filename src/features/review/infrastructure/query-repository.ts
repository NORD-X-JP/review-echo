import { prisma } from "@/lib/prisma";

/**
 * 指定された組織に紐づくすべての口コミデータを取得する。
 * @param organizationId 組織のID
 * @param startDate 取得開始日（オプション）
 * @param endDate 取得終了日（オプション）
 */
export async function findReviewsByOrganizationId(
  organizationId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return await prisma.review.findMany({
    where: {
      organizationId,
      // startDateやendDateが渡された場合のみ、postedAt（投稿日）で絞り込む
      postedAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    },
    include: {
      sentences: { orderBy: { sequenceNum: "asc" } },
      analysis: true,
      topics: true,
    },
    orderBy: { postedAt: "desc" },
  });
}
