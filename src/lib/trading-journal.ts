/**
 * Trading Journal — storage e analytics de trades do user.
 *
 * Backing store: localStorage (key `elite_trades_v1`). Se virar produção consolidada,
 * migrar pra tabela Supabase + RPCs (seguindo padrão useProgress).
 *
 * Tudo client-side — nenhum dado sensível vaza pro server.
 */

export type TradeDirection = "long" | "short";
export type TradeStatus = "win" | "loss" | "breakeven" | "open";
export type EmotionalState = 1 | 2 | 3 | 4 | 5; // 1=péssimo, 5=excelente

export interface Trade {
  id: string;
  createdAt: string;         // ISO
  asset: string;             // ex: "BINANCE:BTCUSDT" ou "NQ"
  direction: TradeDirection;
  entry: number;
  stop: number;
  target: number | null;
  exit: number | null;       // preenchido ao fechar
  sizeUsd: number;           // tamanho posição em USD (ou moeda-base)
  pnlUsd: number | null;     // preenchido ao fechar
  status: TradeStatus;
  emotionalState: EmotionalState | null;
  notes: string;
  photoBase64: string | null; // screenshot do gráfico
  checklistPassed: string[]; // lista de items checados no pre-trade
  rMultiple: number | null;  // pnlUsd / riskUsd (preenchido automático ao fechar)
}

const KEY = "elite_trades_v1";

export function loadTrades(): Trade[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(trades));
    window.dispatchEvent(new CustomEvent("trades:changed"));
  } catch {
    /* ignore */
  }
}

export function addTrade(t: Omit<Trade, "id" | "createdAt">): Trade {
  const trade: Trade = {
    ...t,
    id: `trade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const all = loadTrades();
  all.unshift(trade);
  saveTrades(all);
  return trade;
}

export function updateTrade(id: string, patch: Partial<Trade>): void {
  const all = loadTrades();
  const next = all.map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTrades(next);
}

export function deleteTrade(id: string): void {
  saveTrades(loadTrades().filter((t) => t.id !== id));
}

/** Calcula R múltiplo consistente: pnl / risco. Negativo se loss. */
export function calcRMultiple(trade: Trade): number | null {
  if (trade.pnlUsd == null) return null;
  const riskUsd = Math.abs(trade.entry - trade.stop) * (trade.sizeUsd / trade.entry);
  if (riskUsd === 0) return null;
  return trade.pnlUsd / riskUsd;
}

/** Risco em USD dado entry, stop e size. */
export function calcRiskUsd(entry: number, stop: number, sizeUsd: number): number {
  if (entry === 0) return 0;
  return Math.abs(entry - stop) * (sizeUsd / entry);
}

/** R:R ratio (target - entry) / (entry - stop). Positivo sempre (magnitude). */
export function calcRRRatio(entry: number, stop: number, target: number | null): number | null {
  if (target == null || entry === stop) return null;
  const reward = Math.abs(target - entry);
  const risk = Math.abs(entry - stop);
  if (risk === 0) return null;
  return reward / risk;
}

/** Tamanho de posição baseado em balance, risk %, entry e stop. */
export function calcPositionSize(args: {
  balanceUsd: number;
  riskPercent: number;  // ex: 1.0 = 1%
  entry: number;
  stop: number;
}): { sizeUsd: number; riskUsd: number; units: number } {
  const { balanceUsd, riskPercent, entry, stop } = args;
  const riskUsd = balanceUsd * (riskPercent / 100);
  const distance = Math.abs(entry - stop);
  if (distance === 0 || entry === 0) return { sizeUsd: 0, riskUsd, units: 0 };
  const units = riskUsd / distance;         // quantidade do ativo
  const sizeUsd = units * entry;             // tamanho da posição em USD
  return { sizeUsd, riskUsd, units };
}

/* ────────────────────────────────────────────
   Statistics aggregations
   ──────────────────────────────────────────── */

export interface TraderStats {
  total: number;
  wins: number;
  losses: number;
  breakevens: number;
  open: number;
  winrate: number;            // 0..1
  avgR: number;               // R médio em trades fechados
  totalR: number;
  totalPnlUsd: number;
  profitFactor: number;       // |gains| / |losses|
  expectancy: number;         // avgR effectively
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  maxDrawdownR: number;       // R cumulativo peak-to-trough
  avgRiskPercent: number;     // média de risco (stop distance/balance) — heurística
}

export function computeStats(trades: Trade[]): TraderStats {
  const closed = trades.filter((t) => t.status !== "open");
  const wins = closed.filter((t) => t.status === "win");
  const losses = closed.filter((t) => t.status === "loss");
  const breakevens = closed.filter((t) => t.status === "breakeven");

  const rVals = closed
    .map((t) => calcRMultiple(t))
    .filter((r): r is number => r !== null);
  const totalR = rVals.reduce((s, r) => s + r, 0);
  const avgR = rVals.length > 0 ? totalR / rVals.length : 0;

  const totalPnlUsd = closed.reduce((s, t) => s + (t.pnlUsd ?? 0), 0);
  const grossProfit = closed.reduce((s, t) => s + Math.max(t.pnlUsd ?? 0, 0), 0);
  const grossLoss = Math.abs(closed.reduce((s, t) => s + Math.min(t.pnlUsd ?? 0, 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  let best: Trade | null = null;
  let worst: Trade | null = null;
  for (const t of closed) {
    const r = calcRMultiple(t);
    if (r == null) continue;
    if (!best || (calcRMultiple(best) ?? -Infinity) < r) best = t;
    if (!worst || (calcRMultiple(worst) ?? Infinity) > r) worst = t;
  }

  // Max drawdown em R: percorre trades mais antigos → novos, calcula curva cumulativa
  const sorted = [...closed].sort(
    (a, z) => new Date(a.createdAt).getTime() - new Date(z.createdAt).getTime(),
  );
  let peak = 0;
  let dd = 0;
  let curve = 0;
  for (const t of sorted) {
    const r = calcRMultiple(t) ?? 0;
    curve += r;
    if (curve > peak) peak = curve;
    dd = Math.min(dd, curve - peak);
  }

  return {
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    open: trades.length - closed.length,
    winrate: closed.length > 0 ? wins.length / closed.length : 0,
    avgR,
    totalR,
    totalPnlUsd,
    profitFactor,
    expectancy: avgR,
    bestTrade: best,
    worstTrade: worst,
    maxDrawdownR: Math.abs(dd),
    avgRiskPercent: 1, // placeholder — calc real exigiria balance histórico
  };
}

/** Bucket de performance por dia da semana (0..6) e hora (0..23). */
export type HeatmapCell = {
  day: number;      // 0=dom..6=sáb
  hour: number;     // 0..23
  trades: number;
  totalR: number;
  avgR: number;
};

export function computeHeatmap(trades: Trade[]): HeatmapCell[] {
  const map = new Map<string, HeatmapCell>();
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      map.set(`${d}-${h}`, { day: d, hour: h, trades: 0, totalR: 0, avgR: 0 });
    }
  }
  for (const t of trades) {
    if (t.status === "open") continue;
    const r = calcRMultiple(t);
    if (r == null) continue;
    const dt = new Date(t.createdAt);
    const key = `${dt.getDay()}-${dt.getHours()}`;
    const cell = map.get(key)!;
    cell.trades += 1;
    cell.totalR += r;
    cell.avgR = cell.totalR / cell.trades;
  }
  return Array.from(map.values());
}

/* ────────────────────────────────────────────
   Revenge trade detector
   ──────────────────────────────────────────── */

export interface RevengeSignal {
  active: boolean;
  reason: string;
  lastLosses: number;
  minutesSinceLastLoss: number | null;
}

const REVENGE_WINDOW_MIN = 15;   // entrar em < 15min após loss = suspeito
const REVENGE_LOSS_STREAK = 2;   // 2+ losses em sequência = gatilho

export function detectRevengeRisk(trades: Trade[]): RevengeSignal {
  const closed = trades
    .filter((t) => t.status !== "open")
    .sort((a, z) => new Date(z.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (closed.length < REVENGE_LOSS_STREAK) {
    return { active: false, reason: "", lastLosses: 0, minutesSinceLastLoss: null };
  }

  let lossStreak = 0;
  for (const t of closed) {
    if (t.status === "loss") lossStreak += 1;
    else break;
  }

  if (lossStreak < REVENGE_LOSS_STREAK) {
    return { active: false, reason: "", lastLosses: lossStreak, minutesSinceLastLoss: null };
  }

  const lastLossTime = new Date(closed[0].createdAt).getTime();
  const diffMin = (Date.now() - lastLossTime) / 60_000;

  if (diffMin > REVENGE_WINDOW_MIN) {
    return {
      active: false,
      reason: "",
      lastLosses: lossStreak,
      minutesSinceLastLoss: Math.floor(diffMin),
    };
  }

  return {
    active: true,
    reason: `${lossStreak} perdas seguidas · última há ${Math.floor(diffMin)} min`,
    lastLosses: lossStreak,
    minutesSinceLastLoss: Math.floor(diffMin),
  };
}

/* ────────────────────────────────────────────
   React hook conveniente
   ──────────────────────────────────────────── */

import { useEffect, useState } from "react";

export function useTrades(): [Trade[], (t: Trade[]) => void] {
  const [trades, setTrades] = useState<Trade[]>([]);
  useEffect(() => {
    setTrades(loadTrades());
    const onChange = () => setTrades(loadTrades());
    window.addEventListener("trades:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("trades:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = (next: Trade[]) => {
    setTrades(next);
    saveTrades(next);
  };
  return [trades, update];
}
