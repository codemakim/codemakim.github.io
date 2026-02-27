import type { GameState, PendingRewards, MapNode, CardDef } from './types';
import { REWARD_CARD_POOL } from './cards';
import { TREASURE_RELICS, ELITE_RELICS, BOSS_RELICS } from './relics';
import { pickRandom, randInt } from './combat';
import { updateSave } from './saveUtils';

// ===== 카드 선택지 생성 =====

export function generateCardChoices(): CardDef[] {
  const pool = [...REWARD_CARD_POOL];
  const picks: CardDef[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
}

// ===== 보상 생성 =====

export function generateRewards(state: GameState, node: MapNode): PendingRewards {
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
  const enemies = state.battle?.enemies ?? [];
  const totalMaxHp = enemies.reduce((sum, e) => sum + e.maxHp, 0);
  const difficultyBonus = Math.floor(totalMaxHp / 5);
  const gold = randInt(isElite ? 30 : 15, isElite ? 50 : 25) + difficultyBonus + goldBonus;
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

// ===== 보상 완료 체크 → 다음 페이즈 결정 =====

export function checkRewardsDone(state: GameState): GameState {
  const r = state.pendingRewards;
  if (!r) return { ...state, phase: 'map' };
  if (!r.cardCollected || !r.goldCollected || !r.relicCollected) return state;

  if (r.isBossReward) {
    if (state.currentAct >= 2) {
      updateSave(state.score, state.currentAct, true);
      return { ...state, phase: 'victory', pendingRewards: null };
    }
    const nextAct = state.currentAct + 1;
    const nextActMap = state.map.acts[nextAct];
    if (!nextActMap) return { ...state, phase: 'victory', pendingRewards: null };
    return {
      ...state, phase: 'map', currentAct: nextAct, currentNodeId: '', pendingRewards: null,
      player: { ...state.player, hp: state.player.maxHp, block: 0, buffs: [] },
    };
  }

  return { ...state, phase: 'map', pendingRewards: null };
}
