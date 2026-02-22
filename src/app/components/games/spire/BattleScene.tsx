'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { GameState, GameAction, BattleState } from '@/app/lib/games/spire/types';
import EnemyComponent from './EnemyComponent';
import PlayerComponent from './PlayerComponent';
import HandArea from './HandArea';
import RelicBar from './RelicBar';
import BattleEffects, { useEffects } from './BattleEffects';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function BattleScene({ state, dispatch }: Props) {
  const { player, battle, relics, currentAct } = state;
  const { effects, addEffect } = useEffects();
  const prevBattle = useRef<BattleState | null>(null);
  const prevHp = useRef(player.hp);
  const prevBlock = useRef(player.block);

  // 상태 변화 감지 → 이펙트 생성
  useEffect(() => {
    if (!battle) return;

    // 플레이어 데미지/블록 변화
    const hpDiff = player.hp - prevHp.current;
    const blockDiff = player.block - prevBlock.current;

    if (hpDiff < 0) addEffect('damage', Math.abs(hpDiff), 'player');
    else if (hpDiff > 0) addEffect('heal', hpDiff, 'player');
    if (blockDiff > 0 && prevBlock.current === 0) addEffect('block', player.block, 'player');

    // 적 HP 변화
    if (prevBattle.current) {
      const prevE = prevBattle.current.enemies;
      battle.enemies.forEach((enemy, idx) => {
        if (idx < prevE.length) {
          const diff = enemy.hp - prevE[idx].hp;
          if (diff < 0) addEffect('damage', Math.abs(diff), idx);
          else if (diff > 0) addEffect('heal', diff, idx);
        }
      });
    }

    prevBattle.current = battle;
    prevHp.current = player.hp;
    prevBlock.current = player.block;
  }, [battle, player.hp, player.block]);

  if (!battle) return null;

  const { enemies, selectedCardIndex, targetingMode } = battle!;

  function handleEnemyClick(idx: number) {
    if (enemies[idx].hp <= 0) return;
    if (selectedCardIndex !== null && targetingMode) {
      dispatch({ type: 'PLAY_CARD', cardIndex: selectedCardIndex, targetIndex: idx });
    }
  }

  function handleFieldClick() {
    if (selectedCardIndex !== null) {
      dispatch({ type: 'DESELECT_CARD' });
    }
  }

  const actLabel = `Act ${currentAct + 1}`;
  const aliveEnemies = enemies.filter(e => e.hp > 0);
  const spriteBase = aliveEnemies.length >= 3 ? 60 : aliveEnemies.length === 2 ? 75 : 90;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 상단 정보 바 */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-b border-zinc-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400">❤️</span>
            <span className="text-sm font-bold text-white">{player.hp}<span className="text-zinc-400 font-normal">/{player.maxHp}</span></span>
          </div>
          {player.block > 0 && (
            <div className="text-xs font-bold text-blue-300">🛡️{player.block}</div>
          )}
        </div>
        <div className="text-xs text-zinc-500 font-medium">{actLabel}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">⚡</span>
          <span className="text-sm font-bold text-yellow-300">{player.energy}<span className="text-zinc-400 font-normal">/{player.maxEnergy}</span></span>
        </div>
      </div>

      {/* 타겟 모드 안내 */}
      {targetingMode && (
        <div className="text-center py-1.5 bg-red-900/40 border-b border-red-700/50">
          <span className="text-xs text-red-300 font-medium">공격할 적을 선택한다</span>
          <button onClick={handleFieldClick} className="ml-3 text-xs text-zinc-400 hover:text-zinc-200 underline">
            취소
          </button>
        </div>
      )}

      {/* 전투 필드 */}
      <div
        className="flex-1 flex items-center justify-around px-4 py-4 bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 overflow-hidden"
        onClick={handleFieldClick}
      >
        {/* 적 영역 */}
        <div className={`flex ${aliveEnemies.length >= 3 ? 'gap-2' : 'gap-4'} items-end justify-center`} onClick={e => e.stopPropagation()}>
          {enemies.map((enemy, idx) => (
            enemy.hp > 0 && (
              <EnemyComponent
                key={`${enemy.def.id}-${idx}`}
                enemy={enemy}
                selected={targetingMode}
                onClick={() => handleEnemyClick(idx)}
                spriteSize={enemy.def.tier === 'boss' ? spriteBase + 20 : spriteBase}
                effects={effects.filter(e => e.target === idx)}
              />
            )
          ))}
        </div>

        {/* 플레이어 */}
        <div onClick={e => e.stopPropagation()}>
          <PlayerComponent
            player={player}
            spriteSize={70}
            effects={effects.filter(e => e.target === 'player')}
          />
        </div>
      </div>

      {/* 유물 바 */}
      {relics.length > 0 && (
        <div className="px-3 py-1.5 border-t border-zinc-700/50 bg-zinc-900/60">
          <RelicBar relics={relics} />
        </div>
      )}

      {/* 손패 영역 */}
      <div className="border-t border-zinc-700/50 bg-zinc-900/80">
        <HandArea
          battle={battle}
          player={player}
          dispatch={dispatch}
          onEndTurn={() => dispatch({ type: 'END_TURN' })}
        />
      </div>
    </div>
  );
}
