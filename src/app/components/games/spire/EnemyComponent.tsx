'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { EnemyInstance, BattleEffect } from '@/app/lib/games/spire/types';
import type { VfxInstance } from './effects/EffectLayer';
import BuffIcon from './BuffIcon';
import { VfxRenderer, PopupRenderer } from './effects/EffectLayer';

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
  vfxList?: VfxInstance[];
  enemyIdx?: number;
}

export default function EnemyComponent({ enemy, selected, onClick, spriteSize = 100, effects = [], vfxList = [], enemyIdx = 0 }: Props) {
  const Sprite = enemy.def.sprite;
  const intent = INTENT_META[enemy.def.tier === 'boss' && enemy.currentIntent.intent === 'special'
    ? 'special' : enemy.currentIntent.intent] ?? INTENT_META.attack;
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  const [shaking, setShaking] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const prevHp = useRef(enemy.hp);

  useEffect(() => {
    if (enemy.hp < prevHp.current) {
      const dmg = prevHp.current - enemy.hp;
      setShaking(true);
      setHitFlash(true);
      const shakeDur = dmg >= 15 ? 560 : 420;
      setTimeout(() => setShaking(false), shakeDur);
      setTimeout(() => setHitFlash(false), 200);
    }
    prevHp.current = enemy.hp;
  }, [enemy.hp]);

  const damageEffects = effects.filter(e => e.type === 'damage');
  const isHeavyHit = damageEffects.some(e => e.value >= 15);

  // filter 계산: 피격 flash > 타겟 선택 glow > 없음
  // 'none' 대신 명시적 투명값 사용 → Motion이 이전 filter와 보간 가능
  const filterStyle = hitFlash
    ? 'drop-shadow(0 0 10px rgba(255,50,50,1)) brightness(1.5)'
    : selected
      ? 'drop-shadow(0 0 14px rgba(239,68,68,0.9)) brightness(1.05)'
      : 'drop-shadow(0 0 0px rgba(0,0,0,0)) brightness(1)';

  return (
    <div
      className={`flex flex-col items-center gap-2 cursor-pointer select-none ${selected ? 'scale-105' : 'hover:scale-102'} transition-transform`}
      onClick={onClick}
    >
      {/* 의도 표시 */}
      <div className={`flex items-center gap-1 text-sm font-bold ${intent.color} bg-zinc-800/80 px-3 py-1 rounded-full`}>
        <span>{intent.emoji}</span>
        <span className="text-xs">{intent.label}</span>
        {enemy.currentIntent.intentValue !== undefined && (() => {
          const action = enemy.currentIntent.action;
          const times = action.type === 'attack' ? (action.times ?? 1) : 1;
          const strength = enemy.buffs.find(b => b.type === 'strength')?.value ?? 0;
          const singleHit = enemy.currentIntent.intentValue + strength;
          return (
            <span className="text-xs text-white">
              {times > 1
                ? <>{singleHit}<span className="text-zinc-400 text-[10px]">×{times}</span></>
                : singleHit
              }
            </span>
          );
        })()}
      </div>

      {/* 적 스프라이트 */}
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
        <Sprite width={spriteSize} height={Math.round(spriteSize * 1.2)} />

        {/* VFX 이펙트 */}
        <VfxRenderer vfxList={vfxList} target={enemyIdx} size={spriteSize + 24} />

        {/* 데미지 팝업 */}
        <PopupRenderer effects={effects} target={enemyIdx} />

        {/* 방어 표시 */}
        {enemy.block > 0 && (
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🛡️{enemy.block}
          </div>
        )}
      </motion.div>

      {/* 이름 */}
      <div className="text-sm font-bold text-zinc-100">{enemy.def.name}</div>

      {/* 버프 — HP바 위에 배치해서 HP바가 항상 맨 아래에 오도록. min-h로 공간 예약해 레이아웃 시프트 방지 */}
      <div className="min-h-[20px] flex items-center">
        <BuffIcon buffs={enemy.buffs} />
      </div>

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
    </div>
  );
}
