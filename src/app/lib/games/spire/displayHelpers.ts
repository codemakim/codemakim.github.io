// ===== View용 계산 헬퍼 (도메인 레이어) =====
// UI 컴포넌트가 표시값을 계산할 때 사용한다.
// 도메인 로직(strength 계산 등)을 UI에서 분리하기 위한 헬퍼.

import type { EnemyInstance } from './types';
import { getBuffValue } from './combat';

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
