import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CrossTabulation } from "@/features/review/components/CrossTabulation";
import { DashboardSummary } from "@/features/review/components/DashboardSummary";
import { ReviewList } from "@/features/review/components/ReviewList";
import { DateRangeFilter } from "@/features/review/components/DateRangeFilter";
import {
  fetchDashboardDataUseCase,
  DateRangeOption,
} from "@/features/review/application/query-workflow";
import {
  ensureUserRecord,
  getOrganizationId,
} from "@/features/review/application/workspace-workflow";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const clerkUser = await currentUser();

  // User レコードを確保したうえで所属組織を確認
  await ensureUserRecord(userId, clerkUser);
  const organizationId = await getOrganizationId(userId);

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-800">
            このアカウントには利用権限がありません。
          </p>
          <p className="text-sm text-gray-500">
            管理者から招待を受けてください。
          </p>
        </div>
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const rangeOption = (resolvedParams.range as DateRangeOption) || "all";
  const reviews = await fetchDashboardDataUseCase(organizationId, rangeOption);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              口コミ分析ダッシュボード
            </h1>
            <p className="text-gray-500 mt-2">
              AIが抽出したインサイトと感情分析
            </p>
          </div>
          <DateRangeFilter />
        </header>

        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <p>指定された期間の口コミデータがありません。</p>
          </div>
        ) : (
          <>
            <DashboardSummary reviews={reviews} />
            <CrossTabulation reviews={reviews} />
            <ReviewList reviews={reviews} />
          </>
        )}
      </div>
    </div>
  );
}
