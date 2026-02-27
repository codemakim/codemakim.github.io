// ===== 적 스프라이트 매핑 (UI 레이어) =====
// enemies.ts (domain)에서 SVG import를 제거하고, 이 파일로 이동.
// EnemyComponent.tsx에서 enemy.def.sprite 대신 getEnemySprite(enemy.def.id)를 사용.

import type { ComponentType } from 'react';
import SlimeSVG from './svg/SlimeSVG';
import GoblinSVG from './svg/GoblinSVG';
import SkeletonSVG from './svg/SkeletonSVG';
import MushroomSVG from './svg/MushroomSVG';
import BatsSVG from './svg/BatsSVG';
import DarkMageSVG from './svg/DarkMageSVG';
import AncientKnightSVG from './svg/AncientKnightSVG';
import FireSpiritSVG from './svg/FireSpiritSVG';
import ShadowThiefSVG from './svg/ShadowThiefSVG';
import GolemSVG from './svg/GolemSVG';
import LichSVG from './svg/LichSVG';
import DragonSVG from './svg/DragonSVG';

export type SpriteComponent = ComponentType<{ width?: number; height?: number; className?: string }>;

export const ENEMY_SPRITE_MAP: Record<string, SpriteComponent> = {
  slime:          SlimeSVG,
  goblin:         GoblinSVG,
  skeleton:       SkeletonSVG,
  mushroom:       MushroomSVG,
  bats:           BatsSVG,
  dark_mage:      DarkMageSVG,
  ancient_knight: AncientKnightSVG,
  fire_spirit:    FireSpiritSVG,
  shadow_thief:   ShadowThiefSVG,
  golem:          GolemSVG,
  lich:           LichSVG,
  dragon:         DragonSVG,
};

/** enemy.def.id로 SVG 컴포넌트를 조회. 없으면 null 반환 컴포넌트. */
export function getEnemySprite(enemyId: string): SpriteComponent {
  return ENEMY_SPRITE_MAP[enemyId] ?? (() => null);
}
