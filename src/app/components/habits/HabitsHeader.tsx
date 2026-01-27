'use client';

import Link from 'next/link';

type ViewMode = 'list' | 'calendar';

interface HabitsHeaderProps {
  viewMode: ViewMode;
  onToggleView: () => void;
}

export default function HabitsHeader({ viewMode, onToggleView }: HabitsHeaderProps) {
  return (
    <header className="header md:sticky md:top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="block hover:opacity-80 transition-opacity mb-2">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                그냥 블로그
              </h1>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400">습관 관리</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 토글 버튼 */}
            <button
              onClick={onToggleView}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label={viewMode === 'list' ? '달력 뷰로 전환' : '목록 뷰로 전환'}
            >
              {viewMode === 'list' ? (
                <>
                  <svg
                    className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    달력
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    목록
                  </span>
                </>
              )}
            </button>
            <Link
              href="/habits/create"
              className="btn-primary"
            >
              습관 추가
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

