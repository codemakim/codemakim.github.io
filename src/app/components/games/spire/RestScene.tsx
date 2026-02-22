'use client';

import { useState } from 'react';
import type { GameState, GameAction } from '@/app/lib/games/spire/types';
import CardComponent from './CardComponent';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function RestScene({ state, dispatch }: Props) {
  const { player, deck, relics } = state;
  const [mode, setMode] = useState<'choose' | 'removeCard'>('choose');

  const healingFlask = relics.find(r => r.id === 'healing_flask');
  const healMultiplier = healingFlask?.effect.type === 'onRest' ? healingFlask.effect.healMultiplier : 0.3;
  const healAmount = Math.floor(player.maxHp * healMultiplier);
  const healedHp = Math.min(player.maxHp, player.hp + healAmount);

  if (mode === 'removeCard') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-8">
        <h2 className="text-xl font-bold text-zinc-100">🔥 카드 제거</h2>
        <p className="text-sm text-zinc-400">덱에서 제거할 카드를 선택한다</p>
        <div className="flex flex-wrap gap-3 justify-center max-w-lg">
          {deck.map((cardInst, idx) => (
            <CardComponent
              key={cardInst.instanceId}
              card={cardInst.def}
              size="lg"
              onClick={() => dispatch({ type: 'REST_REMOVE_CARD', cardIndex: idx })}
            />
          ))}
        </div>
        <button onClick={() => setMode('choose')} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-2">
          취소
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-12">
      <div className="text-6xl">🏕️</div>
      <h2 className="text-2xl font-bold text-zinc-100">휴식</h2>
      <p className="text-sm text-zinc-400">하나를 선택한다</p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* 회복 */}
        <button
          onClick={() => dispatch({ type: 'REST_HEAL' })}
          className="card-content p-4 text-left hover:border-green-500/60 transition-colors w-full"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">❤️</span>
            <div>
              <div className="font-bold text-zinc-100">회복</div>
              <div className="text-sm text-zinc-400">
                HP {player.hp} → {healedHp} (+{Math.min(healAmount, player.maxHp - player.hp)})
                {healingFlask && <span className="ml-1 text-xs text-yellow-400">({Math.round(healMultiplier * 100)}%)</span>}
              </div>
            </div>
          </div>
        </button>

        {/* 카드 제거 */}
        {deck.length > 1 && (
          <button
            onClick={() => setMode('removeCard')}
            className="card-content p-4 text-left hover:border-red-500/60 transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <div className="font-bold text-zinc-100">카드 제거</div>
                <div className="text-sm text-zinc-400">덱에서 카드 1장을 영구 제거한다</div>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
