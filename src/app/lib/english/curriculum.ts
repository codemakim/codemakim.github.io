export type Exercise = {
  id: string;
  practiceKey: string;
  type: 'choice' | 'word-choice' | 'order' | 'listen' | 'write';
  prompt: string;
  answer: string;
  explanation: string;
  options?: string[];
  tiles?: string[];
  acceptableAnswers?: string[];
  passage?: string;
  audioText?: string;
  stage?: 'review' | 'word' | 'sentence' | 'listen' | 'use';
};

type Example = {
  sentence: string;
  meaning: string;
  distractors: [string, string];
  acceptableAnswers?: string[];
  note?: string;
};

export type EnglishLesson = {
  id: string;
  kind: 'sentence' | 'vocabulary' | 'guided';
  chapter: number;
  title: string;
  scene: string;
  grammar: string;
  examples: Example[];
  exercises: Exercise[];
};

export const ENGLISH_CHAPTERS = [
  { id: 1, title: '주어와 be동사 친해지기' },
  { id: 2, title: '아니라고 말하고 질문하기' },
  { id: 3, title: '물건과 내 일상 말하기' },
  { id: 4, title: '배운 문장으로 이야기 읽기' },
];

export const REVIEW_EXPRESSION_COUNT = 4;
export const XP_PER_ANSWER = 10;

type ExampleDefinition = [sentence: string, meaning: string, wrongFirst: string, wrongSecond: string, acceptableAnswers?: string[]];

function createLesson(
  id: string, chapter: number, title: string, scene: string, grammar: string,
  definitions: ExampleDefinition[], passage?: string,
): EnglishLesson {
  const examples = definitions.map(([sentence, meaning, wrongFirst, wrongSecond, acceptableAnswers]): Example => ({
    sentence, meaning, distractors: [wrongFirst, wrongSecond], acceptableAnswers,
  }));
  const exercises = (['choice', 'order', 'write'] as const).flatMap((type) =>
    examples.map((example, index): Exercise => {
      const readingChoice = !!passage && type === 'choice';
      const answer = readingChoice ? example.meaning : example.sentence;
      const options = readingChoice
        ? [examples[(index + 1) % examples.length].meaning, examples[(index + 2) % examples.length].meaning]
        : [...example.distractors];
      options.splice(index % 3, 0, answer);
      return {
        id: `${id}-${index + 1}-${type}`,
        practiceKey: `${id}-${index + 1}`,
        type,
        prompt: readingChoice
          ? `이야기에서 “${example.sentence}”는 무슨 뜻인가요?`
          : `“${example.meaning}”${type === 'write' ? '를 영어로 써 보세요.' : type === 'order' ? ' — 단어를 놓아 문장을 만드세요.' : '에 맞는 문장을 고르세요.'}`,
        answer,
        explanation: `${example.sentence} = ${example.meaning} ${grammar}`,
        ...(type === 'choice' ? { options } : {}),
        ...(type === 'order' ? { tiles: example.sentence.split(' ').reverse() } : {}),
        acceptableAnswers: readingChoice ? undefined : example.acceptableAnswers,
        passage,
      };
    })
  );
  return { id, kind: 'sentence', chapter, title, scene, grammar, examples, exercises };
}

export const ENGLISH_LESSONS: EnglishLesson[] = [
  createLesson('hello', 1, '나는 I am',
    '먼저 나에 대해 말해요. 같은 문장을 고르고, 만들고, 직접 써 봐요.',
    'I는 “나”, am은 I와 짝인 be동사예요. I am 뒤에 기분이나 상태를 놓아요. a student는 “학생 한 명”이에요. I am은 I’m으로 줄일 수 있어요.', [
      ['I am happy.', '나는 행복해.', 'I is happy.', 'I are happy.', ["I’m happy"]],
      ['I am ready.', '나는 준비됐어.', 'I is ready.', 'I are ready.', ["I’m ready"]],
      ['I am okay.', '나는 괜찮아.', 'I are okay.', 'I is okay.', ["I’m okay", 'I am ok', "I’m ok"]],
      ['I am tired.', '나는 피곤해.', 'I is tired.', 'I are tired.', ["I’m tired"]],
      ['I am hungry.', '나는 배고파.', 'I are hungry.', 'I is hungry.', ["I’m hungry"]],
      ['I am a student.', '나는 학생이야.', 'I is a student.', 'I are a student.', ["I’m a student"]],
    ]),
  createLesson('you-are', 1, '너는 You are',
    '이번에는 상대방의 상태를 말해요. 아직 질문으로 바꾸지 않아요.',
    'You는 “너/당신”, you 뒤에는 are를 써요. I am과 You are를 비교해 보세요. kind는 “친절한”이에요. You are는 You’re로 줄일 수 있어요.', [
      ['You are happy.', '너는 행복해.', 'You am happy.', 'You is happy.', ["You’re happy"]],
      ['You are ready.', '너는 준비됐어.', 'You is ready.', 'You am ready.', ["You’re ready"]],
      ['You are okay.', '너는 괜찮아.', 'You am okay.', 'You is okay.', ["You’re okay", 'You are ok', "You’re ok"]],
      ['You are tired.', '너는 피곤해.', 'You is tired.', 'You am tired.', ["You’re tired"]],
      ['You are hungry.', '너는 배고파.', 'You am hungry.', 'You is hungry.', ["You’re hungry"]],
      ['You are kind.', '너는 친절해.', 'You is kind.', 'You am kind.', ["You’re kind"]],
    ]),
  createLesson('people', 1, '그와 그녀는 He is · She is',
    '남자 한 명은 he, 여자 한 명은 she로 가리켜요.',
    'He는 “그”, she는 “그녀”예요. 둘 다 is와 짝이에요. He is / She is로 시작해요. He’s / She’s로 줄여도 돼요.', [
      ['He is kind.', '그는 친절해.', 'He am kind.', 'He are kind.', ["He’s kind"]],
      ['She is kind.', '그녀는 친절해.', 'She are kind.', 'She am kind.', ["She’s kind"]],
      ['He is happy.', '그는 행복해.', 'He are happy.', 'He am happy.', ["He’s happy"]],
      ['She is ready.', '그녀는 준비됐어.', 'She am ready.', 'She are ready.', ["She’s ready"]],
      ['He is tired.', '그는 피곤해.', 'He am tired.', 'He are tired.', ["He’s tired"]],
      ['She is a student.', '그녀는 학생이야.', 'She are a student.', 'She am a student.', ["She’s a student"]],
    ]),
  createLesson('it-is', 1, '그것은 It is',
    '물건 하나나 동물 하나를 가리키며 상태를 말해요.',
    'It은 “그것”이고 is와 짝이에요. small은 작은, big은 큰, new는 새것인, old는 오래된, cold는 차가운, warm은 따뜻한이라는 뜻이에요. It is는 It’s로 줄여요.', [
      ['It is small.', '그것은 작아.', 'It am small.', 'It are small.', ["It’s small"]],
      ['It is big.', '그것은 커.', 'It are big.', 'It am big.', ["It’s big"]],
      ['It is new.', '그것은 새것이야.', 'It am new.', 'It are new.', ["It’s new"]],
      ['It is old.', '그것은 오래됐어.', 'It are old.', 'It am old.', ["It’s old"]],
      ['It is cold.', '그것은 차가워.', 'It am cold.', 'It are cold.', ["It’s cold"]],
      ['It is warm.', '그것은 따뜻해.', 'It are warm.', 'It am warm.', ["It’s warm"]],
    ]),
  createLesson('we-are', 1, '우리는 We are',
    '나를 포함한 여러 사람의 상태를 말해요.',
    'We는 “우리”, we 뒤에는 are를 써요. You are와 We are는 같은 be동사를 써요. We are는 We’re로 줄여요.', [
      ['We are happy.', '우리는 행복해.', 'We am happy.', 'We is happy.', ["We’re happy"]],
      ['We are ready.', '우리는 준비됐어.', 'We is ready.', 'We am ready.', ["We’re ready"]],
      ['We are okay.', '우리는 괜찮아.', 'We am okay.', 'We is okay.', ["We’re okay", 'We are ok', "We’re ok"]],
      ['We are tired.', '우리는 피곤해.', 'We is tired.', 'We am tired.', ["We’re tired"]],
      ['We are hungry.', '우리는 배고파.', 'We am hungry.', 'We is hungry.', ["We’re hungry"]],
      ['We are kind.', '우리는 친절해.', 'We is kind.', 'We am kind.', ["We’re kind"]],
    ]),
  createLesson('they-are', 1, '그들은 They are',
    '여러 사람을 가리키며 앞에서 배운 상태를 다시 말해요.',
    'They는 “그들”, they 뒤에는 are를 써요. 한 명인 he/she는 is, 여러 명인 they는 are예요. They are는 They’re로 줄여요.', [
      ['They are happy.', '그들은 행복해.', 'They am happy.', 'They is happy.', ["They’re happy"]],
      ['They are ready.', '그들은 준비됐어.', 'They is ready.', 'They am ready.', ["They’re ready"]],
      ['They are okay.', '그들은 괜찮아.', 'They am okay.', 'They is okay.', ["They’re okay", 'They are ok', "They’re ok"]],
      ['They are tired.', '그들은 피곤해.', 'They is tired.', 'They am tired.', ["They’re tired"]],
      ['They are hungry.', '그들은 배고파.', 'They am hungry.', 'They is hungry.', ["They’re hungry"]],
      ['They are kind.', '그들은 친절해.', 'They is kind.', 'They am kind.', ["They’re kind"]],
    ]),
  createLesson('be-mix', 1, 'am · is · are 함께 연습',
    '주어가 바뀔 때 be동사도 바꿔 보세요.',
    'I am / He is / She is / It is / You are / We are / They are. 사람 이름 한 명도 is를 써요. Mina is는 “미나는 ~야”예요.', [
      ['I am ready.', '나는 준비됐어.', 'I is ready.', 'I are ready.', ["I’m ready"]],
      ['You are kind.', '너는 친절해.', 'You am kind.', 'You is kind.', ["You’re kind"]],
      ['Mina is happy.', '미나는 행복해.', 'Mina am happy.', 'Mina are happy.'],
      ['It is small.', '그것은 작아.', 'It are small.', 'It am small.', ["It’s small"]],
      ['We are tired.', '우리는 피곤해.', 'We is tired.', 'We am tired.', ["We’re tired"]],
      ['They are hungry.', '그들은 배고파.', 'They am hungry.', 'They is hungry.', ["They’re hungry"]],
    ]),
  createLesson('not-i-you', 2, '나는 아니야 · 너는 아니야',
    '익숙한 I am과 You are에 not 하나를 더해요.',
    '“~하지 않아 / ~이 아니야”는 be동사 바로 뒤에 not을 붙여요. I am not / You are not. You are not은 You aren’t로 줄일 수 있어요.', [
      ['I am not tired.', '나는 피곤하지 않아.', 'I not am tired.', 'I is not tired.', ["I’m not tired"]],
      ['I am not hungry.', '나는 배고프지 않아.', 'I not am hungry.', 'I are not hungry.', ["I’m not hungry"]],
      ['I am not ready.', '나는 준비되지 않았어.', 'I not am ready.', 'I is not ready.', ["I’m not ready"]],
      ['You are not tired.', '너는 피곤하지 않아.', 'You not are tired.', 'You is not tired.', ["You’re not tired", "You aren’t tired"]],
      ['You are not hungry.', '너는 배고프지 않아.', 'You not are hungry.', 'You am not hungry.', ["You’re not hungry", "You aren’t hungry"]],
      ['You are not ready.', '너는 준비되지 않았어.', 'You not are ready.', 'You is not ready.', ["You’re not ready", "You aren’t ready"]],
    ]),
  createLesson('not-is', 2, '그 · 그녀 · 그것은 아니야',
    '이번에는 is 뒤에 not을 붙여 봐요.',
    'He is not / She is not / It is not. is not은 isn’t로 줄일 수 있어요. not의 위치는 주어가 바뀌어도 be동사 바로 뒤예요.', [
      ['He is not tired.', '그는 피곤하지 않아.', 'He not is tired.', 'He are not tired.', ["He’s not tired", "He isn’t tired"]],
      ['She is not hungry.', '그녀는 배고프지 않아.', 'She not is hungry.', 'She am not hungry.', ["She’s not hungry", "She isn’t hungry"]],
      ['He is not ready.', '그는 준비되지 않았어.', 'He not is ready.', 'He am not ready.', ["He’s not ready", "He isn’t ready"]],
      ['She is not happy.', '그녀는 행복하지 않아.', 'She not is happy.', 'She are not happy.', ["She’s not happy", "She isn’t happy"]],
      ['It is not big.', '그것은 크지 않아.', 'It not is big.', 'It are not big.', ["It’s not big", "It isn’t big"]],
      ['It is not cold.', '그것은 차갑지 않아.', 'It not is cold.', 'It am not cold.', ["It’s not cold", "It isn’t cold"]],
    ]),
  createLesson('not-we-they', 2, '우리 · 그들은 아니야',
    '여러 사람의 상태를 부정하며 are를 복습해요.',
    'We are not / They are not. are not은 aren’t로 줄일 수 있어요. We aren’t와 They aren’t도 같은 뜻이에요.', [
      ['We are not tired.', '우리는 피곤하지 않아.', 'We not are tired.', 'We is not tired.', ["We’re not tired", "We aren’t tired"]],
      ['They are not tired.', '그들은 피곤하지 않아.', 'They not are tired.', 'They is not tired.', ["They’re not tired", "They aren’t tired"]],
      ['We are not hungry.', '우리는 배고프지 않아.', 'We not are hungry.', 'We am not hungry.', ["We’re not hungry", "We aren’t hungry"]],
      ['They are not hungry.', '그들은 배고프지 않아.', 'They not are hungry.', 'They am not hungry.', ["They’re not hungry", "They aren’t hungry"]],
      ['We are not ready.', '우리는 준비되지 않았어.', 'We not are ready.', 'We is not ready.', ["We’re not ready", "We aren’t ready"]],
      ['They are not happy.', '그들은 행복하지 않아.', 'They not are happy.', 'They is not happy.', ["They’re not happy", "They aren’t happy"]],
    ]),
  createLesson('ask-you', 2, '이제 물어봐요 Are you ...?',
    'You are okay.를 연습했으니 이제 “너 괜찮아?”라고 물어봐요.',
    'You are okay.는 “너는 괜찮아.”예요. 질문할 때 are를 you 앞으로 옮겨 Are you okay?로 만들어요. 다른 상태도 같은 순서예요.', [
      ['Are you okay?', '너 괜찮아?', 'Is you okay?', 'Am you okay?', ['Are you ok']],
      ['Are you ready?', '너 준비됐어?', 'Is you ready?', 'Am you ready?'],
      ['Are you happy?', '너 행복해?', 'Am you happy?', 'Is you happy?'],
      ['Are you tired?', '너 피곤해?', 'Is you tired?', 'Am you tired?'],
      ['Are you hungry?', '너 배고파?', 'Am you hungry?', 'Is you hungry?'],
      ['Are you kind?', '너 친절해?', 'Is you kind?', 'Am you kind?'],
    ]),
  createLesson('ask-is', 2, 'Is he · Is she · Is it ...?',
    '주어가 he, she, it이어도 질문 원리는 같아요.',
    'He is kind.를 질문으로 바꾸면 Is he kind?예요. She is / It is도 is를 맨 앞으로 옮겨요.', [
      ['Is he kind?', '그는 친절해?', 'Are he kind?', 'Am he kind?'],
      ['Is she kind?', '그녀는 친절해?', 'Are she kind?', 'Am she kind?'],
      ['Is he happy?', '그는 행복해?', 'Am he happy?', 'Are he happy?'],
      ['Is she ready?', '그녀는 준비됐어?', 'Are she ready?', 'Am she ready?'],
      ['Is it small?', '그것은 작아?', 'Are it small?', 'Am it small?'],
      ['Is it cold?', '그것은 차가워?', 'Am it cold?', 'Are it cold?'],
    ]),
  createLesson('ask-we-they', 2, 'Are we · Are they ...?',
    '이번에는 우리와 그들에 대해 질문해요.',
    'We are ready.는 Are we ready?로, They are ready.는 Are they ready?로 바꿔요. are를 주어 앞으로 옮기는 규칙은 같아요.', [
      ['Are we ready?', '우리 준비됐어?', 'Is we ready?', 'Am we ready?'],
      ['Are they ready?', '그들은 준비됐어?', 'Is they ready?', 'Am they ready?'],
      ['Are we okay?', '우리 괜찮아?', 'Am we okay?', 'Is we okay?', ['Are we ok']],
      ['Are they happy?', '그들은 행복해?', 'Is they happy?', 'Am they happy?'],
      ['Are we tired?', '우리 피곤해?', 'Is we tired?', 'Am we tired?'],
      ['Are they hungry?', '그들은 배고파?', 'Am they hungry?', 'Is they hungry?'],
    ]),
  createLesson('ask-i', 2, '나에 대해 묻기 Am I ...?',
    'am도 앞으로 옮겨 질문을 만들어요.',
    'I am ready.를 질문으로 바꾸면 Am I ready?예요. 질문이 되어도 I의 짝은 am이에요. 영어의 I는 문장 중간에서도 대문자로 써요.', [
      ['Am I ready?', '나 준비됐어?', 'Is I ready?', 'Are I ready?'],
      ['Am I okay?', '나 괜찮아?', 'Are I okay?', 'Is I okay?', ['Am I ok']],
      ['Am I hungry?', '나 배고파?', 'Is I hungry?', 'Are I hungry?'],
      ['Am I happy?', '나 행복해?', 'Are I happy?', 'Is I happy?'],
      ['Am I tired?', '나 피곤해?', 'Is I tired?', 'Are I tired?'],
      ['Am I a student?', '나 학생이야?', 'Are I a student?', 'Is I a student?'],
    ]),
  createLesson('things', 3, '물건 하나 a',
    '익숙한 It is 뒤에 물건 이름을 붙여요.',
    '셀 수 있는 물건 하나에는 보통 a를 붙여요. a pen은 펜 하나, a book은 책 한 권, a bag은 가방 하나, a cat은 고양이 한 마리예요. 모음 소리 앞의 an은 다음에 배워요.', [
      ['It is a pen.', '그것은 펜이야.', 'It is pen.', 'It are a pen.', ["It’s a pen"]],
      ['It is a book.', '그것은 책이야.', 'It is book.', 'It am a book.', ["It’s a book"]],
      ['It is a bag.', '그것은 가방이야.', 'It is bag.', 'It are a bag.', ["It’s a bag"]],
      ['It is a cat.', '그것은 고양이야.', 'It is cat.', 'It am a cat.', ["It’s a cat"]],
      ['Is it a pen?', '그것은 펜이야?', 'Are it a pen?', 'Is it pen?'],
      ['It is not a book.', '그것은 책이 아니야.', 'It not is a book.', 'It is not book.', ["It’s not a book", "It isn’t a book"]],
    ]),
  createLesson('things-an', 3, '모음 소리 앞에는 an',
    'a와 an을 비교하며 물건 이름을 더 익혀요.',
    '모음 소리로 시작하는 물건 이름 앞에는 an을 써요. an apple은 사과 하나, an egg는 달걀 하나, an umbrella는 우산 하나예요. 글자가 아니라 첫 소리가 기준이에요.', [
      ['It is an apple.', '그것은 사과야.', 'It is a apple.', 'It are an apple.', ["It’s an apple"]],
      ['It is an egg.', '그것은 달걀이야.', 'It is a egg.', 'It am an egg.', ["It’s an egg"]],
      ['It is an umbrella.', '그것은 우산이야.', 'It is a umbrella.', 'It are an umbrella.', ["It’s an umbrella"]],
      ['Is it an apple?', '그것은 사과야?', 'Is it a apple?', 'Are it an apple?'],
      ['It is not an egg.', '그것은 달걀이 아니야.', 'It is not a egg.', 'It not is an egg.', ["It’s not an egg", "It isn’t an egg"]],
      ['It is a book.', '그것은 책이야.', 'It is an book.', 'It are a book.', ["It’s a book"]],
    ]),
  createLesson('have', 3, '가지고 있어요 have',
    '앞에서 익힌 물건을 가지고 있다고 말해요.',
    'have는 “가지고 있다”라는 동사예요. I/You/We/They 뒤에는 have를 써요. I have a pen처럼 말하며 am/is/are를 함께 넣지 않아요.', [
      ['I have a pen.', '나는 펜이 하나 있어.', 'I am have a pen.', 'I have pen.'],
      ['You have a book.', '너는 책이 한 권 있어.', 'You are have a book.', 'You have book.'],
      ['We have a bag.', '우리는 가방이 하나 있어.', 'We are have a bag.', 'We have bag.'],
      ['They have a cat.', '그들은 고양이가 한 마리 있어.', 'They are have a cat.', 'They have cat.'],
      ['I have an apple.', '나는 사과가 하나 있어.', 'I have a apple.', 'I am have an apple.'],
      ['You have an umbrella.', '너는 우산이 하나 있어.', 'You have a umbrella.', 'You are have an umbrella.'],
    ]),
  createLesson('cafe', 3, '원하는 것 말하기 want',
    '물을 원하거나 커피 한 잔을 원한다고 말해요.',
    'want는 “원하다”예요. I/You/We/They want 뒤에 원하는 것을 놓아요. water는 물, bread는 빵, coffee는 커피예요. 물·빵은 여기서 a 없이, 커피 한 잔은 a coffee라고 해요.', [
      ['I want water.', '나는 물을 원해.', 'I am want water.', 'I wants water.'],
      ['I want bread.', '나는 빵을 원해.', 'I am want bread.', 'I wants bread.'],
      ['I want a coffee.', '나는 커피 한 잔을 원해.', 'I am want a coffee.', 'I wants a coffee.'],
      ['You want water.', '너는 물을 원해.', 'You are want water.', 'You wants water.'],
      ['We want bread.', '우리는 빵을 원해.', 'We are want bread.', 'We wants bread.'],
      ['They want an apple.', '그들은 사과 하나를 원해.', 'They want a apple.', 'They are want an apple.'],
    ]),
  createLesson('like', 3, '좋아하는 것 말하기 like',
    '앞에서 배운 음식과 음료로 취향을 말해요.',
    'like는 “좋아하다”예요. I/You/We/They like 뒤에 좋아하는 것을 놓아요. I am happy처럼 상태를 말할 때와 달리 am/is/are를 넣지 않아요.', [
      ['I like coffee.', '나는 커피를 좋아해.', 'I am like coffee.', 'I likes coffee.'],
      ['I like bread.', '나는 빵을 좋아해.', 'I am like bread.', 'I likes bread.'],
      ['You like coffee.', '너는 커피를 좋아해.', 'You are like coffee.', 'You likes coffee.'],
      ['We like bread.', '우리는 빵을 좋아해.', 'We are like bread.', 'We likes bread.'],
      ['They like coffee.', '그들은 커피를 좋아해.', 'They are like coffee.', 'They likes coffee.'],
      ['They like bread.', '그들은 빵을 좋아해.', 'They are like bread.', 'They likes bread.'],
    ]),
  createLesson('daily-actions', 3, '매일 하는 일',
    '새 동사 세 개로 짧은 일상 문장을 만들어요.',
    'read는 읽다, eat는 먹다, drink는 마시다예요. every day는 “매일”이에요. I/You/We/They 뒤에 동사를 그대로 놓아요. 지금은 평소 하는 일을 말해요.', [
      ['I read every day.', '나는 매일 읽어.', 'I am read every day.', 'I reads every day.'],
      ['You read every day.', '너는 매일 읽어.', 'You are read every day.', 'You reads every day.'],
      ['I eat bread.', '나는 빵을 먹어.', 'I am eat bread.', 'I eats bread.'],
      ['We eat bread.', '우리는 빵을 먹어.', 'We are eat bread.', 'We eats bread.'],
      ['You drink water.', '너는 물을 마셔.', 'You are drink water.', 'You drinks water.'],
      ['They drink water.', '그들은 물을 마셔.', 'They are drink water.', 'They drinks water.'],
    ]),
  createLesson('do-not', 3, '행동을 부정해요 do not',
    'be동사 문장의 not과 일반 동사의 do not을 비교해요.',
    'have/want/like 같은 일반 동사를 부정할 때 I/You/We/They 뒤에 do not을 놓아요. do not은 don’t로 줄여요. I am not tired와 I do not want water의 모양을 비교해 보세요.', [
      ['I do not like coffee.', '나는 커피를 좋아하지 않아.', 'I am not like coffee.', 'I not like coffee.', ["I don’t like coffee"]],
      ['You do not want water.', '너는 물을 원하지 않아.', 'You are not want water.', 'You not want water.', ["You don’t want water"]],
      ['We do not eat bread.', '우리는 빵을 먹지 않아.', 'We are not eat bread.', 'We not eat bread.', ["We don’t eat bread"]],
      ['They do not drink water.', '그들은 물을 마시지 않아.', 'They are not drink water.', 'They not drink water.', ["They don’t drink water"]],
      ['I do not have a pen.', '나는 펜이 없어.', 'I am not have a pen.', 'I not have a pen.', ["I don’t have a pen"]],
      ['We do not read every day.', '우리는 매일 읽지는 않아.', 'We are not read every day.', 'We not read every day.', ["We don’t read every day"]],
    ]),
  createLesson('ask-do', 3, '행동을 물어봐요 Do you ...?',
    '익숙한 like, want, have로 질문해요.',
    '일반 동사 질문은 Do + I/you/we/they + 동사 순서예요. You like coffee.를 Do you like coffee?로 바꿔요. be동사 질문 Are you ready?와 구분해요.', [
      ['Do you like coffee?', '너는 커피를 좋아해?', 'Are you like coffee?', 'Do you likes coffee?'],
      ['Do you want water?', '너는 물을 원해?', 'Are you want water?', 'Do you wants water?'],
      ['Do you have a book?', '너는 책이 한 권 있어?', 'Are you have a book?', 'Do you have book?'],
      ['Do we eat bread?', '우리는 빵을 먹어?', 'Are we eat bread?', 'Do we eats bread?'],
      ['Do they drink water?', '그들은 물을 마셔?', 'Are they drink water?', 'Do they drinks water?'],
      ['Do I read every day?', '나는 매일 읽어?', 'Am I read every day?', 'Do I reads every day?'],
    ]),
  createLesson('reading', 4, '미나의 이야기',
    '새 문법 없이 앞에서 배운 표현으로 이야기를 읽어요.',
    'Mina 한 명은 is, 미나를 가리키는 she도 is예요. I와 함께 쓰는 have/like와 be동사를 구분하며 읽어요.', [
      ['Mina is happy.', '미나는 행복해.', 'Mina are happy.', 'Mina am happy.'],
      ['She is a student.', '그녀는 학생이야.', 'She are a student.', 'She am a student.', ["She’s a student"]],
      ['She is kind.', '그녀는 친절해.', 'She am kind.', 'She are kind.', ["She’s kind"]],
      ['I am a student.', '나는 학생이야.', 'I is a student.', 'I are a student.', ["I’m a student"]],
      ['I have a cat.', '나는 고양이가 한 마리 있어.', 'I am have a cat.', 'I have cat.'],
      ['I like coffee.', '나는 커피를 좋아해.', 'I am like coffee.', 'I likes coffee.'],
    ], 'Mina is happy. She is a student. She is kind. I am a student. I have a cat. I like coffee.'),
  createLesson('reading-day', 4, '우리의 하루',
    '상태, 행동, 부정문, 질문을 한 이야기에서 다시 만나요.',
    'We/They는 are, 일반 동사는 eat/drink처럼 그대로 써요. be동사 질문은 Are you, 일반 동사 질문은 Do you로 시작해요.', [
      ['We are ready.', '우리는 준비됐어.', 'We is ready.', 'We am ready.', ["We’re ready"]],
      ['They are hungry.', '그들은 배고파.', 'They is hungry.', 'They am hungry.', ["They’re hungry"]],
      ['We eat bread.', '우리는 빵을 먹어.', 'We are eat bread.', 'We eats bread.'],
      ['They drink water.', '그들은 물을 마셔.', 'They are drink water.', 'They drinks water.'],
      ['I do not like coffee.', '나는 커피를 좋아하지 않아.', 'I am not like coffee.', 'I not like coffee.', ["I don’t like coffee"]],
      ['Do you want water?', '너는 물을 원해?', 'Are you want water?', 'Do you wants water?'],
    ], 'We are ready. They are hungry. We eat bread. They drink water. I do not like coffee. Do you want water?'),
];

export function normalizeEnglishAnswer(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[’‘]/g, "'")
    .replace(/[.!?,]/g, '')
    .replace(/\s+/g, ' ');
}

export function sameAnswer(value: string, exercise: Exercise): boolean {
  const answer = normalizeEnglishAnswer(value);
  return [exercise.answer, ...(exercise.acceptableAnswers ?? [])]
    .some((item) => normalizeEnglishAnswer(item) === answer);
}

export function mix<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function buildReviewQuestions(pool: Exercise[], wrongIds: string[]): Exercise[] {
  const wrong = new Set(wrongIds);
  const uniquePool = [...new Map(pool.map((exercise) => [`${exercise.practiceKey}:${exercise.type}`, exercise])).values()];
  const keys = mix([...new Set(uniquePool.map((exercise) => exercise.practiceKey))]);
  const wrongKeys = new Set(pool.filter((exercise) => wrong.has(exercise.id)).map((exercise) => exercise.practiceKey));
  const selected = [...keys.filter((key) => wrongKeys.has(key)), ...keys.filter((key) => !wrongKeys.has(key))]
    .slice(0, REVIEW_EXPRESSION_COUNT);
  return (['choice', 'word-choice', 'order', 'listen', 'write'] as const).flatMap((type) =>
    selected.flatMap((key) => uniquePool.filter((exercise) => exercise.practiceKey === key && exercise.type === type))
  );
}

export function getMistakeQuestions(questions: Exercise[], wrongIds: string[]): Exercise[] {
  const wrong = new Set(wrongIds);
  const keys = new Set(questions.filter((item) => wrong.has(item.id)).map((item) => item.practiceKey));
  return questions.filter((item) => keys.has(item.practiceKey));
}

export function getCompletedLessonIds(records: {
  activity_type: 'lesson' | 'review';
  lesson_id: string | null;
  question_count: number;
}[], lessons: EnglishLesson[] = ENGLISH_LESSONS): Set<string> {
  return new Set(lessons.filter((lesson) => records.some((record) =>
    record.activity_type === 'lesson' && record.lesson_id === lesson.id && record.question_count >= lesson.exercises.length
  )).map((lesson) => lesson.id));
}
