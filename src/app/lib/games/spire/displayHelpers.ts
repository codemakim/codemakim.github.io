// ===== View용 계산 헬퍼 (도메인 레이어) =====
// UI 컴포넌트가 표시값을 계산할 때 사용한다.
// 도메인 로직(strength 계산 등)을 UI에서 분리하기 위한 헬퍼.

import type { EnemyInstance, CardDef } from './types';
import { getBuffValue, calcDamage } from './combat';

/**
 * 적 의도 데미지 표시값 계산
 * EnemyComponent에서 인라인으로 계산하던 strength 반영 로직을 분리.
 */
export function getIntentDisplay(enemy: EnemyInstance): { singleHit: number; times: number } | null {
  const { intentValue, action } = enemy.currentIntent;
  if (intentValue === undefined) return null;
  const strength = getBuffValue(enemy.buffs, 'strength');
  const times = action.type === 'attack' ? (action.times ?? 1) : 1;
  return { singleHit: intentValue + strength, times };
}

/**
 * 파워 카드 ID → 표시 라벨 매핑
 * HandArea.tsx의 하드코딩된 삼항 연산자를 대체.
 */
export const POWER_LABELS: Record<string, string> = {
  iron_will:   '강철 의지',
  berserker:   '광전사',
  thorns_card: '가시 갑옷',
};

export function getPowerLabel(id: string): string {
  return POWER_LABELS[id] ?? id;
}

// ===== 카드 데미지 미리보기 =====

export interface CardPreviewStats {
  strength: number;
  isWeak: boolean;
  damageBonus: number; // pendingDamageBonus (counter_stance 등)
}

/**
 * 플레이어 현재 상태를 반영한 카드 설명 생성.
 * - 공격 카드: 힘·약화·공격강화를 적용한 실제 데미지 표시
 * - 적 취약은 전투 중 알 수 없으므로 미반영
 * - 특수 카드(execute, counter_stance 등)는 원본 description 유지
 */
export function getCardPreviewDesc(card: CardDef, stats: CardPreviewStats): string {
  // effects 없거나 특수 케이스 → 원본 유지
  if (card.effects.length === 0) return card.description;
  const KEEP_ORIGINAL = ['verdict', 'ready_stance', 'wound'];
  if (KEEP_ORIGINAL.includes(card.id)) return card.description;

  const BUFF_NAMES: Record<string, string> = {
    strength: '힘', dexterity: '민첩',
    vulnerable: '취약', weak: '약화',
    poison: '독', thorns: '가시',
  };

  const parts: string[] = [];

  for (const effect of card.effects) {
    switch (effect.type) {
      case 'damage': {
        const base = effect.value + (card.type === 'attack' ? stats.damageBonus : 0);
        const dmg = calcDamage(base, stats.strength, stats.isWeak, false);
        if (card.id === 'onslaught') {
          parts.push(`에너지 1당\n전체에 ${dmg} 데미지`);
        } else if (effect.hits && effect.hits > 1) {
          const prefix = effect.target === 'all' ? '적 전체에 ' : '';
          parts.push(`${prefix}${dmg} 데미지 × ${effect.hits}회`);
        } else if (effect.target === 'all') {
          parts.push(`적 전체에 ${dmg} 데미지`);
        } else {
          parts.push(`${dmg} 데미지`);
        }
        break;
      }
      case 'block':
        parts.push(`${effect.value} 방어`);
        break;
      case 'draw':
        parts.push(`카드 ${effect.value}장 드로우`);
        break;
      case 'buff': {
        const name = BUFF_NAMES[effect.buff] ?? effect.buff;
        if (effect.target === 'self') {
          const isDebuff = effect.buff === 'vulnerable' || effect.buff === 'weak';
          if (isDebuff) parts.push(`자신에게 ${name} ${effect.value}`);
          else parts.push(`${name} +${effect.value}${effect.temporary ? '\n(이번 턴만)' : ''}`);
        } else if (effect.target === 'enemy') {
          parts.push(`${name} ${effect.value}`);
        } else if (effect.target === 'allEnemies') {
          parts.push(`적 전체에 ${name} ${effect.value}`);
        }
        break;
      }
      case 'heal':
        if (effect.value >= 0) parts.push(`HP ${effect.value} 회복`);
        else parts.push(`HP ${Math.abs(effect.value)} 잃음`);
        break;
      case 'gainEnergy':
        parts.push(`에너지 +${effect.value}`);
        break;
      case 'addCopyToDiscard':
        parts.push('버린 더미에 복사본 추가');
        break;
    }
  }

  return parts.join('\n') || card.description;
}
