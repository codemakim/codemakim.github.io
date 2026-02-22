import type { EnemyDef } from './types';
import SlimeSVG from '@/app/components/games/spire/svg/SlimeSVG';
import GoblinSVG from '@/app/components/games/spire/svg/GoblinSVG';
import SkeletonSVG from '@/app/components/games/spire/svg/SkeletonSVG';
import MushroomSVG from '@/app/components/games/spire/svg/MushroomSVG';
import BatsSVG from '@/app/components/games/spire/svg/BatsSVG';
import DarkMageSVG from '@/app/components/games/spire/svg/DarkMageSVG';
import AncientKnightSVG from '@/app/components/games/spire/svg/AncientKnightSVG';
import FireSpiritSVG from '@/app/components/games/spire/svg/FireSpiritSVG';
import ShadowThiefSVG from '@/app/components/games/spire/svg/ShadowThiefSVG';
import GolemSVG from '@/app/components/games/spire/svg/GolemSVG';
import LichSVG from '@/app/components/games/spire/svg/LichSVG';
import DragonSVG from '@/app/components/games/spire/svg/DragonSVG';

// ===== 일반 적 =====

export const SLIME: EnemyDef = {
  id: 'slime',
  name: '슬라임',
  emoji: '🟢',
  hp: [12, 16],
  sprite: SlimeSVG,
  act: [1],
  tier: 'normal',
  sequential: true,
  patterns: [
    { weight: 1, intent: 'attack', intentValue: 6, action: { type: 'attack', damage: 6 } },
    { weight: 1, intent: 'attack', intentValue: 3, action: { type: 'attack', damage: 3, times: 2 } },
  ],
};

export const GOBLIN: EnemyDef = {
  id: 'goblin',
  name: '고블린',
  emoji: '👺',
  hp: [14, 18],
  sprite: GoblinSVG,
  act: [1],
  tier: 'normal',
  sequential: false,
  patterns: [
    { weight: 7, intent: 'attack', intentValue: 7, action: { type: 'attack', damage: 7 } },
    { weight: 3, intent: 'debuff', action: { type: 'debuff', buff: 'weak', value: 1, target: 'player' } },
  ],
};

export const SKELETON: EnemyDef = {
  id: 'skeleton',
  name: '해골 전사',
  emoji: '💀',
  hp: [18, 22],
  sprite: SkeletonSVG,
  act: [1, 2],
  tier: 'normal',
  sequential: false,
  patterns: [
    { weight: 6, intent: 'attack', intentValue: 9, action: { type: 'attack', damage: 9 } },
    { weight: 4, intent: 'defend', action: { type: 'block', value: 6 } },
  ],
};

export const MUSHROOM: EnemyDef = {
  id: 'mushroom',
  name: '독버섯',
  emoji: '🍄',
  hp: [20, 25],
  sprite: MushroomSVG,
  act: [2],
  tier: 'normal',
  sequential: false,
  patterns: [
    { weight: 6, intent: 'debuff', action: { type: 'debuff', buff: 'poison', value: 3, target: 'player' } },
    { weight: 4, intent: 'attack', intentValue: 5, action: { type: 'attack', damage: 5 } },
  ],
};

export const BATS: EnemyDef = {
  id: 'bats',
  name: '박쥐 떼',
  emoji: '🦇',
  hp: [10, 14],
  sprite: BatsSVG,
  act: [2],
  tier: 'normal',
  sequential: false,
  patterns: [
    { weight: 7, intent: 'attack', intentValue: 4, action: { type: 'attack', damage: 4, times: 3 } },
    { weight: 3, intent: 'buff', action: { type: 'heal', value: 4 } },
  ],
};

export const DARK_MAGE: EnemyDef = {
  id: 'dark_mage',
  name: '어둠 마법사',
  emoji: '🧙',
  hp: [25, 30],
  sprite: DarkMageSVG,
  act: [3],
  tier: 'normal',
  sequential: false,
  patterns: [
    { weight: 4, intent: 'attack', intentValue: 12, action: { type: 'attack', damage: 12 } },
    { weight: 3, intent: 'debuff', action: { type: 'debuff', buff: 'vulnerable', value: 2, target: 'player' } },
    { weight: 3, intent: 'buff', action: { type: 'buff', buff: 'strength', value: 1, target: 'self' } },
  ],
};

// ===== 엘리트 =====

export const ANCIENT_KNIGHT: EnemyDef = {
  id: 'ancient_knight',
  name: '고대 기사',
  emoji: '⚔️',
  hp: [55, 65],
  sprite: AncientKnightSVG,
  act: [1, 2],
  tier: 'elite',
  sequential: true,
  patterns: [
    { weight: 1, intent: 'attack', intentValue: 15, action: { type: 'attack', damage: 15 } },
    {
      weight: 1, intent: 'buff', action: {
        type: 'multi', actions: [
          { type: 'block', value: 12 },
          { type: 'buff', buff: 'strength', value: 1, target: 'self' },
        ]
      }
    },
    { weight: 1, intent: 'attack', intentValue: 8, action: { type: 'attack', damage: 8, times: 2 } },
  ],
};

export const FIRE_SPIRIT: EnemyDef = {
  id: 'fire_spirit',
  name: '화염 정령',
  emoji: '🔥',
  hp: [45, 55],
  sprite: FireSpiritSVG,
  act: [2, 3],
  tier: 'elite',
  sequential: true,
  patterns: [
    {
      weight: 1, intent: 'attack', intentValue: 10, action: {
        type: 'multi', actions: [
          { type: 'attack', damage: 10 },
          { type: 'debuff', buff: 'poison', value: 2, target: 'player' },
        ]
      }
    },
    { weight: 1, intent: 'attack', intentValue: 7, action: { type: 'attack', damage: 7 } },
    { weight: 1, intent: 'buff', action: { type: 'buff', buff: 'strength', value: 2, target: 'self' } },
  ],
};

export const SHADOW_THIEF: EnemyDef = {
  id: 'shadow_thief',
  name: '그림자 도적',
  emoji: '🗡️',
  hp: [40, 50],
  sprite: ShadowThiefSVG,
  act: [1, 2, 3],
  tier: 'elite',
  sequential: true,
  patterns: [
    { weight: 1, intent: 'attack', intentValue: 5, action: { type: 'attack', damage: 5, times: 3 } },
    {
      weight: 1, intent: 'debuff', action: {
        type: 'multi', actions: [
          { type: 'debuff', buff: 'weak', value: 2, target: 'player' },
          { type: 'debuff', buff: 'vulnerable', value: 1, target: 'player' },
        ]
      }
    },
    { weight: 1, intent: 'attack', intentValue: 20, action: { type: 'attack', damage: 20 } },
  ],
};

// ===== 보스 =====

export const GOLEM: EnemyDef = {
  id: 'golem',
  name: '골렘',
  emoji: '🗿',
  hp: [100, 100],
  sprite: GolemSVG,
  act: [1],
  tier: 'boss',
  sequential: true,
  patterns: [
    { weight: 1, intent: 'attack', intentValue: 12, action: { type: 'attack', damage: 12 } },
    { weight: 1, intent: 'defend', action: { type: 'block', value: 15 } },
    { weight: 1, intent: 'special', intentValue: 20, action: { type: 'attack', damage: 20 } },
  ],
};

export const LICH: EnemyDef = {
  id: 'lich',
  name: '리치',
  emoji: '👻',
  hp: [120, 120],
  sprite: LichSVG,
  act: [2],
  tier: 'boss',
  sequential: true,
  patterns: [
    {
      weight: 1, intent: 'attack', intentValue: 10, action: {
        type: 'multi', actions: [
          { type: 'attack', damage: 10 },
          { type: 'debuff', buff: 'poison', value: 3, target: 'player' },
        ]
      }
    },
    { weight: 1, intent: 'buff', action: { type: 'buff', buff: 'strength', value: 2, target: 'self' } },
    {
      weight: 1, intent: 'debuff', action: {
        type: 'multi', actions: [
          { type: 'attack', damage: 8 },
          { type: 'debuff', buff: 'weak', value: 2, target: 'player' },
        ]
      }
    },
  ],
};

export const DRAGON: EnemyDef = {
  id: 'dragon',
  name: '드래곤',
  emoji: '🐉',
  hp: [150, 150],
  sprite: DragonSVG,
  act: [3],
  tier: 'boss',
  sequential: true,
  patterns: [
    { weight: 1, intent: 'attack', intentValue: 15, action: { type: 'attack', damage: 15, times: 2 } },
    { weight: 1, intent: 'defend', action: { type: 'multi', actions: [{ type: 'block', value: 20 }, { type: 'heal', value: 10 }] } },
    { weight: 1, intent: 'special', intentValue: 25, action: { type: 'attack', damage: 25 } },
  ],
};

export const ALL_ENEMIES: EnemyDef[] = [
  SLIME, GOBLIN, SKELETON, MUSHROOM, BATS, DARK_MAGE,
  ANCIENT_KNIGHT, FIRE_SPIRIT, SHADOW_THIEF,
  GOLEM, LICH, DRAGON,
];

export const NORMAL_ENEMIES: EnemyDef[] = [SLIME, GOBLIN, SKELETON, MUSHROOM, BATS, DARK_MAGE];
export const ELITE_ENEMIES: EnemyDef[] = [ANCIENT_KNIGHT, FIRE_SPIRIT, SHADOW_THIEF];
export const BOSS_ENEMIES: EnemyDef[] = [GOLEM, LICH, DRAGON];
