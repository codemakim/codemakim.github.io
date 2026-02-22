import type { PlayerState, BattleEffect } from '@/app/lib/games/spire/types';
import PlayerSVG from './svg/PlayerSVG';
import BuffIcon from './BuffIcon';
import BattleEffects from './BattleEffects';

interface Props {
  player: PlayerState;
  spriteSize?: number;
  effects?: BattleEffect[];
}

export default function PlayerComponent({ player, spriteSize = 90, effects = [] }: Props) {
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 스프라이트 */}
      <div className={`relative ${effects.length > 0 ? 'animate-shake' : ''}`}>
        <PlayerSVG width={spriteSize} height={Math.round(spriteSize * 1.2)} />
        <BattleEffects effects={effects} />
        {/* 방어 배지 */}
        {player.block > 0 && (
          <div className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🛡️{player.block}
          </div>
        )}
      </div>

      {/* 이름 */}
      <div className="text-sm font-bold text-zinc-100">전사</div>

      {/* HP 바 */}
      <div className="w-full max-w-[120px]">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>❤️ {player.hp}</span>
          <span>{player.maxHp}</span>
        </div>
        <div className="h-2.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${hpColor}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      {/* 버프 */}
      <BuffIcon buffs={player.buffs} />
    </div>
  );
}
