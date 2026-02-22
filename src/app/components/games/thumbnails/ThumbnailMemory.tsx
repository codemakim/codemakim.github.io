export default function ThumbnailMemory() {
  const cards = [
    { x: 4, y: 4, flipped: false },
    { x: 34, y: 4, flipped: true, emoji: '🐶' },
    { x: 64, y: 4, flipped: false },
    { x: 94, y: 4, flipped: true, emoji: '🐶' },
    { x: 4, y: 44, flipped: true, emoji: '🐱' },
    { x: 34, y: 44, flipped: false },
    { x: 64, y: 44, flipped: false },
    { x: 94, y: 44, flipped: true, emoji: '🐱' },
  ] as const;

  return (
    <svg viewBox="0 0 120 92" className="w-full h-full" aria-hidden="true">
      {cards.map((card, i) => (
        <g key={i}>
          <rect
            x={card.x}
            y={card.y}
            width="26"
            height="36"
            rx="4"
            fill={card.flipped ? '#ffffff' : '#a1a1aa'}
            stroke="#d4d4d8"
            strokeWidth="1"
          />
          {card.flipped && (
            <text
              x={card.x + 13}
              y={card.y + 23}
              textAnchor="middle"
              fontSize="16"
            >
              {card.emoji}
            </text>
          )}
          {!card.flipped && (
            <text
              x={card.x + 13}
              y={card.y + 22}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#e4e4e7"
            >
              ?
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
