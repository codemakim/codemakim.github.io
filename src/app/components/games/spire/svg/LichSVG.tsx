interface Props { width?: number; height?: number; className?: string; }

export default function LichSVG({ width = 90, height = 120, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 90 120" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 지팡이 */}
      <line x1="72" y1="18" x2="65" y2="105" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round"/>
      {/* 지팡이 해골 */}
      <circle cx="72" cy="14" r="8" fill="#d1d5db"/>
      <ellipse cx="72" cy="18" rx="5" ry="4" fill="#d1d5db"/>
      <ellipse cx="70" cy="12" rx="2.5" ry="3" fill="#111827"/>
      <ellipse cx="74" cy="12" rx="2.5" ry="3" fill="#111827"/>
      <circle cx="71" cy="12" r="1" fill="#86efac"/>
      <circle cx="75" cy="12" r="1" fill="#86efac"/>
      <rect x="68" y="19" width="8" height="4" fill="#111827" rx="1"/>
      {/* 마법 오라 */}
      <circle cx="72" cy="14" r="12" fill="#7c3aed" opacity="0.15"/>
      {/* 로브 */}
      <path d="M 45,50 L 10,110 L 80,110 Z" fill="#1e1b4b"/>
      <path d="M 45,50 L 16,108 L 74,108 Z" fill="#2e1065"/>
      {/* 로브 문양 */}
      <line x1="45" y1="55" x2="45" y2="105" stroke="#7c3aed" strokeWidth="1.5" opacity="0.7"/>
      <path d="M 30,80 L 45,70 L 60,80" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* 두개골 머리 */}
      <circle cx="45" cy="26" r="18" fill="#d1d5db"/>
      <ellipse cx="45" cy="36" rx="12" ry="7" fill="#d1d5db"/>
      {/* 눈 구멍 (빛나는 초록) */}
      <ellipse cx="39" cy="24" rx="5" ry="6" fill="#111827"/>
      <ellipse cx="51" cy="24" rx="5" ry="6" fill="#111827"/>
      <circle cx="39" cy="24" r="3" fill="#4ade80"/>
      <circle cx="51" cy="24" r="3" fill="#4ade80"/>
      <circle cx="39" cy="23" r="1.5" fill="#bbf7d0"/>
      <circle cx="51" cy="23" r="1.5" fill="#bbf7d0"/>
      {/* 코 구멍 */}
      <ellipse cx="45" cy="31" rx="3" ry="2" fill="#374151"/>
      {/* 이빨 */}
      <rect x="37" y="35" width="16" height="5" fill="#111827" rx="1"/>
      <rect x="38" y="36" width="2" height="4" fill="#f3f4f6" rx="1"/>
      <rect x="41" y="36" width="2" height="5" fill="#f3f4f6" rx="1"/>
      <rect x="44" y="36" width="2" height="5" fill="#f3f4f6" rx="1"/>
      <rect x="47" y="36" width="2" height="4" fill="#f3f4f6" rx="1"/>
      <rect x="50" y="36" width="2" height="4" fill="#f3f4f6" rx="1"/>
      {/* 마법 파티클 */}
      <circle cx="20" cy="55" r="3" fill="#8b5cf6" opacity="0.6"/>
      <circle cx="68" cy="60" r="2" fill="#4ade80" opacity="0.7"/>
      <circle cx="15" cy="80" r="2" fill="#7c3aed" opacity="0.5"/>
    </svg>
  );
}
