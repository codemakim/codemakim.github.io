'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  subtitle: string;
  rightAction?: ReactNode;
}

export default function PageHeader({ subtitle, rightAction }: PageHeaderProps) {
  return (
    <header className="header md:sticky md:top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 첫 줄: 제목 */}
        <div className="mb-3">
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              그냥 블로그
            </h1>
          </Link>
        </div>
        {/* 두 줄: 서브타이틀 + 액션 버튼 */}
        <div className="flex items-center justify-between">
          <p className="text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          {rightAction && <div className="flex items-center gap-3">{rightAction}</div>}
        </div>
      </div>
    </header>
  );
}
