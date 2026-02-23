'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { BattleState, PlayerState, VfxType } from '@/app/lib/games/spire/types';
import type { GameAction } from '@/app/lib/games/spire/types';
import CardComponent from './CardComponent';

interface Props {
  battle: BattleState;
  player: PlayerState;
  dispatch: (action: GameAction) => void;
  onEndTurn: () => void;
  addVfx?: (vfx: VfxType, target: 'player' | number) => void;
  onShowPile?: (pile: 'draw' | 'discard') => void;
}

export default function HandArea({ battle, player, dispatch, onEndTurn, addVfx, onShowPile }: Props) {
  const { hand, selectedCardIndex, drawPile, discardPile, activePowers } = battle;
  const aliveEnemies = battle.enemies.filter(e => e.hp > 0);

  function handleCardClick(idx: number) {
    const cardInst = hand[idx];
    const card = cardInst.def;
    const cost = card.cost === -1 ? player.energy : card.cost;
    if (card.type === 'curse' || player.energy < cost) return;

    const isTargeted = card.type === 'attack' || card.effects.some(e => e.type === 'buff' && (e as { target: string }).target === 'enemy');

    if (selectedCardIndex === idx) {
      if (isTargeted && aliveEnemies.length > 1) {
        dispatch({ type: 'DESELECT_CARD' });
      } else {
        const firstAlive = battle.enemies.findIndex(e => e.hp > 0);
        const targetIdx = Math.max(0, firstAlive);
        playCard(idx, targetIdx, isTargeted, card.vfx);
      }
    } else {
      if (!isTargeted || aliveEnemies.length <= 1) {
        const firstAlive = battle.enemies.findIndex(e => e.hp > 0);
        const targetIdx = Math.max(0, firstAlive);
        playCard(idx, targetIdx, isTargeted, card.vfx);
      } else {
        dispatch({ type: 'SELECT_CARD', cardIndex: idx });
      }
    }
  }

  function playCard(cardIdx: number, targetIdx: number, isTargeted: boolean, vfx?: VfxType) {
    if (addVfx && vfx && vfx !== 'none') {
      // 공격/디버프 카드 → 해당 적에게 vfx
      // 방어/버프/파워 카드 → 플레이어에게 vfx
      const vfxTarget: 'player' | number = isTargeted ? targetIdx : 'player';
      addVfx(vfx, vfxTarget);
    }
    dispatch({ type: 'PLAY_CARD', cardIndex: cardIdx, targetIndex: targetIdx });
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 파워 카드 표시 */}
      {activePowers.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap px-2">
          {activePowers.map((pid, i) => (
            <span key={i} className="text-xs bg-purple-900/60 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
              🔮 {pid === 'iron_will' ? '강철 의지' : pid === 'berserker' ? '광전사' : pid === 'thorns_card' ? '가시 갑옷' : pid}
            </span>
          ))}
        </div>
      )}

      {/* 손패 */}
      <div className="flex items-end justify-center gap-1 min-h-[100px] px-2 py-2 overflow-x-auto">
        <AnimatePresence initial={false}>
          {hand.map((cardInst, idx) => {
            const card = cardInst.def;
            const cost = card.cost === -1 ? player.energy : card.cost;
            const canPlay = card.type !== 'curse' && player.energy >= cost;
            return (
              <motion.div
                key={cardInst.instanceId}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, duration: 0.3 }}
              >
                <CardComponent
                  card={card}
                  disabled={!canPlay}
                  selected={selectedCardIndex === idx}
                  onClick={() => handleCardClick(idx)}
                  size="md"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {hand.length === 0 && (
          <div className="text-zinc-500 text-sm">손패가 없다</div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex gap-3 text-xs text-zinc-400">
          <button
            onClick={() => onShowPile?.('draw')}
            className="hover:text-zinc-200 transition-colors active:scale-95"
          >
            🃏 드로우 {drawPile.length}
          </button>
          <button
            onClick={() => onShowPile?.('discard')}
            className="hover:text-zinc-200 transition-colors active:scale-95"
          >
            🗑️ 버림 {discardPile.length}
          </button>
        </div>
        <button
          onClick={onEndTurn}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors"
        >
          턴 종료
        </button>
      </div>
    </div>
  );
}
