import { useState, useMemo } from "react";
import { Review, TopicType } from "@/features/review/domain/types";

export function useReviewFilter(reviews: Review[]) {
  const [activeTopic, setActiveTopic] = useState<TopicType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // 1. トピックによる絞り込み
      const hasTopic =
        activeTopic === "ALL" ||
        review.topics?.some((t) => t.topic === activeTopic);
      if (!hasTopic) return false;

      // 2. キーワードによる絞り込み
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const hasKeyword = review.sentences.some(
          (s) =>
            s.originalText.toLowerCase().includes(query) ||
            (s.translatedText &&
              s.translatedText.toLowerCase().includes(query)),
        );
        if (!hasKeyword) return false;
      }

      return true;
    });
  }, [reviews, activeTopic, searchQuery]);

  return {
    activeTopic,
    setActiveTopic,
    searchQuery,
    setSearchQuery,
    filteredReviews,
  };
}
