interface Props { width?: number; height?: number; className?: string; }

export default function GolemSVG({ width = 100, height = 120, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 120" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 몸통 (큰 사각형) */}
      <rect x="18" y="38" width="64" height="60" fill="#92400e" rx="6"/>
      <rect x="22" y="42" width="56" height="52" fill="#b45309" rx="4"/>
      {/* 균열 */}
      <path d="M 35,46 L 40,58 L 38,62 L 44,75" stroke="#78350f" strokeWidth="2" fill="none"/>
      <path d="M 60,48 L 56,60 L 60,68 L 58,80" stroke="#78350f" strokeWidth="2" fill="none"/>
      {/* 가슴 코어 (빛나는) */}
      <rect x="42" y="56" width="16" height="16" fill="#78350f" rx="3"/>
      <rect x="44" y="58" width="12" height="12" fill="#f97316" rx="2"/>
      <rect x="46" y="60" width="8" height="8" fill="#fed7aa" rx="1"/>
      <circle cx="50" cy="64" r="3" fill="white" opacity="0.8"/>
      {/* 어깨 */}
      <rect x="8" y="34" width="18" height="22" fill="#92400e" rx="4"/>
      <rect x="74" y="34" width="18" height="22" fill="#92400e" rx="4"/>
      {/* 팔 */}
      <rect x="6" y="54" width="14" height="30" fill="#b45309" rx="4"/>
      <rect x="80" y="54" width="14" height="30" fill="#b45309" rx="4"/>
      {/* 주먹 */}
      <rect x="4" y="82" width="18" height="14" fill="#92400e" rx="3"/>
      <rect x="78" y="82" width="18" height="14" fill="#92400e" rx="3"/>
      {/* 머리 */}
      <rect x="24" y="10" width="52" height="32" fill="#92400e" rx="8"/>
      <rect x="28" y="14" width="44" height="26" fill="#b45309" rx="6"/>
      {/* 이마 균열 */}
      <path d="M 45,15 L 48,22 L 46,26" stroke="#78350f" strokeWidth="2" fill="none"/>
      {/* 눈 (빛나는 오렌지) */}
      <rect x="32" y="21" width="14" height="10" fill="#111827" rx="3"/>
      <rect x="54" y="21" width="14" height="10" fill="#111827" rx="3"/>
      <rect x="34" y="23" width="10" height="6" fill="#f97316" rx="2"/>
      <rect x="56" y="23" width="10" height="6" fill="#f97316" rx="2"/>
      <rect x="37" y="24" width="4" height="4" fill="#fed7aa" rx="1"/>
      <rect x="59" y="24" width="4" height="4" fill="#fed7aa" rx="1"/>
      {/* 다리 */}
      <rect x="26" y="98" width="20" height="18" fill="#92400e" rx="4"/>
      <rect x="54" y="98" width="20" height="18" fill="#92400e" rx="4"/>
      <rect x="26" y="112" width="20" height="6" fill="#78350f" rx="2"/>
      <rect x="54" y="112" width="20" height="6" fill="#78350f" rx="2"/>
    </svg>
  );
}
