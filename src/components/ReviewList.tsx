"use client";

import { useState } from "react";
import { Review, TopicType } from "@/features/review/domain/types";

interface ReviewListProps {
  reviews: Review[];
}

// 絞り込み用のトピック一覧
const FILTER_TOPICS: { value: TopicType | "ALL"; label: string }[] = [
  { value: "ALL", label: "すべて表示" },
  { value: "ROOM", label: "部屋" },
  { value: "FOOD", label: "食事" },
  { value: "SERVICE", label: "接客" },
  { value: "BATH", label: "風呂" },
  { value: "LOCATION", label: "立地" },
];

export function ReviewList({ reviews }: ReviewListProps) {
  const [activeTopic, setActiveTopic] = useState<TopicType | "ALL">("ALL");

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">口コミ詳細分析</h2>

        {/* トピック絞り込みボタン群 */}
        <div className="flex gap-2 overflow-x-auto">
          {FILTER_TOPICS.map((topic) => (
            <button
              key={topic.value}
              onClick={() => setActiveTopic(topic.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTopic === topic.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => {
          // 現在選択されているトピックの評価データを探す
          const activeTopicData =
            activeTopic === "ALL"
              ? null
              : review.topics?.find((t) => t.topic === activeTopic);

          // 選択されたトピックに言及がない場合は、この口コミを非表示にする（フィルタリング機能）
          if (activeTopic !== "ALL" && !activeTopicData) return null;

          // ハイライトすべき文のID配列を取得
          const highlightIds = activeTopicData
            ? activeTopicData.evidenceSequenceNums
            : [];

          return (
            <article
              key={review.id}
              className="border border-gray-100 rounded-lg p-5 bg-gray-50/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {review.reviewerName}
                  </h3>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    {/* ドメインモデルの純粋な型から安全にデータを展開 */}
                    <span>推定属性: {review.analysis?.companion.value}</span>
                    <span>国籍: {review.analysis?.nationality.value}</span>
                    <span>全体感情: {review.analysis?.overallLabel.value}</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-yellow-500">
                  ★ {review.overallRating}
                </div>
              </div>

              {/* 口コミ本文のハイライト描画 */}
              <div className="mt-4 text-gray-700 leading-relaxed">
                {review.sentences.map((sentence) => {
                  const isHighlighted = highlightIds.includes(
                    sentence.sequenceNum,
                  );

                  return (
                    <span
                      key={sentence.sequenceNum}
                      className={`transition-colors duration-300 ${
                        isHighlighted
                          ? "bg-yellow-200 text-black font-medium py-0.5 px-1 rounded"
                          : ""
                      }`}
                    >
                      {/* 和訳が存在する場合は、原文の横に表示するか、和訳を優先表示する */}
                      {sentence.translatedText ? (
                        <span title={sentence.originalText}>
                          {sentence.translatedText}{" "}
                        </span>
                      ) : (
                        <span>{sentence.originalText} </span>
                      )}
                    </span>
                  );
                })}
              </div>

              {/* ハイライトされたAIの感情評価と理由の表示 */}
              {activeTopicData && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100">
                  <span className="font-bold">AIの評価:</span>{" "}
                  {activeTopicData.label} (スコア: {activeTopicData.rating}/5)
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
