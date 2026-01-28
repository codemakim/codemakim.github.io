'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/app/components/habits/PageHeader';

function ArchiveContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        subtitle="과거 습관"
        rightAction={
          <Link href="/habits" className="text-sm link">
            ← 습관 목록
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            과거 습관이 없습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <ProtectedRoute>
      <ArchiveContent />
    </ProtectedRoute>
  );
}
