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
    <div className="card p-6 mb-8">
      <h2 className="text-lg font-black mb-4" style={{ color: "var(--text-primary)" }}>
        태그로 필터링
      </h2>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTagSelect(null)}
          className={`tag cursor-pointer ${selectedTag === null ? "tag-active" : ""}`}
        >
          전체 <span className="ml-1 text-xs opacity-70">({totalCount})</span>
        </button>

        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => onTagSelect(tag.name)}
            className={`tag cursor-pointer ${selectedTag === tag.name ? "tag-active" : ""}`}
          >
            {tag.name}{" "}
            <span className="ml-1 text-xs opacity-70">({tag.count})</span>
          </button>
        ))}
      </div>

      {selectedTag && (
        <div className="mt-4 pt-4" style={{ borderTop: "var(--nb-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              [{selectedTag}]
            </span>{" "}
            태그가 포함된 포스트{" "}
            <span className="font-bold">
              ({tags.find((t) => t.name === selectedTag)?.count || 0}개)
            </span>
          </p>
          <button onClick={() => onTagSelect(null)} className="link mt-2 text-sm hover:underline">
            ✕ 필터 해제
          </button>
        </div>
      )}
    </div>
  );
}
