'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import type { BattleEffect, VfxType, VfxDir } from '@/app/lib/games/spire/types';
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

interface VfxProps { size?: number; dir?: VfxDir }

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
  dir: VfxDir;
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
    dir?: VfxDir,
  ) => {
    const id = `fx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const effect: BattleEffect = { id, type, value, target, timestamp: Date.now(), vfx };

    // 각 타격을 독립 팝업으로 추가 — 연타 시 이전 숫자가 위에서 페이드되는 동안
    // 새 숫자가 아래서 올라와 시간차·수직 위치로 구분됨
    setEffects(prev => [...prev, effect]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), EFFECT_TTL);

    if (vfx && vfx !== 'none') {
      const vfxId = `vfx-${id}`;
      const resolvedDir: VfxDir = dir ?? (target === 'player' ? 'left' : 'right');
      setVfxList(prev => [...prev, { id: vfxId, vfx, target, dir: resolvedDir }]);
      const vfxTtl = getVfxTtl(vfx);
      setTimeout(() => setVfxList(prev => prev.filter(v => v.id !== vfxId)), vfxTtl);
    }
  }, []);

  // VFX만 추가 (숫자 팝업 없음) — 카드 사용 시 vfx 연출용
  const addVfx = useCallback((vfx: VfxType, target: BattleEffect['target'], dir?: VfxDir) => {
    if (!vfx || vfx === 'none') return;
    const vfxId = `vfx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const resolvedDir: VfxDir = dir ?? (target === 'player' ? 'left' : 'right');
    setVfxList(prev => [...prev, { id: vfxId, vfx, target, dir: resolvedDir }]);
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
        return <Component key={v.id} size={size} dir={v.dir} />;
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
