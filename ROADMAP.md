# 프로젝트 장기 로드맵

## 프로젝트 비전

개발 블로그를 중심으로 한 통합 플랫폼 구축

- SEO 최적화된 랜딩 페이지
- 블로그, 습관 관리, 게임 등 다양한 기능 통합
- Supabase 기반 인증 및 데이터 관리

## 현재 상태

### 완료된 기능

- ✅ Next.js 16 + Contentlayer2 기반 블로그
- ✅ MDX 포스트 작성 및 관리
- ✅ 다크모드 지원
- ✅ 반응형 디자인
- ✅ GitHub Pages 정적 배포
- ✅ 글래스모피즘 디자인 (성능 개선 필요)

### 별도 프로젝트

- Flutter 앱: `doit_everyday` (습관 관리 앱)

## Phase 0: 디자인 시스템 개선 (우선순위: 최우선)

### 0.1 디자인 기조 전환

- **목표**: 글래스모피즘에서 성능 최적화된 디자인으로 전환
- **선택된 디자인**: **Minimalist Flat Design with Subtle Shadows**
- **현재 문제점**:
  - `backdrop-filter` 사용으로 인한 성능 저하
  - 모바일에서 렌더링 지연
  - 불필요한 블러 효과로 인한 리소스 낭비
- **예상 시간**: 2-3일
- **작업 내용**:
  1. CSS 파일 재작성 (glass-effects.css → modern-design.css)
  2. 컴포넌트 스타일 업데이트
  3. 다크모드 스타일 조정
  4. 성능 테스트 및 최적화
  5. 모바일/데스크톱 반응형 확인

#### 디자인 기조 및 철학

**Minimalist Flat Design with Subtle Shadows**는 다음과 같은 원칙을 따른다:

1. **단순성 우선**: 불필요한 장식이나 복잡한 그래픽 배제, 핵심 콘텐츠에 집중
2. **성능 최적화**: `backdrop-filter`, `blur()` 등 무거운 CSS 효과 완전 제거
3. **미묘한 깊이감**: 과도한 입체감 대신 섬세한 그림자로 계층 구조 표현
4. **가독성 최우선**: 블로그 콘텐츠 읽기에 최적화된 레이아웃과 색상
5. **일관성 유지**: 전체 디자인에서 통일된 색상, 간격, 타이포그래피 적용

#### 디자인 특징

**시각적 특징**:

- 단순하고 깔끔한 레이아웃
- 제한된 색상 팔레트 (3-5가지 주요 색상)
- 명확한 타이포그래피
- 충분한 화이트 스페이스 (여백)
- 미묘한 그림자로 깊이감 표현

**성능 특징**:

- `backdrop-filter` 완전 제거 → 최고 성능
- `box-shadow`만 사용 (GPU 가속 활용)
- 애니메이션 최소화 (필수 인터랙션만)
- 모바일 배터리 효율 최적화

#### 스타일 작성 규칙

**1. 그림자 (Shadows)**

- **원칙**: 미묘하고 자연스러운 그림자만 사용
- **금지**: `backdrop-filter`, `blur()`, 다중 블러 효과
- **사용**: `box-shadow`만 사용, 최대 2-3개 레이어

**Elevation 레벨별 그림자 값**:

```css
/* Level 1: 카드, 버튼 기본 상태 */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

/* Level 2: 호버 상태, 약간 올라온 카드 */
box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

/* Level 3: 모달, 드롭다운 (최대 elevation) */
box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);

/* 다크모드: 더 진한 그림자 */
@media (prefers-color-scheme: dark) {
  /* Level 1 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
  
  /* Level 2 */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.5);
  
  /* Level 3 */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5), 0 6px 6px rgba(0, 0, 0, 0.6);
}
```

**2. 색상 팔레트**

**라이트 모드**:

- 배경: `#FFFFFF` (순수 흰색)
- 배경 보조: `#F8F9FA` (매우 밝은 회색)
- 텍스트 기본: `#1A1A1A` (거의 검은색)
- 텍스트 보조: `#6B7280` (중간 회색)
- 텍스트 비활성: `#9CA3AF` (밝은 회색)
- 경계선: `#E5E7EB` (연한 회색)
- 액센트 기본: `#4B5563` (gray-600, 무채색)
- 액센트 호버: `#374151` (gray-700, 무채색)
- 액센트 단색 사용 (그라데이션 제거)

**다크 모드**:

- 배경: `#18181B` (진한 중립 회색, 푸른 기 제거)
- 배경 보조: `#27272A` (중립 회색, 푸른 기 제거)
- 텍스트 기본: `#F8FAFC` (거의 흰색)
- 텍스트 보조: `#D1D5DB` (밝은 회색)
- 텍스트 비활성: `#9CA3AF` (중간 회색)
- 경계선: `#3F3F46` (중립 회색 계열)
- 액센트 기본: `#374151` (gray-700, 무채색, 가독성 향상)
- 액센트 호버: `#4B5563` (gray-600, 무채색)
- 액센트 단색 사용 (그라데이션 제거)
- 버튼/태그 텍스트: 흰색 (진한 회색 배경과 대비 확보)

**3. 타이포그래피**

- **폰트**: Geist (현재 사용 중) 유지
- **제목 크기**:
  - H1: `text-4xl font-bold` (36px)
  - H2: `text-3xl font-bold` (30px)
  - H3: `text-2xl font-semibold` (24px)
- **본문**: `text-base` (16px), `leading-relaxed` (1.625)
- **작은 텍스트**: `text-sm` (14px)
- **라인 높이**: 본문은 `1.625`, 제목은 `1.2`

**4. 간격 (Spacing)**

- **원칙**: 충분한 여백으로 가독성 확보
- **카드 간격**: `gap-6` (24px)
- **섹션 간격**: `py-8` (32px) 또는 `py-12` (48px)
- **카드 내부 패딩**: `p-6` (24px)
- **요소 간 최소 간격**: `gap-4` (16px)

**5. 카드 디자인**

```css
/* 기본 카드 */
.card {
  background: #FFFFFF;
  border-radius: 1rem; /* 16px */
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transform: translateY(-2px);
}

/* 다크모드 카드 */
@media (prefers-color-scheme: dark) {
  .card {
    background: #27272A;
    border-color: #3F3F46;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
  }
}
```

**6. 헤더 디자인**

```css
/* 헤더 - backdrop-filter 제거 */
.header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* backdrop-filter 제거! */
}

/* 다크모드 헤더 */
@media (prefers-color-scheme: dark) {
  .header {
    background: rgba(24, 24, 27, 0.95);
    border-bottom-color: #3F3F46;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}
```

**7. 버튼 및 태그**

```css
/* 기본 버튼 - 무채색 계열 */
.btn-primary {
  background: #374151; /* gray-700 - 가독성 향상을 위해 더 진한 회색 */
  color: white;
  border-radius: 0.75rem; /* 12px */
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 4px rgba(55, 65, 81, 0.2);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.btn-primary:hover {
  background: #27272A; /* zinc-800 - 더 진하게 */
  box-shadow: 0 4px 8px rgba(55, 65, 81, 0.3);
  transform: translateY(-1px);
}

/* 다크모드 버튼 */
@media (prefers-color-scheme: dark) {
  .btn-primary {
    background: #374151; /* gray-700 - 진한 회색 */
    color: #FFFFFF; /* 흰색 텍스트로 가독성 향상 */
    box-shadow: 0 2px 4px rgba(55, 65, 81, 0.2);
  }

  .btn-primary:hover {
    background: #4B5563; /* gray-600 */
    box-shadow: 0 4px 8px rgba(55, 65, 81, 0.3);
  }
}

/* 태그 */
.tag {
  background: #F3F4F6;
  color: #374151;
  border-radius: 0.5rem; /* 8px */
  padding: 0.375rem 0.75rem;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tag.active {
  background: #374151; /* gray-700, 무채색 - 가독성 향상 */
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 4px rgba(55, 65, 81, 0.2);
}

.tag.active:hover {
  background: #27272A; /* zinc-800 - 더 진하게 */
  box-shadow: 0 2px 4px rgba(55, 65, 81, 0.3);
}

/* 다크모드 태그 */
@media (prefers-color-scheme: dark) {
  .tag.active {
    background: #374151; /* gray-700, 무채색 - 진한 회색 */
    color: #FFFFFF; /* 흰색 텍스트로 가독성 향상 */
    box-shadow: 0 2px 4px rgba(55, 65, 81, 0.2);
  }

  .tag.active:hover {
    background: #4B5563; /* gray-600 */
    box-shadow: 0 2px 4px rgba(55, 65, 81, 0.3);
  }
}
```

**8. 애니메이션 규칙**

- **원칙**: 최소한의 애니메이션만 사용
- **트랜지션 시간**: `0.2s` 또는 `0.3s` (최대)
- **이징**: `ease` 또는 `cubic-bezier(0.4, 0, 0.2, 1)`
- **금지**: 복잡한 keyframe 애니메이션, 다중 레이어 애니메이션
- **허용**: 호버 시 그림자 변화, 약간의 transform (translateY)

**9. 반응형 규칙**

- **모바일 우선**: 기본 스타일은 모바일 기준
- **브레이크포인트**: Tailwind 기본 사용 (`md:`, `lg:`)
- **모바일 최적화**:
  - 카드 패딩: `p-4` (16px)
  - 간격: `gap-4` (16px)
  - 그림자: 약간 더 강하게 (가독성 향상)

**10. 접근성 규칙**

- **색상 대비**: WCAG AA 기준 준수 (4.5:1 이상)
- **포커스 표시**: 명확한 outline 또는 ring
- **키보드 네비게이션**: 모든 인터랙티브 요소 접근 가능
- **스크린 리더**: 적절한 ARIA 레이블 사용

#### 금지 사항

**절대 사용 금지**:

- ❌ `backdrop-filter`
- ❌ `filter: blur()`
- ❌ 다중 블러 효과
- ❌ 복잡한 그라데이션 마스크
- ❌ 과도한 애니메이션 (1초 이상)

**사용 지양**:

- ⚠️ `transform: scale()` (레이아웃 시프트 가능)
- ⚠️ 다중 그림자 레이어 (3개 이상)
- ⚠️ 그라데이션 (무채색 계열 디자인에서는 단색 사용)

#### 관련 스펙 및 표준

- **CSS 표준**: CSS3 (box-shadow, border-radius, gradients)
- **웹 접근성**: WCAG 2.1 Level AA 준수
- **성능**: Lighthouse 점수 90+ 목표
- **브라우저 지원**: 최신 브라우저 (Chrome, Firefox, Safari, Edge)
- **반응형**: 모바일 우선, 320px 이상 지원

### 0.2 성능 측정 및 최적화

- **목표**: 디자인 전환 후 성능 개선 확인
- **측정 항목**:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - 모바일 렌더링 속도
- **예상 시간**: 1일

## 장기 계획

### Phase 1: 인프라 구축 (우선순위: 최우선)

#### 1.1 랜딩 페이지 구축

- **목표**: SEO 최적화된 메인 랜딩 페이지 생성
- **기능**:
  - 서버사이드 렌더링 (SSR) 또는 정적 생성 (SSG)
  - 블로그, 습관 만들기, 게임 등 기능으로 이동하는 네비게이션
  - 반응형 디자인
- **기술**: Next.js App Router, Metadata API
- **예상 시간**: 2-3일

#### 1.2 Supabase 설정 및 인증 통합

- **목표**: 사용자 인증 시스템 구축
- **기능**:
  - Supabase 프로젝트 생성 및 설정
  - 이메일/비밀번호 인증
  - 소셜 로그인 (선택사항: Google, GitHub)
  - 세션 관리
  - 보호된 라우트 구현
- **기술**: Supabase Auth (클라이언트 사이드), React Context/Provider
- **예상 시간**: 3-4일
- **주의사항**:
  - 정적 빌드(`output: 'export'`) 유지
  - 클라이언트 사이드 인증만 사용 (서버 사이드 미들웨어 불가)

#### 1.3 프로젝트 구조 재구성

- **목표**: 랜딩 페이지와 기능별 페이지 분리
- **구조**:

  ```
  /                    → 랜딩 페이지 (SEO 최적화)
  /blog                 → 블로그 목록
  /blog/[slug]          → 블로그 포스트
  /habits               → 습관 관리 (인증 필요)
  /habits/create        → 습관 만들기
  /games                → 게임 (향후)
  ```

- **예상 시간**: 1일

### Phase 2: 습관 관리 기능 구현 (우선순위: 높음)

#### 2.1 데이터베이스 스키마 설계

- **목표**: Supabase PostgreSQL에 습관 관리 테이블 생성
- **테이블 구조**:
  - `habits`: 습관 기본 정보
    - id, user_id, title, color, start_date, end_date, weekdays
  - `habit_records`: 습관 수행 기록
    - id, habit_id, date, completed
  - `habit_stats`: 습관 통계 (뷰 또는 테이블)
- **예상 시간**: 1일

#### 2.2 습관 만들기 UI 구현

- **목표**: Flutter 앱의 `AddChallengeScreen` 기능을 웹으로 이식
- **기능**:
  - 습관 제목 입력
  - 기간 설정 (시작일 ~ 종료일)
  - 요일 선택 (월~일)
  - 색상 선택
  - Supabase에 저장
- **기술**: React Hook Form, Date Picker, Color Picker
- **예상 시간**: 3-4일

#### 2.3 습관 목록 및 관리 화면

- **목표**: 사용자의 습관 목록 표시 및 관리
- **기능**:
  - 오늘 할 습관 목록 (메인 화면)
  - 습관 완료 체크
  - 습관 상세 정보 (통계, 달력)
  - 습관 수정/삭제
- **예상 시간**: 4-5일

#### 2.4 습관 통계 및 시각화

- **목표**: 습관 수행 통계 제공
- **기능**:
  - 완료율 표시
  - 연속 수행 일수
  - 달력 뷰 (성공/실패 표시)
  - 차트 (선택사항)
- **예상 시간**: 3-4일

### Phase 3: 블로그 통합 (우선순위: 중간)

#### 3.1 블로그 라우팅 재구성

- **목표**: 랜딩 페이지에서 `/blog`로 이동하도록 변경
- **작업**:
  - 현재 `/`를 랜딩 페이지로 변경
  - 블로그는 `/blog`로 이동
  - 기존 포스트 URL 유지 (`/blog/posts/[slug]`)
- **예상 시간**: 1일

#### 3.2 블로그와 습관 관리 통합

- **목표**: 네비게이션 통합
- **기능**:
  - 공통 헤더/네비게이션
  - 사용자 프로필 메뉴
- **예상 시간**: 1일

### Phase 4: 추가 기능 (우선순위: 낮음)

#### 4.1 게임 기능

- **목표**: 간단한 게임 추가
- **기능**: TBD
- **예상 시간**: TBD

#### 4.2 기타 기능

- 알림 기능
- 습관 공유 기능
- 커뮤니티 기능

## 기술 스택

### 프론트엔드

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Contentlayer2 (블로그)

### 백엔드/인증

- Supabase (Auth, Database, Storage)
- PostgreSQL (Supabase)

### 배포

- GitHub Pages (정적 사이트)
- 또는 Vercel (SSR 지원 시)

## 우선순위 매트릭스

|Phase|작업|우선순위|예상 시간|의존성|
|-----|----|--------|---------|------|
|0.1|디자인 기조 전환|최우선|2-3일|없음|
|0.2|성능 측정 및 최적화 (보류)|최우선|1일|0.1|
|1.1|랜딩 페이지 구축|최우선|2-3일|0.2|
|1.2|Supabase 인증 통합|최우선|3-4일|1.1|
|1.3|프로젝트 구조 재구성|최우선|1일|1.1, 1.2|
|2.1|DB 스키마 설계|높음|1일|1.2|
|2.2|습관 만들기 UI|높음|3-4일|2.1|
|2.3|습관 목록/관리|높음|4-5일|2.2|
|2.4|습관 통계|높음|3-4일|2.3|
|3.1|블로그 라우팅 재구성|중간|1일|1.3|
|3.2|블로그 통합|중간|1일|3.1|
|4.x|추가 기능|낮음|TBD|3.2|

## 다음 단계

1. **즉시 시작**: Phase 0.1 (디자인 기조 전환) - 성능 개선이 시급
2. **순차 진행**: Phase 0.2 → 1.1 순서로 진행
3. **병렬 진행 가능**: Phase 1.2 (Supabase 설정) - 랜딩 페이지와 독립적
4. **순차 진행**: Phase 1.3 이후 Phase 2로 진행

## 인증 전략 상세

### 인증이 필요한 영역

- ✅ **습관 관리 기능** (`/habits/*`)
  - 습관 만들기 (`/habits/create`)
  - 습관 목록 (`/habits`)
  - 습관 상세 (`/habits/[id]`)
  - 습관 수정/삭제
  - **이유**: 개인 데이터이므로 사용자별로 분리 필요

### 인증이 불필요한 영역 (공개)

- ✅ **랜딩 페이지** (`/`)
  - SEO 최적화를 위해 완전 공개
  - 모든 사용자가 접근 가능
  
- ✅ **블로그** (`/blog`, `/blog/[slug]`)
  - 포스트는 커밋으로 관리되므로 인증 불필요
  - 모든 사용자가 접근 가능
  - 특정 인물만 보게 하지 않음

### 인증 구현 방식

#### 1. 클라이언트 사이드 인증 (정적 빌드 호환)

```typescript
// lib/auth/AuthProvider.tsx
// Supabase 클라이언트 생성 및 세션 관리
// React Context로 인증 상태 전역 관리
```

#### 2. 보호된 라우트 컴포넌트

```typescript
// components/ProtectedRoute.tsx
// 클라이언트 컴포넌트로 인증 체크
// 미인증 시 로그인 페이지로 리다이렉트
```

#### 3. 라우트 구조

```
/                    → 랜딩 페이지 (공개)
/blog                 → 블로그 목록 (공개)
/blog/[slug]          → 블로그 포스트 (공개)
/habits               → 습관 목록 (인증 필요)
/habits/create        → 습관 만들기 (인증 필요)
/habits/[id]          → 습관 상세 (인증 필요)
/auth/login           → 로그인 페이지 (공개)
/auth/signup          → 회원가입 페이지 (공개)
```

#### 4. 인증 플로우

1. 사용자가 `/habits` 접근 시도
2. `ProtectedRoute` 컴포넌트가 인증 상태 체크
3. 미인증 시 `/auth/login`으로 리다이렉트 (이전 경로 저장)
4. 로그인 성공 시 원래 경로로 복귀
5. 인증된 사용자는 습관 관리 기능 사용 가능

#### 5. 데이터 보안

- Supabase Row Level Security (RLS) 정책 설정
- `habits` 테이블: `user_id`로 데이터 분리
- 사용자는 자신의 습관만 조회/수정/삭제 가능

### 기술적 제약사항

- **정적 빌드 제약**: `output: 'export'` 사용 중
  - Next.js Middleware 사용 불가
  - 서버 사이드 인증 체크 불가
  - 클라이언트 사이드 인증만 가능
- **해결책**:
  - Supabase Auth는 클라이언트 사이드에서 완전히 작동
  - 보호된 라우트는 클라이언트 컴포넌트로 구현
  - RLS로 서버 사이드 데이터 보안 보장

## 참고사항

- Flutter 앱(`doit_everyday`)의 기능을 참고하여 웹 버전 구현
- 기존 블로그 기능은 유지하면서 확장
- SEO 최적화는 랜딩 페이지에 집중
- 인증은 습관 관리 기능에만 적용 (블로그는 공개 유지)
- 정적 빌드 유지로 GitHub Pages 배포 호환성 보장

