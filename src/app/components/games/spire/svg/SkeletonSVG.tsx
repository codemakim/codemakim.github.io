interface Props { width?: number; height?: number; className?: string; }

export default function SkeletonSVG({ width = 80, height = 110, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 110" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 두개골 */}
      <circle cx="40" cy="22" r="18" fill="#e5e7eb"/>
      <ellipse cx="40" cy="32" rx="12" ry="8" fill="#e5e7eb"/>
      {/* 눈 구멍 */}
      <ellipse cx="33" cy="20" rx="5" ry="6" fill="#111827"/>
      <ellipse cx="47" cy="20" rx="5" ry="6" fill="#111827"/>
      {/* 코 구멍 */}
      <ellipse cx="40" cy="28" rx="3" ry="2" fill="#374151"/>
      {/* 이빨 */}
      <rect x="32" y="33" width="16" height="6" fill="#111827" rx="1"/>
      <rect x="33" y="34" width="3" height="5" fill="#f3f4f6" rx="1"/>
      <rect x="37" y="34" width="3" height="6" fill="#f3f4f6" rx="1"/>
      <rect x="41" y="34" width="3" height="6" fill="#f3f4f6" rx="1"/>
      <rect x="45" y="34" width="3" height="5" fill="#f3f4f6" rx="1"/>
      {/* 척추 */}
      <rect x="38" y="40" width="4" height="28" fill="#d1d5db"/>
      <rect x="35" y="43" width="10" height="3" fill="#e5e7eb" rx="1"/>
      <rect x="35" y="50" width="10" height="3" fill="#e5e7eb" rx="1"/>
      <rect x="35" y="57" width="10" height="3" fill="#e5e7eb" rx="1"/>
      {/* 갈비뼈 */}
      <path d="M 38,44 Q 24,50 26,58" stroke="#d1d5db" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 38,50 Q 22,56 24,64" stroke="#d1d5db" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 42,44 Q 56,50 54,58" stroke="#d1d5db" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 42,50 Q 58,56 56,64" stroke="#d1d5db" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 골반 */}
      <ellipse cx="40" cy="70" rx="14" ry="7" fill="#e5e7eb"/>
      <ellipse cx="40" cy="70" rx="8" ry="4" fill="#d1d5db"/>
      {/* 왼팔 + 검 */}
      <rect x="18" y="42" width="4" height="22" fill="#d1d5db" rx="2"/>
      <rect x="18" y="64" width="4" height="4" fill="#e5e7eb" rx="1"/>
      <rect x="15" y="68" width="10" height="3" fill="#94a3b8" rx="1"/>
      <rect x="18" y="68" width="4" height="20" fill="#94a3b8" rx="1"/>
      {/* 오른팔 */}
      <rect x="58" y="42" width="4" height="22" fill="#d1d5db" rx="2"/>
      <rect x="58" y="64" width="4" height="4" fill="#e5e7eb" rx="1"/>
      {/* 다리 */}
      <rect x="30" y="77" width="6" height="28" fill="#d1d5db" rx="3"/>
      <rect x="44" y="77" width="6" height="28" fill="#d1d5db" rx="3"/>
      <rect x="27" y="102" width="12" height="6" fill="#e5e7eb" rx="2"/>
      <rect x="41" y="102" width="12" height="6" fill="#e5e7eb" rx="2"/>
    </svg>
  );
}
