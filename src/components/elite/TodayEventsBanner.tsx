"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EconomicEvent } from "@/lib/market-news";

/**
 * Banner enxuto com eventos econômicos de HOJE.
 * Máximo 4 eventos visíveis (prioriza high-impact). "+N mais" linka pra agenda.
 * Time grande (anchor visual), evento pequeno embaixo, country discreto.
 */
export function TodayEventsBanner({
  title = "Eventos hoje",
  subtitle,
  accent = "#FF5500",
  compact: _compact = false,
  maxItems = 4,
}: {
  title?: string;
  subtitle?: string;
  accent?: string;
  compact?: boolean;
  maxItems?: number;
}) {
  const [events, setEvents] = useState<EconomicEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events/today", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((data) => {
        if (!cancelled) setEvents(data.events ?? []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (events === null || events.length === 0) return null;

  // Prioriza high > medium, depois por time ascending
  const sorted = [...events].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const ia = impactOrder[a.impact] ?? 3;
    const ib = impactOrder[b.impact] ?? 3;
    if (ia !== ib) return ia - ib;
    return (a.time || "").localeCompare(b.time || "");
  });
  const visible = sorted.slice(0, maxItems);
  const hidden = sorted.length - visible.length;

  const countryCode = (c: string): string =>
    ({ US: "EUA", EU: "UE", BR: "BR", UK: "UK", CN: "CN", JP: "JP", CA: "CA", NZ: "NZ" } as Record<string, string>)[c] ?? c;

  return (
    <div className="relative rounded-xl border border-white/[0.05] bg-[#0c0c0e]">
      <div className="px-4 pt-3 pb-3 flex items-center gap-2">
        <span
          className="text-[9.5px] font-bold tracking-[0.22em] uppercase"
          style={{ color: accent + "CC" }}
        >
          {title}
        </span>
        <span className="text-white/15 text-[10px]">·</span>
        <span className="text-[10.5px] font-mono tabular-nums text-white/45">{sorted.length}</span>
        {subtitle && (
          <>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="text-[10.5px] text-white/35">{subtitle}</span>
          </>
        )}
        <Link
          href="/elite/noticias"
          className="ml-auto text-[10.5px] text-white/30 hover:text-white/70 transition-colors"
        >
          Agenda →
        </Link>
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {visible.map((ev) => (
          <Link
            key={ev.id}
            href="/elite/noticias"
            className="interactive-tap group relative flex items-baseline gap-2.5 px-3 py-2 rounded-lg border border-white/[0.04] hover:border-white/[0.14] hover:bg-white/[0.015] transition-colors"
          >
            <span
              className={`shrink-0 w-1 h-1 rounded-full self-center ${
                ev.impact === "high" ? "bg-red-400" : ev.impact === "medium" ? "bg-amber-400" : "bg-white/25"
              }`}
            />
            <span className="text-[15px] font-bold font-mono tabular-nums text-white leading-none shrink-0">
              {ev.time || "—"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-white/80 leading-tight truncate group-hover:text-white">
                {ev.event}
              </p>
              <p className="text-[9.5px] font-mono uppercase tracking-wider text-white/30 mt-0.5">
                {countryCode(ev.country)}
              </p>
            </div>
          </Link>
        ))}
        {hidden > 0 && (
          <Link
            href="/elite/noticias"
            className="interactive-tap flex items-center justify-center px-3 py-2 rounded-lg border border-dashed border-white/[0.06] hover:border-white/[0.14] transition-colors text-[11px] font-semibold text-white/40 hover:text-white/70"
          >
            +{hidden} {hidden === 1 ? "evento" : "eventos"}
          </Link>
        )}
      </div>
    </div>
  );
}
