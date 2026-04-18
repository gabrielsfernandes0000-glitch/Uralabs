"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initialLoadProgress,
  completeLesson,
  saveQuizScore,
  saveChecklist,
  savePrep,
  saveTrade,
  computeStats,
  loadCachedProgress,
  type EliteProgress,
  type PrepData,
  type TradeEntry,
} from "@/lib/progress";

/**
 * Hook to access and mutate Elite progress.
 * - Mount: renders from localStorage cache (sync) while fetching server (async).
 * - Mutations: optimistic local write, then POST; rebinds state on server reply.
 */
export function useProgress() {
  const [progress, setProgress] = useState<EliteProgress | null>(null);

  useEffect(() => {
    // Flash-free: start from cache, then reconcile with server.
    setProgress(loadCachedProgress());
    initialLoadProgress().then(setProgress).catch(() => {
      /* leave cache-only state */
    });
  }, []);

  const doCompleteLesson = useCallback(async (lessonId: string) => {
    setProgress((await completeLesson(lessonId)) ?? null);
  }, []);

  const doSaveQuizScore = useCallback(async (lessonId: string, score: number) => {
    setProgress((await saveQuizScore(lessonId, score)) ?? null);
  }, []);

  const doSaveChecklist = useCallback(async (lessonId: string, checked: number[]) => {
    setProgress((await saveChecklist(lessonId, checked)) ?? null);
  }, []);

  const doSavePrep = useCallback(async (data: Omit<PrepData, "date">) => {
    setProgress((await savePrep(data)) ?? null);
  }, []);

  const doSaveTrade = useCallback(async (data: Omit<TradeEntry, "id" | "date">) => {
    setProgress((await saveTrade(data)) ?? null);
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
