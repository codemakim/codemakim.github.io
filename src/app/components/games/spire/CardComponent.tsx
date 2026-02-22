import type { CardDef } from '@/app/lib/games/spire/types';

const TYPE_STYLE: Record<string, { border: string; bg: string; icon: string; label: string }> = {
  attack: { border: 'border-red-500',   bg: 'from-red-950/80 to-red-900/60',   icon: '⚔️', label: '공격' },
  skill:  { border: 'border-blue-500',  bg: 'from-blue-950/80 to-blue-900/60', icon: '🛡️', label: '방어' },
  power:  { border: 'border-purple-500',bg: 'from-purple-950/80 to-purple-900/60', icon: '🔮', label: '파워' },
  curse:  { border: 'border-zinc-600',  bg: 'from-zinc-900/80 to-zinc-800/60', icon: '💀', label: '저주' },
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

  const sizeClass = {
    sm: 'w-[60px] h-[84px] text-[9px]',
    md: 'w-[80px] h-[112px] text-[10px]',
    lg: 'w-[120px] h-[168px] text-xs',
  }[size];

  const costSize = size === 'lg' ? 'w-7 h-7 text-sm' : size === 'md' ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-[9px]';
  const nameSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-[10px]' : 'text-[8px]';
  const iconSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-base';

  const costDisplay = card.cost === -1 ? 'X' : card.cost === 99 ? '–' : String(card.cost);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col rounded-lg border-2 bg-gradient-to-b cursor-pointer
        transition-all duration-150 select-none
        ${sizeClass}
        ${meta.border}
        ${meta.bg}
        ${selected ? 'scale-110 -translate-y-4 shadow-lg shadow-blue-500/40 z-20' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-2 hover:scale-105 hover:z-10'}
      `}
      style={{ fontFamily: 'sans-serif' }}
    >
      {/* 에너지 비용 */}
      <div className={`absolute top-1 left-1 ${costSize} rounded-full bg-yellow-400 dark:bg-yellow-500 text-zinc-900 font-black flex items-center justify-center leading-none z-10`}>
        {costDisplay}
      </div>

      {/* 타입 아이콘 */}
      <div className={`absolute top-1 right-1 ${iconSize}`}>{meta.icon}</div>

      {/* 카드 일러스트 영역 */}
      <div className="flex-1 flex items-center justify-center pt-4 px-1">
        <span className={size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'}>
          {meta.icon}
        </span>
      </div>

      {/* 카드 정보 */}
      <div className={`bg-zinc-900/70 rounded-b-md px-1 py-1 text-center`}>
        <div className={`${nameSize} font-bold text-white leading-tight truncate`}>{card.name}</div>
        <div className="text-[8px] text-zinc-300 leading-tight mt-0.5 whitespace-pre-line line-clamp-2">
          {card.description}
        </div>
      </div>
    </button>
  );
}
