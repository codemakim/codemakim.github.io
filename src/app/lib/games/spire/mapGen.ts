import type { ActMap, MapNode, MapEdge, MapNodeType, GameMap } from './types';

const ROWS = 10;

/**
 * 노드 타입을 가중치 기반으로 선택한다.
 * predTypes: 이 노드로 연결되는 선행 노드들의 타입 집합
 * - 선행에 elite가 있으면 elite 불가 (연속 엘리트 방지)
 * - 선행에 rest가 있으면 rest 불가 (연속 휴식 방지)
 * - 보스 직전 행(ROWS-3)은 rest 불가 (다음 행 ROWS-2가 항상 rest이므로)
 */
function pickNodeType(row: number, predTypes: Set<MapNodeType> = new Set()): MapNodeType {
  if (row === 0) return 'battle';
  if (row === ROWS - 2) return 'rest'; // 보스 직전: 항상 휴식
  if (row === ROWS - 1) return 'boss';

  const blocked = new Set<MapNodeType>();
  if (predTypes.has('elite')) blocked.add('elite');
  if (predTypes.has('rest'))  blocked.add('rest');
  // 보스 직전 전 행은 rest 불가 — 다음 행이 항상 rest이므로 연속 방지
  if (row === ROWS - 3) blocked.add('rest');

  const weights: { type: MapNodeType; w: number }[] = [
    { type: 'battle',   w: 50 },
    { type: 'elite',    w: 15 },
    { type: 'rest',     w: 13 },
    { type: 'treasure', w: 10 },
  ];

  const pool = weights.filter(c => !blocked.has(c.type));
  const total = pool.reduce((s, c) => s + c.w, 0);
  let roll = Math.random() * total;
  for (const c of pool) {
    roll -= c.w;
    if (roll <= 0) return c.type;
  }
  return 'battle';
}

function generateActMap(actIndex: number): ActMap {
  // 1단계: 행별 노드 수 결정 및 빈 노드 생성 (타입은 아직 미정)
  const nodes: MapNode[] = [];
  for (let row = 0; row < ROWS; row++) {
    const isLast = row === ROWS - 1;
    const isFirst = row === 0;
    const count = isLast ? 1 : isFirst
      ? 2 + Math.floor(Math.random() * 2)
      : 2 + Math.floor(Math.random() * 3);

    for (let col = 0; col < count; col++) {
      nodes.push({
        id: `a${actIndex}_r${row}_c${col}`,
        row,
        col,
        type: 'battle', // 3단계에서 교체
        visited: false,
        available: row === 0,
      });
    }
  }

  // 2단계: 엣지 생성 (기존 로직)
  const edges: MapEdge[] = [];
  for (let row = 0; row < ROWS - 1; row++) {
    const rowNodes = nodes.filter(n => n.row === row);
    const nextRowNodes = nodes.filter(n => n.row === row + 1);
    const reached = new Set<string>();

    for (const node of rowNodes) {
      const ratio = node.col / Math.max(1, rowNodes.length - 1);
      const targetCol = Math.round(ratio * (nextRowNodes.length - 1));
      const target = nextRowNodes[Math.min(targetCol, nextRowNodes.length - 1)];

      if (target && !edges.some(e => e.from === node.id && e.to === target.id)) {
        edges.push({ from: node.id, to: target.id });
        reached.add(target.id);
      }

      // 30% 확률로 인접 노드에도 연결
      if (Math.random() < 0.3 && nextRowNodes.length > 1) {
        const altCol = targetCol === 0 ? 1 : targetCol - 1;
        const alt = nextRowNodes[altCol];
        if (alt && !edges.some(e => e.from === node.id && e.to === alt.id)) {
          edges.push({ from: node.id, to: alt.id });
          reached.add(alt.id);
        }
      }
    }

    // 도달하지 못한 다음 행 노드 보장
    for (const next of nextRowNodes) {
      if (!reached.has(next.id)) {
        const fromNode = rowNodes[Math.floor(Math.random() * rowNodes.length)];
        if (!edges.some(e => e.from === fromNode.id && e.to === next.id)) {
          edges.push({ from: fromNode.id, to: next.id });
        }
      }
    }
  }

  // 3단계: 행 순서대로 타입 할당 — 선행 노드 타입을 알고 있으므로 연속 제약 적용 가능
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  for (let row = 0; row < ROWS; row++) {
    for (const node of nodes.filter(n => n.row === row)) {
      // 이 노드의 선행 노드(→ 이 노드로 오는 엣지) 타입 수집
      const predTypes = new Set(
        edges
          .filter(e => e.to === node.id)
          .map(e => nodeMap.get(e.from)?.type)
          .filter((t): t is MapNodeType => t !== undefined)
      );
      node.type = pickNodeType(row, predTypes);
    }
  }

  return { nodes, edges };
}

export function generateMap(): GameMap {
  return {
    acts: [generateActMap(0), generateActMap(1), generateActMap(2)],
  };
}

export function makeNextNodesAvailable(actMap: ActMap, visitedNodeId: string): ActMap {
  const connectedIds = new Set(
    actMap.edges.filter(e => e.from === visitedNodeId).map(e => e.to)
  );

  const nodes = actMap.nodes.map(n => {
    if (n.id === visitedNodeId) return n;
    if (connectedIds.has(n.id)) return { ...n, available: true };
    if (!n.visited) return { ...n, available: false };
    return n;
  });

  return { ...actMap, nodes };
}
