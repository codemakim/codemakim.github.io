# 영어 퀘스트 기록 저장

## 변경 기록

- 2026-10-16: 기존 스키마를 유지한 통합 학습·복습·중간 저장 레코드의 의미와 완료 판정을 추가함.

`english_sessions`는 로그인한 사용자의 완료·복습·통합 학습 중간 기록을 저장합니다. 문제와 해설은 정적 콘텐츠로 앱에 포함되며 사용자 입력 문장 원문은 저장하지 않습니다.

## 스키마

```sql
create table if not exists public.english_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('lesson', 'review')),
  lesson_id text,
  correct_count smallint not null check (correct_count >= 0),
  question_count smallint not null check (question_count > 0 and correct_count <= question_count),
  xp_earned integer not null check (xp_earned >= 0),
  wrong_question_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists english_sessions_user_created_idx
  on public.english_sessions (user_id, created_at desc);

alter table public.english_sessions enable row level security;

create policy "Users can view own English sessions"
  on public.english_sessions for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own English sessions"
  on public.english_sessions for insert to authenticated
  with check (auth.uid() = user_id);

grant select, insert on public.english_sessions to authenticated;
```

Supabase Dashboard의 SQL Editor에서 위 SQL을 한 번 실행합니다. RLS는 로그인한 사용자가 자신의 기록만 조회하고 추가하도록 제한합니다. Authentication → URL Configuration의 Redirect URLs에 `https://codemakim.github.io/english/`도 등록해 Google 로그인 후 퀘스트 화면으로 돌아오게 합니다. 문제와 해설은 앱의 정적 콘텐츠이며, 사용자가 입력한 문장은 저장하지 않습니다.

## 레코드 구분과 이어하기

- 통합 회차 완료: `activity_type: lesson`, `lesson_id: path-w1-d1` 같은 안정적인 회차 ID. 전체 문항 수와 정답당 10 XP를 저장한다. 같은 실행의 재시도는 같은 UUID로 `upsert(ignoreDuplicates: true)`하여 중복을 막는다.
- 통합 중간 저장: `activity_type: review`, 해당 통합 회차 ID, `xp_earned: 0`. `question_count`는 처음부터 채점한 접두 구간 길이, `correct_count`와 `wrong_question_ids`는 그 구간의 누계다. 0문항은 저장하지 않는다. 매 저장은 새 UUID이며 최신 중간 기록의 다음 문항부터 이어간다. 최종 완료 기록은 별도 UUID로 저장한다.
- 일반 통합 복습·오답 재연습: `activity_type: review`, `lesson_id: path-review`. 완료 진도를 올리지 않는다.
- 보조 단어 완료는 `vocabulary-{묶음 ID}`, 단어 복습은 `vocabulary-review`, 보조 문장 완료는 기존 레슨 ID, 문장 복습은 `null`이다.

완료 판정은 현재 회차 전체 문항 수 이상인 `lesson` 기록만 사용한다. 중간 저장·복습·기존 보조 완료는 새 통합 회차를 해금하지 않는다. XP는 모든 기록의 합계를 유지한다. 중간 저장과 같은 날 복습도 활동일에는 포함되지만 새 회차 완료로 표시하지 않는다.

스키마 변경과 기존 기록 삭제는 없다. 입력 원문·녹음·발음 점수는 저장하지 않는다. 현재 접속의 듣기·힌트·말하기 자기 확인은 영속 성취 데이터가 아니다. 이어하기는 문항 순서를 전제로 하므로 진행 중인 회차의 문항 순서·ID를 변경할 때는 별도 이관이 필요하다.
