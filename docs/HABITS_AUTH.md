# 인증 시스템 설계

## 1. 인증 전략

### 1.1 Supabase Auth 사용

**이유:**

- Supabase가 제공하는 완전한 인증 솔루션
- 이메일/비밀번호, 소셜 로그인 지원
- 세션 관리 자동화
- RLS (Row Level Security)와 완벽 통합

**제약사항:**

- Next.js 정적 빌드 (`output: 'export'`) 사용 중
- 서버 사이드 미들웨어 사용 불가
- **해결책**: 클라이언트 사이드 인증만 사용

### 1.2 인증 방식

**1단계 (초기):**

- 이메일/비밀번호 로그인
- 이메일/비밀번호 회원가입
- 이메일 인증 (선택)

**2단계 (향후):**

- 소셜 로그인 (Google, GitHub)
- 비밀번호 재설정
- 프로필 관리

## 2. 인증 플로우

### 2.1 회원가입 플로우

```
사용자 → /auth/signup
  ↓
이메일, 비밀번호 입력
  ↓
Supabase Auth에 회원가입 요청
  ↓
이메일 인증 (선택)
  ↓
자동 로그인
  ↓
user_stats 테이블에 초기 레코드 생성
  ↓
/habits로 리다이렉트
```

### 2.2 로그인 플로우

```
사용자 → /auth/login
  ↓
이메일, 비밀번호 입력
  ↓
Supabase Auth에 로그인 요청
  ↓
세션 생성
  ↓
인증 상태 업데이트 (Context)
  ↓
이전 경로로 리다이렉트 (또는 /habits)
```

### 2.3 보호된 라우트 접근 플로우

```
사용자 → /habits 접근 시도
  ↓
ProtectedRoute 컴포넌트가 인증 상태 체크
  ↓
미인증?
  ├─ 예 → /auth/login으로 리다이렉트 (이전 경로 저장)
  └─ 아니오 → 습관 목록 표시
```

## 3. 컴포넌트 구조

```
components/auth/
├── AuthProvider.tsx        # 인증 상태 관리 (Context)
└── ProtectedRoute.tsx      # 보호된 라우트 래퍼

app/auth/
└── login/
    └── page.tsx            # 로그인 페이지 (구글/깃허브 버튼)

app/profile/
└── page.tsx                # 프로필 페이지 (사용자 정보, 로그아웃 버튼)

components/
└── Header.tsx              # 헤더 (톱니바퀴 아이콘 추가)
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

- `signUp(email, password)`
- `signIn(email, password)`
- `signOut()`
- `getSession()`

### 4.2 ProtectedRoute 컴포넌트

**역할:**

- 인증이 필요한 페이지를 보호
- 미인증 시 로그인 페이지로 리다이렉트
- 이전 경로 저장 (로그인 후 복귀)

**구현:**

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    return null;
  }

  return <>{children}</>;
}
```

## 5. Supabase Auth 설정

### 5.1 Supabase 대시보드 설정

**Authentication → Settings:**

- Site URL: `http://localhost:3000` (개발)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback` (프로덕션)

**Authentication → Providers:**

- Email: 활성화
- Google: (향후)
- GitHub: (향후)

**Authentication → Email Templates:**

- 이메일 인증 템플릿 커스터마이징 (선택)

### 5.2 이메일 인증 설정

**옵션 1: 이메일 인증 필수**

- 회원가입 후 이메일 인증 필요
- 인증 전까지 로그인 불가

**옵션 2: 이메일 인증 선택 (추천)**

- 회원가입 후 바로 사용 가능
- 이메일 인증은 선택사항

**초기 버전: 옵션 2 (이메일 인증 선택)**

## 6. 사용자 프로필 관리

### 6.1 user_stats 초기화

**회원가입 시:**

- `user_stats` 테이블에 초기 레코드 자동 생성
- `total_xp = 0`, `current_level = 1`, `total_habits = 0` 등

**구현 방법:**

- Supabase Database Trigger 사용 (자동)
- 또는 클라이언트에서 회원가입 후 INSERT

### 6.2 사용자 정보

**Supabase Auth에서 제공:**

- `id` (UUID)
- `email`
- `created_at`
- `email_confirmed_at` (이메일 인증 시)

**추가 정보 (향후):**

- 프로필 이미지
- 닉네임
- 생년월일 등

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

## 8. 구현 순서

### Phase 1: 기본 인증 (우선)

1. **AuthProvider 구현**
   - Supabase Auth 클라이언트 연결
   - 세션 상태 관리
   - 인증 상태 Context 제공
   - 구글/깃허브 로그인 함수
   - 로그아웃 함수

2. **로그인 페이지** (`/auth/login`)
   - 구글 로그인 버튼
   - 깃허브 로그인 버튼
   - 로그인 성공 시 메인 페이지(`/`)로 리다이렉트

3. **ProtectedRoute 컴포넌트**
   - 인증 상태 체크
   - 미인증 시 로그인 페이지로 리다이렉트

4. **헤더에 톱니바퀴 아이콘 추가**
   - 인증된 사용자에게만 표시
   - 클릭 시 `/profile` 페이지로 이동

5. **프로필 페이지** (`/profile`)
   - 사용자 정보 표시 (이메일 등)
   - 로그아웃 버튼 (명확한 위치)
   - 향후: 설정, 통계, 업적 등 추가 가능

### Phase 2: 고급 기능 (향후)

1. 비밀번호 재설정
2. 소셜 로그인
3. 프로필 관리
4. 이메일 인증 강제

## 9. 코드 예시

### 9.1 AuthProvider

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    // user_stats 초기화 (트리거 또는 수동)
    if (data.user) {
      // TODO: user_stats INSERT
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 9.2 ProtectedRoute

```typescript
'use client';

import { useAuth } from '@/app/components/auth/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return <>{children}</>;
}
```

### 9.3 로그인 페이지

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/habits';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full p-8">
        <h1 className="text-3xl font-bold mb-6">로그인</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="link">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
```

## 10. user_stats 초기화 방법

### 옵션 1: Database Trigger (추천)

**Supabase SQL Editor에서 실행:**

```sql
-- user_stats 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**장점:**

- 자동으로 처리됨
- 클라이언트 코드 불필요
- 안전함 (서버 사이드)

### 옵션 2: 클라이언트에서 수동 생성

**회원가입 후:**

```typescript
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  
  // user_stats 초기화
  if (data.user) {
    await supabase.from('user_stats').insert({
      user_id: data.user.id,
    });
  }
};
```

**장점:**

- 간단함
- 트리거 설정 불필요

**단점:**

- 클라이언트에서 실행되므로 실패 가능성
- 네트워크 오류 시 누락 가능

**추천: 옵션 1 (Database Trigger)**

