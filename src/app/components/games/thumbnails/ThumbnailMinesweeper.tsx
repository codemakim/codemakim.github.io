export default function ThumbnailMinesweeper() {
  const cells = [
    { x: 4, y: 4, type: 'closed' },
    { x: 24, y: 4, type: 'closed' },
    { x: 44, y: 4, type: 'flag' },
    { x: 64, y: 4, type: 'closed' },
    { x: 84, y: 4, type: 'closed' },
    { x: 4, y: 24, type: 'num', n: 1, color: '#2563eb' },
    { x: 24, y: 24, type: 'num', n: 2, color: '#16a34a' },
    { x: 44, y: 24, type: 'open' },
    { x: 64, y: 24, type: 'num', n: 3, color: '#dc2626' },
    { x: 84, y: 24, type: 'bomb' },
    { x: 4, y: 44, type: 'open' },
    { x: 24, y: 44, type: 'num', n: 1, color: '#2563eb' },
    { x: 44, y: 44, type: 'open' },
    { x: 64, y: 44, type: 'closed' },
    { x: 84, y: 44, type: 'closed' },
  ] as const;

  return (
    <svg viewBox="0 0 104 64" className="w-full h-full" aria-hidden="true">
      {cells.map((cell, i) => (
        <g key={i}>
          <rect
            x={cell.x}
            y={cell.y}
            width="18"
            height="18"
            rx="2"
            fill={
              cell.type === 'closed' ? '#a1a1aa'
              : cell.type === 'flag' ? '#a1a1aa'
              : cell.type === 'bomb' ? '#fca5a5'
              : '#e4e4e7'
            }
          />
          {cell.type === 'flag' && (
            <text x={cell.x + 9} y={cell.y + 13} textAnchor="middle" fontSize="10">🚩</text>
          )}
          {cell.type === 'bomb' && (
            <text x={cell.x + 9} y={cell.y + 13} textAnchor="middle" fontSize="10">💣</text>
          )}
          {cell.type === 'num' && (
            <text
              x={cell.x + 9}
              y={cell.y + 13}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill={cell.color}
            >
              {cell.n}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
