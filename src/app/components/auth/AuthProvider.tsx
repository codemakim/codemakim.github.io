'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 세션 초기화 및 인증 상태 변경 감지
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Supabase 클라이언트 초기화 (환경 변수 체크)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // 환경 변수가 없으면 인증 기능 비활성화 (블로그만 사용하는 경우)
      console.warn('Supabase not configured, authentication disabled');
      setLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 초기 세션 확인
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Failed to get session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 인증 상태 변경 감지 (로그인/로그아웃 시 자동 업데이트)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // cleanup: 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
      );
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signInWithGithub = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signInWithGoogle, signInWithGithub, signOut }}
    >
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

