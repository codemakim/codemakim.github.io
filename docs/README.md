# 프로젝트 문서 인덱스

## 빠른 참조

### 새 기능 개발 시

1. `ARCHITECTURE.md` - 코드 구조, 데이터 흐름, 주요 패턴 확인
2. `ROADMAP.md` - 프로젝트 로드맵 및 현재 상태 확인
3. `features/[기능]/DESIGN.md` - 기능별 상세 설계 확인

### 데이터베이스 작업 시

- `features/habits/DATABASE.md` - 테이블 구조, RLS 정책, SQL 스크립트

### 블로그 포스트 작성 시

- `.cursor/rules/blog-writing.mdc` - 블로그 작성 규칙

## 문서 구조

### 핵심 문서

- **`ARCHITECTURE.md`**: 프로젝트 아키텍처, 코드 구조, 데이터 흐름, 주요 패턴
- **`ROADMAP.md`**: 프로젝트 로드맵, Phase별 작업, 현재 상태

### 기능별 문서 (`features/`)

- **`habits/DESIGN.md`**: 습관 관리 기능 상세 설계 (기능 스펙, 화면 설계)
- **`habits/DATABASE.md`**: 습관 관리 데이터베이스 설계 (테이블, RLS, SQL)
- **`habits/AUTH.md`**: 인증 시스템 설계

> **참고**: 기존 `HABITS_*` 파일들은 `features/habits/`로 이동되었습니다.

### 완료된 작업 (`archive/`)

- `HABITS_ARCHIVE_PLAN.md`: 과거 습관 보기 기능 구현 계획 (완료)
- `HABITS_REFACTORING_PLAN.md`: 습관 컴포넌트 리팩토링 계획 (완료)

### AI 지침 (`.cursor/rules/`)

- `base-work-flow.mdc`: 개발 워크플로우, 스타일링 규칙
- `blog-writing.mdc`: 블로그 작성 규칙
- `project-context.mdc`: 프로젝트 컨텍스트 요약

## 문서 사용 가이드

### 개발 시작 전

1. `ARCHITECTURE.md` 읽기 - 코드 구조 이해
2. `ROADMAP.md` 확인 - 현재 작업 상태 파악
3. 관련 기능 문서 확인 - 스펙 및 설계 확인

### 작업 중

- 코드 구조: `ARCHITECTURE.md` 참조
- 기능 스펙: `features/[기능]/DESIGN.md` 참조
- 데이터베이스: `features/[기능]/DATABASE.md` 참조

### 작업 완료 후

- `ROADMAP.md` 업데이트 - 작업 상태 반영
- 관련 문서 최신화 - 변경사항 반영

## 문서 업데이트 규칙

- **작업 완료 시**: `ROADMAP.md` 상태 업데이트 필수
- **스펙 변경 시**: 관련 설계 문서 업데이트
- **아키텍처 변경 시**: `ARCHITECTURE.md` 업데이트
- **완료된 계획 문서**: `archive/`로 이동 (참고용)
