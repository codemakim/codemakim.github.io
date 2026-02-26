# Claude Code 작업 지침

> 이 파일은 Claude Code가 모든 세션에서 자동으로 로드하는 프로젝트 지침입니다.
> (구 `.cursor/rules/base-work-flow.mdc` + `project-context.mdc` 통합본)

---

## 프로젝트 개요

- **스택**: Next.js 16 + Contentlayer2 + MDX + Tailwind CSS 4 + TypeScript 엄격 모드
- **배포**: GitHub Pages 정적 배포 (`output: 'export'`, `trailingSlash: true`)
- **백엔드**: Supabase (습관 관리 기능)
- **폰트**: Geist, **다크모드** 지원 필수

---

## 프로젝트 컨텍스트

### 핵심 아키텍처

- **HabitsProvider**: 전역 습관 캐시 (`Map<string, Habit>`) — 컴포넌트에서 직접 DB 호출 금지
- **useHabits**: HabitsProvider 캐시에서 오늘 습관 필터링
- **날짜 처리**: `YYYY-MM-DD` 문자열 직접 사용 (타임존 문제 방지), `Date` 객체 비교 금지
  - `dateUtils.ts`의 `formatDateToYYYYMMDD`, `compareDateStrings` 사용

### 주요 파일 경로

| 영역 | 경로 |
|------|------|
| 습관 전역 캐시 | `src/app/components/habits/HabitsProvider.tsx` |
| 오늘 습관 훅 | `src/app/components/habits/useHabits.ts` |
| 날짜 유틸 | `src/app/lib/dateUtils.ts` |
| 습관 통계 | `src/app/lib/utils/habitStats.ts` |
| 게임 페이지 | `src/app/games/` (5종: 2048, snake, minesweeper, memory, block-drop) |
| 게임 공통 컴포넌트 | `src/app/components/games/` |

### 참고 문서

- **아키텍처**: `docs/ARCHITECTURE.md` — 코드 구조, 데이터 흐름 (코드 찾기 전 필수 확인)
- **습관 설계**: `docs/features/habits/DESIGN.md`
- **게임 설계**: `docs/features/games/DESIGN.md`
- **DB 구조**: `docs/features/habits/DATABASE.md`
- **로드맵**: `docs/ROADMAP.md`

### 코드 탐색 순서

1. `docs/ARCHITECTURE.md` → 디렉토리 구조, 핵심 파일 확인
2. 기능 설계 문서 → 스펙 확인
3. 실제 코드 → 아키텍처 문서의 파일 경로 참조

---

## 핵심 코딩 규칙

- 서버 컴포넌트 기본, 클라이언트 컴포넌트는 필요 시에만 `"use client"`
- MDX frontmatter: `title`(필수), `date`(필수), `description`, `tags`
- **다크모드 필수**: 모든 색상에 `dark:` 클래스 추가
- **모바일 우선** 반응형, `max-w-4xl mx-auto px-4` 기본 레이아웃
- 습관 데이터는 HabitsProvider 캐시에서만 가져오기

### 모바일 UX 규칙

- **Sticky 헤더**: 데스크톱만 고정
  - ✅ `className="header md:sticky md:top-0 z-50"`
  - ❌ `className="header sticky top-0 z-50"`
- **스크롤 이벤트**: `.app-wrapper`의 `scrollTop` 사용 (`window.scrollY` 아님)

### 스타일링 패턴

```
색상: bg-white dark:bg-gray-900 / text-gray-900 dark:text-white
태그: text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200
제목(홈): text-3xl font-bold
제목(포스트): text-4xl font-bold
```

### 태그 관리 원칙

- 기존 태그 활용 우선, 새 태그는 향후 3개 이상 포스트에 쓸 경우만 생성
- 기술: `React`, `Next.js`, `JavaScript`, `TypeScript`, `Vue`, `Flutter`
- 난이도: `초급`, `중급`, `고급`
- 분야: `프론트엔드`, `백엔드`, `Testing`, `성능`

---

## 개발 워크플로우 (필수 준수)

### 작업 전

1. **계획 먼저 제시**: 요구사항 분석, 파일 구조, 데이터 흐름 명시
2. 사용자 승인 후 구현 시작

### 작업 중

- TypeScript 오류 확인 → `npm run build` 순서로 진행
- 스타일 수정 시 체크리스트:
  - [ ] 라이트/다크모드 모두 확인
  - [ ] 모바일/데스크톱 반응형 확인
  - [ ] 기존 기능에 영향 없는지 확인

### 빌드 & 배포

```bash
npm run dev    # 개발 서버 (Turbopack)
npm run build  # 정적 빌드 (GitHub Pages용)
```

---

## 금지사항

- frontmatter에서 `title`, `date` 누락
- `dark:` 클래스 생략
- 클라이언트 컴포넌트 남용
- 사용자 승인 없이 다음 단계 진행
- HabitsProvider 우회하여 직접 DB 호출
- `Date` 객체로 날짜 비교
- TypeScript 오류 미확인 상태로 빌드/배포
- CSS 모듈화 시 백업 없이 작업
- 태그 중복 생성

---

## 언어 설정

- **모든 답변은 한글로 작성**
- 블로그 포스트 작성 시 추가 규칙은 `content/CLAUDE.md` 참조
