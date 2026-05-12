import { TrendingUp } from "lucide-react";
import { getSupabaseAnon } from "@/lib/supabase";
import type { EconomicEvent, MarketNews, NewsCategory } from "@/lib/market-news";
import { NoticiasFeedV2 } from "@/components/elite/NoticiasFeedV2";
import { NewsFiltersBar } from "@/components/elite/NoticiasFilters";
import { NewsLangProvider } from "@/components/elite/NewsLangProvider";
import { NewsLangToggle } from "@/components/elite/NewsLangToggle";
import { NowCard } from "@/components/elite/NowCard";
import { EventsTimeline } from "@/components/elite/EventsTimeline";
import { UpcomingAgenda } from "@/components/elite/UpcomingAgenda";
import { NoticiasStripBar } from "@/components/elite/NoticiasStripBar";
import { KillzoneBanner, KillzoneWarmup } from "@/components/elite/KillzoneBanner";
import { CryptoPulseBar } from "@/components/elite/CryptoPulseBar";
import { MultiAssetTape } from "@/components/elite/MultiAssetTape";
import { PushToggle } from "@/components/elite/PushToggle";
import { TimestampAgo } from "@/components/elite/LiveBadge";
import { NoticiasRealtimeListener } from "@/components/elite/NoticiasRealtimeListener";
import { fetchFearGreedSnapshot } from "@/lib/fear-greed";
import { fetchGlobalStats, fetchAltSeasonIndex } from "@/lib/crypto-pulse";
import { fetchUpcomingEarnings } from "@/lib/earnings";
import { fetchNextFedMeetingProb } from "@/lib/fed-watch";
import { fetchPriceSnapshots } from "@/lib/price-snapshot";
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

  let newsQuery = sb
    .from("market_news_deduped")
    .select("id, source, headline, summary, url, image_url, category, importance, published_at, full_content_source, relevance_score")
    .neq("source", "Reuters")
    .not("url", "ilike", "%news.google.com/rss/articles%")
    .gte("relevance_score", minScore)
    .or("image_url.not.is.null,full_content_source.not.is.null")
    .gte("published_at", sincePeriod);

  if (newsFilters.q.trim().length >= 2) {
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
  // Tudo junto: URA prefere a página chegar inteira em vez de skeletons +
  // pop-in de Suspense. Promise.all paralelo bloqueia até o último fetch
  // mas todas as APIs externas têm revalidate longo (1h fear-greed,
  // 30min crypto-pulse, 1h earnings) — só a 1ª visita cold-start é lenta.
  const [dataRes, fgSnapshot, globalStats, altSeason, earnings, fedProb, priceSnaps] = await Promise.all([
    loadData(newsFilters, calFilters),
    fetchFearGreedSnapshot().catch(() => ({ crypto: null, equities: null })),
    fetchGlobalStats().catch(() => null),
    fetchAltSeasonIndex().catch(() => null),
    fetchUpcomingEarnings(7).catch(() => []),
    fetchNextFedMeetingProb().catch(() => null),
    fetchPriceSnapshots(["NQ", "BTC", "ETH", "DXY", "GOLD"]).catch(() => ({} as Record<string, null>)),
  ]);
  const { events, news, counts: catCounts } = dataRes;
  const filtersActive = hasActiveNewsFilters(newsFilters);

  const totalEvents = events.length;
  const highImpact = events.filter((e) => e.impact === "high").length;
  // Sem `capitalize` CSS — string já é montada no formato certo. CSS capitalize
  // estraga pt-BR (quebra "quarta-feira" em "Quarta-Feira" e "06 de mai." em "06 De Mai.").
  const todayParts = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });
  const today = todayParts.charAt(0).toUpperCase() + todayParts.slice(1).replace(/ De /g, " de ");

  return (
    <NewsLangProvider>
    <NoticiasRealtimeListener />
    <div className="space-y-4 md:space-y-5">
      {/* ── Header — título primário + meta direita.
           Substitui o strip de data/count/sync que parecia chrome inflado.
           pl-12 lg:pl-0 evita colisão com o hambúrguer mobile (top-4 left-4). ── */}
      <header className="flex items-end justify-between gap-3 flex-wrap pb-1 pl-12 lg:pl-0 animate-in-up">
        <div className="min-w-0">
          <h1 className="text-[22px] md:text-[24px] font-bold text-white tracking-tight leading-none">Notícias</h1>
          <p className="text-[12px] text-white/40 mt-2 leading-tight flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-white/65">{today}</span>
            <span className="text-white/15 hidden sm:inline">·</span>
            <span className="font-mono tabular-nums">{totalEvents} {totalEvents === 1 ? "evento" : "eventos"}</span>
            {highImpact > 0 && (
              <>
                <span className="text-white/15 hidden sm:inline">·</span>
                <span className="font-mono tabular-nums text-brand-500">{highImpact} alto impacto</span>
              </>
            )}
            <TimestampAgo iso={new Date().toISOString()} prefix="sync" className="hidden md:inline-block" />
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <NewsLangToggle />
          <PushToggle />
        </div>
      </header>

      {/* ── Killzone banners (contextuais, só aparecem quando relevantes) ── */}
      <div className="space-y-2 empty:hidden">
        <KillzoneBanner />
        <KillzoneWarmup />
      </div>

      {/* ── Pulse: preços multi-ativo (linha 1) + regime/sentiment (linha 2)
           num único container. Corta 1 strip do topo e cria seção visual coesa. ── */}
      <div className="animate-in-up rounded-xl border border-white/[0.05] bg-[#0a0a0c] overflow-hidden">
        <MultiAssetTape snapshots={priceSnaps} />
        <div className="border-t border-white/[0.04]">
          <CryptoPulseBar
            fearGreedCrypto={fgSnapshot.crypto}
            fearGreedEquities={fgSnapshot.equities}
            globalStats={globalStats}
            altSeason={altSeason}
          />
        </div>
      </div>

      {/* ── Filtros + watchlist (compacto, separado pra não brigar com o pulse) ── */}
      <div className="animate-in-up">
        <NoticiasStripBar />
      </div>

      {/* ── Hero: NowCard + EventsTimeline lado-a-lado em desktop largo.
           Em mobile/tablet empilha. Reduz scroll vertical sem perder contexto. ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-4 animate-in-up">
        <NowCard events={events} news={news} />
        <EventsTimeline events={events} />
      </div>

      {/* ── Feed de manchetes (entra antes da agenda detalhada — usuário busca
           notícia, não calendário) ── */}
      <div className="animate-in-up">
        <NoticiasFeedV2
          feed={news}
          filtersActive={filtersActive}
          filtersBar={
            <NewsFiltersBar
              current={newsFilters}
              counts={catCounts}
              resultLabel={news.length === catCounts.all ? `${news.length} manchetes` : `${news.length} de ${catCounts.all}`}
            />
          }
        />
      </div>

      {/* ── Bloco macro de aprofundamento (FedWatch + agenda completa).
           Quem quer detalhe macro depois de ver as manchetes desce até aqui. ── */}
      <div className="space-y-4">
        <div className="animate-in-up">
          <FedProbCard prob={fedProb} />
        </div>
        <div className="animate-in-up">
          <UpcomingAgenda events={events} earnings={earnings} today={today} />
        </div>
      </div>
    </div>
    </NewsLangProvider>
  );
}

function FedProbCard({ prob }: { prob: Awaited<ReturnType<typeof fetchNextFedMeetingProb>> }) {
  if (!prob) return null;

  const meeting = new Date(`${prob.meetingDate}T00:00:00`);
  const meetingLabel = meeting.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const color = prob.dominant.direction === "cut" ? "#10B981" : prob.dominant.direction === "hike" ? "#EF4444" : "rgba(255,255,255,0.7)";

  const rows: Array<[string, number]> = [
    ["Corte 50bps", prob.cuts50],
    ["Corte 25bps", prob.cuts25],
    ["Manter", prob.hold],
    ["Alta 25bps", prob.hikes25],
    ["Alta 50bps", prob.hikes50],
  ];

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-white/55" strokeWidth={1.8} />
          <h3 className="text-[12px] font-bold text-white/75">FedWatch</h3>
          <span className="text-[10px] font-mono tabular-nums text-white/35">{meetingLabel}</span>
        </div>
        <span className="text-[14px] font-bold" style={{ color }}>
          {prob.dominant.label} <span className="text-white/40 text-[11px] font-mono">{(prob.dominant.pct * 100).toFixed(0)}%</span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {rows.map(([label, pct]) => {
          const isDominant = pct === prob.dominant.pct;
          return (
            <div key={label} className={`rounded-lg px-3 py-2 ${isDominant ? "border border-white/15 bg-white/[0.03]" : "border border-white/[0.04]"}`}>
              <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">{label}</p>
              <p className={`text-[15px] font-bold font-mono tabular-nums mt-0.5 ${isDominant ? "text-white" : "text-white/55"}`}>
                {(pct * 100).toFixed(0)}<span className="text-[10px] text-white/30">%</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
