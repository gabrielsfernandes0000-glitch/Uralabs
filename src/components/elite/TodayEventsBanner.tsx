"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Zap } from "lucide-react";
import type { EconomicEvent } from "@/lib/market-news";

/**
 * Banner compacto com eventos econômicos de HOJE.
 * Fetch async, não bloqueia render. Se sem eventos, não renderiza nada.
 * Usado no Diário (prep sheet), Calls, etc — reusável.
 */
export function TodayEventsBanner({
  title = "Eventos econômicos hoje",
  subtitle = "considere na hora de montar o plano",
  accent = "#FF5500",
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  accent?: string;
  compact?: boolean;
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

  // Não renderiza enquanto carrega ou se não tem eventos
  if (events === null || events.length === 0) return null;

  const countryCode = (c: string): string =>
    ({ US: "EUA", EU: "UE", BR: "BR", UK: "UK", CN: "CN", JP: "JP", CA: "CA", NZ: "NZ" } as Record<string, string>)[c] ?? c;

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] ${compact ? "" : "mb-4"}`}>
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
      />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Zap className="w-3.5 h-3.5" style={{ color: accent }} strokeWidth={2} />
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: accent + "CC" }}>
            {title}
          </span>
          <span className="text-white/15 text-[10px]">·</span>
          <span className="text-[10.5px] text-white/40">{subtitle}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {events.map((ev) => (
            <Link
              key={ev.id}
              href="/elite/noticias"
              className="interactive-tap inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.16] transition-colors text-[11px] group"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  ev.impact === "high" ? "bg-red-400" : ev.impact === "medium" ? "bg-amber-400" : "bg-white/30"
                }`}
              />
              <span className="font-mono text-white/60 tabular-nums">{ev.time || "—"}</span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-white/40 text-[10px] uppercase tracking-wider">{countryCode(ev.country)}</span>
              <span className="text-white/20">·</span>
              <span className="font-semibold text-white/80 group-hover:text-white max-w-[220px] truncate">{ev.event}</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <CalendarClock className="w-3 h-3 text-white/25" strokeWidth={1.8} />
          <Link href="/elite/noticias" className="text-[10.5px] text-white/35 hover:text-white/60 transition-colors">
            Ver agenda completa →
          </Link>
        </div>
      </div>
    </div>
  );
}
