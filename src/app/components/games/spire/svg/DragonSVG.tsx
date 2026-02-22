interface Props { width?: number; height?: number; className?: string; }

export default function DragonSVG({ width = 110, height = 120, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 110 120" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 날개 왼쪽 */}
      <path d="M 40,45 Q 10,25 4,55 Q 8,75 25,68 Q 32,56 38,52" fill="#7f1d1d"/>
      <path d="M 40,45 Q 15,35 12,58 Q 15,72 26,66 Q 32,56 38,52" fill="#991b1b"/>
      {/* 날개 오른쪽 */}
      <path d="M 70,45 Q 100,25 106,55 Q 102,75 85,68 Q 78,56 72,52" fill="#7f1d1d"/>
      <path d="M 70,45 Q 95,35 98,58 Q 95,72 84,66 Q 78,56 72,52" fill="#991b1b"/>
      {/* 꼬리 */}
      <path d="M 55,90 Q 80,95 95,85 Q 105,78 100,72 Q 92,76 85,80 Q 72,88 55,88" fill="#7f1d1d"/>
      <path d="M 55,88 Q 78,92 92,82 Q 98,77 94,73 Q 88,77 82,80 Q 70,86 55,86" fill="#b91c1c"/>
      {/* 꼬리 가시 */}
      <polygon points="93,74 100,68 96,77" fill="#dc2626"/>
      {/* 몸통 */}
      <ellipse cx="55" cy="70" rx="22" ry="30" fill="#991b1b"/>
      <ellipse cx="55" cy="68" rx="18" ry="26" fill="#b91c1c"/>
      {/* 비늘 패턴 */}
      <path d="M 42,55 Q 55,50 68,55" stroke="#7f1d1d" strokeWidth="2" fill="none"/>
      <path d="M 40,63 Q 55,58 70,63" stroke="#7f1d1d" strokeWidth="2" fill="none"/>
      <path d="M 40,71 Q 55,66 70,71" stroke="#7f1d1d" strokeWidth="2" fill="none"/>
      {/* 배 */}
      <ellipse cx="55" cy="72" rx="12" ry="20" fill="#fca5a5" opacity="0.5"/>
      {/* 목 */}
      <ellipse cx="55" cy="42" rx="12" ry="16" fill="#991b1b"/>
      <ellipse cx="55" cy="40" rx="10" ry="13" fill="#b91c1c"/>
      {/* 머리 */}
      <ellipse cx="55" cy="22" rx="18" ry="16" fill="#991b1b"/>
      <ellipse cx="55" cy="21" rx="15" ry="13" fill="#b91c1c"/>
      {/* 뿔 */}
      <polygon points="46,10 44,2 50,12" fill="#7f1d1d"/>
      <polygon points="64,10 66,2 60,12" fill="#7f1d1d"/>
      {/* 눈 */}
      <ellipse cx="47" cy="20" rx="5" ry="5" fill="#111827"/>
      <ellipse cx="63" cy="20" rx="5" ry="5" fill="#111827"/>
      <ellipse cx="47" cy="20" rx="3" ry="3" fill="#fef08a"/>
      <ellipse cx="63" cy="20" rx="3" ry="3" fill="#fef08a"/>
      <ellipse cx="47" cy="20" rx="1.5" ry="2.5" fill="#111827"/>
      <ellipse cx="63" cy="20" rx="1.5" ry="2.5" fill="#111827"/>
      {/* 코 구멍 */}
      <ellipse cx="50" cy="27" rx="3" ry="2" fill="#7f1d1d"/>
      <ellipse cx="60" cy="27" rx="3" ry="2" fill="#7f1d1d"/>
      {/* 불꽃 */}
      <path d="M 55,30 Q 30,38 20,55 Q 18,62 25,60 Q 30,48 44,42 Q 50,38 55,32" fill="#f97316" opacity="0.8"/>
      <path d="M 55,30 Q 32,40 24,54 Q 22,60 28,58 Q 33,48 46,42 Q 52,38 55,32" fill="#fbbf24" opacity="0.7"/>
      {/* 발 */}
      <ellipse cx="40" cy="98" rx="10" ry="7" fill="#7f1d1d"/>
      <ellipse cx="70" cy="98" rx="10" ry="7" fill="#7f1d1d"/>
      {/* 발톱 */}
      <polygon points="33,97 30,105 36,100" fill="#991b1b"/>
      <polygon points="38,100 37,108 42,102" fill="#991b1b"/>
      <polygon points="63,100 61,108 66,102" fill="#991b1b"/>
      <polygon points="68,97 72,105 67,100" fill="#991b1b"/>
    </svg>
  );
}
