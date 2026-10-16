import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LEARNING_UNITS, PATH_SECTIONS, buildLearningPath, buildGuidedRetry, getNextGuidedLesson } from '../src/app/lib/english/learningPath.ts';
import { VOCABULARY_UNITS } from '../src/app/lib/english/vocabulary.ts';
import { buildReviewQuestions, getCompletedLessonIds, sameAnswer } from '../src/app/lib/english/curriculum.ts';

const words = VOCABULARY_UNITS.flatMap((unit) => unit.words);
const lessons = buildLearningPath(LEARNING_UNITS, words);

test('the first unit has four guided lessons, cumulative review and a check within the planned scope', () => {
  assert.deepEqual(lessons.map((lesson) => lesson.mode), ['learn', 'learn', 'learn', 'learn', 'review', 'check']);
  assert.deepEqual(lessons.map((lesson) => lesson.day), [1, 2, 3, 4, 5, 6]);
  assert.ok(lessons.every((lesson) => lesson.kind === 'guided' && lesson.exercises.length <= 24));
  assert.equal(PATH_SECTIONS.flatMap((section) => section.weeks).length, 24);
  assert.ok(lessons.every((lesson) => !lesson.exercises.some((question) => question.answer.startsWith('Are you'))));
  const ids = lessons.flatMap((lesson) => lesson.exercises.map((question) => question.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('new input follows both supported practice steps; checks use previously introduced concepts', () => {
  for (const lesson of lessons.filter((item) => item.mode === 'learn')) {
    for (const question of lesson.exercises.filter((item) => item.type === 'write')) {
      const earlier = lesson.exercises.slice(0, lesson.exercises.indexOf(question)).filter((item) => item.practiceKey === question.practiceKey);
      assert.ok(earlier.some((item) => item.type === 'choice'));
      assert.ok(earlier.some((item) => item.type === 'order' || item.type === 'word-choice'));
    }
  }
  assert.equal(lessons[2].words[0].word, 'you');
  assert.ok(lessons[3].words.some((word) => word.word === 'okay'));
  assert.ok(lessons.at(-1).exercises.some((question) => question.answer === 'You are Mina.'));
});

test('every option set has exactly one answer and listening has a separate transcript', () => {
  for (const lesson of lessons) {
    for (const question of lesson.exercises) {
      assert.ok(sameAnswer(question.answer, question));
      if (question.options) {
        assert.ok(question.options.length >= 2 && question.options.length <= 3);
        assert.equal(question.options.filter((option) => sameAnswer(option, question)).length, 1);
      }
      if (question.type === 'listen') {
        assert.ok(question.audioText);
        assert.ok(!question.prompt.includes(question.audioText));
        assert.match(question.answer, /[가-힣]/);
      }
      if (question.tiles) assert.deepEqual([...question.tiles].sort(), question.answer.split(' ').sort());
    }
  }
});

test('adding a second unit requires only data and can review an earlier unit', () => {
  const extra = {
    id: 'path-week-2', week: 2, title: '그녀의 상태', goal: '그녀의 상태를 말해요.',
    sentences: [{ id: 'she-happy', text: 'She is happy.', meaning: '그녀는 행복해.', requires: ['she-is', 'feeling-happy-tired'] }],
    lessons: [{ id: 'path-w2-d1', title: '그녀는 행복해', objective: '배운 상태로 그녀를 소개해요.', grammar: 'She는 그녀예요. She 뒤에는 is를 써요.',
      mode: 'learn', introduces: ['she-is'], requires: ['feeling-happy-tired'], words: ['she'], sentences: ['she-happy'], reviewSentences: ['path-week-1:you-happy'] }],
  };
  const expanded = buildLearningPath([...LEARNING_UNITS, extra], words);
  assert.equal(expanded.length, 7);
  assert.equal(expanded.at(-1).week, 2);
  assert.ok(expanded.at(-1).exercises.some((question) => question.answer === 'You are happy.' && question.stage === 'review'));
  assert.ok(expanded.at(-1).exercises.some((question) => question.answer === 'She is happy.'));
  const completed = new Set(lessons.map((lesson) => lesson.id));
  assert.equal(getNextGuidedLesson(expanded, completed).id, 'path-w2-d1');
});

test('missing prerequisites, unlearned review data and unknown references fail during authoring', () => {
  const changed = (update) => {
    const units = structuredClone(LEARNING_UNITS);
    update(units[0]);
    return () => buildLearningPath(units, words);
  };
  assert.throws(changed((unit) => { unit.lessons[0].requires = ['you-are']; }), /untaught prerequisite/);
  assert.throws(changed((unit) => { unit.lessons[0].reviewWords = ['ready']; }), /unlearned review word/);
  assert.throws(changed((unit) => { unit.lessons[0].reviewSentences = ['you-ready']; }), /unlearned review sentence/);
  assert.throws(changed((unit) => { unit.lessons[0].words = ['missing-word']; }), /unknown word/);
  assert.throws(changed((unit) => { unit.lessons[0].sentences = ['you-ready']; }), /untaught sentence concept/);
  assert.throws(changed((unit) => { unit.lessons[1].id = unit.lessons[0].id; }), /duplicate lesson ID/);
  assert.throws(changed((unit) => { unit.lessons[0].transferSentences = ['name-mina']; }), /transfer belongs/);
});

test('checkpoint mistakes get supported choice, assembly, listening and writing again', () => {
  const checkpoint = lessons.at(-1);
  const failed = checkpoint.exercises.find((question) => question.answer === 'You are Mina.');
  const retry = buildGuidedRetry(checkpoint.exercises, [failed.id], lessons);
  assert.deepEqual(retry.map((question) => question.type), ['choice', 'order', 'listen', 'write']);
  assert.ok(retry.every((question) => question.practiceKey === failed.practiceKey));
  assert.deepEqual(buildGuidedRetry(checkpoint.exercises, [], lessons), []);
});

test('repeated families across days do not inflate random review', () => {
  const pool = lessons.slice(0, 5).flatMap((lesson) => lesson.exercises);
  const review = buildReviewQuestions(pool, [pool[0].id]);
  assert.ok(review.length <= 16);
  const pairs = review.map((question) => `${question.practiceKey}:${question.type}`);
  assert.equal(new Set(pairs).size, pairs.length);
});

test('legacy and paused sessions do not skip new course content', () => {
  const first = lessons[0];
  const legacy = { activity_type: 'lesson', lesson_id: 'hello', question_count: 18 };
  const paused = { activity_type: 'review', lesson_id: first.id, question_count: 5 };
  assert.equal(getCompletedLessonIds([legacy, paused], lessons).size, 0);
  assert.equal(getNextGuidedLesson(lessons, getCompletedLessonIds([legacy, paused], lessons)).id, first.id);
  const completed = { activity_type: 'lesson', lesson_id: first.id, question_count: first.exercises.length };
  assert.equal(getNextGuidedLesson(lessons, getCompletedLessonIds([legacy, paused, completed], lessons)).id, lessons[1].id);
  assert.equal(getNextGuidedLesson(lessons, new Set(lessons.map((lesson) => lesson.id))), undefined);
});
