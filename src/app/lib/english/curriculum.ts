export type Exercise = {
  id: string;
  type: 'choice' | 'order' | 'write';
  prompt: string;
  answer: string;
  explanation: string;
  options?: string[];
  tiles?: string[];
  acceptableAnswers?: string[];
  passage?: string;
};

export type EnglishLesson = {
  id: string;
  title: string;
  scene: string;
  grammar: string;
  exercises: Exercise[];
};

export const ENGLISH_LESSONS: EnglishLesson[] = [
  {
    id: 'hello',
    title: '첫 인사',
    scene: '모험을 떠나기 전, 내 기분을 말해 보세요.',
    grammar: 'I am은 “나는 ~야”라는 뜻이에요. I 뒤에는 am을 써요.',
    exercises: [
      { id: 'hello-1', type: 'choice', prompt: '“나는 학생이야.”', answer: 'I am a student.', options: ['I are a student.', 'I am a student.', 'I is student.'], explanation: 'I와 함께 쓰는 be동사는 am이에요. student 앞에는 a도 필요해요.' },
      { id: 'hello-2', type: 'order', prompt: '“나는 행복해.”', answer: 'I am happy.', tiles: ['happy.', 'am', 'I'], explanation: '주어 I 다음에 am, 그 뒤에 기분 happy를 놓아요.' },
      { id: 'hello-3', type: 'write', prompt: '“나는 준비됐어.”를 영어로 써 보세요.', answer: 'I am ready', acceptableAnswers: ["I'm ready"], explanation: 'I am ready는 “나는 준비됐어”예요. I’m은 I am의 줄임말이에요.' },
    ],
  },
  {
    id: 'people',
    title: '친구 만나기',
    scene: '새 친구를 소개하고 안부를 물어요.',
    grammar: 'he는 남자 한 명, she는 여자 한 명을 가리켜요. he/she 뒤에는 is를 써요.',
    exercises: [
      { id: 'people-1', type: 'choice', prompt: '“그는 친절해.”', answer: 'He is kind.', options: ['He am kind.', 'He is kind.', 'He are kind.'], explanation: 'he 뒤에는 is를 써요. kind는 “친절한”이라는 뜻이에요.' },
      { id: 'people-2', type: 'order', prompt: '“그녀는 내 친구야.”', answer: 'She is my friend.', tiles: ['my', 'She', 'friend.', 'is'], explanation: 'She is로 시작하고, my friend는 “내 친구”예요.' },
      { id: 'people-3', type: 'write', prompt: '“너 괜찮아?”를 영어로 써 보세요.', answer: 'Are you okay', acceptableAnswers: ['Are you ok'], explanation: '질문에서는 Are를 앞으로 보내요. Are you okay?는 “너 괜찮아?”예요.' },
    ],
  },
  {
    id: 'things',
    title: '마법 가방 찾기',
    scene: '가방 안에 든 물건을 영어로 불러요.',
    grammar: '하나의 물건 앞에는 a 또는 an을 붙여요. 모음 소리로 시작하면 보통 an을 써요.',
    exercises: [
      { id: 'things-1', type: 'choice', prompt: '“사과 하나”에 맞는 표현은?', answer: 'an apple', options: ['a apple', 'an apple', 'apple an'], explanation: 'apple은 모음 소리로 시작해서 an apple이라고 해요.' },
      { id: 'things-2', type: 'order', prompt: '“나는 펜이 하나 있어.”', answer: 'I have a pen.', tiles: ['a', 'pen.', 'I', 'have'], explanation: 'I have는 “나는 가지고 있어”, a pen은 “펜 하나”예요.' },
      { id: 'things-3', type: 'write', prompt: '“그것은 우산이야.”를 영어로 써 보세요.', answer: 'It is an umbrella', acceptableAnswers: ["It's an umbrella"], explanation: 'It is an umbrella에서 umbrella 앞에는 an을 붙여요.' },
    ],
  },
  {
    id: 'cafe',
    title: '카페 주문하기',
    scene: '카페에서 먹고 싶은 것을 주문해요.',
    grammar: 'I want는 “나는 ~을 원해 / ~하고 싶어”라는 뜻이에요.',
    exercises: [
      { id: 'cafe-1', type: 'choice', prompt: '“나는 물을 원해.”', answer: 'I want water.', options: ['I want water.', 'I wants water.', 'I am want water.'], explanation: 'I 다음에는 want를 그대로 써요. want에는 s를 붙이지 않아요.' },
      { id: 'cafe-2', type: 'order', prompt: '“나는 커피 한 잔을 원해.”', answer: 'I want a coffee.', tiles: ['coffee.', 'I', 'a', 'want'], explanation: 'I want a coffee는 “커피 한 잔 주세요”라고 말할 때도 쓸 수 있어요.' },
      { id: 'cafe-3', type: 'write', prompt: '“나는 빵을 원해.”를 영어로 써 보세요.', answer: 'I want bread', explanation: 'I want bread. 짧게 I want + 원하는 것을 말하면 돼요.' },
    ],
  },
  {
    id: 'reading',
    title: '짧은 이야기 읽기',
    scene: '배운 단어를 모아 미나의 이야기를 읽어요.',
    grammar: '아는 단어를 하나씩 잡으면 짧은 문장도 읽을 수 있어요.',
    exercises: [
      { id: 'reading-1', type: 'choice', prompt: 'Mina는 어떤 사람인가요?', answer: '학생이에요.', options: ['선생님이에요.', '학생이에요.', '요리사예요.'], explanation: 'Mina is a student.에서 student는 “학생”이에요.', passage: 'Mina is a student. She is kind. She has a cat. The cat is small.' },
      { id: 'reading-2', type: 'choice', prompt: '고양이는 어떤가요?', answer: '작아요.', options: ['커요.', '작아요.', '화가 났어요.'], explanation: 'The cat is small.에서 small은 “작은”이라는 뜻이에요.', passage: 'Mina is a student. She is kind. She has a cat. The cat is small.' },
      { id: 'reading-3', type: 'write', prompt: '“미나는 친절해.”를 영어로 써 보세요.', answer: 'Mina is kind', explanation: '이야기의 She is kind를 Mina is kind로 바꾸면 돼요.', passage: 'Mina is a student. She is kind. She has a cat. The cat is small.' },
    ],
  },
];

export function normalizeEnglishAnswer(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[.!?,]/g, '')
    .replace(/\s+/g, ' ');
}
