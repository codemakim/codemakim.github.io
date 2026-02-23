import type { BuffState } from '@/app/lib/games/spire/types';
import Tooltip from './Tooltip';

const BUFF_META: Record<string, { emoji: string; label: string; desc: string; negative: boolean }> = {
  strength:   { emoji: '💪', label: '힘',   desc: '공격 데미지가 수치만큼 증가한다',        negative: false },
  dexterity:  { emoji: '🦶', label: '민첩', desc: '방어 블록이 수치만큼 증가한다',          negative: false },
  thorns:     { emoji: '🌵', label: '가시', desc: '피격 시 공격자에게 반격 피해를 준다',    negative: false },
  vulnerable: { emoji: '😵', label: '취약', desc: '받는 피해가 50% 증가한다',              negative: true  },
  weak:       { emoji: '💧', label: '약화', desc: '주는 공격 피해가 25% 감소한다',          negative: true  },
  poison:     { emoji: '🩸', label: '독',   desc: '매 턴 시작 시 수치만큼 피해를 받는다', negative: true  },
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
        const meta = BUFF_META[buff.type] ?? { emoji: '❓', label: buff.type, desc: '', negative: false };
        return (
          <Tooltip
            key={`${buff.type}-${i}`}
            content={
              <span className="block text-left">
                <span className={`block text-xs font-bold ${meta.negative ? 'text-red-300' : 'text-blue-300'}`}>
                  {meta.emoji} {meta.label} {buff.value}
                  {buff.duration !== undefined && ` (${buff.duration}턴 남음)`}
                </span>
                {meta.desc && (
                  <span className="block text-xs text-zinc-300 mt-0.5">{meta.desc}</span>
                )}
              </span>
            }
          >
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${sz} font-bold cursor-pointer select-none
                ${meta.negative
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
            >
              <span>{meta.emoji}</span>
              <span>{buff.value}</span>
              {buff.duration !== undefined && (
                <span className="opacity-60">({buff.duration}턴)</span>
              )}
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
}
