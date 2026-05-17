import { DashboardSummary } from "@/components/DashboardSummary";
import { ReviewList } from "@/components/ReviewList";
import { fetchDashboardDataUseCase } from "@/features/review/application/query-workflow";

export default async function DashboardPage() {
  // ※本来はログインセッションから取得しますが、今回はテスト用IDを直接指定します
  // テストデータを作成した際のUserのIDに書き換えてください（例: Prisma Studioで確認）
  const hotelId = "1d91b393-b896-400a-af24-d457b71fbc63";

  // 1. クリーンアーキテクチャのユースケースを呼び出し、完全な型を持つデータを取得
  const reviews = await fetchDashboardDataUseCase(hotelId);

  // データが空の場合のフォールバック
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h1 className="text-2xl font-bold mb-4">口コミ分析ダッシュボード</h1>
        <p>
          口コミデータがありません。「テスト画面」からAIでデータを生成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            口コミ分析ダッシュボード
          </h1>
          <p className="text-gray-500 mt-2">AIが抽出したインサイトと感情分析</p>
        </header>

        {/* サマリー（集計）セクション */}
        <DashboardSummary reviews={reviews} />

        {/* 口コミ一覧とハイライトセクション */}
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
