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
    <div className="glass-card p-6 my-8">
      {/* 시리즈 제목 */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📚</span>
          <span>{seriesName} 시리즈</span>
        </h3>
        
        {/* 진행률 표시 */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: total }).map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${index + 1 === current
                      ? 'bg-blue-500 w-3' 
                      : index + 1 < current
                      ? 'bg-blue-300 dark:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
            className="
              glass-tag p-4 rounded-lg
              hover:scale-105 transition-all
              text-left
            "
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              ← 이전 글
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 opacity-50">
            <div className="text-xs text-gray-400 mb-1">← 이전 글</div>
            <div className="text-sm text-gray-400">첫 번째 글입니다</div>
          </div>
        )}

        {/* 다음 글 */}
        {next ? (
          <Link
            href={next.url}
            className="
              glass-tag p-4 rounded-lg
              hover:scale-105 transition-all
              text-right
            "
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              다음 글 →
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 opacity-50 text-right">
            <div className="text-xs text-gray-400 mb-1">다음 글 →</div>
            <div className="text-sm text-gray-400">마지막 글입니다</div>
          </div>
        )}
      </div>
    </div>
  );
}

