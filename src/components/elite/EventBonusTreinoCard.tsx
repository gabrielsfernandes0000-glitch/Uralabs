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

  // Urgency tier: red só se evento é iminente (<30min); senão laranja brand pra alinhar com identidade da Prática.
  const isImminent = (() => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(highImpact.time || "");
    if (!m) return false;
    const eventMins = Number(m[1]) * 60 + Number(m[2]);
    const now = new Date();
    const nyStr = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false });
    const [nh, nm] = nyStr.split(":").map(Number);
    const nowMins = nh * 60 + nm;
    const diff = eventMins - nowMins;
    return diff >= 0 && diff <= 30;
  })();
  const dotColor = isImminent ? "bg-red-400" : "bg-brand-500";
  const labelColor = isImminent ? "text-red-400/90" : "text-brand-500";

  return (
    <div className="rounded-xl bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden />
        <span className={`text-[9.5px] font-bold tracking-[0.25em] uppercase ${labelColor}`}>
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
