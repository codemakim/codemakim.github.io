/**
 * 날짜 문자열(YYYY-MM-DD)을 정수 시드로 변환.
 * 예: "2026-05-06" → 20260506
 */
function dateToSeed(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형태로 반환 (로컬 타임존 기준).
 * dateUtils의 정책과 일치 — Date 객체 비교 회피.
 */
export function todayYYYYMMDD(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 카드 배열에서 오늘의 카드 인덱스를 결정론적으로 선택.
 * 카드 0개면 -1 반환.
 *
 * 예시 I/O:
 *   pickCardIndex(5, "2026-05-06") === 20260506 % 5 === 1
 *   pickCardIndex(0, "2026-05-06") === -1
 */
export function pickCardIndex(cardCount: number, dateStr: string): number {
  if (cardCount <= 0) return -1;
  const seed = dateToSeed(dateStr);
  return seed % cardCount;
}
