interface Props { width?: number; height?: number; className?: string; }

export default function PlayerSVG({ width = 80, height = 110, className }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 110"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 지면 그림자 */}
      <ellipse cx="40" cy="107" rx="19" ry="3.5" fill="rgba(0,0,0,0.22)"/>

      {/* === 방패 (왼팔 뒤, 먼저 그려서 뒤에 위치) === */}
      <ellipse cx="11" cy="75" rx="9" ry="11" fill="#4E342E" stroke="#1A1A2E" strokeWidth="1.5"/>
      <ellipse cx="11" cy="75" rx="7" ry="9" fill="#6D4C41"/>
      <circle cx="11" cy="75" r="3.5" fill="#F9A825"/>
      <circle cx="11" cy="75" r="2" fill="#FFD54F"/>
      <line x1="11" y1="66" x2="11" y2="84" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="75" x2="19" y2="75" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round"/>

      {/* === 다리 === */}
      <rect x="24" y="78" width="13" height="22" fill="#5D4037" rx="3" stroke="#1A1A2E" strokeWidth="1.5"/>
      <rect x="26" y="80" width="5" height="18" fill="#6D4C41" rx="2"/>
      <rect x="43" y="78" width="13" height="22" fill="#5D4037" rx="3" stroke="#1A1A2E" strokeWidth="1.5"/>
      <rect x="49" y="80" width="5" height="18" fill="#6D4C41" rx="2"/>

      {/* 부츠 */}
      <rect x="22" y="96" width="16" height="11" fill="#2D1F14" rx="3" stroke="#1A1A2E" strokeWidth="1.5"/>
      <rect x="23" y="97" width="8" height="9" fill="#3E2723" rx="2"/>
      <rect x="42" y="96" width="16" height="11" fill="#2D1F14" rx="3" stroke="#1A1A2E" strokeWidth="1.5"/>
      <rect x="50" y="97" width="8" height="9" fill="#3E2723" rx="2"/>

      {/* === 몸통 갑옷 === */}
      <rect x="20" y="44" width="40" height="36" fill="#B71C1C" rx="5" stroke="#1A1A2E" strokeWidth="1.8"/>
      {/* 상단 하이라이트 패널 */}
      <rect x="22" y="46" width="36" height="12" fill="#C62828" rx="3"/>
      {/* 중앙 세로선 */}
      <rect x="38" y="44" width="4" height="36" fill="#9C1818" rx="2"/>
      {/* 갑옷 아치 장식 */}
      <path d="M 25 57 Q 40 53 55 57" stroke="#9C1818" strokeWidth="1.5" fill="none"/>
      {/* 리벳 */}
      <circle cx="28" cy="52" r="2.2" fill="#F9A825"/>
      <circle cx="52" cy="52" r="2.2" fill="#F9A825"/>
      <circle cx="28" cy="68" r="2.2" fill="#F9A825"/>
      <circle cx="52" cy="68" r="2.2" fill="#F9A825"/>

      {/* 허리띠 */}
      <rect x="20" y="75" width="40" height="7" fill="#4E342E" rx="2" stroke="#1A1A2E" strokeWidth="1.2"/>
      <rect x="36" y="73" width="8" height="10" fill="#5D4037" rx="2"/>
      <circle cx="40" cy="78" r="3.5" fill="#F9A825"/>
      <circle cx="40" cy="78" r="2" fill="#FFD54F"/>

      {/* === 왼팔 (방패 쪽) === */}
      <rect x="8" y="52" width="13" height="22" fill="#E8A57C" rx="5" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* 완장(완목 갑옷) */}
      <rect x="7" y="63" width="14" height="13" fill="#B71C1C" rx="3"/>
      <rect x="9" y="65" width="10" height="4" fill="#C62828" rx="2"/>

      {/* === 오른팔 (검 쪽) === */}
      <rect x="59" y="52" width="13" height="20" fill="#E8A57C" rx="5" stroke="#1A1A2E" strokeWidth="1.5"/>
      <rect x="58" y="62" width="14" height="12" fill="#B71C1C" rx="3"/>
      <rect x="60" y="64" width="10" height="4" fill="#C62828" rx="2"/>

      {/* === 검 (오른손) === */}
      {/* 검날 (사선 위쪽) */}
      <polygon points="63,57 68.5,57 75,7 69.5,7" fill="#78909C" stroke="#1A1A2E" strokeWidth="1.2"/>
      <polygon points="63,57 68.5,57 75,7" fill="#CFD8DC"/>
      {/* 검날 중앙 홈(풀러) */}
      <line x1="72.5" y1="9" x2="65.5" y2="56" stroke="#90A4AE" strokeWidth="1.8" strokeLinecap="round"/>
      {/* 날 끝 하이라이트 */}
      <line x1="75" y1="7" x2="68.5" y2="57" stroke="#ECEFF1" strokeWidth="0.8"/>
      {/* 가드(크로스가드) */}
      <rect x="60" y="55" width="18" height="5" fill="#F9A825" rx="2" stroke="#1A1A2E" strokeWidth="1.2"/>
      <rect x="61" y="55.5" width="16" height="4" fill="#FFD54F" rx="1.5"/>
      {/* 그립 */}
      <rect x="63" y="59" width="6" height="14" fill="#3E2723" rx="2" stroke="#1A1A2E" strokeWidth="1"/>
      <line x1="63" y1="62" x2="69" y2="62" stroke="#5D4037" strokeWidth="1.2"/>
      <line x1="63" y1="65" x2="69" y2="65" stroke="#5D4037" strokeWidth="1.2"/>
      <line x1="63" y1="68" x2="69" y2="68" stroke="#5D4037" strokeWidth="1.2"/>
      <line x1="63" y1="71" x2="69" y2="71" stroke="#5D4037" strokeWidth="1.2"/>
      {/* 폼멜 */}
      <ellipse cx="66" cy="73" rx="5" ry="4" fill="#F9A825" stroke="#1A1A2E" strokeWidth="1"/>
      <ellipse cx="66" cy="73" rx="3.5" ry="2.5" fill="#FFD54F"/>

      {/* === 어깨 갑옷(폴드론) === */}
      <ellipse cx="17" cy="50" rx="11" ry="9" fill="#B71C1C" stroke="#1A1A2E" strokeWidth="1.5"/>
      <ellipse cx="17" cy="48" rx="9" ry="7" fill="#C62828"/>
      <path d="M 7 53 Q 17 57 27 53" stroke="#9C1818" strokeWidth="1.5" fill="none"/>

      <ellipse cx="63" cy="50" rx="11" ry="9" fill="#B71C1C" stroke="#1A1A2E" strokeWidth="1.5"/>
      <ellipse cx="63" cy="48" rx="9" ry="7" fill="#C62828"/>
      <path d="M 53 53 Q 63 57 73 53" stroke="#9C1818" strokeWidth="1.5" fill="none"/>

      {/* === 목 + 목 보호대 === */}
      <rect x="34" y="37" width="12" height="9" fill="#E8A57C" rx="3"/>
      <rect x="31" y="41" width="18" height="5" fill="#B71C1C" rx="2" stroke="#1A1A2E" strokeWidth="1"/>

      {/* === 투구 === */}
      {/* 투구 본체 */}
      <ellipse cx="40" cy="22" rx="19" ry="17" fill="#455A64" stroke="#1A1A2E" strokeWidth="2"/>
      <ellipse cx="40" cy="18" rx="17" ry="14" fill="#546E7A"/>
      {/* 투구 크레스트 (붉은 능선) */}
      <rect x="38" y="3" width="4" height="22" fill="#B71C1C" rx="2"/>
      <rect x="38.5" y="4" width="3" height="20" fill="#D32F2F" rx="1.5"/>
      {/* 투구 챙 */}
      <rect x="22" y="24" width="36" height="4.5" fill="#37474F" rx="1.5"/>
      {/* 볼 가드 */}
      <rect x="22" y="27" width="8" height="14" fill="#455A64" rx="2"/>
      <rect x="50" y="27" width="8" height="14" fill="#455A64" rx="2"/>
      {/* 투구 챙 리벳 */}
      <circle cx="27" cy="26" r="1.5" fill="#78909C"/>
      <circle cx="40" cy="26" r="1.5" fill="#78909C"/>
      <circle cx="53" cy="26" r="1.5" fill="#78909C"/>

      {/* === 얼굴 === */}
      <rect x="29" y="24" width="22" height="18" fill="#E8A57C" rx="3"/>
      {/* 이마 그림자 */}
      <rect x="29" y="24" width="22" height="5" fill="#D4956A" rx="2"/>

      {/* 눈 */}
      <ellipse cx="35" cy="30" rx="3.5" ry="3" fill="#FFF9C4"/>
      <ellipse cx="45" cy="30" rx="3.5" ry="3" fill="#FFF9C4"/>
      <circle cx="35.8" cy="30.5" r="2.5" fill="#1A1A2E"/>
      <circle cx="45.8" cy="30.5" r="2.5" fill="#1A1A2E"/>
      <circle cx="36.8" cy="29.5" r="0.9" fill="white"/>
      <circle cx="46.8" cy="29.5" r="0.9" fill="white"/>

      {/* 눈썹 (단호한 표정) */}
      <path d="M31 26.5 Q35 25 38.5 26" stroke="#2D1F14" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M41.5 26 Q45 25 49 26.5" stroke="#2D1F14" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* 코 */}
      <path d="M38.5 33 L37 36 L43 36" stroke="#C4845A" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

      {/* 입 (다부진 표정) */}
      <path d="M33 39 Q40 41.5 45 39" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* 전투 흉터 (왼쪽 볼) */}
      <path d="M32 28 L34 33" stroke="#C4845A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
