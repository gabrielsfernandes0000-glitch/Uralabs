"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, TrendingUp, TrendingDown, Radio, Newspaper, Calendar, ArrowRight } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Volume2, Square } from "lucide-react";
import { computeSurprise } from "@/lib/economic-events";
import { impactMeta, formatRelative, type EconomicEvent, type MarketNews } from "@/lib/market-news";
import { scoreEvent, scoreNews } from "@/lib/news-urgency";
import { diarioNewTradeUrl } from "@/lib/trade-prefill";

/**
 * NowCard — o único hero da /noticias. O sistema decide o conteúdo baseado em urgência:
 *
 *   Prioridade 1: Evento alto impacto com ETA < 30min → countdown gigante + valores
 *   Prioridade 2: Release alto impacto acabou de sair (<15min) com surpresa → surpresa + reação
 *   Prioridade 3: Killzone ativa (10:30-12:00 BRT) → foco de operação + próxima release
 *   Prioridade 4: Manchete top importance=high nas últimas 2h
 *   Prioridade 5: Próximo evento qualquer impacto
 *
 * Tem TTS. Tem CTA. Não compete com outros cards — é O card.
 */

export function NowCard({ events, news }: { events: EconomicEvent[]; news: MarketNews[] }) {
  const [now, setNow] = useState<Date | null>(null);
  const { items: watchlist } = useWatchlist();

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <NowCardSkeleton />;

  const state = decideState(events, news, now, watchlist);

  switch (state.kind) {
    case "imminent":     return <ImminentEventCard state={state} />;
    case "just-released": return <JustReleasedCard state={state} />;
    case "killzone":     return <KillzoneFocusCard state={state} />;
    case "top-headline": return <TopHeadlineCard state={state} />;
    case "next-event":   return <NextEventCard state={state} />;
    case "idle":         return <IdleCard state={state} />;
  }
}

function NowCardSkeleton() {
  return <div className="rounded-xl bg-white/[0.02] h-[180px] animate-pulse" />;
}

/* ────────────────────────────────────────────
   Decisão de estado — qual card renderizar
   ──────────────────────────────────────────── */

type NowState =
  | { kind: "imminent"; event: EconomicEvent; etaMins: number }
  | { kind: "just-released"; event: EconomicEvent; ageMins: number }
  | { kind: "killzone"; nextEvent: EconomicEvent | null; minsUntilEnd: number }
  | { kind: "top-headline"; news: MarketNews }
  | { kind: "next-event"; event: EconomicEvent; etaMins: number }
  | { kind: "idle"; brHour: number };

function parseMins(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function decideState(events: EconomicEvent[], news: MarketNews[], now: Date, watchlist: string[]): NowState {
  const brTotal = ((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes();
  const weekday = now.getUTCDay();
  const isWeekday = weekday >= 1 && weekday <= 5;
  const nowMs = now.getTime();

  // Watchlist priority — eventos/news que batem com watchlist dão boost via scoreEvent/scoreNews.
  // Ordena events por score decrescente e pega o top de cada categoria.
  const eventsScored = [...events].sort((a, b) => scoreEvent(b, brTotal, watchlist) - scoreEvent(a, brTotal, watchlist));
  const newsScored = [...news].sort((a, b) => scoreNews(b, nowMs, watchlist) - scoreNews(a, nowMs, watchlist));

  // 1. Evento alto impacto iminente (ETA < 30min, > 0) — se houver match de watchlist, prioriza esse
  const imminent = eventsScored.find((e) => {
    if (e.impact !== "high") return false;
    if (e.actual) return false;
    const m = parseMins(e.time);
    if (m === null) return false;
    const eta = m - brTotal;
    return eta >= 0 && eta < 30;
  });
  if (imminent) {
    const eta = parseMins(imminent.time)! - brTotal;
    return { kind: "imminent", event: imminent, etaMins: eta };
  }

  // 2. Release recém-saído (< 15min) com surpresa relevante
  const recentReleased = eventsScored.find((e) => {
    if (!e.actual) return false;
    const m = parseMins(e.time);
    if (m === null) return false;
    const age = brTotal - m;
    return age >= 0 && age < 15 && e.impact === "high";
  });
  if (recentReleased) {
    const age = brTotal - parseMins(recentReleased.time)!;
    return { kind: "just-released", event: recentReleased, ageMins: age };
  }

  // 3. Killzone ativa
  if (isWeekday && brTotal >= 10 * 60 + 30 && brTotal < 12 * 60) {
    const nextEv = eventsScored.find((e) => {
      const m = parseMins(e.time);
      return m !== null && m >= brTotal;
    }) ?? null;
    return { kind: "killzone", nextEvent: nextEv, minsUntilEnd: 12 * 60 - brTotal };
  }

  // 4. Manchete top importance=high nas últimas 2h — prioriza match com watchlist
  const recentTop = newsScored.find((n) => {
    if (n.importance !== "high") return false;
    const ageMs = now.getTime() - new Date(n.publishedAt).getTime();
    return ageMs < 2 * 3600 * 1000;
  });
  if (recentTop) {
    return { kind: "top-headline", news: recentTop };
  }

  // 5. Próximo evento qualquer impacto
  const nextAny = eventsScored.find((e) => {
    const m = parseMins(e.time);
    return m !== null && m >= brTotal;
  });
  if (nextAny) {
    const eta = parseMins(nextAny.time)! - brTotal;
    return { kind: "next-event", event: nextAny, etaMins: eta };
  }

  const brHour = Math.floor(brTotal / 60);
  return { kind: "idle", brHour };
}

const IMPACT_COLOR = {
  high:   "#FF5500",   // brand URA — high-impact é nossa prioridade
  medium: "#F59E0B",
  low:    "#9CA3AF",
};

const IMPACT_LABEL = {
  high: "Alto", medium: "Médio", low: "Baixo",
};

function formatEta(mins: number): string {
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

/* ────────────────────────────────────────────
   Variantes do NowCard
   ──────────────────────────────────────────── */

function CardShell({ children, accent = "#FF5500" }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10]">
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ backgroundColor: `${accent}40` }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ImminentEventCard({ state }: { state: Extract<NowState, { kind: "imminent" }> }) {
  const { event: ev, etaMins } = state;
  const m = impactMeta("high");

  return (
    <CardShell accent={m.dotBg}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: m.dotBg, opacity: 0.6 }} />
            <span className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.dotBg }} />
          </span>
          <span className="text-[11px] font-medium text-white/75">
            Release em {formatEta(etaMins)}
          </span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-[11px] font-medium" style={{ color: m.dotBg }}>Alto impacto</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <p className="text-[11px] text-white/40 mb-1">{ev.country}</p>
            <h2 className="text-[28px] md:text-[32px] font-semibold text-white leading-[1.1] tracking-tight">{ev.event}</h2>
            {(ev.previous || ev.forecast) && (
              <div className="flex items-baseline gap-5 mt-4 text-[12px] font-mono">
                {ev.previous && <span><span className="text-white/30 text-[11px]">ant </span><span className="text-white/70 tabular-nums">{ev.previous}</span></span>}
                {ev.forecast && <span><span className="text-white/30 text-[11px]">consenso </span><span className="text-white/70 tabular-nums">{ev.forecast}</span></span>}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[64px] font-semibold font-mono tabular-nums text-white leading-none">{ev.time}</p>
            <p className="text-[11px] text-white/40 mt-2">BRT</p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-end">
          <Link
            href={diarioNewTradeUrl({ context: `Trade preparado pra ${ev.event}`, sourceKind: "event", sourceId: ev.id, sourceLabel: ev.event })}
            className="interactive-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border transition-colors"
            style={{ color: m.dotBg, borderColor: `${m.dotBg}50` }}
          >
            Preparar trade <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </CardShell>
  );
}

function JustReleasedCard({ state }: { state: Extract<NowState, { kind: "just-released" }> }) {
  const { event: ev, ageMins } = state;
  const surprise = computeSurprise(ev.actual, ev.forecast);
  const dir = surprise?.direction;
  const accent = dir === "up" ? "#22C55E" : dir === "down" ? "#EF4444" : "rgba(255,255,255,0.45)";
  const DeltaIcon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : null;

  return (
    <CardShell accent={accent}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-medium" style={{ color: accent }}>
            Acabou de sair
          </span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-[11px] text-white/55">há {ageMins}min</span>
        </div>

        <p className="text-[11px] text-white/40 mb-1">{ev.country} · {ev.time}</p>
        <h2 className="text-[24px] font-semibold text-white leading-tight tracking-tight mb-4">{ev.event}</h2>

        <div className="grid grid-cols-3 gap-4 py-3 border-y border-white/[0.04]">
          <Metric label="Anterior" value={ev.previous} />
          <Metric label="Consenso" value={ev.forecast} />
          <Metric label="Real" value={ev.actual} highlight accent={accent} />
        </div>

        {surprise && DeltaIcon && (
          <div className="mt-4 flex items-start gap-2.5">
            <DeltaIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} strokeWidth={2} />
            <p className="text-[12.5px] text-white/75 leading-relaxed">
              Veio <span className="font-semibold" style={{ color: accent }}>{dir === "up" ? "acima" : dir === "down" ? "abaixo" : "em linha com"}</span> do consenso por <span className="font-mono font-semibold text-white">{surprise.label}</span>. Surpresa em release de alto impacto — volatilidade aumenta.
            </p>
          </div>
        )}
      </div>
    </CardShell>
  );
}

function Metric({ label, value, highlight, accent }: { label: string; value?: string; highlight?: boolean; accent?: string }) {
  return (
    <div>
      <p className="text-[11px] text-white/40 leading-none">{label}</p>
      <p className={`text-[20px] font-semibold font-mono tabular-nums mt-1.5 leading-none ${highlight ? "" : "text-white/65"}`} style={highlight && accent ? { color: accent } : undefined}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function KillzoneFocusCard({ state }: { state: Extract<NowState, { kind: "killzone" }> }) {
  const { nextEvent, minsUntilEnd } = state;

  return (
    <CardShell accent="#FF5500">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full animate-ping bg-brand-500 opacity-60" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-brand-500" />
          </span>
          <span className="text-[11px] font-medium text-white/75">
            Killzone ativa · termina em {formatEta(minsUntilEnd)}
          </span>
        </div>
        <h2 className="text-[22px] md:text-[26px] font-bold text-white leading-tight tracking-tight mb-2">
          Janela de maior edge — foco total
        </h2>
        <p className="text-[12.5px] text-white/60 leading-relaxed max-w-2xl">
          10:30–12:00 BRT é quando o NY open gera o movimento mais direcional do dia. Evite abrir abas novas e foque nos níveis mapeados no prep.
        </p>
        {nextEvent && (
          <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center gap-3">
            <Calendar className="w-3.5 h-3.5 text-white/40" strokeWidth={1.8} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/40">Próxima release</p>
              <p className="text-[12.5px] text-white/85 font-medium truncate">{nextEvent.event} <span className="text-white/40 font-normal">· {nextEvent.time} {nextEvent.country}</span></p>
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}

function TopHeadlineCard({ state }: { state: Extract<NowState, { kind: "top-headline" }> }) {
  const n = state.news;
  const ttsText = n.summary ? `${n.headline}. ${n.summary}` : n.headline;
  const tts = useTTS();
  const speaking = tts.speaking && tts.currentId === "now-headline";

  return (
    <CardShell accent="rgba(255,255,255,0.25)">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-white/45">
            Manchete · {n.source} · {formatRelative(n.publishedAt)}
          </span>
        </div>
        <h2 className="text-[22px] md:text-[26px] font-semibold text-white leading-tight tracking-tight mb-3">{n.headline}</h2>
        {n.summary && <p className="text-[12.5px] text-white/60 leading-relaxed line-clamp-3">{n.summary}</p>}
        <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between gap-3">
          {tts.supported && (
            <button
              type="button"
              onClick={() => tts.toggle(ttsText, "now-headline")}
              className={`interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors border ${
                speaking ? "border-white/25 text-white bg-white/[0.06]" : "border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.20]"
              }`}
            >
              {speaking ? <Square className="w-3 h-3" strokeWidth={2.2} /> : <Volume2 className="w-3 h-3" strokeWidth={2} />}
              {speaking ? "Parar" : "Ouvir"}
            </button>
          )}
          <a
            href={n.url}
            target="_blank"
            rel="noreferrer"
            className="interactive-tap inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium text-white border border-white/20 hover:border-white/40"
          >
            Ler fonte <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
          </a>
        </div>
      </div>
    </CardShell>
  );
}

function NextEventCard({ state }: { state: Extract<NowState, { kind: "next-event" }> }) {
  const { event: ev, etaMins } = state;
  const m = impactMeta(ev.impact);
  return (
    <CardShell accent={m.dotBg}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.dotBg }} />
          <span className="text-[11px] text-white/65">
            Próxima release em <span className="text-white font-medium">{formatEta(etaMins)}</span>
          </span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-[11px]" style={{ color: m.dotBg }}>{m.label} impacto</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] text-white/40 mb-1">{ev.country}</p>
            <h2 className="text-[18px] md:text-[20px] font-semibold text-white leading-tight tracking-tight">{ev.event}</h2>
          </div>
          <p className="text-[32px] font-semibold font-mono tabular-nums text-white leading-none shrink-0">{ev.time}</p>
        </div>
      </div>
    </CardShell>
  );
}

function IdleCard({ state }: { state: Extract<NowState, { kind: "idle" }> }) {
  const h = state.brHour;
  const msg = h < 6 ? "Madrugada — mercado quieto. Durma." :
              h < 10 ? "Pré-open calmo — sem release agendada. Revise watchlist." :
              h > 18 ? "After-hours sem releases. Planeje amanhã." :
              "Sem release agendada agora. Opere pelo gráfico.";
  return (
    <CardShell accent="rgba(255,255,255,0.15)">
      <div className="p-6">
        <p className="text-[11px] text-white/40 mb-2">Agora</p>
        <h2 className="text-[18px] md:text-[20px] font-medium text-white/85 leading-tight">{msg}</h2>
      </div>
    </CardShell>
  );
}
