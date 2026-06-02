import { prisma } from "@/lib/prisma";

/**
 * 指定された宿泊事業者（ホテルID）に紐づくすべての口コミデータを取得する。
 * * @param hotelId 宿泊事業者のシステム内部ID
 * @param startDate 取得開始日（オプション）
 * @param endDate 取得終了日（オプション）
 */
export async function findReviewsWithDetailsByHotelId(
  hotelId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return await prisma.review.findMany({
    where: {
      userId: hotelId,
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
