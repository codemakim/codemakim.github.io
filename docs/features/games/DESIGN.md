# 게임 코너 설계 문서

> **참고**:
>
> - 프로젝트 아키텍처: `docs/ARCHITECTURE.md`
> - 디자인 시스템: `src/app/styles/design.css`
> - 프로젝트 로드맵: `docs/ROADMAP.md`

## 1. 프로젝트 개요

### 1.1 목표

블로그 플랫폼에 **게임 코너** 메뉴를 추가하여, 방문자가 로그인 없이 간단한 웹 게임을 즐길 수 있도록 한다.

### 1.2 핵심 원칙

- **외부 에셋 없이 구현**: CSS/Canvas/SVG/Web Audio API만 사용
- **로그인 불필요**: Phase 1에서는 점수를 localStorage에 저장
- **모바일/데스크톱 모두 지원**: 터치 제스처 + 키보드 조작
- **프로젝트 디자인 시스템 준수**: `design.css`의 CSS 변수 및 컴포넌트 클래스 활용
- **정적 빌드 호환**: `output: 'export'` 환경에서 동작

### 1.3 게임 목록 (5종)

| #   | 게임명      | 설명                                          | 렌더링         |
| --- | ----------- | --------------------------------------------- | -------------- |
| 1   | 2048        | 숫자 타일 슬라이딩 퍼즐                       | CSS Grid       |
| 2   | 스네이크    | 먹이를 먹으며 길어지는 뱀                     | Canvas         |
| 3   | 지뢰찾기    | 지뢰를 피해 모든 칸 열기                      | CSS Grid + SVG |
| 4   | 메모리 카드 | 같은 쌍의 카드 찾기                           | CSS 3D Flip    |
| 5   | 블록 드롭   | 떨어지는 블록으로 줄 채우기 (테트리스 메카닉) | Canvas         |

## 2. 랜딩 페이지 레이아웃 변경

### 2.1 현재 상태

**파일**: `src/app/page.tsx`

```tsx
<FeatureTiles className="mb-12">
  <FeatureTile
    href="/blog"
    title="블로그"
    description="웹 개발과 기술 이야기"
    actionText="모든 포스트 보기"
    colSpan="md:col-span-2" // ← 2칸 차지 (제거 필요)
    minHeight="min-h-[200px]"
    padding="p-8"
    titleSize="text-3xl"
  />
  <FeatureTile
    href="/habits"
    title="매일두잇"
    actionText="습관 만들기 시작하기"
    minHeight="min-h-[200px]"
    padding="p-6"
    titleSize="text-2xl"
  />
</FeatureTiles>
```

**파일**: `src/app/components/FeatureTiles.tsx`

```tsx
gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // ← 변경 필요
```

### 2.2 변경 후

**`src/app/components/FeatureTiles.tsx`** 변경:

```tsx
gridCols = "grid-cols-1 md:grid-cols-2"; // lg:grid-cols-3 제거
```

**`src/app/page.tsx`** 변경:

```tsx
<FeatureTiles className="mb-12">
  <FeatureTile
    href="/blog"
    title="블로그"
    description="웹 개발과 기술 이야기"
    actionText="모든 포스트 보기"
    minHeight="min-h-[200px]"
    padding="p-6"
    titleSize="text-2xl"
  />
  <FeatureTile
    href="/habits"
    title="매일두잇"
    actionText="습관 만들기 시작하기"
    minHeight="min-h-[200px]"
    padding="p-6"
    titleSize="text-2xl"
  />
  <FeatureTile
    href="/games"
    title="게임 코너"
    description="간단한 웹 게임 모음"
    actionText="게임 하러 가기"
    minHeight="min-h-[200px]"
    padding="p-6"
    titleSize="text-2xl"
  />
</FeatureTiles>
```

**변경 요약**:

- 블로그 `colSpan="md:col-span-2"` 제거 → 모든 타일 동일 크기 (1칸)
- 블로그 `padding="p-8"` → `"p-6"`, `titleSize="text-3xl"` → `"text-2xl"` (통일)
- 게임 코너 FeatureTile 추가
- FeatureTiles 기본 그리드: `grid-cols-1 md:grid-cols-2`
- HeroSection description: `"블로그, 습관 관리, 그리고 더 많은 것들"` 유지

**결과 레이아웃**:

```
모바일 (1열):           데스크톱 (2열):
┌────────────┐         ┌──────────┬──────────┐
│   블로그    │         │  블로그   │ 매일두잇  │
├────────────┤         ├──────────┼──────────┤
│  매일두잇   │         │ 게임코너  │          │
├────────────┤         └──────────┴──────────┘
│  게임코너   │
└────────────┘
```

## 3. 게임 목록 페이지 (`/games`)

### 3.1 페이지 구조

**파일**: `src/app/games/page.tsx` (서버 컴포넌트)

```tsx
import Link from "next/link";
import PageHeader from "@/app/components/habits/PageHeader";
import GameCard from "@/app/components/games/GameCard";
import { GAMES } from "@/app/lib/games/constants";

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader subtitle="간단한 웹 게임 모음" />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### 3.2 반응형 레이아웃

- **모바일** (`< 768px`): `grid-cols-2` → 한 행에 2개
- **데스크톱** (`≥ 768px`): `grid-cols-4` → 한 행에 4개

### 3.3 GameCard 컴포넌트

**파일**: `src/app/components/games/GameCard.tsx`

```tsx
import Link from "next/link";
import type { GameInfo } from "@/app/lib/games/types";

interface GameCardProps {
  game: GameInfo;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={game.href} className="card group">
      {/* 썸네일 영역 - 게임별 CSS/SVG 미니 프리뷰 */}
      <div
        className="aspect-square flex items-center justify-center p-4 
                      bg-zinc-50 dark:bg-zinc-900 rounded-t-[1rem]"
      >
        <game.thumbnail />
      </div>
      {/* 정보 영역 */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
          {game.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {game.description}
        </p>
      </div>
    </Link>
  );
}
```

### 3.4 게임 썸네일

각 게임의 썸네일은 React 컴포넌트로 구현한다. 외부 이미지 없이 SVG/CSS로 미니 프리뷰를 만든다.

**파일**: `src/app/components/games/thumbnails/` 디렉토리

| 게임        | 썸네일 컴포넌트            | 내용                               |
| ----------- | -------------------------- | ---------------------------------- |
| 2048        | `Thumbnail2048.tsx`        | 4x4 그리드에 숫자 타일 몇 개 (SVG) |
| 스네이크    | `ThumbnailSnake.tsx`       | 초록 사각형 뱀 + 빨간 사과 (SVG)   |
| 지뢰찾기    | `ThumbnailMinesweeper.tsx` | 격자 + 깃발 + 폭탄 아이콘 (SVG)    |
| 메모리 카드 | `ThumbnailMemory.tsx`      | 뒤집힌 카드 몇 장 + 이모지 (SVG)   |
| 블록 드롭   | `ThumbnailBlockDrop.tsx`   | 떨어지는 블록들 (SVG)              |

각 썸네일은 `<svg>` 또는 `<div>` 기반으로, `className="w-full h-full"` 적용한다.

## 4. 게임 공통 컴포넌트

### 4.1 GameLayout

모든 게임 페이지가 공유하는 레이아웃.

**파일**: `src/app/components/games/GameLayout.tsx` (`"use client"`)

```tsx
interface GameLayoutProps {
  title: string;
  children: React.ReactNode;
  score?: number;
  bestScore?: number;
  onRestart?: () => void;
  controls?: React.ReactNode; // 난이도 선택 등 게임별 추가 컨트롤
}
```

**구조**:

```
┌─────────────────────────────────┐
│ PageHeader (subtitle: 게임명)    │ ← 홈(/) 링크 포함
├─────────────────────────────────┤
│ 스코어바                         │ ← 점수 | 최고점수 | 재시작 버튼
├─────────────────────────────────┤
│ {controls}                      │ ← 난이도 선택 등 (선택)
├─────────────────────────────────┤
│ {children}                      │ ← 게임 보드
└─────────────────────────────────┘
```

**스코어바 디자인**:

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex gap-4">
    <div className="card-content px-4 py-2 text-center">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">점수</div>
      <div className="text-lg font-bold text-zinc-900 dark:text-white">
        {score}
      </div>
    </div>
    <div className="card-content px-4 py-2 text-center">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">최고</div>
      <div className="text-lg font-bold text-zinc-900 dark:text-white">
        {bestScore}
      </div>
    </div>
  </div>
  <button onClick={onRestart} className="btn-primary text-sm px-4 py-2">
    다시 시작
  </button>
</div>
```

**점수 저장 (localStorage)**:

```typescript
const STORAGE_KEY = `game_best_${gameId}`;

function getBestScore(gameId: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

function saveBestScore(gameId: string, score: number): void {
  const current = getBestScore(gameId);
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, String(score));
  }
}
```

### 4.2 useGameAudio 훅

Web Audio API로 효과음을 프로그래밍 생성하는 훅.

**파일**: `src/app/components/games/useGameAudio.ts`

```typescript
"use client";

import { useCallback, useRef } from "react";

export function useGameAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return ctxRef.current;
  }, []);

  // 짧은 비프음 (점수 획득, 타일 합치기 등)
  const playBeep = useCallback(
    (frequency = 440, duration = 0.1) => {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [getContext],
  );

  // 성공음 (줄 완성, 게임 승리 등)
  const playSuccess = useCallback(() => {
    const ctx = getContext();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const startTime = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }, [getContext]);

  // 실패음 (게임 오버, 폭발 등)
  const playFail = useCallback(() => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 200;
    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }, [getContext]);

  return { playBeep, playSuccess, playFail };
}
```

## 5. 각 게임 상세 스펙

### 5.1 2048

**파일**: `src/app/games/2048/page.tsx` (`"use client"`)

**게임 규칙**:

1. 4x4 그리드에서 시작. 초기 타일 2개 (값: 2 또는 4)
2. 방향키/스와이프로 모든 타일을 한 방향으로 이동
3. 같은 숫자 타일이 만나면 합쳐짐 (2+2=4, 4+4=8, ...)
4. 이동 후 빈 칸에 새 타일 생성 (90% 확률 2, 10% 확률 4)
5. 2048 타일 만들면 승리, 더 이상 이동 불가하면 게임 오버

**점수 계산**: 타일 합칠 때마다 합쳐진 값만큼 점수 추가

**조작**:

| 플랫폼   | 조작                   |
| -------- | ---------------------- |
| 데스크톱 | 방향키 (←↑→↓)          |
| 모바일   | 스와이프 (좌/상/우/하) |

**렌더링**: CSS Grid

```tsx
<div className="grid grid-cols-4 gap-2 p-2 card-content aspect-square max-w-[400px] mx-auto">
  {board.map((row, r) =>
    row.map((value, c) => (
      <div
        key={`${r}-${c}`}
        className={`
        rounded-lg flex items-center justify-center font-bold
        transition-all duration-150
        ${getTileColor(value)}
        ${getTileTextSize(value)}
      `}
      >
        {value > 0 ? value : ""}
      </div>
    )),
  )}
</div>
```

**타일 색상 (프로젝트 디자인 시스템과 조화)**:

```typescript
function getTileColor(value: number): string {
  const colors: Record<number, string> = {
    0: "bg-zinc-100 dark:bg-zinc-800",
    2: "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white",
    4: "bg-zinc-300 dark:bg-zinc-600 text-zinc-900 dark:text-white",
    8: "bg-amber-200 dark:bg-amber-700 text-zinc-900 dark:text-white",
    16: "bg-amber-300 dark:bg-amber-600 text-zinc-900 dark:text-white",
    32: "bg-orange-300 dark:bg-orange-600 text-white",
    64: "bg-orange-400 dark:bg-orange-500 text-white",
    128: "bg-yellow-300 dark:bg-yellow-600 text-zinc-900 dark:text-white",
    256: "bg-yellow-400 dark:bg-yellow-500 text-zinc-900 dark:text-white",
    512: "bg-green-400 dark:bg-green-600 text-white",
    1024: "bg-blue-400 dark:bg-blue-600 text-white",
    2048: "bg-purple-500 dark:bg-purple-600 text-white",
  };
  return colors[value] || "bg-purple-600 dark:bg-purple-500 text-white";
}
```

**스와이프 감지**:

```typescript
let touchStartX = 0,
  touchStartY = 0;

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const minSwipe = 30;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
    dx > 0 ? moveRight() : moveLeft();
  } else if (Math.abs(dy) > minSwipe) {
    dy > 0 ? moveDown() : moveUp();
  }
}
```

**핵심 로직 (이동 알고리즘)**:

```typescript
// 한 행/열을 한 방향으로 이동+병합하는 함수
function slideAndMerge(line: number[]): { result: number[]; score: number } {
  // 1. 0 제거
  const filtered = line.filter((v) => v !== 0);
  let score = 0;
  const merged: number[] = [];

  // 2. 같은 값 병합
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }

  // 3. 빈 칸 채우기
  while (merged.length < 4) merged.push(0);

  return { result: merged, score };
}
```

---

### 5.2 스네이크

**파일**: `src/app/games/snake/page.tsx` (`"use client"`)

**게임 규칙**:

1. 뱀은 매 프레임마다 한 칸씩 현재 방향으로 이동
2. 먹이를 먹으면 몸이 1칸 길어지고 점수 +10
3. 벽 또는 자기 몸에 부딪히면 게임 오버
4. 시간이 지남에 따라 속도 증가 (선택)

**보드 크기**: 20x20 (모바일에서도 적절한 크기)

**점수 계산**: 먹이 1개 = 10점

**조작**:

| 플랫폼   | 조작                    |
| -------- | ----------------------- |
| 데스크톱 | 방향키 (←↑→↓) 또는 WASD |
| 모바일   | 스와이프 (좌/상/우/하)  |

**렌더링**: Canvas

```tsx
const CELL_SIZE = Math.floor(
  Math.min(
    (window.innerWidth - 32) / BOARD_SIZE, // 좌우 패딩 16px씩
    400 / BOARD_SIZE, // 최대 400px
  ),
);
const CANVAS_SIZE = CELL_SIZE * BOARD_SIZE;
```

**색상**:

| 요소    | 라이트 모드 | 다크 모드 |
| ------- | ----------- | --------- |
| 배경    | `#fafafa`   | `#1a1a1a` |
| 격자선  | `#e4e4e7`   | `#2a2a2a` |
| 뱀 머리 | `#3f3f46`   | `#ffffff` |
| 뱀 몸통 | `#71717a`   | `#d4d4d8` |
| 먹이    | `#ef4444`   | `#f87171` |

**다크 모드 감지**: `window.matchMedia('(prefers-color-scheme: dark)')` 사용

**게임 루프**:

```typescript
const INITIAL_SPEED = 150; // ms per frame

useEffect(() => {
  const interval = setInterval(() => {
    moveSnake();
  }, speed);
  return () => clearInterval(interval);
}, [speed, direction]);
```

---

### 5.3 지뢰찾기

**파일**: `src/app/games/minesweeper/page.tsx` (`"use client"`)

**게임 규칙**:

1. 보드에 지뢰가 랜덤 배치
2. 칸을 열면 주변 8칸의 지뢰 수가 표시됨
3. 주변에 지뢰가 없으면 자동으로 인접 빈 칸 열기 (Flood Fill)
4. 지뢰를 열면 게임 오버
5. 지뢰가 아닌 모든 칸을 열면 승리

**난이도**:

| 난이도 | 보드 크기 | 지뢰 수 |
| ------ | --------- | ------- |
| 초급   | 9 x 9     | 10      |
| 중급   | 16 x 16   | 40      |
| 고급   | 30 x 16   | 99      |

**점수 계산**: 클리어 시간 (초 단위). 빠를수록 높은 점수.

**조작**:

| 플랫폼   | 열기   | 깃발 꽂기        |
| -------- | ------ | ---------------- |
| 데스크톱 | 좌클릭 | 우클릭           |
| 모바일   | 탭     | 롱프레스 (500ms) |

**렌더링**: CSS Grid

```tsx
<div
  className={`grid gap-0.5 mx-auto`}
  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
>
  {board.map((row, r) =>
    row.map((cell, c) => (
      <button
        key={`${r}-${c}`}
        className={`aspect-square flex items-center justify-center text-xs font-bold
          rounded-sm border transition-colors
          ${
            cell.revealed
              ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              : "bg-zinc-200 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-500"
          }`}
        onClick={() => reveal(r, c)}
        onContextMenu={(e) => {
          e.preventDefault();
          toggleFlag(r, c);
        }}
        onTouchStart={() => startLongPress(r, c)}
        onTouchEnd={cancelLongPress}
      >
        {cell.revealed && cell.mine && "💣"}
        {cell.revealed && !cell.mine && cell.count > 0 && cell.count}
        {!cell.revealed && cell.flagged && "🚩"}
      </button>
    )),
  )}
</div>
```

**숫자 색상**:

```typescript
const numberColors: Record<number, string> = {
  1: "text-blue-600 dark:text-blue-400",
  2: "text-green-600 dark:text-green-400",
  3: "text-red-600 dark:text-red-400",
  4: "text-purple-600 dark:text-purple-400",
  5: "text-amber-700 dark:text-amber-400",
  6: "text-teal-600 dark:text-teal-400",
  7: "text-zinc-900 dark:text-zinc-100",
  8: "text-zinc-500 dark:text-zinc-400",
};
```

**Flood Fill 알고리즘**:

```typescript
function reveal(r: number, c: number): void {
  if (outOfBounds(r, c) || board[r][c].revealed || board[r][c].flagged) return;

  board[r][c].revealed = true;

  if (board[r][c].mine) {
    // 게임 오버
    revealAll();
    return;
  }

  if (board[r][c].count === 0) {
    // 주변 8칸 자동 열기
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        reveal(r + dr, c + dc);
      }
    }
  }
}
```

**첫 클릭 안전**: 첫 번째 클릭한 칸과 주변 8칸에는 지뢰가 없도록 보장한다.

```typescript
function generateBoard(
  rows: number,
  cols: number,
  mines: number,
  safeR: number,
  safeC: number,
): Cell[][] {
  // safeR, safeC 주변 9칸을 제외한 위치에만 지뢰 배치
}
```

---

### 5.4 메모리 카드

**파일**: `src/app/games/memory/page.tsx` (`"use client"`)

**게임 규칙**:

1. 모든 카드가 뒤집어진 상태에서 시작
2. 카드 2장을 클릭하여 뒤집기
3. 같은 쌍이면 열린 상태 유지, 다르면 다시 뒤집기
4. 모든 쌍을 찾으면 승리

**난이도**:

| 난이도 | 그리드 | 쌍 수 |
| ------ | ------ | ----- |
| 쉬움   | 3 x 4  | 6쌍   |
| 보통   | 4 x 4  | 8쌍   |
| 어려움 | 4 x 5  | 10쌍  |

**카드 이모지 (저작권 없음)**:

```typescript
const EMOJIS = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
];
```

**점수 계산**: 시도 횟수. 적을수록 높은 점수.

**조작**: 탭/클릭

**렌더링**: CSS 3D Flip

```css
.card-flip {
  perspective: 1000px;
}

.card-flip-inner {
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.card-flip-inner.flipped {
  transform: rotateY(180deg);
}

.card-flip-front,
.card-flip-back {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
}

.card-flip-back {
  transform: rotateY(180deg);
}
```

**카드 디자인**:

- **뒷면** (닫힌 상태): `bg-zinc-200 dark:bg-zinc-700` + `?` 또는 패턴
- **앞면** (열린 상태): `bg-white dark:bg-zinc-800` + 이모지 (큰 글씨)
- **매칭 성공**: `bg-green-50 dark:bg-green-900/30` + 이모지 유지

---

### 5.5 블록 드롭

**파일**: `src/app/games/block-drop/page.tsx` (`"use client"`)

> **저작권 주의**: "Tetris" 이름 사용 금지. 블록 모양과 색상을 독자적으로 디자인한다.

**게임 규칙**:

1. 블록이 위에서 아래로 떨어짐
2. 회전/이동하여 줄을 채우기
3. 완성된 줄은 사라지고 점수 획득
4. 블록이 쌓여 위까지 차면 게임 오버

**보드 크기**: 10 x 20 (가로 x 세로)

**블록 종류 (7종, 독자적 색상)**:

```typescript
const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: "#64748b" }, // slate
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#78716c",
  }, // stone
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#737373",
  }, // neutral
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#6b7280",
  }, // gray
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#71717a",
  }, // zinc
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#525252",
  }, // neutral dark
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#a3a3a3",
  }, // neutral light
};
```

> **다크모드 색상**: 위 색상은 라이트모드 기준. 다크모드에서는 `#d4d4d8`, `#e4e4e7` 등 밝은 계열 사용.

**점수 계산**:

| 줄 수 | 점수 |
| ----- | ---- |
| 1줄   | 100  |
| 2줄   | 300  |
| 3줄   | 500  |
| 4줄   | 800  |

**레벨 시스템**: 10줄 클리어마다 레벨 업, 속도 증가

```typescript
const getSpeed = (level: number) => Math.max(100, 800 - (level - 1) * 70);
```

**조작**:

| 플랫폼   | 좌/우 이동     | 회전 | 소프트 드롭   | 하드 드롭 |
| -------- | -------------- | ---- | ------------- | --------- |
| 데스크톱 | ← →            | ↑    | ↓             | Space     |
| 모바일   | 좌/우 스와이프 | 탭   | 아래 스와이프 | 더블 탭   |

**렌더링**: Canvas

```typescript
const CELL_SIZE = Math.floor(
  Math.min(
    (window.innerWidth - 32) / BOARD_WIDTH,
    20, // 최대 셀 크기 20px
  ),
);

function drawBoard(ctx: CanvasRenderingContext2D) {
  // 배경
  ctx.fillStyle = isDark ? "#1a1a1a" : "#fafafa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 격자선
  ctx.strokeStyle = isDark ? "#2a2a2a" : "#e4e4e7";
  // ... 그리기

  // 고정된 블록
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = cell;
        ctx.fillRect(
          c * CELL_SIZE + 1,
          r * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
        );
        ctx.strokeStyle = isDark ? "#3a3a3a" : "#d4d4d8";
        ctx.strokeRect(
          c * CELL_SIZE + 1,
          r * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
        );
      }
    });
  });

  // 현재 떨어지는 블록
  // ...
}
```

**회전 알고리즘 (SRS 기반)**:

```typescript
function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];
  for (let c = 0; c < cols; c++) {
    rotated.push([]);
    for (let r = rows - 1; r >= 0; r--) {
      rotated[c].push(shape[r][c]);
    }
  }
  return rotated;
}
```

**Wall Kick**: 회전 시 벽/블록에 막히면 좌우로 1-2칸 이동 시도한다.

## 6. 디렉토리 구조 최종

```
src/app/
├── games/                              # 게임 코너 라우트
│   ├── page.tsx                        # 게임 목록 (서버 컴포넌트)
│   ├── 2048/
│   │   └── page.tsx                    # 2048 게임 (클라이언트 컴포넌트)
│   ├── snake/
│   │   └── page.tsx                    # 스네이크 (클라이언트 컴포넌트)
│   ├── minesweeper/
│   │   └── page.tsx                    # 지뢰찾기 (클라이언트 컴포넌트)
│   ├── memory/
│   │   └── page.tsx                    # 메모리 카드 (클라이언트 컴포넌트)
│   └── block-drop/
│       └── page.tsx                    # 블록 드롭 (클라이언트 컴포넌트)
│
├── components/
│   └── games/                          # 게임 공통 컴포넌트
│       ├── GameCard.tsx                # 게임 선택 카드 (서버 컴포넌트)
│       ├── GameLayout.tsx              # 게임 공통 레이아웃 (클라이언트 컴포넌트)
│       ├── useGameAudio.ts             # Web Audio API 효과음 훅
│       └── thumbnails/                 # 게임 썸네일 (SVG 기반)
│           ├── Thumbnail2048.tsx
│           ├── ThumbnailSnake.tsx
│           ├── ThumbnailMinesweeper.tsx
│           ├── ThumbnailMemory.tsx
│           └── ThumbnailBlockDrop.tsx
│
├── lib/
│   └── games/
│       ├── types.ts                    # 게임 공통 타입
│       └── constants.ts               # 게임 메타 정보 상수
```

## 7. 타입 정의

**파일**: `src/app/lib/games/types.ts`

```typescript
import { ComponentType } from "react";

export interface GameInfo {
  id: string;
  title: string;
  description: string;
  href: string;
  thumbnail: ComponentType;
}
```

## 8. 게임 상수

**파일**: `src/app/lib/games/constants.ts`

```typescript
import type { GameInfo } from "./types";
import Thumbnail2048 from "@/app/components/games/thumbnails/Thumbnail2048";
import ThumbnailSnake from "@/app/components/games/thumbnails/ThumbnailSnake";
import ThumbnailMinesweeper from "@/app/components/games/thumbnails/ThumbnailMinesweeper";
import ThumbnailMemory from "@/app/components/games/thumbnails/ThumbnailMemory";
import ThumbnailBlockDrop from "@/app/components/games/thumbnails/ThumbnailBlockDrop";

export const GAMES: GameInfo[] = [
  {
    id: "2048",
    title: "2048",
    description: "숫자 타일을 합쳐 2048을 만들어라",
    href: "/games/2048",
    thumbnail: Thumbnail2048,
  },
  {
    id: "snake",
    title: "스네이크",
    description: "뱀을 조종해 먹이를 먹어라",
    href: "/games/snake",
    thumbnail: ThumbnailSnake,
  },
  {
    id: "minesweeper",
    title: "지뢰찾기",
    description: "지뢰를 피해 모든 칸을 열어라",
    href: "/games/minesweeper",
    thumbnail: ThumbnailMinesweeper,
  },
  {
    id: "memory",
    title: "메모리 카드",
    description: "같은 쌍의 카드를 찾아라",
    href: "/games/memory",
    thumbnail: ThumbnailMemory,
  },
  {
    id: "block-drop",
    title: "블록 드롭",
    description: "블록을 쌓아 줄을 완성해라",
    href: "/games/block-drop",
    thumbnail: ThumbnailBlockDrop,
  },
];
```

## 9. 인증 전략

### Phase 1 (현재): 로그인 없이 플레이

- 점수: `localStorage`에 저장
- 키 형식: `game_best_{gameId}` (예: `game_best_2048`)
- 별도 인증 체크 없음

### Phase 2 (향후): Supabase 연동

로그인 시 게임 기록을 Supabase에 저장한다.
습관 관리의 HabitsProvider 캐싱 패턴을 그대로 적용한다.

**적용할 최적화 기법** (참고: `docs/ARCHITECTURE.md` 캐시 전략):

| 기법                     | 설명                                     |
| ------------------------ | ---------------------------------------- |
| **메모리 캐시**          | `Map<string, GameScore>` 전역 캐시       |
| **초기 1회 패칭**        | 로그인 시 사용자 기록 1회만 패칭         |
| **캐시 우선 조회**       | 캐시 확인 → 없으면 DB 폴백               |
| **CRUD 캐시 갱신**       | 게임 종료 시 캐시 업데이트 (재패칭 방지) |
| **불필요한 재패칭 방지** | 점수 갱신 시에만 DB 저장                 |

**향후 DB 테이블 (참고용)**:

```sql
CREATE TABLE game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',  -- 게임별 추가 데이터 (레벨, 시간 등)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)      -- 사용자당 게임당 1개 최고 기록
);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scores" ON game_scores
  FOR ALL USING (auth.uid() = user_id);
```

## 10. 스타일링 가이드

### 프로젝트 디자인 시스템 준수

- 카드: `card` 클래스 사용 (`design.css`)
- 본문 카드: `card-content` 클래스 사용 (호버 효과 없음)
- 버튼: `btn-primary` 클래스 사용
- 헤더: `PageHeader` 컴포넌트 재사용 (습관 페이지와 동일)
- CSS 변수: `var(--bg-primary)`, `var(--text-primary)` 등 활용

### 다크모드 필수

- 모든 색상에 `dark:` 클래스 추가
- Canvas 게임은 `prefers-color-scheme: dark` 미디어 쿼리로 감지
- CSS 변수 기반 색상 → 자동 전환

### 반응형

- 게임 보드: 화면 너비에 맞게 크기 조절 (`max-w-[400px] mx-auto` 등)
- 모바일에서 터치 영역 충분히 확보 (최소 44x44px)
- 헤더: 데스크톱만 sticky (`md:sticky md:top-0`)

## 11. 구현 순서 (Sonnet 가이드)

구현 시 다음 순서를 권장한다:

1. **공통 인프라** (먼저 구현)
   - `src/app/lib/games/types.ts`
   - `src/app/lib/games/constants.ts`
   - `src/app/components/games/GameLayout.tsx`
   - `src/app/components/games/GameCard.tsx`
   - `src/app/components/games/useGameAudio.ts`

2. **랜딩 페이지 변경**
   - `src/app/components/FeatureTiles.tsx` gridCols 변경
   - `src/app/page.tsx` 게임 코너 타일 추가

3. **게임 목록 페이지**
   - `src/app/games/page.tsx`
   - 썸네일 컴포넌트 5개

4. **게임 구현** (난이도 순)
   - 2048 (가장 단순)
   - 메모리 카드 (CSS 기반)
   - 스네이크 (Canvas 기본)
   - 지뢰찾기 (알고리즘 복잡)
   - 블록 드롭 (가장 복잡)

5. **문서 업데이트**
   - `docs/ROADMAP.md`
   - `docs/ARCHITECTURE.md`
   - `.cursor/rules/project-context.mdc`

## 12. 빌드 확인 체크리스트

- [ ] `npm run build` 성공
- [ ] TypeScript 오류 없음
- [ ] 라이트/다크모드 모두 확인
- [ ] 모바일/데스크톱 반응형 확인
- [ ] 각 게임 기본 플레이 동작 확인
- [ ] localStorage 점수 저장/불러오기 확인
- [ ] `output: 'export'` 환경에서 정상 동작 (서버 사이드 코드 없음)
