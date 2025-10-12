"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
  totalCount: number;
}

const PLACEHOLDER_TEXTS = [
  "React Hook 검색...",
  "성능 최적화 검색...",
  "테스팅 검색...",
  "Next.js 검색...",
];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  resultsCount,
  totalCount,
}: SearchBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // 플레이스홀더 로테이션
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6">
      <div className="relative glass-card p-1">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* 검색 아이콘 */}
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* 검색 입력 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
            className="
              flex-1 bg-transparent outline-none
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              text-sm
            "
          />

          {/* 검색 결과 카운트 */}
          {searchQuery && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {resultsCount}개 / {totalCount}개
              </span>
              
              {/* 클리어 버튼 */}
              <button
                onClick={() => onSearchChange("")}
                className="
                  p-1 rounded-full
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                "
                aria-label="검색어 지우기"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 검색 결과 메시지 */}
      {searchQuery && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">
            "{searchQuery}"
          </span>{" "}
          검색 결과 {resultsCount}개
        </div>
      )}
    </div>
  );
}

