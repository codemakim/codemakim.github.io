'use client';

import Link from 'next/link';
import PageHeader from './PageHeader';

type ViewMode = 'list' | 'calendar';

interface HabitsHeaderProps {
  viewMode: ViewMode;
  onToggleView: () => void;
}

export default function HabitsHeader({ viewMode, onToggleView }: HabitsHeaderProps) {
  return (
    <PageHeader
      subtitle="습관 관리"
      rightAction={
        <>
          {/* 토글 버튼 - 아이콘만 */}
          <button
            onClick={onToggleView}
            className="tooltip-wrapper flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label={viewMode === 'list' ? '달력 뷰로 전환' : '목록 뷰로 전환'}
            data-tooltip={viewMode === 'list' ? '달력 뷰로 전환' : '목록 뷰로 전환'}
          >
            {viewMode === 'list' ? (
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
            ) : (
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
            )}
          </button>
          {/* 과거 습관 - 아이콘만 */}
          <Link
            href="/habits/archive"
            className="tooltip-wrapper flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="과거 습관"
            data-tooltip="과거 습관"
          >
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </Link>
          {/* 습관 추가 - + 아이콘만 */}
          <Link
            href="/habits/create"
            className="tooltip-wrapper flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            aria-label="습관 추가"
            data-tooltip="습관 추가"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Link>
        </>
      }
    />
  );
}

