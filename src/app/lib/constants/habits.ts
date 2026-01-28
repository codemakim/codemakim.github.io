/**
 * 습관 관련 상수 정의
 */

// 요일 레이블 (JavaScript Date.getDay()와 동일: 일요일=0, 월요일=1, ..., 토요일=6)
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// 요일 값 (일요일=0, 월요일=1, ..., 토요일=6)
export const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

// 색상 팔레트 (무채색 계열로 통일)
export const COLOR_PALETTE = [
  '#3B82F6', // 파란색
  '#10B981', // 초록색
  '#F59E0B', // 주황색
  '#EF4444', // 빨간색
  '#8B5CF6', // 보라색
  '#EC4899', // 분홍색
  '#06B6D4', // 청록색
  '#6366F1', // 인디고
  '#F97316', // 오렌지
  '#84CC16', // 라임
  '#14B8A6', // 티일
  '#A855F7', // 바이올렛
] as const;
