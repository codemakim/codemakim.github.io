'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSpireGame, loadSave } from '@/app/lib/games/spire/gameState';
import BattleScene from '@/app/components/games/spire/BattleScene';
import MapScene from '@/app/components/games/spire/MapScene';
import RewardScene from '@/app/components/games/spire/RewardScene';
import RestScene from '@/app/components/games/spire/RestScene';

export default function SpirePage() {
  const { state, dispatch } = useSpireGame();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const save = typeof window !== 'undefined' ? loadSave() : null;

  const header = (
    <header className="bg-zinc-900/95 border-b border-zinc-700/50 md:sticky md:top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="mb-2">
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-white">그냥 블로그</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/games" className="text-zinc-400 hover:text-zinc-200 transition-colors">
            ← 게임 목록
          </Link>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">미니 스파이어</span>
        </div>
      </div>
    </header>
  );

  // mounted 이전: 서버/클라이언트 동일한 스켈레톤 → hydration 불일치 방지
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
        {header}
        <main className="flex-1" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {header}

      {/* 메인 게임 영역 */}
      <main className="flex-1 max-w-2xl mx-auto w-full flex flex-col">
        {/*
          AnimatePresence mode="wait":
          - 이전 phase가 exit 애니메이션 완료 후 다음 phase enter
          - battle → reward/gameOver/victory 전환 시 exit(0.7s) 딜레이가 자연스러운 전투 종료 연출을 제공
          - 타이머/ref 없이 React StrictMode에서도 정상 동작
        */}
        <AnimatePresence mode="wait">

          {/* 맵 화면 */}
          {state.phase === 'map' && (
            <motion.div
              key="map"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MapScene state={state} dispatch={dispatch} />
            </motion.div>
          )}

          {/* 전투 화면: exit 0.5s → reward/gameOver/victory가 그 이후 등장
              (enemy 사망 애니메이션 400ms + CONFIRM_BATTLE_END 이후 이 exit가 실행됨) */}
          {state.phase === 'battle' && (
            <motion.div
              key="battle"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
            >
              <BattleScene state={state} dispatch={dispatch} />
            </motion.div>
          )}

          {/* 보상 화면 */}
          {state.phase === 'reward' && (
            <motion.div
              key="reward"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <RewardScene state={state} dispatch={dispatch} />
            </motion.div>
          )}

          {/* 휴식 화면 */}
          {state.phase === 'rest' && (
            <motion.div
              key="rest"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <RestScene state={state} dispatch={dispatch} />
            </motion.div>
          )}

          {/* 게임 오버 */}
          {state.phase === 'gameOver' && (
            <motion.div
              key="gameover"
              className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-12"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <motion.div
                className="text-6xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, damping: 12 }}
              >
                💀
              </motion.div>
              <h2 className="text-3xl font-bold text-red-400">게임 오버</h2>
              <p className="text-zinc-400 text-center">
                Act {state.currentAct + 1}에서 쓰러졌다<br />
                점수: <span className="text-yellow-300 font-bold">{state.score}</span>
              </p>
              {save && (
                <div className="text-sm text-zinc-500 text-center">
                  최고 점수: {save.bestScore} · 최고 층: Act {save.bestAct} · 총 {save.totalRuns}판
                </div>
              )}
              <button
                onClick={() => dispatch({ type: 'RESTART' })}
                className="btn-primary px-8 py-3 text-lg font-bold"
              >
                다시 시작
              </button>
              <Link href="/games" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                게임 목록으로
              </Link>
            </motion.div>
          )}

          {/* 클리어 */}
          {state.phase === 'victory' && (
            <motion.div
              key="victory"
              className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-12"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <motion.div
                className="text-6xl"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.15, damping: 10 }}
              >
                🏆
              </motion.div>
              <h2 className="text-3xl font-bold text-yellow-300">스파이어 정복!</h2>
              <p className="text-zinc-300 text-center">
                3개의 Act를 모두 클리어했다!<br />
                최종 점수: <span className="text-yellow-300 font-bold text-xl">{state.score}</span>
              </p>
              {save && (
                <div className="text-sm text-zinc-500 text-center">
                  총 승리: {save.totalWins}회 · 총 {save.totalRuns}판
                </div>
              )}
              <button
                onClick={() => dispatch({ type: 'RESTART' })}
                className="btn-primary px-8 py-3 text-lg font-bold"
              >
                다시 도전
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
