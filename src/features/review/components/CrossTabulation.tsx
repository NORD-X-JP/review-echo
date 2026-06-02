"use client";

import { useMemo } from "react";
import { Review, TopicType, ReviewLabel } from "@/features/review/domain/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CrossTabulationProps {
  reviews: Review[];
}

const TOPIC_LABELS: Record<TopicType, string> = {
  ROOM: "部屋",
  FOOD: "食事",
  SERVICE: "接客",
  BATH: "風呂",
  LOCATION: "立地",
  OTHER: "その他",
};

// 内部計算用の拡張ラベル型（既存のReviewLabelに 'MIXED' を追加）
type ExtendedLabel = ReviewLabel | "MIXED";

const LABEL_COLORS: Record<ExtendedLabel, string> = {
  PRAISE: "#22c55e", // 緑（賞賛）
  COMPLAINT: "#ef4444", // 赤（不満）
  MIXED: "#a855f7", // 紫（賛否両論）
  REQUEST: "#f59e0b", // オレンジ（要望）
  INQUIRY: "#3b82f6", // 青（質問）
  NEUTRAL: "#9ca3af", // グレー（中立）
};

export function CrossTabulation({ reviews }: CrossTabulationProps) {
  // --- 1. トピック別 感情分布（1ユーザー1カウント・賛否両論考慮） ---
  const topicData = useMemo(() => {
    // MIXED を含めたカウンターを初期化
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

      // この口コミの中で、各トピックに対してどの感情ラベルが存在したかを収集
      const userTopicLabels: Partial<Record<TopicType, Set<ReviewLabel>>> = {};

      review.topics.forEach((t) => {
        if (!userTopicLabels[t.topic]) {
          userTopicLabels[t.topic] = new Set();
        }
        userTopicLabels[t.topic]!.add(t.label);
      });

      // 収集したラベル群を「1つの代表感情」にまとめる
      Object.entries(userTopicLabels).forEach(([topicStr, labelsSet]) => {
        const topic = topicStr as TopicType;

        let finalLabel: ExtendedLabel = "NEUTRAL";

        if (labelsSet.has("PRAISE") && labelsSet.has("COMPLAINT")) {
          // 賞賛と不満が混在している場合は「賛否両論」
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

        // 決定した「1つの代表感情」だけをカウントアップする
        counts[topic][finalLabel]++;
      });
    });

    return Object.entries(counts).map(([topic, labelCounts]) => ({
      name: TOPIC_LABELS[topic as TopicType],
      ...labelCounts,
    }));
  }, [reviews]);

  // --- 2. 国籍別 全体感情分布 (前回と同じ) ---
  const nationalityData = useMemo(() => {
    const counts: Record<string, Record<ReviewLabel, number>> = {};
    reviews.forEach((review) => {
      if (review.analysis) {
        let nat = review.analysis.nationality.value.trim().toUpperCase();
        if (nat === "UNKNOWN") nat = "不明";
        const label = review.analysis.overallLabel.value;
        if (!counts[nat])
          counts[nat] = {
            PRAISE: 0,
            COMPLAINT: 0,
            REQUEST: 0,
            INQUIRY: 0,
            NEUTRAL: 0,
          };
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

  if (reviews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* グラフ1: トピック別感情分布 */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          トピック別の賞賛・不満
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          ※1ユーザーにつき代表感情を1つ抽出（グラフの高さ＝人数）
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topicData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="PRAISE"
                name="賞賛"
                stackId="a"
                fill={LABEL_COLORS.PRAISE}
              />
              <Bar
                dataKey="COMPLAINT"
                name="不満"
                stackId="a"
                fill={LABEL_COLORS.COMPLAINT}
              />
              {/* 【追加】賛否両論の棒を紫で追加 */}
              <Bar
                dataKey="MIXED"
                name="賛否両論"
                stackId="a"
                fill={LABEL_COLORS.MIXED}
              />
              <Bar
                dataKey="REQUEST"
                name="要望"
                stackId="a"
                fill={LABEL_COLORS.REQUEST}
              />
              <Bar
                dataKey="INQUIRY"
                name="質問"
                stackId="a"
                fill={LABEL_COLORS.INQUIRY}
              />
              <Bar
                dataKey="NEUTRAL"
                name="中立"
                stackId="a"
                fill={LABEL_COLORS.NEUTRAL}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* グラフ2: 国籍別 (前回と同じため省略せずに描画) */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          国籍・地域別の全体満足度
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          ※口コミ件数が多い上位7カ国を表示
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={nationalityData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="PRAISE"
                name="賞賛"
                stackId="a"
                fill={LABEL_COLORS.PRAISE}
              />
              <Bar
                dataKey="COMPLAINT"
                name="不満"
                stackId="a"
                fill={LABEL_COLORS.COMPLAINT}
              />
              <Bar
                dataKey="REQUEST"
                name="要望"
                stackId="a"
                fill={LABEL_COLORS.REQUEST}
              />
              <Bar
                dataKey="INQUIRY"
                name="質問"
                stackId="a"
                fill={LABEL_COLORS.INQUIRY}
              />
              <Bar
                dataKey="NEUTRAL"
                name="中立"
                stackId="a"
                fill={LABEL_COLORS.NEUTRAL}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
