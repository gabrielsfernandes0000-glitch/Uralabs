import type { TradeEntry, Goal } from "./progress";
import { tradeR, setupById, mistakeById } from "./playbook";

/* ────────────────────────────────────────────
   Métricas de performance do diário (TraderSync/Edgewonk-like)
   ──────────────────────────────────────────── */

export interface OverviewStats {
  total: number;
  wins: number;
  losses: number;
  bes: number;
  winRate: number;           // 0-100
  totalR: number;
  avgR: number;              // avg R por trade (expectancy por trade)
  avgRWin: number;           // R médio dos wins
  avgRLoss: number;          // R médio dos losses (negativo)
  expectancy: number;        // (winRate × avgRWin) + (lossRate × avgRLoss)
  profitFactor: number;      // |sum wins| / |sum losses|
  bestTrade: number;         // maior R
  worstTrade: number;        // menor R
  maxWinStreak: number;
  maxLossStreak: number;
  maxDrawdown: number;       // max drawdown em R
  disciplineRate: number;    // % trades com followedPlan + sem mistakes
}

export function computeOverview(trades: TradeEntry[]): OverviewStats {
  const total = trades.length;
  if (total === 0) {
    return {
      total: 0, wins: 0, losses: 0, bes: 0, winRate: 0,
      totalR: 0, avgR: 0, avgRWin: 0, avgRLoss: 0,
      expectancy: 0, profitFactor: 0,
      bestTrade: 0, worstTrade: 0,
      maxWinStreak: 0, maxLossStreak: 0, maxDrawdown: 0,
      disciplineRate: 0,
    };
  }

  const rs = trades.map((t) => ({ r: tradeR(t), t }));
  const wins = rs.filter((x) => x.t.result === "win");
  const losses = rs.filter((x) => x.t.result === "loss");
  const bes = rs.filter((x) => x.t.result === "be");

  const totalR = rs.reduce((s, x) => s + x.r, 0);
  const sumWins = wins.reduce((s, x) => s + x.r, 0);
  const sumLosses = losses.reduce((s, x) => s + x.r, 0); // negativo
  const avgRWin = wins.length > 0 ? sumWins / wins.length : 0;
  const avgRLoss = losses.length > 0 ? sumLosses / losses.length : 0;
  const winRate = (wins.length / total) * 100;
  const lossRate = (losses.length / total) * 100;
  const expectancy = ((winRate * avgRWin) + (lossRate * avgRLoss)) / 100;
  const profitFactor = sumLosses < 0 ? Math.abs(sumWins / sumLosses) : wins.length > 0 ? Infinity : 0;

  // Streaks + drawdown
  let maxWinStreak = 0, maxLossStreak = 0;
  let curWin = 0, curLoss = 0;
  let running = 0, peak = 0, maxDrawdown = 0;
  for (const { r, t } of rs) {
    running += r;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDrawdown) maxDrawdown = dd;

    if (t.result === "win") {
      curWin++; curLoss = 0;
      if (curWin > maxWinStreak) maxWinStreak = curWin;
    } else if (t.result === "loss") {
      curLoss++; curWin = 0;
      if (curLoss > maxLossStreak) maxLossStreak = curLoss;
    } else {
      curWin = 0; curLoss = 0;
    }
  }

  const disciplineTrades = trades.filter(
    (t) => t.followedPlan && (!t.mistakes || t.mistakes.length === 0)
  ).length;

  const bestTrade = rs.reduce((max, x) => (x.r > max ? x.r : max), -Infinity);
  const worstTrade = rs.reduce((min, x) => (x.r < min ? x.r : min), Infinity);

  return {
    total,
    wins: wins.length,
    losses: losses.length,
    bes: bes.length,
    winRate: Math.round(winRate * 10) / 10,
    totalR: Math.round(totalR * 100) / 100,
    avgR: Math.round((totalR / total) * 100) / 100,
    avgRWin: Math.round(avgRWin * 100) / 100,
    avgRLoss: Math.round(avgRLoss * 100) / 100,
    expectancy: Math.round(expectancy * 100) / 100,
    profitFactor: Number.isFinite(profitFactor) ? Math.round(profitFactor * 100) / 100 : 0,
    bestTrade: Math.round(bestTrade * 100) / 100,
    worstTrade: Math.round(worstTrade * 100) / 100,
    maxWinStreak,
    maxLossStreak,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    disciplineRate: Math.round((disciplineTrades / total) * 100),
  };
}

/* ────────────────────────────────────────────
   Breakdown por setup
   ──────────────────────────────────────────── */

export interface SetupBreakdown {
  setupId: string;
  setupName: string;
  trades: number;
  wins: number;
  winRate: number;
  totalR: number;
  avgR: number;
  expectancy: number;
}

export function computeSetupBreakdown(trades: TradeEntry[]): SetupBreakdown[] {
  const map = new Map<string, TradeEntry[]>();
  for (const t of trades) {
    const id = t.setup ?? "__none__";
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(t);
  }

  const rows: SetupBreakdown[] = [];
  for (const [id, list] of map) {
    const ov = computeOverview(list);
    const setup = setupById(id);
    rows.push({
      setupId: id,
      setupName: setup?.name ?? (id === "__none__" ? "Sem setup" : id),
      trades: ov.total,
      wins: ov.wins,
      winRate: ov.winRate,
      totalR: ov.totalR,
      avgR: ov.avgR,
      expectancy: ov.expectancy,
    });
  }
  return rows.sort((a, b) => b.totalR - a.totalR);
}

/* ────────────────────────────────────────────
   Mistake impact — R perdido por tag
   ──────────────────────────────────────────── */

export interface MistakeImpact {
  tagId: string;
  tagName: string;
  severity: number;
  count: number;
  rLost: number;         // soma R dos trades com essa tag (tipicamente negativa)
  avgR: number;
}

export function computeMistakeImpact(trades: TradeEntry[]): MistakeImpact[] {
  const byTag = new Map<string, TradeEntry[]>();
  for (const t of trades) {
    for (const tag of t.mistakes ?? []) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag)!.push(t);
    }
  }

  const rows: MistakeImpact[] = [];
  for (const [id, list] of byTag) {
    const tag = mistakeById(id);
    if (!tag) continue;
    const rSum = list.reduce((s, t) => s + tradeR(t), 0);
    rows.push({
      tagId: id,
      tagName: tag.name,
      severity: tag.severity,
      count: list.length,
      rLost: Math.round(rSum * 100) / 100,
      avgR: Math.round((rSum / list.length) * 100) / 100,
    });
  }
  return rows.sort((a, b) => a.rLost - b.rLost); // pior (mais negativo) primeiro
}

/* ────────────────────────────────────────────
   Equity curve — soma cumulativa de R por trade
   ──────────────────────────────────────────── */

export interface EquityPoint {
  tradeIdx: number;
  date: string;
  r: number;            // R deste trade
  cumulativeR: number;  // soma acumulada
}

export function computeEquityCurve(trades: TradeEntry[]): EquityPoint[] {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  return sorted.map((t, i) => {
    const r = tradeR(t);
    running += r;
    return {
      tradeIdx: i + 1,
      date: t.date,
      r: Math.round(r * 100) / 100,
      cumulativeR: Math.round(running * 100) / 100,
    };
  });
}

/* ────────────────────────────────────────────
   Day-of-week pattern
   ──────────────────────────────────────────── */

export interface DayOfWeekStats {
  day: "Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb";
  index: number;
  trades: number;
  totalR: number;
  winRate: number;
}

const DOW_LABELS: DayOfWeekStats["day"][] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function computeDayOfWeek(trades: TradeEntry[]): DayOfWeekStats[] {
  const byDay = new Map<number, TradeEntry[]>();
  for (const t of trades) {
    const d = new Date(`${t.date}T12:00:00`).getDay();
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(t);
  }
  return DOW_LABELS.map((day, index) => {
    const list = byDay.get(index) ?? [];
    const ov = computeOverview(list);
    return {
      day, index,
      trades: list.length,
      totalR: ov.totalR,
      winRate: ov.winRate,
    };
  });
}

/* ────────────────────────────────────────────
   Hour-of-day pattern (BRT)
   ──────────────────────────────────────────── */

export interface HourOfDayStats {
  hour: number;             // 0-23 BRT
  trades: number;
  totalR: number;
  winRate: number;
}

/**
 * Agrega performance por hora de abertura (BRT). Usa `openTime` do trade.
 * Trades sem `openTime` são ignorados. Retorna array com apenas as horas que têm trades.
 */
export function computeHourOfDay(trades: TradeEntry[]): HourOfDayStats[] {
  const byHour = new Map<number, TradeEntry[]>();
  for (const t of trades) {
    if (!t.openTime) continue;
    const hour = parseInt(t.openTime.split(":")[0], 10);
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) continue;
    if (!byHour.has(hour)) byHour.set(hour, []);
    byHour.get(hour)!.push(t);
  }
  const entries: HourOfDayStats[] = [];
  for (let h = 0; h < 24; h++) {
    const list = byHour.get(h);
    if (!list || list.length === 0) continue;
    const ov = computeOverview(list);
    entries.push({ hour: h, trades: list.length, totalR: ov.totalR, winRate: ov.winRate });
  }
  return entries;
}

/* ────────────────────────────────────────────
   Filters helpers
   ──────────────────────────────────────────── */

export function filterByDateRange(trades: TradeEntry[], fromDate: string, toDate?: string): TradeEntry[] {
  const end = toDate ?? fromDate;
  return trades.filter((t) => t.date >= fromDate && t.date <= end);
}

export function filterRecent(trades: TradeEntry[], days: number): TradeEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const iso = cutoff.toISOString().split("T")[0];
  return trades.filter((t) => t.date >= iso);
}

/* ────────────────────────────────────────────
   ISO-week helpers (YYYY-Www)
   ──────────────────────────────────────────── */

/** Retorna YYYY-Www da data (ISO 8601). */
export function isoWeekKey(d: Date): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // 0=seg
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

export function currentWeekKey(): string {
  return isoWeekKey(new Date());
}

/** [startDate, endDate] da semana atual em YYYY-MM-DD (Mon → Sun). */
export function currentWeekRange(): [string, string] {
  const d = new Date();
  const dayNr = (d.getDay() + 6) % 7; // 0=seg
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayNr);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (x: Date) => x.toISOString().split("T")[0];
  return [fmt(monday), fmt(sunday)];
}

export function filterWeekRange(trades: TradeEntry[], start: string, end: string): TradeEntry[] {
  return trades.filter((t) => t.date >= start && t.date <= end);
}

/* ────────────────────────────────────────────
   Goal evaluator
   ──────────────────────────────────────────── */

export interface GoalProgress {
  goal: Goal;
  current: number;
  target: number;
  unit: string;
  pct: number;                  // 0-100 (cap)
  hit: boolean;                 // meta atingida?
  label: string;                // rótulo de exibição
  periodTradesCount: number;
}

const METRIC_LABELS: Record<Goal["metric"], { label: string; unit: string }> = {
  totalR: { label: "Total R", unit: "R" },
  winRate: { label: "Win rate", unit: "%" },
  expectancy: { label: "Expectancy", unit: "R/trade" },
  disciplineRate: { label: "Disciplina", unit: "%" },
  maxMistakes: { label: "Mistakes severidade 3", unit: "" },
  trades: { label: "Trades registrados", unit: "" },
};

export function evaluateGoal(goal: Goal, trades: TradeEntry[]): GoalProgress {
  // Define janela baseada no period
  const start = goal.startDate;
  const now = new Date();
  const startD = new Date(start + "T00:00:00");
  const endD = new Date(startD);
  if (goal.period === "weekly") endD.setDate(endD.getDate() + 6);
  else endD.setMonth(endD.getMonth() + 1);
  const end = endD.toISOString().split("T")[0];

  const inWindow = trades.filter((t) => t.date >= start && t.date <= end);

  let current = 0;
  if (goal.metric === "totalR") {
    current = inWindow.reduce((s, t) => s + (t.rMultiple ?? 0), 0);
    // Fallback via rr string
    if (inWindow.length > 0 && current === 0) {
      const ov = computeOverview(inWindow);
      current = ov.totalR;
    }
  } else if (goal.metric === "winRate" || goal.metric === "expectancy" || goal.metric === "disciplineRate") {
    const ov = computeOverview(inWindow);
    if (goal.metric === "winRate") current = ov.winRate;
    if (goal.metric === "expectancy") current = ov.expectancy;
    if (goal.metric === "disciplineRate") current = ov.disciplineRate;
  } else if (goal.metric === "maxMistakes") {
    current = inWindow.reduce(
      (s, t) => s + (t.mistakes?.length ?? 0),
      0,
    );
  } else if (goal.metric === "trades") {
    current = inWindow.length;
  }

  const pct = goal.direction === "max"
    ? (goal.target > 0 ? Math.min(100, Math.max(0, (current / goal.target) * 100)) : 0)
    : (goal.target > 0 ? Math.min(100, Math.max(0, ((goal.target - current) / goal.target) * 100)) : 100);

  const hit = goal.direction === "min" ? current >= goal.target : current <= goal.target;
  const meta = METRIC_LABELS[goal.metric];
  const windowOver = now > endD;

  return {
    goal,
    current: Math.round(current * 100) / 100,
    target: goal.target,
    unit: meta.unit,
    pct: Math.round(pct),
    hit,
    label: goal.label ?? `${meta.label} ${goal.direction === "min" ? "≥" : "≤"} ${goal.target}${meta.unit}`,
    periodTradesCount: inWindow.length,
  };
}

/** Retorna goals ativos (semana/mês em curso). */
export function activeGoals(goals: Goal[]): Goal[] {
  const now = new Date();
  return goals.filter((g) => {
    const startD = new Date(g.startDate + "T00:00:00");
    const endD = new Date(startD);
    if (g.period === "weekly") endD.setDate(endD.getDate() + 6);
    else endD.setMonth(endD.getMonth() + 1);
    return now >= startD && now <= endD;
  });
}

/* ────────────────────────────────────────────
   Disciplina streak — dias consecutivos de trades limpos.
   Um dia conta SÓ SE:
    - teve pelo menos 1 trade
    - todos seguiram o plano
    - nenhum trade teve mistake de severidade 3 (crítica)
   ──────────────────────────────────────────── */

export interface DisciplineStreak {
  current: number;       // streak atual
  best: number;          // melhor histórico
  lastCleanDay: string | null;
}

export function computeDisciplineStreak(trades: TradeEntry[]): DisciplineStreak {
  // Agrupa trades por dia
  const byDay = new Map<string, TradeEntry[]>();
  for (const t of trades) {
    if (!byDay.has(t.date)) byDay.set(t.date, []);
    byDay.get(t.date)!.push(t);
  }

  const isCleanDay = (dayTrades: TradeEntry[]): boolean => {
    if (dayTrades.length === 0) return false;
    if (dayTrades.some((t) => !t.followedPlan)) return false;
    return !dayTrades.some((t) =>
      (t.mistakes ?? []).some((id) => mistakeById(id)?.severity === 3),
    );
  };

  const sortedDays = Array.from(byDay.keys()).sort();
  if (sortedDays.length === 0) return { current: 0, best: 0, lastCleanDay: null };

  // Best streak: percorre days, soma sequências
  let best = 0;
  let cur = 0;
  let prevDate: string | null = null;
  let lastCleanDay: string | null = null;

  for (const day of sortedDays) {
    const clean = isCleanDay(byDay.get(day)!);
    if (clean) {
      lastCleanDay = day;
      if (prevDate && isConsecutiveDay(prevDate, day)) {
        cur++;
      } else {
        cur = 1;
      }
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
    prevDate = day;
  }

  // Current streak: verifica se último dia clean bate com hoje OU ontem
  const todayBR = (() => {
    const d = new Date();
    const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return br.toISOString().split("T")[0];
  })();
  const yesterdayBR = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return br.toISOString().split("T")[0];
  })();

  const current = lastCleanDay === todayBR || lastCleanDay === yesterdayBR ? cur : 0;

  return { current, best, lastCleanDay };
}

function isConsecutiveDay(prev: string, curr: string): boolean {
  const a = new Date(prev + "T12:00:00");
  const b = new Date(curr + "T12:00:00");
  const diff = (b.getTime() - a.getTime()) / (24 * 3600 * 1000);
  return Math.round(diff) === 1;
}

// Re-export Goal type pra quem só importa de trade-metrics
export type { Goal } from "./progress";
