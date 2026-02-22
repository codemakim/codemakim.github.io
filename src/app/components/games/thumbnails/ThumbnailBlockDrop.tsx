export default function ThumbnailBlockDrop() {
  const CELL = 10;
  const COLS = 10;
  const ROWS = 12;

  // 고정된 블록들 (바닥 부분)
  const fixedBlocks: { x: number; y: number; color: string }[] = [
    // 바닥 행
    ...([0,1,2,3,4,5,6,7,8,9].map(c => ({ x: c, y: 11, color: '#71717a' }))),
    // 그 위
    ...[0,1,2,4,5,6,7,8,9].map(c => ({ x: c, y: 10, color: '#6b7280' })),
    ...[0,2,3,4,5,7,8,9].map(c => ({ x: c, y: 9, color: '#64748b' })),
  ];

  // 현재 떨어지는 T 블록
  const fallingBlocks = [
    { x: 4, y: 0 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
  ];

  return (
    <svg
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* 격자 배경 */}
      {Array.from({ length: ROWS }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * CELL}
            y={row * CELL}
            width={CELL - 1}
            height={CELL - 1}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            className="text-zinc-200 dark:text-zinc-700"
          />
        ))
      )}
      {/* 고정된 블록 */}
      {fixedBlocks.map((b, i) => (
        <rect
          key={`fixed-${i}`}
          x={b.x * CELL + 0.5}
          y={b.y * CELL + 0.5}
          width={CELL - 2}
          height={CELL - 2}
          rx="1"
          fill={b.color}
        />
      ))}
      {/* 떨어지는 블록 */}
      {fallingBlocks.map((b, i) => (
        <rect
          key={`falling-${i}`}
          x={b.x * CELL + 0.5}
          y={b.y * CELL + 0.5}
          width={CELL - 2}
          height={CELL - 2}
          rx="1"
          fill="#a3a3a3"
        />
      ))}
    </svg>
  );
}
