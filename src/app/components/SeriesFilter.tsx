"use client";

import SeriesStudyStatus from "./SeriesStudyStatus";

interface SeriesWithCount {
  name: string;
  count: number;
}

interface SeriesFilterProps {
  series: SeriesWithCount[];
  selectedSeries: string | null;
  onSeriesSelect: (series: string | null) => void;
  totalCount: number;
  seriesPostsMap: Record<string, string[]>;
}

export default function SeriesFilter({
  series,
  selectedSeries,
  onSeriesSelect,
  totalCount,
  seriesPostsMap,
}: SeriesFilterProps) {
  return (
    <div className="card p-6 mb-8">
      <h2 className="text-lg font-black mb-4" style={{ color: "var(--text-primary)" }}>
        시리즈로 필터링
      </h2>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSeriesSelect(null)}
          className={`tag cursor-pointer ${selectedSeries === null ? "tag-active" : ""}`}
        >
          전체 <span className="ml-1 text-xs opacity-70">({totalCount})</span>
        </button>

        {series.map((s) => (
          <button
            key={s.name}
            onClick={() => onSeriesSelect(s.name)}
            className={`tag cursor-pointer ${selectedSeries === s.name ? "tag-active" : ""}`}
          >
            {s.name} <span className="ml-1 text-xs opacity-70">({s.count})</span>
          </button>
        ))}
      </div>

      {selectedSeries && (
        <div className="mt-4 pt-4" style={{ borderTop: "var(--nb-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              [{selectedSeries}]
            </span>{" "}
            시리즈의 포스트{" "}
            <span className="font-bold">
              ({series.find((s) => s.name === selectedSeries)?.count || 0}개)
            </span>
          </p>

          <SeriesStudyStatus
            seriesName={selectedSeries}
            postPaths={seriesPostsMap[selectedSeries] || []}
            className="mt-3"
          />

          <button onClick={() => onSeriesSelect(null)} className="link mt-2 text-sm hover:underline">
            ✕ 필터 해제
          </button>
        </div>
      )}
    </div>
  );
}
