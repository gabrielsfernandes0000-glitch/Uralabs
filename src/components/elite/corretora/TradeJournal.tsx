"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Trade {
  orderId: string;
  symbol: string;
  side: string;
  price: number;
  quantity: number;
  profit: number;
  time: number;
}

type Filter = "all" | "wins" | "losses";

function fmtUsd(n: number, hideBalance = false) {
  if (hideBalance) return "$••••";
  const prefix = n >= 0 ? "+$" : "-$";
  return `${prefix}${Math.abs(n).toFixed(2)}`;
}

export function TradeJournal({ trades, hideBalance = false }: { trades: Trade[]; hideBalance?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showOpens, setShowOpens] = useState(false);
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  const { grouped, counts } = useMemo(() => {
    const closed = trades.filter((t) => t.profit !== 0);
    const opens = trades.filter((t) => t.profit === 0);

    let pool = closed;
    if (filter === "wins") pool = closed.filter((t) => t.profit > 0);
    else if (filter === "losses") pool = closed.filter((t) => t.profit < 0);

    if (showOpens) pool = [...pool, ...opens];
    pool = [...pool].sort((a, b) => b.time - a.time);

    // Group by day
    const byDay = new Map<string, Trade[]>();
    for (const t of pool) {
      const d = new Date(t.time);
      d.setHours(d.getHours() - 3);
      const key = d.toISOString().slice(0, 10);
      const arr = byDay.get(key) || [];
      arr.push(t);
      byDay.set(key, arr);
    }
    const groupedArr = [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({ date, items, subtotal: items.reduce((s, t) => s + t.profit, 0) }));

    return {
      grouped: groupedArr,
      counts: {
        all: closed.length,
        wins: closed.filter((t) => t.profit > 0).length,
        losses: closed.filter((t) => t.profit < 0).length,
        opens: opens.length,
      },
    };
  }, [trades, filter, showOpens]);

  const toggleDay = (date: string) => setOpenDays((p) => ({ ...p, [date]: !p[date] }));

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-4 text-[11.5px] font-medium">
          {([
            ["all", "Todos", counts.all],
            ["wins", "Wins", counts.wins],
            ["losses", "Losses", counts.losses],
          ] as const).map(([k, label, count]) => {
            const active = filter === k;
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`interactive-tap relative pb-1.5 transition-colors ${active ? "text-white" : "text-white/35 hover:text-white/65"}`}
              >
                {label}
                <span className="ml-1 text-[10px] text-white/30 tabular-nums">{count}</span>
                {active && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-500 rounded-full" />}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-1.5 text-[10.5px] text-white/40 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showOpens}
            onChange={(e) => setShowOpens(e.target.checked)}
            className="w-3 h-3 accent-brand-500"
          />
          Mostrar aberturas ({counts.opens})
        </label>
      </div>

      {/* Groups */}
      {grouped.length === 0 && (
        <div className="flex flex-col items-center py-8">
          <p className="text-[12px] text-white/30">Nenhum trade no filtro</p>
        </div>
      )}

      <div className="space-y-0.5">
        {grouped.map((g) => {
          const expanded = openDays[g.date] ?? true;
          const subColor = g.subtotal > 0 ? "text-green-400" : g.subtotal < 0 ? "text-red-400" : "text-white/30";
          const dateLabel = new Date(g.date + "T12:00:00Z").toLocaleDateString("pt-BR", {
            weekday: "short", day: "2-digit", month: "short",
          });
          return (
            <div key={g.date}>
              <button
                onClick={() => toggleDay(g.date)}
                className="interactive-tap w-full flex items-center justify-between gap-3 py-2 px-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                  <span className="text-[11.5px] font-semibold text-white/70 capitalize">{dateLabel}</span>
                  <span className="text-[10px] text-white/25">· {g.items.length} {g.items.length === 1 ? "trade" : "trades"}</span>
                </div>
                <span className={`text-[12px] font-mono tabular-nums font-semibold ${subColor}`}>
                  {fmtUsd(g.subtotal, hideBalance)}
                </span>
              </button>

              {expanded && (
                <div className="pl-5 space-y-0.5">
                  {g.items.map((t, i) => {
                    const color = t.profit > 0 ? "text-green-400" : t.profit < 0 ? "text-red-400" : "text-white/30";
                    const sideColor = t.side === "BUY" || t.side === "Buy" ? "bg-green-400" : "bg-red-400";
                    const dt = new Date(t.time);
                    dt.setHours(dt.getHours() - 3);
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sideColor}`} />
                          <span className="text-[11.5px] font-medium text-white/80 font-mono">
                            {t.symbol.replace(/-?USDT/, "")}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono tabular-nums">
                            {dt.toTimeString().slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {t.price > 0 && (
                            <span className="text-[10px] text-white/30 font-mono tabular-nums hidden sm:inline">
                              {t.price < 1 ? t.price.toFixed(6) : t.price.toFixed(2)}
                            </span>
                          )}
                          <span className={`text-[11.5px] font-mono tabular-nums font-semibold ${color} min-w-[60px] text-right`}>
                            {t.profit === 0 ? "—" : fmtUsd(t.profit, hideBalance)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
