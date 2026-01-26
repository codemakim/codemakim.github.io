'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { supabase } from '@/app/lib/supabase';

function CreateHabitContent() {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [color, setColor] = useState('#3B82F6'); // 기본 색상 (파란색)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // 달력 순서: 일월화수목금토 (JavaScript Date.getDay()와 동일: 일요일=0, 월요일=1, ..., 토요일=6)
  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const weekdayValues = [0, 1, 2, 3, 4, 5, 6]; // 일요일=0, 월요일=1, ..., 토요일=6

  // 색상 팔레트 (무채색 계열로 통일)
  const colorPalette = [
    '#3B82F6', // 파란색
    '#10B981', // 초록색
    '#F59E0B', // 주황색
    '#EF4444', // 빨간색
    '#8B5CF6', // 보라색
    '#EC4899', // 분홍색
    '#06B6D4', // 청록색
    '#6366F1', // 인디고
    '#F97316', // 오렌지
    '#84CC16', // 라임
    '#14B8A6', // 티일
    '#A855F7', // 바이올렛
  ];

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미 처리 중이면 중복 요청 방지
    if (loading) {
      return;
    }

    setError(null);

    // 검증
    if (!title.trim()) {
      setError('제목을 입력해주세요');
      return;
    }

    if (!startDate || !endDate) {
      setError('시작일과 종료일을 선택해주세요');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('시작일은 종료일보다 이전이어야 합니다');
      return;
    }

    if (weekdays.length === 0) {
      setError('최소 1개 요일을 선택해주세요');
      return;
    }

    if (!user) {
      setError('로그인이 필요합니다');
      return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          color,
          start_date: startDate,
          end_date: endDate,
          weekdays,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // 성공 시 습관 목록 페이지로 리다이렉트
      router.push('/habits');
    } catch (err: any) {
      setError(err.message || '습관 생성에 실패했습니다');
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

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
              <p className="text-zinc-600 dark:text-zinc-400">습관 만들기</p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-sm link"
            >
              취소
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">새 습관 만들기</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={mounted ? new Date().toISOString().split('T')[0] : undefined}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate || (mounted ? new Date().toISOString().split('T')[0] : undefined)}
                  max={mounted ? new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                수행 요일 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-7 gap-2">
                {weekdayValues.map((day, index) => {
                  const isSelected = weekdays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      className={`
                        aspect-square rounded-lg border-2 transition-all
                        ${isSelected
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }
                      `}
                      aria-label={`${weekdayLabels[index]}요일 ${isSelected ? '선택됨' : '선택 안됨'}`}
                    >
                      <span className="text-sm font-medium">{weekdayLabels[index]}</span>
                    </button>
                  );
                })}
              </div>
              {weekdays.length === 0 && (
                <p className="mt-2 text-xs text-red-500">최소 1개 요일을 선택해주세요</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                색상
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colorPalette.map((paletteColor) => {
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                disabled={loading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateHabitPage() {
  return (
    <ProtectedRoute>
      <CreateHabitContent />
    </ProtectedRoute>
  );
}

