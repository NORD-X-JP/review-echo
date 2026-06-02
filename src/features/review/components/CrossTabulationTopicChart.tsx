"use client";

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
import { LABEL_COLORS, ExtendedLabel } from "./cross-tabulation-config";

export type TopicChartData = Record<ExtendedLabel, number> & {
  name: string;
};

interface Props {
  data: TopicChartData[];
}

export function CrossTabulationTopicChart({ data }: Props) {
  return (
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
            data={data}
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
  );
}
