'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';
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
  } = useHabits();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  // mounted 후에만 today 계산 (Hydration 에러 방지)
  const today = mounted ? new Date().toISOString().split('T')[0] : '';

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
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              등록된 습관이 없습니다.
            </p>
            <Link
              href="/habits/create"
              className="btn-primary inline-block"
            >
              첫 습관 만들기
            </Link>
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

