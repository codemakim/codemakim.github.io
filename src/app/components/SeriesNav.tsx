import Link from "next/link";
import { SeriesInfo } from "../lib/series";
import SeriesStudyStatus from "./SeriesStudyStatus";

interface SeriesNavProps {
  seriesInfo: SeriesInfo;
}

export default function SeriesNav({ seriesInfo }: SeriesNavProps) {
  if (!seriesInfo.seriesName) return null;

  const { prev, next, current, total, seriesName, seriesPostUrls } = seriesInfo;

  return (
    <div className="card p-6 my-8">
      <div className="mb-4">
        <h3 className="text-base font-black flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span>📚</span>
          <span>{seriesName} 시리즈</span>
        </h3>

        <div className="mt-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 overflow-hidden" style={{ border: "var(--nb-border)", background: "var(--bg-secondary)" }}>
              <div
                className="progress-bar h-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, (current / total) * 100))}%` }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((current / total) * 100)}
              />
            </div>
            <span className="text-xs font-mono font-bold tabular-nums" style={{ color: "var(--text-secondary)" }}>
              {current}/{total}
            </span>
          </div>
        </div>

        <SeriesStudyStatus
          seriesName={seriesName}
          postPaths={seriesPostUrls}
          className="mt-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={prev.url} className="btn-primary p-4 text-left" style={{ display: "flex", flexDirection: "column" }}>
            <div className="text-xs mb-1 opacity-80">← 이전 글</div>
            <div className="text-sm font-bold line-clamp-2">{prev.title}</div>
          </Link>
        ) : (
          <div className="p-4 opacity-40" style={{ border: "var(--nb-border)", background: "var(--bg-secondary)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>← 이전 글</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>첫 번째 글입니다</div>
          </div>
        )}

        {next ? (
          <Link href={next.url} className="btn-primary p-4 text-right" style={{ display: "flex", flexDirection: "column" }}>
            <div className="text-xs mb-1 opacity-80">다음 글 →</div>
            <div className="text-sm font-bold line-clamp-2">{next.title}</div>
          </Link>
        ) : (
          <div className="p-4 opacity-40 text-right" style={{ border: "var(--nb-border)", background: "var(--bg-secondary)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>다음 글 →</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>마지막 글입니다</div>
          </div>
        )}
      </div>
    </div>
  );
}
