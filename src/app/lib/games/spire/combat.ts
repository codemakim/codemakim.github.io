import type { BuffState, BuffType, CardInstance, BattleState } from './types';

// ===== 버프 유틸 =====

export function getBuffValue(buffs: BuffState[], type: BuffType): number {
  return buffs.find(b => b.type === type)?.value ?? 0;
}

export function addBuff(buffs: BuffState[], type: BuffType, value: number, duration?: number): BuffState[] {
  const existing = buffs.findIndex(b => b.type === type);
  if (existing >= 0) {
    return buffs.map((b, i) => i === existing ? { ...b, value: b.value + value } : b);
  }
  return [...buffs, { type, value, duration }];
}

const TURN_BASED_BUFFS: BuffType[] = ['vulnerable', 'weak'];

export function tickBuffs(buffs: BuffState[]): BuffState[] {
  return buffs
    .map(b => {
      if (b.duration !== undefined) return { ...b, duration: b.duration - 1 };
      if (TURN_BASED_BUFFS.includes(b.type)) return { ...b, value: b.value - 1 };
      return b;
    })
    .filter(b => {
      if (b.duration !== undefined) return b.duration > 0;
      if (TURN_BASED_BUFFS.includes(b.type)) return b.value > 0;
      return true;
    });
}

// ===== 데미지 계산 =====

export function calcDamage(
  base: number,
  strength: number,
  isWeak: boolean,
  isVulnerable: boolean,
): number {
  let dmg = base + strength;
  if (isWeak) dmg = Math.floor(dmg * 0.75);
  if (isVulnerable) dmg = Math.floor(dmg * 1.5);
  return Math.max(0, dmg);
}

// ===== 카드 드로우 =====

export function drawCards(battle: BattleState, count: number): BattleState {
  let hand = [...battle.hand];
  let drawPile = [...battle.drawPile];
  let discardPile = [...battle.discardPile];

  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break;
      drawPile = [...discardPile].sort(() => Math.random() - 0.5);
      discardPile = [];
    }
    hand = [...hand, drawPile[0]];
    drawPile = drawPile.slice(1);
  }

  return { ...battle, hand, drawPile, discardPile };
}

// ===== 고유 ID =====
let idCounter = 0;
export function newInstanceId(): string {
  return `inst-${Date.now()}-${idCounter++}`;
}

export function copyCard(card: CardInstance): CardInstance {
  return { ...card, instanceId: newInstanceId() };
}
