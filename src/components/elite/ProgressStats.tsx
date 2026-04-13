"use client";

import { useProgress } from "@/hooks/useProgress";

/**
 * Client component that renders live progress stats from localStorage.
 * Used by server components (Dashboard) that can't call useProgress directly.
 */
export function ProgressStats({ totalLessons }: { totalLessons: number }) {
  const { stats } = useProgress();

  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const streak = stats?.streak ?? 0;
  const progress = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  return { lessonsCompleted, streak, progress };
}

/** Inline stat number — replaces hardcoded 0 */
export function LiveStat({ type, totalLessons }: { type: "lessons" | "streak" | "progress"; totalLessons?: number }) {
  const { stats } = useProgress();
  if (!stats) return <span>0</span>;

  switch (type) {
    case "lessons": return <>{stats.lessonsCompleted}</>;
    case "streak": return <>{stats.streak}</>;
    case "progress": return <>{totalLessons ? Math.round((stats.lessonsCompleted / totalLessons) * 100) : 0}%</>;
  }
}
