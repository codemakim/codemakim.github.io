import type { EnemyInstance, BattleEffect } from '@/app/lib/games/spire/types';
import BuffIcon from './BuffIcon';
import BattleEffects from './BattleEffects';

const INTENT_META: Record<string, { emoji: string; label: string; color: string }> = {
  attack:  { emoji: '⚔️', label: '공격',  color: 'text-red-400' },
  defend:  { emoji: '🛡️', label: '방어',  color: 'text-blue-400' },
  buff:    { emoji: '💪', label: '강화',  color: 'text-yellow-400' },
  debuff:  { emoji: '😵', label: '약화',  color: 'text-purple-400' },
  special: { emoji: '💥', label: '특수',  color: 'text-orange-400' },
};

interface Props {
  enemy: EnemyInstance;
  selected?: boolean;
  onClick?: () => void;
  spriteSize?: number;
  effects?: BattleEffect[];
}

export default function EnemyComponent({ enemy, selected, onClick, spriteSize = 100, effects = [] }: Props) {
  const Sprite = enemy.def.sprite;
  const intent = INTENT_META[enemy.def.tier === 'boss' && enemy.currentIntent.intent === 'special'
    ? 'special' : enemy.currentIntent.intent] ?? INTENT_META.attack;
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div
      className={`flex flex-col items-center gap-2 cursor-pointer select-none transition-transform ${selected ? 'scale-105' : 'hover:scale-102'}`}
      onClick={onClick}
    >
      {/* 의도 표시 */}
      <div className={`flex items-center gap-1 text-sm font-bold ${intent.color} bg-zinc-800/80 px-3 py-1 rounded-full`}>
        <span>{intent.emoji}</span>
        <span className="text-xs">{intent.label}</span>
        {enemy.currentIntent.intentValue !== undefined && (
          <span className="text-xs text-white">{enemy.currentIntent.intentValue}</span>
        )}
      </div>

      {/* 적 스프라이트 */}
      <div className={`relative ${selected ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]' : ''} ${effects.length > 0 ? 'animate-shake' : ''}`}>
        <Sprite width={spriteSize} height={Math.round(spriteSize * 1.2)} />
        <BattleEffects effects={effects} />
        {/* 방어 표시 */}
        {enemy.block > 0 && (
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🛡️{enemy.block}
          </div>
        )}
      </div>

      {/* 이름 */}
      <div className="text-sm font-bold text-zinc-100">{enemy.def.name}</div>

      {/* HP 바 */}
      <div className="w-full max-w-[140px]">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{enemy.hp}</span>
          <span>{enemy.maxHp}</span>
        </div>
        <div className="h-2.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${hpColor}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      {/* 버프 */}
      <BuffIcon buffs={enemy.buffs} />
    </div>
  );
}
