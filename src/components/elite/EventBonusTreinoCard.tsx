"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EconomicEvent } from "@/lib/market-news";
import { eventCategory, treinoCategoriesForEvent } from "@/lib/economic-events";

/**
 * Card "Treine pro evento de hoje" — aparece na Prática quando há evento de
 * alto impacto hoje. Segue design system Elite: zero fills coloridos, zero
 * icon-box. Cor vive só no dot + texto caps do label.
 */
export function EventBonusTreinoCard() {
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

  if (events === null) return null;
  const highImpact = events.find((e) => e.impact === "high");
  if (!highImpact) return null;

  const evCat = eventCategory(highImpact.event);
  const treinoCats = treinoCategoriesForEvent(evCat).slice(0, 3);
  if (treinoCats.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" aria-hidden />
        <span className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-red-400/90">
          Treine pro evento de hoje
        </span>
      </div>

      <p className="text-[13.5px] font-bold text-white leading-snug">
        <span className="font-mono tabular-nums text-white">{highImpact.time}</span>
        <span className="text-white/25 mx-2">·</span>
        {highImpact.event}
      </p>
      <p className="text-[11px] text-white/40 leading-snug mt-1 mb-3">
        Evento de alto impacto — pratique o que vai precisar antes.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {treinoCats.map((cat) => (
          <Link
            key={cat}
            href={`/elite/treino/livre?category=${encodeURIComponent(cat)}`}
            className="interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/[0.08] hover:border-white/[0.20] transition-colors text-[10.5px] font-semibold text-white/65 hover:text-white group"
          >
            {cat}
            <ArrowUpRight className="w-2.5 h-2.5 opacity-30 group-hover:opacity-80 transition-opacity" strokeWidth={2.2} />
          </Link>
        ))}
      </div>
    </div>
  );
}
