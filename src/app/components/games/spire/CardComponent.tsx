'use client';

import { motion } from 'motion/react';
import type { CardDef } from '@/app/lib/games/spire/types';

const TYPE_STYLE: Record<string, { border: string; bg: string; icon: string; label: string }> = {
  attack: { border: 'border-red-500',    bg: 'from-red-950/80 to-red-900/60',       icon: '⚔️', label: '공격' },
  skill:  { border: 'border-blue-500',   bg: 'from-blue-950/80 to-blue-900/60',     icon: '🛡️', label: '방어' },
  power:  { border: 'border-purple-500', bg: 'from-purple-950/80 to-purple-900/60', icon: '🔮', label: '파워' },
  curse:  { border: 'border-zinc-600',   bg: 'from-zinc-900/80 to-zinc-800/60',     icon: '💀', label: '저주' },
};

interface Props {
  card: CardDef;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardComponent({ card, disabled, selected, onClick, size = 'md' }: Props) {
  const meta = TYPE_STYLE[card.type] ?? TYPE_STYLE.skill;

  const dims = {
    sm: { w: 60,  h: 84,  base: 'text-[9px]' },
    md: { w: 80,  h: 112, base: 'text-[10px]' },
    lg: { w: 120, h: 168, base: 'text-xs' },
  }[size];

  const costSize  = size === 'lg' ? 'w-7 h-7 text-sm'   : size === 'md' ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-[9px]';
  const nameSize  = size === 'lg' ? 'text-sm'            : size === 'md' ? 'text-[10px]'      : 'text-[8px]';
  const iconSize  = size === 'lg' ? 'text-2xl'           : size === 'md' ? 'text-lg'          : 'text-base';
  const illSize   = size === 'lg' ? 'text-4xl'           : size === 'md' ? 'text-2xl'         : 'text-xl';
  const costDisplay = card.cost === -1 ? 'X' : card.cost === 99 ? '–' : String(card.cost);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      style={{ width: dims.w, height: dims.h, fontFamily: 'sans-serif' }}
      className={`
        relative flex flex-col rounded-lg border-2 bg-gradient-to-b cursor-pointer
        select-none ${dims.base} ${meta.border} ${meta.bg}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
      animate={selected
        ? { y: -16, scale: 1.08 }
        : { y: 0,  scale: 1.0 }
      }
      whileHover={!disabled && !selected ? { y: -8, scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', damping: 18, stiffness: 350 }}
    >
      {/* 선택 시 glow */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ boxShadow: '0 0 16px 4px rgba(96,165,250,0.6)', zIndex: 20 }}
        />
      )}

      {/* 에너지 비용 */}
      <div className={`absolute top-1 left-1 ${costSize} rounded-full bg-yellow-400 dark:bg-yellow-500 text-zinc-900 font-black flex items-center justify-center leading-none z-10`}>
        {costDisplay}
      </div>

      {/* 타입 아이콘 */}
      <div className={`absolute top-1 right-1 ${iconSize}`}>{meta.icon}</div>

      {/* 카드 일러스트 영역 */}
      <div className="flex-1 flex items-center justify-center pt-4 px-1">
        <span className={illSize}>{meta.icon}</span>
      </div>

      {/* 카드 정보 */}
      <div className="bg-zinc-900/70 rounded-b-md px-1 py-1 text-center">
        <div className={`${nameSize} font-bold text-white leading-tight truncate`}>{card.name}</div>
        <div className="text-[8px] text-zinc-300 leading-tight mt-0.5 whitespace-pre-line line-clamp-2">
          {card.description}
        </div>
      </div>
    </motion.button>
  );
}
