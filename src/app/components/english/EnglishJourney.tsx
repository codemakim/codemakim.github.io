'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '@/app/components/habits/PageHeader';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { ENGLISH_CHAPTERS, ENGLISH_LESSONS, Exercise, EnglishLesson, XP_PER_ANSWER, buildReviewQuestions, getCompletedLessonIds, getMistakeQuestions, mix, normalizeEnglishAnswer, sameAnswer } from '@/app/lib/english/curriculum';
import { VOCABULARY_LESSONS, VOCABULARY_UNITS } from '@/app/lib/english/vocabulary';
import { LEARNING_UNITS, LEARNING_SETTINGS, PATH_SECTIONS, buildGuidedRetry, buildLearningPath, getNextGuidedLesson } from '@/app/lib/english/learningPath';
import SpeechButton from './SpeechButton';
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
  subject: EnglishLesson['kind'];
  lesson: EnglishLesson | null;
  questions: Exercise[];
};

const GUIDED_LESSONS = buildLearningPath(LEARNING_UNITS, VOCABULARY_UNITS.flatMap((unit) => unit.words));

export default function EnglishJourney() {
  const { user } = useAuth();
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [run, setRun] = useState<Run | null>(null);
  const [prepared, setPrepared] = useState(false);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [chosenTiles, setChosenTiles] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [transcriptIds, setTranscriptIds] = useState<Set<string>>(new Set());
  const [hintIds, setHintIds] = useState<Set<string>>(new Set());
  const [speakingPhase, setSpeakingPhase] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [preparationAnswer, setPreparationAnswer] = useState('');

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

  useEffect(() => {
    document.querySelector('.app-wrapper')?.scrollTo({ top: 0 });
  }, [run?.sessionId, prepared, step, finished, speakingPhase]);

  const completedIds = useMemo(
    () => getCompletedLessonIds(records),
    [records]
  );
  const completedVocabularyIds = useMemo(() => getCompletedLessonIds(records, VOCABULARY_LESSONS), [records]);
  const completedGuidedIds = useMemo(() => getCompletedLessonIds(records, GUIDED_LESSONS), [records]);
  const nextGuidedLesson = getNextGuidedLesson(GUIDED_LESSONS, completedGuidedIds);
  const today = formatDateToYYYYMMDD(new Date());
  const studiedToday = records.some((record) => record.lesson_id?.startsWith('path-') &&
    record.activity_type === 'lesson' && formatDateToYYYYMMDD(new Date(record.created_at)) === today);
  const hasPreviousRecords = records.some((record) => record.lesson_id && !record.lesson_id.startsWith('path-'));
  const totalXp = records.reduce((total, record) => total + record.xp_earned, 0);
  const studyDays = new Set(records.map((record) => new Date(record.created_at).toLocaleDateString('ko-KR'))).size;
  const recentRecords = records.slice(0, 8);
  const lesson = run?.lesson ?? null;
  const vocabularyRun = run?.subject === 'vocabulary';
  const guidedRun = run?.subject === 'guided';
  const guidedLesson = GUIDED_LESSONS.find((item) => item.id === lesson?.id);
  const exercise = run?.questions[step];

  const startRun = (nextRun: Run) => {
    setRun({ ...nextRun, questions: nextRun.questions.map((item) => ({
      ...item,
      ...(item.options ? { options: mix(item.options) } : {}),
      ...(item.tiles ? { tiles: mix(item.tiles) } : {}),
    })) });
    setPrepared(nextRun.kind === 'review');
    setStep(0);
    setAnswer('');
    setChosenTiles([]);
    setChecked(null);
    setCorrectCount(0);
    setWrongIds([]);
    setFinished(false);
    setSaveError('');
    setListenedIds(new Set());
    setTranscriptIds(new Set());
    setHintIds(new Set());
    setSpeakingPhase(false);
    setSpoken(false);
    setPreparationAnswer('');
  };

  const startLesson = (nextLesson: EnglishLesson) => {
    startRun({ sessionId: crypto.randomUUID(), kind: 'lesson', subject: nextLesson.kind, lesson: nextLesson, questions: nextLesson.exercises });
    if (nextLesson.kind === 'guided' && !completedGuidedIds.has(nextLesson.id)) {
      const paused = records.find((record) => record.activity_type === 'review' && record.lesson_id === nextLesson.id &&
        record.xp_earned === 0 && record.question_count < nextLesson.exercises.length);
      if (paused) {
        setStep(paused.question_count);
        setCorrectCount(paused.correct_count);
        setWrongIds(paused.wrong_question_ids);
      }
    }
  };

  const startReview = (lessons: EnglishLesson[], completed: Set<string>) => {
    const learned = lessons.filter((item) => completed.has(item.id));
    const pool = learned.flatMap((item) => item.exercises);
    const wrong = learned.flatMap((item) => records.find((record) =>
      record.activity_type === 'lesson' && record.lesson_id === item.id
    )?.wrong_question_ids ?? []);
    if (pool.length) startRun({ sessionId: crypto.randomUUID(), kind: 'review', subject: learned[0].kind, lesson: null, questions: buildReviewQuestions(pool, wrong) });
  };

  const retryMistakes = () => {
    if (!run) return;
    const questions = guidedRun ? buildGuidedRetry(run.questions, wrongIds, GUIDED_LESSONS) : getMistakeQuestions(run.questions, wrongIds);
    if (questions.length) startRun({ sessionId: crypto.randomUUID(), kind: 'review', subject: run.subject, lesson: null, questions });
  };

  const response = exercise?.type === 'order'
    ? chosenTiles.map((index) => exercise.tiles?.[index] ?? '').join(' ')
    : answer;

  const submitAnswer = () => {
    if (!exercise || checked !== null || !response.trim()) return;
    if (exercise.type === 'listen' && !listenedIds.has(exercise.id) && !transcriptIds.has(exercise.id)) return;
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
      lesson_id: run.lesson?.id ?? (vocabularyRun ? 'vocabulary-review' : guidedRun ? 'path-review' : null),
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
    if (guidedLesson?.speaking.length) setSpeakingPhase(true);
    else {
      setFinished(true);
      void saveSession();
    }
  };

  const finishSpeaking = (didSpeak: boolean) => {
    setSpoken(didSpeak);
    setSpeakingPhase(false);
    setFinished(true);
    void saveSession();
  };

  const pauseLesson = async () => {
    if (!user || !run || !guidedLesson) return;
    const answered = step + (checked === null ? 0 : 1);
    if (!answered) { setRun(null); return; }
    if (answered >= run.questions.length) { goNext(); return; }
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('english_sessions').insert({
      id: crypto.randomUUID(), user_id: user.id, activity_type: 'review', lesson_id: guidedLesson.id,
      correct_count: correctCount, question_count: answered, xp_earned: 0, wrong_question_ids: wrongIds,
    });
    if (error) setSaveError('이어하기 저장이 안 됐어요. 다시 눌러 주세요.');
    else { await loadRecords(); setRun(null); }
    setSaving(false);
  };

  const addTile = (index: number) => {
    if (!chosenTiles.includes(index)) setChosenTiles((items) => [...items, index]);
  };

  const clearTiles = () => setChosenTiles([]);

  if (run && finished) {
    return (
      <div className="min-h-screen">
        <PageHeader subtitle={guidedRun ? '오늘 학습 · 결과' : vocabularyRun ? '단어 퀘스트 · 결과' : '영어 퀘스트 · 결과'} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <section className="card p-6 sm:p-8 text-center">
            <p className="text-5xl mb-3" aria-hidden="true">{correctCount === run.questions.length ? '🏆' : '🎉'}</p>
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              {correctCount === run.questions.length ? '완벽한 클리어!' : '퀘스트 완료!'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {correctCount} / {run.questions.length} 정답 · +{correctCount * XP_PER_ANSWER} XP
            </p>
            {guidedRun && (
              <div className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <p>이번 접속에서 음성으로만 연습 {[...listenedIds].filter((id) => !transcriptIds.has(id)).length}개 · 글로 대신 연습 {transcriptIds.size}개 · 힌트 확인 {hintIds.size}개</p>
                {guidedLesson?.speaking.length ? <p>{spoken ? '따라 말하기는 스스로 확인했어요.' : '이번에는 글 연습으로 마쳤어요.'}</p> : null}
                <p className="mt-2">오늘 꺼내 본 표현을 다음 학습에서 다시 만나 봐요.</p>
              </div>
            )}
            {saving && <p className="mt-4 text-sm" role="status">기록 저장 중...</p>}
            {saveError && (
              <div className="mt-5" role="alert">
                <p className="mb-3 text-sm" style={{ color: 'var(--accent)' }}>{saveError}</p>
                <button className="btn-primary" onClick={() => void saveSession()} disabled={saving}>다시 저장</button>
              </div>
            )}
            {!saving && !saveError && <p className="mt-4 text-sm font-bold">오늘의 모험 기록 완료 ✅</p>}
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              {!!wrongIds.length && <button className="btn-primary" onClick={retryMistakes} disabled={saving || !!saveError}>{vocabularyRun ? '틀린 단어 다시 연습' : '틀린 표현 다시 연습'}</button>}
              <button className="btn-primary" onClick={() => setRun(null)} disabled={saving}>여정으로 돌아가기</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (run && guidedLesson && speakingPhase) {
    return (
      <div className="min-h-screen">
        <PageHeader subtitle="오늘 학습 · 말해 보기" />
        <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <section className="card p-5 sm:p-7">
            <h2 className="text-2xl font-black mb-3">이번에는 소리 내어 말해 봐요</h2>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>배운 문장을 듣고 따라 말해 보세요. 마이크 녹음이나 발음 자동 채점은 없어요.</p>
            <div className="grid gap-4">
              {guidedLesson.speaking.map((item) => (
                <div key={item.text} className="card-content p-4">
                  <p className="text-lg font-bold mb-1" lang="en">{item.text}</p>
                  <p className="text-sm mb-3">{item.meaning}</p>
                  <SpeechButton text={item.text} />
                </div>
              ))}
            </div>
            <button className="btn-primary w-full mt-6" onClick={() => finishSpeaking(true)}>소리 내어 말해봤어요 · 학습 마치기</button>
            <button className="underline text-sm mt-4" onClick={() => finishSpeaking(false)}>지금은 글 연습으로 마칠게요</button>
          </section>
        </main>
      </div>
    );
  }

  if (run && lesson && !prepared) {
    return (
      <div className="min-h-screen">
        <PageHeader subtitle={guidedLesson ? `${guidedLesson.week}주차 · ${guidedLesson.day}회차 · 오늘 학습` : vocabularyRun ? '단어 퀘스트 · 먼저 익히기' : `챕터 ${lesson.chapter} · 먼저 익히기`} />
        <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <button className="underline text-sm mb-4" onClick={() => setRun(null)}>← 여정으로 돌아가기</button>
          <section className="card p-5 sm:p-7">
            <h2 className="text-2xl font-black mb-3">{lesson.title}</h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{lesson.scene}</p>
            <p className="card-content p-4 leading-relaxed mb-5">{lesson.grammar}</p>
            {guidedLesson && (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>지난 내용 복습 · 오늘의 단어와 문장 · 듣기 · 직접 쓰기 · 말해 보기. 약 {LEARNING_SETTINGS.targetMinutes}분을 목표로 천천히 연습해요.</p>
                {!!guidedLesson.words.length && (
                  <div className="card-content p-4 mb-5">
                    <h3 className="font-black mb-2">오늘 만날 단어</h3>
                    <ul className="grid gap-2">
                      {guidedLesson.words.map((word) => <li key={word.word}><strong lang="en">{word.word}</strong> — {word.meaning}</li>)}
                    </ul>
                  </div>
                )}
                {guidedLesson.preparationWord && (
                  <details className="card-content p-4 mb-5">
                    <summary className="cursor-pointer font-bold">영어 입력이 처음이라면 준비 연습</summary>
                    <p className="text-sm mt-3 mb-2">영문 키보드로 <strong lang="en">{guidedLesson.preparationWord}</strong>를 그대로 입력해 보세요.</p>
                    <SpeechButton text={guidedLesson.preparationWord} />
                    <input className="input mt-3" aria-label="영어 입력 준비 연습" autoCapitalize="none" autoComplete="off" spellCheck={false} value={preparationAnswer} onChange={(event) => setPreparationAnswer(event.target.value)} />
                    {preparationAnswer && <p className="text-sm mt-2" role="status">{normalizeEnglishAnswer(preparationAnswer) === guidedLesson.preparationWord.toLowerCase() ? '입력했어요! 아래 표현도 천천히 읽어 보세요.' : '화면의 영어를 한 글자씩 비교해 보세요.'}</p>}
                  </details>
                )}
              </>
            )}
            {guidedLesson?.mode === 'check' ? (
              <p className="card-content p-4">오늘은 배운 표현을 힌트 없이 꺼내 보는 확인 학습이에요. 모르면 해설을 읽고 다시 연습하면 돼요.</p>
            ) : (
              <>
            <h3 className="font-black mb-3">이번에 배울 {vocabularyRun ? '단어' : '표현'} {lesson.examples.length}개</h3>
            <ul className="grid gap-2">
              {lesson.examples.map((example) => (
                <li key={example.sentence} className="card-content p-3">
                  <strong className="block text-lg" lang="en">{example.sentence}</strong>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{example.meaning}</span>
                  {example.note && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{example.note}</p>}
                  {guidedRun && <div className="mt-3"><SpeechButton text={example.sentence} /></div>}
                </li>
              ))}
            </ul>
              </>
            )}
            {!guidedRun && <p className="text-sm mt-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {vocabularyRun ? '뜻 고르기' : '선택'} {lesson.examples.length}문항 → {vocabularyRun ? '영단어 고르기' : '조립'} {lesson.examples.length}문항 → 입력 {lesson.examples.length}문항.
              같은 {vocabularyRun ? '단어를' : '표현을'} 세 번 연습해요. 막히면 학습 카드를 다시 볼 수 있어요.
            </p>}
            <button className="btn-primary w-full mt-5" onClick={() => setPrepared(true)}>{guidedLesson?.mode === 'check' ? '혼자서 확인해 보기' : '표현을 익혔어요 · 연습 시작'}</button>
          </section>
        </main>
      </div>
    );
  }

  if (run && exercise) {
    const lessonIndex = lesson ? ENGLISH_LESSONS.findIndex((item) => item.id === lesson.id) + 1 : null;
    return (
      <div className="min-h-screen">
        <PageHeader subtitle={guidedRun ? (guidedLesson ? `${guidedLesson.week}주차 · ${guidedLesson.day}회차 · ${guidedLesson.title}` : '배운 내용 복습') : vocabularyRun ? (lesson ? `단어 퀘스트 · ${lesson.title}` : '배운 단어 복습 퀘스트') : lesson ? `챕터 ${lesson.chapter} · ${lessonIndex}번째 퀘스트` : '배운 표현 복습 퀘스트'} />
        <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-3 mb-3 text-sm font-bold">
            <button className="underline" onClick={() => guidedLesson ? void pauseLesson() : setRun(null)} disabled={saving}>{guidedLesson ? (saving ? '이어하기 저장 중...' : '여기까지 저장하고 나가기') : '← 나가기'}</button>
            <span>{step + 1} / {run.questions.length}</span>
          </div>
          {saveError && <p className="text-sm mb-4" role="alert">{saveError}</p>}
          <div className="h-3 border-2 border-black mb-5" role="progressbar" aria-valuemin={0} aria-valuemax={run.questions.length} aria-valuenow={step + 1} aria-label="퀘스트 진행">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${((step + 1) / run.questions.length) * 100}%` }} />
          </div>
          {lesson && <p className="mb-4 text-sm font-bold" style={{ color: 'var(--accent)' }}>{lesson.scene}</p>}
          {lesson && exercise.type !== 'listen' && guidedLesson?.mode !== 'check' && (
            <details key={`${run.sessionId}-${step}`} className="card-content p-4 mb-4" onToggle={(event) => {
              if (event.currentTarget.open) setHintIds((ids) => new Set([...ids, exercise.id]));
            }}>
              <summary className="cursor-pointer font-bold">막히면 학습 카드 다시 보기</summary>
              <p className="mt-3 text-sm leading-relaxed">{lesson.grammar}</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {lesson.examples.map((example) => <li key={example.sentence}><span lang="en">{example.sentence}</span> — {example.meaning}</li>)}
              </ul>
            </details>
          )}
          {exercise.passage && (
            <blockquote className="card-content p-4 mb-4 text-lg leading-relaxed" lang="en">{exercise.passage}</blockquote>
          )}
          <section className="card p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
              {exercise.stage === 'review' ? '지난 내용 복습 · ' : ''}{exercise.type === 'listen' ? (transcriptIds.has(exercise.id) ? '글로 이해하기' : '듣고 이해하기') : exercise.type === 'word-choice' ? '영단어 고르기' : exercise.type === 'choice' ? (vocabularyRun || exercise.stage === 'word' ? '뜻 고르기' : '골라 보기') : exercise.type === 'order' ? '문장 만들기' : '직접 써 보기'}
            </p>
            <h2 className="text-xl sm:text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>{exercise.prompt}</h2>

            {exercise.type === 'listen' && exercise.audioText && (
              <div className="mb-5">
                <SpeechButton key={exercise.id} text={exercise.audioText} onPlayed={() => setListenedIds((ids) => new Set([...ids, exercise.id]))} />
                <button className="underline text-sm mt-3" onClick={() => setTranscriptIds((ids) => new Set([...ids, exercise.id]))} disabled={checked !== null}>소리가 안 들리면 글로 대신 연습</button>
                {transcriptIds.has(exercise.id) && <p className="card-content p-3 mt-3 text-lg" lang="en">{exercise.audioText}</p>}
              </div>
            )}

            {(exercise.type === 'choice' || exercise.type === 'word-choice' || exercise.type === 'listen') && (
              <div className="grid gap-3">
                {exercise.options?.map((option) => (
                  <button
                    key={option}
                    className="card flex items-center justify-between gap-3 p-4 text-left font-bold"
                    style={{
                      color: answer === option ? 'var(--accent-text)' : 'var(--text-primary)',
                      background: answer === option ? 'var(--accent)' : undefined,
                      boxShadow: answer === option ? 'var(--nb-shadow)' : undefined,
                    }}
                    onClick={() => checked === null && setAnswer(option)}
                    aria-pressed={answer === option}
                    disabled={saving || checked !== null || (exercise.type === 'listen' && !listenedIds.has(exercise.id) && !transcriptIds.has(exercise.id))}
                  >
                    <span>{option}</span>
                    {answer === option && <span aria-hidden="true">✓ 선택됨</span>}
                  </button>
                ))}
              </div>
            )}

            {exercise.type === 'order' && (
              <>
                <div className="min-h-14 border-2 border-dashed border-black p-2 mb-4 flex flex-wrap gap-2" aria-label="만든 문장">
                  {chosenTiles.map((tileIndex) => (
                    <button key={tileIndex} className="tag tag-active" disabled={saving || checked !== null} onClick={() => setChosenTiles((items) => items.filter((item) => item !== tileIndex))}>
                      {exercise.tiles?.[tileIndex]}
                    </button>
                  ))}
                  {!chosenTiles.length && <span className="self-center text-sm" style={{ color: 'var(--text-secondary)' }}>아래 단어를 눌러 문장을 만드세요</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {exercise.tiles?.map((tile, index) => (
                    <button key={`${tile}-${index}`} className="tag" disabled={saving || checked !== null || chosenTiles.includes(index)} onClick={() => addTile(index)}>{tile}</button>
                  ))}
                </div>
                <button className="mt-4 text-sm underline" onClick={clearTiles} disabled={saving || checked !== null}>다시 놓기</button>
              </>
            )}

            {exercise.type === 'write' && (
              <input
                className="input text-lg"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => !saving && event.key === 'Enter' && (checked === null ? submitAnswer() : goNext())}
                placeholder={vocabularyRun ? '영단어 입력하기' : '영어로 입력하기'}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={saving || checked !== null}
                aria-label={vocabularyRun ? '영단어 답 입력' : '영어 답 입력'}
              />
            )}

            {checked !== null && (
              <div className="mt-5 border-t-2 border-black pt-4" role="status">
                <p className="font-black text-lg mb-1" style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {checked ? `정답이에요! +${XP_PER_ANSWER} XP` : `아깝다! 정답은 ${exercise.answer}`}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{exercise.explanation}</p>
                {lesson && <p className="mt-2 text-sm font-bold">오늘의 힌트: {lesson.grammar}</p>}
              </div>
            )}

            <button
              className="btn-primary w-full mt-6"
              onClick={checked === null ? submitAnswer : goNext}
              disabled={saving || (checked === null && (!response.trim() || (exercise.type === 'listen' && !listenedIds.has(exercise.id) && !transcriptIds.has(exercise.id))))}
            >{checked === null ? '답 확인하기' : step + 1 === run.questions.length ? '퀘스트 완료' : '다음 문제'}</button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader subtitle="고르고, 만들고, 직접 쓰며 익히는 영어 모험" />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <section className="card p-5 sm:p-7 mb-8" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-sm font-black mb-1" style={{ color: 'var(--accent)' }}>하루 {LEARNING_SETTINGS.targetMinutes}분 · 일상과 여행 영어</p>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{nextGuidedLesson ? `${nextGuidedLesson.week}주차 · ${nextGuidedLesson.title}` : '현재 단원의 학습을 마쳤어요'}</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {studiedToday ? '오늘 새 학습은 마쳤어요. 배운 내용을 복습하거나 내일 이어가도 좋아요.' : nextGuidedLesson?.objective ?? '배운 표현을 다시 꺼내 보세요. 다음 단원은 준비 중이에요.'}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="card p-3 min-w-20 text-center"><strong className="block text-xl">{totalXp}</strong><span className="text-xs">총 XP</span></div>
              <div className="card p-3 min-w-20 text-center"><strong className="block text-xl">{studyDays}</strong><span className="text-xs">학습일</span></div>
            </div>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button className="btn-primary" onClick={() => studiedToday || !nextGuidedLesson ? startReview(GUIDED_LESSONS, completedGuidedIds) : startLesson(nextGuidedLesson)} disabled={loading || !!loadError}>
              {studiedToday || !nextGuidedLesson ? '오늘은 배운 내용 복습' : '오늘 학습 시작'}
            </button>
            {studiedToday && nextGuidedLesson ? (
              <button className="btn-primary" onClick={() => startLesson(nextGuidedLesson)} disabled={loading || !!loadError}>다음 회차 미리 학습</button>
            ) : <button className="btn-primary" onClick={() => startReview(GUIDED_LESSONS, completedGuidedIds)} disabled={loading || !!loadError || !completedGuidedIds.size}>배운 내용 복습</button>}
          </div>
        </section>

        {hasPreviousRecords && (
          <p className="card-content p-4 mb-5 text-sm leading-relaxed">
            이전 학습 기록과 XP는 그대로 남아 있어요. 오늘 학습은 새 단원 진도로 기록하며, 이전 단어장과 문장 문제는 아래 추가 연습에서 다시 풀 수 있어요.
          </p>
        )}
        {loadError && <p className="mb-5 text-sm font-bold" role="alert" style={{ color: 'var(--accent)' }}>{loadError}</p>}
        {loading ? <p className="py-5 text-center" role="status">여정 기록 불러오는 중...</p> : (
          <>
            {LEARNING_UNITS.map((unit) => (
              <section key={unit.id} className="mb-8">
                <h2 className="section-title">{unit.week}주차 · {unit.title}</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{unit.goal}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {GUIDED_LESSONS.filter((item) => item.unitId === unit.id).map((item) => {
                    const index = GUIDED_LESSONS.indexOf(item);
                    const complete = completedGuidedIds.has(item.id);
                    const locked = GUIDED_LESSONS.slice(0, index).some((previous) => !completedGuidedIds.has(previous.id));
                    return (
                      <button key={item.id} className="card p-4 text-left disabled:opacity-55" onClick={() => startLesson(item)} disabled={locked || !!loadError}>
                        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{item.day}회차 · {item.mode === 'check' ? '혼자 확인' : item.mode === 'review' ? '누적 복습' : '새 표현과 복습'}</p>
                        <div className="flex items-start justify-between gap-3 mt-1">
                          <h3 className="text-lg font-black">{item.title}</h3>
                          <span aria-label={complete ? '학습 완료' : locked ? '앞선 학습부터' : '학습 가능'}>{complete ? '✅' : locked ? '🔒' : '➡️'}</span>
                        </div>
                        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{item.objective}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            <details className="card p-5 mb-8">
              <summary className="font-black text-lg cursor-pointer">앞으로의 6개월 학습 경로</summary>
              <p className="text-sm mt-3 mb-4" style={{ color: 'var(--text-secondary)' }}>4주씩 6단계 계획이에요. 학습 속도에 따라 조정하며 현재는 {LEARNING_UNITS.length}개 단원을 제공해요.</p>
              <ol className="grid gap-3">
                {PATH_SECTIONS.map((section) => (
                  <li key={section.month} className="card-content p-4">
                    <h3 className="font-black">{section.month}개월 · {section.title}</h3>
                    <p className="text-sm mt-1">{section.goal}</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{section.weeks.map((title, index) => `${(section.month - 1) * 4 + index + 1}주 ${title}${LEARNING_UNITS.some((unit) => unit.week === (section.month - 1) * 4 + index + 1) ? ' (학습 가능)' : ' (준비 중)'}`).join(' · ')}</p>
                  </li>
                ))}
              </ol>
              <p className="text-sm mt-4">이후에는 일상 기초를 보강하며 짧은 업무 메시지·메일로 확장해요.</p>
            </details>

            <details className="mb-8">
              <summary className="section-title cursor-pointer">단어장·문장 추가 연습</summary>
              <div className="mt-4">
            <section className="mb-8">
              <h2 className="section-title">단어 연습 · {completedVocabularyIds.size}/{VOCABULARY_LESSONS.length} 완료</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {VOCABULARY_UNITS.reduce((total, unit) => total + unit.words.length, 0)}개 단어 · {VOCABULARY_LESSONS.reduce((total, item) => total + item.exercises.length, 0)}문항.
                원하는 묶음을 골라 뜻과 예문을 먼저 익혀요. 문장 학습과 함께 반복해 보세요.
              </p>
              <button className="btn-primary mb-4" onClick={() => startReview(VOCABULARY_LESSONS, completedVocabularyIds)} disabled={!!loadError || !completedVocabularyIds.size}>
                🎲 배운 단어 12문항 복습
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                {VOCABULARY_LESSONS.map((item) => (
                  <button key={item.id} className="card p-4 text-left" onClick={() => startLesson(item)} disabled={!!loadError}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{item.examples.length}개 단어 · {item.exercises.length}문항</p>
                        <h3 className="text-lg font-black mt-1">{item.title}</h3>
                        <p className="text-sm mt-2" lang="en" style={{ color: 'var(--text-secondary)' }}>{item.examples.map((example) => example.sentence).join(' · ')}</p>
                      </div>
                      <span aria-label={completedVocabularyIds.has(item.id) ? '완료' : '도전 가능'}>{completedVocabularyIds.has(item.id) ? '✅' : '➡️'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="section-title">모험 지도 · {completedIds.size}/{ENGLISH_LESSONS.length} 완료</h2>
              <button className="btn-primary mb-4" onClick={() => startReview(ENGLISH_LESSONS, completedIds)} disabled={!!loadError || !completedIds.size}>배운 표현 12문항 복습</button>
              {ENGLISH_CHAPTERS.map((chapter) => (
                <div key={chapter.id} className="mb-6">
                  <h3 className="font-black mb-3">챕터 {chapter.id} · {chapter.title}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ENGLISH_LESSONS.filter((item) => item.chapter === chapter.id).map((item) => {
                      const index = ENGLISH_LESSONS.indexOf(item);
                      const locked = ENGLISH_LESSONS.slice(0, index).some((previous) => !completedIds.has(previous.id));
                      const complete = completedIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          className="card p-4 text-left disabled:opacity-55"
                          style={{ color: 'var(--text-primary)' }}
                          onClick={() => startLesson(item)}
                          disabled={locked || !!loadError}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>STAGE {String(index + 1).padStart(2, '0')} · {item.exercises.length}문항</p><h3 className="text-lg font-black mt-1">{item.title}</h3><p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{item.scene}</p></div>
                            <span aria-label={complete ? '완료' : locked ? '잠김' : '도전 가능'}>{complete ? '✅' : locked ? '🔒' : '➡️'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
              </div>
            </details>

            <section>
              <h2 className="section-title">최근 모험 기록</h2>
              {recentRecords.length ? (
                <ul className="grid gap-2">
                  {recentRecords.map((record) => {
                    const wordRecord = record.lesson_id?.startsWith('vocabulary-');
                    const pathLesson = GUIDED_LESSONS.find((item) => item.id === record.lesson_id);
                    const title = record.activity_type === 'review'
                      ? (pathLesson ? `이어하기 저장 · ${pathLesson.title}` : record.lesson_id === 'path-review' ? '오늘 학습 복습' : wordRecord ? '단어 복습' : '표현 복습')
                      : pathLesson ? `오늘 학습 · ${pathLesson.title}`
                      : wordRecord ? `단어 · ${VOCABULARY_LESSONS.find((item) => item.id === record.lesson_id)?.title ?? '단어 퀘스트'}`
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
