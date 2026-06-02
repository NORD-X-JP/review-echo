"use client";

import { TopicType } from "@/features/review/domain/types";

const FILTER_TOPICS: { value: TopicType | "ALL"; label: string }[] = [
  { value: "ALL", label: "すべて表示" },
  { value: "ROOM", label: "部屋" },
  { value: "FOOD", label: "食事" },
  { value: "SERVICE", label: "接客" },
  { value: "BATH", label: "風呂" },
  { value: "LOCATION", label: "立地" },
  { value: "OTHER", label: "その他" },
];

interface ReviewListSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTopic: TopicType | "ALL";
  onTopicChange: (topic: TopicType | "ALL") => void;
  resultCount: number;
}

export function ReviewListSearch({
  searchQuery,
  onSearchChange,
  activeTopic,
  onTopicChange,
  resultCount,
}: ReviewListSearchProps) {
  return (
    <>
      {/* 検索バー */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="口コミの中からキーワードで検索... (例: 朝食, view, スタッフ)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* トピック絞り込みヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          口コミ詳細分析{" "}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({resultCount}件)
          </span>
        </h2>
        <div className="flex gap-2 overflow-x-auto">
          {FILTER_TOPICS.map((topic) => (
            <button
              key={topic.value}
              onClick={() => onTopicChange(topic.value as TopicType | "ALL")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
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
    </>
  );
}
