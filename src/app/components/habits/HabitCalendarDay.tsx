'use client';

import type { HabitDayStatus } from './HabitCalendar';

interface HabitCalendarDayProps {
  date: Date;
  status: HabitDayStatus;
  habitColor: string;
  isLoading: boolean;
}

export default function HabitCalendarDay({
  date,
  status,
  habitColor,
  isLoading,
}: HabitCalendarDayProps) {
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col items-center justify-center p-1 min-w-0">
      {/* 날짜 번호 */}
      <span
        className={`
          text-xs font-medium mb-1 flex-shrink-0
          ${isToday
            ? 'text-zinc-900 dark:text-white font-bold'
            : 'text-zinc-600 dark:text-zinc-400'
          }
        `}
      >
        {date.getDate()}
      </span>
      
      {/* 상태 표시 */}
      {isLoading ? (
        <div className="w-6 h-6 flex-shrink-0 aspect-square rounded-full border-2 border-zinc-200 dark:border-zinc-800 opacity-30 animate-pulse"></div>
      ) : status.shouldDo ? (
        // 수행해야 하는 날
        <div
          className="w-6 h-6 flex-shrink-0 aspect-square rounded-full border-2"
          style={{
            backgroundColor: status.completed ? habitColor : 'transparent',
            borderColor: status.completed ? habitColor : 'currentColor',
            color: status.completed ? 'white' : habitColor,
          }}
        >
          {status.completed && (
            <svg
              className="w-full h-full p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      ) : (
        // 수행하지 않는 날
        <div className="w-6 h-6 flex-shrink-0 aspect-square rounded-full border-2 border-zinc-200 dark:border-zinc-800 opacity-30"></div>
      )}
    </div>
  );
}

