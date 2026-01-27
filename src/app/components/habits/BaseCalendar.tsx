'use client';

import { useState, ReactNode } from 'react';

interface BaseCalendarProps {
  renderDayCell: (date: Date, isLoading: boolean) => ReactNode;
  isLoading?: boolean;
  onMonthChange?: (year: number, month: number) => void; // 월 변경 시 콜백
}

export default function BaseCalendar({
  renderDayCell,
  isLoading = false,
  onMonthChange,
}: BaseCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 현재 월의 첫 날과 마지막 날 계산
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일

  // 달력 그리드를 위한 날짜 배열 생성
  const calendarDays: (Date | null)[] = [];
  
  // 첫 주의 빈 칸 추가 (시작 요일 전까지)
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 실제 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentMonth(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentMonth(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  // 오늘로 이동
  const goToToday = () => {
    const newDate = new Date();
    setCurrentMonth(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="card p-6">
      {/* 달력 헤더 (월 선택) */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="이전 달"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {year}년 {month + 1}월
          </h3>
          <button
            onClick={goToToday}
            className="text-sm px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
          >
            오늘
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="다음 달"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayLabels.map((label, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400 py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center
              ${date === null
                ? 'opacity-0 cursor-default'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer'
              }
            `}
          >
            {date ? renderDayCell(date, isLoading) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

