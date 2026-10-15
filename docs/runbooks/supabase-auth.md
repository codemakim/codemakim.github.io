# Supabase 인증 복구 런북

## 변경 기록

- 2026-10-15: 프로젝트 재개와 Google 로그인 성공을 사용자에게 확인하고 복구 절차를 정리함.

## 적용 범위

- Supabase 프로젝트: [codemakim's Blog 대시보드](https://supabase.com/dashboard/project/wyvnxecfholpwclqqrih) (`wyvnxecfholpwclqqrih`)
- 프로덕션 사이트: `https://codemakim.github.io/`
- 최신 확인: 2026-10-15, 사용자 확인으로 프로젝트 재개 및 Google 로그인 성공

## 사이트 연결 오류 또는 프로젝트 중지

1. Supabase 대시보드에서 위 프로젝트의 상태를 확인한다.
2. 상태가 Paused이면 **Resume project**를 선택하고 재개가 끝날 때까지 기다린다. 중지된 프로젝트는 대시보드에서 재개할 수 있고, 데이터와 설정은 기존 상태로 돌아온다.
3. 프로젝트가 활성 상태가 된 뒤 블로그의 로그인 화면에서 Google 로그인을 다시 확인한다.

Supabase Free 플랜은 최근 7일 동안 사용자 데이터베이스 활동이 부족하면 자동 중지될 수 있다. 따라서 Google 계정 로그인만으로 중지를 막는다고 보장할 수는 없다. 경고 메일이 왔으면 대시보드 상태부터 확인한다. 복구 가능 기간 등 정책은 바뀔 수 있으니 [Supabase 프로젝트 중지 안내](https://supabase.com/docs/guides/platform/free-project-pausing)를 기준으로 확인한다.

## 프로젝트가 활성인데 OAuth가 실패할 때

1. **Authentication → URL Configuration**
   - Site URL: `https://codemakim.github.io/`
   - Redirect URLs: `https://codemakim.github.io/`, `http://localhost:3000/`
   - 앱의 Google 로그인 코드는 현재 출처의 루트 URL(끝에 `/`)을 `redirectTo`로 사용한다. 허용 목록에 이 주소가 있어야 한다.
2. **Authentication → Providers → Google**에서 provider가 활성화됐는지 확인한다. Client ID와 Secret은 대시보드에만 두고 로그나 문서에 복사하지 않는다.
3. Google Cloud Console의 웹 OAuth 클라이언트에서 Authorized JavaScript origins에 `https://codemakim.github.io`가 있는지 확인한다. Authorized redirect URIs에는 Supabase Google Provider 화면에 표시된 callback URL을 등록한다.
4. 로그인 화면에서 Google 로그인을 마치고 프로덕션 사이트 루트로 돌아오는지, 앱에서 로그인 상태가 표시되는지 확인한다.

Supabase 허용 주소와 앱의 `redirectTo`는 일치해야 한다. Google의 callback URI와 앱으로 돌아오는 주소는 서로 다른 설정이다. 상세 기준은 [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)와 [Supabase Google 로그인 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)을 따른다.
