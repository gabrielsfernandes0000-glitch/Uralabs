import type { TradeEntry } from "./progress";
import { tradeR, setupById, mistakeById, symbolById } from "./playbook";

/* ────────────────────────────────────────────
   CSV export — um row por trade, colunas em inglês + português.
   Compatível com FundingPips / TopStep reviews.
   ──────────────────────────────────────────── */

const COLUMNS = [
  "date", "time_brt", "symbol", "direction", "timeframe",
  "entry", "stop", "target", "exit", "size",
  "result", "r_multiple", "profit_r",
  "setup", "mistakes", "emotional_before", "emotional_after",
  "followed_plan", "notes", "source", "imported_from",
];

function escapeCsv(v: string | number | undefined | null): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function timeFromId(trade: TradeEntry): string {
  // trade.id format: "trade_<ms>"
  const m = /^trade_(\d+)$/.exec(trade.id);
  if (!m) return "";
  const d = new Date(parseInt(m[1], 10));
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

export function tradesToCsv(trades: TradeEntry[]): string {
  const lines: string[] = [COLUMNS.join(",")];

  for (const t of trades) {
    const r = tradeR(t);
    const setup = setupById(t.setup);
    const symbol = symbolById(t.symbol);
    const mistakeNames = (t.mistakes ?? []).map((id) => mistakeById(id)?.name ?? id).join("; ");

    const row = [
      t.date,
      timeFromId(t),
      symbol?.label ?? t.symbol ?? "",
      t.direction,
      t.timeframe ?? "",
      t.entryNum ?? t.entry ?? "",
      t.stopNum ?? t.sl ?? "",
      t.targetNum ?? t.tp ?? "",
      t.exitNum ?? "",
      t.size ?? "",
      t.result,
      r.toFixed(2),
      r.toFixed(2),
      setup?.name ?? "",
      mistakeNames,
      t.emotionalBefore ?? "",
      t.emotionalAfter ?? "",
      t.followedPlan ? "sim" : "não",
      t.notes,
      t.source ?? "manual",
      t.importedFrom ?? "",
    ].map(escapeCsv);

    lines.push(row.join(","));
  }

  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
