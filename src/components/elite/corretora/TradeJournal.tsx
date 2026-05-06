"use client";

import { useMemo, useState } from "react";
import { ChevronDown, StickyNote, Zap } from "lucide-react";

export interface JournalTrade {
  orderId: string;
  symbol: string;
  side: string;
  price: number;
  quantity: number;
  profit: number;
  commission?: number;
  time: number;
  tags?: string[];
  notes?: string | null;
  stopLoss?: number | null;
  uraCall?: boolean;
  liquidated?: boolean;
  mfe?: number | null;
  mae?: number | null;
  mfeR?: number | null;
  maeR?: number | null;
}

type Filter = "all" | "wins" | "losses" | "ura";

function fmtUsd(n: number, hideBalance = false) {
  if (hideBalance) return "$••••";
  const prefix = n >= 0 ? "+$" : "-$";
  return `${prefix}${Math.abs(n).toFixed(2)}`;
}

export function TradeJournal({
  trades,
  hideBalance = false,
  onTradeClick,
}: {
  trades: JournalTrade[];
  hideBalance?: boolean;
  onTradeClick?: (t: JournalTrade) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showOpens, setShowOpens] = useState(false);
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  const { grouped, counts } = useMemo(() => {
    const closed = trades.filter((t) => t.profit !== 0);
    const opens = trades.filter((t) => t.profit === 0);

    let pool = closed;
    if (filter === "wins") pool = closed.filter((t) => t.profit > 0);
    else if (filter === "losses") pool = closed.filter((t) => t.profit < 0);
    else if (filter === "ura") pool = closed.filter((t) => t.uraCall);

    if (showOpens) pool = [...pool, ...opens];
    pool = [...pool].sort((a, b) => b.time - a.time);

    const byDay = new Map<string, JournalTrade[]>();
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
        ura: closed.filter((t) => t.uraCall).length,
        opens: opens.length,
      },
    };
  }, [trades, filter, showOpens]);

  const toggleDay = (date: string) => setOpenDays((p) => ({ ...p, [date]: !p[date] }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-4 text-[11.5px] font-medium">
          {([
            ["all", "Todos", counts.all],
            ["wins", "Wins", counts.wins],
            ["losses", "Losses", counts.losses],
            ["ura", "URA", counts.ura],
          ] as const).map(([k, label, count]) => {
            const active = filter === k;
            const brandAccent = k === "ura";
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`interactive-tap relative pb-1.5 transition-colors ${active ? (brandAccent ? "text-brand-500" : "text-white") : "text-white/35 hover:text-white/65"}`}
              >
                {label}
                <span className="ml-1 text-[10px] text-white/30 tabular-nums">{count}</span>
                {active && <span className={`absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full ${brandAccent ? "bg-brand-500" : "bg-white/85"}`} />}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-1.5 text-[10.5px] text-white/40 cursor-pointer select-none">
          <input type="checkbox" checked={showOpens} onChange={(e) => setShowOpens(e.target.checked)} className="w-3 h-3 accent-brand-500" />
          Mostrar aberturas ({counts.opens})
        </label>
      </div>

      {grouped.length === 0 && (
        <div className="flex flex-col items-center py-8">
          <p className="text-[12px] text-white/30">Nenhum trade no filtro</p>
        </div>
      )}

      <div className="space-y-0.5">
        {grouped.map((g) => {
          const expanded = openDays[g.date] ?? true;
          const subColor = g.subtotal > 0 ? "text-green-400" : g.subtotal < 0 ? "text-red-400" : "text-white/30";
          // Sem `capitalize` CSS — pt-BR já vira "Dom., 03 De Mai." (cada palavra
          // capitalizada). Aplica capitalização só no weekday (primeiro token).
          const rawLabel = new Date(g.date + "T12:00:00Z").toLocaleDateString("pt-BR", {
            weekday: "short", day: "2-digit", month: "short",
          });
          const [wd, ...rest] = rawLabel.split(" ");
          const dateLabel = `${wd.charAt(0).toUpperCase()}${wd.slice(1).toLowerCase()} ${rest.join(" ").toLowerCase()}`;
          return (
            <div key={g.date}>
              <button
                type="button"
                onClick={() => toggleDay(g.date)}
                className="interactive-tap w-full flex items-center justify-between gap-3 py-2 px-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                  <span className="text-[11.5px] font-semibold text-white/70">{dateLabel}</span>
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
                    const hasNotes = !!t.notes && t.notes.trim().length > 0;
                    const tags = t.tags || [];
                    return (
                      <button
                        key={t.orderId + i}
                        type="button"
                        onClick={() => onTradeClick?.(t)}
                        className="interactive-tap w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sideColor}`} />
                          <span className="text-[11.5px] font-medium text-white/80 font-mono">
                            {t.symbol.replace(/-?USDT/, "")}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono tabular-nums">
                            {dt.toTimeString().slice(0, 5)}
                          </span>
                          {t.uraCall && (
                            <span className="text-[8.5px] font-bold text-brand-500 tracking-wider">URA</span>
                          )}
                          {t.liquidated && (
                            <span title="Posição liquidada" className="flex items-center gap-0.5 text-[8.5px] font-bold text-red-400 tracking-wider">
                              <Zap className="w-2.5 h-2.5" /> LIQ
                            </span>
                          )}
                          {tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9.5px] font-medium text-white/45 border border-white/[0.08] rounded px-1 py-[0.5px] truncate">
                              {tag}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className="text-[9px] text-white/30">+{tags.length - 2}</span>
                          )}
                          {hasNotes && <StickyNote className="w-3 h-3 text-white/35 shrink-0" />}
                        </div>
                        <span className={`text-[11.5px] font-mono tabular-nums font-semibold ${color} min-w-[60px] text-right shrink-0`}>
                          {t.profit === 0 ? "—" : fmtUsd(t.profit, hideBalance)}
                        </span>
                      </button>
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
