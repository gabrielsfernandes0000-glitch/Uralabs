"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initialLoadProgress,
  completeLesson,
  saveQuizScore,
  saveChecklist,
  savePrep,
  saveTrade,
  importTrades,
  deleteTradeEntry,
  updateTradeEntry,
  saveWeeklyReview,
  saveGoal,
  deleteGoal,
  saveAccountBalance,
  completeOnboarding,
  completeTour,
  resetTour,
  computeStats,
  loadCachedProgress,
  type EliteProgress,
  type PrepData,
  type TradeEntry,
  type WeeklyReview,
  type Goal,
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

  const doImportTrades = useCallback(async (
    incoming: Array<Omit<TradeEntry, "id"> & { date: string }>,
  ) => {
    const result = await importTrades(incoming);
    setProgress(result.progress);
    return { imported: result.imported, skipped: result.skipped };
  }, []);

  const doDeleteTrade = useCallback(async (tradeId: string) => {
    setProgress((await deleteTradeEntry(tradeId)) ?? null);
  }, []);

  const doUpdateTrade = useCallback(async (tradeId: string, patch: Partial<Omit<TradeEntry, "id" | "date">>) => {
    setProgress((await updateTradeEntry(tradeId, patch)) ?? null);
  }, []);

  const doSaveReview = useCallback(async (review: WeeklyReview) => {
    setProgress((await saveWeeklyReview(review)) ?? null);
  }, []);

  const doSaveGoal = useCallback(async (goal: Goal) => {
    setProgress((await saveGoal(goal)) ?? null);
  }, []);

  const doDeleteGoal = useCallback(async (goalId: string) => {
    setProgress((await deleteGoal(goalId)) ?? null);
  }, []);

  const doSaveBalance = useCallback(async (balance: number | null) => {
    setProgress((await saveAccountBalance(balance)) ?? null);
  }, []);

  const doCompleteOnboarding = useCallback(async () => {
    setProgress((await completeOnboarding()) ?? null);
  }, []);

  const doCompleteTour = useCallback(async () => {
    setProgress((await completeTour()) ?? null);
  }, []);

  const doResetTour = useCallback(async () => {
    setProgress((await resetTour()) ?? null);
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
    importTrades: doImportTrades,
    deleteTrade: doDeleteTrade,
    updateTrade: doUpdateTrade,
    saveReview: doSaveReview,
    saveGoal: doSaveGoal,
    deleteGoal: doDeleteGoal,
    saveAccountBalance: doSaveBalance,
    completeOnboarding: doCompleteOnboarding,
    completeTour: doCompleteTour,
    resetTour: doResetTour,
  };
}
