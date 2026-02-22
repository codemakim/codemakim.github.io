import type { ComponentType } from 'react';

// ===== 버프 =====
export type BuffType = 'strength' | 'dexterity' | 'vulnerable' | 'weak' | 'poison' | 'thorns';

// ===== 카드 효과 =====
export type CardEffect =
  | { type: 'damage'; value: number; target?: 'single' | 'all' }
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
  | { type: 'attack'; damage: number; times?: number }
  | { type: 'block'; value: number }
  | { type: 'buff'; buff: BuffType; value: number; target: 'self' }
  | { type: 'debuff'; buff: BuffType; value: number; target: 'player' }
  | { type: 'heal'; value: number }
  | { type: 'multi'; actions: EnemyAction[] };

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
  | { type: 'passive'; stat: 'maxEnergy' | 'goldBonus'; value: number };

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
  | { type: 'RESTART' };

// ===== 저장 =====
export interface SpireSaveData {
  bestScore: number;
  bestAct: number;
  totalRuns: number;
  totalWins: number;
}
