# Cursor Rules 사용 가이드

`.cursor/rules/` 폴더의 `.mdc` 파일들은 AI가 코드를 작성하거나 수정할 때 참조하는 규칙입니다.

## 현재 규칙 파일

### 1. `base-work-flow.mdc` (항상 적용)

- **설정**: `alwaysApply: true`
- **적용 시점**: 모든 세션, 모든 질문
- **용도**: 프로젝트 전반의 개발 워크플로우, 스타일링 규칙, 블로그 말투 규칙
- **토큰 사용**: 매 세션마다 자동 로드

### 2. `project-context.mdc` (항상 적용)

- **설정**: `alwaysApply: true`
- **적용 시점**: 모든 세션, 모든 질문
- **용도**: 프로젝트 컨텍스트 요약 (아키텍처, 캐싱 전략, 주요 파일)
- **토큰 사용**: 매 세션마다 자동 로드

### 3. `blog-writing.mdc` (선택적 적용)

- **설정**: `alwaysApply: false`, `globs: content/**/*.mdx`
- **적용 시점**: `content/` 폴더의 `.mdx` 파일을 열었을 때만
- **용도**: 블로그 포스트 작성 규칙 (말투, 구조, 코드 예제 규칙)
- **토큰 사용**: MDX 파일 작업 시에만 로드

## 규칙 파일 설정 방법

### Frontmatter 옵션

```yaml
---
description: 규칙 설명 (선택사항, Cursor UI에 표시)
globs: 파일 패턴 (선택사항)
alwaysApply: true/false (필수)
---
```

### 설정 옵션

#### 1. 항상 적용 (`alwaysApply: true`)

**사용 시기:**

- 프로젝트 전반에 적용되는 규칙
- 모든 작업에서 참조해야 하는 핵심 규칙

**예시:**

```yaml
---
alwaysApply: true
---
# 프로젝트 코딩 컨벤션
- TypeScript 엄격 모드 사용
- 함수명은 camelCase
```

**주의사항:**

- 토큰 사용량 증가
- 너무 많은 파일을 `alwaysApply: true`로 설정하지 말 것
- 핵심 규칙만 선택

#### 2. 파일 패턴 기반 적용 (`globs` 사용)

**사용 시기:**

- 특정 파일 타입에만 적용되는 규칙
- 해당 파일을 열었을 때만 필요

**Glob 패턴 예시:**

```yaml
---
globs: content/**/*.mdx
alwaysApply: false
---
# MDX 파일 작성 규칙
```

**다양한 패턴:**

- `**/*.tsx` - 모든 `.tsx` 파일
- `src/components/**/*.tsx` - `src/components/` 하위의 모든 `.tsx` 파일
- `**/*.{ts,tsx}` - `.ts` 또는 `.tsx` 파일
- `src/app/habits/**/*` - `src/app/habits/` 하위의 모든 파일
- `**/*.test.ts` - 테스트 파일만

**동작 방식:**

1. 사용자가 해당 패턴과 일치하는 파일을 엽니다
2. Cursor가 자동으로 해당 규칙을 컨텍스트에 추가합니다
3. 파일을 닫으면 규칙도 제거됩니다

#### 3. 조합 사용

**예시: TypeScript 파일에만 적용**

```yaml
---
description: TypeScript 코딩 컨벤션
globs: **/*.{ts,tsx}
alwaysApply: false
---

# TypeScript 규칙
- 타입 명시 필수
- any 사용 금지
```

## 실제 사용 시나리오

### 시나리오 1: 블로그 포스트 작성

1. `content/2025-01-27-new-post.mdx` 파일을 엽니다
2. Cursor가 자동으로 `blog-writing.mdc` 규칙을 로드합니다
3. AI가 블로그 작성 규칙을 참조하여 코드를 작성합니다
4. 파일을 닫으면 규칙도 자동으로 제거됩니다

### 시나리오 2: 습관 관리 기능 개발

1. `src/app/habits/page.tsx` 파일을 엽니다
2. `base-work-flow.mdc`와 `project-context.mdc`가 이미 로드되어 있습니다 (항상 적용)
3. `blog-writing.mdc`는 로드되지 않습니다 (MDX 파일이 아니므로)
4. AI가 개발 워크플로우와 아키텍처를 참조하여 코드를 작성합니다

### 시나리오 3: 새로운 규칙 추가

**예: 습관 관련 컴포넌트에만 적용되는 규칙**

```markdown
---
description: 습관 컴포넌트 작성 규칙
globs: src/app/components/habits/**/*.{ts,tsx}
alwaysApply: false
---

# 습관 컴포넌트 규칙

- HabitsProvider 캐시 사용 필수
- 날짜는 YYYY-MM-DD 문자열로 처리
```

**동작:**

- `src/app/components/habits/HabitCard.tsx`를 열면 자동 적용
- 다른 파일을 열면 적용되지 않음

## 규칙 파일 관리 팁

### 1. 규칙 분리 원칙

**좋은 예:**

- `base-work-flow.mdc` - 전반적인 워크플로우 (항상 적용)
- `blog-writing.mdc` - 블로그 작성 (MDX 파일에만)
- `typescript-conventions.mdc` - TypeScript 규칙 (TS 파일에만)

**나쁜 예:**

- 모든 규칙을 하나의 파일에 넣기
- 모든 규칙을 `alwaysApply: true`로 설정

### 2. 토큰 사용량 최적화

**현재 설정 (최적화됨):**

- `base-work-flow.mdc`: 항상 적용 (필수)
- `project-context.mdc`: 항상 적용 (필수, 짧음)
- `blog-writing.mdc`: 선택적 적용 (MDX 파일에만)

**토큰 절약 효과:**

- MDX 파일 작업 시: 3개 규칙 모두 로드
- 일반 개발 시: 2개 규칙만 로드 (약 30% 절약)

### 3. 규칙 파일 크기

**권장:**

- 각 규칙 파일은 50-300줄 이하
- 너무 길면 여러 파일로 분리

**현재 파일 크기:**

- `base-work-flow.mdc`: 261줄 ✅
- `project-context.mdc`: 48줄 ✅
- `blog-writing.mdc`: 87줄 ✅

## 규칙 확인 방법

### Cursor UI에서 확인

1. Cursor 설정 열기
2. Rules 섹션 확인
3. 활성화된 규칙 목록 확인

### 수동 확인

1. `.cursor/rules/` 폴더 열기
2. 각 `.mdc` 파일의 frontmatter 확인
3. `alwaysApply`와 `globs` 설정 확인

## 문제 해결

### 규칙이 적용되지 않는 경우

1. **파일 패턴 확인**
   - `globs` 패턴이 올바른지 확인
   - 파일 경로가 패턴과 일치하는지 확인

2. **프로젝트 루트 확인**
   - `.cursor/rules/` 폴더가 프로젝트 루트에 있는지 확인
   - Cursor가 올바른 프로젝트를 열었는지 확인

3. **파일 형식 확인**
   - 파일 확장자가 `.mdc`인지 확인
   - Frontmatter 형식이 올바른지 확인

4. **재시작**
   - Cursor 재시작
   - 프로젝트 다시 열기

## 예시: 새로운 규칙 추가

### 예시 1: CSS 파일에만 적용

```markdown
---
description: CSS 작성 규칙
globs: **/*.css
alwaysApply: false
---

# CSS 규칙

- 다크모드 클래스 필수 (`dark:`)
- 모바일 우선 반응형
```

### 예시 2: 테스트 파일에만 적용

```markdown
---
description: 테스트 작성 규칙
globs: **/*.{test,spec}.{ts,tsx}
alwaysApply: false
---

# 테스트 규칙

- Jest + React Testing Library 사용
- 테스트는 사용자 관점에서 작성
```

### 예시 3: 특정 폴더에만 적용

```markdown
---
description: 습관 관리 기능 규칙
globs: src/app/habits/**/*
alwaysApply: false
---

# 습관 관리 규칙

- HabitsProvider 캐시 사용 필수
- 날짜는 dateUtils 사용
```

## 요약

- **항상 적용**: 핵심 규칙만 (`alwaysApply: true`)
- **선택적 적용**: 특정 파일 타입에만 (`globs` 사용)
- **규칙 분리**: 목적별로 파일 분리
- **토큰 절약**: 필요한 경우에만 규칙 로드
