interface Props { width?: number; height?: number; className?: string; }

export default function DarkMageSVG({ width = 80, height = 110, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 110" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 지팡이 */}
      <line x1="68" y1="20" x2="60" y2="95" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/>
      {/* 지팡이 구슬 */}
      <circle cx="68" cy="18" r="7" fill="#8b5cf6"/>
      <circle cx="68" cy="18" r="4" fill="#c4b5fd"/>
      <circle cx="66" cy="16" r="1.5" fill="white" opacity="0.8"/>
      {/* 로브 (삼각형) */}
      <polygon points="40,45 12,100 68,100" fill="#1e1b4b"/>
      <polygon points="40,45 18,100 62,100" fill="#312e81"/>
      {/* 로브 장식 */}
      <line x1="40" y1="50" x2="40" y2="95" stroke="#6d28d9" strokeWidth="1.5"/>
      <line x1="30" y1="70" x2="50" y2="70" stroke="#6d28d9" strokeWidth="1"/>
      <line x1="26" y1="80" x2="54" y2="80" stroke="#6d28d9" strokeWidth="1"/>
      {/* 별/룬 문양 */}
      <path d="M 40,58 L 38,63 L 42,63 Z" fill="#c4b5fd" opacity="0.8"/>
      {/* 소매 */}
      <polygon points="18,55 12,75 30,65" fill="#1e1b4b"/>
      <polygon points="62,55 68,75 50,65" fill="#1e1b4b"/>
      {/* 손 */}
      <circle cx="13" cy="76" r="4" fill="#6b7280"/>
      {/* 머리 */}
      <ellipse cx="40" cy="32" rx="14" ry="16" fill="#4b5563"/>
      {/* 후드 */}
      <path d="M 26,32 Q 26,14 40,12 Q 54,14 54,32 L 50,38 Q 40,42 30,38 Z" fill="#1e1b4b"/>
      {/* 얼굴 */}
      <ellipse cx="40" cy="36" rx="10" ry="9" fill="#4b5563"/>
      {/* 눈 (빛나는) */}
      <ellipse cx="35" cy="35" rx="4" ry="3" fill="#7c3aed"/>
      <ellipse cx="45" cy="35" rx="4" ry="3" fill="#7c3aed"/>
      <circle cx="35" cy="35" r="2" fill="#c4b5fd"/>
      <circle cx="45" cy="35" r="2" fill="#c4b5fd"/>
      {/* 마법 파티클 */}
      <circle cx="20" cy="30" r="2" fill="#8b5cf6" opacity="0.6"/>
      <circle cx="58" cy="25" r="1.5" fill="#c4b5fd" opacity="0.7"/>
      <circle cx="15" cy="45" r="1.5" fill="#7c3aed" opacity="0.5"/>
    </svg>
  );
}
