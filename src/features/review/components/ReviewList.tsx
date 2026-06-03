"use client";

import { Review } from "@/features/review/domain/types";
import { useReviewFilter } from "./useReviewFilter";
import { ReviewListSearch } from "./ReviewListSearch";
import { ReviewListCard } from "./ReviewListCard";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  // カスタムフックから状態と計算結果を受け取る
  const {
    activeTopic,
    setActiveTopic,
    activeLabel,
    setActiveLabel,
    searchQuery,
    setSearchQuery,
    filteredReviews,
  } = useReviewFilter(reviews);

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      {/* 検索・絞り込みUI */}
      <ReviewListSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTopic={activeTopic}
        onTopicChange={setActiveTopic}
        activeLabel={activeLabel}
        onLabelChange={setActiveLabel}
        resultCount={filteredReviews.length}
      />

      {/* リスト描画 */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            条件に一致する口コミが見つかりませんでした。
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewListCard
              key={review.id}
              review={review}
              activeTopic={activeTopic}
              activeLabel={activeLabel}
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>
    </section>
  );
}
