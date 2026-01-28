'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import { calculateHabitStats } from '@/app/lib/utils/habitStats';
import type { Habit, HabitStats } from './types';

interface HabitStatsProps {
  habit: Habit;
}

export default function HabitStats({ habit }: HabitStatsProps) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchAndCalculateStats = async () => {
      setLoading(true);
      try {
        // 습관 기간 내 모든 기록 가져오기
        const { data: recordsData, error: recordsError } = await supabase
          .from('habit_records')
          .select('date, completed')
          .eq('habit_id', habit.id)
          .gte('date', habit.start_date)
          .lte('date', habit.end_date)
          .order('date', { ascending: false });

        if (recordsError) {
          throw recordsError;
        }

        // 통계 계산 (현재 연속 달성 일수 포함)
        const calculatedStats = calculateHabitStats(
          habit,
          recordsData || [],
          true // includeCurrentStreak = true
        );

        setStats(calculatedStats);
      } catch (err: any) {
        console.error('통계 계산 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateStats();
  }, [user, habit]);

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">통계</h3>
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">통계</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 완료율 */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1" style={{ color: habit.color }}>
            {stats.completionRate}%
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">완료율</div>
        </div>

        {/* 완료 일수 */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1 text-zinc-900 dark:text-white">
            {stats.completedDays}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            완료 / {stats.totalDays}일
          </div>
        </div>

        {/* 현재 연속 달성 */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1 text-zinc-900 dark:text-white">
            {stats.currentStreak ?? 0}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">현재 연속 달성</div>
        </div>

        {/* 최대 연속 달성 */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1 text-zinc-900 dark:text-white">
            {stats.maxStreak}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">최대 연속 달성</div>
        </div>
      </div>
    </div>
  );
}

