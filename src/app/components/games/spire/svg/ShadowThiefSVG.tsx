interface Props { width?: number; height?: number; className?: string; }

export default function ShadowThiefSVG({ width = 80, height = 110, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 110" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 그림자 후광 */}
      <ellipse cx="40" cy="60" rx="30" ry="45" fill="#111827" opacity="0.3"/>
      {/* 망토 */}
      <path d="M 20,48 Q 10,70 15,100 L 40,105 L 65,100 Q 70,70 60,48" fill="#1f2937"/>
      <path d="M 22,50 Q 14,72 18,98 L 40,102 L 62,98 Q 66,72 58,50" fill="#374151"/>
      {/* 망토 장식 */}
      <path d="M 40,50 L 38,100 L 40,102 L 42,100 Z" fill="#1f2937"/>
      {/* 몸통 */}
      <rect x="28" y="46" width="24" height="32" fill="#111827" rx="3"/>
      {/* 비수 */}
      <line x1="65" y1="42" x2="68" y2="72" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="62" y="40" width="6" height="3" fill="#6b7280" rx="1"/>
      <line x1="14" y1="48" x2="10" y2="72" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      <rect x="8" y="46" width="6" height="3" fill="#6b7280" rx="1"/>
      {/* 두건 */}
      <ellipse cx="40" cy="32" rx="16" ry="18" fill="#1f2937"/>
      <path d="M 24,32 Q 24,12 40,10 Q 56,12 56,32 Q 52,40 40,42 Q 28,40 24,32 Z" fill="#111827"/>
      {/* 얼굴 */}
      <ellipse cx="40" cy="34" rx="11" ry="10" fill="#1f2937"/>
      {/* 눈 (빨간) */}
      <ellipse cx="35" cy="33" rx="4" ry="3" fill="#1f2937"/>
      <ellipse cx="45" cy="33" rx="4" ry="3" fill="#1f2937"/>
      <circle cx="35" cy="33" r="2" fill="#ef4444"/>
      <circle cx="45" cy="33" r="2" fill="#ef4444"/>
      <circle cx="35" cy="32" r="0.8" fill="#fca5a5"/>
      <circle cx="45" cy="32" r="0.8" fill="#fca5a5"/>
      {/* 스카프 */}
      <rect x="28" y="40" width="24" height="8" fill="#374151" rx="2"/>
      {/* 다리 */}
      <rect x="30" y="78" width="9" height="26" fill="#1f2937" rx="2"/>
      <rect x="41" y="78" width="9" height="26" fill="#1f2937" rx="2"/>
    </svg>
  );
}
