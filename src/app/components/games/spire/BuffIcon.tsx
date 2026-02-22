import type { BuffState } from '@/app/lib/games/spire/types';

const BUFF_META: Record<string, { emoji: string; label: string; negative: boolean }> = {
  strength:  { emoji: '💪', label: '힘',   negative: false },
  dexterity: { emoji: '🦶', label: '민첩', negative: false },
  thorns:    { emoji: '🌵', label: '가시', negative: false },
  vulnerable:{ emoji: '😵', label: '취약', negative: true  },
  weak:      { emoji: '💧', label: '약화', negative: true  },
  poison:    { emoji: '🩸', label: '독',   negative: true  },
};

interface Props {
  buffs: BuffState[];
  size?: 'sm' | 'md';
}

export default function BuffIcon({ buffs, size = 'sm' }: Props) {
  if (buffs.length === 0) return null;

  const sz = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex flex-wrap gap-1">
      {buffs.map((buff, i) => {
        const meta = BUFF_META[buff.type] ?? { emoji: '❓', label: buff.type, negative: false };
        return (
          <span
            key={`${buff.type}-${i}`}
            title={`${meta.label} ${buff.value}${buff.duration !== undefined ? ` (${buff.duration}턴)` : ''}`}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${sz} font-bold
              ${meta.negative
                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              }`}
          >
            <span>{meta.emoji}</span>
            <span>{buff.value}</span>
          </span>
        );
      })}
    </div>
  );
}
