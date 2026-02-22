interface Props { width?: number; height?: number; className?: string; }

export default function SlimeSVG({ width = 80, height = 80, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 몸통 (큰 타원) */}
      <ellipse cx="40" cy="52" rx="34" ry="26" fill="#4ade80"/>
      <ellipse cx="40" cy="50" rx="30" ry="22" fill="#86efac"/>
      {/* 표면 광택 */}
      <ellipse cx="30" cy="42" rx="8" ry="5" fill="#bbf7d0" opacity="0.6"/>
      {/* 눈 */}
      <circle cx="32" cy="50" r="6" fill="white"/>
      <circle cx="48" cy="50" r="6" fill="white"/>
      <circle cx="34" cy="52" r="3" fill="#166534"/>
      <circle cx="50" cy="52" r="3" fill="#166534"/>
      <circle cx="35" cy="51" r="1" fill="white"/>
      <circle cx="51" cy="51" r="1" fill="white"/>
      {/* 입 */}
      <path d="M 33,62 Q 40,68 47,62" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 촉수/발 */}
      <ellipse cx="18" cy="74" rx="8" ry="5" fill="#4ade80"/>
      <ellipse cx="40" cy="76" rx="8" ry="4" fill="#4ade80"/>
      <ellipse cx="62" cy="74" rx="8" ry="5" fill="#4ade80"/>
    </svg>
  );
}
