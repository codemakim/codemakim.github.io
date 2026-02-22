export default function ThumbnailSnake() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* 격자 배경 */}
      {[0,1,2,3,4,5].map(row =>
        [0,1,2,3,4,5].map(col => (
          <rect
            key={`${row}-${col}`}
            x={col * 20}
            y={row * 20}
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-zinc-200 dark:text-zinc-700"
          />
        ))
      )}
      {/* 뱀 몸통 */}
      {[
        [2, 3], [3, 3], [4, 3], [4, 2], [4, 1], [3, 1], [2, 1]
      ].map(([col, row], i) => (
        <rect
          key={i}
          x={col * 20 + 2}
          y={row * 20 + 2}
          width="16"
          height="16"
          rx="3"
          fill={i === 0 ? '#3f3f46' : '#71717a'}
        />
      ))}
      {/* 먹이 (빨간 동그라미) */}
      <circle cx="110" cy="110" r="8" fill="#ef4444" />
      <circle cx="108" cy="108" r="3" fill="#fca5a5" opacity="0.7" />
    </svg>
  );
}
