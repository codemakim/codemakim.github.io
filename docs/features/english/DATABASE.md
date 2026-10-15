# 영어 퀘스트 기록 저장

`english_sessions`는 로그인한 사용자의 완료 기록만 저장합니다. 문제와 해설은 정적 콘텐츠로 앱에 포함되며 사용자 입력 문장 원문은 저장하지 않습니다.

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
