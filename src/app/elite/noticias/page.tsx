import { Fragment } from "react";
import { CalendarClock, Check, Zap, BookOpen, TrendingUp, TrendingDown, Minus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { eventExplanation, eventCategory, computeSurprise, lessonsForCategory, instrumentsForEvent, type Surprise } from "@/lib/economic-events";
import { findLesson } from "@/lib/curriculum";
import { InstrumentFilterStyle } from "@/components/elite/InstrumentFilterStyle";
import { getSupabaseAnon } from "@/lib/supabase";
import {
  impactMeta,
  type EventImpact,
  type EconomicEvent,
  type MarketNews,
} from "@/lib/market-news";
import { NoticiasFeedClient } from "@/components/elite/NoticiasFeedClient";
import { NewsFiltersBar, CalendarFiltersBar } from "@/components/elite/NoticiasFilters";
import {
  parseNewsFilters,
  parseCalendarFilters,
  scoreThreshold,
  periodHours,
  calendarDateRange,
  hasActiveNewsFilters,
  type NewsFilters,
  type CalendarFilters as CalFilters,
} from "@/lib/noticias-filters";
import type { NewsCategory } from "@/lib/market-news";

/* ────────────────────────────────────────────
   Notícias — agenda econômica + manchetes.
   Server Component: fetch Supabase. Cards interativos via NoticiasFeedClient
   (client-side pra gerenciar modal de leitura).
   ──────────────────────────────────────────── */

export const revalidate = 60;

export type CategoryCounts = Record<"all" | NewsCategory, number>;

async function loadData(
  newsFilters: NewsFilters,
  calFilters: CalFilters,
): Promise<{ events: EconomicEvent[]; news: MarketNews[]; counts: CategoryCounts }> {
  const sb = getSupabaseAnon();
  const { from: calFrom, to: calTo } = calendarDateRange(calFilters.period);
  const hours = periodHours(newsFilters.period);
  const sincePeriod = new Date(Date.now() - hours * 3600_000).toISOString();
  const minScore = scoreThreshold(newsFilters.score);

  // Calendar query
  let calQuery = sb
    .from("economic_events")
    .select("id, event_time, country, event, impact, previous, forecast, actual, event_date")
    .gte("event_date", calFrom)
    .lte("event_date", calTo);

  if (calFilters.impact === "high") {
    calQuery = calQuery.eq("impact", "high");
  } else {
    calQuery = calQuery.in("impact", ["high", "medium"]);
  }

  if (calFilters.country !== "all") {
    if (calFilters.country === "other") {
      calQuery = calQuery.not("country", "in", "(US,EU,BR,UK,CN,JP)");
    } else {
      calQuery = calQuery.eq("country", calFilters.country);
    }
  }
  calQuery = calQuery.order("event_date").order("event_time", { ascending: true });

  // News query — IGNORA cat filter aqui pra que a lista carregada cubra todas as categorias.
  // Filtro de categoria aplicado em memória + counts computados a partir do mesmo dataset.
  let newsQuery = sb
    .from("market_news_deduped")
    .select("id, source, headline, summary, url, image_url, category, importance, published_at, full_content_source, relevance_score")
    .neq("source", "Reuters")
    .not("url", "ilike", "%news.google.com/rss/articles%")
    .gte("relevance_score", minScore)
    .or("image_url.not.is.null,full_content_source.not.is.null")
    .gte("published_at", sincePeriod);

  if (newsFilters.q.trim().length >= 2) {
    // Simple ilike no headline+summary (full-text search seria via RPC pra melhor performance)
    const q = `%${newsFilters.q.replace(/%/g, "\\%")}%`;
    newsQuery = newsQuery.or(`headline.ilike.${q},summary.ilike.${q}`);
  }

  newsQuery = newsQuery
    .order("relevance_score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(80);

  const [eventsRes, newsRes] = await Promise.all([calQuery, newsQuery]);

  const events: EconomicEvent[] = (eventsRes.data ?? []).map((r: any) => ({
    id: r.id,
    time: r.event_time ?? "",
    country: r.country,
    event: r.event,
    impact: r.impact,
    previous: r.previous ?? undefined,
    forecast: r.forecast ?? undefined,
    actual: r.actual ?? undefined,
  }));

  const allNews: MarketNews[] = (newsRes.data ?? []).map((r: any) => ({
    id: r.id,
    source: r.source,
    headline: r.headline,
    summary: r.summary ?? undefined,
    url: r.url,
    imageUrl: r.image_url ?? undefined,
    category: r.category,
    importance: r.importance,
    publishedAt: r.published_at,
  }));

  const counts: CategoryCounts = { all: allNews.length, general: 0, forex: 0, crypto: 0, stocks: 0 };
  for (const n of allNews) counts[n.category]++;

  const news = newsFilters.cat === "all" ? allNews.slice(0, 30) : allNews.filter((n) => n.category === newsFilters.cat).slice(0, 30);

  return { events, news, counts };
}

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const newsFilters = parseNewsFilters(sp);
  const calFilters = parseCalendarFilters(sp);
  const { events, news, counts: catCounts } = await loadData(newsFilters, calFilters);
  const filtersActive = hasActiveNewsFilters(newsFilters);

  const counts: Record<EventImpact, number> = { high: 0, medium: 0, low: 0 };
  events.forEach((e) => counts[e.impact]++);

  // Featured event — próximo evento de alto/médio impacto (prioridade: high > medium).
  // Eventos já vêm ordenados por date/time asc do loadData.
  const nowMinsNy = nyNowMinutes();
  const upcomingEvents = events.filter((e) => {
    const m = parseEventMinutes(e.time);
    return m === null || m >= nowMinsNy;
  });
  const featuredEvent =
    upcomingEvents.find((e) => e.impact === "high") ??
    upcomingEvents[0] ??
    events[0] ??
    null;

  const highlights = news.filter((n) => n.importance === "high").length;
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });

  return (
    <div className="space-y-5">
      {/* ───── HERO compacto ───── */}
      <div className="animate-in-up relative overflow-hidden rounded-2xl bg-[#0e0e10] border border-white/[0.06]">
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
          <span
            className="font-black tracking-tighter whitespace-nowrap select-none opacity-[0.025] text-[#C9A461] pr-10"
            style={{ fontSize: "150px", letterSpacing: "-0.06em", lineHeight: 1 }}
          >
            NOTÍCIAS
          </span>
        </div>
        <div className="absolute top-[-40%] left-[5%] w-[500px] h-[280px] bg-[#C9A461]/[0.04] blur-[140px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A461]/35 to-transparent" />

        <div className="relative z-10 p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full bg-[#C9A461] animate-pulse" />
                <span className="text-[9.5px] font-bold tracking-[0.3em] uppercase text-[#C9A461]">
                  Mercado · ao vivo
                </span>
              </div>
              <h1 className="text-[26px] lg:text-[30px] font-bold text-white tracking-tight leading-[1.05]">
                Notícias
              </h1>
              <p className="text-[12.5px] text-white/45 mt-2 max-w-lg leading-relaxed">
                Agenda econômica filtrada por impacto e manchetes relevantes das últimas 12 horas.
                Sem spam, sem clickbait, só o que movimenta preço.
              </p>
            </div>
            <div className="flex items-end gap-5">
              <div className="text-right">
                <p className="text-[24px] lg:text-[28px] font-bold text-white leading-none font-mono tabular-nums">
                  {events.length}
                </p>
                <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-1">eventos</p>
              </div>
              <div className="h-7 w-px bg-white/[0.08]" />
              <div className="text-right">
                <p className="text-[24px] lg:text-[28px] font-bold text-red-400/90 leading-none font-mono tabular-nums">
                  {counts.high}
                </p>
                <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-1">alto impacto</p>
              </div>
              <div className="h-7 w-px bg-white/[0.08]" />
              <div className="text-right">
                <p className="text-[24px] lg:text-[28px] font-bold text-white leading-none font-mono tabular-nums">
                  {highlights}
                </p>
                <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-1">top stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── FILTROS de NEWS ───── */}
      <div className="animate-in-up delay-1 rounded-xl border border-white/[0.05] bg-[#0e0e10]/50 p-3">
        <NewsFiltersBar
          current={newsFilters}
          counts={catCounts}
          resultLabel={news.length === catCounts.all ? `${news.length} manchetes` : `${news.length} de ${catCounts.all}`}
        />
      </div>

      {/* ───── HERO: FEATURED EVENT + AGENDA ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start">
        <div className="animate-in-up delay-1">
          {featuredEvent ? <FeaturedEventCard event={featuredEvent} /> : <EmptyFeaturedEvent />}
        </div>
        <div className="animate-in-up delay-2">
          <AgendaPanel events={events} today={today} calFilters={calFilters} />
        </div>
      </div>

      {/* ───── FEED DE MANCHETES ───── */}
      <NoticiasFeedClient feed={news} filtersActive={filtersActive} />
    </div>
  );
}

/* ────────────────────────────────────────────
   Featured Event — hero principal com explicação PT-BR
   ──────────────────────────────────────────── */

function FeaturedEventCard({ event: ev }: { event: EconomicEvent }) {
  const m = impactMeta(ev.impact);
  const explanation = eventExplanation(ev.event);
  const category = eventCategory(ev.event);
  const evMins = parseEventMinutes(ev.time);
  const nowMins = nyNowMinutes();
  const diffMins = evMins !== null ? evMins - nowMins : null;
  const isUpcoming = diffMins !== null && diffMins >= 0;
  const isNow = diffMins !== null && diffMins >= 0 && diffMins < 15;
  const released = !!ev.actual;
  const surprise = released ? computeSurprise(ev.actual, ev.forecast) : null;

  // Aulas do currículo recomendadas pra revisar antes de operar esse evento
  const relatedLessonIds = lessonsForCategory(category);
  const relatedLessons = relatedLessonIds
    .map((id) => {
      const found = findLesson(id);
      return found ? { id: found.lesson.id, title: found.lesson.title, moduleAccent: found.mod.accentHex } : null;
    })
    .filter((x): x is { id: string; title: string; moduleAccent: string } => x !== null)
    .slice(0, 3);

  // Densidade de informação: sem explicação + sem valores meaningful = card compacto.
  // Evita espaço vazio quando evento obscuro (ex: Loan Prime Rate sem descrição).
  const hasValues = !!(ev.previous || ev.forecast || ev.actual);
  const isSparse = !explanation && !released;

  // ── Modo compacto — pouco info, card minimal ──
  if (isSparse) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10]">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${m.dotBg}55, transparent)` }}
        />
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-3.5 h-3.5" strokeWidth={2} style={{ color: m.dotBg }} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: m.dotBg }}>
              Próximo evento
            </span>
            {isUpcoming && diffMins !== null && (
              <>
                <span className="text-white/15 text-[10px]">·</span>
                <div className="flex items-center gap-1.5">
                  {isNow && <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />}
                  <span className="text-[11px] font-mono tabular-nums text-white/60">{etaLabel(diffMins)}</span>
                </div>
              </>
            )}
            <span className={`ml-auto text-[9.5px] font-bold tracking-[0.22em] uppercase ${m.color}`}>
              · {m.label}
            </span>
          </div>

          <div className="flex items-end gap-5">
            <div className="shrink-0">
              <p className="text-[44px] font-bold font-mono tabular-nums text-white leading-none">{ev.time || "—"}</p>
              <p className="text-[10px] text-white/35 font-mono uppercase tracking-[0.22em] mt-2">
                {countryCode(ev.country)} · ET
              </p>
            </div>
            <div className="h-[70px] w-px bg-white/[0.06]" />
            <div className="min-w-0 flex-1 pb-0.5">
              <p className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-white/30 mb-1.5">
                {category === "outros" ? "Indicador" : category}
              </p>
              <h3 className="text-[18px] font-bold text-white leading-[1.2] tracking-tight">{ev.event}</h3>
              {hasValues && (
                <div className="flex items-center gap-4 mt-2.5 text-[10.5px] font-mono">
                  {ev.previous && (
                    <span className="inline-flex items-baseline gap-1">
                      <span className="uppercase tracking-wider text-[8.5px] text-white/25">ant</span>
                      <span className="text-white/55 tabular-nums">{ev.previous}</span>
                    </span>
                  )}
                  {ev.forecast && (
                    <span className="inline-flex items-baseline gap-1">
                      <span className="uppercase tracking-wider text-[8.5px] text-white/25">prev</span>
                      <span className="text-white/55 tabular-nums">{ev.forecast}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {relatedLessons.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-wrap items-center gap-2">
              <BookOpen className="w-3 h-3 text-white/30 shrink-0" strokeWidth={2} />
              <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-white/35 mr-1">Prepare-se:</span>
              {relatedLessons.map((l) => (
                <Link
                  key={l.id}
                  href={`/elite/aulas/${l.id}`}
                  className="interactive-tap inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/[0.06] hover:border-white/[0.18] transition-colors text-[10.5px] font-semibold text-white/65 hover:text-white group"
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: l.moduleAccent }} />
                  {l.title}
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-30 group-hover:opacity-80 transition-opacity" strokeWidth={2.2} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Modo completo — evento com explicação, valores, ou released ──
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10]">
      {/* Glow sutil no canto superior direito */}
      <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[240px] rounded-full opacity-[0.12] blur-[120px] pointer-events-none"
        style={{ backgroundColor: m.dotBg }} />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, transparent, ${m.dotBg}66, transparent)` }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" strokeWidth={2} style={{ color: m.dotBg }} />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: m.dotBg }}>
            {released ? "Evento concluído" : isUpcoming ? "Próximo evento" : "Em andamento"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isUpcoming && diffMins !== null && (
            <div className="flex items-center gap-1.5">
              {isNow && <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />}
              <span className="text-[11px] font-mono tabular-nums text-white/70">{etaLabel(diffMins)}</span>
            </div>
          )}
          <span className={`text-[9.5px] font-bold tracking-[0.22em] uppercase ${m.color}`}>· {m.label} impacto</span>
        </div>
      </div>

      {/* Corpo */}
      <div className="relative z-10 px-6 py-5">
        <div className="flex items-start gap-5">
          {/* Time + country */}
          <div className="shrink-0">
            <p className="text-[42px] font-bold font-mono tabular-nums text-white leading-none">{ev.time || "—"}</p>
            <p className="text-[10px] text-white/35 font-mono uppercase tracking-[0.22em] mt-2">
              {countryCode(ev.country)} · ET
            </p>
          </div>

          <div className="h-[80px] w-px bg-white/[0.06]" />

          {/* Nome + categoria */}
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-white/35 mb-1.5">
              {category === "outros" ? "Indicador" : category}
            </p>
            <h3 className="text-[22px] font-bold text-white leading-[1.15] tracking-tight">{ev.event}</h3>
          </div>
        </div>

        {/* Explicação */}
        {explanation ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-white/30 mt-0.5 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-white/40 mb-1.5">o que é</p>
                <p className="text-[13px] text-white/75 leading-relaxed">{explanation.what}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-white/30 mt-0.5 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-white/40 mb-1.5">por que importa</p>
                <p className="text-[13px] text-white/75 leading-relaxed">{explanation.whyMatters}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-white/25 mt-0.5 shrink-0" strokeWidth={1.8} />
            <p className="text-[12.5px] text-white/50 leading-relaxed italic">
              Indicador econômico sem descrição detalhada disponível. Acompanhe os valores (anterior/previsto/real) pra comparar com o consenso — surpresas vs. expectativa é o que move preço.
            </p>
          </div>
        )}

        {/* Números — só renderiza se tem pelo menos um dado */}
        {(ev.previous || ev.forecast || ev.actual) && (
          <div className="mt-6 pt-5 border-t border-white/[0.04]">
            <p className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-white/35 mb-3">
              Números que o mercado vai comparar
            </p>
            <div className="grid grid-cols-3 gap-4">
              <StatBlock
                label="Anterior"
                sublabel="último resultado divulgado"
                value={ev.previous}
              />
              <StatBlock
                label="Consenso"
                sublabel="o que o mercado espera"
                value={ev.forecast}
              />
              <StatBlock
                label="Real"
                sublabel={released ? "resultado divulgado agora" : "sai quando o evento acontecer"}
                value={ev.actual}
                highlight={released}
                surprise={surprise}
              />
            </div>
            {released && surprise && (
              <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5 flex items-start gap-2.5">
                <div className={`shrink-0 mt-0.5 ${
                  surprise.direction === "up" ? "text-emerald-400" :
                  surprise.direction === "down" ? "text-red-400" : "text-white/40"
                }`}>
                  {surprise.direction === "up" ? <TrendingUp className="w-4 h-4" strokeWidth={2} /> :
                   surprise.direction === "down" ? <TrendingDown className="w-4 h-4" strokeWidth={2} /> :
                   <Minus className="w-4 h-4" strokeWidth={2} />}
                </div>
                <p className="text-[11.5px] text-white/65 leading-relaxed">
                  {surprise.direction === "flat" ? (
                    <>Veio <span className="font-semibold text-white/80">em linha com o consenso</span> — impacto geralmente menor no preço.</>
                  ) : (
                    <>Resultado <span className="font-semibold text-white/85">{surprise.direction === "up" ? "acima" : "abaixo"} do consenso</span> por <span className="font-mono text-white/85">{surprise.label}</span>. Surpresas movem preço — compare com a direção esperada em "Por que importa" acima.</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Aulas relacionadas — bridge curriculum ↔ evento */}
        {!released && relatedLessons.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-white/35" strokeWidth={1.8} />
              <p className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-white/35">
                Pra se preparar — revise antes
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedLessons.map((l) => (
                <Link
                  key={l.id}
                  href={`/elite/aulas/${l.id}`}
                  className="interactive-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-white/70 hover:text-white hover:border-white/[0.18] transition-colors group"
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: l.moduleAccent }} />
                  {l.title}
                  <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBlock({ label, sublabel, value, highlight, surprise }: {
  label: string;
  sublabel: string;
  value?: string;
  highlight?: boolean;
  surprise?: Surprise | null;
}) {
  const hasValue = !!value;
  const displayValue = value ?? "—";
  return (
    <div>
      <p className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-white/40">{label}</p>
      <p className="text-[10.5px] text-white/30 leading-snug mt-1 mb-3">{sublabel}</p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className={`text-[22px] font-bold font-mono tabular-nums leading-none ${
          hasValue ? (highlight ? "text-white" : "text-white/75") : "text-white/15"
        }`}>
          {displayValue}
        </p>
        {surprise && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono tabular-nums font-semibold ${
            surprise.direction === "up" ? "text-emerald-400/90" :
            surprise.direction === "down" ? "text-red-400/90" : "text-white/40"
          }`}>
            {surprise.direction === "up" && "↑"}
            {surprise.direction === "down" && "↓"}
            {surprise.direction === "flat" && "≈"}
            {surprise.label}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyFeaturedEvent() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10] py-20 flex flex-col items-center text-center px-6">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
        <CalendarClock className="w-5 h-5 text-white/30" strokeWidth={1.8} />
      </div>
      <p className="text-[14px] font-semibold text-white/75 mb-1.5">Mercado calmo hoje</p>
      <p className="text-[12px] text-white/40 max-w-sm leading-relaxed">
        Sem evento relevante na agenda econômica. Confira a semana no painel ao lado — dia pra operar o que o gráfico entrega.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────
   Agenda Panel (server component — estático)
   ──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   Helpers de tempo — comparação em ET (NY)
   ──────────────────────────────────────────── */

function nyNowMinutes(): number {
  const s = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

function parseEventMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function etaLabel(diffMins: number): string {
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `em ${diffMins}min`;
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return m > 0 ? `em ${h}h${String(m).padStart(2, "0")}` : `em ${h}h`;
}

function countryCode(country: string): string {
  const map: Record<string, string> = { US: "EUA", EU: "UE", BR: "BR", UK: "UK", CN: "CN", JP: "JP", CA: "CA", AU: "AU", NZ: "NZ" };
  return map[country] ?? country;
}

function AgendaPanel({ events, today, calFilters }: { events: EconomicEvent[]; today: string; calFilters: CalFilters }) {
  const headerLabel = calFilters.period === "today" ? "Hoje no Mercado" : calFilters.period === "tomorrow" ? "Amanhã" : "Próxima Semana";
  const isToday = calFilters.period === "today";
  const nowMins = isToday ? nyNowMinutes() : -1;

  // Separa passado vs futuro (só pro "hoje")
  const past: EconomicEvent[] = [];
  const future: EconomicEvent[] = [];
  if (isToday) {
    for (const ev of events) {
      const m = parseEventMinutes(ev.time);
      if (m !== null && m < nowMins && !ev.actual) past.push(ev);
      else if (m !== null && m < nowMins && ev.actual) past.push(ev);
      else future.push(ev);
    }
  }

  const ordered: EconomicEvent[] = isToday ? [...past, ...future] : events;
  const nextEv = isToday ? future[0] : events[0];
  const nextEta = nextEv ? (() => {
    const m = parseEventMinutes(nextEv.time);
    return m !== null && isToday ? etaLabel(Math.max(0, m - nowMins)) : null;
  })() : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <CalendarClock className="w-4 h-4 text-white/60" strokeWidth={1.8} />
          <h2 className="text-[13px] font-bold text-white/85 uppercase tracking-wider">{headerLabel}</h2>
        </div>
        {nextEta ? (
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono tabular-nums text-white/60">próximo {nextEta}</span>
          </div>
        ) : (
          <p className="text-[10.5px] text-white/35">{today}</p>
        )}
      </div>

      <div className="relative z-30 px-5 py-2.5 border-b border-white/[0.04]">
        <CalendarFiltersBar current={calFilters} />
      </div>

      <InstrumentFilterStyle />
      <div className="relative z-0 max-h-[460px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-10 px-5 text-center">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-2.5">
              <CalendarClock className="w-4 h-4 text-white/25" />
            </div>
            <p className="text-[12.5px] font-semibold text-white/70 mb-1">Mercado calmo</p>
            <p className="text-[11px] text-white/40 max-w-xs leading-relaxed">
              Sem evento relevante no filtro atual. Dia pra operar o que o gráfico entrega.
            </p>
          </div>
        ) : (
          <div className="relative py-1">
            {/* Timeline rail vertical */}
            <div className="absolute left-[64px] top-4 bottom-4 w-px bg-white/[0.04]" aria-hidden />
            {ordered.map((ev, i) => {
              const showNow = isToday && i === past.length && past.length > 0 && future.length > 0;
              const isPast = isToday && past.includes(ev);
              return (
                <Fragment key={ev.id}>
                  {showNow && <NowDivider />}
                  <EventRow event={ev} isPast={isPast} />
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative z-10 px-5 py-2 border-t border-white/[0.05] flex items-center justify-between">
        <p className="text-[9.5px] font-mono text-white/30 tracking-wider uppercase">ET (NY) · impacto ≥ médio</p>
      </div>
    </div>
  );
}

function NowDivider() {
  return (
    <div className="relative flex items-center gap-3 px-5 py-2.5" aria-label="Agora">
      <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-amber-400/80 w-16 text-right pr-2">agora</span>
      <span className="relative flex-1 h-px bg-gradient-to-r from-amber-400/40 via-amber-400/10 to-transparent">
        <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      </span>
    </div>
  );
}

function EventRow({ event: ev, isPast }: { event: EconomicEvent; isPast: boolean }) {
  const m = impactMeta(ev.impact);
  const isHigh = ev.impact === "high";
  const released = !!ev.actual;
  const hasValues = ev.previous || ev.forecast || ev.actual;
  const instruments = instrumentsForEvent(ev.event, ev.country).join(" ");

  return (
    <div
      data-filterable-event
      data-instruments={instruments}
      className={`relative px-5 py-3 transition-colors hover:bg-white/[0.02] ${isPast ? "opacity-45" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Coluna time + country — mais prominente */}
        <div className="shrink-0 w-16 text-right pt-0.5">
          <p className="text-[17px] font-bold font-mono tabular-nums text-white leading-none">{ev.time || "—"}</p>
          <p className="text-[9.5px] text-white/40 font-mono uppercase tracking-[0.18em] mt-2">{countryCode(ev.country)}</p>
        </div>

        {/* Dot no rail */}
        <div className="shrink-0 relative w-4 pt-2 flex justify-center">
          <span
            className="w-2 h-2 rounded-full shrink-0 relative z-10"
            style={{
              backgroundColor: m.dotBg,
              boxShadow: isHigh && !isPast ? `0 0 0 3px ${m.dotBg}22` : undefined,
            }}
          />
        </div>

        {/* Evento + valores */}
        <div className="min-w-0 flex-1 pr-1 pt-0.5">
          <div className="flex items-start gap-2">
            <h4 className="text-[12.5px] font-semibold text-white/90 leading-tight flex-1">{ev.event}</h4>
            {released && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.2em] uppercase text-emerald-400/80 mt-0.5">
                <Check className="w-2.5 h-2.5" strokeWidth={2.6} />
              </span>
            )}
          </div>

          {hasValues && (
            <div className="flex items-center gap-3 text-[10.5px] font-mono mt-1">
              {ev.previous && (
                <span className="inline-flex items-baseline gap-1">
                  <span className="uppercase tracking-[0.12em] text-[8.5px] text-white/25">ant</span>
                  <span className="text-white/55 tabular-nums">{ev.previous}</span>
                </span>
              )}
              {ev.forecast && (
                <span className="inline-flex items-baseline gap-1">
                  <span className="uppercase tracking-[0.12em] text-[8.5px] text-white/25">prev</span>
                  <span className="text-white/55 tabular-nums">{ev.forecast}</span>
                </span>
              )}
              {ev.actual && (
                <span className="inline-flex items-baseline gap-1">
                  <span className="uppercase tracking-[0.12em] text-[8.5px] text-white/40">real</span>
                  <span className="text-white font-semibold tabular-nums">{ev.actual}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
