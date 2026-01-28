'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';
import { formatDateKorean } from '@/app/lib/dateUtils';
import { useHabitsContext } from '@/app/components/habits/HabitsProvider';
import type { Habit } from '@/app/components/habits/types';
import PageHeader from '@/app/components/habits/PageHeader';
import { COLOR_PALETTE, WEEKDAY_LABELS } from '@/app/lib/constants/habits';

function EditHabitContent() {
  const [mounted, setMounted] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const habitId = searchParams.get('id');
  const { getHabit, fetchHabit, updateHabit } = useHabitsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 습관 데이터 로드 (HabitsProvider 캐시 우선 사용)
  useEffect(() => {
    if (mounted && user && habitId) {
      loadHabit();
    } else if (mounted && !habitId) {
      setError('습관 ID가 없습니다');
      setLoading(false);
    }
  }, [mounted, user, habitId]);

  const loadHabit = async () => {
    if (!habitId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. 캐시에서 먼저 확인
      let habitData = getHabit(habitId);

      // 2. 캐시에 없으면 fetchHabit으로 가져오기 (캐시에 저장됨)
      if (!habitData) {
        const fetched = await fetchHabit(habitId);
        habitData = fetched || undefined; // null을 undefined로 변환
      }

      if (!habitData) {
        throw new Error('습관을 찾을 수 없습니다');
      }

      setHabit(habitData);
      setTitle(habitData.title);
      setDescription(habitData.description || '');
      setColor(habitData.color);
    } catch (err: any) {
      setError(err.message || '습관을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving || !habit || !habitId) return;

    setError(null);

    // 검증
    if (!title.trim()) {
      setError('제목을 입력해주세요');
      return;
    }

    if (!user) {
      setError('로그인이 필요합니다');
      return;
    }

    setSaving(true);

    try {
      // DB 업데이트
      const { data, error: updateError } = await supabase
        .from('habits')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          color,
        })
        .eq('id', habitId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error('습관 수정에 실패했습니다');
      }

      // HabitsProvider 캐시 업데이트
      updateHabit(habitId, {
        title: data.title,
        description: data.description,
        color: data.color,
      });

      // 상세 페이지로 리다이렉트
      router.push(`/habits/detail?id=${habitId}`);
    } catch (err: any) {
      setError(err.message || '습관 수정에 실패했습니다');
      setSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader subtitle="습관 수정" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !habit) {
    return (
      <div className="min-h-screen">
        <PageHeader subtitle="습관 수정" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="card p-8">
            <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
            <div className="flex gap-3">
              <button
                onClick={loadHabit}
                className="btn-primary"
              >
                다시 시도
              </button>
              <Link href="/habits" className="btn-primary">
                목록으로
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        subtitle="습관 수정"
        rightAction={
          <button onClick={() => router.back()} className="text-sm link">
            취소
          </button>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">습관 수정</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {habit && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                  required
                  placeholder="예: 물 2L 마시기"
                  className="input"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {title.length}/50자
                </p>
              </div>

              {/* 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  설명 <span className="text-xs text-zinc-500 dark:text-zinc-400">(선택사항)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="습관에 대한 추가 설명을 입력하세요 (예: 구체적인 목표나 방법)"
                  className="input resize-none"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {description.length}/200자
                </p>
              </div>

              {/* 색상 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  색상
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((paletteColor) => {
                    const isSelected = color === paletteColor;
                    return (
                      <button
                        key={paletteColor}
                        type="button"
                        onClick={() => setColor(paletteColor)}
                        className={`
                          aspect-square rounded-lg border-2 transition-all
                          ${isSelected
                            ? 'border-zinc-900 dark:border-white scale-110'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }
                        `}
                        style={{ backgroundColor: paletteColor }}
                        aria-label={`색상 ${paletteColor} ${isSelected ? '선택됨' : '선택 안됨'}`}
                      >
                        {isSelected && (
                          <svg
                            className="w-5 h-5 mx-auto text-white drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 읽기 전용 정보 */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  다음 항목은 데이터 무결성을 위해 수정할 수 없습니다:
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">기간:</span>
                    <span className="text-zinc-900 dark:text-white">
                      {formatDateKorean(habit.start_date)} ~ {formatDateKorean(habit.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">수행 요일:</span>
                    <div className="flex gap-1">
                      {WEEKDAY_LABELS.map((label, index) => (
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

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function EditHabitPage() {
  return (
    <ProtectedRoute>
      <EditHabitContent />
    </ProtectedRoute>
  );
}

