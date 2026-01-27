'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import { formatDateToYYYYMMDD, compareDateStrings } from '@/app/lib/dateUtils';
import type { Habit } from './types';
import HabitCalendarDay from './HabitCalendarDay';
import BaseCalendar from './BaseCalendar';

interface HabitCalendarProps {
  habit: Habit;
}

export interface HabitDayStatus {
  shouldDo: boolean; // 해당 날짜에 수행해야 하는지
  completed: boolean; // 완료했는지
}

export default function HabitCalendar({ habit }: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<Map<string, boolean>>(new Map()); // date -> completed
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 해당 습관의 기록 가져오기
  const fetchRecords = useCallback(async (year: number, month: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const firstDay = formatDateToYYYYMMDD(new Date(year, month, 1));
      const lastDay = formatDateToYYYYMMDD(new Date(year, month + 1, 0));

      const { data: recordsData, error: recordsError } = await supabase
        .from('habit_records')
        .select('date, completed')
        .eq('habit_id', habit.id)
        .gte('date', firstDay)
        .lte('date', lastDay);

      if (recordsError) {
        throw recordsError;
      }

      // 날짜별 완료 여부 맵 생성
      const recordsMap = new Map<string, boolean>();
      (recordsData || []).forEach((record) => {
        recordsMap.set(record.date, record.completed);
      });

      setRecords(recordsMap);
    } catch (err: any) {
      console.error('달력 데이터 로딩 에러:', err);
    } finally {
      setLoading(false);
    }
  }, [user, habit.id]);

  // 초기 로드 및 사용자/습관/월 변경 시
  useEffect(() => {
    if (!user) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    fetchRecords(year, month);
  }, [user, habit.id, currentMonth, fetchRecords]);

  // 월 변경 시 데이터 다시 가져오기
  const handleMonthChange = (year: number, month: number) => {
    setCurrentMonth(new Date(year, month, 1));
    // useEffect가 currentMonth 변경을 감지하여 자동으로 fetchRecords 호출
  };


  // 날짜별 상태 계산 함수
  const getDayStatus = (date: Date): HabitDayStatus => {
    const dateStr = formatDateToYYYYMMDD(date); // 로컬 시간대 기준 YYYY-MM-DD
    const weekday = date.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일

    // 날짜 문자열 직접 비교 (타임존 문제 방지)
    const shouldDo =
      habit.weekdays.includes(weekday) &&
      compareDateStrings(habit.start_date, dateStr) <= 0 &&
      compareDateStrings(habit.end_date, dateStr) >= 0;

    // 완료 여부 확인
    const completed = records.get(dateStr) || false;

    return {
      shouldDo,
      completed,
    };
  };

  return (
    <BaseCalendar
      renderDayCell={(date, isLoading) => (
        <HabitCalendarDay
          date={date}
          status={getDayStatus(date)}
          habitColor={habit.color}
          isLoading={isLoading}
        />
      )}
      isLoading={loading}
      onMonthChange={handleMonthChange}
    />
  );
}

