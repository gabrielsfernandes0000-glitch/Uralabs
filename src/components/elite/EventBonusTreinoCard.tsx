"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target, Zap, ArrowUpRight } from "lucide-react";
import type { EconomicEvent } from "@/lib/market-news";
import { eventCategory, treinoCategoriesForEvent } from "@/lib/economic-events";

/**
 * Card "Treine pro evento de hoje" — aparece na Prática quando há evento de
 * alto impacto hoje. Sugere 2-3 categorias de treino relacionadas.
 * Ex: FOMC hoje → [AMD] [Gestão] [Viés] links filtrando treino livre.
 *
 * Se não tem evento high-impact hoje, não renderiza nada.
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

  if (events === null) return null; // loading
  const highImpact = events.find((e) => e.impact === "high");
  if (!highImpact) return null; // sem evento de alto impacto, card não aparece

  const evCat = eventCategory(highImpact.event);
  const treinoCats = treinoCategoriesForEvent(evCat).slice(0, 3);
  if (treinoCats.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-500/[0.15] bg-gradient-to-br from-red-500/[0.03] to-[#0e0e10]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
      <div className="absolute top-[-20%] right-[-5%] w-[200px] h-[120px] rounded-full bg-red-500/[0.08] blur-[80px] pointer-events-none" />

      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg border border-red-400/25 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-red-400" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Target className="w-3 h-3 text-red-400/70" strokeWidth={2} />
              <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-red-400/90">
                Treine pro evento de hoje
              </span>
            </div>
            <p className="text-[13px] font-bold text-white leading-tight">
              {highImpact.time} · {highImpact.event}
            </p>
            <p className="text-[10.5px] text-white/45 leading-snug mt-0.5">
              Evento de alto impacto — pratique o que vai precisar antes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {treinoCats.map((cat) => (
            <Link
              key={cat}
              href={`/elite/treino/livre?category=${encodeURIComponent(cat)}`}
              className="interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.02] hover:border-red-400/30 hover:bg-red-500/[0.05] transition-colors text-[10.5px] font-semibold text-white/75 hover:text-white group"
            >
              {cat}
              <ArrowUpRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth={2.2} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
