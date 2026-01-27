'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { useHabitsContext } from '@/app/components/habits/HabitsProvider';
import { supabase } from '@/app/lib/supabase';
import { formatDateToYYYYMMDD, compareDateStrings } from '@/app/lib/dateUtils';
import type { Habit } from './types';
import OverallCalendarDay from './OverallCalendarDay';
import BaseCalendar from './BaseCalendar';

export interface DayStats {
  totalHabits: number; // 해당 날짜에 수행해야 할 습관 수
  completedHabits: number; // 완료된 습관 수
  successRate: number; // 성공률 (0-100)
}

interface OverallCalendarProps {
  // Props는 나중에 필요하면 추가
}

export default function OverallCalendar({}: OverallCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<Map<string, Set<string>>>(new Map()); // date -> Set<habit_id> (completed만)
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { habits: habitsCache, loading: habitsLoading } = useHabitsContext();

  // HabitsProvider 캐시에서 습관 배열로 변환
  const allHabits = useMemo(() => {
    return Array.from(habitsCache.values());
  }, [habitsCache]);

  // 현재 월의 기록만 가져오기
  const fetchRecords = useCallback(async (year: number, month: number) => {
    if (!user || habitsCache.size === 0) return;

    setLoading(true);
    try {
      const firstDay = formatDateToYYYYMMDD(new Date(year, month, 1));
      const lastDay = formatDateToYYYYMMDD(new Date(year, month + 1, 0));

      // habitsCache에서 habit ID 배열 생성
      const habitIds = Array.from(habitsCache.keys());

      const { data: recordsData, error: recordsError } = await supabase
        .from('habit_records')
        .select('habit_id, date, completed')
        .in('habit_id', habitIds)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .eq('completed', true); // 완료된 것만

      if (recordsError) {
        throw recordsError;
      }

      // 날짜별 완료된 습관 ID 맵 생성
      const recordsMap = new Map<string, Set<string>>();
      (recordsData || []).forEach((record) => {
        if (!recordsMap.has(record.date)) {
          recordsMap.set(record.date, new Set());
        }
        recordsMap.get(record.date)!.add(record.habit_id);
      });

      setRecords(recordsMap);
    } catch (err: any) {
      console.error('달력 데이터 로딩 에러:', err);
    } finally {
      setLoading(false);
    }
  }, [user, habitsCache]);

  // 습관 데이터가 로드되고 월이 변경될 때 기록 가져오기
  useEffect(() => {
    if (!user || habitsLoading || habitsCache.size === 0) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    fetchRecords(year, month);
  }, [user, habitsLoading, habitsCache.size, currentMonth, fetchRecords]);

  // 월 변경 시 데이터 다시 가져오기
  const handleMonthChange = (year: number, month: number) => {
    setCurrentMonth(new Date(year, month, 1));
  };


  // 날짜별 성공률 계산 함수
  const calculateDayStats = (date: Date): DayStats => {
    const dateStr = formatDateToYYYYMMDD(date); // 로컬 시간대 기준 YYYY-MM-DD
    const weekday = date.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일

    // 해당 날짜에 수행해야 할 습관 필터링 (날짜 문자열 직접 비교)
    const habitsForDate = allHabits.filter((habit) => {
      return (
        habit.weekdays.includes(weekday) &&
        compareDateStrings(habit.start_date, dateStr) <= 0 &&
        compareDateStrings(habit.end_date, dateStr) >= 0
      );
    });

    const totalHabits = habitsForDate.length;
    
    // 완료된 습관 수 계산
    const completedHabitIds = records.get(dateStr) || new Set();
    const completedHabits = habitsForDate.filter((habit) =>
      completedHabitIds.has(habit.id)
    ).length;

    // 성공률 계산 (0으로 나누기 방지)
    const successRate =
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return {
      totalHabits,
      completedHabits,
      successRate,
    };
  };

  return (
    <BaseCalendar
      renderDayCell={(date, isLoading) => (
        <OverallCalendarDay
          date={date}
          stats={calculateDayStats(date)}
          isLoading={isLoading}
        />
      )}
      isLoading={loading}
      onMonthChange={handleMonthChange}
    />
  );
}
