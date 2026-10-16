import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ENGLISH_CHAPTERS, ENGLISH_LESSONS, REVIEW_EXPRESSION_COUNT,
  buildReviewQuestions, getCompletedLessonIds, getMistakeQuestions,
  mix, normalizeEnglishAnswer, sameAnswer,
} from '../src/app/lib/english/curriculum.ts';

const bank = ENGLISH_LESSONS.flatMap((lesson) => lesson.exercises);

function assertScaffolded(questions) {
  const keys = [...new Set(questions.map((question) => question.practiceKey))];
  for (const key of keys) {
    const family = questions.filter((question) => question.practiceKey === key);
    assert.deepEqual(family.map((question) => question.type), ['choice', 'order', 'write']);
    assert.equal(family[1].answer, family[2].answer);
    assert.ok(questions.indexOf(family[0]) < questions.indexOf(family[1]));
    assert.ok(questions.indexOf(family[1]) < questions.indexOf(family[2]));
  }
}

test('24 lessons contain 432 exercises with unique IDs and six scaffolded expressions each', () => {
  assert.equal(ENGLISH_CHAPTERS.length, 4);
  assert.equal(ENGLISH_LESSONS.length, 24);
  assert.equal(bank.length, 432);
  assert.equal(new Set(bank.map((question) => question.id)).size, bank.length);
  assert.equal(new Set(ENGLISH_LESSONS.map((lesson) => lesson.id)).size, ENGLISH_LESSONS.length);
  for (const lesson of ENGLISH_LESSONS) {
    assert.ok(ENGLISH_CHAPTERS.some((chapter) => chapter.id === lesson.chapter));
    assert.equal(lesson.examples.length, 6);
    assert.equal(lesson.exercises.length, 18);
    assert.deepEqual(lesson.exercises.map((question) => question.type), [
      ...Array(6).fill('choice'), ...Array(6).fill('order'), ...Array(6).fill('write'),
    ]);
    assertScaffolded(lesson.exercises);
    assert.doesNotMatch(`${lesson.title} ${lesson.scene} ${lesson.grammar}`, /[\u3040-\u30ff]/);
  }
});

test('every be question follows practice of its corresponding statement', () => {
  const learned = new Set();
  for (const lesson of ENGLISH_LESSONS) {
    for (const example of lesson.examples) {
      const sentence = normalizeEnglishAnswer(example.sentence);
      const words = sentence.split(' ');
      if (/^(am|is|are) /.test(sentence)) {
        const statement = [words[1], words[0], ...words.slice(2)].join(' ');
        assert.ok(learned.has(statement), `${example.sentence} has no preceding ${statement}`);
      }
      learned.add(sentence);
    }
  }
  assert.ok(ENGLISH_LESSONS.findIndex((lesson) => lesson.id === 'you-are') < ENGLISH_LESSONS.findIndex((lesson) => lesson.id === 'ask-you'));
  assert.ok(!ENGLISH_LESSONS.find((lesson) => lesson.id === 'people').exercises.some((question) => question.answer.includes('Are you')));
});

test('choices have one valid answer; tiles preserve every word; accepted contractions work', () => {
  for (const question of bank) {
    assert.ok(sameAnswer(question.answer, question));
    if (question.type === 'choice') {
      assert.equal(question.options.length, 3);
      assert.equal(new Set(question.options).size, 3);
      assert.equal(question.options.filter((option) => sameAnswer(option, question)).length, 1);
    }
    if (question.type === 'order') {
      assert.deepEqual([...question.tiles].sort(), question.answer.split(' ').sort());
    }
    for (const alternative of question.acceptableAnswers ?? []) {
      assert.ok(sameAnswer(alternative, question));
      assert.ok(sameAnswer(alternative.replaceAll('’', "'"), question));
    }
  }
  const ready = ENGLISH_LESSONS[0].exercises.find((question) => question.answer === 'I am ready.');
  assert.ok(sameAnswer('  I AM   READY! ', ready));
  assert.ok(sameAnswer('I’m ready', ready));
  assert.ok(!sameAnswer('I are ready', ready));
});

test('reading uses previously introduced vocabulary and asks for meaning before assembly and writing', () => {
  const vocabulary = new Set();
  for (const lesson of ENGLISH_LESSONS) {
    if (lesson.chapter === 4) {
      for (const example of lesson.examples) {
        for (const word of normalizeEnglishAnswer(example.sentence).split(' ')) {
          assert.ok(vocabulary.has(word), `Untaught reading word: ${word}`);
        }
      }
      for (const question of lesson.exercises.filter((item) => item.type === 'choice')) {
        assert.ok(question.passage);
        assert.match(question.answer, /[가-힣]/);
      }
    }
    for (const example of lesson.examples) {
      for (const word of normalizeEnglishAnswer(example.sentence).split(' ')) vocabulary.add(word);
    }
  }
});

test('review prioritizes missed expressions and retains all three learning steps', () => {
  const missed = ENGLISH_LESSONS[0].exercises.at(-1);
  const review = buildReviewQuestions(bank, [missed.id, 'retired-question-id']);
  assert.equal(review.length, REVIEW_EXPRESSION_COUNT * 3);
  assert.ok(review.some((question) => question.id === missed.id));
  assertScaffolded(review);
  assert.deepEqual(review.map((question) => question.type), [
    ...Array(4).fill('choice'), ...Array(4).fill('order'), ...Array(4).fill('write'),
  ]);
  const one = bank.filter((question) => question.practiceKey === missed.practiceKey);
  assert.equal(buildReviewQuestions(one, []).length, 3);
  assert.deepEqual(buildReviewQuestions([], []), []);
});

test('mistake practice includes every missed expression, not only its failed input question', () => {
  const questions = ENGLISH_LESSONS[0].exercises;
  const missed = questions.filter((question) => question.type === 'write');
  const retry = getMistakeQuestions(questions, missed.map((question) => question.id));
  assert.equal(retry.length, 18);
  assertScaffolded(retry);
  assert.equal(getMistakeQuestions(questions, [missed[0].id]).length, 3);
  assert.deepEqual(getMistakeQuestions(questions, []), []);
});

test('legacy three-question sessions and reviews do not mark expanded lessons complete', () => {
  const legacy = { activity_type: 'lesson', lesson_id: 'hello', question_count: 3 };
  assert.equal(getCompletedLessonIds([legacy]).size, 0);
  assert.equal(getCompletedLessonIds([{ ...legacy, activity_type: 'review', question_count: 18 }]).size, 0);
  assert.deepEqual([...getCompletedLessonIds([legacy, { ...legacy, question_count: 18 }])], ['hello']);
  assert.equal(legacy.question_count, 3);
});

test('shuffle preserves the source, duplicates and complete contents', () => {
  const source = ['a', 'a', 'b'];
  const shuffled = mix(source);
  assert.notEqual(shuffled, source);
  assert.deepEqual(source, ['a', 'a', 'b']);
  assert.deepEqual(shuffled.sort(), [...source].sort());
  assert.deepEqual(mix([]), []);
});
