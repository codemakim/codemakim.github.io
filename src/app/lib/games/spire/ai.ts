import type { EnemyDef, EnemyInstance, EnemyPattern } from './types';

export function selectNextPattern(enemy: EnemyInstance): EnemyPattern {
  const { def, patternIndex, turnCount } = enemy;

  if (def.sequential) {
    const nextIndex = (patternIndex + 1) % def.patterns.length;
    const pattern = def.patterns[nextIndex];
    if (pattern.condition && !pattern.condition(turnCount + 1)) {
      // 조건 미충족 시 기본 패턴 (첫 번째)
      return def.patterns[0];
    }
    return pattern;
  }

  // 가중치 랜덤 선택
  return weightedRandom(def.patterns, turnCount);
}

export function selectNextPatternIndex(enemy: EnemyInstance): number {
  const { def, patternIndex } = enemy;
  if (def.sequential) {
    return (patternIndex + 1) % def.patterns.length;
  }
  // 랜덤 시 인덱스는 추적 필요 없으므로 0 반환
  return 0;
}

function weightedRandom(patterns: EnemyPattern[], turnCount: number): EnemyPattern {
  const eligible = patterns.filter(p => !p.condition || p.condition(turnCount));
  if (eligible.length === 0) return patterns[0];

  const totalWeight = eligible.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const pattern of eligible) {
    rand -= pattern.weight;
    if (rand <= 0) return pattern;
  }
  return eligible[eligible.length - 1];
}

export function getInitialPattern(def: EnemyDef): EnemyPattern {
  if (def.sequential) return def.patterns[0];
  return weightedRandom(def.patterns, 0);
}
