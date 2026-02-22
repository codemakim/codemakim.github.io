export default function Thumbnail2048() {
  const tiles = [
    { x: 2, y: 2, val: 2, color: '#d4d4d8' },
    { x: 62, y: 2, val: 4, color: '#a1a1aa' },
    { x: 2, y: 62, val: 8, color: '#fcd34d' },
    { x: 62, y: 62, val: 16, color: '#fb923c' },
  ];
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <rect width="120" height="120" rx="8" fill="none" />
      {/* 4x4 격자 배경 */}
      {[0, 1, 2, 3].map(row =>
        [0, 1, 2, 3].map(col => (
          <rect
            key={`${row}-${col}`}
            x={col * 28 + 4}
            y={row * 28 + 4}
            width="24"
            height="24"
            rx="3"
            fill="currentColor"
            className="text-zinc-200 dark:text-zinc-700"
          />
        ))
      )}
      {/* 하이라이트 타일 */}
      {tiles.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.y} width="52" height="52" rx="6" fill={t.color} />
          <text
            x={t.x + 26}
            y={t.y + 33}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#1a1a1a"
          >
            {t.val}
          </text>
        </g>
      ))}
    </svg>
  );
}
