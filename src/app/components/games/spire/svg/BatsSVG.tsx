interface Props { width?: number; height?: number; className?: string; }

function Bat({ cx, cy, size = 1 }: { cx: number; cy: number; size?: number }) {
  const s = size;
  return (
    <g>
      {/* 날개 왼쪽 */}
      <path
        d={`M ${cx},${cy} Q ${cx - 18 * s},${cy - 10 * s} ${cx - 22 * s},${cy + 5 * s} Q ${cx - 10 * s},${cy + 8 * s} ${cx},${cy + 4 * s}`}
        fill="#6d28d9"
      />
      {/* 날개 오른쪽 */}
      <path
        d={`M ${cx},${cy} Q ${cx + 18 * s},${cy - 10 * s} ${cx + 22 * s},${cy + 5 * s} Q ${cx + 10 * s},${cy + 8 * s} ${cx},${cy + 4 * s}`}
        fill="#6d28d9"
      />
      {/* 몸통 */}
      <ellipse cx={cx} cy={cy + 3 * s} rx={5 * s} ry={4 * s} fill="#4c1d95"/>
      {/* 눈 */}
      <circle cx={cx - 2 * s} cy={cy + 1 * s} r={1.5 * s} fill="#fbbf24"/>
      <circle cx={cx + 2 * s} cy={cy + 1 * s} r={1.5 * s} fill="#fbbf24"/>
      {/* 귀 */}
      <polygon points={`${cx - 3 * s},${cy - 2 * s} ${cx - 6 * s},${cy - 9 * s} ${cx},${cy - 2 * s}`} fill="#4c1d95"/>
      <polygon points={`${cx + 3 * s},${cy - 2 * s} ${cx + 6 * s},${cy - 9 * s} ${cx},${cy - 2 * s}`} fill="#4c1d95"/>
    </g>
  );
}

export default function BatsSVG({ width = 80, height = 80, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <Bat cx={18} cy={60} size={0.7} />
      <Bat cx={62} cy={55} size={0.7} />
      <Bat cx={40} cy={35} size={1} />
    </svg>
  );
}
