import type { EnglishLesson, Exercise } from './curriculum';

export type VocabularyWord = {
  word: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
};

export type VocabularyUnit = {
  id: string;
  title: string;
  partOfSpeech: string;
  words: VocabularyWord[];
};

export const VOCABULARY_UNITS: VocabularyUnit[] = [
  {
    id: 'greetings', title: '인사말', partOfSpeech: '감탄사',
    words: [
      { word: 'hello', meaning: '안녕하세요', example: 'Hello.', exampleMeaning: '안녕하세요.' },
      { word: 'thanks', meaning: '고마워요', example: 'Thanks.', exampleMeaning: '고마워요.' },
      { word: 'goodbye', meaning: '잘 가요', example: 'Goodbye.', exampleMeaning: '잘 가요.' },
    ],
  },
  {
    id: 'people', title: '누구를 말할까요?', partOfSpeech: '대명사',
    words: [
      { word: 'I', meaning: '나', example: 'I am happy.', exampleMeaning: '나는 행복해.' },
      { word: 'you', meaning: '너 · 당신', example: 'You are ready.', exampleMeaning: '너는 준비됐어.' },
      { word: 'he', meaning: '그', example: 'He is kind.', exampleMeaning: '그는 친절해.' },
      { word: 'she', meaning: '그녀', example: 'She is happy.', exampleMeaning: '그녀는 행복해.' },
      { word: 'it', meaning: '그것', example: 'It is small.', exampleMeaning: '그것은 작아.' },
      { word: 'we', meaning: '우리', example: 'We are ready.', exampleMeaning: '우리는 준비됐어.' },
      { word: 'they', meaning: '그들', example: 'They are hungry.', exampleMeaning: '그들은 배고파.' },
    ],
  },
  {
    id: 'feelings', title: '기분과 상태', partOfSpeech: '형용사',
    words: [
      { word: 'happy', meaning: '행복한', example: 'I am happy.', exampleMeaning: '나는 행복해.' },
      { word: 'ready', meaning: '준비된', example: 'You are ready.', exampleMeaning: '너는 준비됐어.' },
      { word: 'okay', meaning: '괜찮은', example: 'I am okay.', exampleMeaning: '나는 괜찮아.' },
      { word: 'tired', meaning: '피곤한', example: 'We are tired.', exampleMeaning: '우리는 피곤해.' },
      { word: 'hungry', meaning: '배고픈', example: 'They are hungry.', exampleMeaning: '그들은 배고파.' },
      { word: 'kind', meaning: '친절한', example: 'She is kind.', exampleMeaning: '그녀는 친절해.' },
    ],
  },
  {
    id: 'descriptions', title: '크기와 온도', partOfSpeech: '형용사',
    words: [
      { word: 'small', meaning: '작은', example: 'It is small.', exampleMeaning: '그것은 작아.' },
      { word: 'big', meaning: '큰', example: 'It is big.', exampleMeaning: '그것은 커.' },
      { word: 'new', meaning: '새로운', example: 'It is new.', exampleMeaning: '그것은 새것이야.' },
      { word: 'old', meaning: '오래된', example: 'It is old.', exampleMeaning: '그것은 오래됐어.' },
      { word: 'cold', meaning: '차가운', example: 'It is cold.', exampleMeaning: '그것은 차가워.' },
      { word: 'warm', meaning: '따뜻한', example: 'It is warm.', exampleMeaning: '그것은 따뜻해.' },
    ],
  },
  {
    id: 'school', title: '사람과 학교', partOfSpeech: '명사',
    words: [
      { word: 'student', meaning: '학생', example: 'I am a student.', exampleMeaning: '나는 학생이야.' },
      { word: 'teacher', meaning: '선생님', example: 'She is a teacher.', exampleMeaning: '그녀는 선생님이야.' },
      { word: 'friend', meaning: '친구', example: 'He is a friend.', exampleMeaning: '그는 친구야.' },
      { word: 'pen', meaning: '펜', example: 'I have a pen.', exampleMeaning: '나는 펜이 하나 있어.' },
      { word: 'book', meaning: '책', example: 'You have a book.', exampleMeaning: '너는 책이 한 권 있어.' },
      { word: 'bag', meaning: '가방', example: 'We have a bag.', exampleMeaning: '우리는 가방이 하나 있어.' },
    ],
  },
  {
    id: 'things', title: '주변의 물건과 동물', partOfSpeech: '명사',
    words: [
      { word: 'apple', meaning: '사과', example: 'I have an apple.', exampleMeaning: '나는 사과가 하나 있어.' },
      { word: 'egg', meaning: '달걀', example: 'It is an egg.', exampleMeaning: '그것은 달걀이야.' },
      { word: 'umbrella', meaning: '우산', example: 'You have an umbrella.', exampleMeaning: '너는 우산이 하나 있어.' },
      { word: 'cat', meaning: '고양이', example: 'I have a cat.', exampleMeaning: '나는 고양이가 한 마리 있어.' },
      { word: 'dog', meaning: '개', example: 'It is a dog.', exampleMeaning: '그것은 개야.' },
      { word: 'chair', meaning: '의자', example: 'It is a chair.', exampleMeaning: '그것은 의자야.' },
    ],
  },
  {
    id: 'food', title: '먹고 마시는 것', partOfSpeech: '명사',
    words: [
      { word: 'water', meaning: '물', example: 'I want water.', exampleMeaning: '나는 물을 원해.' },
      { word: 'bread', meaning: '빵', example: 'We eat bread.', exampleMeaning: '우리는 빵을 먹어.' },
      { word: 'coffee', meaning: '커피', example: 'I like coffee.', exampleMeaning: '나는 커피를 좋아해.' },
      { word: 'milk', meaning: '우유', example: 'I drink milk.', exampleMeaning: '나는 우유를 마셔.' },
      { word: 'rice', meaning: '쌀 · 밥', example: 'We eat rice.', exampleMeaning: '우리는 밥을 먹어.' },
      { word: 'tea', meaning: '차', example: 'You like tea.', exampleMeaning: '너는 차를 좋아해.' },
    ],
  },
  {
    id: 'verbs', title: '문장에서 만난 동사', partOfSpeech: '동사',
    words: [
      { word: 'have', meaning: '가지고 있다', example: 'I have a pen.', exampleMeaning: '나는 펜이 하나 있어.' },
      { word: 'want', meaning: '원하다', example: 'I want water.', exampleMeaning: '나는 물을 원해.' },
      { word: 'like', meaning: '좋아하다', example: 'We like bread.', exampleMeaning: '우리는 빵을 좋아해.' },
      { word: 'read', meaning: '읽다', example: 'I read every day.', exampleMeaning: '나는 매일 읽어.' },
      { word: 'eat', meaning: '먹다', example: 'We eat bread.', exampleMeaning: '우리는 빵을 먹어.' },
      { word: 'drink', meaning: '마시다', example: 'They drink water.', exampleMeaning: '그들은 물을 마셔.' },
    ],
  },
  {
    id: 'colors', title: '색깔', partOfSpeech: '형용사',
    words: [
      { word: 'red', meaning: '빨간', example: 'It is red.', exampleMeaning: '그것은 빨간색이야.' },
      { word: 'blue', meaning: '파란', example: 'It is blue.', exampleMeaning: '그것은 파란색이야.' },
      { word: 'green', meaning: '초록의', example: 'It is green.', exampleMeaning: '그것은 초록색이야.' },
      { word: 'yellow', meaning: '노란', example: 'It is yellow.', exampleMeaning: '그것은 노란색이야.' },
      { word: 'black', meaning: '검은', example: 'It is black.', exampleMeaning: '그것은 검은색이야.' },
      { word: 'white', meaning: '하얀', example: 'It is white.', exampleMeaning: '그것은 하얀색이야.' },
    ],
  },
  {
    id: 'numbers', title: '하나부터 여섯까지', partOfSpeech: '수사',
    words: [
      { word: 'one', meaning: '하나', example: 'one pen', exampleMeaning: '펜 하나' },
      { word: 'two', meaning: '둘', example: 'two books', exampleMeaning: '책 두 권' },
      { word: 'three', meaning: '셋', example: 'three bags', exampleMeaning: '가방 세 개' },
      { word: 'four', meaning: '넷', example: 'four cats', exampleMeaning: '고양이 네 마리' },
      { word: 'five', meaning: '다섯', example: 'five apples', exampleMeaning: '사과 다섯 개' },
      { word: 'six', meaning: '여섯', example: 'six eggs', exampleMeaning: '달걀 여섯 개' },
    ],
  },
  {
    id: 'daily', title: '하루의 동작', partOfSpeech: '동사',
    words: [
      { word: 'go', meaning: '가다', example: 'I go.', exampleMeaning: '나는 가.' },
      { word: 'come', meaning: '오다', example: 'You come.', exampleMeaning: '너는 와.' },
      { word: 'sleep', meaning: '자다', example: 'I sleep.', exampleMeaning: '나는 자.' },
      { word: 'study', meaning: '공부하다', example: 'We study.', exampleMeaning: '우리는 공부해.' },
      { word: 'work', meaning: '일하다', example: 'They work.', exampleMeaning: '그들은 일해.' },
      { word: 'play', meaning: '놀다', example: 'We play.', exampleMeaning: '우리는 놀아.' },
    ],
  },
];

export function createVocabularyLesson(unit: VocabularyUnit): EnglishLesson {
  if (unit.words.length < 3 || new Set(unit.words.map((item) => item.word.toLowerCase())).size !== unit.words.length ||
    new Set(unit.words.map((item) => item.meaning)).size !== unit.words.length) {
    throw new Error(`Vocabulary unit ${unit.id} needs at least three distinct words and meanings.`);
  }
  const exercises = (['choice', 'word-choice', 'write'] as const).flatMap((type) =>
    unit.words.map((item, index): Exercise => {
      const answer = type === 'choice' ? item.meaning : item.word;
      const alternatives = [unit.words[(index + 1) % unit.words.length], unit.words[(index + 2) % unit.words.length]];
      const options = alternatives.map((other) => type === 'choice' ? other.meaning : other.word);
      options.splice(index % 3, 0, answer);
      return {
        id: `vocabulary-${unit.id}-${item.word.toLowerCase()}-${type}`,
        practiceKey: `vocabulary-${unit.id}-${item.word.toLowerCase()}`,
        type,
        prompt: type === 'choice' ? `“${item.word}”의 뜻은 무엇일까요?`
          : `“${item.meaning}”${type === 'write' ? '에 맞는 영단어를 써 보세요.' : '에 맞는 영단어를 고르세요.'}`,
        answer,
        explanation: `${item.word} = ${item.meaning} (${unit.partOfSpeech}). 예: ${item.example} — ${item.exampleMeaning}`,
        ...(type === 'write' ? {} : { options }),
      };
    })
  );
  return {
    id: `vocabulary-${unit.id}`,
    kind: 'vocabulary',
    chapter: 0,
    title: unit.title,
    scene: '먼저 단어와 뜻을 만나고, 두 가지 선택 게임을 거쳐 직접 써 봐요.',
    grammar: '영단어의 뜻을 고른 뒤, 뜻에 맞는 영단어를 골라요. 두 번 만난 단어만 직접 입력해요. 예문은 쓰임을 보여 주는 참고이며 문장 전체를 입력하지 않아요.',
    examples: unit.words.map((item, index) => ({
      sentence: item.word,
      meaning: item.meaning,
      distractors: [unit.words[(index + 1) % unit.words.length].word, unit.words[(index + 2) % unit.words.length].word],
      note: `${unit.partOfSpeech} · ${item.example} — ${item.exampleMeaning}`,
    })),
    exercises,
  };
}

export const VOCABULARY_LESSONS = VOCABULARY_UNITS.map(createVocabularyLesson);
