/* ────────────────────────────────────────────
   Elite Progress — persistence layer

   Uses localStorage now, ready for Supabase later.
   All functions are client-side only.
   ──────────────────────────────────────────── */

const STORAGE_KEY = "elite_progress";

export interface EliteProgress {
  /** Lesson IDs the user has completed */
  completedLessons: string[];
  /** Quiz scores: lessonId → percentage (0-100) */
  quizScores: Record<string, number>;
  /** Checklist items checked per lesson: lessonId → item indices */
  checklists: Record<string, number[]>;
  /** Prep sheets saved (date string → data) */
  preps: Record<string, PrepData>;
  /** Trade journal entries */
  trades: TradeEntry[];
  /** Current streak (consecutive days with activity) */
  streak: number;
  /** Last activity date (ISO string, date only) */
  lastActivityDate: string | null;
  /** Best streak ever */
  bestStreak: number;
}

export interface PrepData {
  bias: "bullish" | "bearish";
  biasReason: string;
  keyLevels: string;
  plan: string;
  emotional: number;
  date: string;
}

export interface TradeEntry {
  id: string;
  date: string;
  direction: "long" | "short";
  entry: string;
  sl: string;
  tp: string;
  result: "win" | "loss" | "be";
  rr: string;
  followedPlan: boolean;
  emotionalAfter: number;
  notes: string;
}

function getDefaultProgress(): EliteProgress {
  return {
    completedLessons: [],
    quizScores: {},
    checklists: {},
    preps: {},
    trades: [],
    streak: 0,
    lastActivityDate: null,
    bestStreak: 0,
  };
}

/** Load progress from localStorage */
export function loadProgress(): EliteProgress {
  if (typeof window === "undefined") return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return { ...getDefaultProgress(), ...JSON.parse(raw) };
  } catch {
    return getDefaultProgress();
  }
}

/** Save progress to localStorage */
export function saveProgress(progress: EliteProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable
  }
}

/** Get today's date string in BR timezone */
function todayBR(): string {
  const now = new Date();
  // Approximate BR time
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

/** Update streak based on activity */
function updateStreak(progress: EliteProgress): EliteProgress {
  const today = todayBR();
  const yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (progress.lastActivityDate === today) {
    return progress; // already counted today
  }

  let newStreak: number;
  if (progress.lastActivityDate === yesterday) {
    newStreak = progress.streak + 1;
  } else if (!progress.lastActivityDate) {
    newStreak = 1;
  } else {
    newStreak = 1; // streak broken
  }

  return {
    ...progress,
    streak: newStreak,
    bestStreak: Math.max(progress.bestStreak, newStreak),
    lastActivityDate: today,
  };
}

/* ── Action helpers ── */

export function completeLesson(lessonId: string): EliteProgress {
  const p = loadProgress();
  if (p.completedLessons.includes(lessonId)) return p;
  const updated = updateStreak({
    ...p,
    completedLessons: [...p.completedLessons, lessonId],
  });
  saveProgress(updated);
  return updated;
}

export function saveQuizScore(lessonId: string, score: number): EliteProgress {
  const p = loadProgress();
  const existing = p.quizScores[lessonId];
  // Keep best score
  if (existing !== undefined && existing >= score) return p;
  const updated = updateStreak({
    ...p,
    quizScores: { ...p.quizScores, [lessonId]: score },
  });
  saveProgress(updated);
  return updated;
}

export function saveChecklist(lessonId: string, checked: number[]): EliteProgress {
  const p = loadProgress();
  const updated = {
    ...p,
    checklists: { ...p.checklists, [lessonId]: checked },
  };
  saveProgress(updated);
  return updated;
}

export function savePrep(data: Omit<PrepData, "date">): EliteProgress {
  const p = loadProgress();
  const today = todayBR();
  const updated = updateStreak({
    ...p,
    preps: { ...p.preps, [today]: { ...data, date: today } },
  });
  saveProgress(updated);
  return updated;
}

export function saveTrade(data: Omit<TradeEntry, "id" | "date">): EliteProgress {
  const p = loadProgress();
  const entry: TradeEntry = {
    ...data,
    id: `trade_${Date.now()}`,
    date: todayBR(),
  };
  const updated = updateStreak({
    ...p,
    trades: [...p.trades, entry],
  });
  saveProgress(updated);
  return updated;
}

/** Compute stats from progress */
export function computeStats(progress: EliteProgress) {
  const totalTrades = progress.trades.length;
  const wins = progress.trades.filter(t => t.result === "win").length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const prepsArray = Object.values(progress.preps);
  const avgEmotional = prepsArray.length > 0
    ? prepsArray.reduce((sum, p) => sum + p.emotional, 0) / prepsArray.length
    : 0;

  const followedPlanTrades = progress.trades.filter(t => t.followedPlan).length;
  const disciplineRate = totalTrades > 0 ? Math.round((followedPlanTrades / totalTrades) * 100) : 0;

  return {
    lessonsCompleted: progress.completedLessons.length,
    totalTrades,
    winRate,
    avgEmotional,
    disciplineRate,
    streak: progress.streak,
    bestStreak: progress.bestStreak,
  };
}
