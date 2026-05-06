# React 마스터리 트랙 1차 MVP — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그를 "Vue/Spring 7년차 → 시니어 React 전환 코스"로 재설계한다. `/react-mastery` 트리, 토픽 페이지, "오늘의 한 컷" 카드, 읽음 표시(localStorage), 기존 글 재배치(선별 큐레이션)까지 1차 MVP를 완성한다.

**Architecture:** Contentlayer2에 두 개의 신규 도큐먼트 타입(`ReactMasteryTopic`, `ReactMasteryCard`)을 추가하고, 토픽의 트리 구조 메타(순서·그룹·기존 글 매핑)는 `topics.ts`로 분리해 단일 진실 원본으로 둔다. 모든 페이지는 Next.js `output: 'export'` 정적 빌드. 읽음 상태는 `postReads.ts` 패턴을 차용한 별도 localStorage 키.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, Contentlayer2, MDX, TypeScript strict, Tailwind 4, 네오브루탈리즘 라이트 디자인 시스템 (`design.css` 변수)

**Spec:** `docs/superpowers/specs/2026-05-04-react-mastery-track-design.md`

**참고: 테스트 프레임워크 부재**
이 레포에는 jest/vitest/playwright 등 테스트 러너가 없다. TDD 사이클 대신 각 태스크를 **구현 → `npx tsc --noEmit` → 필요 시 `npm run build` → 수동 검증 → commit**으로 진행한다. 순수 함수에는 인라인으로 expected I/O를 명시한다.

---

## 파일 구조 개요

**신규 파일:**
- `content/react-mastery/topics/.gitkeep`
- `content/react-mastery/cards/.gitkeep`
- `content/react-mastery/topics/use-effect-is-not-lifecycle.mdx` (시드 토픽 1개)
- `content/react-mastery/cards/cleanup-timing.mdx` (시드 카드 1개)
- `src/app/lib/reactMastery/topics.ts` — 토픽 트리 메타 (순서/그룹/legacyPostSlugs)
- `src/app/lib/reactMastery/getTopics.ts` — Contentlayer + topics.ts 조인 (서버)
- `src/app/lib/reactMastery/getCards.ts` — 카드 조회 + 오늘 카드 선택 (서버)
- `src/app/lib/reactMastery/cardOfTheDay.ts` — 날짜 기반 결정론적 셔플 (순수)
- `src/app/lib/reactMastery/readState.ts` — 읽음 상태 localStorage (브라우저)
- `src/app/components/react-mastery/TopicTree.tsx`
- `src/app/components/react-mastery/TodayCard.tsx`
- `src/app/components/react-mastery/ProgressBar.tsx`
- `src/app/components/react-mastery/TopicReadToggle.tsx`
- `src/app/components/react-mastery/MDXContent.tsx` — MDX 렌더 ("use client", 토픽/카드 공용)
- `src/app/react-mastery/page.tsx` — 마스터리 메인
- `src/app/react-mastery/[slug]/page.tsx` — 토픽 상세

**수정 파일:**
- `contentlayer.config.ts` — 신규 도큐먼트 타입 + Post path 분리 + AGENTS.md 제외
- `src/app/page.tsx` — 홈에 마스터리 타일 + 오늘의 한 컷 위젯 추가

**책임 분리 원칙:**
- 트리 구조(순서/그룹/매핑) = `topics.ts`
- 토픽 본문 + 본문 메타(title/description/readingTime/tags) = mdx
- 카드 본문(deepAnswer) + 카드 메타 = mdx
- 두 출처는 `slug` / `id`로 조인

---

## Task 1: Contentlayer 도큐먼트 타입 추가 (Post path 분리, AGENTS.md 제외)

**목적:** `Post`가 `**/*.mdx`로 모든 mdx를 잡으면 신규 토픽/카드 mdx와 충돌한다. `Post`를 최상위 mdx만으로 좁히고, `ReactMasteryTopic` / `ReactMasteryCard`를 각 디렉토리에 묶는다.

**Files:**
- Modify: `contentlayer.config.ts`

- [ ] **Step 1: contentlayer.config.ts 전체 교체**

`contentlayer.config.ts` 전체를 다음으로 교체:

```ts
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  // 최상위 mdx만 Post로 인식. react-mastery/* 는 별도 타입으로 처리.
  filePathPattern: `*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', description: '포스트 제목', required: true },
    description: { type: 'string', description: '포스트 설명', required: false },
    date: { type: 'date', description: '작성 날짜', required: true },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: '태그 목록',
      required: false,
    },
    series: { type: 'string', description: '시리즈 이름', required: false },
    seriesOrder: { type: 'number', description: '시리즈 내 순서', required: false },
    draft: {
      type: 'boolean',
      description: '초안 여부 (true면 빌드에서 제외)',
      required: false,
      default: false,
    },
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => `/posts/${post._raw.flattenedPath}` },
    slug: { type: 'string', resolve: (post) => post._raw.flattenedPath },
  },
}))

export const ReactMasteryTopic = defineDocumentType(() => ({
  name: 'ReactMasteryTopic',
  filePathPattern: `react-mastery/topics/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', description: '토픽 제목', required: true },
    slug: { type: 'string', description: 'topics.ts와 조인할 slug', required: true },
    readingTimeMin: {
      type: 'number',
      description: '예상 읽기 시간(분)',
      required: false,
    },
    description: { type: 'string', description: '한 줄 설명', required: false },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: '태그',
      required: false,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/react-mastery/${doc.slug}`,
    },
  },
}))

export const ReactMasteryCard = defineDocumentType(() => ({
  name: 'ReactMasteryCard',
  filePathPattern: `react-mastery/cards/*.mdx`,
  contentType: 'mdx',
  fields: {
    id: { type: 'string', description: '고유 id', required: true },
    question: { type: 'string', description: '오늘의 질문', required: true },
    shortAnswer: { type: 'string', description: '한 줄 답', required: true },
    relatedTopic: {
      type: 'string',
      description: '연관 토픽 slug (선택)',
      required: false,
    },
  },
}))

export default makeSource({
  contentDirPath: './content',
  contentDirExclude: ['CLAUDE.md', 'AGENTS.md'],
  documentTypes: [Post, ReactMasteryTopic, ReactMasteryCard],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeHighlight, { ignoreMissing: true }],
    ],
  },
})
```

- [ ] **Step 2: 빌드 검증 — 기존 포스트가 계속 잡히는지 확인**

Run: `npm run build`
Expected: 빌드 성공. Contentlayer가 `Generated N documents in .contentlayer` 출력. `Post` 카운트가 기존과 동일(70+). `ReactMasteryTopic` / `ReactMasteryCard`는 0개 (아직 mdx 없음).

빌드 실패 시: `Post.filePathPattern`이 root만 잡는지 확인 (`*.mdx`).

- [ ] **Step 3: commit**

```bash
git add contentlayer.config.ts
git commit -m "feat(react-mastery): Contentlayer에 ReactMasteryTopic/Card 타입 추가"
```

---

## Task 2: content/react-mastery 디렉토리 구조 생성

**Files:**
- Create: `content/react-mastery/topics/.gitkeep`
- Create: `content/react-mastery/cards/.gitkeep`

- [ ] **Step 1: 디렉토리 + .gitkeep 생성**

```bash
mkdir -p content/react-mastery/topics content/react-mastery/cards
touch content/react-mastery/topics/.gitkeep content/react-mastery/cards/.gitkeep
```

- [ ] **Step 2: commit**

```bash
git add content/react-mastery/topics/.gitkeep content/react-mastery/cards/.gitkeep
git commit -m "feat(react-mastery): content/react-mastery 디렉토리 구조 추가"
```

---

## Task 3: 토픽 트리 메타 (`topics.ts`)

**목적:** 토픽의 순서·그룹·기존 글 매핑·선수 토픽을 단일 진실 원본으로 정의. mdx와 `slug`로 조인.

**Files:**
- Create: `src/app/lib/reactMastery/topics.ts`

- [ ] **Step 1: topics.ts 작성**

`src/app/lib/reactMastery/topics.ts`:

```ts
export interface TopicMeta {
  slug: string;
  group?: string;
  order: number;
  legacyPostSlugs: string[];
  prerequisites?: string[];
}

export const TOPIC_TREE: TopicMeta[] = [
  { slug: "react-rendering-model",        order: 1,  group: "core",           legacyPostSlugs: [] },
  { slug: "state-and-snapshot",           order: 2,  group: "core",           legacyPostSlugs: [] },
  { slug: "use-effect-is-not-lifecycle",  order: 3,  group: "effects",        legacyPostSlugs: [] },
  { slug: "reconciliation-and-key",       order: 4,  group: "internals",      legacyPostSlugs: [] },
  { slug: "fiber-architecture",           order: 5,  group: "internals",      legacyPostSlugs: [] },
  { slug: "render-and-commit-phase",      order: 6,  group: "internals",      legacyPostSlugs: [] },
  { slug: "memo-real-cost",               order: 7,  group: "performance",    legacyPostSlugs: [] },
  { slug: "context-performance-pitfalls", order: 8,  group: "performance",    legacyPostSlugs: [] },
  { slug: "suspense-and-concurrent",      order: 9,  group: "concurrent",     legacyPostSlugs: [] },
  { slug: "rsc-and-hydration",            order: 10, group: "concurrent",     legacyPostSlugs: [] },
  { slug: "react-compiler-paradigm",      order: 11, group: "performance",    legacyPostSlugs: [] },
  { slug: "profiler-render-tracking",     order: 12, group: "performance",    legacyPostSlugs: [] },
];

export const TOPIC_GROUPS: Record<string, string> = {
  core: "코어",
  effects: "Effect",
  internals: "내부 원리",
  performance: "성능 / 최적화",
  concurrent: "동시성 / 서버",
};

export function getTopicMeta(slug: string): TopicMeta | undefined {
  return TOPIC_TREE.find((t) => t.slug === slug);
}
```

> **참고**: `legacyPostSlugs`는 일부러 모두 빈 배열로 시작. 사용자가 토픽 작성하면서 본인이 "참고할 만하다" 판단한 기존 글의 slug만 손으로 채운다 (선별 큐레이션 정책).

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/lib/reactMastery/topics.ts
git commit -m "feat(react-mastery): 토픽 트리 메타(topics.ts) 추가"
```

---

## Task 4: 카드 셔플 순수 함수 (`cardOfTheDay.ts`)

**목적:** 같은 날짜 → 같은 카드. 디바이스간 일관성 보장. 순수 함수로 격리.

**Files:**
- Create: `src/app/lib/reactMastery/cardOfTheDay.ts`

- [ ] **Step 1: cardOfTheDay.ts 작성**

`src/app/lib/reactMastery/cardOfTheDay.ts`:

```ts
/**
 * 날짜 문자열(YYYY-MM-DD)을 정수 시드로 변환.
 * 예: "2026-05-06" → 20260506
 */
function dateToSeed(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형태로 반환 (로컬 타임존 기준).
 * dateUtils의 정책과 일치 — Date 객체 비교 회피.
 */
export function todayYYYYMMDD(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 카드 배열에서 오늘의 카드 인덱스를 결정론적으로 선택.
 * 카드 0개면 -1 반환.
 *
 * 예시 I/O:
 *   pickCardIndex(5, "2026-05-06") === 20260506 % 5 === 1
 *   pickCardIndex(0, "2026-05-06") === -1
 */
export function pickCardIndex(cardCount: number, dateStr: string): number {
  if (cardCount <= 0) return -1;
  const seed = dateToSeed(dateStr);
  return seed % cardCount;
}
```

- [ ] **Step 2: 타입 체크 + 인라인 검증**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

수동 검증 (선택, 필요하면 임시 스크립트로):
- `pickCardIndex(5, "2026-05-06")` 결과 → 20260506 % 5 → 1
- `pickCardIndex(0, "2026-05-06")` 결과 → -1
- `pickCardIndex(7, "2026-05-06")` 결과 → 20260506 % 7 → 0

- [ ] **Step 3: commit**

```bash
git add src/app/lib/reactMastery/cardOfTheDay.ts
git commit -m "feat(react-mastery): 날짜 기반 결정론적 카드 셔플 함수 추가"
```

---

## Task 5: 읽음 상태 localStorage (`readState.ts`)

**목적:** 토픽 단위 읽음 상태를 별도 키로 저장. `postReads.ts` 패턴 차용 (검증된 구조).

**Files:**
- Create: `src/app/lib/reactMastery/readState.ts`

- [ ] **Step 1: readState.ts 작성**

`src/app/lib/reactMastery/readState.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export const REACT_MASTERY_READS_STORAGE_KEY = "blog.reactMasteryReads.v1";
export const REACT_MASTERY_READS_CHANGED_EVENT = "blog:reactMasteryReadsChanged";

interface ReadStateV1 {
  v: 1;
  read: Record<string, 1>;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emptyState(): ReadStateV1 {
  return { v: 1, read: {} };
}

function loadState(): ReadStateV1 {
  if (!isBrowser()) return emptyState();
  try {
    const raw = window.localStorage.getItem(REACT_MASTERY_READS_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ReadStateV1>;
    if (parsed?.v !== 1 || typeof parsed.read !== "object" || parsed.read === null) {
      return emptyState();
    }
    const read: Record<string, 1> = {};
    for (const [k, v] of Object.entries(parsed.read)) {
      if (typeof k === "string" && v === 1) read[k] = 1;
    }
    return { v: 1, read };
  } catch {
    return emptyState();
  }
}

function saveState(state: ReadStateV1): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(REACT_MASTERY_READS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(REACT_MASTERY_READS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function isTopicRead(slug: string): boolean {
  if (!slug) return false;
  return loadState().read[slug] === 1;
}

export function toggleTopicRead(slug: string): boolean {
  if (!slug) return false;
  const state = loadState();
  const next: ReadStateV1 = { v: 1, read: { ...state.read } };
  if (next.read[slug] === 1) {
    delete next.read[slug];
    saveState(next);
    return false;
  }
  next.read[slug] = 1;
  saveState(next);
  return true;
}

function subscribe(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === REACT_MASTERY_READS_STORAGE_KEY) onChange();
  };
  window.addEventListener(REACT_MASTERY_READS_CHANGED_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(REACT_MASTERY_READS_CHANGED_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * 단일 토픽의 읽음 상태를 구독하는 hook.
 * SSR-safe: 첫 렌더는 false 반환, mount 후 실제 상태로 교체.
 */
export function useTopicRead(slug: string): boolean {
  const [read, setRead] = useState(false);
  useEffect(() => {
    setRead(isTopicRead(slug));
    return subscribe(() => setRead(isTopicRead(slug)));
  }, [slug]);
  return read;
}

/**
 * 전체 토픽 중 읽은 갯수를 구독하는 hook.
 * @param allSlugs 전체 토픽 slug 배열 (mdx로 작성된 것만)
 */
export function useReadCount(allSlugs: string[]): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const recompute = () => {
      const state = loadState();
      let n = 0;
      for (const s of allSlugs) {
        if (state.read[s] === 1) n++;
      }
      setCount(n);
    };
    recompute();
    return subscribe(recompute);
  }, [allSlugs]);
  return count;
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/lib/reactMastery/readState.ts
git commit -m "feat(react-mastery): 토픽 읽음 상태 localStorage hook 추가"
```

---

## Task 6: 토픽 조회 헬퍼 (`getTopics.ts`)

**목적:** Contentlayer의 `ReactMasteryTopic`과 `topics.ts`의 메타를 `slug`로 조인. 미작성 토픽은 "준비 중"으로 표시할 수 있게 트리에 포함.

**Files:**
- Create: `src/app/lib/reactMastery/getTopics.ts`

- [ ] **Step 1: getTopics.ts 작성**

`src/app/lib/reactMastery/getTopics.ts`:

```ts
import { allReactMasteryTopics, type ReactMasteryTopic } from "contentlayer/generated";
import { TOPIC_TREE, type TopicMeta } from "./topics";

export interface TopicEntry {
  meta: TopicMeta;
  /** mdx 본문이 작성된 경우 doc, 미작성이면 null */
  doc: ReactMasteryTopic | null;
}

/**
 * topics.ts의 순서대로 트리 엔트리를 반환. 미작성 토픽도 doc=null로 포함.
 */
export function getTopicEntries(): TopicEntry[] {
  const docBySlug = new Map<string, ReactMasteryTopic>();
  for (const doc of allReactMasteryTopics) {
    docBySlug.set(doc.slug, doc);
  }
  return [...TOPIC_TREE]
    .sort((a, b) => a.order - b.order)
    .map((meta) => ({
      meta,
      doc: docBySlug.get(meta.slug) ?? null,
    }));
}

/**
 * mdx 본문이 작성된 토픽의 slug 배열 (정적 라우트 생성 + 진행률 계산용).
 */
export function getWrittenTopicSlugs(): string[] {
  return allReactMasteryTopics.map((d) => d.slug);
}

/**
 * 단일 토픽 조회 (slug → 본문 doc + 메타). 본문 없으면 null.
 */
export function getTopicBySlug(slug: string): TopicEntry | null {
  const doc = allReactMasteryTopics.find((d) => d.slug === slug);
  if (!doc) return null;
  const meta = TOPIC_TREE.find((t) => t.slug === slug);
  if (!meta) return null;
  return { meta, doc };
}
```

- [ ] **Step 2: 타입 체크 (Contentlayer가 한 번 빌드되어 있어야 generated 타입이 존재)**

먼저 한 번 빌드:
```bash
npm run build
```
빌드 실패해도 OK (페이지가 아직 없어서 안 잡힐 가능성은 낮지만, contentlayer만 통과하면 충분).

이후:
Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/lib/reactMastery/getTopics.ts
git commit -m "feat(react-mastery): 토픽 조회 헬퍼(getTopics) 추가"
```

---

## Task 7: 카드 조회 + 오늘 카드 선택 (`getCards.ts`)

**Files:**
- Create: `src/app/lib/reactMastery/getCards.ts`

- [ ] **Step 1: getCards.ts 작성**

`src/app/lib/reactMastery/getCards.ts`:

```ts
import { allReactMasteryCards, type ReactMasteryCard } from "contentlayer/generated";
import { pickCardIndex, todayYYYYMMDD } from "./cardOfTheDay";

/**
 * id 순서로 정렬된 모든 카드.
 * 정렬을 고정해야 셔플의 결정성이 유지된다.
 */
export function getAllCards(): ReactMasteryCard[] {
  return [...allReactMasteryCards].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * 오늘의 카드. 카드가 0개면 null.
 */
export function getTodayCard(now: Date = new Date()): ReactMasteryCard | null {
  const cards = getAllCards();
  const idx = pickCardIndex(cards.length, todayYYYYMMDD(now));
  if (idx < 0) return null;
  return cards[idx] ?? null;
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/lib/reactMastery/getCards.ts
git commit -m "feat(react-mastery): 오늘의 카드 선택 헬퍼(getCards) 추가"
```

---

## Task 8: 시드 토픽 mdx 1개 (`use-effect-is-not-lifecycle.mdx`)

**목적:** 시스템이 빈 상태로 머물지 않게 1개 토픽을 시드. 5섹션 정형 템플릿의 견본 역할.

**Files:**
- Create: `content/react-mastery/topics/use-effect-is-not-lifecycle.mdx`

- [ ] **Step 1: 시드 토픽 mdx 작성**

`content/react-mastery/topics/use-effect-is-not-lifecycle.mdx`:

```mdx
---
title: useEffect는 lifecycle이 아니다
slug: use-effect-is-not-lifecycle
readingTimeMin: 12
description: Effect의 진짜 의미와 흔한 오해
tags: [React, Effect, 고급]
---

## 한 장 핵심

`useEffect`는 클래스 컴포넌트의 `componentDidMount` / `componentDidUpdate`를 함수형으로 옮긴 게 아니다. React 공식 문서는 Effect를 **"외부 시스템과의 동기화"** 라고 다시 정의했다. "마운트 후에 한 번", "업데이트마다" 같은 lifecycle 사고로 접근하면 의존성 배열에서 끝없이 헤매게 된다.

핵심은 두 가지다. (1) **렌더링 결과만으로는 표현할 수 없는 부수 효과**(외부 구독, 타이머, 비-React DOM 라이브러리, 네트워크)에만 쓴다. (2) Effect는 항상 **"이 props/state 조합일 때 외부 세계는 어떤 상태여야 하는가"** 를 선언하는 것이라고 읽는다.

## Vue와 비교

Vue 3 Composition API의 `watch` / `watchEffect`와 비교하면 차이가 선명해진다.

- Vue의 `watchEffect`는 **반응형 의존성을 자동 추적**한다. 함수 안에서 읽은 ref/reactive를 컴파일러가 알아낸다. React는 자동 추적이 없으므로 의존성을 손으로 적어야 하고, ESLint 룰(`react-hooks/exhaustive-deps`)이 빠진 의존성을 잡아준다.
- Vue의 `onMounted` / `onUnmounted`는 **명시적인 lifecycle 훅**이다. React는 같은 자리를 의도적으로 비워뒀다 — "마운트 시점"이 아니라 "이 동기화가 필요한 조건"으로 사고를 전환시키려는 설계다.
- Vue 컴포넌트는 setup이 한 번 실행되고 반응성이 알아서 굴러가지만, React 함수 컴포넌트는 **렌더마다 함수 본문 전체가 다시 실행**된다. 그래서 Effect는 "렌더 후에 따로 떼서 실행하는 동기화 단계"라는 위치를 가진다.

## React 내부 원리

React는 한 번의 업데이트를 두 단계로 나눈다.

1. **Render phase**: 컴포넌트 함수를 호출해 새로운 React element 트리를 계산한다. 부수 효과 금지(순수해야 한다). 이 단계는 중단·재시작 가능하다.
2. **Commit phase**: reconciler가 결정한 변경을 실제 DOM에 반영한다. 그 다음 (브라우저가 paint한 후) **passive effect**, 즉 `useEffect`의 콜백이 실행된다. cleanup은 다음 effect가 실행되기 직전, 또는 unmount 직전에 실행된다.

`useLayoutEffect`는 commit 직후 paint 전에 동기 실행된다. 레이아웃 측정처럼 paint 사이 깜박임을 방지해야 할 때만 쓴다.

의존성 배열은 React가 "이 effect를 다시 동기화해야 하는가"를 비교하는 키다. 빈 배열은 "동기화는 마운트 시 한 번"이라는 뜻이 아니라, "외부 세계와 동기화할 입력이 없다 — 한 번만 셋업하면 된다"는 선언이다. 입력이 사실은 있는데 배열에서 빠지면, 같은 외부 상태가 stale한 클로저로 남는다.

## 실무에서 터지는 문제

- **데이터 페칭에 useEffect 쓰기**: 공식 문서가 직접 권장하지 않는 패턴이다. 경쟁 조건, double-fetch, race 처리, 캐싱이 모두 본인 몫이 된다. RSC, React Query/SWR, framework loader가 더 적합하다.
- **state 업데이트만 하는 effect**: "props가 바뀌면 state를 다시 계산"하는 effect는 대부분 잘못된 신호다. 렌더 중에 직접 계산하거나 `key` 리셋으로 컴포넌트를 다시 시작하는 게 정답일 때가 많다.
- **이벤트 핸들러 안에 들어갈 로직을 effect에 넣기**: 사용자 클릭의 결과는 effect가 아니라 핸들러에서 처리해야 한다. effect는 "이 상태가 되었으니 외부 세계와 맞춰라"이지, "이 일이 일어났으니 ..."가 아니다.
- **cleanup을 unmount 시에만 실행된다고 착각**: 매 effect 재실행 직전에도 cleanup이 돈다. 구독·타이머·AbortController는 cleanup에서 정리해야 메모리 누수와 race가 사라진다.

## 참고

- [공식 — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [공식 — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [공식 — Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [공식 — Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: Contentlayer가 `Generated 1 ReactMasteryTopic`로 출력. 빌드 성공.

- [ ] **Step 3: commit**

```bash
git add content/react-mastery/topics/use-effect-is-not-lifecycle.mdx
git commit -m "content(react-mastery): 시드 토픽 - useEffect는 lifecycle이 아니다"
```

---

## Task 9: 시드 카드 mdx 1개 (`cleanup-timing.mdx`)

**Files:**
- Create: `content/react-mastery/cards/cleanup-timing.mdx`

- [ ] **Step 1: 시드 카드 작성**

`content/react-mastery/cards/cleanup-timing.mdx`:

```mdx
---
id: cleanup-timing
question: useEffect cleanup은 정확히 언제 실행되는가?
shortAnswer: 다음 effect가 실행되기 직전, 또는 컴포넌트가 unmount되기 직전에 실행된다.
relatedTopic: use-effect-is-not-lifecycle
---

React는 한 번의 업데이트를 render phase와 commit phase로 분리한다. commit이 끝나고 브라우저가 paint한 뒤 `useEffect`의 콜백이 실행되며, **cleanup은 다음 effect 콜백이 실행되기 직전에 호출된다.** 마지막 cleanup은 컴포넌트가 unmount되기 직전에 한 번 더 실행된다.

따라서 의존성 배열이 바뀌어 effect가 재실행될 때마다 cleanup이 한 번 돈다는 뜻이다. 구독을 해제하지 않으면 같은 컴포넌트 안에서 구독이 누적되고, 타이머는 중복 실행되고, AbortController는 만료된 요청을 취소하지 못한다.

`useLayoutEffect`도 같은 모델이지만 **paint 직전 동기 실행**이라는 점만 다르다. cleanup 시점은 동일.
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: Contentlayer가 `Generated 1 ReactMasteryCard`로 출력.

- [ ] **Step 3: commit**

```bash
git add content/react-mastery/cards/cleanup-timing.mdx
git commit -m "content(react-mastery): 시드 카드 - cleanup-timing"
```

---

## Task 10: TopicReadToggle 컴포넌트

**목적:** 토픽 페이지에서 "읽음" 토글. 클라이언트 컴포넌트.

**Files:**
- Create: `src/app/components/react-mastery/TopicReadToggle.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/components/react-mastery/TopicReadToggle.tsx`:

```tsx
"use client";

import { toggleTopicRead, useTopicRead } from "@/app/lib/reactMastery/readState";

interface Props {
  slug: string;
}

export default function TopicReadToggle({ slug }: Props) {
  const read = useTopicRead(slug);
  return (
    <button
      type="button"
      onClick={() => toggleTopicRead(slug)}
      className="card px-6 py-3 text-sm font-bold"
      style={{
        background: read ? "var(--accent)" : "var(--bg-card)",
        color: read ? "var(--accent-text)" : "var(--text-primary)",
        cursor: "pointer",
      }}
      aria-pressed={read}
    >
      {read ? "✓ 읽음" : "읽음으로 표시"}
    </button>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/components/react-mastery/TopicReadToggle.tsx
git commit -m "feat(react-mastery): TopicReadToggle 컴포넌트 추가"
```

---

## Task 11: ProgressBar 컴포넌트

**Files:**
- Create: `src/app/components/react-mastery/ProgressBar.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/components/react-mastery/ProgressBar.tsx`:

```tsx
"use client";

import { useReadCount } from "@/app/lib/reactMastery/readState";

interface Props {
  /** mdx로 본문이 작성된 토픽 slug 배열 */
  writtenSlugs: string[];
}

export default function ProgressBar({ writtenSlugs }: Props) {
  const read = useReadCount(writtenSlugs);
  const total = writtenSlugs.length;
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div className="card-content p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          진행률
        </span>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {read} / {total} ({pct}%)
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 12,
          background: "var(--bg-secondary)",
          border: "var(--nb-border-thin)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--progress-color)",
            transition: "width 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/components/react-mastery/ProgressBar.tsx
git commit -m "feat(react-mastery): ProgressBar 컴포넌트 추가"
```

---

## Task 12: TopicTree 컴포넌트 (서버)

**목적:** 토픽 트리를 그룹별로 렌더. 미작성 토픽은 "준비 중"으로 비활성 카드.

**Files:**
- Create: `src/app/components/react-mastery/TopicTree.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/components/react-mastery/TopicTree.tsx`:

```tsx
import Link from "next/link";
import { TOPIC_GROUPS } from "@/app/lib/reactMastery/topics";
import type { TopicEntry } from "@/app/lib/reactMastery/getTopics";

interface Props {
  entries: TopicEntry[];
}

export default function TopicTree({ entries }: Props) {
  // 그룹별로 묶기. topics.ts의 order는 이미 정렬되어 있다고 가정.
  const groups = new Map<string, TopicEntry[]>();
  for (const entry of entries) {
    const key = entry.meta.group ?? "ungrouped";
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([groupKey, list]) => (
        <section key={groupKey}>
          <h2
            className="text-xl font-black mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {TOPIC_GROUPS[groupKey] ?? groupKey}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {list.map((entry) => (
              <li key={entry.meta.slug}>
                <TopicCard entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TopicCard({ entry }: { entry: TopicEntry }) {
  const { meta, doc } = entry;

  if (!doc) {
    return (
      <div
        className="card-content p-4"
        style={{ opacity: 0.55, cursor: "default" }}
      >
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            #{meta.order}
          </span>
          <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            준비 중
          </span>
        </div>
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {meta.slug}
        </h3>
      </div>
    );
  }

  return (
    <Link href={`/react-mastery/${meta.slug}`} className="card p-4 block">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          #{meta.order}
        </span>
        {doc.readingTimeMin != null && (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {doc.readingTimeMin}분
          </span>
        )}
      </div>
      <h3
        className="text-lg font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {doc.title}
      </h3>
      {doc.description && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {doc.description}
        </p>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: commit**

```bash
git add src/app/components/react-mastery/TopicTree.tsx
git commit -m "feat(react-mastery): TopicTree 컴포넌트 추가"
```

---

## Task 13: TodayCard 컴포넌트

**목적:** 오늘의 한 컷 카드 렌더. 본문(deepAnswer)은 MDX 렌더. 빈 상태 처리.

**Files:**
- Create: `src/app/components/react-mastery/TodayCard.tsx`
- Create: `src/app/components/react-mastery/MDXContent.tsx` (먼저 만든다)

- [ ] **Step 1: MDXContent 컴포넌트 작성 (재사용 위해 먼저)**

`src/app/components/react-mastery/MDXContent.tsx`:

```tsx
"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import "katex/dist/katex.min.css";

interface Props {
  code: string;
}

export function MDXContent({ code }: Props) {
  const Component = useMDXComponent(code);
  return <Component />;
}
```

- [ ] **Step 2: TodayCard 작성**

`src/app/components/react-mastery/TodayCard.tsx`:

```tsx
import Link from "next/link";
import { getTodayCard } from "@/app/lib/reactMastery/getCards";
import { MDXContent } from "@/app/components/react-mastery/MDXContent";

export default function TodayCard() {
  const card = getTodayCard();

  if (!card) {
    return (
      <div className="card-content p-6">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          오늘의 한 컷이 아직 준비되지 않았어요.
        </p>
      </div>
    );
  }

  return (
    <article
      className="card-content p-6"
      style={{
        background: "var(--accent)",
        color: "var(--accent-text)",
        border: "var(--nb-border)",
      }}
    >
      <div className="text-xs font-bold mb-2" style={{ opacity: 0.85 }}>
        오늘의 한 컷
      </div>
      <h2 className="text-xl font-black mb-3">{card.question}</h2>

      <div className="text-sm font-bold mb-1" style={{ opacity: 0.85 }}>
        짧은 답
      </div>
      <p className="mb-4">{card.shortAnswer}</p>

      <div className="text-sm font-bold mb-1" style={{ opacity: 0.85 }}>
        깊은 답
      </div>
      <div
        className="prose prose-invert"
        style={{ color: "var(--accent-text)" }}
      >
        <MDXContent code={card.body.code} />
      </div>

      {card.relatedTopic && (
        <div className="mt-4">
          <Link
            href={`/react-mastery/${card.relatedTopic}`}
            className="text-sm font-bold underline"
            style={{ color: "var(--accent-text)" }}
          >
            관련 토픽 보기 →
          </Link>
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: commit**

```bash
git add src/app/components/react-mastery/MDXContent.tsx src/app/components/react-mastery/TodayCard.tsx
git commit -m "feat(react-mastery): TodayCard + MDXContent 컴포넌트 추가"
```

---

## Task 14: /react-mastery 메인 페이지

**Files:**
- Create: `src/app/react-mastery/page.tsx`

- [ ] **Step 1: 메인 페이지 작성**

`src/app/react-mastery/page.tsx`:

```tsx
import Link from "next/link";
import TopicTree from "@/app/components/react-mastery/TopicTree";
import TodayCard from "@/app/components/react-mastery/TodayCard";
import ProgressBar from "@/app/components/react-mastery/ProgressBar";
import { getTopicEntries, getWrittenTopicSlugs } from "@/app/lib/reactMastery/getTopics";

export const metadata = {
  title: "React 마스터리 트랙",
  description: "Vue/Spring 7년차 → 시니어 React 전환 코스",
};

export default function ReactMasteryPage() {
  const entries = getTopicEntries();
  const writtenSlugs = getWrittenTopicSlugs();

  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              React 마스터리
            </h1>
          </Link>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            시니어 React 전환 코스
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <TodayCard />
        <ProgressBar writtenSlugs={writtenSlugs} />
        <TopicTree entries={entries} />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크 + 빌드**

Run: `npx tsc --noEmit && npm run build`
Expected: 빌드 성공. `out/react-mastery/index.html` 생성됨.

- [ ] **Step 3: 수동 검증**

Run: `npm run dev`
브라우저: `http://localhost:3000/react-mastery`
- 헤더 보이는지
- 오늘의 한 컷 카드(빨간 배경)에 시드 카드가 표시되는지
- 진행률 바 (0/1 또는 1/1)
- 토픽 트리에 그룹별로 12개 토픽 카드가 보이는지 (시드 1개만 클릭 가능, 나머지는 "준비 중" 흐리게)
- 모바일 뷰포트(375px)에서 1열, md(768px)에서 2열로 토픽 카드 배치되는지

- [ ] **Step 4: commit**

```bash
git add src/app/react-mastery/page.tsx
git commit -m "feat(react-mastery): /react-mastery 메인 페이지 추가"
```

---

## Task 15: /react-mastery/[slug] 토픽 페이지

**Files:**
- Create: `src/app/react-mastery/[slug]/page.tsx`

- [ ] **Step 1: 토픽 상세 페이지 작성**

`src/app/react-mastery/[slug]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { allReactMasteryTopics } from "contentlayer/generated";
import { allPosts } from "contentlayer/generated";
import { getTopicBySlug } from "@/app/lib/reactMastery/getTopics";
import { MDXContent } from "@/app/components/react-mastery/MDXContent";
import TopicReadToggle from "@/app/components/react-mastery/TopicReadToggle";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allReactMasteryTopics.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const entry = getTopicBySlug(slug);
  if (!entry) return {};
  return {
    title: entry.doc?.title,
    description: entry.doc?.description,
  };
}

export default async function ReactMasteryTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getTopicBySlug(slug);
  if (!entry || !entry.doc) notFound();

  const { meta, doc } = entry;

  // 기존 글 매핑 (선별 큐레이션). 없으면 빈 배열.
  const legacyPosts = meta.legacyPostSlugs
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => p != null && !p.draft);

  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-baseline gap-3">
          <Link href="/react-mastery" className="text-sm font-bold" style={{ color: "var(--accent)" }}>
            ← 마스터리
          </Link>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            #{meta.order}
          </span>
          {doc.readingTimeMin != null && (
            <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
              {doc.readingTimeMin}분
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto md:px-4 py-8">
        <div className="px-4 md:px-0 mb-6">
          <h1 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            {doc.title}
          </h1>
          {doc.description && (
            <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
              {doc.description}
            </p>
          )}
        </div>

        <article className="post-content prose px-4 md:px-6 py-6 text-lg">
          <MDXContent code={doc.body.code} />
        </article>

        {legacyPosts.length > 0 && (
          <section className="px-4 md:px-6 py-6">
            <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              내가 예전에 정리한 입문 노트
            </h3>
            <ul className="space-y-2">
              {legacyPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={p.url} className="text-sm underline" style={{ color: "var(--accent)" }}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="px-4 md:px-0 pb-10 pt-2 flex justify-center">
          <TopicReadToggle slug={meta.slug} />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크 + 빌드**

Run: `npx tsc --noEmit && npm run build`
Expected: 빌드 성공. `out/react-mastery/use-effect-is-not-lifecycle/index.html` 생성됨.

- [ ] **Step 3: 수동 검증**

Run: `npm run dev`
- `http://localhost:3000/react-mastery/use-effect-is-not-lifecycle`
- 본문 5섹션 모두 보이는지 (한 장 핵심 / Vue 비교 / 내부 원리 / 실무 함정 / 참고)
- 코드 블록 highlight 동작
- 외부 링크 동작
- 하단 "읽음으로 표시" 버튼 클릭 → 빨간 배경 + "✓ 읽음"으로 토글
- `/react-mastery`로 돌아가면 진행률 바 1/1로 갱신됨
- 모바일 폰트가 충분히 큰지 (`text-lg` 적용)
- 미작성 토픽 URL(`/react-mastery/state-and-snapshot`)은 404

- [ ] **Step 4: commit**

```bash
git add src/app/react-mastery/[slug]/page.tsx
git commit -m "feat(react-mastery): /react-mastery/[slug] 토픽 상세 페이지 추가"
```

---

## Task 16: 홈 랜딩에 마스터리 타일 + 오늘의 한 컷 위젯 추가

**목적:** 본인이 매일 첫 화면에서 카드 1장을 보게 한다. 마스터리 트랙 진입점도 노출.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: page.tsx 전체 교체**

`src/app/page.tsx`:

```tsx
import { getPublicPosts } from "./lib/posts";
import HeroSection from "./components/HeroSection";
import FeatureTiles from "./components/FeatureTiles";
import FeatureTile from "./components/FeatureTile";
import LatestPosts from "./components/LatestPosts";
import HeaderAuth from "./components/HeaderAuth";
import TodayCard from "./components/react-mastery/TodayCard";

export default function LandingPage() {
  const latestPosts = getPublicPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
        <HeaderAuth />
      </div>
      <HeroSection
        title="그냥 블로그"
        description="블로그, 습관 관리, 그리고 더 많은 것들"
      />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <section className="mb-12">
          <TodayCard />
        </section>

        <FeatureTiles className="mb-12">
          <FeatureTile
            href="/react-mastery"
            title="React 마스터리"
            description="시니어 React 전환 코스"
            actionText="트랙 보기"
          />
          <FeatureTile
            href="/blog"
            title="블로그"
            description="웹 개발과 기술 이야기"
            actionText="모든 포스트 보기"
          />
          <FeatureTile
            href="/habits"
            title="매일두잇"
            description="매일 하는 습관 관리"
            actionText="습관 만들기 시작하기"
          />
          <FeatureTile
            href="/games"
            title="게임 코너"
            description="간단한 웹 게임 모음"
            actionText="게임 하러 가기"
          />
        </FeatureTiles>
        <LatestPosts posts={latestPosts} />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크 + 빌드**

Run: `npx tsc --noEmit && npm run build`
Expected: 빌드 성공.

- [ ] **Step 3: 수동 검증**

Run: `npm run dev`
- `http://localhost:3000/`
- Hero 아래에 빨간 "오늘의 한 컷" 카드가 첫 섹션으로 노출
- FeatureTiles에 "React 마스터리" 타일이 추가되어 있고 클릭 시 `/react-mastery`로 이동
- 모바일/데스크톱 모두 레이아웃 OK
- 다른 기능(블로그/매일두잇/게임)도 그대로 동작

- [ ] **Step 4: commit**

```bash
git add src/app/page.tsx
git commit -m "feat(react-mastery): 홈에 오늘의 한 컷 + 마스터리 타일 추가"
```

---

## Task 17: 종합 빌드 + 종합 수동 검증 + 정리 commit

**목적:** 전체 시스템이 깔끔하게 빌드/배포 가능한지 최종 확인.

- [ ] **Step 1: 린트 + 타입 체크 + 빌드 일괄**

```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: 모두 통과. `out/` 디렉토리에 정적 파일 생성됨.

- [ ] **Step 2: 종합 수동 검증 체크리스트**

Run: `npm run dev`

핵심 동선:
- [ ] `/` 첫 화면에서 오늘의 한 컷 카드 노출
- [ ] React 마스터리 타일 클릭 → `/react-mastery` 진입
- [ ] 메인에서 진행률 + 토픽 트리(12개, 1개만 활성) 확인
- [ ] 시드 토픽 클릭 → 본문 5섹션 정상 노출
- [ ] 토픽 페이지에서 "읽음으로 표시" → 토글 동작
- [ ] 메인으로 돌아가 진행률 1/1 갱신
- [ ] 다음 날 가짜 시뮬레이션 (DevTools에서 system date 변경하거나 `cardOfTheDay` 호출 확인) — 카드가 1개라 동일 카드만 표시되는 게 정상
- [ ] 미작성 토픽 직접 URL 접근 시 404
- [ ] 모바일 뷰포트(375px)에서 폰트/레이아웃 적절
- [ ] 라이트 전용 — `dark:` 클래스 신규 추가 없음 (CLAUDE.md 정책)

배포 전 점검:
- [ ] 기존 `/blog`, `/habits`, `/games` 모두 정상 동작 (회귀 없음)
- [ ] 기존 70+개 포스트 빌드/렌더 정상

- [ ] **Step 3: 변경 없으면 skip, 정리 커밋이 필요하면 작성**

만약 위 검증 중 사소한 수정(타이포, 색상 등)이 발생했다면:
```bash
git add -p
git commit -m "fix(react-mastery): 1차 MVP 검증 중 발견된 사소한 수정"
```
없으면 이 단계는 skip.

---

## 자기 점검 (구현 후)

이 plan을 다 끝냈을 때 다음이 충족되어야 한다:

- 사용자는 출퇴근에 모바일로 `/react-mastery`에 접속해서 오늘의 한 컷을 5초 안에 읽을 수 있다.
- 시드 토픽을 10~15분 안에 끝까지 읽을 수 있다.
- "읽음" 표시가 진행률에 즉시 반영된다.
- 토픽을 추가하려면 mdx 파일 1개를 `content/react-mastery/topics/`에 만들고 `topics.ts`에 항목을 추가하면 끝이다.
- 카드를 추가하려면 mdx 파일 1개를 `content/react-mastery/cards/`에 만들면 끝이다 (셔플은 자동).
- 기존 React 시리즈 70+개는 그대로 살아있고, 토픽별로 본인이 필요한 것만 `legacyPostSlugs`에 매핑하면 토픽 페이지에 "내가 예전에 정리한 입문 노트"로 표시된다.

비목표(이번에 안 함, v2 후보):
- 모바일에서 노트/카드 추가 (PAT/GitHub API)
- SRS 알고리즘
- AI 결합 (로컬 LLM 등)
- 진행도 디바이스간 동기화
- 기존 React 시리즈 본문 재집필
