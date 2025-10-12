"use client";

import { TagWithCount } from "../lib/tags";

interface TagFilterProps {
  tags: TagWithCount[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  totalCount: number;
}

export default function TagFilter({
  tags,
  selectedTag,
  onTagSelect,
  totalCount,
}: TagFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🏷️ 태그로 필터링
      </h2>

      <div className="flex flex-wrap gap-2">
        {/* 전체 보기 버튼 */}
        <button
          onClick={() => onTagSelect(null)}
          className={`
            px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer
            ${
              selectedTag === null
                ? "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }
          `}
        >
          전체 <span className="ml-1 text-xs opacity-70">({totalCount})</span>
        </button>

        {/* 각 태그 버튼 */}
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => onTagSelect(tag.name)}
            className={`
              px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer
              ${
                selectedTag === tag.name
                  ? "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {tag.name}{" "}
            <span className="ml-1 text-xs opacity-70">({tag.count})</span>
          </button>
        ))}
      </div>

      {/* 필터 상태 표시 */}
      {selectedTag && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">
              [{selectedTag}]
            </span>{" "}
            태그가 포함된 포스트{" "}
            <span className="font-medium">
              ({tags.find((t) => t.name === selectedTag)?.count || 0}개)
            </span>
          </p>
          <button
            onClick={() => onTagSelect(null)}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ✕ 필터 해제
          </button>
        </div>
      )}
    </div>
  );
}

