'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import type { Habit } from './types';

interface HabitsContextType {
  habits: Map<string, Habit>; // habitId -> Habit
  loading: boolean;
  error: string | null;
  fetchAllHabits: () => Promise<void>; // 모든 습관 가져오기
  getHabit: (habitId: string) => Habit | undefined; // 캐시에서 습관 가져오기
  fetchHabit: (habitId: string) => Promise<Habit | null>; // 개별 습관 가져오기 (캐시 확인 후 없으면 요청)
  updateHabit: (habitId: string, updates: Partial<Habit>) => void; // 로컬 캐시 업데이트
  removeHabit: (habitId: string) => void; // 습관 삭제
  addHabit: (habit: Habit) => void; // 습관 추가
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Map<string, Habit>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 모든 습관 가져오기
  const fetchAllHabits = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsError) {
        throw habitsError;
      }

      // Map으로 변환
      const habitsMap = new Map<string, Habit>();
      (habitsData || []).forEach((habit) => {
        habitsMap.set(habit.id, habit);
      });

      setHabits(habitsMap);
    } catch (err: any) {
      setError(err.message || '습관 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 캐시에서 습관 가져오기
  const getHabit = useCallback((habitId: string): Habit | undefined => {
    return habits.get(habitId);
  }, [habits]);

  // 개별 습관 가져오기 (캐시 확인 후 없으면 요청)
  const fetchHabit = useCallback(async (habitId: string): Promise<Habit | null> => {
    // 캐시에 있으면 반환
    const cached = habits.get(habitId);
    if (cached) {
      return cached;
    }

    // 캐시에 없으면 요청
    if (!user) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        return null;
      }

      // 캐시에 저장
      setHabits((prev) => {
        const newMap = new Map(prev);
        newMap.set(habitId, data);
        return newMap;
      });

      return data;
    } catch (err: any) {
      setError(err.message || '습관을 불러오는데 실패했습니다');
      return null;
    }
  }, [user, habits]);

  // 로컬 캐시 업데이트
  const updateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(habitId);
      if (existing) {
        newMap.set(habitId, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  // 습관 삭제
  const removeHabit = useCallback((habitId: string) => {
    setHabits((prev) => {
      const newMap = new Map(prev);
      newMap.delete(habitId);
      return newMap;
    });
  }, []);

  // 습관 추가
  const addHabit = useCallback((habit: Habit) => {
    setHabits((prev) => {
      const newMap = new Map(prev);
      newMap.set(habit.id, habit);
      return newMap;
    });
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        error,
        fetchAllHabits,
        getHabit,
        fetchHabit,
        updateHabit,
        removeHabit,
        addHabit,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabitsContext() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabitsContext must be used within a HabitsProvider');
  }
  return context;
}

