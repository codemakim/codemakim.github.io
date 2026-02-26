'use client';

import { useReducer } from 'react';
import type { GameState, GameAction, MapNode } from './types';
import { createStarterDeck, makeInstance } from './cards';
import { BURNING_BLOOD } from './relics';
import { generateMap, makeNextNodesAvailable } from './mapGen';
import { applyCard, initBattle, processEnemyTurn } from './battleLogic';
import { generateRewards, checkRewardsDone } from './rewardLogic';

// ===== 저장 유틸 재수출 (외부 임포트 호환성 유지) =====
export { loadSave, serializeRun, deserializeRun, saveRunToLocal, loadRunFromLocal, clearRunSave } from './saveUtils';

// ===== 초기 상태 =====

function createInitialState(): GameState {
  const map = generateMap();
  const deck = createStarterDeck().map(def => makeInstance(def));

  return {
    phase: 'map',
    player: { hp: 80, maxHp: 80, block: 0, energy: 3, maxEnergy: 3, buffs: [] },
    battle: null,
    map,
    currentAct: 0,
    currentNodeId: '',
    deck,
    relics: [BURNING_BLOOD],
    gold: 0,
    score: 0,
    pendingRewards: null,
  };
}

// ===== 맵 유틸 =====

function visitNode(state: GameState, nodeId: string): GameState {
  const act = state.currentAct;
  const actMap = state.map.acts[act];
  if (!actMap) return state;

  const updatedActMap = makeNextNodesAvailable(
    { ...actMap, nodes: actMap.nodes.map(n => n.id === nodeId ? { ...n, visited: true } : n) },
    nodeId,
  );

  const newActs = state.map.acts.map((a, i) => i === act ? updatedActMap : a);
  return { ...state, map: { acts: newActs } };
}

// ===== REDUCER =====

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SELECT_NODE': {
      const node = state.map.acts[state.currentAct]?.nodes.find(n => n.id === action.nodeId);
      if (!node || !node.available || node.visited) return state;

      if (node.type === 'rest') {
        return { ...visitNode(state, node.id), phase: 'rest', currentNodeId: node.id };
      }

      if (node.type === 'treasure') {
        const rewards = generateRewards(state, node);
        return { ...visitNode(state, node.id), phase: 'reward', pendingRewards: rewards, currentNodeId: node.id };
      }

      return initBattle(visitNode(state, action.nodeId), node);
    }

    case 'SELECT_CARD': {
      if (!state.battle) return state;
      const card = state.battle.hand[action.cardIndex]?.def;
      if (!card) return state;
      if (state.battle.selectedCardIndex === action.cardIndex) {
        return { ...state, battle: { ...state.battle, selectedCardIndex: null, targetingMode: false } };
      }
      const isTargeted = card.type === 'attack' || card.effects.some(e => e.type === 'buff' && (e as { target: string }).target === 'enemy');
      const aliveEnemies = state.battle.enemies.filter(e => e.hp > 0);
      const needsTarget = isTargeted && aliveEnemies.length > 1;
      return {
        ...state,
        battle: { ...state.battle, selectedCardIndex: action.cardIndex, targetingMode: needsTarget },
      };
    }

    case 'DESELECT_CARD': {
      if (!state.battle) return state;
      return { ...state, battle: { ...state.battle, selectedCardIndex: null, targetingMode: false } };
    }

    case 'PLAY_CARD': {
      if (!state.battle) return state;
      return applyCard(state, action.cardIndex, action.targetIndex ?? 0);
    }

    case 'END_TURN': {
      return processEnemyTurn(state);
    }

    case 'PICK_CARD_REWARD': {
      if (!state.pendingRewards) return state;
      const chosen = state.pendingRewards.cardChoices[action.cardIndex];
      if (!chosen) return state;
      const newCard = makeInstance(chosen);
      const updated = { ...state, deck: [...state.deck, newCard], pendingRewards: { ...state.pendingRewards, cardCollected: true } };
      return checkRewardsDone(updated);
    }

    case 'SKIP_CARD_REWARD': {
      if (!state.pendingRewards) return state;
      return checkRewardsDone({ ...state, pendingRewards: { ...state.pendingRewards, cardCollected: true } });
    }

    case 'COLLECT_GOLD': {
      if (!state.pendingRewards) return state;
      const updated = {
        ...state,
        gold: state.gold + state.pendingRewards.gold,
        pendingRewards: { ...state.pendingRewards, goldCollected: true },
      };
      return checkRewardsDone(updated);
    }

    case 'COLLECT_RELIC': {
      if (!state.pendingRewards?.relic) return state;
      const relic = state.pendingRewards.relic;
      let player = { ...state.player };

      if (relic.effect.type === 'passive' && relic.effect.stat === 'maxEnergy') {
        player = { ...player, maxEnergy: player.maxEnergy + relic.effect.value, energy: player.energy + relic.effect.value };
      }

      const updated = {
        ...state, player, relics: [...state.relics, relic],
        pendingRewards: { ...state.pendingRewards, relicCollected: true },
      };
      return checkRewardsDone(updated);
    }

    case 'PROCEED_TO_MAP': {
      const all = state.pendingRewards
        ? { ...state.pendingRewards, cardCollected: true, goldCollected: true, relicCollected: true }
        : null;
      return checkRewardsDone({ ...state, pendingRewards: all });
    }

    case 'REST_HEAL': {
      const healingFlask = state.relics.find(r => r.id === 'healing_flask');
      const healMultiplier = healingFlask?.effect.type === 'onRest' ? healingFlask.effect.healMultiplier : 0.3;
      const heal = Math.floor(state.player.maxHp * healMultiplier);
      return {
        ...state,
        phase: 'map',
        player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + heal) },
      };
    }

    case 'REST_REMOVE_CARD': {
      return { ...state, phase: 'map', deck: state.deck.filter((_, i) => i !== action.cardIndex) };
    }

    case 'CONFIRM_BATTLE_END': {
      if (!state.battle?.pendingPhase) return state;
      return { ...state, phase: state.battle.pendingPhase, battle: null };
    }

    case 'CLEAR_EFFECTS': {
      if (!state.battle) return state;
      return { ...state, battle: { ...state.battle, pendingEffects: [] } };
    }

    case 'RESTART': {
      return createInitialState();
    }

    default:
      return state;
  }
}

// ===== HOOK =====

export function useSpireGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  return { state, dispatch };
}
