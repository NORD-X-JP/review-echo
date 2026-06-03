import { useMemo } from "react";
import { Review, TopicType, ReviewLabel } from "@/features/review/domain/types";
import { TOPIC_LABELS, ExtendedLabel } from "./cross-tabulation-config";
import { getNationalityDisplayName } from "@/features/review/domain/nationality";

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
        const nat = getNationalityDisplayName(
          review.analysis.nationality.value,
        );
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

    // 全体を計算して配列化する
    const allData = Object.entries(counts).map(([nat, labelCounts]) => ({
      name: nat,
      ...labelCounts,
      total: Object.values(labelCounts).reduce((a, b) => a + b, 0),
    }));

    // 1. 合計数（total）が多い順にソートする
    allData.sort((a, b) => b.total - a.total);

    // 2. 上位7カ国だけに絞る
    const top7 = allData.slice(0, 7);

    // 3. 絞り込んだ7件の中で、「不明」だけを右端（最後）に移動させるカスタムソート
    return top7.sort((a, b) => {
      if (a.name === "不明") return 1; // aが「不明」なら後ろへ
      if (b.name === "不明") return -1; // bが「不明」なら前（aを維持）へ
      // どちらも「不明」でなければ、既存の順番（totalの降順）を維持
      return b.total - a.total;
    });
  }, [reviews]);

  return { topicData, nationalityData };
}
