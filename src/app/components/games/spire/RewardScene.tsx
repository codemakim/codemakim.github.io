'use client';

import { useState, useEffect } from 'react';
import type { GameState, GameAction } from '@/app/lib/games/spire/types';
import CardComponent from './CardComponent';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function RewardScene({ state, dispatch }: Props) {
  const rewards = state.pendingRewards;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!rewards) return null;

  const allDone = rewards.cardCollected && rewards.goldCollected && rewards.relicCollected;
  const cardSize = isMobile ? 'md' : 'lg';

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 min-h-full">
      <h2 className="text-2xl font-bold text-yellow-300">🏆 전투 승리!</h2>

      {/* 골드 */}
      {!rewards.goldCollected && rewards.gold > 0 && (
        <div className="card-content p-4 flex flex-col items-center gap-2 w-full max-w-sm">
          <div className="text-3xl">💰</div>
          <div className="text-xl font-bold text-yellow-300">{rewards.gold} 골드</div>
          <button
            onClick={() => dispatch({ type: 'COLLECT_GOLD' })}
            className="btn-primary text-sm px-6 py-2 mt-1"
          >
            획득
          </button>
        </div>
      )}

      {/* 유물 */}
      {!rewards.relicCollected && rewards.relic && (
        <div className="card-content p-4 flex flex-col items-center gap-2 w-full max-w-sm">
          <div className="text-4xl">{rewards.relic.emoji}</div>
          <div className="text-lg font-bold text-zinc-100">{rewards.relic.name}</div>
          <div className="text-sm text-zinc-400 text-center">{rewards.relic.description}</div>
          <button
            onClick={() => dispatch({ type: 'COLLECT_RELIC' })}
            className="btn-primary text-sm px-6 py-2 mt-1"
          >
            획득
          </button>
        </div>
      )}

      {/* 카드 선택 */}
      {!rewards.cardCollected && rewards.cardChoices.length > 0 && (
        <div className="flex flex-col items-center gap-4 w-full">
          <h3 className="text-lg font-bold text-zinc-200">카드 획득 (1장 선택)</h3>
          <div className="grid grid-cols-3 gap-3 justify-items-center w-full">
            {rewards.cardChoices.map((card, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <CardComponent
                  card={card}
                  size={cardSize}
                  onClick={() => dispatch({ type: 'PICK_CARD_REWARD', cardIndex: idx })}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => dispatch({ type: 'SKIP_CARD_REWARD' })}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
          >
            건너뛰기
          </button>
        </div>
      )}

      {/* 계속 버튼 */}
      {allDone && (
        <button
          onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}
          className="btn-primary px-8 py-3 text-lg font-bold mt-4"
        >
          계속 →
        </button>
      )}
    </div>
  );
}
