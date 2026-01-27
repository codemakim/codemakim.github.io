'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import HabitCalendar from '@/app/components/habits/HabitCalendar';
import HabitStats from '@/app/components/habits/HabitStats';
import { useHabitsContext } from '@/app/components/habits/HabitsProvider';

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

function HabitDetailContent() {
  const [mounted, setMounted] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const habitId = searchParams.get('id');
  const { removeHabit } = useHabitsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && habitId) {
      fetchHabit();
    } else if (mounted && !habitId) {
      setError('습관 ID가 없습니다');
      setLoading(false);
    }
  }, [mounted, user, habitId]);

  const fetchHabit = async () => {
    if (!user || !habitId) return;

    setLoading(true);
    setError(null);

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
        throw new Error('습관을 찾을 수 없습니다');
      }

      setHabit(data);
    } catch (err: any) {
      setError(err.message || '습관을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !habitId || !habit) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // HabitsProvider 캐시에서 제거
      if (habitId) {
        removeHabit(habitId);
      }

      // 삭제 성공 시 목록 페이지로 이동
      router.push('/habits');
    } catch (err: any) {
      setError(err.message || '습관 삭제에 실패했습니다');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/habits" className="block hover:opacity-80 transition-opacity mb-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  그냥 블로그
                </h1>
              </Link>
              <p className="text-zinc-600 dark:text-zinc-400">습관 상세</p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-sm link"
            >
              뒤로
            </button>
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
              onClick={fetchHabit}
              className="btn-primary mr-2"
            >
              다시 시도
            </button>
            <Link href="/habits" className="btn-primary">
              목록으로
            </Link>
          </div>
        ) : habit ? (
          <div className="space-y-6">
            <div
              className="card p-6"
              style={{ borderLeft: `4px solid ${habit.color}` }}
            >
              <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
                {habit.title}
              </h2>
              {habit.description && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {habit.description}
                </p>
              )}
              <div className="flex gap-2 mb-4">
                <Link
                  href={`/habits/edit?id=${habit.id}`}
                  className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  disabled={deleting}
                >
                  삭제
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400">기간:</span>
                  <span className="text-zinc-900 dark:text-white">
                    {new Date(habit.start_date).toLocaleDateString('ko-KR')} ~{' '}
                    {new Date(habit.end_date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400">수행 요일:</span>
                  <div className="flex gap-1">
                    {weekdayLabels.map((label, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${
                          habit.weekdays.includes(index)
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 통계 */}
            <HabitStats habit={habit} />

            {/* 달력 뷰 */}
            <HabitCalendar habit={habit} />

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="card p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">
                    습관 삭제
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    정말로 이 습관을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      disabled={deleting}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                      disabled={deleting}
                    >
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function HabitDetailPage() {
  return (
    <ProtectedRoute>
      <HabitDetailContent />
    </ProtectedRoute>
  );
}

