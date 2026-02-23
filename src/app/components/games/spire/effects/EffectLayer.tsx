'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import type { BattleEffect, VfxType } from '@/app/lib/games/spire/types';
import DamagePopup from './DamagePopup';
import SlashEffect from './SlashEffect';
import ImpactEffect from './ImpactEffect';
import PierceEffect from './PierceEffect';
import MagicEffect from './MagicEffect';
import ShieldEffect from './ShieldEffect';
import HealEffect from './HealEffect';
import PoisonEffect from './PoisonEffect';
import BuffEffect from './BuffEffect';

// ===== VFX 컴포넌트 매핑 =====

interface VfxProps { size?: number }

const VFX_COMPONENTS: Partial<Record<VfxType, React.ComponentType<VfxProps>>> = {
  slash:  SlashEffect,
  impact: ImpactEffect,
  pierce: PierceEffect,
  magic:  MagicEffect,
  shield: ShieldEffect,
  heal:   HealEffect,
  poison: PoisonEffect,
  buff:   BuffEffect,
};

// ===== VFX 인스턴스 =====

export interface VfxInstance {
  id: string;
  vfx: VfxType;
  target: 'player' | number;
}

// ===== useEffects 훅 =====

const EFFECT_TTL = 1600;

export function useEffects() {
  const [effects, setEffects] = useState<BattleEffect[]>([]);
  const [vfxList, setVfxList] = useState<VfxInstance[]>([]);

  // 숫자 팝업 + VFX 동시 추가
  const addEffect = useCallback((
    type: BattleEffect['type'],
    value: number,
    target: BattleEffect['target'],
    vfx?: VfxType,
  ) => {
    const id = `fx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const effect: BattleEffect = { id, type, value, target, timestamp: Date.now(), vfx };

    // 동일 타겟·동일 타입 이펙트를 교체 — 연속 타격 시 이전 숫자가 exit 애니메이션으로 사라지고
    // 새 숫자가 원점에서 다시 시작하여 "따다다닥" 타격감을 표현한다
    setEffects(prev => [...prev.filter(e => !(e.target === target && e.type === type)), effect]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), EFFECT_TTL);

    if (vfx && vfx !== 'none') {
      const vfxId = `vfx-${id}`;
      setVfxList(prev => [...prev, { id: vfxId, vfx, target }]);
      const vfxTtl = getVfxTtl(vfx);
      setTimeout(() => setVfxList(prev => prev.filter(v => v.id !== vfxId)), vfxTtl);
    }
  }, []);

  // VFX만 추가 (숫자 팝업 없음) — 카드 사용 시 vfx 연출용
  const addVfx = useCallback((vfx: VfxType, target: BattleEffect['target']) => {
    if (!vfx || vfx === 'none') return;
    const vfxId = `vfx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setVfxList(prev => [...prev, { id: vfxId, vfx, target }]);
    setTimeout(() => setVfxList(prev => prev.filter(v => v.id !== vfxId)), getVfxTtl(vfx));
  }, []);

  return { effects, vfxList, addEffect, addVfx };
}

function getVfxTtl(vfx: VfxType): number {
  switch (vfx) {
    case 'magic':  return 900;
    case 'shield': return 700;
    case 'heal':   return 1100;
    case 'buff':   return 900;
    case 'poison': return 800;
    default:       return 600;
  }
}

// ===== VFX 렌더러 (개별 캐릭터에 붙임) =====

interface VfxRendererProps {
  vfxList: VfxInstance[];
  target: 'player' | number;
  size?: number;
}

export function VfxRenderer({ vfxList, target, size = 110 }: VfxRendererProps) {
  const mine = vfxList.filter(v => v.target === target);

  return (
    <AnimatePresence>
      {mine.map(v => {
        const Component = VFX_COMPONENTS[v.vfx];
        if (!Component) return null;
        return <Component key={v.id} size={size} />;
      })}
    </AnimatePresence>
  );
}

// ===== DamagePopup 렌더러 (개별 캐릭터에 붙임) =====

interface PopupRendererProps {
  effects: BattleEffect[];
  target: 'player' | number;
}

export function PopupRenderer({ effects, target }: PopupRendererProps) {
  const mine = effects.filter(e => e.target === target);
  return <DamagePopup effects={mine} />;
}
