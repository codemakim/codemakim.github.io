'use client';

import type { DayStats } from './OverallCalendar';

interface OverallCalendarDayProps {
  date: Date;
  stats: DayStats;
  isLoading: boolean;
}

export default function OverallCalendarDay({ date, stats, isLoading }: OverallCalendarDayProps) {
  const isToday = date.toDateString() === new Date().toDateString();
  
  // 성공률에 따른 색상 결정
  const getColor = (successRate: number) => {
    if (successRate === 100) return 'text-green-600 dark:text-green-400';
    if (successRate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (successRate > 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-zinc-400 dark:text-zinc-600';
  };

  // 원형 차트를 위한 stroke-dasharray 계산
  const circumference = 2 * Math.PI * 12; // 반지름 12
  const strokeDashoffset = circumference - (stats.successRate / 100) * circumference;

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
      
      {/* 원형 파이차트 */}
      {isLoading ? (
        <div className="w-6 h-6 flex-shrink-0 aspect-square rounded-full border-2 border-zinc-200 dark:border-zinc-800 opacity-30 animate-pulse"></div>
      ) : stats.totalHabits > 0 ? (
        <div className="relative w-8 h-6 flex-shrink-0 flex items-center justify-center">
          <svg className="w-6 h-6 transform -rotate-90 flex-shrink-0" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
            {/* 배경 원 */}
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-300 dark:text-zinc-700"
            />
            {/* 성공률 원 */}
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={getColor(stats.successRate)}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-out',
              }}
            />
          </svg>
          {/* 달성률 텍스트 - 원 위로 겹쳐서 표시 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={`
                text-xs font-bold leading-none whitespace-nowrap
                text-zinc-900 dark:text-white
                drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]
              `}
            >
              {stats.successRate}%
            </span>
          </div>
        </div>
      ) : (
        <div className="w-6 h-6 flex-shrink-0 aspect-square rounded-full border-2 border-zinc-200 dark:border-zinc-800 opacity-30"></div>
      )}
    </div>
  );
}

