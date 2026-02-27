import type { CardDef, CardInstance } from './types';

// ===== 시작 덱 카드 =====

export const STRIKE: CardDef = {
  id: 'strike', name: '강타', type: 'attack', cost: 1,
  description: '6 데미지',
  effects: [{ type: 'damage', value: 6, target: 'single' }],
  vfx: 'impact',
};

export const DEFEND: CardDef = {
  id: 'defend', name: '수비', type: 'skill', cost: 1,
  description: '5 방어',
  effects: [{ type: 'block', value: 5 }],
  vfx: 'shield',
};

export const BASH: CardDef = {
  id: 'bash', name: '일섬', type: 'attack', cost: 2,
  description: '8 데미지\n취약 2',
  effects: [
    { type: 'damage', value: 8, target: 'single' },
    { type: 'buff', buff: 'vulnerable', value: 2, target: 'enemy' },
  ],
  vfx: 'slash',
};

// ===== 공격 카드 =====

export const BLADE_STORM: CardDef = {
  id: 'blade_storm', name: '칼날 폭풍', type: 'attack', cost: 1,
  description: '적 전체에 4 데미지',
  effects: [{ type: 'damage', value: 4, target: 'all' }],
  vfx: 'slash',
};

export const HEAVY_STRIKE: CardDef = {
  id: 'heavy_strike', name: '강력한 일격', type: 'attack', cost: 2,
  description: '18 데미지',
  effects: [{ type: 'damage', value: 18, target: 'single' }],
  vfx: 'impact',
};

export const ANGER: CardDef = {
  id: 'anger', name: '분노', type: 'attack', cost: 0,
  description: '6 데미지\n버린 더미에 복사본 추가',
  effects: [
    { type: 'damage', value: 6, target: 'single' },
    { type: 'addCopyToDiscard' },
  ],
  vfx: 'slash',
};

export const TWIN_STRIKE: CardDef = {
  id: 'twin_strike', name: '쌍검', type: 'attack', cost: 1,
  description: '4 데미지 × 2회',
  effects: [{ type: 'damage', value: 4, target: 'single', hits: 2 }],
  vfx: 'slash',
};

export const WHIRLWIND: CardDef = {
  id: 'whirlwind', name: '회전 베기', type: 'attack', cost: -1,
  description: '에너지 1당\n전체에 5 데미지',
  effects: [{ type: 'damage', value: 5, target: 'all' }],
  vfx: 'slash',
};

export const SWORD_DANCE: CardDef = {
  id: 'sword_dance', name: '칼날 춤', type: 'attack', cost: 1,
  description: '9 데미지\n자신에게 취약 1',
  effects: [
    { type: 'damage', value: 9, target: 'single' },
    { type: 'buff', buff: 'vulnerable', value: 1, target: 'self' },
  ],
  vfx: 'slash',
};

export const FURY: CardDef = {
  id: 'fury', name: '연타', type: 'attack', cost: 1,
  description: '2 데미지 × 4회',
  effects: [{ type: 'damage', value: 2, target: 'single', hits: 4 }],
  vfx: 'impact',
};

export const PUMMEL: CardDef = {
  id: 'pummel', name: '난타', type: 'attack', cost: 2,
  description: '3 데미지 × 5회',
  effects: [{ type: 'damage', value: 3, target: 'single', hits: 5 }],
  vfx: 'impact',
};

export const EXECUTE: CardDef = {
  id: 'execute', name: '처형', type: 'attack', cost: 2,
  description: '8 데미지\n(HP 50% 이하면 25 데미지)',
  effects: [{ type: 'damage', value: 8, target: 'single' }],
  vfx: 'pierce',
};

// ===== 방어 카드 =====

export const IRON_WALL: CardDef = {
  id: 'iron_wall', name: '철벽', type: 'skill', cost: 2,
  description: '14 방어',
  effects: [{ type: 'block', value: 14 }],
  vfx: 'shield',
};

export const BLOODLESS_DEFENSE: CardDef = {
  id: 'bloodless_defense', name: '무혈 수비', type: 'skill', cost: 1,
  description: '8 방어\nHP 3 잃음',
  effects: [
    { type: 'block', value: 8 },
    { type: 'heal', value: -3 },
  ],
  vfx: 'shield',
};

export const COUNTER_STANCE: CardDef = {
  id: 'counter_stance', name: '반격 준비', type: 'skill', cost: 1,
  description: '5 방어\n다음 공격 +3 데미지',
  effects: [{ type: 'block', value: 5 }],
  vfx: 'shield',
};

export const BATTLE_CRY: CardDef = {
  id: 'battle_cry', name: '전투 함성', type: 'skill', cost: 0,
  description: '3 방어\n카드 1장 드로우',
  effects: [
    { type: 'block', value: 3 },
    { type: 'draw', value: 1 },
  ],
  vfx: 'buff',
};

// ===== 스킬 카드 =====

export const FLEX: CardDef = {
  id: 'flex', name: '근육 강화', type: 'skill', cost: 0,
  description: '힘 +2\n(이번 턴만)',
  effects: [{ type: 'buff', buff: 'strength', value: 2, target: 'self', temporary: true }],
  vfx: 'buff',
};

export const VIGILANCE: CardDef = {
  id: 'vigilance', name: '경계', type: 'skill', cost: 2,
  description: '8 방어\n카드 2장 드로우',
  effects: [
    { type: 'block', value: 8 },
    { type: 'draw', value: 2 },
  ],
  vfx: 'shield',
};

export const BLOOD_RITUAL: CardDef = {
  id: 'blood_ritual', name: '피의 의식', type: 'skill', cost: 0,
  description: 'HP 3 잃고\n에너지 +2',
  effects: [
    { type: 'heal', value: -3 },
    { type: 'gainEnergy', value: 2 },
  ],
  vfx: 'magic',
};

export const WAR_CRY: CardDef = {
  id: 'war_cry', name: '전쟁의 함성', type: 'skill', cost: 0,
  description: '카드 2장 드로우',
  effects: [{ type: 'draw', value: 2 }],
  vfx: 'buff',
};

export const ROAR: CardDef = {
  id: 'roar', name: '포효', type: 'skill', cost: 1,
  description: '적 전체에 약화 1',
  effects: [{ type: 'buff', buff: 'weak', value: 1, target: 'allEnemies' }],
  vfx: 'magic',
};

// ===== 파워 카드 =====

export const IRON_WILL: CardDef = {
  id: 'iron_will', name: '강철 의지', type: 'power', cost: 1,
  description: '매 턴 시작\n방어 3 획득',
  effects: [],
  vfx: 'buff',
};

export const BERSERKER: CardDef = {
  id: 'berserker', name: '광전사', type: 'power', cost: 1,
  description: '매 턴 시작\n힘 +1',
  effects: [],
  vfx: 'buff',
};

export const THORNS_CARD: CardDef = {
  id: 'thorns_card', name: '가시 갑옷', type: 'power', cost: 1,
  description: '피격 시\n공격자에게 3 데미지',
  effects: [{ type: 'buff', buff: 'thorns', value: 3, target: 'self' }],
  vfx: 'buff',
};

// ===== 저주 카드 =====

export const PAIN: CardDef = {
  id: 'pain', name: '고통', type: 'curse', cost: 99,
  description: '사용 불가\n손패에 있으면\n턴 시작 시 HP -1',
  effects: [],
  vfx: 'none',
};

// ===== 카드 풀 =====

export const REWARD_CARD_POOL: CardDef[] = [
  BLADE_STORM, HEAVY_STRIKE, ANGER, TWIN_STRIKE, FURY, PUMMEL, WHIRLWIND, SWORD_DANCE, EXECUTE,
  IRON_WALL, BLOODLESS_DEFENSE, COUNTER_STANCE, BATTLE_CRY,
  FLEX, VIGILANCE, BLOOD_RITUAL, WAR_CRY, ROAR,
  IRON_WILL, BERSERKER, THORNS_CARD,
];

export function createStarterDeck(): CardDef[] {
  return [
    ...Array(4).fill(STRIKE),
    ...Array(3).fill(DEFEND),
    BASH,
  ];
}

let instanceCounter = 0;
export function makeInstance(def: CardDef): CardInstance {
  return { def, instanceId: `card-${instanceCounter++}`, upgraded: false };
}
