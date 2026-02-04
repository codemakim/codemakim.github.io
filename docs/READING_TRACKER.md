# 읽음(회독) 트래커 설계 문서 (Study Assist)

## 1. 목표

현재 블로그 포스트는 “내가 이 글을 읽었는지 / 몇 번 읽었는지(회독)”를 추적할 수 없다.  
본 문서는 **포스트별 읽음(회독) 기능**과, 이를 이용해 **시리즈별 학습률(진행률) 표시**를 구현하기 위한 설계를 정리한다.

핵심 원칙:

- 포스트는 정적(MDX)으로 관리한다.
- 사용자별 읽음 정보는 DB(Supabase)에 저장한다.
- **진도율(스크롤 기반 progress%)은 추적하지 않는다.** (짧은 글이 많고, 완독 자동 판정의 오작동/가치 대비 비용이 큼)

---

## 2. 결정된 정책 요약

### 2.1 식별자 정책 (슬러그 변경 대응)

- **DB 키는 `slug`가 아니라 `postId`를 사용한다.**
- `postId`는 MDX frontmatter에 추가하는 **짧고 영구적인 ID**이다.
  - 제목/slug는 변경될 수 있으므로 키로 부적절
  - `postId`는 변경하지 않는 것을 규칙으로 한다

### 2.2 사용자 경험(UX) 정책

- 포스트를 “읽었다(봤다)”는 판정은 **사용자가 버튼을 눌러 확정**한다.
- 버튼을 누를 때마다 **회독 수(read_count)를 1 증가**시켜 저장한다.
- 중복 클릭 방지를 위해 **클릭 후 1초 동안 다시 누를 수 없게(disabled)** 한다.
- 완료 피드백은 습관 체크처럼 **작은 애니메이션**으로 제공한다.

### 2.3 로그인 정책

- 읽음/회독 저장, 시리즈별 학습률(개인화)은 **로그인 사용자만** 사용 가능하다.
- 비로그인 사용자에게는:
  - 기존의 시리즈 내 위치(현재 글 index 기반) 표시는 유지 (개인화 아님)
  - 읽음/회독 버튼 및 개인 학습률 영역은 숨기거나 “로그인 CTA”로 대체한다.

---

## 3. 콘텐츠(정적) 모델: `postId` 추가

### 3.1 MDX frontmatter 확장

각 포스트 파일(`content/**/*.mdx`)의 frontmatter에 아래 필드를 추가한다.

- `postId`: `string` (필수, 영구 ID)

예시:

```mdx
---
title: "..."
date: "2025-..."
postId: "rxt-001"
series: "React Learning"
seriesOrder: 3
tags: ["react"]
---
```

규칙:

- **짧고 안정적인 문자열**(예: `rxt-001`, `math-003`)
- 한 번 발급하면 변경하지 않는다.
- 전체 포스트에서 유일해야 한다(UNIQUE).

### 3.2 Contentlayer 스키마에 `postId` 노출

`contentlayer.config.ts`의 `Post.fields`에 `postId`를 추가하여, 코드에서 `post.postId`로 접근 가능하게 한다.

> “노출”이란: MDX frontmatter의 값을 Contentlayer가 생성하는 `Post` 객체/타입에 포함시키는 것.

---

## 4. 기능 스펙: 포스트 읽음(회독) 버튼

### 4.1 UI 형태

- 원형 버튼
- 기본 상태 아이콘: **눈(👁️)**
- 읽음(1회 이상) 상태 아이콘: **체크(✓)**
- 버튼 위에 작은 말풍선이 **항상 표시**됨(hover 아님)
  - `read_count === 0` → `봤어요!`(또는 “0번 봤어요!”도 가능하지만 기본은 문구형)
  - `read_count >= 1` → `{n}번 봤어요!`

### 4.2 동작

- 클릭 시:
  - DB에 `read_count = read_count + 1`
  - UI:
    - 눈 → 체크로 전환(1회 이상이면 체크 유지)
    - 말풍선 문구가 즉시 `{n}번 봤어요!`로 갱신
  - **1초 동안 버튼 disabled**

### 4.3 애니메이션(피드백)

습관 체크 UX와 일관되게 아래 조합을 사용한다.

- 체크 아이콘 전환 시 **체크마크 드로잉 애니메이션** (기존 `drawCheckmark` keyframes 재사용)
- 클릭 순간 말풍선 또는 버튼이 **가볍게 pop(스케일업→복귀)**

### 4.4 진동(모바일 햅틱)

- 지원되는 브라우저(주로 Android Chrome 등)에서는 `navigator.vibrate(...)`로 짧은 진동이 가능할 수 있다.
- iOS Safari 등은 지원이 제한적이므로, **핵심 피드백은 애니메이션**에 두고 진동은 “가능하면” 옵션으로 둔다.

---

## 5. 데이터 모델(Supabase)

### 5.1 테이블: `post_reads`

사용자별 포스트 회독 상태를 저장한다.

- `id`: UUID PK
- `user_id`: UUID (auth.users FK)
- `post_id`: TEXT (MDX `postId`)
- `read_count`: INTEGER NOT NULL DEFAULT 0
- `last_read_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

제약:

- UNIQUE(`user_id`, `post_id`)

인덱스:

- (`user_id`)
- (`user_id`, `post_id`)

RLS:

- SELECT/INSERT/UPDATE/DELETE 모두 `user_id = auth.uid()` 조건으로 제한

### 5.2 업데이트 방식(권장)

클릭 1회당 1번 증가:

- Upsert(`user_id`, `post_id`) 후 `read_count` 증가
  - 경쟁 상태를 줄이려면 DB 함수(RPC)로 원자적 증가 처리도 가능(2차)

---

## 6. 시리즈별 학습률 계산 (정적 시리즈 + 런타임 사용자 데이터)

### 6.1 현재 시리즈 로직(정적)

시리즈는 DB에 저장하지 않고, MDX frontmatter(`series`, `seriesOrder`)를 기반으로 런타임에서 묶는다.  
이 값들은 Contentlayer가 빌드 시 생성한 “정적 메타”로부터 얻는다.

### 6.2 학습률(개인화) 정의

시리즈의 포스트 목록을 \(P\)라 할 때:

- **학습률(읽음 기준)**:
  - \( \text{rate} = \frac{|\{p \in P \mid readCount(p.postId) > 0\}|}{|P|} \)
- **총 회독 합(선택)**:
  - \( \text{sumReads} = \sum_{p \in P} readCount(p.postId) \)

### 6.3 구현 책임 분리(권장)

- 서버/정적 영역:
  - 시리즈의 포스트 목록(각 포스트의 `postId` 포함) 제공
  - 기존 `SeriesNav`의 “현재 글 위치 게이지(current/total)” 유지
- 클라이언트(로그인 필요):
  - Supabase에서 `post_reads`를 조회하여 `postId -> read_count` 맵을 만든다
  - 위 정의에 따라 개인 학습률을 계산하여 표시한다

---

## 7. 로그인 사용자/비로그인 사용자 UI 분리

### 7.1 가능한가?

가능. 전역에 `AuthProvider`가 있으며, 클라이언트 컴포넌트에서 `useAuth()`로 `user`를 확인해 조건부 렌더링한다.

### 7.2 표시 정책

- **비로그인**
  - 시리즈 카드(`SeriesNav`)의 “시리즈 내 위치”는 표시(개인화 아님)
  - 읽음 버튼 및 개인 학습률은 숨김 또는 “로그인하면 저장됩니다” CTA로 대체
- **로그인**
  - 읽음(회독) 버튼 표시
  - 시리즈별 개인 학습률 표시

---

## 8. 범위(이번 미션)

### 8.1 포함

- `postId` 정책 도입(문서화 + Contentlayer 필드 확장 + MDX frontmatter 적용)
- 포스트 상세 페이지에 “n번 봤어요!” 버튼(회독 +1) 추가
- 버튼 애니메이션(체크마크 드로잉 + pop)
- 로그인/비로그인에 따른 노출 제어
- (선택) 시리즈 카드에 “내 학습률” 게이지 추가(로그인 시에만)

### 8.2 제외(추후)

- 스크롤 기반 진도율(progress%) 추적
- 스크롤 기반 완독 자동 판정
- 하이라이트/메모/SRS

---

## 9. 오픈 이슈(결정 필요)

- `read_count === 0`일 때 말풍선 문구:
  - `봤어요!` vs `0번 봤어요!` vs `아직 안 봤어요`
- 회독 증가 실수 클릭 대응:
  - Undo(토스트) 제공 여부
- 시리즈 학습률 표시 위치:
  - `SeriesNav` 내부 하단 vs 별도 대시보드 페이지

