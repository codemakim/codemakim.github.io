'use client';

import type { GameAction } from '@/app/lib/games/spire/types';
import { ALL_CHARACTERS } from '@/app/lib/games/spire/characters';
import { loadRunFromLocal, loadSave } from '@/app/lib/games/spire/gameState';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

export default function CharSelectScene({ dispatch }: Props) {
  const savedRun = loadRunFromLocal();
  const save = loadSave();

  const handleResume = () => {
    const run = loadRunFromLocal();
    if (run) dispatch({ type: 'LOAD_RUN', savedState: run });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">미니 스파이어</h2>
        <p className="text-zinc-400 text-sm">영웅을 선택하세요</p>
      </div>

      {/* 캐릭터 그리드 */}
      <div className="flex flex-wrap gap-4 justify-center">
        {ALL_CHARACTERS.map(char => (
          <button
            key={char.id}
            onClick={() => dispatch({ type: 'SELECT_CHARACTER', characterId: char.id })}
            className="group flex flex-col gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 rounded-xl p-5 w-56 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="text-4xl">{char.emoji}</span>
              <span className="text-lg font-bold text-white">{char.name}</span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">{char.description}</p>

            <div className="flex flex-col gap-1 text-xs text-zinc-300">
              <div className="flex items-center gap-1">
                <span className="text-red-400">❤️</span>
                <span>HP {char.startingHp}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⚡</span>
                <span>에너지 {char.startingEnergy}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-zinc-500 text-xs font-medium">시작 유물</p>
              <div className="flex items-center gap-1 text-xs text-zinc-300">
                <span>{char.startingRelic.emoji}</span>
                <span>{char.startingRelic.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-zinc-500 text-xs font-medium">시작 덱</p>
              <p className="text-xs text-zinc-400">
                {Object.entries(
                  char.startingDeck.reduce<Record<string, number>>((acc, c) => {
                    acc[c.name] = (acc[c.name] ?? 0) + 1;
                    return acc;
                  }, {})
                ).map(([name, count]) => `${name}×${count}`).join(' · ')}
              </p>
            </div>

            {char.passive && (
              <div className="flex flex-col gap-1">
                <p className="text-zinc-500 text-xs font-medium">패시브</p>
                <p className="text-xs text-zinc-400">{char.passive.description}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 이어하기 버튼 — 저장된 런이 있을 때만 표시 */}
      {savedRun && (
        <button
          onClick={handleResume}
          className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors"
        >
          이어하기 (이전 런 계속)
        </button>
      )}

      {/* 최고 기록 */}
      {save && (
        <p className="text-xs text-zinc-600 text-center">
          최고 점수: {save.bestScore} · 최고 층: Act {save.bestAct} · 총 {save.totalRuns}판
          {save.totalWins > 0 && ` · 승리: ${save.totalWins}회`}
        </p>
      )}
    </div>
  );
}
