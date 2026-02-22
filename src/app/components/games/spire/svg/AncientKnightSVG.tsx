interface Props { width?: number; height?: number; className?: string; }

export default function AncientKnightSVG({ width = 90, height = 120, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 90 120" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 대검 */}
      <rect x="70" y="15" width="5" height="60" fill="#94a3b8" rx="2"/>
      <rect x="64" y="30" width="17" height="4" fill="#94a3b8" rx="1"/>
      <rect x="71" y="12" width="4" height="8" fill="#cbd5e1" rx="1"/>
      {/* 큰 방패 */}
      <path d="M 10,38 L 10,80 Q 10,90 22,95 Q 34,90 34,80 L 34,38 Z" fill="#374151"/>
      <path d="M 14,40 L 14,78 Q 14,86 22,90 Q 30,86 30,78 L 30,40 Z" fill="#4b5563"/>
      {/* 방패 문양 */}
      <line x1="22" y1="42" x2="22" y2="88" stroke="#f59e0b" strokeWidth="2"/>
      <line x1="14" y1="64" x2="30" y2="64" stroke="#f59e0b" strokeWidth="2"/>
      <circle cx="22" cy="64" r="4" fill="#f59e0b"/>
      {/* 갑옷 몸통 */}
      <rect x="30" y="45" width="32" height="40" fill="#374151" rx="3"/>
      <rect x="33" y="47" width="26" height="36" fill="#4b5563" rx="2"/>
      {/* 갑옷 판 */}
      <rect x="33" y="50" width="26" height="8" fill="#6b7280" rx="1"/>
      <rect x="35" y="60" width="22" height="7" fill="#6b7280" rx="1"/>
      <rect x="35" y="69" width="22" height="7" fill="#6b7280" rx="1"/>
      {/* 투구 */}
      <rect x="28" y="24" width="36" height="24" fill="#374151" rx="4"/>
      <rect x="31" y="26" width="30" height="20" fill="#4b5563" rx="3"/>
      {/* 투구 볏 */}
      <rect x="38" y="16" width="16" height="12" fill="#374151" rx="2"/>
      <rect x="40" y="14" width="12" height="6" fill="#b45309" rx="2"/>
      {/* 눈 구멍 (빛나는) */}
      <rect x="35" y="31" width="8" height="5" fill="#111827" rx="2"/>
      <rect x="49" y="31" width="8" height="5" fill="#111827" rx="2"/>
      <rect x="36" y="32" width="6" height="3" fill="#f59e0b" rx="1" opacity="0.9"/>
      <rect x="50" y="32" width="6" height="3" fill="#f59e0b" rx="1" opacity="0.9"/>
      {/* 어깨 갑옷 */}
      <ellipse cx="30" cy="50" rx="9" ry="6" fill="#374151"/>
      <ellipse cx="62" cy="50" rx="9" ry="6" fill="#374151"/>
      {/* 팔 */}
      <rect x="20" y="52" width="10" height="26" fill="#4b5563" rx="3"/>
      <rect x="62" y="52" width="10" height="26" fill="#4b5563" rx="3"/>
      {/* 다리 */}
      <rect x="33" y="85" width="12" height="28" fill="#374151" rx="3"/>
      <rect x="47" y="85" width="12" height="28" fill="#374151" rx="3"/>
      <rect x="33" y="108" width="12" height="8" fill="#4b5563" rx="2"/>
      <rect x="47" y="108" width="12" height="8" fill="#4b5563" rx="2"/>
    </svg>
  );
}
