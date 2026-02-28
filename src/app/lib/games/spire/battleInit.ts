/**
 * @file battleInit.ts
 * @description 적 인스턴스 생성 및 전투 초기화
 *
 * 역할:
 *   makeEnemy()  — EnemyDef → EnemyInstance 변환 (HP 랜덤 롤, 초기 인텐트 설정)
 *   initBattle() — 맵 노드 유형(normal/elite/boss)에 따라 적 풀 선택,
 *                  덱 셔플, BattleState 생성, 유물 전투 시작 효과 적용
 *
 * 의존:
 *   enemies.ts   (ALL_ENEMIES, NORMAL_ENEMIES, ELITE_ENEMIES, BOSS_ENEMIES)
 *   combat.ts    (addBuff, drawCards, pickRandom, randInt)
 *   ai.ts        (getInitialPattern)
 */

import type {
  GameState, MapNode, BattleState, EnemyInstance,
  EnemyDef, BuffType, BuffState,
} from './types';
import { ALL_ENEMIES, NORMAL_ENEMIES, ELITE_ENEMIES, BOSS_ENEMIES } from './enemies';
import { addBuff, drawCards, pickRandom, randInt } from './combat';
import { getInitialPattern } from './ai';

// ===== 적 인스턴스 생성 =====

export function makeEnemy(def: EnemyDef): EnemyInstance {
  const hp = randInt(def.hp[0], def.hp[1]);
  return {
    def, hp, maxHp: hp, block: 0, buffs: [],
    currentIntent: getInitialPattern(def), patternIndex: 0, turnCount: 0,
  };
}

// ===== 전투 초기화 =====

export function initBattle(state: GameState, node: MapNode): GameState {
  const act = (state.currentAct + 1) as 1 | 2 | 3;
  const tier = node.type === 'elite' ? 'elite' : node.type === 'boss' ? 'boss' : 'normal';

  let pool = tier === 'elite' ? ELITE_ENEMIES : tier === 'boss' ? BOSS_ENEMIES : NORMAL_ENEMIES;
  pool = pool.filter(e => e.act.includes(act));
  if (pool.length === 0) pool = ALL_ENEMIES.filter(e => e.tier === tier);
  if (pool.length === 0) pool = NORMAL_ENEMIES;

  let enemies: EnemyInstance[];
  if (tier === 'normal') {
    const count = Math.random() < 0.4 ? 2 : Math.random() < 0.15 ? 3 : 1;
    const picked: EnemyDef[] = [];
    for (let i = 0; i < count; i++) {
      picked.push(pickRandom(pool));
    }
    enemies = picked.map(makeEnemy);
  } else {
    enemies = [makeEnemy(pickRandom(pool))];
  }

  const shuffled = [...state.deck].sort(() => Math.random() - 0.5);
  let battle: BattleState = {
    enemies,
    hand: [], drawPile: shuffled, discardPile: [], exhaustPile: [],
    activePowers: [], turn: 0,
    selectedCardIndex: null, targetingMode: false, pendingDamageBonus: 0,
    pendingEffects: [],
  };
  battle = drawCards(battle, 5);

  // 전투 시작 유물 효과
  let player = { ...state.player, block: 0, energy: state.player.maxEnergy, buffs: [] as BuffState[] };
  for (const relic of state.relics) {
    if (relic.effect.type === 'onBattleStart') {
      const action = relic.effect.action;
      if (action.type === 'heal') player = { ...player, hp: Math.min(player.maxHp, player.hp + action.value) };
      if (action.type === 'buff') player = { ...player, buffs: addBuff(player.buffs, action.buff as BuffType, action.value) };
    }
  }

  // PAIN 체크
  const painCount = battle.hand.filter(c => c.def.id === 'pain').length;
  if (painCount > 0) player = { ...player, hp: Math.max(1, player.hp - painCount) };

  return {
    ...state, phase: 'battle',
    player, battle,
    currentNodeId: node.id,
    score: state.score + (tier === 'boss' ? 50 : tier === 'elite' ? 20 : 10),
  };
}
