# 인증 시스템 설계

> **상태**: ✅ 구현 완료  
> **참고**: 프로젝트 아키텍처는 `docs/ARCHITECTURE.md` 참조

## 1. 인증 전략

### 1.1 Supabase Auth 사용

**이유:**

- Supabase가 제공하는 완전한 인증 솔루션
- 소셜 로그인 지원 (Google, GitHub)
- 세션 관리 자동화
- RLS (Row Level Security)와 완벽 통합

**제약사항:**

- Next.js 정적 빌드 (`output: 'export'`) 사용 중
- 서버 사이드 미들웨어 사용 불가
- **해결책**: 클라이언트 사이드 인증만 사용

### 1.2 인증 방식

**현재 구현:**

- 소셜 로그인 (Google, GitHub)
- 클라이언트 사이드 인증
- Supabase Auth 세션 관리

## 2. 인증 플로우

### 2.1 로그인 플로우

```
사용자 → /auth/login
  ↓
소셜 로그인 버튼 클릭 (Google/GitHub)
  ↓
Supabase Auth에 로그인 요청
  ↓
세션 생성
  ↓
인증 상태 업데이트 (AuthProvider)
  ↓
메인 페이지(`/`)로 리다이렉트
```

### 2.2 보호된 라우트 접근 플로우

```
사용자 → /habits 접근 시도
  ↓
ProtectedRoute 컴포넌트가 인증 상태 체크
  ↓
미인증?
  ├─ 예 → /auth/login으로 리다이렉트
  └─ 아니오 → 습관 목록 표시
```

## 3. 컴포넌트 구조

```
components/auth/
├── AuthProvider.tsx        # 인증 상태 관리 (Context)
├── ProtectedRoute.tsx      # 보호된 라우트 래퍼
└── OAuthButton.tsx         # 소셜 로그인 버튼

app/auth/
└── login/
    └── page.tsx            # 로그인 페이지 (구글/깃허브 버튼)

app/profile/
└── page.tsx                # 프로필 페이지 (사용자 정보, 로그아웃 버튼)
```

## 4. 인증 상태 관리

### 4.1 AuthProvider (React Context)

**역할:**

- 전역 인증 상태 관리
- Supabase 세션 관리
- 인증 상태 변경 감지

**상태:**

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}
```

**메서드:**

- `signInWithGoogle()` - Google 로그인
- `signInWithGitHub()` - GitHub 로그인
- `signOut()` - 로그아웃
- `getSession()` - 현재 세션 조회

### 4.2 ProtectedRoute 컴포넌트

**역할:**

- 인증이 필요한 페이지를 보호
- 미인증 시 로그인 페이지로 리다이렉트
- 이전 경로 저장 (로그인 후 복귀)

## 5. Supabase Auth 설정

### 5.1 Supabase 대시보드 설정

**Authentication → Settings:**

- Site URL: `http://localhost:3000` (개발)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback` (프로덕션)

**Authentication → Providers:**

- Google: 활성화
- GitHub: 활성화

## 6. 사용자 프로필 관리

### 6.1 user_stats 초기화

**회원가입 시:**

- `user_stats` 테이블에 초기 레코드 자동 생성
- `total_xp = 0`, `current_level = 1`, `total_habits = 0` 등

**구현 방법:**

- Supabase Database Trigger 사용 (자동)

### 6.2 사용자 정보

**Supabase Auth에서 제공:**

- `id` (UUID)
- `email`
- `created_at`
- `email_confirmed_at` (이메일 인증 시)

## 7. 보안 고려사항

### 7.1 클라이언트 사이드 인증의 한계

**문제:**

- 정적 빌드에서는 서버 사이드 인증 체크 불가
- 클라이언트에서 인증 상태를 숨길 수 없음

**해결책:**

- **RLS (Row Level Security)**: 서버 사이드에서 데이터 보안 보장
- 클라이언트는 UX를 위한 인증 체크만 수행
- 실제 데이터 접근은 RLS가 차단

### 7.2 세션 관리

**Supabase Auth 자동 관리:**

- Access Token (JWT)
- Refresh Token
- 자동 갱신

**로컬 스토리지:**

- Supabase가 자동으로 세션 저장
- 브라우저 새로고침 시 자동 복원

## 8. 구현 완료 사항

### Phase 1: 기본 인증 (완료)

1. ✅ AuthProvider 구현 (인증 상태 관리)
2. ✅ 로그인 페이지 (`/auth/login`) - 구글/깃허브 소셜 로그인
3. ✅ ProtectedRoute 컴포넌트 (보호된 라우트)
4. ✅ 헤더 톱니바퀴 아이콘 (인증 상태에 따라 표시)
5. ✅ 프로필 페이지 (`/profile`) - 로그아웃 버튼
6. ✅ user_stats 초기화 (Database Trigger)
7. ✅ Hydration 에러 수정

## 9. 참고 문서

- **프로젝트 아키텍처**: `docs/ARCHITECTURE.md` - 코드 구조, 데이터 흐름
- **데이터베이스 설계**: `docs/features/habits/DATABASE.md` - user_stats 테이블 구조
- **프로젝트 로드맵**: `docs/ROADMAP.md` - Phase 1.2 인증 시스템 구현
