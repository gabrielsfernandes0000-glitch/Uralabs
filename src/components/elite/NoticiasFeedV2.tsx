"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Clock, Filter, Newspaper, SearchX, ChevronDown } from "lucide-react";
import { categoryMeta, impactMeta, formatRelative, type MarketNews } from "@/lib/market-news";
import { NewsReaderModal } from "@/components/elite/NewsReaderModal";
import { NewsThumbFallback } from "@/components/elite/NewsThumbFallback";
import { BookmarkButton } from "@/components/elite/BookmarkButton";
import { LogTradeFromNewsButton } from "@/components/elite/LogTradeFromEventButton";
import { useReadState } from "@/hooks/useReadState";
import { useWatchlist } from "@/hooks/useWatchlist";
import { clusterNews, scoreNews } from "@/lib/news-urgency";
import { applyT, useNewsLang } from "./NewsLangProvider";
import { NOTICIAS_FILTER_KEY, NOTICIAS_FILTER_EVENT } from "./NoticiasStripBar";

const INITIAL_ROWS = 12;

/**
 * Feed V2 — grid de cards uniforme com imagem/fallback.
 * Read state dimma as já clicadas. Collapse/expand após INITIAL_ROWS.
 */
export function NoticiasFeedV2({
  feed,
  filtersActive = false,
  filtersBar,
}: {
  feed: MarketNews[];
  filtersActive?: boolean;
  filtersBar?: React.ReactNode;
}) {
  const [openItem, setOpenItem] = useState<MarketNews | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [watchlistFilterActive, setWatchlistFilterActive] = useState(false);
  const prefetched = useRef<Set<string>>(new Set());
  const { isRead, markRead } = useReadState();
  const { items: watchlist } = useWatchlist();
  const { lang, translations, ensureTranslated } = useNewsLang();

  // Sincroniza com o toggle "Só watchlist" do StripBar. Quando ativo, o CSS
  // global esconde cards fora da watchlist — se mantemos o slice de 12,
  // o user vê quase nada porque a maioria dos 12 fica display:none. Solução:
  // quando filtro ativo, render TODOS os clusters (sem slice) e CSS cuida
  // de esconder os não-matched. Sem botão "Ver mais" enganoso.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setWatchlistFilterActive(localStorage.getItem(NOTICIAS_FILTER_KEY) === "1");
    } catch {}
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail;
      if (detail) setWatchlistFilterActive(detail.enabled);
    };
    window.addEventListener(NOTICIAS_FILTER_EVENT, onChange);
    return () => window.removeEventListener(NOTICIAS_FILTER_EVENT, onChange);
  }, []);

  // Cluster similar headlines — mesma notícia em várias fontes vira 1 item + badge "+3 fontes"
  const clusters = useMemo(() => {
    const nowMs = Date.now();
    return clusterNews(feed, (n) => scoreNews(n, nowMs, watchlist));
  }, [feed, watchlist]);

  const displayed = clusters;

  // Filtro de watchlist via CSS escapa do React: pular slice quando ativo.
  const skipSlice = watchlistFilterActive || expanded;
  const visible = skipSlice ? displayed : displayed.slice(0, INITIAL_ROWS);
  const overflowCount = watchlistFilterActive ? 0 : Math.max(0, displayed.length - INITIAL_ROWS);

  // Quando liga PT, pede tradução do feed INTEIRO (não só visível). Assim "ver
  // mais" não precisa esperar nem retriggerar fetch — já chega traduzido.
  useEffect(() => {
    if (lang !== "pt") return;
    ensureTranslated(
      clusters.map((c) => ({ id: c.primary.id, headline: c.primary.headline, summary: c.primary.summary ?? null })),
    );
  }, [lang, clusters, ensureTranslated]);

  const handleOpen = (item: MarketNews, duplicateIds: string[] = []) => {
    markRead(item.id);
    // Marca o cluster inteiro como lido — 5 versões da mesma história = 1 clique
    duplicateIds.forEach((id) => markRead(id));
    if (/news\.google\.com\/rss\/articles/i.test(item.url)) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }
    setOpenItem(item);
  };

  const handlePrefetch = (item: MarketNews) => {
    if (prefetched.current.has(item.id)) return;
    if (/news\.google\.com\/rss\/articles/i.test(item.url)) return;
    prefetched.current.add(item.id);
    fetch(`/api/news/read?id=${encodeURIComponent(item.id)}`, { cache: "no-store", keepalive: true }).catch(() => prefetched.current.delete(item.id));
  };

  return (
    <>
      <div className="animate-in-up">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-1 h-4 rounded-full bg-white/[0.25]" />
          <h2 className="text-[12px] font-bold text-white/80">Manchetes</h2>
          <span className="text-[10.5px] text-white/30 flex items-center gap-1.5">
            <Filter className="w-3 h-3" strokeWidth={2} />
            {feed.length} {feed.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {filtersBar && (
          <div className="mb-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
            {filtersBar}
          </div>
        )}

        {feed.length === 0 ? (
          <EmptyFeed filtersActive={filtersActive} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visible.map((cluster, i) => {
                const view = applyT(cluster.primary, lang, translations);
                return (
                  <div
                    key={cluster.primary.id}
                    data-filterable-news
                    data-news-category={cluster.primary.category}
                    data-headline-upper={`${cluster.primary.headline} ${cluster.primary.summary ?? ""} ${view.headline} ${view.summary ?? ""}`.toUpperCase()}
                    className="animate-in-fade"
                    style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                  >
                    <HeroCard
                      item={cluster.primary}
                      displayHeadline={view.headline}
                      dupeCount={cluster.duplicates.length}
                      onOpen={() => handleOpen(cluster.primary, cluster.duplicates.map((d) => d.id))}
                      onPrefetch={handlePrefetch}
                      read={isRead(cluster.primary.id)}
                    />
                  </div>
                );
              })}
            </div>

            {overflowCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 w-full py-3 rounded-xl surface-panel text-[11px] font-semibold text-white/55 hover:text-white/85 hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-1.5"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2} />
                {expanded ? "Recolher" : `Ver mais ${overflowCount} manchetes`}
              </button>
            )}
          </>
        )}
      </div>

      {openItem && <NewsReaderModal item={openItem} onClose={() => setOpenItem(null)} />}
    </>
  );
}

/* ────────────────────────────────────────────
   Hero card — top 3 com imagem
   ──────────────────────────────────────────── */

function HeroCard({
  item,
  displayHeadline,
  dupeCount = 0,
  onOpen,
  onPrefetch,
  read,
}: {
  item: MarketNews;
  displayHeadline: string;
  dupeCount?: number;
  onOpen: () => void;
  onPrefetch?: (n: MarketNews) => void;
  read: boolean;
}) {
  const cat = categoryMeta(item.category);
  const imp = impactMeta(item.importance);

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={onPrefetch ? () => onPrefetch(item) : undefined}
        onFocus={onPrefetch ? () => onPrefetch(item) : undefined}
        className={`interactive text-left relative overflow-hidden rounded-xl surface-card hover:border-white/[0.18] flex flex-col w-full transition-opacity ${
          read ? "opacity-55 hover:opacity-85" : ""
        }`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0a0a0c]">
          {item.imageUrl ? (
            <>
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10]/50 via-transparent to-transparent" />
            </>
          ) : (
            <NewsThumbFallback source={item.source} category={item.category} variant="card" />
          )}
        </div>
        <div className="relative z-10 p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: imp.dotBg }} />
            <span className="text-[11px]" style={{ color: cat.accent }}>{cat.label}</span>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="text-[11px] text-white/55">{item.source}</span>
          </div>
          <h4 className="text-[13px] font-semibold text-white/90 leading-snug line-clamp-3 group-hover:text-white mb-2">
            {displayHeadline}
          </h4>
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] text-white/35 font-mono tabular-nums inline-flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
              {formatRelative(item.publishedAt)}
            </span>
            {dupeCount > 0 && (
              <span className="text-[11px] text-white/35">
                +{dupeCount} {dupeCount === 1 ? "fonte" : "fontes"}
              </span>
            )}
          </div>
        </div>
      </button>
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 bg-[#0a0a0c]/85 backdrop-blur-sm rounded-lg border border-white/[0.08] p-0.5">
        <BookmarkButton id={item.id} headline={item.headline} url={item.url} source={item.source} publishedAt={item.publishedAt} />
        <LogTradeFromNewsButton newsId={item.id} headline={item.headline} />
      </div>
    </div>
  );
}

function EmptyFeed({ filtersActive }: { filtersActive: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] py-14 flex flex-col items-center text-center px-6">
      {filtersActive ? (
        <>
          <SearchX className="w-8 h-8 text-white/25 mb-3.5" strokeWidth={1.5} />
          <p className="text-[13px] font-semibold text-white/70 mb-1">Sem resultados pros filtros atuais</p>
          <p className="text-[11px] text-white/40 max-w-sm leading-relaxed">Alargue o período, mude a categoria ou limpe a busca pra ver mais.</p>
        </>
      ) : (
        <>
          <Newspaper className="w-8 h-8 text-white/25 mb-3.5" strokeWidth={1.5} />
          <p className="text-[13px] font-semibold text-white/70 mb-1">Feed vazio</p>
          <p className="text-[11px] text-white/40">Próxima sincronização em até 15min.</p>
        </>
      )}
    </div>
  );
}
