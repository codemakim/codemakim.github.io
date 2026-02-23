'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { BattleEffect } from '@/app/lib/games/spire/types';

const META: Record<string, { color: string; shadow: string; prefix: string }> = {
  damage: { color: '#ff3333', shadow: '0 0 8px rgba(255,50,50,0.9), 0 2px 0 #000', prefix: '-' },
  block:  { color: '#60a5fa', shadow: '0 0 8px rgba(96,165,250,0.8), 0 2px 0 #000', prefix: '' },
  heal:   { color: '#4ade80', shadow: '0 0 8px rgba(74,222,128,0.8), 0 2px 0 #000', prefix: '+' },
  miss:   { color: '#a1a1aa', shadow: '0 2px 4px rgba(0,0,0,0.8)', prefix: '' },
};

interface PopupProps {
  effect: BattleEffect;
}

function Popup({ effect }: PopupProps) {
  const meta = META[effect.type] ?? META.damage;
  const label = effect.type === 'miss' ? 'MISS'
    : effect.type === 'block' ? `🛡️${effect.value}`
    : `${meta.prefix}${effect.value}`;

  const isLarge = effect.value >= 15 && effect.type === 'damage';

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 1.8 }}
      animate={{ opacity: 1, y: -20, scale: isLarge ? 1.3 : 1.0 }}
      exit={{ opacity: 0, y: -70, scale: 0.8, transition: { duration: 0.3, ease: 'easeOut' } }}
      transition={{
        opacity: { duration: 0.12 },
        y: { type: 'spring', damping: 14, stiffness: 220 },
        scale: { type: 'spring', damping: 10, stiffness: 300 },
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

export default function DamagePopup({ effects }: Props) {
  return (
    // mode="wait": 새 숫자가 들어오기 전 이전 숫자의 exit 애니메이션이 먼저 실행됨
    // → 연타 시 "이전 숫자가 위로 날아가고 → 새 숫자가 원점에서 다시 올라온다"
    <AnimatePresence mode="wait">
      {effects.map((effect) => (
        <Popup
          key={effect.id}
          effect={effect}
        />
      ))}
    </AnimatePresence>
  );
}
