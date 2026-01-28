'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { formatDateToYYYYMMDD, compareDateStrings } from '@/app/lib/dateUtils';
import { useHabitsContext } from '@/app/components/habits/HabitsProvider';
import PageHeader from '@/app/components/habits/PageHeader';
import PastHabitCard from '@/app/components/habits/PastHabitCard';
import type { Habit } from '@/app/components/habits/types';

function ArchiveContent() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { habits: habitsCache, loading: habitsLoading, fetchAllHabits } = useHabitsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // HabitsProvider 캐시에서 습관 데이터 가져오기
  useEffect(() => {
    if (mounted && user) {
      fetchAllHabits();
    }
  }, [mounted, user, fetchAllHabits]);

  // 과거 습관 필터링 및 정렬
  const pastHabits = useMemo(() => {
    if (habitsCache.size === 0) return [];

    const todayStr = formatDateToYYYYMMDD(new Date());
    const allHabits = Array.from(habitsCache.values());

    // end_date < 오늘 조건으로 필터링
    const filtered = allHabits.filter((habit) => 
      compareDateStrings(habit.end_date, todayStr) < 0
    );

    // 종료일 기준 내림차순 정렬 (최신순)
    return filtered.sort((a, b) => 
      compareDateStrings(b.end_date, a.end_date)
    );
  }, [habitsCache]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  const isLoading = habitsLoading;
  const hasPastHabits = pastHabits.length > 0;

  return (
    <div className="min-h-screen">
      <PageHeader
        subtitle="과거 습관"
        rightAction={
          <Link href="/habits" className="text-sm link">
            ← 습관 목록
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="card p-8 text-center">
            <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
          </div>
        ) : !hasPastHabits ? (
          <div className="card p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              과거 습관이 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastHabits.map((habit) => (
              <PastHabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <ProtectedRoute>
      <ArchiveContent />
    </ProtectedRoute>
  );
}
