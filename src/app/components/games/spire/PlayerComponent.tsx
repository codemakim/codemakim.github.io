'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { PlayerState, BattleEffect } from '@/app/lib/games/spire/types';
import type { VfxInstance } from './effects/EffectLayer';
import PlayerSVG from './svg/PlayerSVG';
import BuffIcon from './BuffIcon';
import { VfxRenderer, PopupRenderer } from './effects/EffectLayer';

interface Props {
  player: PlayerState;
  spriteSize?: number;
  effects?: BattleEffect[];
  vfxList?: VfxInstance[];
}

export default function PlayerComponent({ player, spriteSize = 90, effects = [], vfxList = [] }: Props) {
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  const [shaking, setShaking] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const prevHp = useRef(player.hp);

  useEffect(() => {
    if (player.hp < prevHp.current) {
      const dmg = prevHp.current - player.hp;
      setShaking(true);
      setHitFlash(true);
      const shakeDur = dmg >= 15 ? 560 : 420;
      setTimeout(() => setShaking(false), shakeDur);
      setTimeout(() => setHitFlash(false), 200);
    }
    prevHp.current = player.hp;
  }, [player.hp]);

  const damageEffects = effects.filter(e => e.type === 'damage');
  const isHeavyHit = damageEffects.some(e => e.value >= 15);

  // 'none' 대신 명시적 투명값 사용 → Motion이 이전 filter와 보간 가능
  const filterStyle = hitFlash
    ? 'drop-shadow(0 0 10px rgba(255,50,50,1)) brightness(1.5)'
    : 'drop-shadow(0 0 0px rgba(0,0,0,0)) brightness(1)';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 스프라이트 */}
      <motion.div
        className="relative"
        animate={{
          x: shaking
            ? (isHeavyHit ? [-12, 10, -10, 8, -6, 4, 0] : [-8, 6, -6, 4, -3, 2, 0])
            : 0,
          filter: filterStyle,
        }}
        transition={{
          x: { duration: isHeavyHit ? 0.56 : 0.42, ease: 'easeOut' },
          filter: { duration: 0.12 },
        }}
      >
        <PlayerSVG width={spriteSize} height={Math.round(spriteSize * 1.5)} />

        {/* VFX 이펙트 */}
        <VfxRenderer vfxList={vfxList} target="player" size={spriteSize + 24} />

        {/* 데미지 팝업 */}
        <PopupRenderer effects={effects} target="player" />

        {/* 방어 배지 */}
        {player.block > 0 && (
          <div className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🛡️{player.block}
          </div>
        )}
      </motion.div>

      {/* 이름 */}
      <div className="text-sm font-bold text-zinc-100">전사</div>

      {/* 버프 — HP바 위에 배치해서 HP바가 항상 맨 아래에 오도록 */}
      <BuffIcon buffs={player.buffs} />

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
    </div>
  );
}
