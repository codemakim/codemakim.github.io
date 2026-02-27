// ===== 버프 메타데이터 (도메인 레이어) =====
// UI 컴포넌트(BuffIcon.tsx)에서 import하여 사용

export interface BuffMeta {
  emoji: string;
  label: string;
  desc: string;
  negative: boolean;
}

export const BUFF_META: Record<string, BuffMeta> = {
  strength:   { emoji: '💪', label: '힘',   desc: '공격 데미지가 수치만큼 증가한다',        negative: false },
  dexterity:  { emoji: '🦶', label: '민첩', desc: '방어 블록이 수치만큼 증가한다',          negative: false },
  thorns:     { emoji: '🌵', label: '가시', desc: '피격 시 공격자에게 반격 피해를 준다',    negative: false },
  vulnerable: { emoji: '😵', label: '취약', desc: '받는 피해가 50% 증가한다',              negative: true  },
  weak:       { emoji: '💧', label: '약화', desc: '주는 공격 피해가 25% 감소한다',          negative: true  },
  poison:     { emoji: '🩸', label: '독',   desc: '매 턴 시작 시 수치만큼 피해를 받는다', negative: true  },
};
