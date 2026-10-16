import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VOCABULARY_UNITS, VOCABULARY_LESSONS, createVocabularyLesson } from '../src/app/lib/english/vocabulary.ts';
import { ENGLISH_LESSONS, buildReviewQuestions, getCompletedLessonIds, getMistakeQuestions, sameAnswer } from '../src/app/lib/english/curriculum.ts';

const vocabularyBank = VOCABULARY_LESSONS.flatMap((lesson) => lesson.exercises);

function assertWordSteps(questions) {
  for (const key of new Set(questions.map((question) => question.practiceKey))) {
    const steps = questions.filter((question) => question.practiceKey === key);
    assert.deepEqual(steps.map((question) => question.type), ['choice', 'word-choice', 'write']);
    assert.equal(steps[1].answer, steps[2].answer);
  }
}

test('raw vocabulary contains 64 unique words and generates 192 exercises in 11 units', () => {
  const words = VOCABULARY_UNITS.flatMap((unit) => unit.words);
  assert.equal(words.length, 64);
  assert.equal(new Set(words.map((item) => item.word.toLowerCase())).size, words.length);
  assert.equal(VOCABULARY_UNITS.length, 11);
  assert.equal(vocabularyBank.length, 192);
  assert.equal(new Set(VOCABULARY_UNITS.map((unit) => unit.id)).size, 11);
  const allIds = [...vocabularyBank, ...ENGLISH_LESSONS.flatMap((lesson) => lesson.exercises)].map((question) => question.id);
  assert.equal(new Set(allIds).size, allIds.length);
  for (const [index, unit] of VOCABULARY_UNITS.entries()) {
    const lesson = VOCABULARY_LESSONS[index];
    assert.equal(lesson.kind, 'vocabulary');
    assert.equal(lesson.examples.length, unit.words.length);
    assert.equal(lesson.exercises.length, unit.words.length * 3);
    assertWordSteps(lesson.exercises);
    for (const word of unit.words) {
      assert.ok(word.word && word.meaning && word.example && word.exampleMeaning && unit.partOfSpeech);
      assert.ok(word.example.toLowerCase().split(/[^a-z]+/).includes(word.word.toLowerCase()), `${word.word} must appear in its example`);
      assert.ok(lesson.examples.some((example) => example.sentence === word.word && example.meaning === word.meaning && example.note.includes(word.example)));
    }
  }
});

test('every choice has one accepted answer; writes follow both choices for the same word', () => {
  for (const question of vocabularyBank) {
    assert.ok(sameAnswer(question.answer, question));
    if (question.type !== 'write') {
      assert.equal(question.options.length, 3);
      assert.equal(new Set(question.options).size, 3);
      assert.equal(question.options.filter((option) => sameAnswer(option, question)).length, 1);
    } else {
      assert.equal(question.options, undefined);
      const earlier = vocabularyBank.slice(0, vocabularyBank.indexOf(question)).filter((item) => item.practiceKey === question.practiceKey);
      assert.deepEqual(earlier.map((item) => item.type), ['choice', 'word-choice']);
      assert.ok(sameAnswer(`  ${question.answer.toUpperCase()}  `, question));
      assert.ok(!sameAnswer(`${question.answer}wrong`, question));
    }
  }
});

test('one new raw unit creates working exercises without changes to the renderer', () => {
  const unit = {
    id: 'extra-fruit', title: '과일', partOfSpeech: '명사', words: [
      { word: 'banana', meaning: '바나나', example: 'I have a banana.', exampleMeaning: '나는 바나나가 하나 있어.' },
      { word: 'orange', meaning: '오렌지', example: 'It is an orange.', exampleMeaning: '그것은 오렌지야.' },
      { word: 'grape', meaning: '포도 한 알', example: 'It is a grape.', exampleMeaning: '그것은 포도 한 알이야.' },
    ],
  };
  const lesson = createVocabularyLesson(unit);
  assert.equal(lesson.id, 'vocabulary-extra-fruit');
  assert.equal(lesson.exercises.length, 9);
  assertWordSteps(lesson.exercises);
  assert.ok(lesson.exercises.some((question) => question.type === 'write' && question.answer === 'banana'));
});

test('word reviews include only learned vocabulary and prioritize errors with all three steps', () => {
  const learned = VOCABULARY_LESSONS.find((lesson) => lesson.id === 'vocabulary-feelings').exercises;
  const wrong = learned.at(-1);
  const questions = buildReviewQuestions(learned, [wrong.id]);
  assert.equal(questions.length, 12);
  assert.ok(questions.every((question) => learned.includes(question)));
  assert.ok(questions.some((question) => question.id === wrong.id));
  assertWordSteps(questions);
  const retry = getMistakeQuestions(questions, [wrong.id]);
  assert.equal(retry.length, 3);
  assertWordSteps(retry);
});

test('word completion cannot unlock sentence lessons and reviews cannot complete word units', () => {
  const lesson = VOCABULARY_LESSONS[0];
  const record = { activity_type: 'lesson', lesson_id: lesson.id, question_count: lesson.exercises.length };
  assert.equal(getCompletedLessonIds([record]).size, 0);
  assert.deepEqual([...getCompletedLessonIds([record], VOCABULARY_LESSONS)], [lesson.id]);
  assert.equal(getCompletedLessonIds([{ ...record, activity_type: 'review' }], VOCABULARY_LESSONS).size, 0);
  assert.equal(getCompletedLessonIds([{ ...record, question_count: 3 }], VOCABULARY_LESSONS).size, 0);
  assert.equal(getCompletedLessonIds([{ ...record, lesson_id: 'vocabulary-review' }], VOCABULARY_LESSONS).size, 0);
});

test('mixed review preserves the appropriate learning steps for each question family', () => {
  const sentence = ENGLISH_LESSONS[0].exercises.filter((question) => question.practiceKey === 'hello-1');
  const words = VOCABULARY_LESSONS.find((lesson) => lesson.id === 'vocabulary-feelings').exercises.filter((question) => question.practiceKey === 'vocabulary-feelings-happy');
  const mixed = buildReviewQuestions([...sentence, ...words], []);
  assert.equal(mixed.length, 6);
  assert.deepEqual(mixed.filter((question) => question.practiceKey === 'hello-1').map((question) => question.type), ['choice', 'order', 'write']);
  assertWordSteps(mixed.filter((question) => question.practiceKey === 'vocabulary-feelings-happy'));
});

test('invalid units cannot generate ambiguous or undersized choices', () => {
  const unit = VOCABULARY_UNITS.find((item) => item.id === 'feelings');
  assert.throws(() => createVocabularyLesson({ ...unit, words: [] }), /at least three distinct/);
  assert.throws(() => createVocabularyLesson({ ...unit, words: unit.words.slice(0, 2) }), /at least three distinct/);
  assert.throws(() => createVocabularyLesson({ ...unit, words: [unit.words[0], { ...unit.words[0], word: 'HAPPY' }, unit.words[2]] }), /at least three distinct/);
  assert.throws(() => createVocabularyLesson({ ...unit, words: [unit.words[0], { ...unit.words[1], meaning: unit.words[0].meaning }, unit.words[2]] }), /at least three distinct/);
});
