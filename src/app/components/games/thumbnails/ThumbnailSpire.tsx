export default function ThumbnailSpire() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {/* 배경 */}
      <rect width="120" height="120" fill="#0f0a1e" rx="8"/>
      {/* 탑 실루엣 */}
      <polygon points="60,8 40,110 80,110" fill="#1e1b4b" opacity="0.8"/>
      <rect x="46" y="60" width="28" height="50" fill="#1e1b4b"/>
      {/* 탑 창문 */}
      <rect x="55" y="70" width="10" height="14" fill="#7c3aed" opacity="0.8" rx="1"/>
      <rect x="55" y="88" width="10" height="12" fill="#6d28d9" opacity="0.6" rx="1"/>
      {/* 카드 (왼쪽) */}
      <rect x="8" y="35" width="28" height="40" fill="#1f1635" rx="4" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="22" y="53" textAnchor="middle" fontSize="14">⚔️</text>
      <text x="22" y="68" textAnchor="middle" fontSize="7" fill="#ef4444">공격</text>
      <circle cx="12" cy="39" r="5" fill="#eab308"/>
      <text x="12" y="42" textAnchor="middle" fontSize="7" fill="#111" fontWeight="bold">1</text>
      {/* 카드 (오른쪽) */}
      <rect x="84" y="35" width="28" height="40" fill="#1f1635" rx="4" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="98" y="53" textAnchor="middle" fontSize="14">🛡️</text>
      <text x="98" y="68" textAnchor="middle" fontSize="7" fill="#3b82f6">방어</text>
      <circle cx="88" cy="39" r="5" fill="#eab308"/>
      <text x="88" y="42" textAnchor="middle" fontSize="7" fill="#111" fontWeight="bold">1</text>
      {/* 별 */}
      <circle cx="60" cy="30" r="6" fill="#fbbf24" opacity="0.9"/>
      <circle cx="60" cy="30" r="3" fill="white" opacity="0.8"/>
      {/* 파티클 */}
      <circle cx="30" cy="20" r="2" fill="#7c3aed" opacity="0.7"/>
      <circle cx="90" cy="25" r="2" fill="#ef4444" opacity="0.7"/>
      <circle cx="20" cy="85" r="1.5" fill="#3b82f6" opacity="0.6"/>
      <circle cx="100" cy="80" r="1.5" fill="#22c55e" opacity="0.6"/>
    </svg>
  );
}
