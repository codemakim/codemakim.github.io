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
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="block hover:opacity-80 transition-opacity mb-2">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                그냥 블로그
              </h1>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>
          {rightAction && <div className="flex items-center gap-3">{rightAction}</div>}
        </div>
      </div>
    </header>
  );
}
