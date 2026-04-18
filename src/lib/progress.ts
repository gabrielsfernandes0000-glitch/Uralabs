/* ────────────────────────────────────────────
   Elite Progress — server-authoritative + localStorage cache.

   Fluxo:
   - Primeiro load: tenta GET /api/progress. Se vazio, faz migração
     do localStorage (uma vez). Se offline, usa o cache local.
   - Mutações: aplicam ao cache local imediatamente (UI responde),
     depois POST /api/progress com patch. Se o servidor retornar
     estado novo, sobrescreve o cache local.

   O server-side fecha o cheat-gap das auto-distribute achievements:
   useProgress não é mais spoofable por dev tools.
   ──────────────────────────────────────────── */

const STORAGE_KEY = "elite_progress";
const MIGRATION_FLAG_KEY = "elite_progress_migrated";

export interface EliteProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  checklists: Record<string, number[]>;
  preps: Record<string, PrepData>;
  trades: TradeEntry[];
  streak: number;
  lastActivityDate: string | null;
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

export function loadCachedProgress(): EliteProgress {
  if (typeof window === "undefined") return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return { ...getDefaultProgress(), ...JSON.parse(raw) };
  } catch {
    return getDefaultProgress();
  }
}

function writeCache(progress: EliteProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* quota */
  }
}

function todayBR(): string {
  const now = new Date();
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

// ─── Server round-trips ──────────────────────────────────────────────────

async function fetchServerProgress(): Promise<EliteProgress | null> {
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return null;
    const { progress } = (await res.json()) as { progress: EliteProgress };
    return { ...getDefaultProgress(), ...progress };
  } catch {
    return null;
  }
}

async function pushPatch(patch: Partial<EliteProgress>): Promise<EliteProgress | null> {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ patch }),
    });
    if (!res.ok) return null;
    const { progress } = (await res.json()) as { progress: EliteProgress };
    return { ...getDefaultProgress(), ...progress };
  } catch {
    return null;
  }
}

/** Load: migra localStorage → server (uma vez), depois usa server como fonte.
 *  Cache local é atualizado pro próximo cold load sem flash. */
export async function initialLoadProgress(): Promise<EliteProgress> {
  if (typeof window === "undefined") return getDefaultProgress();

  const cached = loadCachedProgress();
  const server = await fetchServerProgress();
  if (!server) return cached; // offline / erro — usa cache

  const serverIsEmpty = server.completedLessons.length === 0 &&
                        Object.keys(server.quizScores).length === 0 &&
                        server.trades.length === 0;
  const cacheHasData = cached.completedLessons.length > 0 ||
                       Object.keys(cached.quizScores).length > 0 ||
                       cached.trades.length > 0;
  const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG_KEY) === "1";

  if (serverIsEmpty && cacheHasData && !alreadyMigrated) {
    // migra o cache local pro servidor (one-shot)
    const merged = await pushPatch({
      completedLessons: cached.completedLessons,
      quizScores: cached.quizScores,
      checklists: cached.checklists,
      preps: cached.preps,
      trades: cached.trades,
    });
    localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    if (merged) {
      writeCache(merged);
      return merged;
    }
  }

  writeCache(server);
  return server;
}

/** Completa uma lesson. Fire-and-forget pro server + cache otimista. */
export async function completeLesson(lessonId: string): Promise<EliteProgress> {
  const current = loadCachedProgress();
  if (current.completedLessons.includes(lessonId)) return current;
  const optimistic = {
    ...current,
    completedLessons: [...current.completedLessons, lessonId],
    lastActivityDate: todayBR(),
  };
  writeCache(optimistic);
  const server = await pushPatch({ completedLessons: optimistic.completedLessons });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function saveQuizScore(lessonId: string, score: number): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const existing = current.quizScores[lessonId];
  if (existing !== undefined && existing >= score) return current;
  const nextScores = { ...current.quizScores, [lessonId]: score };
  const optimistic = { ...current, quizScores: nextScores, lastActivityDate: todayBR() };
  writeCache(optimistic);
  const server = await pushPatch({ quizScores: nextScores });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function saveChecklist(lessonId: string, checked: number[]): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const nextChecklists = { ...current.checklists, [lessonId]: checked };
  const optimistic = { ...current, checklists: nextChecklists };
  writeCache(optimistic);
  const server = await pushPatch({ checklists: nextChecklists });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function savePrep(data: Omit<PrepData, "date">): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const today = todayBR();
  const nextPreps = { ...current.preps, [today]: { ...data, date: today } };
  const optimistic = { ...current, preps: nextPreps, lastActivityDate: today };
  writeCache(optimistic);
  const server = await pushPatch({ preps: nextPreps });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function saveTrade(data: Omit<TradeEntry, "id" | "date">): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const entry: TradeEntry = { ...data, id: `trade_${Date.now()}`, date: todayBR() };
  const nextTrades = [...current.trades, entry];
  const optimistic = { ...current, trades: nextTrades, lastActivityDate: entry.date };
  writeCache(optimistic);
  const server = await pushPatch({ trades: nextTrades });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export function computeStats(progress: EliteProgress) {
  const totalTrades = progress.trades.length;
  const wins = progress.trades.filter((t) => t.result === "win").length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const prepsArray = Object.values(progress.preps);
  const avgEmotional = prepsArray.length > 0
    ? prepsArray.reduce((sum, p) => sum + p.emotional, 0) / prepsArray.length
    : 0;

  const followedPlanTrades = progress.trades.filter((t) => t.followedPlan).length;
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

// ── Compat aliases pro import antigo ──
export const loadProgress = loadCachedProgress;
export function saveProgress(p: EliteProgress): void {
  writeCache(p);
}
