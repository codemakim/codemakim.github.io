# React 마스터리 트랙 — 디자인 문서

작성일: 2026-05-04
상태: 1차 MVP 설계

---

## 1. 배경과 문제

블로그(`/`)는 만들어 두었지만 본인이 거의 접속하지 않는다. 원인을 추적하면 다음과 같다.

- **블로그 글**: React 학습 시리즈 70+개가 있지만 **입문자 톤**이라 본인(Vue/Spring 7년차) 수준에 맞지 않는다. React 공식 문서가 더 낫다고 느낀다.
- **게임 / 매일두잇**: 일상 동선에 들어올 이유가 없거나, OAuth 마찰·웹의 한계로 동력이 끊겼다.

본인은 다음과 같은 학습 환경을 가지고 있다.

- 출퇴근 왕복 3시간 = 매주 약 15시간의 **모바일 학습 시간**이 자동 확보되어 있다.
- 학습 목표는 "라이프사이클 훅의 동작 원리, VDOM/Fiber, 렌더링 파이프라인, 최적화" 등 **시니어 레벨의 React 숙련도를 빠르게 끌어올리는 것**이다.

따라서 진짜 문제는 "기능 부족"이 아니라 **콘텐츠가 본인 수준과 학습 동선에 맞지 않는다**는 것이다. 이 문서는 블로그를 **"읽기 전용 포스트 모음"에서 "Vue/Spring 7년차 → 시니어 React 전환 코스"로 재설계**하는 1차 MVP를 정의한다.

---

## 2. 목표 / 비목표

### 목표 (1차 MVP)

1. 시니어 React 핵심 토픽을 트리로 구성하고, 각 토픽을 **출퇴근 10~15분에 읽히는 고밀도 카드형 문서**로 제공한다.
2. 본인 컨텍스트(Vue/Spring/백엔드)와 React 내부 원리를 **모든 토픽에서 일관된 템플릿**으로 비교·설명한다.
3. 매일 접속할 hook으로 **"오늘의 한 컷"**을 홈과 마스터리 트랙 메인에 노출한다.
4. 기존 React 학습 시리즈는 **삭제하지 않고** "참고자료"로 재배치한다.

### 비목표 (이번엔 만들지 않음)

다음은 의도적으로 1차에서 제외한다. 콘텐츠가 자리잡고 본인이 진짜 매일 접속하는 게 검증된 후 v2 후보로 재검토한다.

- GitHub API/PAT 기반 모바일 노트 작성
- SRS(간격 반복) 알고리즘
- AI 결합 (Claude API, 로컬 LLM 등)
- 데스크톱-모바일 진행도 동기화
- 기존 70+개 React 시리즈의 본문 재집필

이유: 1차 시도에서 같은 패턴을 반복할 위험이 크다. **콘텐츠 부담을 키우는 결정은 모두 미룬다.**

---

## 3. 1차 MVP 범위

| # | 항목 | 설명 |
|---|------|------|
| 1 | `/react-mastery` 메인 | 토픽 트리 인덱스 + "오늘의 한 컷" + 진행률(읽음 수 / 전체) |
| 2 | `/react-mastery/[slug]` 토픽 페이지 | 정형 템플릿 기반 카드형 문서 |
| 3 | 토픽 트리 구조화 | 시니어 React 핵심 10~13개 토픽 정의 (콘텐츠는 점진적으로 채움) |
| 4 | "오늘의 한 컷" 데일리 카드 | 짧은 질문 + 짧은 답 + 깊은 답 형태. 날짜 기반 결정론적 셔플 |
| 5 | 읽음 표시 | localStorage에 `react-mastery:read:{slug}` 저장. 디바이스간 동기화 X (1차 OK) |
| 6 | 홈 위젯 | 랜딩 페이지에 "오늘의 한 컷" 1장 노출 |
| 7 | 기존 시리즈 재배치 | 삭제 X. 토픽 페이지의 "참고" 섹션에 링크 |

---

## 4. 토픽 트리 (1차 안)

이번 MVP는 다음 **시니어 React 핵심 토픽**을 다룬다. 1차 릴리즈에 모든 토픽이 채워져 있을 필요는 없으며, 미작성 토픽은 "준비 중"으로 표시한다.

1. **React의 렌더링 모델** — render는 함수 호출이지 DOM 작업이 아니다
2. **State와 Snapshot** — state가 "값"이라는 것의 진짜 의미
3. **useEffect는 lifecycle이 아니다** — "외부 시스템과의 동기화"라는 공식 입장 반영
4. **Reconciliation과 key** — diff 알고리즘과 key의 역할
5. **Fiber가 해결하는 문제** — 왜 stack reconciler에서 fiber로 바뀌었나
6. **Render phase와 Commit phase** — 두 단계 분리가 가져온 것
7. **memo / useMemo / useCallback의 진짜 비용** — 언제 효과가 있고 언제 손해인가
8. **Context의 성능 함정** — 왜 Context는 상태관리 라이브러리가 아닌가
9. **Suspense와 Concurrent Rendering** — Transitions, lane 모델 개요
10. **Server Components와 Hydration** — 직렬화, 경계, 자주 터지는 함정
11. **React Compiler가 바꾸는 메모이제이션 패러다임** — 수동 memo의 의미가 어떻게 변하는가
12. **Profiler로 렌더 추적** — 실측 기반 최적화 방법
13. **(여유분)** Transitions와 startTransition / 폼·서버 액션 등

토픽 순서·갯수는 1차 작성 과정에서 조정 가능. 토픽 트리는 코드(`src/app/react-mastery/topics.ts` 등)로 정의하여 단일 진실 원본으로 사용한다.

---

## 5. 토픽 페이지 정형 템플릿

모든 토픽 mdx는 다음 5개 섹션을 가진다. 본인의 주력 컨텍스트(Vue 생태계)를 매 토픽에서 일관되게 활성화하기 위함이다.

| 섹션 | 목적 | 길이 가이드 |
|------|------|-------------|
| **한 장 핵심** | 이 토픽이 무엇이고 왜 중요한지 | 1~2단락 |
| **Vue와 비교** | Vue의 reactivity / Composition API와 무엇이 다른가 | 2~4단락 |
| **React 내부 원리** | 소스/RFC/공식 explainer에 근거한 동작 메커니즘 | 3~5단락 |
| **실무에서 터지는 문제** | 흔한 함정, 디버깅 사례, 안티패턴 | 2~4단락 |
| **참고** | 공식문서 / (선별된) 기존 내 글 / 외부 깊이 있는 글 링크 | 글머리표 |

본인의 주된 비교축은 **Vue (특히 Composition API / reactivity)** 다. 백엔드(Spring/Java) 비유는 토픽이 정말 그쪽 비유가 강력할 때만 본문 안에서 자연스럽게 사용하고, 정형 섹션으로는 두지 않는다.

총 길이: **출퇴근 10~15분 = 한국어 1500~2500자** 분량을 기준으로 한다. 책처럼 길게 쓰지 않는다. 카드형 고밀도 문서가 본인의 학습 환경(모바일·자투리 시간)에 맞는다.

### 모바일 우선 타이포

- 큰 본문 글자 (`text-lg` 기본)
- 단락 사이 충분한 여백
- 코드 블록은 가로 스크롤 + 폰트 축소 옵션
- 섹션 헤더 강조 (네오브루탈리즘 디자인 시스템 그대로)

---

## 6. "오늘의 한 컷" 카드

### 형태

```
[오늘의 React 질문]
useEffect cleanup은 정확히 언제 실행되는가?

[짧은 답]
다음 effect가 실행되기 직전, 또는 컴포넌트가 unmount되기 직전에 실행된다.

[깊은 답]
React는 render phase에서 UI 계산을 끝낸 뒤 commit phase에서 DOM 반영과 effect 처리를 분리한다…
(2~4단락)

[관련 토픽 → /react-mastery/use-effect-is-not-lifecycle]
```

### 데이터 / 셔플 규칙

- 카드는 별도 mdx (`content/react-mastery/cards/*.mdx`) 또는 토픽 mdx의 frontmatter에 임베드. **1차는 별도 mdx 권장** (토픽 본문 변경과 카드 변경을 독립시키기 위함).
- 카드 frontmatter: `id`, `question`, `shortAnswer`, `deepAnswer`(mdx 본문), `relatedTopic?`(slug).
- **셔플**: `(YYYY-MM-DD를 정수 시드로 변환) % 카드수`로 결정론적 인덱스를 뽑는다. 같은 날 여러 디바이스에서 봐도 동일한 카드.
- 카드가 0개여도 메인은 깨지지 않게 (빈 상태 UI).

### 노출 위치

1. `/` 랜딩 페이지의 "오늘의 한 컷" 위젯
2. `/react-mastery` 메인의 상단

---

## 7. 기존 React 시리즈 처리

- **삭제 X, 본문 수정 X.** 70+개 글 그대로 둔다.
- 새 토픽 페이지의 **"참고" 섹션**에 "내가 예전에 정리한 입문 노트"로 링크한다.
- **선별 큐레이션 정책**: 모든 기존 글을 무차별로 토픽에 매핑하지 않는다. React Advanced 시리즈 후반부처럼 본인이 부실하다고 판단한 글은 **링크하지 않는다**. 토픽별로 본인이 "이건 입문 자료로 다시 봐도 가치 있다" 싶은 것만 손으로 매핑한다.
- 매핑 방식 (1차 결정):
  - 토픽 정의(`topics.ts`)에 토픽별로 `legacyPostSlugs: string[]`를 손으로 적어둔다. 비어 있어도 OK. 콘텐츠 작성과 동시에 매핑이 자연스럽고, 위 "선별 큐레이션" 정신과도 맞다.
  - 자동 매핑(예: 기존 mdx frontmatter에 `mastery: ...` 메타 추가)은 v1.5 이후로 미룬다.

블로그 인덱스(`/blog`)에서 기존 글의 노출 방식은 변경하지 않는다(검색·태그 필터 그대로).

---

## 8. 데이터 / 라우팅

### 콘텐츠 위치

```
content/react-mastery/
  topics/
    react-rendering-model.mdx
    state-and-snapshot.mdx
    use-effect-is-not-lifecycle.mdx
    ...
  cards/
    cleanup-timing.mdx
    memo-real-cost.mdx
    ...
```

기존 Contentlayer2 설정에 `ReactMasteryTopic`, `ReactMasteryCard` 도큐먼트 타입을 추가한다.

### frontmatter

**ReactMasteryTopic** (mdx frontmatter — 본문 메타만):
```yaml
---
title: "useEffect는 lifecycle이 아니다"
slug: "use-effect-is-not-lifecycle"
readingTimeMin: 12
description: "Effect의 진짜 의미와 흔한 오해"
tags: ["React", "Effect", "고급"]
---
```

**진실 원본 분리**: 토픽의 **"순서·그룹·기존 글 매핑·선수 토픽"** 같은 트리 구조 메타는 `src/app/lib/reactMastery/topics.ts`에 정의한다. mdx는 본문과 본문 메타(title/description/readingTimeMin/tags)만 담당한다. 두 출처는 `slug`로 조인. 이렇게 분리하면 토픽 트리 재배치 시 mdx를 건드릴 필요가 없고, 미작성 토픽도 `topics.ts`에 먼저 등록해 "준비 중"으로 표시할 수 있다.

**ReactMasteryCard**:
```yaml
---
id: "cleanup-timing"
question: "useEffect cleanup은 정확히 언제 실행되는가?"
shortAnswer: "다음 effect가 실행되기 직전, 또는 unmount 직전."
relatedTopic: "use-effect-is-not-lifecycle"
---
```

### 라우팅

- `/react-mastery` — 토픽 트리 + 오늘의 카드 + 진행률
- `/react-mastery/[slug]` — 토픽 페이지
- `/` — 기존 랜딩에 "오늘의 한 컷" 위젯 1개 추가
- 기존 `/blog`, `/games`, `/habits` 등은 유지

### 토픽 트리 컴포넌트 분리 (파일 비대화 방지)

- `src/app/react-mastery/page.tsx` — 페이지 셸
- `src/app/components/react-mastery/TopicTree.tsx` — 트리 렌더
- `src/app/components/react-mastery/TodayCard.tsx` — 오늘의 카드 (홈에서도 재사용)
- `src/app/components/react-mastery/ProgressBar.tsx` — 읽음 진행률
- `src/app/lib/reactMastery/topics.ts` — 토픽 정의 + legacyPostSlugs 매핑
- `src/app/lib/reactMastery/cardOfTheDay.ts` — 날짜 시드 셔플 로직 (테스트 가능한 순수 함수)
- `src/app/lib/reactMastery/readState.ts` — localStorage 읽음 상태 hook (`useReadState`)

각 파일은 단일 책임을 갖고, 다른 컴포넌트의 내부를 알 필요 없이 props/return으로만 통신한다.

---

## 9. 디자인 / 스타일

- 라이트 전용 네오브루탈리즘 (`design.css` CSS 변수만 사용. 인라인 hex 금지).
- 모바일 우선. 데스크톱은 토픽 트리를 2열 그리드로 확장.
- 카드형 문서: 흰 배경 + 검정 2px 테두리 + 4px 오프셋 그림자. 둥근 모서리 사용 안 함.
- "오늘의 한 컷"은 액센트 컬러(`--accent`) 배경 카드로 시각적 우선순위 표시.
- 헤더는 데스크톱만 sticky (CLAUDE.md 모바일 UX 규칙 준수).

---

## 10. 콘텐츠 작성 전략 (== 사용자 부담 관리)

본인이 글 작성에 깔리지 않도록 다음을 명시한다.

- 1차 릴리즈 시 **토픽 0~2개만 채워져 있어도 OK**. 빈 토픽은 "준비 중" 카드로 표시.
- 토픽 1개당 작성 목표 시간: **1~2시간** (출퇴근에 메모 모으고 → 주말에 정리). 더 걸리면 토픽 범위가 너무 넓다는 신호.
- 카드는 토픽보다 훨씬 가볍다 (질문 1개 + 짧은 답 + 깊은 답 2~4단락). 토픽 작성 중에 떠오른 핵심을 카드로 분리해 누적.
- 작성은 IDE에서 mdx 파일 직접 추가/commit. 모바일 작성은 1차 비목표 (PAT/Supabase 등 끌어오지 않음).

---

## 11. 성공 지표

1차 MVP는 다음 중 하나라도 충족하면 의미 있다고 본다:

- 본인이 **주 1회 이상** 사이트에 자발적으로 접속하여 카드/토픽을 본다.
- 1개월 내 **5개 이상** 토픽이 채워진다.
- 출퇴근에 다른 학습 자료(공식문서, 외부 블로그)보다 이 사이트를 우선적으로 연다.

만약 1개월 안에 위 어느 것도 일어나지 않는다면, 콘텐츠 형태나 토픽 선정이 본인 수요와 안 맞는다는 신호. 도구를 더 만드는 게 아니라 **콘텐츠 접근법을 다시 본다.**

---

## 12. v2 후보 (이번엔 안 함)

이 후보들은 1차 MVP가 검증된 후 재평가:

- 모바일에서 노트/카드 추가 (GitHub PAT 또는 Supabase OAuth 재활용)
- SRS(간격 반복) 알고리즘 — 카드 복습이 정말 일어나는지 데이터 본 후
- 로컬 LLM(Ollama) 결합 — 토픽 페이지에서 "더 깊게" 질의응답
- 진행도 git 동기화
- 기존 시리즈의 frontmatter 자동 매핑 (v1.5)
- 개인 정보 큐레이터 / 부동산 경매 트래커 등 별도 트랙

---

## 13. 요약

블로그를 **"읽기 전용 포스트 모음"**에서 **"Vue/Spring 7년차 → 시니어 React 전환 코스"**로 재설계한다. 핵심은 **콘텐츠 재설계**다. 토구·인프라·SRS·AI는 1차에서 의도적으로 빼고, **잘 쓴 카드형 토픽 문서 + 매일의 한 컷 카드 + 기존 글 재배치**로 시작한다. 본인의 출퇴근 모바일 환경, 학습 수준, 누적된 자산 모두를 살리는 방향이다.
