'use client';

import { useEffect, useState } from 'react';
import type { BattleEffect } from '@/app/lib/games/spire/types';

interface Props {
  effects: BattleEffect[];
}

const EFFECT_META: Record<string, { color: string; prefix: string }> = {
  damage: { color: 'text-red-400', prefix: '-' },
  block:  { color: 'text-blue-400', prefix: '' },
  heal:   { color: 'text-green-400', prefix: '+' },
  buff:   { color: 'text-yellow-400', prefix: '' },
  miss:   { color: 'text-zinc-400', prefix: '' },
};

function EffectPopup({ effect }: { effect: BattleEffect }) {
  const [visible, setVisible] = useState(true);
  const meta = EFFECT_META[effect.type] ?? EFFECT_META.damage;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const label = effect.type === 'miss' ? 'MISS' :
    effect.type === 'block' ? `🛡️${effect.value}` :
    `${meta.prefix}${effect.value}`;

  return (
    <div
      className={`absolute pointer-events-none font-black text-xl ${meta.color} animate-fade-up z-50`}
      style={{
        left: '50%',
        top: '20%',
        transform: 'translateX(-50%)',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
      }}
    >
      {label}
    </div>
  );
}

export default function BattleEffects({ effects }: Props) {
  return (
    <>
      {effects.map(effect => (
        <EffectPopup key={effect.id} effect={effect} />
      ))}
    </>
  );
}

export function useEffects() {
  const [effects, setEffects] = useState<BattleEffect[]>([]);

  function addEffect(type: BattleEffect['type'], value: number, target: BattleEffect['target']) {
    const effect: BattleEffect = {
      id: `fx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type, value, target,
      timestamp: Date.now(),
    };
    setEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 900);
  }

  return { effects, addEffect };
}
