'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';
import { formatDateToYYYYMMDD } from '@/app/lib/dateUtils';
import HabitsHeader from '@/app/components/habits/HabitsHeader';
import HabitCard from '@/app/components/habits/HabitCard';
import OverallCalendar from '@/app/components/habits/OverallCalendar';
import { useHabits } from '@/app/components/habits/useHabits';
import type { ViewMode } from '@/app/components/habits/types';

function HabitsContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const {
    mounted,
    habits,
    loading,
    error,
    processingHabits,
    fetchHabits,
    handleToggleComplete,
    totalHabitsCount,
  } = useHabits();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  // mounted 후에만 today 계산 (Hydration 에러 방지, 로컬 시간대 기준)
  const today = mounted ? formatDateToYYYYMMDD(new Date()) : '';

  return (
    <div className="min-h-screen">
      <HabitsHeader
        viewMode={viewMode}
        onToggleView={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="card p-8 text-center">
            <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
          </div>
        ) : error ? (
          <div className="card p-8">
            <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
            <button
              onClick={fetchHabits}
              className="btn-primary"
            >
              다시 시도
            </button>
          </div>
        ) : habits.length === 0 ? (
          <div className="card p-8 text-center">
            {totalHabitsCount === 0 ? (
              <>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  등록된 습관이 없습니다.
                </p>
                <Link
                  href="/habits/create"
                  className="btn-primary inline-block"
                >
                  첫 습관 만들기
                </Link>
              </>
            ) : (
              <>
                <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                  오늘 수행할 습관이 없습니다.
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
                  등록된 습관은 있지만 오늘은 수행할 요일이 아닙니다.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className="btn-primary"
                  >
                    달력으로 보기
                  </button>
                  <Link
                    href="/habits/archive"
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    과거 습관 보기
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : viewMode === 'calendar' ? (
          <OverallCalendar />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                today={today}
                isProcessing={processingHabits.has(habit.id)}
                onToggleComplete={handleToggleComplete}
                mounted={mounted}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HabitsPage() {
  return (
    <ProtectedRoute>
      <HabitsContent />
    </ProtectedRoute>
  );
}

