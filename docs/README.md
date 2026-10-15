# 프로젝트 문서 인덱스

## 변경 기록

- 2026-10-15: 작업 워크로그와 반복 장애 런북을 인덱스에 추가하고 로드맵 기록 범위를 정리함.

## 빠른 참조

### 작업 이력과 운영 장애

- `WORKLOG.md` - 완료·확인된 주요 변경의 날짜별 요약
- `runbooks/supabase-auth.md` - Supabase 프로젝트 중지 및 Google 로그인 복구

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
- **`AI_HARNESS_LEARNING_PLAN.md`**: AI 코딩 에이전트 제어를 위한 하네스 엔지니어링 학습 계획

### 기능별 문서 (`features/`)

- **`habits/DESIGN.md`**: 습관 관리 기능 상세 설계 (기능 스펙, 화면 설계)
- **`habits/DATABASE.md`**: 습관 관리 데이터베이스 설계 (테이블, RLS, SQL)
- **`habits/AUTH.md`**: 인증 시스템 설계

> **참고**: 기존 `HABITS_*` 파일들은 `features/habits/`로 이동되었습니다.

### AI 지침 (`.cursor/rules/`)

- `base-work-flow.mdc`: 개발 워크플로우, 스타일링 규칙
- `blog-writing.mdc`: 블로그 작성 규칙
- `project-context.mdc`: 프로젝트 컨텍스트 요약

## 문서 사용 가이드

### 개발 시작 전

1. `WORKLOG.md` 최근 항목 확인 - 관련 변경과 결정 파악
2. `ARCHITECTURE.md` 읽기 - 코드 구조 이해
3. `ROADMAP.md` 확인 - 현재 단계와 마일스톤 파악
4. 관련 기능 문서 확인 - 스펙 및 설계 확인

### 반복 장애가 발생했을 때

1. `WORKLOG.md`에서 최근 발생·복구 기록을 확인한다.
2. 연결된 런북의 점검 순서를 따른다.
3. 현재 증상이 기록과 다를 때만 코드와 설정을 넓게 조사한다.

### 작업 중

- 코드 구조: `ARCHITECTURE.md` 참조
- 기능 스펙: `features/[기능]/DESIGN.md` 참조
- 데이터베이스: `features/[기능]/DATABASE.md` 참조

### 작업 완료 후

- `WORKLOG.md`에 완료·확인된 의미 있는 변경 기록
- `ROADMAP.md`는 단계나 마일스톤 상태가 달라질 때만 업데이트
- 관련 문서 최신화 - 변경사항 반영

## 문서 업데이트 규칙

- **의미 있는 변경 완료 시**: `WORKLOG.md`에 날짜, 유형, 한 줄 요약, 관련 문서나 커밋 기록
- **프로젝트 단계/마일스톤 변경 시**: `ROADMAP.md` 업데이트
- **스펙 변경 시**: 관련 설계 문서 업데이트
- **아키텍처 변경 시**: `ARCHITECTURE.md` 업데이트
- **완료된 임시 계획 문서**: 삭제하거나, 남겨야 할 결정만 `ARCHITECTURE.md`/기능별 문서에 반영
