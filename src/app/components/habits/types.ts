export type Habit = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  start_date: string;
  end_date: string;
  weekdays: number[];
  created_at: string;
};

export type HabitWithCompletion = Habit & {
  completed: boolean;
};

export type ViewMode = 'list' | 'calendar';

export interface HabitStats {
  totalDays: number; // 총 수행해야 하는 일수
  completedDays: number; // 완료한 일수
  completionRate: number; // 완료율 (0-100)
  currentStreak?: number; // 현재 연속 달성 일수 (선택사항)
  maxStreak: number; // 최대 연속 달성 일수
}

export interface HabitRecord {
  date: string;
  completed: boolean;
}

