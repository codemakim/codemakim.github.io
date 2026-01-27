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

