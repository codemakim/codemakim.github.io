interface Props { width?: number; height?: number; className?: string; }

export default function MushroomSVG({ width = 80, height = 100, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 기둥 */}
      <rect x="28" y="60" width="24" height="36" fill="#fef3c7" rx="4"/>
      <rect x="31" y="62" width="18" height="32" fill="#fef9c3" rx="3"/>
      {/* 주름 */}
      <line x1="34" y1="64" x2="34" y2="90" stroke="#fde68a" strokeWidth="1.5"/>
      <line x1="40" y1="63" x2="40" y2="91" stroke="#fde68a" strokeWidth="1.5"/>
      <line x1="46" y1="64" x2="46" y2="90" stroke="#fde68a" strokeWidth="1.5"/>
      {/* 갓 (반원) */}
      <ellipse cx="40" cy="56" rx="36" ry="20" fill="#7c3aed"/>
      <path d="M 4,56 Q 40,20 76,56" fill="#9333ea"/>
      {/* 갓 위 표면 */}
      <ellipse cx="40" cy="52" rx="32" ry="14" fill="#9333ea"/>
      <ellipse cx="40" cy="50" rx="28" ry="11" fill="#a855f7"/>
      {/* 독 반점들 */}
      <circle cx="25" cy="48" r="5" fill="#fef9c3" opacity="0.9"/>
      <circle cx="40" cy="42" r="6" fill="#fef9c3" opacity="0.9"/>
      <circle cx="56" cy="47" r="5" fill="#fef9c3" opacity="0.9"/>
      <circle cx="32" cy="56" r="4" fill="#fef9c3" opacity="0.8"/>
      <circle cx="50" cy="55" r="4" fill="#fef9c3" opacity="0.8"/>
      {/* 독 눈 */}
      <circle cx="33" cy="62" r="4" fill="#1a1a2e"/>
      <circle cx="47" cy="62" r="4" fill="#1a1a2e"/>
      <circle cx="34" cy="61" r="1.5" fill="#86efac"/>
      <circle cx="48" cy="61" r="1.5" fill="#86efac"/>
      {/* 독 방울 */}
      <circle cx="15" cy="58" r="3" fill="#86efac" opacity="0.8"/>
      <circle cx="65" cy="58" r="3" fill="#86efac" opacity="0.8"/>
      <line x1="15" y1="61" x2="15" y2="68" stroke="#86efac" strokeWidth="2" opacity="0.7"/>
      <line x1="65" y1="61" x2="65" y2="68" stroke="#86efac" strokeWidth="2" opacity="0.7"/>
    </svg>
  );
}
