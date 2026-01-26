import Link from "next/link";
import { SeriesInfo } from "../lib/series";

interface SeriesNavProps {
  seriesInfo: SeriesInfo;
}

export default function SeriesNav({ seriesInfo }: SeriesNavProps) {
  // 시리즈가 없으면 렌더링하지 않음
  if (!seriesInfo.seriesName) {
    return null;
  }

  const { prev, next, current, total, seriesName } = seriesInfo;

  return (
    <div className="card p-6 my-8">
      {/* 시리즈 제목 */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span>📚</span>
          <span>{seriesName} 시리즈</span>
        </h3>
        
        {/* 진행률 게이지 (전 해상도 공통) */}
        <div className="mt-3" aria-label="시리즈 진행률">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-[#2A2A2A] overflow-hidden">
                <div
                  className="progress-bar h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, (current / total) * 100))}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((current / total) * 100)}
                  role="progressbar"
                />
              </div>
            </div>
            <span className="text-sm tabular-nums text-zinc-600 dark:text-[#A0A0A0]">
              {current}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 이전 글 */}
        {prev ? (
          <Link
            href={prev.url}
            className="btn-primary p-4 text-left"
          >
            <div className="text-xs text-zinc-500 dark:text-[#A0A0A0] mb-1">
              ← 이전 글
            </div>
            <div className="text-sm font-medium text-zinc-900 dark:text-[#000000] line-clamp-2">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-lg bg-zinc-100 dark:bg-[#1A1A1A] opacity-50 border border-zinc-200 dark:border-[#2A2A2A]">
            <div className="text-xs text-zinc-400 dark:text-[#A0A0A0] mb-1">← 이전 글</div>
            <div className="text-sm text-zinc-400 dark:text-[#A0A0A0]">첫 번째 글입니다</div>
          </div>
        )}

        {/* 다음 글 */}
        {next ? (
          <Link
            href={next.url}
            className="btn-primary p-4 text-right"
          >
            <div className="text-xs text-zinc-500 dark:text-[#A0A0A0] mb-1">
              다음 글 →
            </div>
            <div className="text-sm font-medium text-zinc-900 dark:text-[#000000] line-clamp-2">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-lg bg-zinc-100 dark:bg-[#1A1A1A] opacity-50 text-right border border-zinc-200 dark:border-[#2A2A2A]">
            <div className="text-xs text-zinc-400 dark:text-[#A0A0A0] mb-1">다음 글 →</div>
            <div className="text-sm text-zinc-400 dark:text-[#A0A0A0]">마지막 글입니다</div>
          </div>
        )}
      </div>
    </div>
  );
}

