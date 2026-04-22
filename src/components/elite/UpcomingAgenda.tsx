"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Briefcase } from "lucide-react";
import { type EconomicEvent } from "@/lib/market-news";
import { MAJOR_TICKERS, hourLabel, type EarningsEntry } from "@/lib/earnings";
import { instrumentsForEvent } from "@/lib/economic-events";
import { LogTradeFromEventButton } from "@/components/elite/LogTradeFromEventButton";

/**
 * Agenda — hybrid Bloomberg ECO (tabela densa monospace) + Linear Today view
 * (grouping by status, não por dia). URA design tokens rigoroso.
 *
 * Estrutura:
 *   1. AO VIVO          — events em curso (rare, só aparece quando há)
 *   2. PRÓXIMAS HORAS   — events ainda não released
 *   3. JÁ PASSOU HOJE   — collapsed by default, count summary
 *   4. EARNINGS         — strip compacto por dia (7 dias)
 *
 * Nada de day-by-day grid (macro só tem hoje, criava imbalance visual).
 */

type FilterMode = "all" | "macro" | "earnings";

export function UpcomingAgenda({
  events,
  earnings,
  today,
}: {
  events: EconomicEvent[];
  earnings: EarningsEntry[];
  today: string;
}) {
  const [mode, setMode] = useState<FilterMode>("all");
  const [showPast, setShowPast] = useState(false);

  const showMacro = mode !== "earnings";
  const showEarnings = mode !== "macro";

  // Relógio BRT atualiza a cada 30s
  const [nowMinsBRT, setNowMinsBRT] = useState(getNowBRT);
  useEffect(() => {
    const iv = setInterval(() => setNowMinsBRT(getNowBRT()), 30_000);
    return () => clearInterval(iv);
  }, []);

  // Ordenação + filter de macros por impacto (high/medium)
  const macroSorted = useMemo(() => {
    return events
      .filter((e) => e.impact === "high" || e.impact === "medium")
      .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }, [events]);

  const { liveEvents, upcomingEvents, pastEvents } = useMemo(() => {
    const live: EconomicEvent[] = [];
    const upcoming: EconomicEvent[] = [];
    const past: EconomicEvent[] = [];
    for (const ev of macroSorted) {
      const rel = relativeTimeBRT(ev.time ?? "", nowMinsBRT);
      if (rel.kind === "now" && !ev.actual) live.push(ev);
      else if (rel.kind === "past") past.push(ev);
      else upcoming.push(ev);
    }
    return { liveEvents: live, upcomingEvents: upcoming, pastEvents: past };
  }, [macroSorted, nowMinsBRT]);

  const earningsByDate = useMemo(() => {
    const map = new Map<string, EarningsEntry[]>();
    for (const e of earnings) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(0, 7);
  }, [earnings]);

  const totalEarnings = earnings.length;

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] overflow-hidden">
      {/* Header com filtros + horário BRT context */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06] flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5 text-white/55" strokeWidth={1.8} />
          <h3 className="text-[13px] font-bold text-white/85">Agenda</h3>
          <span className="text-[10px] font-mono text-white/30">horário BRT</span>
        </div>
        <div className="flex items-center gap-1">
          <FilterPill active={mode === "all"} onClick={() => setMode("all")}>Tudo</FilterPill>
          <FilterPill active={mode === "macro"} onClick={() => setMode("macro")}>Macro</FilterPill>
          <FilterPill active={mode === "earnings"} onClick={() => setMode("earnings")}>Earnings</FilterPill>
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {/* ── 1. AO VIVO ─────────────────────────────── */}
        {showMacro && liveEvents.length > 0 && (
          <Section title="Ao vivo" count={liveEvents.length} accent="brand">
            <MacroTable events={liveEvents} nowMinsBRT={nowMinsBRT} status="live" />
          </Section>
        )}

        {/* ── 2. PRÓXIMAS HORAS ──────────────────────── */}
        {showMacro && (
          <Section
            title="Próximas horas"
            count={upcomingEvents.length}
            empty={liveEvents.length === 0 ? "Sem macro de alto impacto hoje" : null}
          >
            {upcomingEvents.length > 0 && (
              <MacroTable events={upcomingEvents} nowMinsBRT={nowMinsBRT} status="upcoming" />
            )}
          </Section>
        )}

        {/* ── 3. JÁ PASSOU — collapsed ───────────────── */}
        {showMacro && pastEvents.length > 0 && (
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setShowPast((v) => !v)}
              className="flex items-center gap-2 w-full text-left hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-md transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 shrink-0" />
              <span className="text-[11.5px] font-semibold text-white/65">
                {pastEvents.length} {pastEvents.length === 1 ? "release saiu" : "releases saíram"}
              </span>
              <span className="text-[10px] font-mono tabular-nums text-white/30">
                {pastEvents[0]?.time}–{pastEvents[pastEvents.length - 1]?.time}
              </span>
              <span className="ml-auto text-[10px] text-white/35">
                {showPast ? "ocultar" : "ver"}
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: showPast ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pt-3">
                  <MacroTable events={pastEvents} nowMinsBRT={nowMinsBRT} status="past" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. EARNINGS — strip por dia ────────────── */}
        {showEarnings && totalEarnings > 0 && (
          <Section
            title="Earnings"
            count={totalEarnings}
            subtitle="próximos 7 dias"
            icon={<Briefcase className="w-3 h-3 text-white/35" strokeWidth={1.8} />}
          >
            <div className="space-y-2">
              {earningsByDate.map(([date, list]) => (
                <EarningsDayRow key={date} date={date} today={today} entries={list} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function getNowBRT(): number {
  const s = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

function relativeTimeBRT(timeHHMM: string, nowMinsBRT: number): { label: string; kind: "now" | "soon" | "future" | "past" } {
  if (!timeHHMM || !timeHHMM.includes(":")) return { label: "", kind: "future" };
  const [h, m] = timeHHMM.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return { label: "", kind: "future" };
  const evMins = h * 60 + m;
  const diff = evMins - nowMinsBRT;
  if (diff < -15) return { label: "passou", kind: "past" };
  if (diff < 0) return { label: "agora", kind: "now" };
  if (diff < 15) return { label: `em ${diff}min`, kind: "now" };
  if (diff < 60) return { label: `em ${diff}min`, kind: "soon" };
  const hours = Math.floor(diff / 60);
  const restM = diff % 60;
  return { label: restM === 0 ? `em ${hours}h` : `em ${hours}h${restM}`, kind: "soon" };
}

function countryShort(country: string): string {
  const map: Record<string, string> = {
    US: "EUA", EUA: "EUA", EU: "UE", UE: "UE", UK: "UK", GB: "UK",
  };
  return map[country.toUpperCase()] ?? country.toUpperCase();
}

function parseNumericValue(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/%/g, "").replace(/,/g, ".").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function surpriseFor(ev: EconomicEvent): { delta: number; pct: number | null } | null {
  const a = parseNumericValue(ev.actual);
  const f = parseNumericValue(ev.forecast);
  if (a == null || f == null) return null;
  const delta = a - f;
  const pct = Math.abs(f) > 0.0001 ? (delta / Math.abs(f)) * 100 : null;
  return { delta, pct };
}

/* ────────────────────────────────────────────
   Section — wrapper padrão com header
   ──────────────────────────────────────────── */

function Section({
  title, count, subtitle, icon, accent = "neutral", empty, children,
}: {
  title: string;
  count?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: "brand" | "neutral";
  empty?: string | null;
  children?: React.ReactNode;
}) {
  const titleColor = accent === "brand" ? "text-brand-500" : "text-white/85";
  const dotBg = accent === "brand" ? "bg-brand-500" : "bg-white/35";

  return (
    <div className="px-5 py-4">
      <div className="flex items-baseline gap-2 mb-3">
        {accent === "brand" && (
          <span className="relative flex w-1.5 h-1.5 shrink-0 self-center">
            <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-60" />
            <span className={`relative w-1.5 h-1.5 rounded-full ${dotBg}`} />
          </span>
        )}
        {icon}
        <h4 className={`text-[11.5px] font-bold ${titleColor}`}>{title}</h4>
        {count != null && <span className="text-[10px] font-mono tabular-nums text-white/35">{count}</span>}
        {subtitle && <span className="text-[10px] text-white/30">· {subtitle}</span>}
      </div>
      {empty && !children ? <p className="text-[11px] text-white/30">{empty}</p> : children}
    </div>
  );
}

function FilterPill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-colors ${
        active ? "bg-white/[0.08] text-white" : "text-white/45 hover:text-white/80 hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────
   MacroTable — Bloomberg-style tabular rows
   Colunas: time | impact | country | event | consensus | actual/surprise
   ──────────────────────────────────────────── */

function MacroTable({
  events, nowMinsBRT, status,
}: {
  events: EconomicEvent[];
  nowMinsBRT: number;
  status: "live" | "upcoming" | "past";
}) {
  return (
    <div className="divide-y divide-white/[0.03]">
      {events.map((ev) => (
        <MacroRow key={ev.id} ev={ev} nowMinsBRT={nowMinsBRT} status={status} />
      ))}
    </div>
  );
}

function MacroRow({ ev, nowMinsBRT, status }: { ev: EconomicEvent; nowMinsBRT: number; status: "live" | "upcoming" | "past" }) {
  const rel = relativeTimeBRT(ev.time ?? "", nowMinsBRT);
  const released = !!ev.actual;
  const isLive = status === "live";
  const isPast = status === "past";

  // Visual hierarchy:
  //  live    → brand column rail + pulse
  //  upcoming → neutral bright
  //  past    → dimmed
  const timeColor = isLive ? "text-brand-500" : isPast ? "text-white/40" : "text-white/85";
  const eventColor = isLive ? "text-white" : isPast ? "text-white/55" : "text-white/85";
  const showRelCountdown = (rel.kind === "soon" || rel.kind === "now") && !released;

  return (
    <div className="grid grid-cols-[64px_24px_44px_1fr_auto] gap-3 items-center py-2 px-1 group hover:bg-white/[0.015] transition-colors">
      {/* Coluna 1: horário + countdown opcional */}
      <div className="flex flex-col items-start">
        <span className={`text-[12px] font-mono tabular-nums font-bold ${timeColor}`}>
          {ev.time || "—"}
        </span>
        {showRelCountdown && (
          <span className={`text-[9.5px] font-mono tabular-nums ${rel.kind === "now" ? "text-brand-500" : "text-white/40"}`}>
            {rel.label}
          </span>
        )}
      </div>

      {/* Coluna 2: impact dots (convenção Forex Factory adaptada) */}
      <ImpactDots impact={ev.impact} muted={isPast} />

      {/* Coluna 3: país pill */}
      <span
        className="justify-self-start inline-flex items-center justify-center min-w-[34px] h-[18px] px-1.5 rounded text-[9px] font-bold font-mono tabular-nums bg-white/[0.05] text-white/65"
        title={`País ${ev.country}`}
      >
        {countryShort(ev.country)}
      </span>

      {/* Coluna 4: nome do evento */}
      <span className={`text-[12px] truncate ${eventColor}`}>{ev.event}</span>

      {/* Coluna 5: dado (consensus pre-release OU actual+surprise pos-release) */}
      <div className="flex items-center gap-3 shrink-0">
        {released ? (
          <div className="flex items-center gap-2 text-[10.5px] font-mono tabular-nums">
            <span className="text-white/30">
              <span className="text-white/50">cons </span>{ev.forecast ?? "—"}
            </span>
            <span className="text-white/30">
              <span className="text-white/50">real </span>
              <span className="text-white/85 font-semibold">{ev.actual}</span>
            </span>
            <SurpriseLabel ev={ev} />
          </div>
        ) : (ev.forecast || ev.previous) ? (
          <div className="text-[10.5px] font-mono tabular-nums">
            {ev.forecast && (
              <>
                <span className="text-white/35">cons </span>
                <span className={isPast ? "text-white/40" : "text-white/75 font-semibold"}>{ev.forecast}</span>
              </>
            )}
            {ev.forecast && ev.previous && <span className="text-white/15"> · </span>}
            {ev.previous && (
              <>
                <span className="text-white/30">ant </span>
                <span className={isPast ? "text-white/30" : "text-white/55"}>{ev.previous}</span>
              </>
            )}
          </div>
        ) : (
          <span className="text-[10.5px] font-mono text-white/25">—</span>
        )}

        {isLive && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-brand-500">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-60" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-brand-500" />
            </span>
            ao vivo
          </span>
        )}

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <LogTradeFromEventButton
            eventId={ev.id}
            eventLabel={ev.event}
            instruments={instrumentsForEvent(ev.event, ev.country)}
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}

function ImpactDots({ impact, muted = false }: { impact: "high" | "medium" | "low"; muted?: boolean }) {
  const count = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
  const filledColor = muted
    ? "bg-white/25"
    : impact === "high" ? "bg-brand-500" : "bg-white/55";
  return (
    <span className="inline-flex items-center gap-[2px]" title={`Impacto ${impact}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={`w-1 h-1 rounded-full ${i < count ? filledColor : "bg-white/[0.08]"}`} />
      ))}
    </span>
  );
}

function SurpriseLabel({ ev }: { ev: EconomicEvent }) {
  const s = surpriseFor(ev);
  if (!s) {
    return (
      <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-400/80 whitespace-nowrap">
        <span className="w-1 h-1 rounded-full bg-emerald-400" />saiu
      </span>
    );
  }
  const isBeat = s.delta > 0;
  const isNeutral = Math.abs(s.delta) < 0.001;
  const color = isNeutral ? "text-white/45" : isBeat ? "text-emerald-400" : "text-red-400";
  const sign = isBeat ? "+" : "";
  const display = s.pct != null ? `${sign}${s.pct.toFixed(1)}%` : `${sign}${s.delta.toFixed(2)}`;
  return (
    <span className={`text-[9.5px] font-mono font-semibold tabular-nums whitespace-nowrap ${color}`}
      title={`Surprise: ${display} (actual ${ev.actual} vs consenso ${ev.forecast})`}>
      {display}
    </span>
  );
}

/* ────────────────────────────────────────────
   Earnings — compacto, 1 linha por dia
   ──────────────────────────────────────────── */

function EarningsDayRow({ date, today, entries }: { date: string; today: string; entries: EarningsEntry[] }) {
  const isToday = date === today.replace(/-/g, "-");
  const dObj = new Date(`${date}T12:00:00`);
  const weekday = dObj.toLocaleDateString("pt-BR", { weekday: "short" });
  const label = dObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const major = entries.filter((e) => MAJOR_TICKERS.has(e.symbol));
  const visible = major.length > 0 ? major : entries.slice(0, 6);
  const hidden = entries.length - visible.length;

  return (
    <div className="grid grid-cols-[90px_1fr] gap-3 items-baseline">
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[11px] font-semibold capitalize ${isToday ? "text-brand-500" : "text-white/55"}`}>
          {isToday ? "Hoje" : weekday}
        </span>
        <span className="text-[10px] font-mono tabular-nums text-white/30">{label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {visible.map((e) => <EarningsPill key={e.symbol} entry={e} major={MAJOR_TICKERS.has(e.symbol)} />)}
        {hidden > 0 && (
          <span className="text-[10px] font-mono tabular-nums text-white/35">+{hidden}</span>
        )}
      </div>
    </div>
  );
}

function EarningsPill({ entry, major = false }: { entry: EarningsEntry; major?: boolean }) {
  const tip = `${entry.symbol} · ${hourLabel(entry.hour)}${entry.epsEstimate ? ` · EPS esperado ${entry.epsEstimate}` : ""}`;
  return (
    <a
      href={`https://www.tradingview.com/symbols/NASDAQ-${entry.symbol}/`}
      target="_blank"
      rel="noreferrer"
      title={tip}
      className={`inline-flex items-center gap-1 px-1.5 h-[18px] rounded text-[10px] font-mono font-semibold transition-colors ${
        major
          ? "bg-brand-500/[0.08] border border-brand-500/20 text-brand-300 hover:bg-brand-500/[0.14]"
          : "bg-white/[0.03] border border-white/[0.05] text-white/65 hover:border-white/[0.18] hover:text-white/90"
      }`}
    >
      {entry.symbol}
      {entry.hour === "bmo" && <span className="text-[8.5px] opacity-60">↑</span>}
      {entry.hour === "amc" && <span className="text-[8.5px] opacity-60">↓</span>}
    </a>
  );
}
