import type { ActMap, MapNode, MapEdge, MapNodeType, GameMap } from './types';

const ROWS = 7;

function pickNodeType(row: number): MapNodeType {
  if (row === 0) return 'battle';
  if (row === ROWS - 2) return 'rest';
  if (row === ROWS - 1) return 'boss';

  const roll = Math.random();
  if (roll < 0.50) return 'battle';
  if (roll < 0.65) return 'elite';
  if (roll < 0.78) return 'rest';
  if (roll < 0.88) return 'treasure';
  return 'battle'; // event → battle로 단순화
}

function generateActMap(actIndex: number): ActMap {
  const nodes: MapNode[] = [];
  const nodeCountPerRow: number[] = [];

  for (let row = 0; row < ROWS; row++) {
    const isLast = row === ROWS - 1;
    const isFirst = row === 0;
    const count = isLast ? 1 : isFirst ? 2 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3);
    nodeCountPerRow.push(count);

    for (let col = 0; col < count; col++) {
      nodes.push({
        id: `a${actIndex}_r${row}_c${col}`,
        row,
        col,
        type: pickNodeType(row),
        visited: false,
        available: row === 0,
      });
    }
  }

  // 엣지 생성: 각 노드를 다음 행의 1~2개 노드에 연결
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

  const nodes = actMap.nodes.map(n =>
    connectedIds.has(n.id) ? { ...n, available: true } : n
  );

  return { ...actMap, nodes };
}
