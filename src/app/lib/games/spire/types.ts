import type { ComponentType } from 'react';

// ===== 이펙트 타입 =====
export type VfxType = 'slash' | 'impact' | 'magic' | 'pierce' | 'shield' | 'heal' | 'poison' | 'buff' | 'none';
export type SfxType = 'slash' | 'hit' | 'heavy_hit' | 'block' | 'heal' | 'buff' | 'debuff' | 'none';

// ===== 버프 =====
export type BuffType = 'strength' | 'dexterity' | 'vulnerable' | 'weak' | 'poison' | 'thorns';

// ===== 카드 효과 =====
export type CardEffect =
  | { type: 'damage'; value: number; target?: 'single' | 'all'; hits?: number; vfx?: VfxType }
  | { type: 'block'; value: number }
  | { type: 'draw'; value: number }
  | { type: 'buff'; buff: BuffType; value: number; target: 'self' | 'enemy' | 'allEnemies'; temporary?: boolean }
  | { type: 'heal'; value: number }
  | { type: 'gainEnergy'; value: number }
  | { type: 'addCopyToDiscard' };

export interface CardDef {
  id: string;
  name: string;
  type: 'attack' | 'skill' | 'power' | 'curse';
  cost: number; // -1 = X 비용 (남은 에너지 전부)
  description: string;
  effects: CardEffect[];
  illustration?: ComponentType<{ width?: number; height?: number }>;
  vfx?: VfxType;   // 카드 사용 시 재생할 시각 이펙트
  sfx?: SfxType;   // 카드 사용 시 재생할 사운드 (추후 구현)
}

export interface CardInstance {
  def: CardDef;
  instanceId: string;
  upgraded: boolean;
}

export interface BuffState {
  type: BuffType;
  value: number;
  duration?: number; // undefined = 영구
}

// ===== 적 =====
export type Intent = 'attack' | 'defend' | 'buff' | 'debuff' | 'special';

export type EnemyAction =
  | { type: 'attack'; damage: number; times?: number; vfx?: VfxType; sfx?: SfxType }
  | { type: 'block'; value: number }
  | { type: 'buff'; buff: BuffType; value: number; target: 'self' }
  | { type: 'debuff'; buff: BuffType; value: number; target: 'player' }
  | { type: 'heal'; value: number }
  | { type: 'multi'; actions: EnemyAction[]; vfx?: VfxType };

export interface EnemyPattern {
  weight: number;
  intent: Intent;
  intentValue?: number;
  action: EnemyAction;
  condition?: (turnCount: number) => boolean;
}

export interface EnemyDef {
  id: string;
  name: string;
  emoji: string;
  hp: [number, number];
  sprite: ComponentType<{ width?: number; height?: number; className?: string }>;
  patterns: EnemyPattern[];
  act: (1 | 2 | 3)[];
  tier: 'normal' | 'elite' | 'boss';
  sequential?: boolean;
}

export interface EnemyInstance {
  def: EnemyDef;
  hp: number;
  maxHp: number;
  block: number;
  buffs: BuffState[];
  currentIntent: EnemyPattern;
  patternIndex: number;
  turnCount: number;
}

// ===== 유물 =====
export type RelicAction =
  | { type: 'heal'; value: number }
  | { type: 'buff'; buff: BuffType; value: number }
  | { type: 'gainBlock'; value: number };

export type RelicEffect =
  | { type: 'onTurnStart'; action: RelicAction }
  | { type: 'onBattleStart'; action: RelicAction }
  | { type: 'onRest'; healMultiplier: number }
  | { type: 'passive'; stat: 'maxEnergy' | 'goldBonus' | 'minDamage'; value: number };

export interface RelicDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  effect: RelicEffect;
}

// ===== 플레이어 =====
export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  buffs: BuffState[];
}

// ===== 이펙트 이벤트 (Reducer → BattleScene 큐) =====
// Reducer가 카드/적 행동을 처리하면서 이 이벤트를 생성한다.
// BattleScene이 delayMs 스태거로 addEffect/addVfx를 스케줄링한다.
export interface EffectEvent {
  delayMs: number;        // 이전 이벤트 기준 지연 (ms) — 멀티히트 스태거에 사용
  type: 'damage' | 'block' | 'heal' | 'buff';
  value: number;          // 실제 값. damage에서 0이면 VFX만 재생 (완전 방어)
  target: 'player' | number;  // 'player' 또는 적 인덱스
  vfx?: VfxType;
}

// ===== 전투 =====
export interface BattleState {
  enemies: EnemyInstance[];
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  activePowers: string[]; // Active power card IDs
  turn: number;
  selectedCardIndex: number | null;
  targetingMode: boolean;
  pendingDamageBonus: number;
  // Reducer가 생성한 이펙트 이벤트 큐 (BattleScene이 CLEAR_EFFECTS로 비움)
  pendingEffects: EffectEvent[];
  // 모든 적 사망 후 사망 연출이 끝나면 이 phase로 전환 (CONFIRM_BATTLE_END 액션)
  pendingPhase?: 'reward';
}

// ===== 맵 =====
export type MapNodeType = 'battle' | 'elite' | 'boss' | 'rest' | 'treasure';

export interface MapNode {
  id: string;
  row: number;
  col: number;
  type: MapNodeType;
  visited: boolean;
  available: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
}

export interface ActMap {
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface GameMap {
  acts: ActMap[];
}

// ===== 게임 상태 =====
export type GamePhase = 'map' | 'battle' | 'reward' | 'rest' | 'gameOver' | 'victory';

export interface PendingRewards {
  cardChoices: CardDef[];
  gold: number;
  relic: RelicDef | null;
  cardCollected: boolean;
  goldCollected: boolean;
  relicCollected: boolean;
  isBossReward: boolean;
}

export interface GameState {
  phase: GamePhase;
  player: PlayerState;
  battle: BattleState | null;
  map: GameMap;
  currentAct: number; // 0-indexed (0=Act1, 1=Act2, 2=Act3)
  currentNodeId: string;
  deck: CardInstance[];
  relics: RelicDef[];
  gold: number;
  score: number;
  pendingRewards: PendingRewards | null;
}

// ===== 액션 =====
export type GameAction =
  | { type: 'SELECT_NODE'; nodeId: string }
  | { type: 'PLAY_CARD'; cardIndex: number; targetIndex?: number }
  | { type: 'END_TURN' }
  | { type: 'SELECT_CARD'; cardIndex: number }
  | { type: 'DESELECT_CARD' }
  | { type: 'PICK_CARD_REWARD'; cardIndex: number }
  | { type: 'SKIP_CARD_REWARD' }
  | { type: 'COLLECT_GOLD' }
  | { type: 'COLLECT_RELIC' }
  | { type: 'PROCEED_TO_MAP' }
  | { type: 'REST_HEAL' }
  | { type: 'REST_REMOVE_CARD'; cardIndex: number }
  | { type: 'CONFIRM_BATTLE_END' }
  | { type: 'CLEAR_EFFECTS' }
  | { type: 'RESTART' };

// ===== 전투 이펙트 (교체 가능한 구조) =====
export interface BattleEffect {
  id: string;
  type: 'damage' | 'block' | 'heal' | 'buff' | 'miss';
  value: number;
  target: 'player' | number; // 'player' 또는 적 인덱스
  timestamp: number;
  vfx?: VfxType; // 재생할 시각 이펙트
}

// ===== 저장 =====
export interface SpireSaveData {
  bestScore: number;
  bestAct: number;
  totalRuns: number;
  totalWins: number;
}

// ===== 중간 저장 (직렬화 가능 구조) =====
export interface SpireRunSave {
  player: PlayerState;
  deck: Array<{ defId: string; instanceId: string; upgraded: boolean }>;
  relicIds: string[];
  gold: number;
  score: number;
  currentAct: number;
  currentNodeId: string;
  mapState: GameMap;
  phase: GamePhase;
}
