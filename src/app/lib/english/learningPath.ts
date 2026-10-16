import type { EnglishLesson, Exercise } from './curriculum';
import type { VocabularyWord } from './vocabulary';

type Sentence = {
  id: string;
  text: string;
  meaning: string;
  requires: string[];
  acceptableAnswers?: string[];
};

type LessonDefinition = {
  id: string;
  title: string;
  objective: string;
  grammar: string;
  mode: 'learn' | 'review' | 'check';
  introduces: string[];
  requires: string[];
  words: string[];
  sentences: string[];
  reviewWords?: string[];
  reviewSentences?: string[];
  transferSentences?: string[];
  preparationWord?: string;
};

export type LearningUnitDefinition = {
  id: string;
  week: number;
  title: string;
  goal: string;
  sentences: Sentence[];
  lessons: LessonDefinition[];
};

export type GuidedLesson = EnglishLesson & {
  unitId: string;
  week: number;
  day: number;
  objective: string;
  mode: LessonDefinition['mode'];
  introduces: string[];
  requires: string[];
  words: VocabularyWord[];
  speaking: { text: string; meaning: string }[];
  preparationWord?: string;
  supportExercises: Exercise[];
};

export const LEARNING_SETTINGS = { targetMinutes: 15, listeningTasks: 2, speakingPrompts: 2, speechRate: 0.85 };

export const PATH_SECTIONS = [
  { month: 1, title: '인사와 나 소개하기', goal: '나와 다른 사람의 상태를 말하고 간단히 묻기', weeks: ['인사와 나·너의 상태', '다른 사람과 물건', '우리·그들과 부정문', '안부 묻고 답하기'] },
  { month: 2, title: '내 생활 말하기', goal: '가진 것·취향·하루의 행동을 짧게 표현하기', weeks: ['가진 물건', '좋아하는 것·원하는 것', '하루의 행동', '행동 묻고 부정하기'] },
  { month: 3, title: '가게와 식당에서', goal: '메뉴와 가격을 읽고 원하는 것을 주문하기', weeks: ['카페 주문', '가격과 수량', '물건 고르기', '식당 주문'] },
  { month: 4, title: '여행하며 이동하기', goal: '장소·시간·숙소의 짧은 정보를 이해하기', weeks: ['장소 찾기', '주변 위치와 안내', '교통과 시각', '숙소 예약 확인'] },
  { month: 5, title: '평소와 지금 구분하기', goal: '다른 사람의 일상과 지금 하는 일을 구분하기', weeks: ['그·그녀의 일상', 'does로 묻고 답하기', '지금 하는 일', '지금의 행동 묻기'] },
  { month: 6, title: '계획하고 도움 요청하기', goal: '가까운 계획·생활 메시지·여행 상황 연결하기', weeks: ['가까운 계획', '도움 요청', '생활 메시지', '여행 종합 확인'] },
];

export const LEARNING_UNITS: LearningUnitDefinition[] = [{
  id: 'path-week-1', week: 1, title: '인사와 나·너의 상태',
  goal: '인사하고 이름과 상태를 말할 수 있어요.',
  sentences: [
    { id: 'hello', text: 'Hello.', meaning: '안녕하세요.', requires: ['greeting'] },
    { id: 'name-mina', text: 'I am Mina.', meaning: '나는 미나야.', requires: ['i-am'], acceptableAnswers: ["I'm Mina"] },
    { id: 'name-jin', text: 'I am Jin.', meaning: '나는 진이야.', requires: ['i-am'], acceptableAnswers: ["I'm Jin"] },
    { id: 'i-happy', text: 'I am happy.', meaning: '나는 행복해.', requires: ['i-am', 'feeling-happy-tired'], acceptableAnswers: ["I'm happy"] },
    { id: 'i-tired', text: 'I am tired.', meaning: '나는 피곤해.', requires: ['i-am', 'feeling-happy-tired'], acceptableAnswers: ["I'm tired"] },
    { id: 'you-happy', text: 'You are happy.', meaning: '너는 행복해.', requires: ['you-are', 'feeling-happy-tired'], acceptableAnswers: ["You're happy"] },
    { id: 'you-tired', text: 'You are tired.', meaning: '너는 피곤해.', requires: ['you-are', 'feeling-happy-tired'], acceptableAnswers: ["You're tired"] },
    { id: 'i-okay', text: 'I am okay.', meaning: '나는 괜찮아.', requires: ['i-am', 'feeling-okay-ready'], acceptableAnswers: ["I'm okay", 'I am ok', "I'm ok"] },
    { id: 'i-ready', text: 'I am ready.', meaning: '나는 준비됐어.', requires: ['i-am', 'feeling-okay-ready'], acceptableAnswers: ["I'm ready"] },
    { id: 'you-okay', text: 'You are okay.', meaning: '너는 괜찮아.', requires: ['you-are', 'feeling-okay-ready'], acceptableAnswers: ["You're okay", 'You are ok', "You're ok"] },
    { id: 'you-ready', text: 'You are ready.', meaning: '너는 준비됐어.', requires: ['you-are', 'feeling-okay-ready'], acceptableAnswers: ["You're ready"] },
    { id: 'you-name', text: 'You are Mina.', meaning: '너는 미나야.', requires: ['i-am', 'you-are'], acceptableAnswers: ["You're Mina"] },
  ],
  lessons: [
    { id: 'path-w1-d1', title: '안녕, 나는 미나야', objective: '인사하고 이름을 말해요.',
      grammar: 'Hello는 인사예요. I는 “나”, I am 뒤에 이름을 놓으면 “나는 ~야”가 돼요. Mina는 미나, Jin은 진이라는 이름이에요.',
      mode: 'learn', introduces: ['greeting', 'i-am'], requires: [], words: ['hello', 'I'], sentences: ['hello', 'name-mina', 'name-jin'], preparationWord: 'hello' },
    { id: 'path-w1-d2', title: '나는 행복해 · 나는 피곤해', objective: '배운 I am으로 내 상태를 말해요.',
      grammar: 'happy는 “행복한”, tired는 “피곤한”이에요. 이름 대신 상태를 I am 뒤에 놓아요. I am은 I’m으로 줄여도 돼요.',
      mode: 'learn', introduces: ['feeling-happy-tired'], requires: ['i-am'], words: ['happy', 'tired'], sentences: ['i-happy', 'i-tired'], reviewSentences: ['name-mina'] },
    { id: 'path-w1-d3', title: '이번에는 너에 대해', objective: '같은 상태 단어로 나와 너를 구분해요.',
      grammar: 'You는 “너/당신”이에요. I am과 달리 You 뒤에는 are를 써요. You are는 You’re로 줄일 수 있어요. happy와 tired는 이미 배웠어요.',
      mode: 'learn', introduces: ['you-are'], requires: ['i-am', 'feeling-happy-tired'], words: ['you'], sentences: ['you-happy', 'you-tired'], reviewSentences: ['i-happy'] },
    { id: 'path-w1-d4', title: '괜찮아 · 준비됐어', objective: '나와 너의 괜찮음·준비 상태를 말해요.',
      grammar: 'okay는 “괜찮은”, ready는 “준비된”이에요. 알려진 I am / You are에 새 상태만 더해요. 아직 질문으로 바꾸지 않아요.',
      mode: 'learn', introduces: ['feeling-okay-ready'], requires: ['i-am', 'you-are'], words: ['okay', 'ready'], sentences: ['i-okay', 'i-ready', 'you-okay', 'you-ready'], reviewSentences: ['you-tired'] },
    { id: 'path-w1-d5', title: '이번 주 표현 다시 만나기', objective: '단어와 문장을 섞어 다시 꺼내 봐요.',
      grammar: '새 단어나 문법은 없어요. I am과 You are를 비교하며 앞에서 배운 단어로 말해요.',
      mode: 'review', introduces: [], requires: ['greeting', 'i-am', 'you-are', 'feeling-happy-tired', 'feeling-okay-ready'], words: [], sentences: [],
      reviewWords: ['happy', 'ready'], reviewSentences: ['name-mina', 'i-tired', 'you-happy', 'you-okay'] },
    { id: 'path-w1-d6', title: '혼자서도 표현할 수 있나요?', objective: '이름과 상태를 도움 없이 떠올려 봐요.',
      grammar: '배운 단어와 구조로 짧게 답해요. 마지막에는 나 대신 너로 이름을 말하는 작은 응용도 해요. 틀려도 다시 연습할 수 있어요.',
      mode: 'check', introduces: [], requires: ['greeting', 'i-am', 'you-are', 'feeling-happy-tired', 'feeling-okay-ready'], words: [], sentences: [],
      reviewWords: ['I', 'you', 'happy', 'ready'], reviewSentences: ['name-jin', 'i-ready', 'you-tired'], transferSentences: ['you-name'] },
  ],
}];

function distinct<T>(items: T[]): T[] { return [...new Set(items)]; }

export function buildLearningPath(units: LearningUnitDefinition[], vocabulary: VocabularyWord[]): GuidedLesson[] {
  const words = new Map(vocabulary.map((word) => [word.word.toLowerCase(), word]));
  const allSentences = new Map<string, Sentence>();
  const unitIds = new Set<string>();
  for (const unit of units) {
    if (unitIds.has(unit.id) || !Number.isInteger(unit.week) || unit.week < 1) throw new Error(`Invalid unit ${unit.id}`);
    unitIds.add(unit.id);
    for (const sentence of unit.sentences) {
      const key = `${unit.id}:${sentence.id}`;
      if (allSentences.has(key)) throw new Error(`Duplicate sentence ${key}`);
      allSentences.set(key, { ...sentence, id: key });
    }
  }
  const knownConcepts = new Set<string>();
  const knownWords = new Set<string>();
  const knownSentences = new Set<string>();
  const lessonIds = new Set<string>();
  const output: GuidedLesson[] = [];

  for (const unit of units) {
    const sentenceKey = (id: string) => id.includes(':') ? id : `${unit.id}:${id}`;
    for (const [day, definition] of unit.lessons.entries()) {
      const fail = (message: string): never => { throw new Error(`${definition.id}: ${message}`); };
      if (lessonIds.has(definition.id)) fail('duplicate lesson ID');
      lessonIds.add(definition.id);
      for (const concept of definition.requires) if (!knownConcepts.has(concept)) fail(`untaught prerequisite ${concept}`);
      for (const concept of definition.introduces) knownConcepts.add(concept);
      const newWords = definition.words.map((id) => words.get(id.toLowerCase()) ?? fail(`unknown word ${id}`));
      for (const word of newWords) knownWords.add(word.word.toLowerCase());
      for (const id of definition.reviewWords ?? []) if (!knownWords.has(id.toLowerCase())) fail(`unlearned review word ${id}`);
      const getSentence = (id: string) => {
        const sentence = allSentences.get(sentenceKey(id)) ?? fail(`unknown sentence ${id}`);
        for (const concept of sentence.requires) if (!knownConcepts.has(concept)) fail(`untaught sentence concept ${concept}`);
        return sentence;
      };
      for (const id of definition.reviewSentences ?? []) if (!knownSentences.has(sentenceKey(id))) fail(`unlearned review sentence ${id}`);
      const newSentences = definition.sentences.map(getSentence);
      for (const sentence of newSentences) knownSentences.add(sentence.id);
      const reviewSentences = (definition.reviewSentences ?? []).map(getSentence);
      const transferSentences = (definition.transferSentences ?? []).map(getSentence);
      if (transferSentences.length && definition.mode !== 'check') fail('transfer belongs in check lessons');
      const practicedSentences = [...reviewSentences, ...newSentences];
      const availableWords = [...knownWords].map((key) => words.get(key)!);
      const availableSentences = [...allSentences.values()].filter((sentence) => knownSentences.has(sentence.id));

      const wordExercises = (word: VocabularyWord, stage: Exercise['stage']): Exercise[] =>
        (['choice', 'word-choice', 'write'] as const).map((type) => ({
          id: `${definition.id}:word:${word.word.toLowerCase()}:${type}`,
          practiceKey: `${unit.id}:word:${word.word.toLowerCase()}`, type, stage,
          prompt: type === 'choice' ? `“${word.word}”의 뜻을 고르세요.` : `“${word.meaning}”에 맞는 영단어를 ${type === 'write' ? '써' : '골라'} 보세요.`,
          answer: type === 'choice' ? word.meaning : word.word,
          explanation: `${word.word} = ${word.meaning}`,
          ...(type === 'write' ? {} : { options: distinct([word, ...availableWords].map((item) => type === 'choice' ? item.meaning : item.word)).slice(0, 3) }),
        }));
      const sentenceExercise = (sentence: Sentence, type: 'choice' | 'order' | 'listen' | 'write', stage: Exercise['stage']): Exercise => ({
        id: `${definition.id}:sentence:${sentence.id}:${type}`,
        practiceKey: `${sentence.id}`, type, stage,
        prompt: type === 'listen' ? '영어를 듣고 뜻을 고르세요.' : `“${sentence.meaning}”${type === 'choice' ? '에 맞는 문장을 고르세요.' : type === 'order' ? ' — 단어를 놓아 문장을 만드세요.' : '를 영어로 써 보세요.'}`,
        answer: type === 'listen' ? sentence.meaning : sentence.text,
        explanation: `${sentence.text} = ${sentence.meaning}`,
        ...(type === 'choice' || type === 'listen' ? { options: distinct([sentence, ...availableSentences].map((item) => type === 'listen' ? item.meaning : item.text)).slice(0, 3) } : {}),
        ...(type === 'order' ? { tiles: sentence.text.split(' ').reverse() } : {}),
        ...(type === 'listen' ? { audioText: sentence.text } : { acceptableAnswers: sentence.acceptableAnswers }),
      });
      const exercises: Exercise[] = [];
      if (definition.mode === 'check') {
        for (const id of definition.reviewWords ?? []) exercises.push(wordExercises(words.get(id.toLowerCase())!, 'use')[1]);
        for (const sentence of practicedSentences.slice(0, LEARNING_SETTINGS.listeningTasks)) exercises.push(sentenceExercise(sentence, 'listen', 'listen'));
        for (const sentence of [...practicedSentences, ...transferSentences]) exercises.push(sentenceExercise(sentence, 'write', 'use'));
      } else {
        const reviewWords = (definition.reviewWords ?? []).map((id) => words.get(id.toLowerCase())!);
        const reviewFamilies = [
          ...reviewWords.map((word) => wordExercises(word, 'review')),
          ...reviewSentences.map((sentence) => (['choice', 'order', 'write'] as const).map((type) => sentenceExercise(sentence, type, 'review'))),
        ];
        if (definition.mode === 'review') {
          for (let index = 0; index < 3; index += 1) exercises.push(...reviewFamilies.map((family) => family[index]));
        } else {
          exercises.push(...reviewFamilies.flat());
          const wordFamilies = newWords.map((word) => wordExercises(word, 'word'));
          for (let index = 0; index < 3; index += 1) exercises.push(...wordFamilies.map((family) => family[index]));
          for (const type of ['choice', 'order'] as const) exercises.push(...newSentences.map((sentence) => sentenceExercise(sentence, type, 'sentence')));
        }
        exercises.push(...practicedSentences.slice(-LEARNING_SETTINGS.listeningTasks).map((sentence) => sentenceExercise(sentence, 'listen', 'listen')));
        if (definition.mode === 'learn') exercises.push(...newSentences.map((sentence) => sentenceExercise(sentence, 'write', 'use')));
      }
      if (!exercises.length) fail('empty lesson');
      const supportExercises = [
        ...distinct([...definition.words, ...(definition.reviewWords ?? [])]).flatMap((id) => wordExercises(words.get(id.toLowerCase())!, 'review')),
        ...[...practicedSentences, ...transferSentences].flatMap((sentence) =>
          (['choice', 'order', 'listen', 'write'] as const).map((type) => sentenceExercise(sentence, type, type === 'listen' ? 'listen' : 'review'))),
      ];
      output.push({
        id: definition.id, kind: 'guided', chapter: Math.ceil(unit.week / 4), unitId: unit.id, week: unit.week, day: day + 1,
        title: definition.title, scene: definition.objective, objective: definition.objective, grammar: definition.grammar,
        mode: definition.mode, introduces: definition.introduces, requires: definition.requires, words: newWords, preparationWord: definition.preparationWord,
        examples: [...newSentences, ...(definition.mode === 'review' ? reviewSentences : [])].map((sentence) => ({
          sentence: sentence.text, meaning: sentence.meaning, distractors: ['', ''], acceptableAnswers: sentence.acceptableAnswers,
        })),
        speaking: practicedSentences.slice(-LEARNING_SETTINGS.speakingPrompts).map((sentence) => ({ text: sentence.text, meaning: sentence.meaning })),
        exercises, supportExercises,
      });
    }
  }
  return output;
}

export function getNextGuidedLesson(lessons: GuidedLesson[], completedIds: Set<string>): GuidedLesson | undefined {
  return lessons.find((lesson) => !completedIds.has(lesson.id));
}

export function buildGuidedRetry(questions: Exercise[], wrongIds: string[], lessons: GuidedLesson[]): Exercise[] {
  const wrong = new Set(wrongIds);
  const keys = new Set(questions.filter((question) => wrong.has(question.id)).map((question) => question.practiceKey));
  const pool = [...new Map(lessons.flatMap((lesson) => lesson.supportExercises)
    .filter((question) => keys.has(question.practiceKey))
    .map((question) => [`${question.practiceKey}:${question.type}`, question])).values()];
  return (['choice', 'word-choice', 'order', 'listen', 'write'] as const).flatMap((type) => pool.filter((question) => question.type === type));
}
