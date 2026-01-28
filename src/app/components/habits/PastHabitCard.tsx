"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { supabase } from "@/app/lib/supabase";
import {
  formatDateKorean,
  formatDateToYYYYMMDD,
  compareDateStrings,
} from "@/app/lib/dateUtils";
import { calculateHabitStats } from "@/app/lib/utils/habitStats";
import type { Habit, HabitStats } from "./types";

interface PastHabitCardProps {
  habit: Habit;
}

export default function PastHabitCard({ habit }: PastHabitCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAndCalculateStats = async () => {
      setLoading(true);
      try {
        // 습관 기간 내 모든 기록 가져오기
        const { data: recordsData, error: recordsError } = await supabase
          .from("habit_records")
          .select("date, completed")
          .eq("habit_id", habit.id)
          .gte("date", habit.start_date)
          .lte("date", habit.end_date)
          .order("date", { ascending: false });

        if (recordsError) {
          throw recordsError;
        }

        // 통계 계산 (현재 연속 달성 일수 제외)
        const calculatedStats = calculateHabitStats(
          habit,
          recordsData || [],
          false, // includeCurrentStreak = false
        );

        setStats(calculatedStats);
      } catch (err: any) {
        console.error("통계 계산 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateStats();
  }, [user, habit]);

  // 기간이 지난 습관인지 여부 (완료 라벨 표시용)
  const isCompletedHabit = (() => {
    const todayStr = formatDateToYYYYMMDD(new Date());
    return compareDateStrings(habit.end_date, todayStr) < 0;
  })();

  return (
    <div
      className="card p-4 min-h-[120px] cursor-pointer group hover:shadow-lg transition-shadow"
      style={{ borderLeft: `4px solid ${habit.color}` }}
      onClick={() => router.push(`/habits/detail?id=${habit.id}`)}
    >
      {isCompletedHabit && (
        <div className="mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            완료
          </span>
        </div>
      )}
      <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white line-clamp-2">
        {habit.title}
      </h3>
      {habit.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
          {habit.description}
        </p>
      )}
      {loading ? (
        <div className="text-xs text-zinc-500 dark:text-zinc-500">
          통계 계산 중...
        </div>
      ) : stats ? (
        <div className="space-y-1">
          {/* 달성률 | 최대 연속 */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-900 dark:text-white font-medium">
              달성률: {stats.completionRate}%
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">|</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              최대 연속: {stats.maxStreak}일
            </span>
          </div>
          {/* 완료 일수 / 총 일수 */}
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {stats.completedDays}일 / {stats.totalDays}일 완료
          </div>
          {/* 기간 */}
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {formatDateKorean(habit.start_date)} ~{" "}
            {formatDateKorean(habit.end_date)}
          </div>
        </div>
      ) : (
        <div className="text-xs text-zinc-500 dark:text-zinc-500">
          {formatDateKorean(habit.start_date)} ~{" "}
          {formatDateKorean(habit.end_date)}
        </div>
      )}
    </div>
  );
}
