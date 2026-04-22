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
  /** Weekly reviews — key = YYYY-Www (ISO week), value = reflexão semanal. */
  reviews?: Record<string, WeeklyReview>;
  /** Goals ativos por período. */
  goals?: Goal[];
  /** Saldo da conta — USD por default (opcional, usado em calculadora e metas futuras). */
  accountBalance?: number;
  /** Timestamp ISO de conclusão/pulo do wizard de onboarding. null = ainda não viu. */
  onboardingCompletedAt?: string | null;
  /** Timestamp ISO de conclusão/pulo do tour guiado do diário. null = ainda não viu. */
  tourCompletedAt?: string | null;
}

export interface WeeklyReview {
  weekKey: string;              // ex: "2026-W17"
  startDate: string;            // YYYY-MM-DD (segunda)
  endDate: string;              // YYYY-MM-DD (domingo)
  whatWorked: string;           // o que funcionou
  whatDrained: string;          // o que drenou / perdeu R
  recurringPattern: string;     // padrão recorrente detectado
  commitNext: string;           // commit pra próxima semana
  rating: number;               // 1-5 auto-avaliação
  createdAt: string;            // ISO timestamp
}

export interface Goal {
  id: string;
  createdAt: string;            // ISO
  period: "weekly" | "monthly";
  startDate: string;            // YYYY-MM-DD
  metric: "totalR" | "winRate" | "expectancy" | "disciplineRate" | "maxMistakes" | "trades";
  target: number;               // valor-alvo (ex: 5 pra +5R)
  /** Para "maxMistakes" — limite DE cima (≤). Outros metrics: piso (≥). */
  direction: "min" | "max";
  label?: string;               // rótulo custom opcional
  completed?: boolean;
}

export interface PrepData {
  bias: "bullish" | "bearish";
  biasReason: string;
  keyLevels: string;
  plan: string;
  emotional: number;
  date: string;
}

export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1";

export interface TradeEntry {
  id: string;
  date: string;                   // YYYY-MM-DD (BRT)
  direction: "long" | "short";
  /** Formato legado (texto). Novos trades preenchem as versões numéricas abaixo. */
  entry: string;
  sl: string;
  tp: string;
  /** Preços como number. Backward-compat: opcional. */
  entryNum?: number;
  stopNum?: number;
  targetNum?: number;
  /** Preço real de saída (diferente de TP se stopou antes ou saiu manual). */
  exitNum?: number;
  /** Qty/size/lot. Opcional. */
  size?: number;
  result: "win" | "loss" | "be";
  /** Legado — texto "1:3", "2.5", etc. parseRR em ui. */
  rr: string;
  /** R-multiple calculado, armazenado. Preferir sobre rr quando presente. */
  rMultiple?: number;
  /** Setup canonical id (URA_SETUPS) ou custom id do user. */
  setup?: string;
  /** Ticker/símbolo operado — "NQ", "ES", "BTCUSDT", etc. */
  symbol?: string;
  /** Timeframe da entrada. */
  timeframe?: Timeframe;
  /** Hora de abertura do trade em BRT — formato "HH:mm". Usado pro breakdown hour-of-day. */
  openTime?: string;
  /** Mistake tags — ids de MISTAKE_TAGS. */
  mistakes?: string[];
  /** Estado emocional pré-trade (1-5). */
  emotionalBefore?: number;
  followedPlan: boolean;
  emotionalAfter: number;
  notes: string;
  /** URL de screenshot no bucket (Supabase storage) — futuro. */
  screenshotUrl?: string;
  /** Para trades importados da corretora — dedupe. Formato: "exchangeId:orderId". */
  externalId?: string;
  /** Fonte do registro — importado de broker ou manual. */
  source?: "manual" | "broker_import";
  /** Exchange de origem quando source = broker_import. */
  importedFrom?: string;
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
      accountBalance: cached.accountBalance,
      onboardingCompletedAt: cached.onboardingCompletedAt,
    });
    localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    if (merged) {
      // Preserva campos locais que o server pode ter strippado
      const final = {
        ...merged,
        accountBalance: merged.accountBalance ?? cached.accountBalance,
        onboardingCompletedAt: merged.onboardingCompletedAt ?? cached.onboardingCompletedAt,
      };
      writeCache(final);
      return final;
    }
  }

  // Preserva campos locais (onboarding + balance + tour) se o server ainda não aceita
  // esses keys (edge function com whitelist) — evita flicker e re-abertura dos modais.
  const final = {
    ...server,
    accountBalance: server.accountBalance ?? cached.accountBalance,
    onboardingCompletedAt: server.onboardingCompletedAt ?? cached.onboardingCompletedAt,
    tourCompletedAt: server.tourCompletedAt ?? cached.tourCompletedAt,
  };
  writeCache(final);
  return final;
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

/**
 * Importação em massa — aceita trades com `date` explícito (pra CSV import
 * retroativo). Dedupe por `externalId`. Não sobrescreve trades existentes.
 */
export async function importTrades(
  incoming: Array<Omit<TradeEntry, "id"> & { date: string }>,
): Promise<{ progress: EliteProgress; imported: number; skipped: number }> {
  const current = loadCachedProgress();
  const existingIds = new Set(current.trades.map((t) => t.externalId).filter(Boolean) as string[]);
  let skipped = 0;

  const toAdd: TradeEntry[] = [];
  for (let i = 0; i < incoming.length; i++) {
    const t = incoming[i];
    if (t.externalId && existingIds.has(t.externalId)) {
      skipped++;
      continue;
    }
    toAdd.push({
      ...t,
      id: `trade_${Date.now()}_${i}`,
    });
    if (t.externalId) existingIds.add(t.externalId);
  }

  const nextTrades = [...current.trades, ...toAdd];
  const optimistic = { ...current, trades: nextTrades, lastActivityDate: todayBR() };
  writeCache(optimistic);
  const server = await pushPatch({ trades: nextTrades });
  if (server) writeCache(server);
  return { progress: server ?? optimistic, imported: toAdd.length, skipped };
}

export async function deleteTradeEntry(tradeId: string): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const nextTrades = current.trades.filter((t) => t.id !== tradeId);
  const optimistic = { ...current, trades: nextTrades };
  writeCache(optimistic);
  const server = await pushPatch({ trades: nextTrades });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function updateTradeEntry(tradeId: string, patch: Partial<Omit<TradeEntry, "id" | "date">>): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const nextTrades = current.trades.map((t) => (t.id === tradeId ? { ...t, ...patch } : t));
  const optimistic = { ...current, trades: nextTrades };
  writeCache(optimistic);
  const server = await pushPatch({ trades: nextTrades });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function saveWeeklyReview(review: WeeklyReview): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const nextReviews = { ...(current.reviews ?? {}), [review.weekKey]: review };
  const optimistic = { ...current, reviews: nextReviews, lastActivityDate: todayBR() };
  writeCache(optimistic);
  const server = await pushPatch({ reviews: nextReviews });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function saveGoal(goal: Goal): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const existing = current.goals ?? [];
  const nextGoals = existing.some((g) => g.id === goal.id)
    ? existing.map((g) => (g.id === goal.id ? goal : g))
    : [...existing, goal];
  const optimistic = { ...current, goals: nextGoals };
  writeCache(optimistic);
  const server = await pushPatch({ goals: nextGoals });
  if (server) writeCache(server);
  return server ?? optimistic;
}

export async function saveAccountBalance(balance: number | null): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const patch: Partial<EliteProgress> = { accountBalance: balance ?? undefined };
  const optimistic = { ...current, accountBalance: balance ?? undefined };
  writeCache(optimistic);
  const server = await pushPatch(patch);
  // Preserva o campo mesmo se o edge function fizer whitelist e stripar
  const merged = server ? { ...server, accountBalance: balance ?? undefined } : optimistic;
  writeCache(merged);
  return merged;
}

export async function completeOnboarding(): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const now = new Date().toISOString();
  const optimistic = { ...current, onboardingCompletedAt: now };
  writeCache(optimistic);
  const server = await pushPatch({ onboardingCompletedAt: now });
  // Preserva o marker mesmo se o edge function fizer whitelist e stripar —
  // sem isso o modal ressurge após o F5 (server retorna sem o campo,
  // re-render vê `onboardingCompletedAt` undefined e re-abre).
  const merged = server ? { ...server, onboardingCompletedAt: now } : optimistic;
  writeCache(merged);
  return merged;
}

export async function completeTour(): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const now = new Date().toISOString();
  const optimistic = { ...current, tourCompletedAt: now };
  writeCache(optimistic);
  const server = await pushPatch({ tourCompletedAt: now });
  const merged = server ? { ...server, tourCompletedAt: now } : optimistic;
  writeCache(merged);
  return merged;
}

export async function resetTour(): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const optimistic = { ...current, tourCompletedAt: null };
  writeCache(optimistic);
  const server = await pushPatch({ tourCompletedAt: null });
  const merged = server ? { ...server, tourCompletedAt: null } : optimistic;
  writeCache(merged);
  return merged;
}

export async function deleteGoal(goalId: string): Promise<EliteProgress> {
  const current = loadCachedProgress();
  const nextGoals = (current.goals ?? []).filter((g) => g.id !== goalId);
  const optimistic = { ...current, goals: nextGoals };
  writeCache(optimistic);
  const server = await pushPatch({ goals: nextGoals });
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
