'use client';

import { useState } from 'react';
import { Review, TopicType } from '@/features/review/domain/types';

interface ReviewListProps {
  reviews: Review[];
}

const FILTER_TOPICS: { value: TopicType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'すべて表示' },
  { value: 'ROOM', label: '部屋' },
  { value: 'FOOD', label: '食事' },
  { value: 'SERVICE', label: '接客' },
  { value: 'BATH', label: '風呂' },
  { value: 'LOCATION', label: '立地' },
  { value: 'OTHER', label: 'その他' },
];

// --- ヘルパー関数: 正規表現のエスケープ（記号などでアプリがクラッシュするのを防ぐ） ---
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- ヘルパーコンポーネント: 検索キーワードのハイライト描画 ---
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          // 検索キーワードは目立つようにオレンジ色＋太字でハイライト
          <span key={index} className="bg-orange-400 text-black font-bold px-1 rounded mx-0.5">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export function ReviewList({ reviews }: ReviewListProps) {
  const [activeTopic, setActiveTopic] = useState<TopicType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // --- フィルタリングロジック ---
  const filteredReviews = reviews.filter((review) => {
    // 1. トピックによる絞り込み
    const hasTopic = activeTopic === 'ALL' || review.topics?.some((t) => t.topic === activeTopic);
    if (!hasTopic) return false;

    // 2. キーワードによる絞り込み
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      // 原文または和訳のどちらかにキーワードが含まれていればOK
      const hasKeyword = review.sentences.some(
        (s) =>
          s.originalText.toLowerCase().includes(query) ||
          (s.translatedText && s.translatedText.toLowerCase().includes(query))
      );
      if (!hasKeyword) return false;
    }

    return true;
  });

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      {/* --- 検索バー --- */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="口コミの中からキーワードで検索... (例: 朝食, view, スタッフ)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* トピック絞り込みヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          口コミ詳細分析 <span className="text-sm font-normal text-gray-500 ml-2">({filteredReviews.length}件)</span>
        </h2>
        <div className="flex gap-2 overflow-x-auto">
          {FILTER_TOPICS.map((topic) => (
            <button
              key={topic.value}
              onClick={() => setActiveTopic(topic.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTopic === topic.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* 口コミ一覧 */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            条件に一致する口コミが見つかりませんでした。
          </div>
        ) : (
          filteredReviews.map((review) => {
            const activeTopicData = activeTopic === 'ALL'
              ? null
              : review.topics?.find((t) => t.topic === activeTopic);
            const highlightIds = activeTopicData ? activeTopicData.evidenceSequenceNums : [];
            const hasTranslation = review.sentences.some((s) => s.translatedText);

            return (
              <article key={review.id} className="border border-gray-100 rounded-lg p-5 bg-gray-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>推定属性: {review.analysis?.companion.value}</span>
                      <span>国籍: {review.analysis?.nationality.value}</span>
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
                          const isHighlighted = highlightIds.includes(sentence.sequenceNum);
                          const textToShow = sentence.translatedText || sentence.originalText;
                          return (
                            <span
                              key={`trans-${sentence.sequenceNum}`}
                              className={`transition-colors duration-300 ${isHighlighted ? 'bg-yellow-200 text-black font-medium py-0.5 px-1 rounded' : ''
                                }`}
                            >
                              <HighlightedText text={textToShow} query={searchQuery} />{' '}
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
                          const isHighlighted = highlightIds.includes(sentence.sequenceNum);
                          return (
                            <span
                              key={`orig-${sentence.sequenceNum}`}
                              className={`transition-colors duration-300 ${isHighlighted ? 'bg-yellow-200 text-black font-medium py-0.5 px-1 rounded' : ''
                                }`}
                            >
                              <HighlightedText text={sentence.originalText} query={searchQuery} />{' '}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* 翻訳がない（すべて日本語）ブロック */}
                      {review.sentences.map((sentence) => {
                        const isHighlighted = highlightIds.includes(sentence.sequenceNum);
                        return (
                          <span
                            key={`orig-${sentence.sequenceNum}`}
                            className={`transition-colors duration-300 ${isHighlighted ? 'bg-yellow-200 text-black font-medium py-0.5 px-1 rounded' : ''
                              }`}
                          >
                            <HighlightedText text={sentence.originalText} query={searchQuery} />{' '}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {activeTopicData && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100">
                    <span className="font-bold">AIの評価:</span> {activeTopicData.label} (スコア: {activeTopicData.rating}/5)
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}