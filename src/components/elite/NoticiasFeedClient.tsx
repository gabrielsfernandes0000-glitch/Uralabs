"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Newspaper, Filter, Clock, SearchX } from "lucide-react";
import { categoryMeta, impactMeta, formatRelative, type MarketNews } from "@/lib/market-news";
import { NewsReaderModal } from "@/components/elite/NewsReaderModal";
import { NewsThumbFallback } from "@/components/elite/NewsThumbFallback";

/**
 * Feed interativo (client). Recebe news do server, gerencia o modal de leitura.
 * Click em qualquer card → abre modal com artigo completo.
 * `agenda` é passada como children pra caber no mesmo grid do TopStory.
 */
export function NoticiasFeedClient({
  feed,
  filtersActive = false,
}: {
  feed: MarketNews[];
  filtersActive?: boolean;
}) {
  const [openItem, setOpenItem] = useState<MarketNews | null>(null);
  // Dedup de prefetch — cada artigo só dispara Jina fetch uma vez por sessão.
  // O /api/news/read já cacheia em `full_content`, então prefetch = cache warming.
  const prefetched = useRef<Set<string>>(new Set());

  // News com URL do Google News (Reuters) não dá pra extrair conteúdo —
  // o redirect é client-side com JS. Abre direto a fonte em nova aba.
  const handleOpen = (item: MarketNews) => {
    if (/news\.google\.com\/rss\/articles/i.test(item.url)) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }
    setOpenItem(item);
  };

  // Prefetch em hover/focus — dispara fetch em background pro artigo ficar
  // no cache DB quando o modal abrir. Fire-and-forget: erros são ignorados
  // (modal vai mostrar fallback de qualquer jeito).
  const handlePrefetch = (item: MarketNews) => {
    if (prefetched.current.has(item.id)) return;
    if (/news\.google\.com\/rss\/articles/i.test(item.url)) return;
    prefetched.current.add(item.id);
    fetch(`/api/news/read?id=${encodeURIComponent(item.id)}`, {
      cache: "no-store",
      keepalive: true,
    }).catch(() => prefetched.current.delete(item.id));
  };

  return (
    <>
      <div className="animate-in-up delay-3">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-1 h-4 rounded-full bg-white/[0.25]" />
          <h2 className="text-[12px] font-bold text-white/80 uppercase tracking-wider">Manchetes</h2>
          <span className="text-[10.5px] text-white/30 flex items-center gap-1.5">
            <Filter className="w-3 h-3" strokeWidth={2} />
            {feed.length} {feed.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {feed.length === 0 ? (
          <EmptyFeed filtersActive={filtersActive} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {feed.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={handleOpen} onPrefetch={handlePrefetch} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {openItem && <NewsReaderModal item={openItem} onClose={() => setOpenItem(null)} />}
    </>
  );
}

function EmptyFeed({ filtersActive }: { filtersActive: boolean }) {
  if (filtersActive) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] py-12 flex flex-col items-center text-center px-6">
        <SearchX className="w-8 h-8 text-white/25 mb-3.5" strokeWidth={1.5} />
        <p className="text-[13px] font-semibold text-white/70 mb-1">Sem resultados pros filtros atuais</p>
        <p className="text-[11px] text-white/40 max-w-sm leading-relaxed mb-4">
          Alargue o período, mude a categoria ou limpe a busca pra ver mais.
        </p>
        <Link
          href="/elite/noticias"
          className="interactive-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/[0.10] text-[11px] font-semibold text-white/70 hover:text-white hover:border-white/[0.20]"
        >
          Limpar filtros
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] py-14 flex flex-col items-center text-center">
      <Newspaper className="w-8 h-8 text-white/25 mb-3.5" strokeWidth={1.5} />
      <p className="text-[13px] font-semibold text-white/70 mb-1">Feed vazio por enquanto</p>
      <p className="text-[11px] text-white/40 max-w-sm leading-relaxed">
        Próxima sincronização em até 15min.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────
   News Card (grid)
   ──────────────────────────────────────────── */

function NewsCard({ item, onOpen, onPrefetch }: { item: MarketNews; onOpen: (n: MarketNews) => void; onPrefetch?: (n: MarketNews) => void }) {
  const cat = categoryMeta(item.category);
  const imp = impactMeta(item.importance);
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      onMouseEnter={onPrefetch ? () => onPrefetch(item) : undefined}
      onFocus={onPrefetch ? () => onPrefetch(item) : undefined}
      className="interactive text-left group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.18] flex flex-col w-full"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10]/40 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}55, transparent)` }} />
          </>
        ) : (
          <NewsThumbFallback source={item.source} category={item.category} variant="card" />
        )}
      </div>

      <div className="relative z-10 p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: imp.dotBg }} />
          <span className="text-[8.5px] font-bold tracking-[0.22em] uppercase" style={{ color: cat.accent }}>
            {cat.label}
          </span>
          <span className="text-white/15 text-[10px]">·</span>
          <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-white/55">{item.source}</span>
        </div>

        <h4 className="text-[13px] font-semibold text-white/90 leading-snug line-clamp-3 group-hover:text-white mb-2">
          {item.headline}
        </h4>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-[10px] text-white/35 font-mono tabular-nums inline-flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
            {formatRelative(item.publishedAt)}
          </span>
        </div>
      </div>
    </button>
  );
}
