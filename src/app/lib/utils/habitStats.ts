import {
  parseYYYYMMDD,
  formatDateToYYYYMMDD,
  compareDateStrings,
} from '@/app/lib/dateUtils';
import type { Habit } from '@/app/components/habits/types';
import type { HabitStats, HabitRecord } from '@/app/components/habits/types';

/**
 * 습관 기간 내 수행해야 하는 총 일수를 계산합니다.
 * 요일 필터링을 적용하여 실제 수행해야 하는 날짜만 카운트합니다.
 */
export function calculateTotalDays(habit: Habit): { totalDays: number; dateSet: Set<string> } {
  const startDate = parseYYYYMMDD(habit.start_date);
  const endDate = parseYYYYMMDD(habit.end_date);
  let totalDays = 0;
  const dateSet = new Set<string>();

  // 날짜를 순회하면서 수행해야 하는 날짜 계산 (로컬 시간대 기준)
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const weekday = d.getDay();
    if (habit.weekdays.includes(weekday)) {
      const dateStr = formatDateToYYYYMMDD(d);
      dateSet.add(dateStr);
      totalDays++;
    }
  }

  return { totalDays, dateSet };
}

/**
 * 완료한 일수를 계산합니다.
 */
export function calculateCompletedDays(records: HabitRecord[]): number {
  return records.filter((r) => r.completed).length;
}

/**
 * 완료율을 계산합니다.
 */
export function calculateCompletionRate(completedDays: number, totalDays: number): number {
  return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
}

/**
 * 최대 연속 달성 일수를 계산합니다.
 */
export function calculateMaxStreak(
  dateSet: Set<string>,
  recordsMap: Map<string, boolean>
): number {
  const sortedDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  let maxStreak = 0;
  let tempStreak = 0;

  for (const dateStr of sortedDates) {
    const completed = recordsMap.get(dateStr);
    if (completed) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * 현재 연속 달성 일수를 계산합니다 (오늘부터 역순으로).
 */
export function calculateCurrentStreak(
  dateSet: Set<string>,
  recordsMap: Map<string, boolean>,
  today: string
): number {
  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  let currentStreak = 0;

  for (const dateStr of sortedDates) {
    if (compareDateStrings(dateStr, today) > 0) continue; // 미래 날짜는 제외
    const completed = recordsMap.get(dateStr);
    if (completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}

/**
 * 습관 통계를 계산합니다.
 * @param habit 습관 정보
 * @param records 습관 기록 배열
 * @param includeCurrentStreak 현재 연속 달성 일수 포함 여부 (기본값: false)
 * @returns 계산된 통계 정보
 */
export function calculateHabitStats(
  habit: Habit,
  records: HabitRecord[],
  includeCurrentStreak: boolean = false
): HabitStats {
  // 총 일수 계산
  const { totalDays, dateSet } = calculateTotalDays(habit);

  // 완료한 일수 계산
  const completedDays = calculateCompletedDays(records);

  // 완료율 계산
  const completionRate = calculateCompletionRate(completedDays, totalDays);

  // 기록 맵 생성
  const recordsMap = new Map<string, boolean>();
  records.forEach((record) => {
    recordsMap.set(record.date, record.completed);
  });

  // 최대 연속 달성 일수 계산
  const maxStreak = calculateMaxStreak(dateSet, recordsMap);

  // 현재 연속 달성 일수 계산 (필요한 경우만)
  const stats: HabitStats = {
    totalDays,
    completedDays,
    completionRate,
    maxStreak,
  };

  if (includeCurrentStreak) {
    const today = formatDateToYYYYMMDD(new Date());
    stats.currentStreak = calculateCurrentStreak(dateSet, recordsMap, today);
  }

  return stats;
}
