"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
  totalCount: number;
  isSearching?: boolean;
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
  isSearching = false,
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
      <div className="relative glass-card p-1 group focus-elevate">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* 검색 아이콘 또는 로딩 스피너 */}
          {isSearching ? (
            <svg
              className="w-5 h-5 text-blue-400 dark:text-purple-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
          <svg
              className="w-5 h-5 text-gray-400 dark:text-purple-300 group-focus-within:text-blue-500 dark:group-focus-within:text-purple-400 transition-colors"
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
          )}

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
                  chip px-2 py-1 rounded-full transition-all text-xs
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
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <span className="font-medium text-blue-600 dark:text-purple-400">
            &ldquo;{searchQuery}&rdquo;
          </span>{" "}
          검색 결과 {resultsCount}개
          {isSearching && (
            <span className="text-xs text-blue-500 dark:text-purple-400 animate-pulse">
              • 검색 중...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

