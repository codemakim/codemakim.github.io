'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import type { Habit } from './types';

interface HabitStatsProps {
  habit: Habit;
}

interface Stats {
  totalDays: number; // 총 수행해야 하는 일수
  completedDays: number; // 완료한 일수
  completionRate: number; // 완료율 (0-100)
  currentStreak: number; // 현재 연속 달성 일수
  maxStreak: number; // 최대 연속 달성 일수
}

export default function HabitStats({ habit }: HabitStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const calculateStats = async () => {
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

        // 총 일수 계산 (기간 내 수행해야 하는 날짜 수)
        const startDate = new Date(habit.start_date);
        const endDate = new Date(habit.end_date);
        let totalDays = 0;
        const dateSet = new Set<string>();

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const weekday = d.getDay();
          if (habit.weekdays.includes(weekday)) {
            const dateStr = d.toISOString().split('T')[0];
            dateSet.add(dateStr);
            totalDays++;
          }
        }

        // 완료한 일수 계산
        const completedRecords = (recordsData || []).filter((r) => r.completed);
        const completedDays = completedRecords.length;

        // 완료율 계산
        const completionRate =
          totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

        // 연속 달성 일수 계산
        const today = new Date().toISOString().split('T')[0];
        const recordsMap = new Map<string, boolean>();
        (recordsData || []).forEach((record) => {
          recordsMap.set(record.date, record.completed);
        });

        // 현재 연속 달성 일수 (오늘부터 역순으로)
        let currentStreak = 0;
        const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
        
        for (const dateStr of sortedDates) {
          if (dateStr > today) continue; // 미래 날짜는 제외
          const completed = recordsMap.get(dateStr);
          if (completed) {
            currentStreak++;
          } else {
            break;
          }
        }

        // 최대 연속 달성 일수
        let maxStreak = 0;
        let tempStreak = 0;
        for (const dateStr of sortedDates) {
          const completed = recordsMap.get(dateStr);
          if (completed) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }

        setStats({
          totalDays,
          completedDays,
          completionRate,
          currentStreak,
          maxStreak,
        });
      } catch (err: any) {
        console.error('통계 계산 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
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
            {stats.currentStreak}
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

