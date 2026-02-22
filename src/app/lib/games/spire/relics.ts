import type { RelicDef } from './types';

export const BURNING_BLOOD: RelicDef = {
  id: 'burning_blood',
  name: '불타는 피',
  description: '전투 시작 시 HP 6 회복',
  emoji: '🔥',
  effect: { type: 'onBattleStart', action: { type: 'heal', value: 6 } },
};

export const TOUGH_BOOTS: RelicDef = {
  id: 'tough_boots',
  name: '단단한 부츠',
  description: '매 턴 시작 시 방어 2 획득',
  emoji: '🥾',
  effect: { type: 'onTurnStart', action: { type: 'gainBlock', value: 2 } },
};

export const RAGE_MASK: RelicDef = {
  id: 'rage_mask',
  name: '분노의 가면',
  description: '전투 시작 시 힘 +1',
  emoji: '😤',
  effect: { type: 'onBattleStart', action: { type: 'buff', buff: 'strength', value: 1 } },
};

export const GUARDIAN_RING: RelicDef = {
  id: 'guardian_ring',
  name: '수호의 반지',
  description: '매 턴 시작 시 방어 2 획득',
  emoji: '💍',
  effect: { type: 'onTurnStart', action: { type: 'gainBlock', value: 2 } },
};

export const ENERGY_CRYSTAL: RelicDef = {
  id: 'energy_crystal',
  name: '에너지 수정',
  description: '최대 에너지 +1 (4로 시작)',
  emoji: '💎',
  effect: { type: 'passive', stat: 'maxEnergy', value: 1 },
};

export const HEALING_FLASK: RelicDef = {
  id: 'healing_flask',
  name: '치유의 물약',
  description: '휴식 시 HP 50% 회복',
  emoji: '🧪',
  effect: { type: 'onRest', healMultiplier: 0.5 },
};

export const ANCIENT_COIN: RelicDef = {
  id: 'ancient_coin',
  name: '고대 동전',
  description: '전투 보상 골드 +25',
  emoji: '🪙',
  effect: { type: 'passive', stat: 'goldBonus', value: 25 },
};

export const THORN_CROWN: RelicDef = {
  id: 'thorn_crown',
  name: '가시 왕관',
  description: '전투 시작 시 가시 3',
  emoji: '👑',
  effect: { type: 'onBattleStart', action: { type: 'buff', buff: 'thorns', value: 3 } },
};

// 보물 상자 유물 풀 (일반)
export const TREASURE_RELICS: RelicDef[] = [TOUGH_BOOTS, GUARDIAN_RING, HEALING_FLASK, ANCIENT_COIN];

// 엘리트 보상 유물 풀
export const ELITE_RELICS: RelicDef[] = [RAGE_MASK, ANCIENT_COIN, TOUGH_BOOTS];

// 보스 보상 유물 풀
export const BOSS_RELICS: RelicDef[] = [ENERGY_CRYSTAL, THORN_CROWN];

export const ALL_RELICS: RelicDef[] = [
  BURNING_BLOOD, TOUGH_BOOTS, RAGE_MASK, GUARDIAN_RING,
  ENERGY_CRYSTAL, HEALING_FLASK, ANCIENT_COIN, THORN_CROWN,
];
