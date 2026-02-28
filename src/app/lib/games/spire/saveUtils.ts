import type { GameState, CardInstance } from './types';
import { createStarterDeck, REWARD_CARD_POOL, makeInstance } from './cards';
import { BURNING_BLOOD, TREASURE_RELICS, ELITE_RELICS, BOSS_RELICS } from './relics';

// ===== 베스트 기록 저장 =====

const SAVE_KEY = 'game_spire_save';

export function loadSave() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; }
}

export function updateSave(score: number, act: number, won: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const prev = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      bestScore: Math.max(prev.bestScore ?? 0, score),
      bestAct: Math.max(prev.bestAct ?? 0, act + 1),
      totalRuns: (prev.totalRuns ?? 0) + 1,
      totalWins: (prev.totalWins ?? 0) + (won ? 1 : 0),
    }));
  } catch { /* ignore */ }
}

// ===== 진행 중 런 직렬화/역직렬화 =====

const RUN_SAVE_KEY = 'game_spire_run';

export function serializeRun(state: GameState): string {
  return JSON.stringify({
    characterId: state.characterId,
    player: state.player,
    deck: state.deck.map(c => ({ defId: c.def.id, instanceId: c.instanceId, upgraded: c.upgraded })),
    relicIds: state.relics.map(r => r.id),
    gold: state.gold,
    score: state.score,
    currentAct: state.currentAct,
    currentNodeId: state.currentNodeId,
    mapState: state.map,
    phase: state.phase,
  });
}

export function deserializeRun(json: string): GameState | null {
  try {
    const data = JSON.parse(json);
    const allCards = [...createStarterDeck(), ...REWARD_CARD_POOL];
    const cardMap = new Map(allCards.map(c => [c.id, c]));
    const allRelicList = [BURNING_BLOOD, ...TREASURE_RELICS, ...ELITE_RELICS, ...BOSS_RELICS];
    const relicMap = new Map(allRelicList.map(r => [r.id, r]));

    const deck: CardInstance[] = data.deck
      .map((c: { defId: string; instanceId: string; upgraded: boolean }) => {
        const def = cardMap.get(c.defId);
        if (!def) return null;
        return { def, instanceId: c.instanceId, upgraded: c.upgraded };
      })
      .filter(Boolean) as CardInstance[];

    const relics = data.relicIds
      .map((id: string) => relicMap.get(id))
      .filter(Boolean) as import('./types').RelicDef[];

    return {
      characterId: data.characterId ?? 'warrior',
      phase: data.phase || 'map',
      player: data.player,
      battle: null,
      map: data.mapState,
      currentAct: data.currentAct,
      currentNodeId: data.currentNodeId,
      deck,
      relics,
      gold: data.gold,
      score: data.score,
      pendingRewards: null,
    };
  } catch {
    return null;
  }
}

export function saveRunToLocal(state: GameState): void {
  if (typeof window === 'undefined') return;
  if (state.phase === 'gameOver' || state.phase === 'victory' || state.phase === 'charSelect') {
    localStorage.removeItem(RUN_SAVE_KEY);
    return;
  }
  localStorage.setItem(RUN_SAVE_KEY, serializeRun(state));
}

export function loadRunFromLocal(): GameState | null {
  if (typeof window === 'undefined') return null;
  const json = localStorage.getItem(RUN_SAVE_KEY);
  if (!json) return null;
  return deserializeRun(json);
}

export function clearRunSave(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RUN_SAVE_KEY);
}
