/**
 * @file enemyLogic.ts
 * @description 적 단일 행동 실행 및 적 턴 전체 처리
 *
 * 이펙트 흐름:
 *   processEnemyTurn() → EffectEvent[] 생성 (delayMs 포함)
 *   → BattleState.pendingEffects[]에 적재
 *   → BattleScene.tsx가 delayMs 스태거로 addEffect / addVfx 스케줄링
 *   → EffectLayer.tsx → VfxRenderer (ImpactEffect 등) + PopupRenderer (DamagePopup)
 *
 * 역할:
 *   executeEnemyAction() — 단일 적의 한 가지 행동(attack/block/buff/debuff/heal/multi) 실행.
 *                          재귀 multi 지원, 가시(thorns) 반사 데미지 처리.
 *   processEnemyTurn()   — 플레이어 턴 종료 후 적 턴 전체 흐름 처리:
 *                          버프 틱 → 독 데미지 → 적 행동 → 사망 체크 →
 *                          인텐트 전진 → 카드 드로우 → 에너지 충전
 *
 * 의존:
 *   combat.ts      (getBuffValue, addBuff, tickBuffs, drawCards, calcDamage)
 *   ai.ts          (selectNextPattern, selectNextPatternIndex)
 *   rewardLogic.ts (generateRewards)
 *   saveUtils.ts   (updateSave)
 */

import type {
  GameState, BattleState, PlayerState, EnemyInstance,
  EnemyAction, EffectEvent, VfxType,
} from './types';
import {
  getBuffValue, addBuff, tickBuffs, drawCards, calcDamage,
} from './combat';
import { selectNextPattern, selectNextPatternIndex } from './ai';
import { generateRewards } from './rewardLogic';
import { updateSave } from './saveUtils';

// ===== 적 단일 행동 실행 =====

export function executeEnemyAction(
  player: PlayerState,
  enemies: EnemyInstance[],
  enemyIdx: number,
  action: EnemyAction,
): { player: PlayerState; enemies: EnemyInstance[] } {
  const enemy = enemies[enemyIdx];

  switch (action.type) {
    case 'attack': {
      const times = action.times ?? 1;
      let p = player; let e = [...enemies];
      for (let t = 0; t < times; t++) {
        const strength = getBuffValue(e[enemyIdx].buffs, 'strength');
        const isWeak = getBuffValue(e[enemyIdx].buffs, 'weak') > 0;
        const isVuln = getBuffValue(p.buffs, 'vulnerable') > 0;
        const dmg = calcDamage(action.damage, strength, isWeak, isVuln);
        let block = p.block, hp = p.hp, hpDmg = 0;
        if (dmg <= block) { block -= dmg; }
        else { hpDmg = dmg - block; block = 0; hp -= hpDmg; }
        p = { ...p, hp, block };
        const thorns = getBuffValue(p.buffs, 'thorns');
        if (thorns > 0 && hpDmg > 0) {
          e = e.map((en, i) => i === enemyIdx ? { ...en, hp: Math.max(0, en.hp - thorns) } : en);
        }
      }
      return { player: p, enemies: e };
    }
    case 'block': {
      const e = enemies.map((en, i) => i === enemyIdx ? { ...en, block: en.block + action.value } : en);
      return { player, enemies: e };
    }
    case 'buff': {
      const e = enemies.map((en, i) => i === enemyIdx ? { ...en, buffs: addBuff(en.buffs, action.buff, action.value) } : en);
      return { player, enemies: e };
    }
    case 'debuff': {
      const p = { ...player, buffs: addBuff(player.buffs, action.buff, action.value) };
      return { player: p, enemies };
    }
    case 'heal': {
      const e = enemies.map((en, i) => i === enemyIdx ? { ...en, hp: Math.min(en.maxHp, en.hp + action.value) } : en);
      return { player, enemies: e };
    }
    case 'multi': {
      let p = player, e = enemies;
      for (const sub of action.actions) {
        const r = executeEnemyAction(p, e, enemyIdx, sub);
        p = r.player; e = r.enemies;
      }
      return { player: p, enemies: e };
    }
    default: return { player, enemies };
  }

  // enemy 변수를 사용하지 않음을 명시적으로 처리
  void enemy;
}

// ===== 적 턴 전체 처리 =====

export function processEnemyTurn(state: GameState): GameState {
  if (!state.battle) return state;
  let { player } = state;
  let { enemies } = state.battle;

  const effectEvents: EffectEvent[] = [];
  let nextDelay = 0;

  // 0. 플레이어 버프 틱 (플레이어 턴 종료 시점)
  // 적이 이번 턴에 새로 건 디버프는 틱하지 않도록 적 행동 전에 처리
  player = { ...player, buffs: tickBuffs(player.buffs) };

  // 1. 적 독 데미지
  state.battle.enemies.forEach((e, i) => {
    const poison = getBuffValue(e.buffs, 'poison');
    if (poison > 0) {
      effectEvents.push({ delayMs: 0, type: 'damage', value: poison, target: i, vfx: 'poison' });
    }
  });
  if (effectEvents.length > 0) nextDelay = 300;

  enemies = enemies.map(e => {
    const poison = getBuffValue(e.buffs, 'poison');
    if (poison <= 0) return e;
    return {
      ...e,
      hp: Math.max(0, e.hp - poison),
      buffs: e.buffs.map(b => b.type === 'poison' ? { ...b, value: b.value - 1 } : b).filter(b => b.type !== 'poison' || b.value > 0),
    };
  });

  // 2. 적 행동 전 block 리셋 (이전 턴에서 쌓인 block 초기화 — 원작과 동일)
  enemies = enemies.map(e => ({ ...e, block: 0 }));

  // 3. 적 행동 — 적마다 개별 피해 이벤트
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hp <= 0) continue;
    const intentAction = enemies[i].currentIntent.action;
    const prevPlayerHp = player.hp;
    const r = executeEnemyAction(player, enemies, i, intentAction);
    player = r.player; enemies = r.enemies;

    const isAttackAction = intentAction.type === 'attack' ||
      (intentAction.type === 'multi' && intentAction.actions.some(a => a.type === 'attack'));

    if (isAttackAction) {
      const hpLost = Math.max(0, prevPlayerHp - player.hp);
      const vfx: VfxType =
        ('vfx' in intentAction && intentAction.vfx) ? intentAction.vfx as VfxType : 'impact';
      effectEvents.push({ delayMs: nextDelay, type: 'damage', value: hpLost, target: 'player', vfx });
      nextDelay += 400;
    }
  }

  // 3. 플레이어 사망 체크
  if (player.hp <= 0) {
    updateSave(state.score, state.currentAct, false);
    return { ...state, player: { ...player, hp: 0 }, phase: 'gameOver', battle: null };
  }

  // 3-b. 적 전체 사망 체크 (가시 등 반사 데미지로 적 턴 중 전멸한 경우)
  const allEnemiesDead = enemies.every(e => e.hp <= 0);
  if (allEnemiesDead) {
    const node = state.map.acts[state.currentAct]?.nodes.find(n => n.id === state.currentNodeId);
    if (!node) return state;
    const rewards = generateRewards({ ...state, player }, node);
    updateSave(state.score, state.currentAct, false);
    return {
      ...state,
      player,
      battle: {
        ...state.battle,
        enemies,
        pendingPhase: 'reward' as const,
        pendingEffects: effectEvents,
      },
      pendingRewards: rewards,
    };
  }

  // 4. 적 버프 틱 + 인텐트 전진 (block 리셋은 다음 적 턴 시작 시 처리)
  enemies = enemies.map(e => ({
    ...e,
    buffs: tickBuffs(e.buffs),
    currentIntent: selectNextPattern(e),
    patternIndex: selectNextPatternIndex(e),
    turnCount: e.turnCount + 1,
  }));

  // 5. 플레이어 방어 리셋 (버프 틱은 함수 시작 시 처리됨)
  player = { ...player, block: 0 };

  // 6. 턴 시작 유물 효과
  for (const relic of state.relics) {
    if (relic.effect.type === 'onTurnStart') {
      const action = relic.effect.action;
      if (action.type === 'gainBlock') player = { ...player, block: player.block + action.value };
    }
  }

  // 7. 파워 카드 효과
  const powers = state.battle.activePowers;
  if (powers.includes('endurance')) player = { ...player, block: player.block + 3 };
  if (powers.includes('bloodlust')) player = { ...player, buffs: addBuff(player.buffs, 'strength', 1) };

  // 8. 카드 드로우
  const discardPile = [...state.battle.discardPile, ...state.battle.hand];
  let newBattle: BattleState = {
    ...state.battle, enemies, hand: [], drawPile: state.battle.drawPile, discardPile,
    turn: state.battle.turn + 1, selectedCardIndex: null, targetingMode: false, pendingDamageBonus: 0,
    pendingEffects: [],
  };
  newBattle = drawCards(newBattle, 5);

  // 9. PAIN 저주 체크
  const painCount = newBattle.hand.filter(c => c.def.id === 'wound').length;
  if (painCount > 0) {
    player = { ...player, hp: player.hp - painCount };
    if (player.hp <= 0) {
      updateSave(state.score, state.currentAct, false);
      return { ...state, player: { ...player, hp: 0 }, phase: 'gameOver', battle: null };
    }
    effectEvents.push({ delayMs: nextDelay, type: 'damage', value: painCount, target: 'player' });
  }

  newBattle = { ...newBattle, pendingEffects: effectEvents };

  // 10. 에너지 충전
  player = { ...player, energy: player.maxEnergy };

  return { ...state, player, battle: newBattle };
}
