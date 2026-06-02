"use client";

import { Review } from "@/features/review/domain/types";
import { useCrossTabulation } from "./useCrossTabulation";
import { CrossTabulationTopicChart } from "./CrossTabulationTopicChart";
import { CrossTabulationNationalityChart } from "./CrossTabulationNationalityChart";

interface CrossTabulationProps {
  reviews: Review[];
}

export function CrossTabulation({ reviews }: CrossTabulationProps) {
  // ロジックはカスタムフックで処理
  const { topicData, nationalityData } = useCrossTabulation(reviews);

  if (reviews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <CrossTabulationTopicChart data={topicData} />
      <CrossTabulationNationalityChart data={nationalityData} />
    </div>
  );
}
