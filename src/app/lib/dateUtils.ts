/**
 * 날짜 유틸리티 함수
 * 타임존 문제를 방지하기 위해 날짜 문자열(YYYY-MM-DD)을 직접 다룸
 */

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환 (로컬 시간대 기준)
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 형식의 문자열을 Date 객체로 변환 (로컬 시간대 기준, 자정)
 */
export function parseYYYYMMDD(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * YYYY-MM-DD 형식의 날짜 문자열을 한국어 형식으로 표시
 * 예: "2025-01-26" → "2025. 1. 26."
 */
export function formatDateKorean(dateStr: string): string {
  const date = parseYYYYMMDD(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

/**
 * 날짜 문자열 비교 (YYYY-MM-DD 형식)
 * @returns -1: date1 < date2, 0: date1 === date2, 1: date1 > date2
 */
export function compareDateStrings(date1: string, date2: string): number {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

