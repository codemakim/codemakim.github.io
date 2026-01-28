'use client';

import { useRouter } from 'next/navigation';
import { formatDateKorean } from '@/app/lib/dateUtils';
import type { HabitWithCompletion } from './types';

interface HabitCardProps {
  habit: HabitWithCompletion;
  today: string;
  isProcessing: boolean;
  onToggleComplete: (habitId: string, completed: boolean, date: string) => void;
  mounted: boolean;
}

export default function HabitCard({
  habit,
  today,
  isProcessing,
  onToggleComplete,
  mounted,
}: HabitCardProps) {
  const router = useRouter();

  return (
    <div
      className="card p-4 min-h-[120px] relative group"
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      {/* 체크 버튼 (우측 상단, 더 크고 명확하게) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleComplete(habit.id, !habit.completed, today);
        }}
        disabled={isProcessing}
        className={`
          absolute top-3 right-3 w-12 h-12 rounded-full border-2 transition-all duration-200
          flex items-center justify-center z-10
          ${isProcessing
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer'
          }
          ${habit.completed
            ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white shadow-lg scale-100'
            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white hover:shadow-md hover:scale-105 active:scale-95'
          }
        `}
        aria-label={habit.completed ? '완료 취소' : '완료 처리'}
        title={habit.completed ? '완료 취소' : '완료 처리'}
      >
        {habit.completed ? (
          <svg
            className="w-7 h-7 text-white dark:text-zinc-900 animate-checkmark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              strokeDasharray: '20',
              strokeDashoffset: '0',
              animation: 'drawCheckmark 0.3s ease-out forwards',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
        )}
      </button>

      {/* 나머지 영역 클릭 → 상세 페이지 */}
      <div
        onClick={() => router.push(`/habits/detail?id=${habit.id}`)}
        className={`
          block pr-14 cursor-pointer
          ${habit.completed ? 'opacity-60' : ''}
          hover:opacity-100 transition-opacity
        `}
      >
        <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white line-clamp-2">
          {habit.title}
        </h3>
        {habit.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
            {habit.description}
          </p>
        )}
        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-auto">
          {formatDateKorean(habit.start_date)} ~ {formatDateKorean(habit.end_date)}
        </div>
      </div>
    </div>
  );
}

