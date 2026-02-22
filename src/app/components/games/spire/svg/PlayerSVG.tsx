interface Props { width?: number; height?: number; className?: string; }

export default function PlayerSVG({ width = 80, height = 110, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 110" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 검 */}
      <line x1="63" y1="28" x2="72" y2="65" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
      <rect x="59" y="26" width="9" height="3" fill="#94a3b8" rx="1"/>
      <rect x="63" y="24" width="3" height="5" fill="#cbd5e1" rx="1"/>
      {/* 방패 */}
      <path d="M 10,52 L 10,76 Q 10,80 18,84 Q 26,80 26,76 L 26,52 Z" fill="#1d4ed8"/>
      <line x1="18" y1="52" x2="18" y2="84" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="10" y1="66" x2="26" y2="66" stroke="#60a5fa" strokeWidth="1.5"/>
      {/* 몸통 */}
      <polygon points="40,48 20,90 60,90" fill="#2563eb"/>
      <rect x="34" y="66" width="12" height="6" fill="#1d4ed8" rx="1"/>
      {/* 갑옷 장식 */}
      <polygon points="40,48 32,60 48,60" fill="#3b82f6"/>
      {/* 머리 */}
      <circle cx="40" cy="36" r="13" fill="#fde68a"/>
      {/* 투구 */}
      <path d="M 27,36 Q 27,18 40,18 Q 53,18 53,36" fill="#1d4ed8"/>
      <rect x="35" y="18" width="10" height="4" fill="#2563eb"/>
      {/* 눈 */}
      <circle cx="36" cy="38" r="2" fill="#1e3a5f"/>
      <circle cx="44" cy="38" r="2" fill="#1e3a5f"/>
      {/* 다리 */}
      <rect x="24" y="90" width="14" height="14" fill="#1d4ed8" rx="2"/>
      <rect x="42" y="90" width="14" height="14" fill="#1d4ed8" rx="2"/>
      <rect x="24" y="100" width="14" height="4" fill="#1e40af" rx="1"/>
      <rect x="42" y="100" width="14" height="4" fill="#1e40af" rx="1"/>
    </svg>
  );
}
