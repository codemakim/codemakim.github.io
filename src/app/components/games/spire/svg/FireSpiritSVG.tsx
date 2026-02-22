interface Props { width?: number; height?: number; className?: string; }

export default function FireSpiritSVG({ width = 80, height = 110, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 110" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 바깥 불꽃 */}
      <path d="M 40,5 Q 60,20 62,45 Q 68,65 55,82 Q 50,92 40,95 Q 30,92 25,82 Q 12,65 18,45 Q 20,20 40,5 Z" fill="#f97316"/>
      {/* 중간 불꽃 */}
      <path d="M 40,15 Q 55,28 56,50 Q 60,68 50,80 Q 46,88 40,90 Q 34,88 30,80 Q 20,68 24,50 Q 25,28 40,15 Z" fill="#fb923c"/>
      {/* 코어 */}
      <path d="M 40,25 Q 50,38 50,55 Q 52,68 44,76 Q 42,80 40,80 Q 38,80 36,76 Q 28,68 30,55 Q 30,38 40,25 Z" fill="#fde68a"/>
      {/* 눈 */}
      <ellipse cx="33" cy="55" rx="6" ry="7" fill="#111827"/>
      <ellipse cx="47" cy="55" rx="6" ry="7" fill="#111827"/>
      <circle cx="34" cy="54" r="2.5" fill="#fde68a"/>
      <circle cx="48" cy="54" r="2.5" fill="#fde68a"/>
      {/* 불꽃 팔 */}
      <path d="M 18,45 Q 8,50 6,60 Q 8,68 15,65 Q 18,56 22,52" fill="#f97316"/>
      <path d="M 62,45 Q 72,50 74,60 Q 72,68 65,65 Q 62,56 58,52" fill="#f97316"/>
      {/* 파티클 불꽃 */}
      <path d="M 28,12 Q 25,5 30,2 Q 28,8 32,10 Z" fill="#fbbf24" opacity="0.8"/>
      <path d="M 52,8 Q 55,2 58,5 Q 54,7 54,12 Z" fill="#fbbf24" opacity="0.8"/>
      <path d="M 15,28 Q 10,22 14,18 Q 14,24 18,26 Z" fill="#fb923c" opacity="0.7"/>
      <path d="M 65,28 Q 70,22 66,18 Q 66,24 62,26 Z" fill="#fb923c" opacity="0.7"/>
    </svg>
  );
}
