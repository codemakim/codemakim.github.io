# 습관 관리 데이터베이스 설계

## 테이블 구조

### 1. `habits` 테이블

습관 기본 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 습관 고유 ID |
| user_id | UUID | NOT NULL, FK → auth.users | 사용자 ID |
| title | TEXT | NOT NULL | 습관 제목 |
| description | TEXT | | 습관 설명 (선택) |
| color | TEXT | NOT NULL | 색상 코드 (hex, 예: #3B82F6) |
| start_date | DATE | NOT NULL | 시작일 |
| end_date | DATE | NOT NULL | 종료일 |
| weekdays | INTEGER[] | NOT NULL | 수행 요일 배열 [0,1,2,3,4,5,6] (JavaScript Date.getDay()와 동일: 0=일요일, 1=월요일, ..., 6=토요일) |
| goal_type | TEXT | | 목표 종류 (completion_rate, streak_days, total_completions) |
| goal_value | INTEGER | | 목표 값 |
| target_time | TIME | | 목표 수행 시간 (알림용) |
| priority | INTEGER | DEFAULT 0 | 우선순위 (낮을수록 높음, 향후 사용) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정일시 |

**인덱스:**

- `user_id` (조회 성능)
- `user_id, start_date, end_date` (복합 인덱스, 기간 조회)

**제약조건:**

- 사용자당 최대 습관 개수: 10개 (애플리케이션 레벨에서 체크)
- `start_date <= end_date` (체크 제약조건)

### 2. `habit_records` 테이블

습관 수행 기록을 저장하는 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 기록 고유 ID |
| habit_id | UUID | NOT NULL, FK → habits(id) ON DELETE CASCADE | 습관 ID |
| date | DATE | NOT NULL | 기록 날짜 (YYYY-MM-DD) |
| completed | BOOLEAN | NOT NULL, DEFAULT false | 완료 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정일시 |

**제약조건:**

- UNIQUE(habit_id, date) - 같은 습관의 같은 날짜는 중복 불가

**인덱스:**

- `habit_id` (조회 성능)
- `habit_id, date` (복합 인덱스, 날짜별 조회)

### 3. `user_stats` 테이블

사용자 통계 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 통계 고유 ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | 사용자 ID |
| total_xp | INTEGER | NOT NULL, DEFAULT 0 | 총 경험치 |
| current_level | INTEGER | NOT NULL, DEFAULT 1 | 현재 레벨 |
| total_habits | INTEGER | NOT NULL, DEFAULT 0 | 총 습관 개수 |
| total_completions | INTEGER | NOT NULL, DEFAULT 0 | 총 완료 횟수 |
| longest_streak | INTEGER | NOT NULL, DEFAULT 0 | 최장 연속 달성 일수 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정일시 |

**제약조건:**

- UNIQUE(user_id) - 사용자당 하나의 통계 레코드만 존재

**인덱스:**

- `user_id` (조회 성능)

### 4. `achievement_definitions` 테이블

배지 정의를 저장하는 테이블입니다. 모든 사용자가 공유합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 배지 정의 고유 ID |
| code | TEXT | NOT NULL, UNIQUE | 배지 코드 (badge_7days, badge_30days 등) |
| name | TEXT | NOT NULL | 배지 이름 |
| description | TEXT | NOT NULL | 배지 설명 |
| icon_type | TEXT | NOT NULL, DEFAULT 'emoji' | 아이콘 타입 (emoji, svg, image_url) |
| icon_value | TEXT | NOT NULL | 아이콘 값 (이모지, SVG 코드, 이미지 URL) |
| condition_type | TEXT | NOT NULL | 조건 타입 (streak_days, completion_rate, total_completions 등) |
| condition_value | INTEGER | NOT NULL | 조건 값 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 활성화 여부 |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정일시 |

**인덱스:**

- `code` (조회 성능)
- `is_active, display_order` (활성 배지 조회)

### 5. `user_achievements` 테이블

사용자가 획득한 배지 기록을 저장하는 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 업적 고유 ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | 사용자 ID |
| achievement_id | UUID | NOT NULL, FK → achievement_definitions(id) | 배지 정의 ID |
| earned_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 획득일시 |
| metadata | JSONB | | 업적 관련 추가 정보 (습관 ID, 달성 수치 등) |

**인덱스:**

- `user_id` (조회 성능)
- `user_id, earned_at` (복합 인덱스, 최신순 조회)

## RLS (Row Level Security) 정책

### `habits` 테이블

```sql
-- SELECT: 자신의 습관만 조회 가능
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 자신의 습관만 생성 가능
CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 자신의 습관만 수정 가능
CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 자신의 습관만 삭제 가능
CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);
```

### `habit_records` 테이블

```sql
-- SELECT: 자신의 습관의 기록만 조회 가능
CREATE POLICY "Users can view own habit records"
  ON habit_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_records.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- INSERT: 자신의 습관의 기록만 생성 가능
CREATE POLICY "Users can insert own habit records"
  ON habit_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_records.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- UPDATE: 자신의 습관의 기록만 수정 가능
CREATE POLICY "Users can update own habit records"
  ON habit_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_records.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- DELETE: 자신의 습관의 기록만 삭제 가능
CREATE POLICY "Users can delete own habit records"
  ON habit_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_records.habit_id
      AND habits.user_id = auth.uid()
    )
  );
```

### `user_stats` 테이블

```sql
-- SELECT: 자신의 통계만 조회 가능
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 자신의 통계만 생성 가능
CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 자신의 통계만 수정 가능
CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);
```

### `achievement_definitions` 테이블

```sql
-- SELECT: 모든 사용자가 조회 가능 (공개)
CREATE POLICY "Anyone can view achievement definitions"
  ON achievement_definitions FOR SELECT
  USING (is_active = true);

-- INSERT/UPDATE/DELETE: 관리자만 가능 (향후 구현)
-- 초기에는 Supabase 대시보드에서 직접 관리
```

### `user_achievements` 테이블

```sql
-- SELECT: 자신의 업적만 조회 가능
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 자신의 업적만 생성 가능
CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 초기 데이터

### `achievement_definitions` 초기 데이터

```sql
INSERT INTO achievement_definitions (code, name, description, icon_type, icon_value, condition_type, condition_value, display_order) VALUES
('badge_first_habit', '초보자', '첫 습관을 등록했습니다', 'emoji', '🎯', 'total_habits', 1, 1),
('badge_7days', '꾸준함', '7일 연속 달성했습니다', 'emoji', '🔥', 'streak_days', 7, 2),
('badge_30days', '불굴의 의지', '30일 연속 달성했습니다', 'emoji', '💪', 'streak_days', 30, 3),
('badge_100days', '장기 러너', '100일 연속 달성했습니다', 'emoji', '🏆', 'streak_days', 100, 4),
('badge_perfect_week', '주간 완벽주의자', '한 주 동안 모든 습관을 완료했습니다', 'emoji', '⭐', 'perfect_week', 1, 5),
('badge_perfect_month', '월간 완벽주의자', '한 달 동안 모든 습관을 완료했습니다', 'emoji', '👑', 'perfect_month', 1, 6),
('badge_10habits', '다작가', '습관 10개를 등록했습니다', 'emoji', '📚', 'total_habits', 10, 7),
('badge_100completions', '백전백승', '총 100번 완료했습니다', 'emoji', '💯', 'total_completions', 100, 8);
```

## SQL 생성 스크립트

전체 테이블 및 RLS 정책을 생성하는 SQL 스크립트입니다.

```sql
-- ===== 1. habits 테이블 생성 =====
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekdays INTEGER[] NOT NULL,
  goal_type TEXT,
  goal_value INTEGER,
  target_time TIME,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_dates CHECK (start_date <= end_date)
);

-- 인덱스
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_dates ON habits(user_id, start_date, end_date);

-- RLS 활성화
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- ===== 2. habit_records 테이블 생성 =====
CREATE TABLE habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- 인덱스
CREATE INDEX idx_habit_records_habit_id ON habit_records(habit_id);
CREATE INDEX idx_habit_records_habit_date ON habit_records(habit_id, date);

-- RLS 활성화
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own habit records" ON habit_records FOR SELECT
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_records.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can insert own habit records" ON habit_records FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_records.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can update own habit records" ON habit_records FOR UPDATE
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_records.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can delete own habit records" ON habit_records FOR DELETE
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_records.habit_id AND habits.user_id = auth.uid()));

-- ===== 3. user_stats 테이블 생성 =====
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_habits INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- RLS 활성화
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- ===== 4. achievement_definitions 테이블 생성 =====
CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'emoji',
  icon_value TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_achievement_definitions_code ON achievement_definitions(code);
CREATE INDEX idx_achievement_definitions_active ON achievement_definitions(is_active, display_order);

-- RLS 활성화
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (공개)
CREATE POLICY "Anyone can view active achievements" ON achievement_definitions FOR SELECT USING (is_active = true);

-- ===== 5. user_achievements 테이블 생성 =====
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- 인덱스
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_user_earned ON user_achievements(user_id, earned_at);

-- RLS 활성화
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== 6. 초기 배지 데이터 삽입 =====
INSERT INTO achievement_definitions (code, name, description, icon_type, icon_value, condition_type, condition_value, display_order) VALUES
('badge_first_habit', '초보자', '첫 습관을 등록했습니다', 'emoji', '🎯', 'total_habits', 1, 1),
('badge_7days', '꾸준함', '7일 연속 달성했습니다', 'emoji', '🔥', 'streak_days', 7, 2),
('badge_30days', '불굴의 의지', '30일 연속 달성했습니다', 'emoji', '💪', 'streak_days', 30, 3),
('badge_100days', '장기 러너', '100일 연속 달성했습니다', 'emoji', '🏆', 'streak_days', 100, 4),
('badge_perfect_week', '주간 완벽주의자', '한 주 동안 모든 습관을 완료했습니다', 'emoji', '⭐', 'perfect_week', 1, 5),
('badge_perfect_month', '월간 완벽주의자', '한 달 동안 모든 습관을 완료했습니다', 'emoji', '👑', 'perfect_month', 1, 6),
('badge_10habits', '다작가', '습관 10개를 등록했습니다', 'emoji', '📚', 'total_habits', 10, 7),
('badge_100completions', '백전백승', '총 100번 완료했습니다', 'emoji', '💯', 'total_completions', 100, 8);
```

## 구현 순서

1. **Supabase SQL Editor에서 위 SQL 스크립트 실행**
2. **RLS 정책 확인**
3. **초기 배지 데이터 확인**
4. **테스트 데이터 삽입 및 조회 테스트**

