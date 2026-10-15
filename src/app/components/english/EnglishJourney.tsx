'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '@/app/components/habits/PageHeader';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { ENGLISH_LESSONS, Exercise, EnglishLesson, normalizeEnglishAnswer } from '@/app/lib/english/curriculum';
import { supabase } from '@/app/lib/supabase';
import { formatDateKorean, formatDateToYYYYMMDD } from '@/app/lib/dateUtils';

type SessionRecord = {
  id: string;
  activity_type: 'lesson' | 'review';
  lesson_id: string | null;
  correct_count: number;
  question_count: number;
  xp_earned: number;
  wrong_question_ids: string[];
  created_at: string;
};

type Run = {
  sessionId: string;
  kind: 'lesson' | 'review';
  lesson: EnglishLesson | null;
  questions: Exercise[];
};

const XP_PER_ANSWER = 10;

function mix<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function sameAnswer(value: string, exercise: Exercise): boolean {
  const answer = normalizeEnglishAnswer(value);
  return [exercise.answer, ...(exercise.acceptableAnswers ?? [])]
    .some((item) => normalizeEnglishAnswer(item) === answer);
}

export default function EnglishJourney() {
  const { user } = useAuth();
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [run, setRun] = useState<Run | null>(null);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [chosenTiles, setChosenTiles] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('english_sessions')
      .select('id, activity_type, lesson_id, correct_count, question_count, xp_earned, wrong_question_ids, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError('학습 기록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.');
    } else {
      setRecords((data ?? []) as SessionRecord[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const completedIds = useMemo(
    () => new Set(records.filter((record) => record.activity_type === 'lesson' && record.lesson_id).map((record) => record.lesson_id as string)),
    [records]
  );
  const totalXp = records.reduce((total, record) => total + record.xp_earned, 0);
  const studyDays = new Set(records.map((record) => new Date(record.created_at).toLocaleDateString('ko-KR'))).size;
  const recentRecords = records.slice(0, 8);
  const lesson = run?.lesson ?? null;
  const exercise = run?.questions[step];

  const startRun = (nextRun: Run) => {
    setRun(nextRun);
    setStep(0);
    setAnswer('');
    setChosenTiles([]);
    setChecked(null);
    setCorrectCount(0);
    setWrongIds([]);
    setFinished(false);
    setSaveError('');
  };

  const startLesson = (nextLesson: EnglishLesson) => {
    startRun({ sessionId: crypto.randomUUID(), kind: 'lesson', lesson: nextLesson, questions: nextLesson.exercises });
  };

  const startReview = () => {
    const learned = ENGLISH_LESSONS.filter((item) => completedIds.has(item.id));
    const pool = learned.flatMap((item) => item.exercises);
    if (pool.length) startRun({ sessionId: crypto.randomUUID(), kind: 'review', lesson: null, questions: mix(pool).slice(0, 5) });
  };

  const response = exercise?.type === 'order'
    ? chosenTiles.map((index) => exercise.tiles?.[index] ?? '').join(' ')
    : answer;

  const submitAnswer = () => {
    if (!exercise || checked !== null || !response.trim()) return;
    const isCorrect = sameAnswer(response, exercise);
    setChecked(isCorrect);
    if (isCorrect) setCorrectCount((count) => count + 1);
    else setWrongIds((ids) => [...ids, exercise.id]);
  };

  const saveSession = async () => {
    if (!user || !run) return;
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('english_sessions').upsert({
      id: run.sessionId,
      user_id: user.id,
      activity_type: run.kind,
      lesson_id: run.lesson?.id ?? null,
      correct_count: correctCount,
      question_count: run.questions.length,
      xp_earned: correctCount * XP_PER_ANSWER,
      wrong_question_ids: wrongIds,
    }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) setSaveError('결과 저장이 안 됐어요. 다시 저장을 눌러 주세요.');
    else await loadRecords();
    setSaving(false);
  };

  const goNext = () => {
    if (!run) return;
    if (step + 1 < run.questions.length) {
      setStep((current) => current + 1);
      setAnswer('');
      setChosenTiles([]);
      setChecked(null);
      return;
    }
    setFinished(true);
    void saveSession();
  };

  const addTile = (index: number) => {
    if (!chosenTiles.includes(index)) setChosenTiles((items) => [...items, index]);
  };

  const clearTiles = () => setChosenTiles([]);

  if (run && finished) {
    return (
      <div className="min-h-screen">
        <PageHeader subtitle="영어 퀘스트 · 결과" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <section className="card p-6 sm:p-8 text-center">
            <p className="text-5xl mb-3" aria-hidden="true">{correctCount === run.questions.length ? '🏆' : '🎉'}</p>
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              {correctCount === run.questions.length ? '완벽한 클리어!' : '퀘스트 완료!'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {correctCount} / {run.questions.length} 정답 · +{correctCount * XP_PER_ANSWER} XP
            </p>
            {saving && <p className="mt-4 text-sm" role="status">기록 저장 중...</p>}
            {saveError && (
              <div className="mt-5" role="alert">
                <p className="mb-3 text-sm" style={{ color: 'var(--accent)' }}>{saveError}</p>
                <button className="btn-primary" onClick={() => void saveSession()} disabled={saving}>다시 저장</button>
              </div>
            )}
            {!saving && !saveError && <p className="mt-4 text-sm font-bold">오늘의 모험 기록 완료 ✅</p>}
            <button className="btn-primary mt-6" onClick={() => setRun(null)}>여정으로 돌아가기</button>
          </section>
        </main>
      </div>
    );
  }

  if (run && exercise) {
    const lessonIndex = lesson ? ENGLISH_LESSONS.findIndex((item) => item.id === lesson.id) + 1 : null;
    return (
      <div className="min-h-screen">
        <PageHeader subtitle={lesson ? `챕터 1 · ${lessonIndex}번째 퀘스트` : '랜덤 복습 퀘스트'} />
        <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-3 mb-3 text-sm font-bold">
            <button className="underline" onClick={() => setRun(null)}>← 나가기</button>
            <span>{step + 1} / {run.questions.length}</span>
          </div>
          <div className="h-3 border-2 border-black mb-5" role="progressbar" aria-valuemin={0} aria-valuemax={run.questions.length} aria-valuenow={step + 1} aria-label="퀘스트 진행">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${((step + 1) / run.questions.length) * 100}%` }} />
          </div>
          {lesson && <p className="mb-4 text-sm font-bold" style={{ color: 'var(--accent)' }}>{lesson.scene}</p>}
          {exercise.passage && (
            <blockquote className="card-content p-4 mb-4 text-lg leading-relaxed" lang="en">{exercise.passage}</blockquote>
          )}
          <section className="card p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
              {exercise.type === 'choice' ? '골라 보기' : exercise.type === 'order' ? '문장 만들기' : '직접 써 보기'}
            </p>
            <h2 className="text-xl sm:text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>{exercise.prompt}</h2>

            {exercise.type === 'choice' && (
              <div className="grid gap-3">
                {exercise.options?.map((option) => (
                  <button
                    key={option}
                    className={`card p-4 text-left font-bold ${answer === option ? 'bg-[var(--bg-secondary)]' : ''}`}
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => checked === null && setAnswer(option)}
                    aria-pressed={answer === option}
                    disabled={checked !== null}
                  >{option}</button>
                ))}
              </div>
            )}

            {exercise.type === 'order' && (
              <>
                <div className="min-h-14 border-2 border-dashed border-black p-2 mb-4 flex flex-wrap gap-2" aria-label="만든 문장">
                  {chosenTiles.map((tileIndex) => (
                    <button key={tileIndex} className="tag tag-active" disabled={checked !== null} onClick={() => setChosenTiles((items) => items.filter((item) => item !== tileIndex))}>
                      {exercise.tiles?.[tileIndex]}
                    </button>
                  ))}
                  {!chosenTiles.length && <span className="self-center text-sm" style={{ color: 'var(--text-secondary)' }}>아래 단어를 눌러 문장을 만드세요</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {exercise.tiles?.map((tile, index) => (
                    <button key={`${tile}-${index}`} className="tag" disabled={checked !== null || chosenTiles.includes(index)} onClick={() => addTile(index)}>{tile}</button>
                  ))}
                </div>
                <button className="mt-4 text-sm underline" onClick={clearTiles} disabled={checked !== null}>다시 놓기</button>
              </>
            )}

            {exercise.type === 'write' && (
              <input
                className="input text-lg"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && (checked === null ? submitAnswer() : goNext())}
                placeholder="영어로 입력하기"
                autoComplete="off"
                disabled={checked !== null}
                aria-label="영어 답 입력"
              />
            )}

            {checked !== null && (
              <div className="mt-5 border-t-2 border-black pt-4" role="status">
                <p className="font-black text-lg mb-1" style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {checked ? '정답이에요! +10 XP' : `아깝다! 정답은 ${exercise.answer}`}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{exercise.explanation}</p>
                {lesson && <p className="mt-2 text-sm font-bold">오늘의 힌트: {lesson.grammar}</p>}
              </div>
            )}

            <button
              className="btn-primary w-full mt-6"
              onClick={checked === null ? submitAnswer : goNext}
              disabled={checked === null && !response.trim()}
            >{checked === null ? '답 확인하기' : step + 1 === run.questions.length ? '퀘스트 완료' : '다음 문제'}</button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader subtitle="하루 5분, 게임처럼 영어 모험" />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <section className="card p-5 sm:p-7 mb-8" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-sm font-black mb-1" style={{ color: 'var(--accent)' }}>CHAPTER 1 · 영어 모험의 시작</p>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>작은 문장으로 세계 열기</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>틀려도 괜찮아요. 한 문제마다 친절한 설명이 나와요.</p>
            </div>
            <div className="flex gap-3">
              <div className="card p-3 min-w-20 text-center"><strong className="block text-xl">{totalXp}</strong><span className="text-xs">총 XP</span></div>
              <div className="card p-3 min-w-20 text-center"><strong className="block text-xl">{studyDays}</strong><span className="text-xs">학습일</span></div>
            </div>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button className="btn-primary" onClick={() => startLesson(ENGLISH_LESSONS.find((item) => !completedIds.has(item.id)) ?? ENGLISH_LESSONS[0])}>
              {completedIds.size === ENGLISH_LESSONS.length ? '첫 퀘스트 다시 하기' : '오늘의 퀘스트 시작'}
            </button>
            <button className="btn-primary" onClick={startReview} disabled={!completedIds.size}>
              🎲 배운 문제 랜덤 복습
            </button>
          </div>
        </section>

        {loadError && <p className="mb-5 text-sm font-bold" role="alert" style={{ color: 'var(--accent)' }}>{loadError}</p>}
        {loading ? <p className="py-5 text-center" role="status">여정 기록 불러오는 중...</p> : (
          <>
            <section className="mb-8">
              <h2 className="section-title">모험 지도 · {completedIds.size}/{ENGLISH_LESSONS.length} 완료</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {ENGLISH_LESSONS.map((item, index) => {
                  const locked = index > 0 && !completedIds.has(ENGLISH_LESSONS[index - 1].id);
                  const complete = completedIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      className="card p-4 text-left disabled:opacity-55"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={() => startLesson(item)}
                      disabled={locked}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>STAGE {String(index + 1).padStart(2, '0')}</p><h3 className="text-lg font-black mt-1">{item.title}</h3><p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{item.scene}</p></div>
                        <span aria-label={complete ? '완료' : locked ? '잠김' : '도전 가능'}>{complete ? '✅' : locked ? '🔒' : '➡️'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="section-title">최근 모험 기록</h2>
              {recentRecords.length ? (
                <ul className="grid gap-2">
                  {recentRecords.map((record) => {
                    const title = record.activity_type === 'review'
                      ? '랜덤 복습'
                      : ENGLISH_LESSONS.find((item) => item.id === record.lesson_id)?.title ?? '영어 퀘스트';
                    return <li key={record.id} className="card-content p-3 flex items-center justify-between gap-3 text-sm">
                      <div><strong>{title}</strong><p style={{ color: 'var(--text-secondary)' }}>{formatDateKorean(formatDateToYYYYMMDD(new Date(record.created_at)))} · {record.correct_count}/{record.question_count} 정답</p></div>
                      <strong className="whitespace-nowrap">+{record.xp_earned} XP</strong>
                    </li>;
                  })}
                </ul>
              ) : <p className="card-content p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>아직 기록이 없어요. 첫 퀘스트를 깨고 모험을 시작해 보세요!</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
