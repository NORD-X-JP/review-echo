import { DashboardSummary } from "@/features/review/components/DashboardSummary";
import { ReviewList } from "@/features/review/components/ReviewList";
import { DateRangeFilter } from "@/features/review/components/DateRangeFilter";
import {
  fetchDashboardDataUseCase,
  DateRangeOption,
} from "@/features/review/application/query-workflow";

// Next.jsの仕様: searchParams を受け取るインターフェース
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // ※本来はログインセッションから取得するが、今回はテスト用IDを直接指定
  // テストデータを作成した際のUserのIDに書き換えてください
  const hotelId = process.env.TEST_HOTEL_ID;
  if (!hotelId) throw new Error("TEST_HOTEL_ID is not set");

  // 1. URLから 'range' パラメータを取得
  const resolvedParams = await searchParams;
  const rangeOption = (resolvedParams.range as DateRangeOption) || "all";

  // 2. 指定された期間でデータを取得（DB側で絞り込まれる）
  const reviews = await fetchDashboardDataUseCase(hotelId, rangeOption);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ページヘッダーと期間フィルターを並べて配置 */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              口コミ分析ダッシュボード
            </h1>
            <p className="text-gray-500 mt-2">
              AIが抽出したインサイトと感情分析
            </p>
          </div>

          {/* 追加した期間フィルター UI */}
          <DateRangeFilter />
        </header>

        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <p>指定された期間の口コミデータがありません。</p>
          </div>
        ) : (
          <>
            {/* サマリーセクション（渡されるreviewsは既に期間で絞り込まれている） */}
            <DashboardSummary reviews={reviews} />

            {/* クロス集計エリア (次回ここに実装します) */}

            {/* 口コミ一覧セクション */}
            <ReviewList reviews={reviews} />
          </>
        )}
      </div>
    </div>
  );
}
