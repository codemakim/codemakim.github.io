'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface GameLayoutProps {
  title: string;
  children: ReactNode;
  score?: number;
  bestScore?: number;
  onRestart?: () => void;
  controls?: ReactNode;
  status?: 'playing' | 'won' | 'lost' | 'idle';
}

export default function GameLayout({
  title,
  children,
  score = 0,
  bestScore = 0,
  onRestart,
  controls,
  status,
}: GameLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-3">
            <Link href="/" className="block hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                그냥 블로그
              </h1>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/games"
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm transition-colors"
              >
                ← 게임 목록
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-sm">{title}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 스코어바 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
            <div className="card-content px-4 py-2 text-center min-w-[72px]">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">점수</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{score.toLocaleString()}</div>
            </div>
            <div className="card-content px-4 py-2 text-center min-w-[72px]">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">최고</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{bestScore.toLocaleString()}</div>
            </div>
          </div>
          {onRestart && (
            <button
              onClick={onRestart}
              className="btn-primary text-sm px-4 py-2"
            >
              다시 시작
            </button>
          )}
        </div>

        {/* 추가 컨트롤 (난이도 선택 등) */}
        {controls && <div className="mb-4">{controls}</div>}

        {/* 게임 보드 */}
        {children}

        {/* 게임 상태 메시지 - 보드 아래 표시 */}
        {status === 'won' && (
          <div className="mt-4 p-4 rounded-xl text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 font-bold text-lg">승리!</p>
            <p className="text-green-600 dark:text-green-400 text-sm mt-1">계속 플레이하거나 다시 시작하세요</p>
          </div>
        )}
        {status === 'lost' && (
          <div className="mt-4 p-4 rounded-xl text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 font-bold text-lg">게임 오버</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">다시 시작 버튼을 눌러주세요</p>
          </div>
        )}
      </main>
    </div>
  );
}
