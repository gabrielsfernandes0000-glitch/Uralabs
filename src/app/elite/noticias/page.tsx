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
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });

  return (
    <NewsLangProvider>
    <div className="space-y-5">
      {/* ── Header 1-line — substitui hero gigante ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap animate-in-up">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[14px] font-bold text-white/85 tracking-tight capitalize">{today}</h1>
          <span className="text-[11px] font-mono tabular-nums text-white/45">
            {totalEvents} {totalEvents === 1 ? "evento" : "eventos"}
          </span>
          {highImpact > 0 && (
            <>
              <span className="text-white/15 text-[10px]">·</span>
              <span className="text-[11px] font-mono tabular-nums text-brand-500">{highImpact} alto impacto</span>
            </>
          )}
          <TimestampAgo iso={new Date().toISOString()} prefix="sync" className="ml-2" />
        </div>
        <div className="flex items-center gap-2">
          <NewsLangToggle />
          <PushToggle />
        </div>
      </div>

      {/* ── Killzone banners (contextuais, só aparecem quando relevantes) ── */}
      <div className="space-y-2 empty:hidden">
        <KillzoneBanner />
        <KillzoneWarmup />
      </div>

      {/* ── Preço multi-ativo (NQ/BTC/ETH/DXY/GOLD) — rotação de risco numa linha ── */}
      <div className="animate-in-up">
        <MultiAssetTape snapshots={priceSnaps} />
      </div>

      {/* ── Regime bar — 4 indicadores de sentimento + dominance ── */}
      <div className="animate-in-up">
        <CryptoPulseBar
          fearGreedCrypto={fgSnapshot.crypto}
          fearGreedEquities={fgSnapshot.equities}
          globalStats={globalStats}
          altSeason={altSeason}
        />
      </div>

      {/* ── Strip horizontal — toggles + watchlist + add + drawer ── */}
      <div className="animate-in-up">
        <NoticiasStripBar />
      </div>

      {/* ── Hero full-width: NowCard + EventsTimeline ── */}
      <div className="space-y-5">
        <div className="animate-in-up">
          <NowCard events={events} news={news} />
        </div>
        <div className="animate-in-up">
          <EventsTimeline events={events} />
        </div>
      </div>

      {/* ── Conteúdo full-width abaixo do hero ── */}
      <div className="space-y-5">
        {/* Agenda estendida — calendário de eventos vem ANTES das manchetes
            (mais acionável pro trader: o que vai impactar o mercado hoje/semana) */}
        <div className="animate-in-up">
          <UpcomingAgenda events={events} earnings={earnings} today={today} />
        </div>

        {/* FedWatch — card único, segue a lógica macro */}
        <div className="animate-in-up">
          <FedProbCard prob={fedProb} />
        </div>

        {/* Feed de manchetes — 3 hero + lista compacta (contexto pós-agenda) */}
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
    </div>
    </NewsLangProvider>
  );
}

function FedProbCard({ prob }: { prob: Awaited<ReturnType<typeof fetchNextFedMeetingProb>> }) {
  if (!prob) return null; // escondido sem dados — evita ruído

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
        {rows.map(([label, pct]) => (
          <div key={label}>
            <p className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-white/35">{label}</p>
            <p className="text-[14px] font-bold font-mono tabular-nums text-white/85 mt-1">{(pct * 100).toFixed(0)}%</p>
            <div className="mt-1.5 h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full rounded-full bg-white/60" style={{ width: `${Math.min(100, pct * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
