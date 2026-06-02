import { useMemo } from "react";
import { Review, TopicType, ReviewLabel } from "@/features/review/domain/types";
import { TOPIC_LABELS, ExtendedLabel } from "./cross-tabulation-config";

export function useCrossTabulation(reviews: Review[]) {
  // --- 1. トピック別 感情分布 ---
  const topicData = useMemo(() => {
    const counts: Record<TopicType, Record<ExtendedLabel, number>> = {
      ROOM: {
        PRAISE: 0,
        COMPLAINT: 0,
        MIXED: 0,
        REQUEST: 0,
        INQUIRY: 0,
        NEUTRAL: 0,
      },
      FOOD: {
        PRAISE: 0,
        COMPLAINT: 0,
        MIXED: 0,
        REQUEST: 0,
        INQUIRY: 0,
        NEUTRAL: 0,
      },
      SERVICE: {
        PRAISE: 0,
        COMPLAINT: 0,
        MIXED: 0,
        REQUEST: 0,
        INQUIRY: 0,
        NEUTRAL: 0,
      },
      BATH: {
        PRAISE: 0,
        COMPLAINT: 0,
        MIXED: 0,
        REQUEST: 0,
        INQUIRY: 0,
        NEUTRAL: 0,
      },
      LOCATION: {
        PRAISE: 0,
        COMPLAINT: 0,
        MIXED: 0,
        REQUEST: 0,
        INQUIRY: 0,
        NEUTRAL: 0,
      },
      OTHER: {
        PRAISE: 0,
        COMPLAINT: 0,
        MIXED: 0,
        REQUEST: 0,
        INQUIRY: 0,
        NEUTRAL: 0,
      },
    };

    reviews.forEach((review) => {
      if (!review.topics) return;
      const userTopicLabels: Partial<Record<TopicType, Set<ReviewLabel>>> = {};

      review.topics.forEach((t) => {
        if (!userTopicLabels[t.topic]) userTopicLabels[t.topic] = new Set();
        userTopicLabels[t.topic]!.add(t.label);
      });

      Object.entries(userTopicLabels).forEach(([topicStr, labelsSet]) => {
        const topic = topicStr as TopicType;
        let finalLabel: ExtendedLabel = "NEUTRAL";

        if (labelsSet.has("PRAISE") && labelsSet.has("COMPLAINT")) {
          finalLabel = "MIXED";
        } else if (labelsSet.has("COMPLAINT")) {
          finalLabel = "COMPLAINT";
        } else if (labelsSet.has("PRAISE")) {
          finalLabel = "PRAISE";
        } else if (labelsSet.has("REQUEST")) {
          finalLabel = "REQUEST";
        } else if (labelsSet.has("INQUIRY")) {
          finalLabel = "INQUIRY";
        }

        counts[topic][finalLabel]++;
      });
    });

    return Object.entries(counts).map(([topic, labelCounts]) => ({
      name: TOPIC_LABELS[topic as TopicType],
      ...labelCounts,
    }));
  }, [reviews]);

  // --- 2. 国籍別 全体感情分布 ---
  const nationalityData = useMemo(() => {
    const counts: Record<string, Record<ReviewLabel, number>> = {};
    reviews.forEach((review) => {
      if (review.analysis) {
        let nat = review.analysis.nationality.value.trim().toUpperCase();
        if (nat === "UNKNOWN") nat = "不明";
        const label = review.analysis.overallLabel.value;
        if (!counts[nat]) {
          counts[nat] = {
            PRAISE: 0,
            COMPLAINT: 0,
            REQUEST: 0,
            INQUIRY: 0,
            NEUTRAL: 0,
          };
        }
        counts[nat][label]++;
      }
    });

    return Object.entries(counts)
      .map(([nat, labelCounts]) => ({
        name: nat,
        ...labelCounts,
        total: Object.values(labelCounts).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [reviews]);

  return { topicData, nationalityData };
}
