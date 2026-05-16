import { prisma } from "@/lib/prisma";

/**
 * 指定された宿泊事業者（ホテルID）に紐づくすべての口コミデータを取得する。
 * 文の順番（sequenceNum）が崩れないようにソートして取得するのがポイント。
 *
 * @param hotelId 宿泊事業者のシステム内部ID (User.id)
 */
export async function findReviewsWithDetailsByHotelId(hotelId: string) {
  return await prisma.review.findMany({
    where: {
      userId: hotelId,
    },
    include: {
      // 1. 分割された文データ（必ず元の文章の順番通りに取得する）
      sentences: {
        orderBy: { sequenceNum: "asc" },
      },
      // 2. AIによる全体分析データ (1対1)
      analysis: true,
      // 3. トピック別のアスペクト評価データ (1対多)
      topics: true,
    },
    // 新しい口コミが一番上に来るように降順でソート
    orderBy: {
      postedAt: "desc",
    },
  });
}
