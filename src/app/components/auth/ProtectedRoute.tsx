'use client';

import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, user, loading, router, pathname]);

  // 서버 사이드 렌더링 시 로딩 표시 (Hydration 에러 방지)
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return <>{children}</>;
}

