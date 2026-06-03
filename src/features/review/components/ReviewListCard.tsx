"use client";

import { Review, ReviewLabel, TopicType } from "@/features/review/domain/types";
import { getNationalityDisplayName } from "@/features/review/domain/nationality";

interface ReviewListCardProps {
  review: Review;
  activeTopic: TopicType | "ALL";
  activeLabel: ReviewLabel | "ALL";
  searchQuery: string;
}

// --- ヘルパー関数: 検索キーワードのハイライト描画 ---
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={index}
            className="bg-orange-400 text-black font-bold px-1 rounded mx-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function ReviewListCard({
  review,
  activeTopic,
  activeLabel,
  searchQuery,
}: ReviewListCardProps) {
  const isAllSelected = activeTopic === "ALL" && activeLabel === "ALL";
  // 現在選択されている条件（トピック＆感情）に合致する「すべてのトピック評価」を抽出する
  const matchingTopics = isAllSelected
    ? []
    : review.topics?.filter((t) => {
        const matchTopic = activeTopic === "ALL" || t.topic === activeTopic;
        const matchLabel = activeLabel === "ALL" || t.label === activeLabel;
        return matchTopic && matchLabel;
      }) || [];

  const activeTopicData =
    activeTopic !== "ALL"
      ? review.topics?.find((t) => t.topic === activeTopic)
      : null;

  // 抽出したトピックの根拠文(evidenceSequenceNums)を平坦化（フラットな配列）にする
  const highlightIds = matchingTopics.flatMap((t) => t.evidenceSequenceNums);
  const hasTranslation = review.sentences.some((s) => s.translatedText);

  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(review.postedAt));

  return (
    <article className="border border-gray-100 rounded-lg p-5 bg-gray-50/50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-5">
            <h3 className="font-semibold text-gray-900">
              {review.reviewerName}
            </h3>
            <span className="text-sm text-gray-400">{formattedDate}</span>
          </div>
          <div className="flex gap-3 text-xs text-gray-500 mt-1">
            <span>推定属性: {review.analysis?.companion.value}</span>
            <span>国籍: {review.analysis && getNationalityDisplayName(review.analysis.nationality.value)}</span>
            <span>全体感情: {review.analysis?.overallLabel.value}</span>
          </div>
        </div>
        <div className="text-lg font-bold text-yellow-500">
          ★ {review.overallRating}
        </div>
      </div>

      <div className="mt-4 text-gray-700 leading-relaxed">
        {hasTranslation ? (
          <div className="space-y-3">
            {/* 和訳ブロック */}
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded mr-2 mb-1">
                和訳
              </span>
              {review.sentences.map((sentence) => {
                const isHighlighted = highlightIds.includes(
                  sentence.sequenceNum,
                );
                const textToShow =
                  sentence.translatedText || sentence.originalText;
                return (
                  <span
                    key={`trans-${sentence.sequenceNum}`}
                    className={`transition-colors duration-300 ${isHighlighted ? "bg-yellow-200 text-black font-medium py-0.5 px-1 rounded" : ""}`}
                  >
                    <HighlightedText
                      text={textToShow}
                      query={searchQuery}
                    />{" "}
                  </span>
                );
              })}
            </div>
            {/* 原文ブロック */}
            <div className="text-sm opacity-75 border-l-4 border-gray-200 pl-3">
              <span className="inline-block bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded mr-2 mb-1">
                原文
              </span>
              {review.sentences.map((sentence) => {
                const isHighlighted = highlightIds.includes(
                  sentence.sequenceNum,
                );
                return (
                  <span
                    key={`orig-${sentence.sequenceNum}`}
                    className={`transition-colors duration-300 ${isHighlighted ? "bg-yellow-200 text-black font-medium py-0.5 px-1 rounded" : ""}`}
                  >
                    <HighlightedText
                      text={sentence.originalText}
                      query={searchQuery}
                    />{" "}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* 全て日本語ブロック */}
            {review.sentences.map((sentence) => {
              const isHighlighted = highlightIds.includes(sentence.sequenceNum);
              return (
                <span
                  key={`orig-${sentence.sequenceNum}`}
                  className={`transition-colors duration-300 ${isHighlighted ? "bg-yellow-200 text-black font-medium py-0.5 px-1 rounded" : ""}`}
                >
                  <HighlightedText
                    text={sentence.originalText}
                    query={searchQuery}
                  />{" "}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {activeTopicData && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100">
          <span className="font-bold">AIの評価:</span> {activeTopicData.label}{" "}
          (スコア: {activeTopicData.rating}/5)
        </div>
      )}
    </article>
  );
}
