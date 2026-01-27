'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
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
  const fetchRecords = async (year: number, month: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

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
  };

  // 초기 로드 및 사용자 변경 시
  useEffect(() => {
    if (!user) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    fetchRecords(year, month);
  }, [user, habit.id]);

  // 월 변경 시 데이터 다시 가져오기
  const handleMonthChange = (year: number, month: number) => {
    setCurrentMonth(new Date(year, month, 1));
    fetchRecords(year, month);
  };


  // 날짜별 상태 계산 함수
  const getDayStatus = (date: Date): HabitDayStatus => {
    const dateStr = date.toISOString().split('T')[0];
    const weekday = date.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    const targetDate = new Date(dateStr);
    const startDate = new Date(habit.start_date);
    const endDate = new Date(habit.end_date);

    // 해당 날짜에 수행해야 하는지 확인
    const shouldDo =
      habit.weekdays.includes(weekday) &&
      startDate <= targetDate &&
      endDate >= targetDate;

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

