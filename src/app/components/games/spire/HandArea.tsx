'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { BattleState, PlayerState, VfxType } from '@/app/lib/games/spire/types';
import type { GameAction } from '@/app/lib/games/spire/types';
import CardComponent from './CardComponent';
import { getPowerLabel } from '@/app/lib/games/spire/displayHelpers';
import { getBuffValue } from '@/app/lib/games/spire/combat';

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

  const previewStats = {
    strength: getBuffValue(player.buffs, 'strength'),
    isWeak: getBuffValue(player.buffs, 'weak') > 0,
    damageBonus: battle.pendingDamageBonus,
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setFadeLeft(el.scrollLeft > 4);
    setFadeRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  // 카드 목록이 바뀌면 오른쪽 fade 여부 재계산
  function onScrollContainerRef(el: HTMLDivElement | null) {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (el) setFadeRight(el.scrollWidth > el.clientWidth);
  }

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
      {/* 파워 카드 + 공격 강화 상태 */}
      {(activePowers.length > 0 || battle.pendingDamageBonus > 0) && (
        <div className="flex gap-2 justify-center flex-wrap px-2">
          {activePowers.map((pid, i) => (
            <span key={i} className="text-xs bg-purple-900/60 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
              🔮 {getPowerLabel(pid)}
            </span>
          ))}
          {battle.pendingDamageBonus > 0 && (
            <span className="text-xs bg-amber-900/60 border border-amber-500/40 text-amber-200 px-2 py-0.5 rounded-full">
              ⚔️ 공격 강화 +{battle.pendingDamageBonus}
            </span>
          )}
        </div>
      )}

      {/* 손패 — 수평 스크롤 */}
      <div className="relative">
        {/* 왼쪽 fade 힌트 */}
        {fadeLeft && (
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-zinc-900 to-transparent z-10 pointer-events-none" />
        )}
        {/* 오른쪽 fade 힌트 */}
        {fadeRight && (
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-zinc-900 to-transparent z-10 pointer-events-none" />
        )}

        {/* 카드가 적으면 중앙 정렬, 많으면 스크롤 */}
        <div className="flex justify-center overflow-hidden">
          <div
            ref={onScrollContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto flex items-end gap-1 px-3 py-2 h-[116px] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            <AnimatePresence initial={false}>
              {hand.map((cardInst, idx) => {
                const card = cardInst.def;
                const cost = card.cost === -1 ? player.energy : card.cost;
                const canPlay = card.type !== 'curse' && player.energy >= cost;
                return (
                  <motion.div
                    key={cardInst.instanceId}
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
                      size="sm"
                      previewStats={previewStats}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {hand.length === 0 && (
              <div className="text-zinc-500 text-sm self-center">손패가 없다</div>
            )}
          </div>
        </div>
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
