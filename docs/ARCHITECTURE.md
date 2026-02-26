# 프로젝트 아키텍처

## 프로젝트 개요

Next.js 16 기반 개발 블로그 + 습관 관리 통합 플랫폼

- **블로그**: Contentlayer2 + MDX, 정적 빌드 (GitHub Pages)
- **습관 관리**: Supabase (Auth + Database), 클라이언트 사이드 인증
- **스타일링**: Tailwind CSS 4, 다크모드 지원, 모바일 우선 반응형

## 디렉토리 구조

```
src/app/
├── components/
│   ├── auth/              # 인증 관련 컴포넌트
│   │   ├── AuthProvider.tsx      # 전역 인증 상태 관리
│   │   ├── ProtectedRoute.tsx    # 보호된 라우트
│   │   └── OAuthButton.tsx       # 소셜 로그인 버튼
│   │
│   ├── habits/             # 습관 관리 컴포넌트
│   │   ├── HabitsProvider.tsx    # 전역 습관 캐시 관리 (핵심)
│   │   ├── useHabits.ts          # 오늘 습관 필터링 훅
│   │   ├── HabitCard.tsx          # 습관 카드 (목록)
│   │   ├── PastHabitCard.tsx      # 과거 습관 카드 (아카이브)
│   │   ├── HabitStats.tsx          # 통계 표시
│   │   ├── HabitCalendar.tsx      # 개별 습관 달력
│   │   ├── OverallCalendar.tsx    # 종합 달력 (모든 습관)
│   │   ├── PageHeader.tsx          # 재사용 가능한 헤더
│   │   └── types.ts                # 타입 정의
│   │
│   └── games/              # 게임 코너 컴포넌트
│       ├── GameCard.tsx           # 게임 선택 카드
│       ├── GameLayout.tsx         # 게임 공통 레이아웃
│       ├── useGameAudio.ts        # Web Audio API 효과음 훅
│       ├── thumbnails/            # 게임 썸네일 (SVG 기반)
│       └── spire/                 # 미니 스파이어 UI 컴포넌트
│           ├── BattleScene.tsx    # 전투 화면
│           ├── MapScene.tsx       # 맵 화면
│           ├── RewardScene.tsx    # 보상 화면
│           ├── RestScene.tsx      # 휴식 화면
│           ├── CardComponent.tsx  # 카드 UI
│           ├── EnemyComponent.tsx # 적 렌더링
│           ├── PlayerComponent.tsx# 플레이어 렌더링
│           ├── HandArea.tsx       # 손패 영역
│           ├── BuffIcon.tsx       # 버프/디버프 아이콘
│           ├── RelicBar.tsx       # 유물 표시
│           └── svg/               # 캐릭터 SVG (추후 이미지 교체 가능)
│
├── habits/                 # 습관 관리 페이지
│   ├── page.tsx            # 메인 목록 (오늘 습관)
│   ├── archive/page.tsx    # 전체 습관 목록 (아카이브)
│   ├── create/page.tsx     # 습관 생성
│   ├── edit/page.tsx       # 습관 수정
│   └── detail/page.tsx     # 습관 상세
│
├── games/                  # 게임 코너 페이지
│   ├── page.tsx            # 게임 목록
│   ├── 2048/page.tsx       # 2048 게임
│   ├── snake/page.tsx      # 스네이크 게임
│   ├── minesweeper/page.tsx # 지뢰찾기 게임
│   ├── memory/page.tsx     # 메모리 카드 게임
│   ├── block-drop/page.tsx # 블록 드롭 게임
│   └── spire/page.tsx      # 미니 스파이어 게임
│
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── dateUtils.ts        # 날짜 유틸리티 (YYYY-MM-DD 처리)
│   ├── constants/
│   │   └── habits.ts       # 습관 관련 상수 (색상, 요일)
│   ├── utils/
│   │   └── habitStats.ts   # 통계 계산 유틸리티
│   └── games/
│       ├── types.ts        # 게임 공통 타입
│       ├── constants.ts    # 게임 메타 정보 상수
│       └── spire/              # 미니 스파이어 게임 로직
│           ├── types.ts        # 모든 타입 정의
│           ├── cards.ts        # 카드 데이터 (확장 지점)
│           ├── enemies.ts      # 적 데이터 (확장 지점)
│           ├── relics.ts       # 유물 데이터 (확장 지점)
│           ├── combat.ts       # 전투 계산 유틸 + 공통 랜덤 유틸
│           ├── ai.ts           # 적 AI (패턴 선택)
│           ├── mapGen.ts       # 맵 생성 알고리즘
│           ├── battleLogic.ts  # 전투 초기화·카드 효과·적 턴 처리
│           ├── rewardLogic.ts  # 보상 생성·수집 완료 처리
│           ├── saveUtils.ts    # 베스트 기록·런 직렬화/저장
│           └── gameState.ts    # 얇은 조율자: reducer + useSpireGame hook
│
└── styles/                 # CSS 모듈
    ├── base.css            # 기본 스타일 + 배경
    ├── components.css      # 컴포넌트 스타일
    ├── mobile.css          # 모바일 최적화
    └── design.css          # 디자인 시스템
```

## 데이터 흐름

### 습관 데이터 흐름

```
HabitsProvider (전역 캐시)
  ↓ fetchAllHabits() - 초기 로드 시 1회만
  ↓ Map<string, Habit> (메모리 캐시)
  ↓
useHabits (오늘 습관 필터링)
  ↓ habitsCache.values() → 필터링 (요일, 날짜)
  ↓ habit_records 패칭 (오늘 완료 기록)
  ↓ HabitWithCompletion[] 반환
  ↓
컴포넌트 (HabitCard, HabitList 등)
```

### 캐시 전략

**HabitsProvider 캐시:**

- **저장**: `Map<string, Habit>` (habitId → Habit)
- **초기 로드**: `fetchAllHabits()` - 사용자의 모든 습관 (과거 포함)
- **캐시 갱신**: CRUD 작업 시 자동 업데이트
  - 생성: `addHabit()` → 캐시에 추가
  - 수정: `updateHabit()` → 캐시 업데이트
  - 삭제: `removeHabit()` → 캐시에서 제거
- **캐시 조회**: `getHabit(habitId)` - 캐시에서 먼저 확인
- **폴백**: `fetchHabit(habitId)` - 캐시 없으면 DB 조회 후 캐시 저장

**habit_records 캐싱:**

- 캐싱하지 않음 (각 컴포넌트에서 필요 시 패칭)
- 통계 계산 시에만 패칭 (HabitStats, PastHabitCard)

### 인증 흐름

```
AuthProvider (전역 인증 상태)
  ↓ Supabase Auth 세션 관리
  ↓ user, session 상태
  ↓
ProtectedRoute (보호된 라우트)
  ↓ 인증 체크
  ↓ 미인증 → /auth/login 리다이렉트
  ↓
습관 관리 페이지
```

## 주요 패턴

### 1. HabitsProvider 캐시 패턴

**목적**: 중복 DB 조회 방지, 즉시 UI 업데이트

**사용법**:

```typescript
// 컴포넌트에서
const { habits, getHabit, fetchHabit } = useHabitsContext();

// 캐시에서 먼저 확인
const habit = getHabit(habitId);
if (!habit) {
  // 없으면 패칭 (자동으로 캐시에 저장됨)
  await fetchHabit(habitId);
}
```

**주의사항**:

- 습관 데이터는 HabitsProvider 캐시에서만 가져오기
- 직접 `supabase.from('habits')` 호출 금지
- CRUD 작업 후 캐시 자동 업데이트 확인

### 2. 날짜 처리 패턴

**문제**: 타임존 이슈 방지

**해결책**: 날짜 문자열(YYYY-MM-DD) 직접 사용

```typescript
import { formatDateToYYYYMMDD, compareDateStrings } from "@/app/lib/dateUtils";

// Date → 문자열
const todayStr = formatDateToYYYYMMDD(new Date());

// 날짜 비교
if (compareDateStrings(habit.start_date, todayStr) <= 0) {
  // 시작일이 오늘 이전/같음
}
```

**금지사항**:

- `new Date(dateStr)` 직접 비교 (타임존 문제)
- `Date` 객체로 날짜 비교 (타임존 문제)

### 3. 오늘 습관 필터링 패턴

**조건** (모두 만족해야 함):

1. 오늘 요일이 `habit.weekdays`에 포함
2. `start_date <= 오늘`
3. `end_date >= 오늘`

**구현** (`useHabits.ts`):

```typescript
const todayHabits = allHabits.filter((habit) => {
  return (
    habit.weekdays.includes(todayWeekday) &&
    compareDateStrings(habit.start_date, todayStr) <= 0 &&
    compareDateStrings(habit.end_date, todayStr) >= 0
  );
});
```

### 4. 통계 계산 패턴

**유틸리티**: `lib/utils/habitStats.ts`

**사용법**:

```typescript
import { calculateHabitStats } from "@/app/lib/utils/habitStats";

const stats = calculateHabitStats(habit, records, includeCurrentStreak);
// { totalDays, completedDays, completionRate, maxStreak, currentStreak? }
```

**주의사항**:

- `habit_records`는 컴포넌트에서 패칭
- 통계 계산은 클라이언트 사이드에서 수행

## 핵심 파일

### `components/habits/HabitsProvider.tsx`

- **역할**: 전역 습관 캐시 관리
- **상태**: `Map<string, Habit>`
- **메서드**: `fetchAllHabits`, `getHabit`, `fetchHabit`, `addHabit`, `updateHabit`, `removeHabit`
- **중요**: 모든 습관 데이터의 단일 소스

### `components/habits/useHabits.ts`

- **역할**: 오늘 수행할 습관 필터링 및 완료 기록 관리
- **의존성**: `HabitsProvider` 캐시
- **반환**: `HabitWithCompletion[]` (완료 여부 포함)

### `lib/dateUtils.ts`

- **역할**: 날짜 문자열 처리 (타임존 문제 방지)
- **함수**: `formatDateToYYYYMMDD`, `parseYYYYMMDD`, `compareDateStrings`, `formatDateKorean`

### `lib/utils/habitStats.ts`

- **역할**: 통계 계산 유틸리티
- **함수**: `calculateHabitStats`, `calculateTotalDays`, `calculateMaxStreak` 등

## 자주 수정되는 파일

### 습관 관련

- `habits/page.tsx`: 메인 목록 페이지 (오늘 습관 필터링 로직)
- `habits/archive/page.tsx`: 전체 습관 목록 (아카이브)
- `components/habits/HabitCard.tsx`: 습관 카드 UI

### 스타일링

- `styles/base.css`: 기본 스타일, 배경 그라데이션
- `styles/components.css`: 컴포넌트 스타일
- `styles/mobile.css`: 모바일 최적화

**주의사항**:

- 스타일 수정 시 다크모드 클래스(`dark:`) 필수 확인
- 모바일 반응형 확인 (`md:` 브레이크포인트)

## 기술 스택

- **프레임워크**: Next.js 16 (App Router), React 19
- **언어**: TypeScript (엄격 모드)
- **스타일링**: Tailwind CSS 4
- **백엔드**: Supabase (Auth + PostgreSQL)
- **블로그**: Contentlayer2 + MDX
- **배포**: GitHub Pages (정적 빌드, `output: 'export'`)

## 제약사항

### 정적 빌드 제약

- `output: 'export'` 사용 중
- Next.js Middleware 사용 불가
- 서버 사이드 인증 체크 불가
- **해결책**: 클라이언트 사이드 인증 + Supabase RLS

### 날짜 처리 제약

- 타임존 문제 방지를 위해 날짜 문자열(YYYY-MM-DD) 직접 사용
- `Date` 객체 비교 금지

### 캐싱 제약

- HabitsProvider는 메모리 캐시 (페이지 새로고침 시 초기화)
- `habit_records`는 캐싱하지 않음 (통계 계산 시에만 패칭)
