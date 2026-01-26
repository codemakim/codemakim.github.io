'use client';

import { useAuth } from '@/app/components/auth/AuthProvider';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function ProfileContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut();
      router.push('/');
    } catch (err: any) {
      setError(err.message || '로그아웃에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="block hover:opacity-80 transition-opacity mb-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              그냥 블로그
            </h1>
          </Link>
          <p className="text-zinc-600 dark:text-zinc-400">프로필</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">사용자 정보</h2>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                이메일
              </label>
              <p className="text-zinc-900 dark:text-white mt-1">
                {user?.email}
              </p>
            </div>

            {user?.created_at && (
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  가입일
                </label>
                <p className="text-zinc-900 dark:text-white mt-1">
                  {mounted
                    ? new Date(user.created_at).toLocaleDateString('ko-KR')
                    : new Date(user.created_at).toISOString().split('T')[0]
                  }
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
