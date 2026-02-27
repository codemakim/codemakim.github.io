// ===== 적 의도 메타데이터 (도메인 레이어) =====
// UI 컴포넌트(EnemyComponent.tsx)에서 import하여 사용

export interface IntentMeta {
  emoji: string;
  label: string;
  color: string;
}

export const INTENT_META: Record<string, IntentMeta> = {
  attack:  { emoji: '⚔️',  label: '공격', color: 'text-red-400'    },
  defend:  { emoji: '🛡️',  label: '방어', color: 'text-blue-400'   },
  buff:    { emoji: '💪',  label: '강화', color: 'text-yellow-400' },
  debuff:  { emoji: '😵',  label: '약화', color: 'text-purple-400' },
  special: { emoji: '💥',  label: '특수', color: 'text-orange-400' },
};
