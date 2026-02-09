# 습관 컴포넌트 리팩토링 계획

## 개요

습관 관련 컴포넌트들의 코드 중복을 제거하고 구조를 개선하여 유지보수성을 향상시킵니다.

**주요 목표:**
- 중복 로직 제거 (통계 계산, 상수, 타입 정의)
- 코드 재사용성 향상
- 유지보수성 향상
- 타입 일관성 확보

## 개선 항목

### 1. 통계 계산 로직 추출 (우선순위: 높음)

**목표:**
- 중복된 통계 계산 로직 제거
- 코드 재사용성 향상
- 유지보수성 향상 (로직 변경 시 한 곳만 수정)

**문제점:**
- `HabitStats.tsx`와 `PastHabitCard.tsx`에 거의 동일한 통계 계산 로직이 중복됨
- 총 일수 계산, 완료 일수 계산, 완료율 계산, 최대 연속 달성 일수 계산이 두 곳에 존재
- 로직 변경 시 두 곳을 모두 수정해야 하는 위험

**해결 방안:**
- 통계 계산 로직을 유틸리티 함수로 추출
- `utils/habitStats.ts` 파일 생성
- 재사용 가능한 함수들로 분리하여 중복 제거

**작업 내용:**

1. `src/app/lib/utils/habitStats.ts` 파일 생성
2. 통계 계산 로직 함수화:
   - `calculateTotalDays(habit: Habit): number` - 총 일수 계산
   - `calculateCompletedDays(records: HabitRecord[]): number` - 완료 일수 계산
   - `calculateCompletionRate(completedDays: number, totalDays: number): number` - 완료율 계산
   - `calculateMaxStreak(habit: Habit, records: HabitRecord[]): number` - 최대 연속 달성 일수
   - `calculateCurrentStreak(habit: Habit, records: HabitRecord[], today: string): number` - 현재 연속 달성 일수 (HabitStats 전용)
   - `calculateHabitStats(habit: Habit, records: HabitRecord[], includeCurrentStreak?: boolean): HabitStats` - 통합 함수
3. `HabitStats.tsx`에서 새 유틸리티 사용하도록 수정
4. `PastHabitCard.tsx`에서 새 유틸리티 사용하도록 수정

**영향받는 파일:**

- `src/app/components/habits/HabitStats.tsx`
- `src/app/components/habits/PastHabitCard.tsx`
- `src/app/lib/utils/habitStats.ts` (신규)

---

### 2. 상수 분리 (우선순위: 중간)

**목표:**
- 중복된 상수 정의 제거
- 일관성 확보 (색상 팔레트, 요일 레이블)
- 유지보수성 향상 (상수 변경 시 한 곳만 수정)

**문제점:**
- `create/page.tsx`와 `edit/page.tsx`에 동일한 상수들이 중복됨
  - `colorPalette` 배열 (12개 색상)
  - `weekdayLabels` 배열
- 상수 변경 시 두 파일을 모두 수정해야 함

**해결 방안:**
- 상수를 별도 파일로 분리
- `constants/habits.ts` 파일 생성
- 중앙 집중식 상수 관리로 중복 제거

**작업 내용:**

1. `src/app/lib/constants/habits.ts` 파일 생성
2. `COLOR_PALETTE` 상수 정의
3. `WEEKDAY_LABELS` 상수 정의
4. `WEEKDAY_VALUES` 상수 정의 (필요시)
5. `create/page.tsx`에서 상수 import하여 사용
6. `edit/page.tsx`에서 상수 import하여 사용

**영향받는 파일:**

- `src/app/habits/create/page.tsx`
- `src/app/habits/edit/page.tsx`
- `src/app/lib/constants/habits.ts` (신규)

---

### 3. 타입 정의 통합 (우선순위: 중간)

**목표:**
- 중복된 타입 정의 제거
- 타입 일관성 확보
- 단일 소스 원칙 준수 (Single Source of Truth)

**문제점:**
- `HabitCard.tsx`에서 `Habit` 타입을 로컬로 재정의 (이미 `types.ts`에 정의되어 있음)
- `HabitStats.tsx`와 `PastHabitCard.tsx`에 각각 `Stats`/`HabitStats` 인터페이스 정의
- 타입 불일치 가능성 및 유지보수 어려움

**해결 방안:**
- 모든 타입을 `types.ts`에 통합
- 각 컴포넌트에서 `types.ts`에서 import하여 사용
- 중복 타입 정의 제거로 일관성 확보

**작업 내용:**

1. `src/app/components/habits/types.ts`에 `HabitStats` 인터페이스 추가
2. `HabitCard.tsx`에서 로컬 타입 정의 제거하고 `types.ts`에서 import
3. `HabitStats.tsx`에서 로컬 `Stats` 인터페이스 제거하고 `types.ts`에서 import
4. `PastHabitCard.tsx`에서 로컬 `HabitStats` 인터페이스 제거하고 `types.ts`에서 import

**영향받는 파일:**

- `src/app/components/habits/types.ts`
- `src/app/components/habits/HabitCard.tsx`
- `src/app/components/habits/HabitStats.tsx`
- `src/app/components/habits/PastHabitCard.tsx`

---

### 4. 에러 처리 및 로딩 패턴 통일 (우선순위: 낮음)

**문제점:**

- 여러 컴포넌트에서 `mounted` 상태를 동일하게 사용
- 에러 처리 패턴이 약간씩 다름

**해결 방안:**

- 커스텀 훅으로 추출 (선택사항, 현재도 충분히 동작하므로 우선순위 낮음)

**작업 내용:**

- 향후 필요시 진행 (현재는 생략)

**영향받는 파일:**

- 없음 (향후 작업)

---

## 작업 순서

### Phase 1: 통계 계산 로직 추출

1. `src/app/lib/utils/habitStats.ts` 파일 생성 및 함수 구현
2. `types.ts`에 `HabitStats` 인터페이스 추가
3. `HabitStats.tsx` 리팩토링
4. `PastHabitCard.tsx` 리팩토링
5. 테스트 및 검증

### Phase 2: 상수 분리

1. `src/app/lib/constants/habits.ts` 파일 생성
2. `create/page.tsx` 리팩토링
3. `edit/page.tsx` 리팩토링
4. 테스트 및 검증

### Phase 3: 타입 정의 통합

1. `types.ts`에 필요한 타입 추가
2. `HabitCard.tsx` 리팩토링
3. `HabitStats.tsx` 타입 import 수정
4. `PastHabitCard.tsx` 타입 import 수정
5. 테스트 및 검증

## 기술 스택

- TypeScript
- React 19
- Next.js 16

## 예상 작업 시간

- Phase 1: 1-2시간
- Phase 2: 30분
- Phase 3: 30분

**총 예상 시간**: 2-3시간

## 체크리스트

### Phase 1: 통계 계산 로직 추출 (중복 로직 제거)

- [x] `src/app/lib/utils/habitStats.ts` 파일 생성
- [x] 통계 계산 함수들 구현 (`calculateTotalDays`, `calculateCompletedDays`, `calculateCompletionRate`, `calculateMaxStreak`, `calculateCurrentStreak`, `calculateHabitStats`)
- [x] `types.ts`에 `HabitStats` 인터페이스 추가
- [x] `types.ts`에 `HabitRecord` 인터페이스 추가
- [x] `HabitStats.tsx` 리팩토링 (중복 로직 제거, 유틸리티 함수 사용)
- [x] `PastHabitCard.tsx` 리팩토링 (중복 로직 제거, 유틸리티 함수 사용)
- [x] `HabitCard.tsx` 타입 import 수정 (로컬 타입 제거)
- [x] 타입 오류 확인 (린터 통과)
- [ ] 기능 동작 확인 (수동 테스트 필요)

### Phase 2: 상수 분리 (중복 상수 제거)

- [x] `src/app/lib/constants/habits.ts` 파일 생성
- [x] `COLOR_PALETTE` 상수 정의 및 export
- [x] `WEEKDAY_LABELS` 상수 정의 및 export
- [x] `WEEKDAY_VALUES` 상수 정의 및 export
- [x] `create/page.tsx` 리팩토링 (중복 상수 제거, import 사용)
- [x] `edit/page.tsx` 리팩토링 (중복 상수 제거, import 사용)
- [x] 타입 오류 확인 (린터 통과)
- [ ] 기능 동작 확인 (수동 테스트 필요)

### Phase 3: 타입 정의 통합 (중복 타입 제거)

- [x] `types.ts`에 `HabitStats` 인터페이스 추가 (Phase 1에서 완료)
- [x] `types.ts`에 `HabitRecord` 인터페이스 추가 (Phase 1에서 완료)
- [x] `HabitCard.tsx` 리팩토링 (로컬 타입 제거, `types.ts`에서 import)
- [x] `HabitStats.tsx` 타입 import 수정 (로컬 `Stats` 인터페이스 제거, `types.ts`에서 import)
- [x] `PastHabitCard.tsx` 타입 import 수정 (로컬 `HabitStats` 인터페이스 제거, `types.ts`에서 import)
- [x] 타입 오류 확인 (린터 통과)
- [ ] 기능 동작 확인 (수동 테스트 필요)

## 참고 사항

- 각 Phase는 독립적으로 테스트 가능하도록 진행
- 리팩토링 후 기존 기능이 정상 동작하는지 반드시 확인
- TypeScript 타입 오류가 없도록 주의
- 작은 단위로 커밋하여 진행
