'use client';

import Link from 'next/link';
import { useSpireGame, loadSave } from '@/app/lib/games/spire/gameState';
import BattleScene from '@/app/components/games/spire/BattleScene';
import MapScene from '@/app/components/games/spire/MapScene';
import RewardScene from '@/app/components/games/spire/RewardScene';
import RestScene from '@/app/components/games/spire/RestScene';

export default function SpirePage() {
  const { state, dispatch } = useSpireGame();

  const save = typeof window !== 'undefined' ? loadSave() : null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* 헤더 */}
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

      {/* 메인 게임 영역 */}
      <main className="flex-1 max-w-2xl mx-auto w-full flex flex-col">

        {/* 맵 화면 */}
        {state.phase === 'map' && (
          <MapScene state={state} dispatch={dispatch} />
        )}

        {/* 전투 화면 */}
        {state.phase === 'battle' && (
          <div className="flex-1 flex flex-col">
            <BattleScene state={state} dispatch={dispatch} />
          </div>
        )}

        {/* 보상 화면 */}
        {state.phase === 'reward' && (
          <RewardScene state={state} dispatch={dispatch} />
        )}

        {/* 휴식 화면 */}
        {state.phase === 'rest' && (
          <RestScene state={state} dispatch={dispatch} />
        )}

        {/* 게임 오버 */}
        {state.phase === 'gameOver' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-12">
            <div className="text-6xl">💀</div>
            <h2 className="text-3xl font-bold text-red-400">게임 오버</h2>
            <p className="text-zinc-400 text-center">
              Act {state.currentAct + 1}에서 쓰러졌다<br/>
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
          </div>
        )}

        {/* 클리어 */}
        {state.phase === 'victory' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-12">
            <div className="text-6xl">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-300">스파이어 정복!</h2>
            <p className="text-zinc-300 text-center">
              3개의 Act를 모두 클리어했다!<br/>
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
          </div>
        )}
      </main>
    </div>
  );
}
