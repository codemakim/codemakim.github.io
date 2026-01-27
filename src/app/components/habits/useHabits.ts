import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import type { HabitWithCompletion } from './types';

export function useHabits() {
  const [mounted, setMounted] = useState(false);
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingHabits, setProcessingHabits] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchHabits = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 오늘 날짜
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const todayWeekday = today.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일

      // 습관 목록 가져오기
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsError) {
        throw habitsError;
      }

      // 오늘 수행해야 할 습관 필터링
      const todayHabits = (habitsData || []).filter((habit) => {
        const startDate = new Date(habit.start_date);
        const endDate = new Date(habit.end_date);
        const todayDate = new Date(todayStr);

        return (
          habit.weekdays.includes(todayWeekday) &&
          startDate <= todayDate &&
          endDate >= todayDate
        );
      });

      // 오늘 완료 기록 가져오기
      const habitIds = todayHabits.map((h) => h.id);
      const { data: recordsData, error: recordsError } = await supabase
        .from('habit_records')
        .select('habit_id, completed')
        .in('habit_id', habitIds)
        .eq('date', todayStr);

      if (recordsError) {
        throw recordsError;
      }

      // 완료 여부 매핑
      const completedMap = new Map<string, boolean>();
      (recordsData || []).forEach((record) => {
        if (record.completed) {
          completedMap.set(record.habit_id, true);
        }
      });

      // 습관에 완료 여부 추가
      const habitsWithCompletion: HabitWithCompletion[] = todayHabits.map((habit) => ({
        ...habit,
        completed: completedMap.get(habit.id) || false,
      }));

      setHabits(habitsWithCompletion);
    } catch (err: any) {
      setError(err.message || '습관 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (mounted && user) {
      fetchHabits();
    }
  }, [mounted, user, fetchHabits]);

  const handleToggleComplete = useCallback(async (habitId: string, completed: boolean, date: string) => {
    if (!user) return;

    // 이미 처리 중인 습관이면 중복 요청 방지
    if (processingHabits.has(habitId)) {
      return;
    }

    // 처리 시작: 해당 habitId를 processingHabits에 추가
    setProcessingHabits((prev) => new Set(prev).add(habitId));

    try {
      // 기존 기록 확인 (maybeSingle 사용: 레코드가 없어도 에러 발생 안 함)
      const { data: existingRecord, error: selectError } = await supabase
        .from('habit_records')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', date)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116은 "no rows returned" 에러인데, 이건 정상 (기록이 없는 경우)
        throw selectError;
      }

      if (existingRecord) {
        // 기존 기록 업데이트
        const { error: updateError } = await supabase
          .from('habit_records')
          .update({ completed })
          .eq('id', existingRecord.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // 새 기록 생성
        const { error: insertError } = await supabase
          .from('habit_records')
          .insert({
            habit_id: habitId,
            date,
            completed,
          });

        if (insertError) {
          throw insertError;
        }
      }

      // 로컬 상태 업데이트
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === habitId ? { ...habit, completed } : habit
        )
      );
    } catch (err: any) {
      console.error('완료 처리 에러:', err);
      setError(err.message || '완료 처리에 실패했습니다');
    } finally {
      // 처리 완료: 해당 habitId를 processingHabits에서 제거
      setProcessingHabits((prev) => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  }, [user, processingHabits]);

  return {
    mounted,
    habits,
    loading,
    error,
    processingHabits,
    fetchHabits,
    handleToggleComplete,
  };
}

