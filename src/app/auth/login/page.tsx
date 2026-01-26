'use client';

import { useState } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OAuthButton from '@/app/components/auth/OAuthButton';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      // OAuth는 리다이렉트되므로 여기까지 오지 않음
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
      setLoadingGoogle(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setLoadingGithub(true);
    try {
      await signInWithGithub();
      // OAuth는 리다이렉트되므로 여기까지 오지 않음
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
      setLoadingGithub(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-8">
        <h1 className="text-3xl font-bold mb-2">로그인</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          구글이나 깃허브 계정으로 로그인하세요
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <OAuthButton
            provider="google"
            onClick={handleGoogleLogin}
            loading={loadingGoogle}
            disabled={loadingGithub}
          />
          <OAuthButton
            provider="github"
            onClick={handleGithubLogin}
            loading={loadingGithub}
            disabled={loadingGoogle}
          />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="link">
            홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

