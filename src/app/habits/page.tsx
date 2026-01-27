'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

type Habit = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  start_date: string;
  end_date: string;
  weekdays: number[];
  created_at: string;
};

type HabitWithCompletion = Habit & {
  completed: boolean;
};

function HabitsContent() {
  const [mounted, setMounted] = useState(false);
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingHabits, setProcessingHabits] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchHabits();
    }
  }, [mounted, user]);

  const fetchHabits = async () => {
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
  };

  const handleToggleComplete = async (habitId: string, completed: boolean, date: string) => {
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
  };

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
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="block hover:opacity-80 transition-opacity mb-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  그냥 블로그
                </h1>
              </Link>
              <p className="text-zinc-600 dark:text-zinc-400">습관 관리</p>
            </div>
            <Link
              href="/habits/create"
              className="btn-primary"
            >
              습관 추가
            </Link>
          </div>
        </div>
      </header>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => {
              return (
                <div
                  key={habit.id}
                  className="card p-4 min-h-[120px] relative group"
                  style={{ borderLeft: `4px solid ${habit.color}` }}
                >
                  {/* 체크 버튼 (우측 상단, 더 크고 명확하게) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleComplete(habit.id, !habit.completed, today);
                    }}
                    disabled={processingHabits.has(habit.id)}
                    className={`
                      absolute top-3 right-3 w-12 h-12 rounded-full border-2 transition-all duration-200
                      flex items-center justify-center z-10
                      ${processingHabits.has(habit.id)
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                      }
                      ${habit.completed
                        ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white shadow-lg scale-100'
                        : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white hover:shadow-md hover:scale-105 active:scale-95'
                      }
                    `}
                    aria-label={habit.completed ? '완료 취소' : '완료 처리'}
                    title={habit.completed ? '완료 취소' : '완료 처리'}
                  >
                    {habit.completed ? (
                      <svg
                        className="w-7 h-7 text-white dark:text-zinc-900 animate-checkmark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          strokeDasharray: '20',
                          strokeDashoffset: '0',
                          animation: 'drawCheckmark 0.3s ease-out forwards',
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
                    )}
                  </button>

                  {/* 나머지 영역 클릭 → 상세 페이지 */}
                  <div
                    onClick={() => router.push(`/habits/detail?id=${habit.id}`)}
                    className={`
                      block pr-14 cursor-pointer
                      ${habit.completed ? 'opacity-60' : ''}
                      hover:opacity-100 transition-opacity
                    `}
                  >
                    <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white line-clamp-2">
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                        {habit.description}
                      </p>
                    )}
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-auto">
                      {mounted
                        ? `${new Date(habit.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(habit.end_date).toLocaleDateString('ko-KR')}`
                        : `${habit.start_date} ~ ${habit.end_date}`
                      }
                    </div>
                  </div>
                </div>
              );
            })}
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

