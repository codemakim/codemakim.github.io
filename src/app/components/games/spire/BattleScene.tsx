'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GameState, GameAction, BattleState, EffectEvent } from '@/app/lib/games/spire/types';
import EnemyComponent from './EnemyComponent';
import PlayerComponent from './PlayerComponent';
import HandArea from './HandArea';
import RelicBar from './RelicBar';
import ScreenFlash from './effects/ScreenFlash';
import CardListOverlay from './CardListOverlay';
import { useEffects } from './effects/EffectLayer';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function BattleScene({ state, dispatch }: Props) {
  const { player, battle, relics, currentAct } = state;
  const { effects, vfxList, addEffect, addVfx } = useEffects();
  const [screenFlash, setScreenFlash] = useState(false);
  const [showPile, setShowPile] = useState<'draw' | 'discard' | null>(null);

  // 사망한 적 인덱스 추적: hit flash(200ms) 후 AnimatePresence exit 애니메이션 트리거
  const deadIndicesRef = useRef<Set<number>>(new Set());
  const [deadIndices, setDeadIndices] = useState<Set<number>>(new Set());

  // pendingEffects 소비자:
  // Reducer가 생성한 이펙트 이벤트를 delayMs 스태거로 스케줄링한다.
  // lastPendingRef로 동일 배열 참조를 중복 처리하지 않는다 (StrictMode 대응).
  const lastPendingRef = useRef<EffectEvent[]>([]);
  useEffect(() => {
    if (!battle) return;
    const events = battle.pendingEffects;
    if (!events?.length || events === lastPendingRef.current) return;
    lastPendingRef.current = events;

    events.forEach(event => {
      setTimeout(() => {
        // dir: battleLogic이 설정한 vfxDir 우선, 없으면 target으로 추론 (플레이어가 맞으면 left)
        const dir = event.vfxDir ?? (event.target === 'player' ? 'left' : 'right');
        // 완전 방어(value === 0)도 팝업 표시 — 🛡️ 아이콘으로 방어 흡수 피드백 제공
        addEffect(event.type, event.value, event.target, event.vfx, dir);
        // 큰 피해 시 화면 플래시
        if (event.type === 'damage' && event.target === 'player' && event.value >= 15) {
          setScreenFlash(true);
          setTimeout(() => setScreenFlash(false), 400);
        }
      }, event.delayMs);
    });

    // 이벤트 처리 완료 후 큐 비우기
    dispatch({ type: 'CLEAR_EFFECTS' });
    // 타이머는 cleanup 없이 실행 — CLEAR_EFFECTS 후에도 timers는 계속 동작함
  }, [battle]); // eslint-disable-line react-hooks/exhaustive-deps

  // 새로 사망한 적 감지 → hit flash 이후(200ms) deadIndices에 추가 → AnimatePresence exit 트리거
  useEffect(() => {
    if (!battle) return;
    const newDead = battle.enemies
      .map((e, i) => i)
      .filter(i => battle.enemies[i].hp <= 0 && !deadIndicesRef.current.has(i));
    if (newDead.length === 0) return;

    const t = setTimeout(() => {
      newDead.forEach(i => deadIndicesRef.current.add(i));
      setDeadIndices(new Set(deadIndicesRef.current));
    }, 200);
    return () => clearTimeout(t);
  }, [battle?.enemies]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!battle) return null;

  const { enemies, selectedCardIndex, targetingMode } = battle;

  function handleEnemyClick(idx: number) {
    if (enemies[idx].hp <= 0) return;
    if (selectedCardIndex !== null && targetingMode) {
      // VFX는 pendingEffects를 통해 처리됨 (Reducer가 EffectEvent 생성)
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

  // 모든 적 exit 애니메이션 완료 시 CONFIRM_BATTLE_END 디스패치
  function handleEnemyExitComplete() {
    if (battle?.pendingPhase) {
      dispatch({ type: 'CONFIRM_BATTLE_END' });
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* 화면 플래시 */}
      <ScreenFlash visible={screenFlash} />

      {/* 상단 상태 바: HP / Act / 에너지 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-700/50">
        {/* 왼쪽: HP */}
        <div className="flex items-center gap-1">
          <span className="text-xs">❤️</span>
          <span className="text-sm font-bold text-white">{player.hp}<span className="text-zinc-500 text-xs">/{player.maxHp}</span></span>
        </div>

        {/* 중앙: Act */}
        <div className="text-xs text-zinc-500 font-medium">{actLabel}</div>

        {/* 오른쪽: 에너지 */}
        <div className="flex items-center gap-1">
          <span className="text-xs">⚡</span>
          <span className="text-sm font-bold text-yellow-300">{player.energy}<span className="text-zinc-500 text-xs">/{player.maxEnergy}</span></span>
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
        className="flex-1 flex flex-col bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 overflow-hidden"
        onClick={handleFieldClick}
      >
        {/* 유물 바 — 전투 필드 최상단 */}
        {relics.length > 0 && (
          <div className="px-3 pt-2 pb-1 flex justify-center flex-wrap gap-1" onClick={e => e.stopPropagation()}>
            <RelicBar relics={relics} />
          </div>
        )}

        {/* 캐릭터 영역 */}
        <div className="flex-1 flex items-end justify-around px-4 pb-4 pt-1 overflow-hidden">

        {/* 플레이어 (왼쪽) */}
        <div onClick={e => e.stopPropagation()}>
          <PlayerComponent
            player={player}
            spriteSize={91}
            effects={effects.filter(e => e.target === 'player')}
            vfxList={vfxList}
          />
        </div>

        {/* 적 영역 (오른쪽) */}
        <div className={`flex ${aliveEnemies.length >= 3 ? 'gap-2' : 'gap-4'} items-end justify-center`} onClick={e => e.stopPropagation()}>
          <AnimatePresence onExitComplete={handleEnemyExitComplete}>
            {enemies.map((enemy, idx) => {
              // deadIndices에 추가된 적: null 반환 → AnimatePresence가 exit 애니메이션 실행
              if (deadIndices.has(idx)) return null;
              // hp > 0이거나 아직 deadIndices에 없는 경우(200ms 대기 중) 표시
              return (
                <motion.div
                  key={`${enemy.def.id}-${idx}`}
                  layout
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <EnemyComponent
                    enemy={enemy}
                    selected={targetingMode && enemy.hp > 0}
                    onClick={() => handleEnemyClick(idx)}
                    spriteSize={
                      enemy.def.tier === 'boss' ? Math.round(spriteBase * 1.9) :
                      enemy.def.tier === 'elite' ? Math.round(spriteBase * 1.35) :
                      spriteBase
                    }
                    effects={effects.filter(e => e.target === idx)}
                    vfxList={vfxList}
                    enemyIdx={idx}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        </div>{/* 캐릭터 영역 끝 */}
      </div>

      {/* 손패 영역: pendingPhase 중에는 공간 유지하면서 숨김 (레이아웃 시프트 방지) */}
      <div className={`border-t border-zinc-700/50 bg-zinc-900/80 ${battle.pendingPhase ? 'invisible pointer-events-none' : ''}`}>
        <HandArea
          battle={battle}
          player={player}
          dispatch={dispatch}
          onEndTurn={() => dispatch({ type: 'END_TURN' })}
          onShowPile={setShowPile}
        />
      </div>

      {/* 드로우/버리기 파일 카드 오버레이 */}
      <AnimatePresence>
        {showPile === 'draw' && (
          <CardListOverlay
            title={`드로우 파일 (${battle.drawPile.length}장)`}
            cards={battle.drawPile}
            onClose={() => setShowPile(null)}
          />
        )}
        {showPile === 'discard' && (
          <CardListOverlay
            title={`버리기 파일 (${battle.discardPile.length}장)`}
            cards={battle.discardPile}
            onClose={() => setShowPile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
