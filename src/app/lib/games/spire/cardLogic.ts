/**
 * @file cardLogic.ts
 * @description 카드 효과 적용 로직
 *
 * 이펙트 흐름:
 *   applyCard() → EffectEvent[] 생성 (delayMs 포함)
 *   → BattleState.pendingEffects[]에 적재
 *   → BattleScene.tsx가 delayMs 스태거로 addEffect / addVfx 스케줄링
 *   → EffectLayer.tsx → VfxRenderer (SlashEffect 등) + PopupRenderer (DamagePopup)
 *
 * 역할:
 *   applyCard() — 핸드의 카드를 소비하고 damage/block/buff/draw 등 효과 처리.
 *                 연타 카드(hits > 1)는 타격마다 독립 EffectEvent를 생성해
 *                 hitDelay(+120ms) 스태거로 순차 팝업을 유발한다.
 *
 * 의존:
 *   combat.ts       (getBuffValue, addBuff, drawCards, calcDamage, copyCard)
 *   rewardLogic.ts  (generateRewards)
 *   saveUtils.ts    (updateSave)
 */

import type {
  GameState, BattleState, EffectEvent, VfxType,
} from './types';
import {
  getBuffValue, addBuff, drawCards, calcDamage, copyCard,
} from './combat';
import { generateRewards } from './rewardLogic';
import { updateSave } from './saveUtils';

// ===== 카드 효과 적용 =====

export function applyCard(state: GameState, cardIndex: number, targetIndex: number): GameState {
  if (!state.battle) return state;

  const battle = state.battle;
  const cardInst = battle.hand[cardIndex];
  if (!cardInst) return state;
  const card = cardInst.def;

  const actualCost = card.cost === -1 ? state.player.energy : card.cost;
  if (card.type === 'curse' || state.player.energy < actualCost) return state;

  let player = { ...state.player, energy: state.player.energy - actualCost };
  let enemies = [...battle.enemies];
  let hand = battle.hand.filter((_, i) => i !== cardIndex);
  let drawPile = [...battle.drawPile];
  let discardPile = [...battle.discardPile];
  const exhaustPile = [...battle.exhaustPile];
  let activePowers = [...battle.activePowers];
  let pendingDamageBonus = battle.pendingDamageBonus;

  const xValue = card.cost === -1 ? actualCost : 1;
  const effectEvents: EffectEvent[] = [];
  let hitDelay = 0;

  for (const effect of card.effects) {
    switch (effect.type) {
      case 'damage': {
        const strength = getBuffValue(player.buffs, 'strength');
        const isWeak = getBuffValue(player.buffs, 'weak') > 0;
        const targets = effect.target === 'all' ? enemies.map((_, i) => i) : [targetIndex];
        const hits = card.id === 'whirlwind' ? xValue : (effect.hits ?? 1);
        const hasToughBoots = state.relics.some(r => r.id === 'tough_boots');
        // 힘·보너스 효과는 타격마다 독립 적용 → 연타일수록 배증
        const hitBonus = card.type === 'attack' ? pendingDamageBonus : 0;
        if (hitBonus > 0) pendingDamageBonus = 0; // 이번 카드 소비

        for (let t = 0; t < hits; t++) {
          for (const ti of targets) {
            const e = enemies[ti];
            if (!e || e.hp <= 0) continue;
            const isVulnerable = getBuffValue(e.buffs, 'vulnerable') > 0;
            let baseDmg = effect.value;
            if (card.id === 'execute' && e.hp <= e.maxHp * 0.5) baseDmg = 25;
            if (hitBonus > 0) baseDmg += hitBonus; // 모든 타격에 적용
            const dmg = calcDamage(baseDmg, strength, isWeak, isVulnerable);
            let eBlock = e.block, eHp = e.hp;
            if (dmg <= eBlock) { eBlock -= dmg; }
            else { eHp -= (dmg - eBlock); eBlock = 0; }
            enemies[ti] = { ...e, hp: Math.max(0, eHp), block: eBlock };

            // 단단한 부츠: 방어에 완전히 막혀도 최소 1 피해
            if (hasToughBoots && dmg > 0 && enemies[ti].hp === e.hp && enemies[ti].hp > 0) {
              enemies[ti] = { ...enemies[ti], hp: enemies[ti].hp - 1 };
            }

            const hpDmgActual = e.hp - enemies[ti].hp;
            const effectVfx: VfxType | undefined =
              (effect as { vfx?: VfxType }).vfx ?? card.vfx;
            effectEvents.push({
              delayMs: hitDelay,
              type: 'damage',
              value: hpDmgActual,
              target: ti,
              vfx: effectVfx,
              vfxDir: hits > 1 || targets.length > 1 ? 'random' : 'right',
            });
            hitDelay += 120;
          }
        }
        break;
      }
      case 'block': {
        const dex = getBuffValue(player.buffs, 'dexterity');
        player = { ...player, block: player.block + effect.value + dex };
        effectEvents.push({ delayMs: 0, type: 'block', value: effect.value + dex, target: 'player', vfx: 'shield' });
        break;
      }
      case 'draw': {
        const tmp: BattleState = { ...battle, hand, drawPile, discardPile, enemies, activePowers, exhaustPile, pendingDamageBonus, pendingEffects: [] };
        const drawn = drawCards(tmp, effect.value);
        hand = drawn.hand; drawPile = drawn.drawPile; discardPile = drawn.discardPile;
        break;
      }
      case 'buff': {
        const duration = effect.temporary ? 1 : undefined;
        if (effect.target === 'self') {
          player = { ...player, buffs: addBuff(player.buffs, effect.buff, effect.value, duration) };
          effectEvents.push({ delayMs: 0, type: 'buff', value: effect.value, target: 'player', vfx: 'buff' });
        } else if (effect.target === 'enemy') {
          const e = enemies[targetIndex];
          if (e) enemies[targetIndex] = { ...e, buffs: addBuff(e.buffs, effect.buff, effect.value) };
        } else if (effect.target === 'allEnemies') {
          enemies = enemies.map(e => ({ ...e, buffs: addBuff(e.buffs, effect.buff, effect.value) }));
        }
        break;
      }
      case 'heal': {
        player = { ...player, hp: Math.min(player.maxHp, Math.max(0, player.hp + effect.value)) };
        effectEvents.push({ delayMs: 0, type: 'heal', value: effect.value, target: 'player', vfx: 'heal' });
        break;
      }
      case 'gainEnergy': {
        player = { ...player, energy: player.energy + effect.value };
        break;
      }
      case 'addCopyToDiscard': {
        discardPile = [...discardPile, copyCard(cardInst)];
        break;
      }
    }
  }

  if (card.id === 'counter_stance') pendingDamageBonus = 3;

  if (card.type === 'power') {
    exhaustPile.push(cardInst);
    activePowers = [...activePowers, card.id];
  } else {
    discardPile = [...discardPile, cardInst];
  }

  const newBattle: BattleState = {
    ...battle, enemies, hand, drawPile, discardPile, exhaustPile,
    activePowers, pendingDamageBonus,
    selectedCardIndex: null, targetingMode: false,
    pendingEffects: effectEvents,
  };

  const allDead = enemies.every(e => e.hp <= 0);
  if (allDead) {
    const node = state.map.acts[state.currentAct]?.nodes.find(n => n.id === state.currentNodeId);
    if (!node) return state;
    const rewards = generateRewards({ ...state, player }, node);
    updateSave(state.score, state.currentAct, false);
    return {
      ...state,
      player,
      battle: { ...newBattle, pendingPhase: 'reward' as const },
      pendingRewards: rewards,
    };
  }

  return { ...state, player, battle: newBattle };
}
