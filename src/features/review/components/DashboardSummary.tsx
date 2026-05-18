"use client";

import { Review } from "@/features/review/domain/types";

interface SummaryProps {
  reviews: Review[];
}

export function DashboardSummary({ reviews }: SummaryProps) {
  const totalReviews = reviews.length;

  // 全体評価の平均を計算
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + r.overallRating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  // PRAISE（好意的な感情）の数をカウント
  const praiseCount = reviews.filter(
    (r) => r.analysis?.overallLabel.value === "PRAISE",
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">総口コミ件数</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {totalReviews}{" "}
          <span className="text-base font-normal text-gray-500">件</span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">平均評価</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">★ {avgRating}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">
          好意的な口コミ (PRAISE)
        </h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {praiseCount}{" "}
          <span className="text-base font-normal text-gray-500">件</span>
        </p>
      </div>
    </div>
  );
}
