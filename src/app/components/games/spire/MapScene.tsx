'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { GameState, GameAction, MapNode, ActMap } from '@/app/lib/games/spire/types';
import CardListOverlay from './CardListOverlay';
import RelicBar from './RelicBar';

const NODE_META: Record<string, { emoji: string; label: string; color: string }> = {
  battle:  { emoji: '⚔️', label: '전투',  color: '#ef4444' },
  elite:   { emoji: '👹', label: '엘리트', color: '#f97316' },
  boss:    { emoji: '💀', label: '보스',  color: '#7c3aed' },
  rest:    { emoji: '🏕️', label: '휴식',  color: '#22c55e' },
  treasure:{ emoji: '🎁', label: '보물',  color: '#eab308' },
};

const SVG_W = 300;
const ROW_H = 56; // 행당 고정 높이 — ROWS가 바뀌어도 자동 대응
const PAD = 30;

function nodePos(node: MapNode, actMap: ActMap, svgH: number): { x: number; y: number } {
  const nodesInRow = actMap.nodes.filter(n => n.row === node.row);
  const cols = nodesInRow.length;
  const usableW = SVG_W - PAD * 2;
  const x = cols === 1 ? SVG_W / 2 : PAD + (node.col / (cols - 1)) * usableW;
  const y = svgH - PAD - node.row * ROW_H;
  return { x, y };
}

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function MapScene({ state, dispatch }: Props) {
  const { map, currentAct, currentNodeId, player, relics, gold } = state;
  const actMap = map.acts[currentAct];
  const [showDeck, setShowDeck] = useState(false);
  if (!actMap) return null;

  const maxRow = Math.max(...actMap.nodes.map(n => n.row));
  const svgH = PAD * 2 + (maxRow + 1) * ROW_H;
  const posMap = new Map(actMap.nodes.map(n => [n.id, nodePos(n, actMap, svgH)]));

  return (
    <div className="flex flex-col h-full overflow-y-auto relative">
      {/* 상단 상태 */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-700/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">❤️ {player.hp}<span className="text-zinc-400">/{player.maxHp}</span></span>
          <span className="text-sm text-yellow-300">💰 {gold}</span>
        </div>
        <div className="text-sm font-bold text-zinc-300">Act {currentAct + 1}</div>
        <RelicBar relics={relics} />
      </div>

      {/* 맵 SVG */}
      <div className="flex justify-center py-4 px-2">
        <svg width={SVG_W} height={svgH} viewBox={`0 0 ${SVG_W} ${svgH}`} className="max-w-full">
          {/* 엣지 (경로) */}
          {actMap.edges.map((edge, i) => {
            const from = posMap.get(edge.from);
            const to = posMap.get(edge.to);
            if (!from || !to) return null;
            return (
              <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#4b5563" strokeWidth="2" strokeDasharray="4 3" opacity="0.6"
              />
            );
          })}

          {/* 노드 */}
          {actMap.nodes.map(node => {
            const pos = posMap.get(node.id);
            if (!pos) return null;
            const meta = NODE_META[node.type] ?? NODE_META.battle;
            const isCurrent = node.id === currentNodeId;
            const isAvailable = node.available && !node.visited;
            const isVisited = node.visited;

            return (
              <g key={node.id} onClick={() => isAvailable && dispatch({ type: 'SELECT_NODE', nodeId: node.id })}
                style={{ cursor: isAvailable ? 'pointer' : 'default' }}>
                {/* 선택 가능 강조 */}
                {isAvailable && (
                  <circle cx={pos.x} cy={pos.y} r={24} fill={meta.color} opacity={0.2}>
                    <animate attributeName="r" values="20;26;20" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.15;0.3;0.15" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                )}
                {/* 노드 원 */}
                <circle
                  cx={pos.x} cy={pos.y} r={20}
                  fill={isVisited ? '#1f2937' : isAvailable ? '#111827' : '#111827'}
                  stroke={isCurrent ? '#fbbf24' : isAvailable ? meta.color : isVisited ? '#374151' : '#374151'}
                  strokeWidth={isCurrent ? 3 : isAvailable ? 2.5 : 1.5}
                  opacity={isVisited ? 0.5 : 1}
                />
                {/* 이모지 */}
                <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontSize="14" opacity={isVisited ? 0.4 : 1}>
                  {meta.emoji}
                </text>
                {/* 레이블 */}
                <text x={pos.x} y={pos.y + 34} textAnchor="middle" fontSize="9" fill={isAvailable ? '#d1d5db' : '#6b7280'}>
                  {meta.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 덱 보기 버튼 */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowDeck(true)}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          🃏 덱 보기 ({state.deck.length}장)
        </button>
      </div>

      {/* 덱 카드 오버레이 */}
      <AnimatePresence>
        {showDeck && (
          <CardListOverlay
            title={`덱 (${state.deck.length}장)`}
            cards={state.deck}
            onClose={() => setShowDeck(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
