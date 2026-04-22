"use client";

import Link from "next/link";
import { TrendingUp, PenLine, ArrowRight, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import type { TradeEntry } from "@/lib/progress";
import { tradeR, setupById, symbolById } from "@/lib/playbook";

function todayKey(): string {
  // Usa BRT (UTC-3) — mesma convenção do saveTrade em progress.ts
  const now = new Date();
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

function TradeRow({ trade }: { trade: TradeEntry }) {
  const r = tradeR(trade);
  const isLong = trade.direction === "long";
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const rColor = r > 0 ? "text-emerald-400" : r < 0 ? "text-red-400" : "text-white/45";
  const DirIcon = isLong ? ArrowUpRight : ArrowDownRight;
  const dirColor = isLong ? "text-emerald-400/70" : "text-red-400/70";
  const setup = setupById(trade.setup);
  const symbol = symbolById(trade.symbol);
  const mistakeCount = (trade.mistakes ?? []).length;

  return (
    <div className="flex items-center gap-2 py-1.5">
      <DirIcon className={`w-3 h-3 shrink-0 ${dirColor}`} strokeWidth={2.5} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 w-8 shrink-0 font-mono">
        {isWin ? "Win" : isLoss ? "Loss" : "BE"}
      </span>
      <div className="min-w-0 flex-1 flex items-center gap-1.5 overflow-hidden">
        {symbol && (
          <span
            className="shrink-0 inline-flex items-center px-1.5 py-[1px] rounded text-[9.5px] font-bold font-mono leading-none"
            style={{ color: symbol.color, backgroundColor: symbol.color + "12" }}
          >{symbol.label}</span>
        )}
        <span className="text-[10.5px] text-white/60 font-medium truncate">
          {setup?.name ?? <span className="text-white/30 italic">sem setup</span>}
        </span>
        {mistakeCount > 0 && (
          <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] text-amber-400/70">
            <AlertTriangle className="w-2.5 h-2.5" />{mistakeCount}
          </span>
        )}
      </div>
      <span className={`text-[11px] font-bold font-mono tabular-nums shrink-0 ${rColor}`}>
        {r > 0 ? "+" : ""}{r.toFixed(2)}R
      </span>
    </div>
  );
}

export function DayPnLCard() {
  const { progress } = useProgress();

  if (!progress) {
    return (
      <div className="rounded-2xl bg-white/[0.02] p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-white/30" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">P&L do dia</h3>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-24 h-7 rounded bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    );
  }

  const today = todayKey();
  const trades = progress.trades
    .filter((t) => t.date === today)
    .slice()
    .reverse();
  const totalR = trades.reduce((sum, t) => sum + tradeR(t), 0);
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const bes = trades.filter((t) => t.result === "be").length;
  const isEmpty = trades.length === 0;
  const isPositive = totalR > 0;
  const isNegative = totalR < 0;
  const accent = isPositive ? "#10B981" : isNegative ? "#EF4444" : "rgba(255,255,255,0.6)";

  if (isEmpty) {
    return (
      <Link
        href="/elite/diario"
        className="interactive group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 h-full flex flex-col transition-colors"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-white/30" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">P&L do dia</h3>
        </div>
        <div className="flex-1 flex flex-col items-start justify-center gap-1">
          <p className="text-[22px] font-bold text-white/30 leading-none font-mono tabular-nums">—</p>
          <p className="text-[11px] text-white/35 mt-1.5 flex items-center gap-1.5 group-hover:text-white/55 transition-colors">
            <PenLine className="w-3 h-3" />
            Registrar primeiro trade
          </p>
        </div>
      </Link>
    );
  }

  const visibleTrades = trades.slice(0, 4);
  const hiddenCount = trades.length - visibleTrades.length;

  return (
    <div className="rounded-2xl bg-white/[0.02] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: accent }} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">P&L do dia</h3>
        </div>
        <Link href="/elite/diario" className="text-[10px] text-white/35 hover:text-white/80 transition-colors flex items-center gap-1">
          Diário <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
        <p
          className="text-[30px] font-bold leading-none font-mono tabular-nums"
          style={{ color: accent }}
        >
          {isPositive ? "+" : ""}{totalR.toFixed(2)}<span className="text-[16px] text-white/40 font-semibold ml-0.5">R</span>
        </p>
        <div className="flex items-center gap-2 text-[10.5px] font-mono tabular-nums text-white/45 pb-1">
          {wins > 0 && <span className="text-emerald-400/85">{wins}W</span>}
          {losses > 0 && <span className="text-red-400/85">{losses}L</span>}
          {bes > 0 && <span className="text-white/40">{bes}BE</span>}
          <span className="text-white/15">·</span>
          <span>{trades.length} {trades.length === 1 ? "trade" : "trades"}</span>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-white/[0.04] divide-y divide-white/[0.03]">
        {visibleTrades.map((t) => (
          <TradeRow key={t.id} trade={t} />
        ))}
        {hiddenCount > 0 && (
          <Link
            href="/elite/diario"
            className="flex items-center justify-center gap-1 pt-2 text-[10px] text-white/35 hover:text-white/70 transition-colors"
          >
            + {hiddenCount} {hiddenCount === 1 ? "trade" : "trades"} hoje
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
