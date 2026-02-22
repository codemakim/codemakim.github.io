interface Props { width?: number; height?: number; className?: string; }

export default function GoblinSVG({ width = 80, height = 100, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 귀 (삼각형) */}
      <polygon points="14,28 22,18 26,34" fill="#65a30d"/>
      <polygon points="54,28 58,18 66,34" fill="#65a30d"/>
      {/* 귀 안쪽 */}
      <polygon points="16,28 22,21 24,32" fill="#a3e635"/>
      <polygon points="56,28 58,21 64,32" fill="#a3e635"/>
      {/* 머리 */}
      <ellipse cx="40" cy="36" rx="22" ry="20" fill="#84cc16"/>
      {/* 얼굴 */}
      <ellipse cx="40" cy="38" rx="18" ry="16" fill="#a3e635"/>
      {/* 눈 (사납게) */}
      <ellipse cx="33" cy="34" rx="5" ry="4" fill="#fef08a"/>
      <ellipse cx="47" cy="34" rx="5" ry="4" fill="#fef08a"/>
      <circle cx="34" cy="35" r="3" fill="#1a2e05"/>
      <circle cx="48" cy="35" r="3" fill="#1a2e05"/>
      <circle cx="35" cy="34" r="1" fill="white"/>
      <circle cx="49" cy="34" r="1" fill="white"/>
      {/* 눈썹 (사납게) */}
      <line x1="28" y1="30" x2="37" y2="32" stroke="#1a2e05" strokeWidth="2" strokeLinecap="round"/>
      <line x1="43" y1="32" x2="52" y2="30" stroke="#1a2e05" strokeWidth="2" strokeLinecap="round"/>
      {/* 코 */}
      <ellipse cx="40" cy="42" rx="4" ry="3" fill="#65a30d"/>
      {/* 이빨 */}
      <rect x="35" y="47" width="10" height="5" fill="#1a2e05" rx="1"/>
      <rect x="37" y="48" width="3" height="5" fill="#fef9c3" rx="1"/>
      <rect x="40" y="48" width="3" height="4" fill="#fef9c3" rx="1"/>
      {/* 몸통 */}
      <rect x="26" y="55" width="28" height="28" fill="#65a30d" rx="4"/>
      <rect x="30" y="57" width="20" height="24" fill="#84cc16" rx="2"/>
      {/* 허리띠 */}
      <rect x="26" y="68" width="28" height="5" fill="#78350f"/>
      <rect x="37" y="67" width="6" height="7" fill="#a16207" rx="1"/>
      {/* 팔 */}
      <rect x="12" y="55" width="14" height="8" fill="#84cc16" rx="3"/>
      <rect x="54" y="55" width="14" height="8" fill="#84cc16" rx="3"/>
      {/* 손 (무기) */}
      <rect x="8" y="60" width="10" height="3" fill="#94a3b8" rx="1"/>
      <rect x="12" y="56" width="3" height="10" fill="#94a3b8" rx="1"/>
      {/* 다리 */}
      <rect x="28" y="83" width="10" height="14" fill="#65a30d" rx="2"/>
      <rect x="42" y="83" width="10" height="14" fill="#65a30d" rx="2"/>
    </svg>
  );
}
