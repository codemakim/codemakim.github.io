'use client';

import { useReducer } from 'react';
import type {
  GameState, GameAction, PlayerState, BattleState, EnemyInstance,
  EnemyAction, CardInstance, CardDef, BuffType, PendingRewards, MapNode,
} from './types';
import { createStarterDeck, makeInstance, REWARD_CARD_POOL } from './cards';
import { BURNING_BLOOD, TREASURE_RELICS, ELITE_RELICS, BOSS_RELICS } from './relics';
import { ALL_ENEMIES, NORMAL_ENEMIES, ELITE_ENEMIES, BOSS_ENEMIES } from './enemies';
import { getBuffValue, addBuff, tickBuffs, drawCards, calcDamage, newInstanceId, copyCard } from './combat';
import { getInitialPattern, selectNextPattern, selectNextPatternIndex } from './ai';
import { generateMap, makeNextNodesAvailable } from './mapGen';

// ===== 저장 =====

const SAVE_KEY = 'game_spire_save';

export function loadSave() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; }
}

function updateSave(score: number, act: number, won: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const prev = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      bestScore: Math.max(prev.bestScore ?? 0, score),
      bestAct: Math.max(prev.bestAct ?? 0, act + 1),
      totalRuns: (prev.totalRuns ?? 0) + 1,
      totalWins: (prev.totalWins ?? 0) + (won ? 1 : 0),
    }));
  } catch { /* ignore */ }
}

// ===== 초기 상태 =====

function createInitialState(): GameState {
  const map = generateMap();
  const deck = createStarterDeck().map(def => makeInstance(def));

  return {
    phase: 'map',
    player: { hp: 80, maxHp: 80, block: 0, energy: 3, maxEnergy: 3, buffs: [] },
    battle: null,
    map,
    currentAct: 0,
    currentNodeId: '',
    deck,
    relics: [BURNING_BLOOD],
    gold: 0,
    score: 0,
    pendingRewards: null,
  };
}

// ===== 유틸 =====

function getCurrentNode(state: GameState): MapNode | undefined {
  return state.map.acts[state.currentAct]?.nodes.find(n => n.id === state.currentNodeId);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateCardChoices(): CardDef[] {
  const pool = [...REWARD_CARD_POOL];
  const picks: CardDef[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
}

function generateRewards(state: GameState, node: MapNode): PendingRewards {
  const nodeType = node.type;
  const hasAncientCoin = state.relics.some(r => r.id === 'ancient_coin');
  const goldBonus = hasAncientCoin ? 25 : 0;

  if (nodeType === 'boss') {
    const relicPool = BOSS_RELICS.filter(r => !state.relics.some(pr => pr.id === r.id));
    const relic = relicPool.length > 0 ? pickRandom(relicPool) : null;
    return { cardChoices: [], gold: 0, relic, cardCollected: true, goldCollected: true, relicCollected: false, isBossReward: true };
  }

  if (nodeType === 'treasure') {
    const relicPool = TREASURE_RELICS.filter(r => !state.relics.some(pr => pr.id === r.id));
    const relic = relicPool.length > 0 ? pickRandom(relicPool) : null;
    return { cardChoices: [], gold: 0, relic, cardCollected: true, goldCollected: true, relicCollected: false, isBossReward: false };
  }

  const isElite = nodeType === 'elite';
  const gold = randInt(isElite ? 30 : 15, isElite ? 50 : 25) + goldBonus;
  const relicPool = isElite ? ELITE_RELICS.filter(r => !state.relics.some(pr => pr.id === r.id)) : [];
  const relic = isElite && relicPool.length > 0 ? pickRandom(relicPool) : null;

  return {
    cardChoices: generateCardChoices(),
    gold,
    relic,
    cardCollected: false,
    goldCollected: false,
    relicCollected: relic === null,
    isBossReward: false,
  };
}

// ===== 전투 초기화 =====

function makeEnemy(def: import('./types').EnemyDef): EnemyInstance {
  const hp = randInt(def.hp[0], def.hp[1]);
  return {
    def, hp, maxHp: hp, block: 0, buffs: [],
    currentIntent: getInitialPattern(def), patternIndex: 0, turnCount: 0,
  };
}

function initBattle(state: GameState, node: MapNode): GameState {
  const act = (state.currentAct + 1) as 1 | 2 | 3;
  const tier = node.type === 'elite' ? 'elite' : node.type === 'boss' ? 'boss' : 'normal';

  let pool = tier === 'elite' ? ELITE_ENEMIES : tier === 'boss' ? BOSS_ENEMIES : NORMAL_ENEMIES;
  pool = pool.filter(e => e.act.includes(act));
  if (pool.length === 0) pool = ALL_ENEMIES.filter(e => e.tier === tier);
  if (pool.length === 0) pool = NORMAL_ENEMIES;

  let enemies: EnemyInstance[];
  if (tier === 'normal') {
    const count = Math.random() < 0.4 ? 2 : Math.random() < 0.15 ? 3 : 1;
    const picked: import('./types').EnemyDef[] = [];
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

function applyCard(state: GameState, cardIndex: number, targetIndex: number): GameState {
  if (!state.battle) return state;

  const battle = state.battle;
  const cardInst = battle.hand[cardIndex];
  if (!cardInst) return state;
  const card = cardInst.def;

  // 코스트 확인
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

  // X 비용 = 사용한 에너지량
  const xValue = card.cost === -1 ? actualCost : 1;

  for (const effect of card.effects) {
    switch (effect.type) {
      case 'damage': {
        const strength = getBuffValue(player.buffs, 'strength');
        const isWeak = getBuffValue(player.buffs, 'weak') > 0;
        const targets = effect.target === 'all' ? enemies.map((_, i) => i) : [targetIndex];
        const times = card.id === 'whirlwind' ? xValue : 1;

        for (let t = 0; t < times; t++) {
          for (const ti of targets) {
            const e = enemies[ti];
            if (!e || e.hp <= 0) continue;
            const isVulnerable = getBuffValue(e.buffs, 'vulnerable') > 0;
            let baseDmg = effect.value;
            if (card.id === 'execute' && e.hp <= e.maxHp * 0.5) baseDmg = 25;
            if (card.type === 'attack' && pendingDamageBonus > 0) {
              baseDmg += pendingDamageBonus;
              pendingDamageBonus = 0;
            }
            const dmg = calcDamage(baseDmg, strength, isWeak, isVulnerable);
            let eBlock = e.block, eHp = e.hp;
            if (dmg <= eBlock) { eBlock -= dmg; }
            else { eHp -= (dmg - eBlock); eBlock = 0; }
            enemies[ti] = { ...e, hp: Math.max(0, eHp), block: eBlock };
          }
        }
        break;
      }
      case 'block': {
        const dex = getBuffValue(player.buffs, 'dexterity');
        player = { ...player, block: player.block + effect.value + dex };
        break;
      }
      case 'draw': {
        const tmp: BattleState = { ...battle, hand, drawPile, discardPile, enemies, activePowers, exhaustPile, pendingDamageBonus };
        const drawn = drawCards(tmp, effect.value);
        hand = drawn.hand; drawPile = drawn.drawPile; discardPile = drawn.discardPile;
        break;
      }
      case 'buff': {
        const duration = effect.temporary ? 1 : undefined;
        if (effect.target === 'self') {
          player = { ...player, buffs: addBuff(player.buffs, effect.buff, effect.value, duration) };
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

  // counter_stance 특수 처리
  if (card.id === 'counter_stance') pendingDamageBonus = 3;

  // 파워 카드 처리
  if (card.type === 'power') {
    exhaustPile.push(cardInst);
    activePowers = [...activePowers, card.id];
    // thorns_card는 이미 effect에서 처리됨
  } else {
    discardPile = [...discardPile, cardInst];
  }

  const newBattle: BattleState = {
    ...battle, enemies, hand, drawPile, discardPile, exhaustPile,
    activePowers, pendingDamageBonus,
    selectedCardIndex: null, targetingMode: false,
  };

  // 적 전멸 체크
  const allDead = enemies.every(e => e.hp <= 0);
  if (allDead) {
    const node = getCurrentNode(state);
    if (!node) return state;
    const rewards = generateRewards({ ...state, player }, node);
    updateSave(state.score, state.currentAct, false);
    return { ...state, player, battle: null, phase: 'reward', pendingRewards: rewards };
  }

  return { ...state, player, battle: newBattle };
}

// ===== 적 행동 실행 =====

function executeEnemyAction(
  player: PlayerState,
  enemies: EnemyInstance[],
  enemyIdx: number,
  action: EnemyAction
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
        // 가시 처리
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
}

// ===== 적 턴 처리 =====

function processEnemyTurn(state: GameState): GameState {
  if (!state.battle) return state;
  let { player } = state;
  let { enemies } = state.battle;

  // 1. 적 독 데미지
  enemies = enemies.map(e => {
    const poison = getBuffValue(e.buffs, 'poison');
    if (poison <= 0) return e;
    return {
      ...e,
      hp: Math.max(0, e.hp - poison),
      buffs: e.buffs.map(b => b.type === 'poison' ? { ...b, value: b.value - 1 } : b).filter(b => b.type !== 'poison' || b.value > 0),
    };
  });

  // 2. 적 행동
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hp <= 0) continue;
    const r = executeEnemyAction(player, enemies, i, enemies[i].currentIntent.action);
    player = r.player; enemies = r.enemies;
  }

  // 3. 플레이어 사망 체크
  if (player.hp <= 0) {
    updateSave(state.score, state.currentAct, false);
    return { ...state, player: { ...player, hp: 0 }, phase: 'gameOver', battle: null };
  }

  // 4. 적 버프 틱 + 방어 리셋
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
  }

  // 10. 에너지 충전
  player = { ...player, energy: player.maxEnergy };

  return { ...state, player, battle: newBattle };
}

// ===== 보상 완료 체크 =====

function checkRewardsDone(state: GameState): GameState {
  const r = state.pendingRewards;
  if (!r) return { ...state, phase: 'map' };
  if (!r.cardCollected || !r.goldCollected || !r.relicCollected) return state;

  if (r.isBossReward) {
    if (state.currentAct >= 2) {
      updateSave(state.score, state.currentAct, true);
      return { ...state, phase: 'victory', pendingRewards: null };
    }
    // 다음 Act으로
    const nextAct = state.currentAct + 1;
    const nextActMap = state.map.acts[nextAct];
    if (!nextActMap) return { ...state, phase: 'victory', pendingRewards: null };
    return { ...state, phase: 'map', currentAct: nextAct, currentNodeId: '', pendingRewards: null };
  }

  return { ...state, phase: 'map', pendingRewards: null };
}

// ===== 맵 노드 방문 처리 =====

function visitNode(state: GameState, nodeId: string): GameState {
  const act = state.currentAct;
  const actMap = state.map.acts[act];
  if (!actMap) return state;

  const updatedActMap = makeNextNodesAvailable(
    { ...actMap, nodes: actMap.nodes.map(n => n.id === nodeId ? { ...n, visited: true } : n) },
    nodeId
  );

  const newActs = state.map.acts.map((a, i) => i === act ? updatedActMap : a);
  return { ...state, map: { acts: newActs } };
}

// ===== REDUCER =====

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SELECT_NODE': {
      const node = state.map.acts[state.currentAct]?.nodes.find(n => n.id === action.nodeId);
      if (!node || !node.available || node.visited) return state;

      if (node.type === 'rest') {
        return { ...visitNode(state, node.id), phase: 'rest', currentNodeId: node.id };
      }

      if (node.type === 'treasure') {
        const rewards = generateRewards(state, node);
        return { ...visitNode(state, node.id), phase: 'reward', pendingRewards: rewards, currentNodeId: node.id };
      }

      // battle / elite / boss
      return initBattle(visitNode(state, action.nodeId), node);
    }

    case 'SELECT_CARD': {
      if (!state.battle) return state;
      const card = state.battle.hand[action.cardIndex]?.def;
      if (!card) return state;
      // 이미 선택된 카드를 다시 누르면 해제
      if (state.battle.selectedCardIndex === action.cardIndex) {
        return { ...state, battle: { ...state.battle, selectedCardIndex: null, targetingMode: false } };
      }
      const isTargeted = card.type === 'attack' || card.effects.some(e => e.type === 'buff' && (e as { target: string }).target === 'enemy');
      const aliveEnemies = state.battle.enemies.filter(e => e.hp > 0);
      const needsTarget = isTargeted && aliveEnemies.length > 1;
      return {
        ...state,
        battle: {
          ...state.battle,
          selectedCardIndex: action.cardIndex,
          targetingMode: needsTarget,
        }
      };
    }

    case 'DESELECT_CARD': {
      if (!state.battle) return state;
      return { ...state, battle: { ...state.battle, selectedCardIndex: null, targetingMode: false } };
    }

    case 'PLAY_CARD': {
      if (!state.battle) return state;
      const targetIndex = action.targetIndex ?? 0;
      return applyCard(state, action.cardIndex, targetIndex);
    }

    case 'END_TURN': {
      return processEnemyTurn(state);
    }

    case 'PICK_CARD_REWARD': {
      if (!state.pendingRewards) return state;
      const chosen = state.pendingRewards.cardChoices[action.cardIndex];
      if (!chosen) return state;
      const newCard = makeInstance(chosen);
      const updated = { ...state, deck: [...state.deck, newCard], pendingRewards: { ...state.pendingRewards, cardCollected: true } };
      return checkRewardsDone(updated);
    }

    case 'SKIP_CARD_REWARD': {
      if (!state.pendingRewards) return state;
      const updated = { ...state, pendingRewards: { ...state.pendingRewards, cardCollected: true } };
      return checkRewardsDone(updated);
    }

    case 'COLLECT_GOLD': {
      if (!state.pendingRewards) return state;
      const updated = {
        ...state,
        gold: state.gold + state.pendingRewards.gold,
        pendingRewards: { ...state.pendingRewards, goldCollected: true },
      };
      return checkRewardsDone(updated);
    }

    case 'COLLECT_RELIC': {
      if (!state.pendingRewards?.relic) return state;
      const relic = state.pendingRewards.relic;
      let newRelics = [...state.relics, relic];
      let player = { ...state.player };

      // 유물 즉시 효과
      if (relic.effect.type === 'passive') {
        if (relic.effect.stat === 'maxEnergy') {
          player = { ...player, maxEnergy: player.maxEnergy + relic.effect.value, energy: player.energy + relic.effect.value };
        }
      }

      const updated = {
        ...state, player, relics: newRelics,
        pendingRewards: { ...state.pendingRewards, relic: state.pendingRewards.relic, relicCollected: true },
      };
      return checkRewardsDone(updated);
    }

    case 'PROCEED_TO_MAP': {
      return checkRewardsDone({ ...state, pendingRewards: state.pendingRewards ? { ...state.pendingRewards, cardCollected: true, goldCollected: true, relicCollected: true } : null });
    }

    case 'REST_HEAL': {
      const healingFlask = state.relics.find(r => r.id === 'healing_flask');
      const healMultiplier = healingFlask?.effect.type === 'onRest' ? healingFlask.effect.healMultiplier : 0.3;
      const heal = Math.floor(state.player.maxHp * healMultiplier);
      return {
        ...state,
        phase: 'map',
        player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + heal) },
      };
    }

    case 'REST_REMOVE_CARD': {
      const newDeck = state.deck.filter((_, i) => i !== action.cardIndex);
      return { ...state, phase: 'map', deck: newDeck };
    }

    case 'RESTART': {
      return createInitialState();
    }

    default:
      return state;
  }
}

// ===== 중간 저장 (직렬화/역직렬화) =====

const RUN_SAVE_KEY = 'game_spire_run';

export function serializeRun(state: GameState): string {
  return JSON.stringify({
    player: state.player,
    deck: state.deck.map(c => ({ defId: c.def.id, instanceId: c.instanceId, upgraded: c.upgraded })),
    relicIds: state.relics.map(r => r.id),
    gold: state.gold,
    score: state.score,
    currentAct: state.currentAct,
    currentNodeId: state.currentNodeId,
    mapState: state.map,
    phase: state.phase,
  });
}

export function deserializeRun(json: string): GameState | null {
  try {
    const data = JSON.parse(json);
    const allCards = [...createStarterDeck(), ...REWARD_CARD_POOL];
    const cardMap = new Map(allCards.map(c => [c.id, c]));
    const allRelicList = [BURNING_BLOOD, ...TREASURE_RELICS, ...ELITE_RELICS, ...BOSS_RELICS];
    const relicMap = new Map(allRelicList.map(r => [r.id, r]));

    const deck: CardInstance[] = data.deck
      .map((c: { defId: string; instanceId: string; upgraded: boolean }) => {
        const def = cardMap.get(c.defId);
        if (!def) return null;
        return { def, instanceId: c.instanceId, upgraded: c.upgraded };
      })
      .filter(Boolean) as CardInstance[];

    const relics = data.relicIds
      .map((id: string) => relicMap.get(id))
      .filter(Boolean) as import('./types').RelicDef[];

    return {
      phase: data.phase || 'map',
      player: data.player,
      battle: null,
      map: data.mapState,
      currentAct: data.currentAct,
      currentNodeId: data.currentNodeId,
      deck,
      relics,
      gold: data.gold,
      score: data.score,
      pendingRewards: null,
    };
  } catch {
    return null;
  }
}

export function saveRunToLocal(state: GameState): void {
  if (typeof window === 'undefined') return;
  if (state.phase === 'gameOver' || state.phase === 'victory') {
    localStorage.removeItem(RUN_SAVE_KEY);
    return;
  }
  localStorage.setItem(RUN_SAVE_KEY, serializeRun(state));
}

export function loadRunFromLocal(): GameState | null {
  if (typeof window === 'undefined') return null;
  const json = localStorage.getItem(RUN_SAVE_KEY);
  if (!json) return null;
  return deserializeRun(json);
}

export function clearRunSave(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RUN_SAVE_KEY);
}

// ===== HOOK =====

export function useSpireGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  return { state, dispatch };
}
