import { useState, useMemo } from "react";
import { Review, TopicType, ReviewLabel } from "@/features/review/domain/types";

export function useReviewFilter(reviews: Review[]) {
  const [activeTopic, setActiveTopic] = useState<TopicType | "ALL">("ALL");
  const [activeLabel, setActiveLabel] = useState<ReviewLabel | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // 1. トピック ＆ 感情による絞り込み（AND条件）
      let matchesTopicAndLabel = true;

      if (activeTopic !== "ALL" && activeLabel !== "ALL") {
        // 特定のトピック ＆ 感情の組み合わせが存在するか
        matchesTopicAndLabel =
          review.topics?.some(
            (t) => t.topic === activeTopic && t.label === activeLabel,
          ) ?? false;
      } else if (activeTopic !== "ALL") {
        // 特定のトピックの口コミが存在するか
        matchesTopicAndLabel =
          review.topics?.some((t) => t.topic === activeTopic) ?? false;
      } else if (activeLabel !== "ALL") {
        // 特定の感情の口コミが存在するか
        matchesTopicAndLabel =
          review.topics?.some((t) => t.label === activeLabel) ?? false;
      }

      if (!matchesTopicAndLabel) return false;

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
  }, [reviews, activeTopic, activeLabel, searchQuery]);

  return {
    activeTopic,
    setActiveTopic,
    activeLabel,
    setActiveLabel,
    searchQuery,
    setSearchQuery,
    filteredReviews,
  };
}
