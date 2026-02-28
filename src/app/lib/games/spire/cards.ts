import type { CardDef, CardInstance } from './types';

// ===== 시작 덱 카드 =====

export const SLASH: CardDef = {
  id: 'slash', name: '베기', type: 'attack', cost: 1,
  description: '6 데미지',
  effects: [{ type: 'damage', value: 6, target: 'single' }],
  vfx: 'slash',
};

export const GUARD: CardDef = {
  id: 'guard', name: '막기', type: 'skill', cost: 1,
  description: '5 방어',
  effects: [{ type: 'block', value: 5 }],
  vfx: 'shield',
};

export const ASSAULT: CardDef = {
  id: 'assault', name: '강습', type: 'attack', cost: 2,
  description: '8 데미지\n취약 2',
  effects: [
    { type: 'damage', value: 8, target: 'single' },
    { type: 'buff', buff: 'vulnerable', value: 2, target: 'enemy' },
  ],
  vfx: 'impact',
};

// ===== 공격 카드 =====

export const GALE_STRIKE: CardDef = {
  id: 'gale_strike', name: '선풍격', type: 'attack', cost: 1,
  description: '적 전체에 4 데미지',
  effects: [{ type: 'damage', value: 4, target: 'all' }],
  vfx: 'slash',
};

export const CRUSH: CardDef = {
  id: 'crush', name: '분쇄', type: 'attack', cost: 2,
  description: '18 데미지',
  effects: [{ type: 'damage', value: 18, target: 'single' }],
  vfx: 'impact',
};

export const FRENZY: CardDef = {
  id: 'frenzy', name: '격노', type: 'attack', cost: 0,
  description: '6 데미지\n버린 더미에 복사본 추가',
  effects: [
    { type: 'damage', value: 6, target: 'single' },
    { type: 'addCopyToDiscard' },
  ],
  vfx: 'slash',
};

export const DUAL_BLADE: CardDef = {
  id: 'dual_blade', name: '이도류', type: 'attack', cost: 1,
  description: '4 데미지 × 2회',
  effects: [{ type: 'damage', value: 4, target: 'single', hits: 2 }],
  vfx: 'slash',
};

export const ONSLAUGHT: CardDef = {
  id: 'onslaught', name: '난무', type: 'attack', cost: -1,
  description: '에너지 1당\n전체에 5 데미지',
  effects: [{ type: 'damage', value: 5, target: 'all' }],
  vfx: 'slash',
};

export const RECKLESS: CardDef = {
  id: 'reckless', name: '광폭격', type: 'attack', cost: 1,
  description: '9 데미지\n자신에게 취약 1',
  effects: [
    { type: 'damage', value: 9, target: 'single' },
    { type: 'buff', buff: 'vulnerable', value: 1, target: 'self' },
  ],
  vfx: 'slash',
};

export const FLURRY: CardDef = {
  id: 'flurry', name: '연격', type: 'attack', cost: 1,
  description: '2 데미지 × 4회',
  effects: [{ type: 'damage', value: 2, target: 'single', hits: 4 }],
  vfx: 'impact',
};

export const BARRAGE: CardDef = {
  id: 'barrage', name: '포격', type: 'attack', cost: 2,
  description: '3 데미지 × 5회',
  effects: [{ type: 'damage', value: 3, target: 'single', hits: 5 }],
  vfx: 'impact',
};

export const VERDICT: CardDef = {
  id: 'verdict', name: '심판', type: 'attack', cost: 2,
  description: '8 데미지\n(HP 50% 이하면 25 데미지)',
  effects: [{ type: 'damage', value: 8, target: 'single' }],
  vfx: 'pierce',
};

// ===== 방어 카드 =====

export const FORTIFY: CardDef = {
  id: 'fortify', name: '요새화', type: 'skill', cost: 2,
  description: '14 방어',
  effects: [{ type: 'block', value: 14 }],
  vfx: 'shield',
};

export const LAST_STAND: CardDef = {
  id: 'last_stand', name: '사투', type: 'skill', cost: 0,
  description: '9 방어\nHP 2 잃음',
  effects: [
    { type: 'block', value: 9 },
    { type: 'heal', value: -2 },
  ],
  vfx: 'shield',
};

export const READY_STANCE: CardDef = {
  id: 'ready_stance', name: '전투 자세', type: 'skill', cost: 1,
  description: '5 방어\n다음 공격 +3 데미지',
  effects: [{ type: 'block', value: 5 }],
  vfx: 'shield',
};

export const BATTLE_CRY: CardDef = {
  id: 'battle_cry', name: '기합', type: 'skill', cost: 0,
  description: '3 방어\n카드 1장 드로우',
  effects: [
    { type: 'block', value: 3 },
    { type: 'draw', value: 1 },
  ],
  vfx: 'buff',
};

// ===== 스킬 카드 =====

export const IGNITE: CardDef = {
  id: 'ignite', name: '격발', type: 'skill', cost: 0,
  description: '힘 +2\n(이번 턴만)',
  effects: [{ type: 'buff', buff: 'strength', value: 2, target: 'self', temporary: true }],
  vfx: 'buff',
};

export const TACTICS: CardDef = {
  id: 'tactics', name: '전술', type: 'skill', cost: 2,
  description: '8 방어\n카드 2장 드로우',
  effects: [
    { type: 'block', value: 8 },
    { type: 'draw', value: 2 },
  ],
  vfx: 'shield',
};

export const BLOOD_PRICE: CardDef = {
  id: 'blood_price', name: '피의 대가', type: 'skill', cost: 0,
  description: 'HP 3 잃고\n에너지 +2',
  effects: [
    { type: 'heal', value: -3 },
    { type: 'gainEnergy', value: 2 },
  ],
  vfx: 'magic',
};

export const RALLY: CardDef = {
  id: 'rally', name: '집결', type: 'skill', cost: 0,
  description: '카드 2장 드로우',
  effects: [{ type: 'draw', value: 2 }],
  vfx: 'buff',
};

export const INTIMIDATE: CardDef = {
  id: 'intimidate', name: '위압', type: 'skill', cost: 1,
  description: '적 전체에 약화 1',
  effects: [{ type: 'buff', buff: 'weak', value: 1, target: 'allEnemies' }],
  vfx: 'magic',
};

// ===== 파워 카드 =====

export const ENDURANCE: CardDef = {
  id: 'endurance', name: '인내', type: 'power', cost: 1,
  description: '매 턴 시작\n방어 3 획득',
  effects: [],
  vfx: 'buff',
};

export const BLOODLUST: CardDef = {
  id: 'bloodlust', name: '살기', type: 'power', cost: 1,
  description: '매 턴 시작\n힘 +1',
  effects: [],
  vfx: 'buff',
};

export const IRON_BARBS: CardDef = {
  id: 'iron_barbs', name: '철조망', type: 'power', cost: 1,
  description: '피격 시\n공격자에게 3 데미지',
  effects: [{ type: 'buff', buff: 'thorns', value: 3, target: 'self' }],
  vfx: 'buff',
};

// ===== 저주 카드 =====

export const WOUND: CardDef = {
  id: 'wound', name: '상처', type: 'curse', cost: 99,
  description: '사용 불가\n손패에 있으면\n턴 시작 시 HP -1',
  effects: [],
  vfx: 'none',
};

// ===== 카드 풀 =====

export const REWARD_CARD_POOL: CardDef[] = [
  GALE_STRIKE, CRUSH, FRENZY, DUAL_BLADE, FLURRY, BARRAGE, ONSLAUGHT, RECKLESS, VERDICT,
  FORTIFY, LAST_STAND, READY_STANCE, BATTLE_CRY,
  IGNITE, TACTICS, BLOOD_PRICE, RALLY, INTIMIDATE,
  ENDURANCE, BLOODLUST, IRON_BARBS,
];

export function createStarterDeck(): CardDef[] {
  return [
    ...Array(4).fill(SLASH),
    ...Array(3).fill(GUARD),
    ASSAULT,
  ];
}

let instanceCounter = 0;
export function makeInstance(def: CardDef): CardInstance {
  return { def, instanceId: `card-${instanceCounter++}`, upgraded: false };
}
