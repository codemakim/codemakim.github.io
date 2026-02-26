import type {
  GameState, MapNode, BattleState, EnemyInstance, PlayerState,
  EnemyAction, EnemyDef, BuffType, EffectEvent, VfxType,
} from './types';
import { ALL_ENEMIES, NORMAL_ENEMIES, ELITE_ENEMIES, BOSS_ENEMIES } from './enemies';
import {
  getBuffValue, addBuff, tickBuffs, drawCards, calcDamage, copyCard,
  pickRandom, randInt,
} from './combat';
import { getInitialPattern, selectNextPattern, selectNextPatternIndex } from './ai';
import { generateRewards } from './rewardLogic';
import { updateSave } from './saveUtils';

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
  let player = { ...state.player, block: 0, energy: state.player.maxEnergy };
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

// ===== 카드 효과 적용 =====

export function applyCard(state: GameState, cardIndex: number, targetIndex: number): GameState {
  if (!state.battle) return state;

  const battle = state.battle;
  const cardInst = battle.hand[cardIndex];
  if (!cardInst) return state;
  const card = cardInst.def;

  const actualCost = card.cost === -1 ? state.player.energy : card.cost;
  if (card.type === 'curse' || state.player.energy < actualCost) return state;

  let player = { ...state.player, energy: state.player.energy - actualCost };
  let enemies = [...battle.enemies];
  let hand = battle.hand.filter((_, i) => i !== cardIndex);
  let drawPile = [...battle.drawPile];
  let discardPile = [...battle.discardPile];
  const exhaustPile = [...battle.exhaustPile];
  let activePowers = [...battle.activePowers];
  let pendingDamageBonus = battle.pendingDamageBonus;

  const xValue = card.cost === -1 ? actualCost : 1;
  const effectEvents: EffectEvent[] = [];
  let hitDelay = 0;

  for (const effect of card.effects) {
    switch (effect.type) {
      case 'damage': {
        const strength = getBuffValue(player.buffs, 'strength');
        const isWeak = getBuffValue(player.buffs, 'weak') > 0;
        const targets = effect.target === 'all' ? enemies.map((_, i) => i) : [targetIndex];
        const hits = card.id === 'whirlwind' ? xValue : (effect.hits ?? 1);
        const hasToughBoots = state.relics.some(r => r.id === 'tough_boots');
        // 힘·보너스 효과는 타격마다 독립 적용 → 연타일수록 배증
        const hitBonus = card.type === 'attack' ? pendingDamageBonus : 0;
        if (hitBonus > 0) pendingDamageBonus = 0; // 이번 카드 소비

        for (let t = 0; t < hits; t++) {
          for (const ti of targets) {
            const e = enemies[ti];
            if (!e || e.hp <= 0) continue;
            const isVulnerable = getBuffValue(e.buffs, 'vulnerable') > 0;
            let baseDmg = effect.value;
            if (card.id === 'execute' && e.hp <= e.maxHp * 0.5) baseDmg = 25;
            if (hitBonus > 0) baseDmg += hitBonus; // 모든 타격에 적용
            const dmg = calcDamage(baseDmg, strength, isWeak, isVulnerable);
            let eBlock = e.block, eHp = e.hp;
            if (dmg <= eBlock) { eBlock -= dmg; }
            else { eHp -= (dmg - eBlock); eBlock = 0; }
            enemies[ti] = { ...e, hp: Math.max(0, eHp), block: eBlock };

            // 단단한 부츠: 방어에 완전히 막혀도 최소 1 피해
            if (hasToughBoots && dmg > 0 && enemies[ti].hp === e.hp && enemies[ti].hp > 0) {
              enemies[ti] = { ...enemies[ti], hp: enemies[ti].hp - 1 };
            }

            const hpDmgActual = e.hp - enemies[ti].hp;
            const effectVfx: VfxType | undefined =
              (effect as { vfx?: VfxType }).vfx ?? card.vfx;
            effectEvents.push({
              delayMs: hitDelay,
              type: 'damage',
              value: hpDmgActual,
              target: ti,
              vfx: effectVfx,
            });
            hitDelay += 120;
          }
        }
        break;
      }
      case 'block': {
        const dex = getBuffValue(player.buffs, 'dexterity');
        player = { ...player, block: player.block + effect.value + dex };
        effectEvents.push({ delayMs: 0, type: 'block', value: effect.value + dex, target: 'player', vfx: 'shield' });
        break;
      }
      case 'draw': {
        const tmp: BattleState = { ...battle, hand, drawPile, discardPile, enemies, activePowers, exhaustPile, pendingDamageBonus, pendingEffects: [] };
        const drawn = drawCards(tmp, effect.value);
        hand = drawn.hand; drawPile = drawn.drawPile; discardPile = drawn.discardPile;
        break;
      }
      case 'buff': {
        const duration = effect.temporary ? 1 : undefined;
        if (effect.target === 'self') {
          player = { ...player, buffs: addBuff(player.buffs, effect.buff, effect.value, duration) };
          effectEvents.push({ delayMs: 0, type: 'buff', value: effect.value, target: 'player', vfx: 'buff' });
        } else if (effect.target === 'enemy') {
          const e = enemies[targetIndex];
          if (e) enemies[targetIndex] = { ...e, buffs: addBuff(e.buffs, effect.buff, effect.value) };
        } else if (effect.target === 'allEnemies') {
          enemies = enemies.map(e => ({ ...e, buffs: addBuff(e.buffs, effect.buff, effect.value) }));
        }
        break;
      }
      case 'heal': {
        player = { ...player, hp: Math.min(player.maxHp, Math.max(0, player.hp + effect.value)) };
        effectEvents.push({ delayMs: 0, type: 'heal', value: effect.value, target: 'player', vfx: 'heal' });
        break;
      }
      case 'gainEnergy': {
        player = { ...player, energy: player.energy + effect.value };
        break;
      }
      case 'addCopyToDiscard': {
        discardPile = [...discardPile, copyCard(cardInst)];
        break;
      }
    }
  }

  if (card.id === 'counter_stance') pendingDamageBonus = 3;

  if (card.type === 'power') {
    exhaustPile.push(cardInst);
    activePowers = [...activePowers, card.id];
  } else {
    discardPile = [...discardPile, cardInst];
  }

  const newBattle: BattleState = {
    ...battle, enemies, hand, drawPile, discardPile, exhaustPile,
    activePowers, pendingDamageBonus,
    selectedCardIndex: null, targetingMode: false,
    pendingEffects: effectEvents,
  };

  const allDead = enemies.every(e => e.hp <= 0);
  if (allDead) {
    const node = state.map.acts[state.currentAct]?.nodes.find(n => n.id === state.currentNodeId);
    if (!node) return state;
    const rewards = generateRewards({ ...state, player }, node);
    updateSave(state.score, state.currentAct, false);
    return {
      ...state,
      player,
      battle: { ...newBattle, pendingPhase: 'reward' as const },
      pendingRewards: rewards,
    };
  }

  return { ...state, player, battle: newBattle };
}

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

  // 2. 적 행동 — 적마다 개별 피해 이벤트
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

  // 4. 적 버프 틱 + 방어 리셋 + 인텐트 전진
  enemies = enemies.map(e => ({
    ...e,
    block: 0,
    buffs: tickBuffs(e.buffs),
    currentIntent: selectNextPattern(e),
    patternIndex: selectNextPatternIndex(e),
    turnCount: e.turnCount + 1,
  }));

  // 5. 플레이어 방어 리셋 + 버프 틱
  player = { ...player, block: 0, buffs: tickBuffs(player.buffs) };

  // 6. 턴 시작 유물 효과
  for (const relic of state.relics) {
    if (relic.effect.type === 'onTurnStart') {
      const action = relic.effect.action;
      if (action.type === 'gainBlock') player = { ...player, block: player.block + action.value };
    }
  }

  // 7. 파워 카드 효과
  const powers = state.battle.activePowers;
  if (powers.includes('iron_will')) player = { ...player, block: player.block + 3 };
  if (powers.includes('berserker')) player = { ...player, buffs: addBuff(player.buffs, 'strength', 1) };

  // 8. 카드 드로우
  const discardPile = [...state.battle.discardPile, ...state.battle.hand];
  let newBattle: BattleState = {
    ...state.battle, enemies, hand: [], drawPile: state.battle.drawPile, discardPile,
    turn: state.battle.turn + 1, selectedCardIndex: null, targetingMode: false, pendingDamageBonus: 0,
    pendingEffects: [],
  };
  newBattle = drawCards(newBattle, 5);

  // 9. PAIN 저주 체크
  const painCount = newBattle.hand.filter(c => c.def.id === 'pain').length;
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
