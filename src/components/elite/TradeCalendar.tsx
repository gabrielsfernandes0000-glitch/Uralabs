"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { tradeR } from "@/lib/playbook";
import type { TradeEntry } from "@/lib/progress";

/**
 * Calendário mensal de P&L (Edgewonk/TraderSync-style).
 * Cada célula do dia mostra:
 *  - Número do dia
 *  - P&L em R (colorido)
 *  - Quantidade de trades
 *
 * Hover destaca o dia. Click não navega por enquanto (mas poderia filtrar lista).
 */
export function TradeCalendar() {
  const { progress } = useProgress();
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const trades = progress?.trades ?? [];

  const { days, totalR, totalTrades, greenDays, redDays } = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay(); // 0=domingo
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    // Agrupa trades por data (YYYY-MM-DD)
    const byDate = new Map<string, TradeEntry[]>();
    for (const t of trades) {
      if (!byDate.has(t.date)) byDate.set(t.date, []);
      byDate.get(t.date)!.push(t);
    }

    const cells: Array<{
      date: Date | null;
      dateKey: string | null;
      trades: TradeEntry[];
      totalR: number;
      isToday: boolean;
      isFuture: boolean;
    }> = [];

    let totalR = 0;
    let totalTrades = 0;
    let greenDays = 0;
    let redDays = 0;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      if (dayNum < 1 || dayNum > lastDay.getDate()) {
        cells.push({ date: null, dateKey: null, trades: [], totalR: 0, isToday: false, isFuture: false });
        continue;
      }
      const d = new Date(year, month, dayNum);
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayTrades = byDate.get(dateKey) ?? [];
      const dayR = dayTrades.reduce((s, t) => s + tradeR(t), 0);
      const isToday = d.toDateString() === today.toDateString();
      const isFuture = d.getTime() > today.getTime() && !isToday;
      cells.push({ date: d, dateKey, trades: dayTrades, totalR: dayR, isToday, isFuture });

      if (dayTrades.length > 0) {
        totalTrades += dayTrades.length;
        totalR += dayR;
        if (dayR > 0) greenDays++;
        else if (dayR < 0) redDays++;
      }
    }

    return { days: cells, totalR, totalTrades, greenDays, redDays };
  }, [monthCursor, trades, today]);

  const goPrev = () => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1));
  const goNext = () => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1));
  const goToday = () => setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = monthCursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const monthAccent = totalR > 0 ? "#10B981" : totalR < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-white/50" />
          <h4 className="text-[12px] font-bold text-white/75">Calendário</h4>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={goPrev}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-md border border-white/[0.06] hover:border-white/[0.15] text-white/50 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[12px] font-bold text-white capitalize min-w-[110px] sm:min-w-[140px] text-center">{monthLabel}</span>
          <button
            onClick={goNext}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-md border border-white/[0.06] hover:border-white/[0.15] text-white/50 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={goToday}
            className="ml-0.5 sm:ml-1 px-2.5 py-1 rounded-md border border-white/[0.06] hover:border-white/[0.15] text-[10.5px] text-white/55 hover:text-white font-semibold transition-colors"
          >Hoje</button>
        </div>

        {totalTrades > 0 && (
          <div className="w-full sm:w-auto flex items-center gap-3 text-[10.5px] font-mono tabular-nums">
            <span className="text-white/40">
              {totalTrades} trades · <span className="text-emerald-400/80">{greenDays}</span>/<span className="text-red-400/80">{redDays}</span>
            </span>
            <span className="font-bold" style={{ color: monthAccent }}>
              {totalR > 0 ? "+" : ""}{totalR.toFixed(2)}R
            </span>
          </div>
        )}
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
        {[
          { full: "Dom", short: "D" },
          { full: "Seg", short: "S" },
          { full: "Ter", short: "T" },
          { full: "Qua", short: "Q" },
          { full: "Qui", short: "Q" },
          { full: "Sex", short: "S" },
          { full: "Sáb", short: "S" },
        ].map((d, i) => (
          <div key={i} className="text-[9px] font-bold text-white/30 text-center py-1">
            <span className="hidden sm:inline">{d.full}</span>
            <span className="sm:hidden">{d.short}</span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((cell, i) => (
          <CalendarCell key={i} cell={cell} />
        ))}
      </div>
    </div>
  );
}

function CalendarCell({ cell }: { cell: {
  date: Date | null;
  dateKey: string | null;
  trades: TradeEntry[];
  totalR: number;
  isToday: boolean;
  isFuture: boolean;
} }) {
  if (!cell.date) {
    return <div className="aspect-[5/3] rounded-md bg-transparent" />;
  }

  const { date, trades, totalR, isToday, isFuture } = cell;
  const dayNum = date.getDate();
  const hasData = trades.length > 0;
  const winCount = trades.filter((t) => t.result === "win").length;
  const lossCount = trades.filter((t) => t.result === "loss").length;

  const intensity = hasData ? Math.min(Math.abs(totalR) / 3, 1) : 0; // 3R = max intensity
  const bgColor = !hasData
    ? "rgba(255,255,255,0.015)"
    : totalR > 0
    ? `rgba(16,185,129,${0.08 + intensity * 0.22})`
    : totalR < 0
    ? `rgba(239,68,68,${0.08 + intensity * 0.22})`
    : "rgba(255,255,255,0.03)";
  const borderColor = isToday
    ? "rgba(255,255,255,0.3)"
    : hasData
    ? totalR > 0 ? "rgba(16,185,129,0.25)" : totalR < 0 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"
    : "rgba(255,255,255,0.04)";
  const rColor = totalR > 0 ? "text-emerald-400" : totalR < 0 ? "text-red-400" : "text-white/50";

  const content = (
    <div
      className={`relative aspect-[5/3] rounded-md border flex flex-col p-1 sm:p-1.5 overflow-hidden transition-colors ${
        isFuture ? "opacity-30" : "hover:border-white/20"
      } ${hasData ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: bgColor, borderColor }}
      title={hasData ? `${date.toLocaleDateString("pt-BR")} · ${trades.length} trade${trades.length > 1 ? "s" : ""} · ${totalR > 0 ? "+" : ""}${totalR.toFixed(2)}R` : undefined}
    >
      <span className={`text-[9px] sm:text-[10px] font-bold font-mono leading-none ${isToday ? "text-white" : hasData ? "text-white/85" : "text-white/35"}`}>
        {dayNum}
      </span>
      {hasData && (
        <div className="mt-auto flex flex-col min-w-0">
          <span className={`text-[9px] sm:text-[10.5px] font-bold font-mono tabular-nums leading-none truncate ${rColor}`}>
            {totalR > 0 ? "+" : ""}{totalR.toFixed(1)}R
          </span>
          <span className="hidden sm:block text-[8.5px] text-white/35 font-mono leading-none mt-0.5">
            {winCount > 0 && <span className="text-emerald-400/70">{winCount}W</span>}
            {winCount > 0 && lossCount > 0 && <span className="text-white/15"> </span>}
            {lossCount > 0 && <span className="text-red-400/70">{lossCount}L</span>}
            {winCount === 0 && lossCount === 0 && <span className="text-white/40">{trades.length}t</span>}
          </span>
        </div>
      )}
      {isToday && (
        <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white" />
      )}
    </div>
  );

  return hasData ? (
    <Link href={`/elite/diario#${date.toISOString().split("T")[0]}`}>
      {content}
    </Link>
  ) : content;
}
