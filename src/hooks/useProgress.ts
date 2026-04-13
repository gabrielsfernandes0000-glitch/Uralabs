"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadProgress, saveProgress, completeLesson, saveQuizScore,
  saveChecklist, savePrep, saveTrade, computeStats,
  type EliteProgress, type PrepData, type TradeEntry,
} from "@/lib/progress";

/**
 * Hook to access and mutate Elite progress.
 * Loads from localStorage on mount, exposes action helpers.
 */
export function useProgress() {
  const [progress, setProgress] = useState<EliteProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const doCompleteLesson = useCallback((lessonId: string) => {
    setProgress(completeLesson(lessonId));
  }, []);

  const doSaveQuizScore = useCallback((lessonId: string, score: number) => {
    setProgress(saveQuizScore(lessonId, score));
  }, []);

  const doSaveChecklist = useCallback((lessonId: string, checked: number[]) => {
    setProgress(saveChecklist(lessonId, checked));
  }, []);

  const doSavePrep = useCallback((data: Omit<PrepData, "date">) => {
    setProgress(savePrep(data));
  }, []);

  const doSaveTrade = useCallback((data: Omit<TradeEntry, "id" | "date">) => {
    setProgress(saveTrade(data));
  }, []);

  const stats = progress ? computeStats(progress) : null;

  return {
    progress,
    stats,
    completedLessons: progress?.completedLessons ?? [],
    completeLesson: doCompleteLesson,
    saveQuizScore: doSaveQuizScore,
    saveChecklist: doSaveChecklist,
    savePrep: doSavePrep,
    saveTrade: doSaveTrade,
  };
}
