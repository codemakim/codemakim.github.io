'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { BattleEffect } from '@/app/lib/games/spire/types';

const META: Record<string, { color: string; shadow: string; prefix: string }> = {
  damage: { color: '#ff3333', shadow: '0 0 8px rgba(255,50,50,0.9), 0 2px 0 #000', prefix: '-' },
  block:  { color: '#60a5fa', shadow: '0 0 8px rgba(96,165,250,0.8), 0 2px 0 #000', prefix: '' },
  heal:   { color: '#4ade80', shadow: '0 0 8px rgba(74,222,128,0.8), 0 2px 0 #000', prefix: '+' },
  miss:   { color: '#a1a1aa', shadow: '0 2px 4px rgba(0,0,0,0.8)', prefix: '' },
};

// 애니메이션 파라미터
// - 연타: 각 타격마다 독립 팝업 생성 (addEffect에서 replace 제거)
// - y: easeOut으로 위로 떠오름 → 끝 무렵엔 거의 멈춘 것처럼 보임
// - opacity: 빠르게 등장 → 절반 이상 hold → 서서히 페이드아웃
// - x: 마운트 시 랜덤 오프셋 → 연타 숫자들이 수평으로 분산되어 겹침 방지
const ANIM_DURATION = 1.3; // seconds
const OPACITY_TIMES = [0, 0.07, 0.5, 1]; // 등장 / 유지 시작 / 유지 끝 / 소멸

interface PopupProps {
  effect: BattleEffect;
}

function Popup({ effect }: PopupProps) {
  const isBlocked = effect.type === 'damage' && effect.value === 0;
  const meta = isBlocked
    ? { color: '#60a5fa', shadow: '0 0 8px rgba(96,165,250,0.7), 0 2px 0 #000', prefix: '' }
    : (META[effect.type] ?? META.damage);
  const label = isBlocked ? '🛡️'
    : effect.type === 'miss' ? 'MISS'
    : effect.type === 'block' ? `🛡️${effect.value}`
    : `${meta.prefix}${effect.value}`;

  const isLarge = effect.value >= 15 && effect.type === 'damage';

  // 연타 수평 분산: 마운트 시 한 번만 계산 (-14 ~ +14px)
  const [xOffset] = useState(() => Math.round(Math.random() * 28) - 14);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0, scale: 1.8 }}
      animate={{
        y: -85,
        x: xOffset,
        scale: isLarge ? 1.3 : 1.0,
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        y: { duration: ANIM_DURATION, ease: 'easeOut' },
        x: { duration: ANIM_DURATION, ease: 'easeOut' },
        scale: { type: 'spring', damping: 10, stiffness: 300 },
        opacity: { duration: ANIM_DURATION, times: OPACITY_TIMES },
      }}
      className="absolute pointer-events-none z-50"
      style={{
        left: '50%',
        top: '10%',
        transform: 'translateX(-50%)',
        color: meta.color,
        textShadow: meta.shadow,
        WebkitTextStroke: '0.5px rgba(0,0,0,0.6)',
        fontWeight: 900,
        fontSize: isLarge ? '2.2rem' : '1.7rem',
        fontFamily: 'sans-serif',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </motion.div>
  );
}

interface Props {
  effects: BattleEffect[];
}

// AnimatePresence 불필요: opacity 페이드가 animate 키프레임에 내장됨
// (TTL 만료 시 이미 opacity=0 상태이므로 exit 없이 조용히 제거)
export default function DamagePopup({ effects }: Props) {
  return (
    <>
      {effects.map((effect) => (
        <Popup key={effect.id} effect={effect} />
      ))}
    </>
  );
}
