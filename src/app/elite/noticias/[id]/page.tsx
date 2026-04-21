import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Clock } from "lucide-react";
import { getSupabaseAnon } from "@/lib/supabase";
import { categoryMeta, impactMeta, formatRelative, type MarketNews } from "@/lib/market-news";

export const revalidate = 60;

async function loadNews(id: string): Promise<MarketNews | null> {
  const sb = getSupabaseAnon();
  const { data, error } = await sb
    .from("market_news")
    .select("id, source, headline, summary, url, image_url, category, importance, published_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    source: data.source,
    headline: data.headline,
    summary: data.summary ?? undefined,
    url: data.url,
    imageUrl: data.image_url ?? undefined,
    category: data.category,
    importance: data.importance,
    publishedAt: data.published_at,
  };
}

async function loadRelated(exclude: string, category: string): Promise<MarketNews[]> {
  const sb = getSupabaseAnon();
  const { data } = await sb
    .from("market_news")
    .select("id, source, headline, url, image_url, category, importance, published_at")
    .eq("category", category)
    .neq("id", exclude)
    .order("published_at", { ascending: false })
    .limit(4);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    source: r.source,
    headline: r.headline,
    url: r.url,
    imageUrl: r.image_url ?? undefined,
    category: r.category,
    importance: r.importance,
    publishedAt: r.published_at,
  }));
}

export default async function NewsReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await loadNews(id);
  if (!item) notFound();

  const related = await loadRelated(item.id, item.category);
  const cat = categoryMeta(item.category);
  const imp = impactMeta(item.importance);
  const published = new Date(item.publishedAt);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/elite/noticias"
        className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar pra Notícias</span>
      </Link>

      <article className="animate-in-up relative overflow-hidden rounded-2xl bg-white/[0.02]">
        {/* Cover image */}
        {item.imageUrl && (
          <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#0a0a0c]">
            <Image
              src={item.imageUrl}
              alt={item.headline}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0e0e10]" />
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}55, transparent)` }} />
          </div>
        )}

        {/* Header meta */}
        <div className="relative z-10 px-6 lg:px-8 pt-6 pb-3">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: imp.dotBg }} />
            <span className="text-[9.5px] font-bold tracking-[0.25em] uppercase" style={{ color: cat.accent }}>
              {cat.label}
            </span>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/55">{item.source}</span>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-white/35 font-mono tabular-nums">
              <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
              <span>{formatRelative(item.publishedAt)}</span>
            </span>
          </div>

          <h1 className="text-[22px] lg:text-[30px] font-bold text-white leading-[1.15] tracking-tight">
            {item.headline}
          </h1>

          <p className="text-[11px] text-white/30 font-mono tabular-nums mt-3">
            Publicado em {published.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        {/* Body */}
        <div className="relative z-10 px-6 lg:px-8 pb-6">
          {item.summary ? (
            <div className="prose prose-invert max-w-none">
              {item.summary.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="text-[14px] lg:text-[15px] text-white/70 leading-[1.75] mb-4">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-white/40 italic">
              Essa notícia não tem resumo disponível. Abra o original pra ler completa.
            </p>
          )}

          <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-3">
            <p className="text-[11px] text-white/35 leading-relaxed max-w-md">
              Resumo editorial da fonte. Pra ler o artigo completo com gráficos e contexto adicional, abra o original.
            </p>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.10] bg-white/[0.02] text-[12px] font-semibold text-white/80 hover:text-white hover:border-white/[0.20]"
            >
              Ler no {item.source}
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <div className="animate-in-up delay-1">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-1 h-4 rounded-full bg-white/[0.25]" />
            <h2 className="text-[12px] font-bold text-white/80 uppercase tracking-wider">Relacionadas</h2>
            <span className="text-[10.5px] text-white/30">{cat.label}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {related.map((r) => (
              <RelatedCard key={r.id} item={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedCard({ item }: { item: MarketNews }) {
  return (
    <Link
      href={`/elite/noticias/${item.id}`}
      className="interactive group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] flex gap-3 items-stretch hover:border-white/[0.18]"
    >
      {item.imageUrl ? (
        <div className="relative w-[110px] shrink-0 bg-[#0a0a0c]">
          <Image src={item.imageUrl} alt="" fill sizes="110px" className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-[6px] shrink-0" style={{ backgroundColor: categoryMeta(item.category).accent, opacity: 0.4 }} />
      )}
      <div className="flex-1 min-w-0 py-3 pr-4">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/55">{item.source}</span>
          <span className="text-white/15 text-[10px]">·</span>
          <span className="text-[10px] text-white/35 font-mono tabular-nums">{formatRelative(item.publishedAt)}</span>
        </div>
        <h4 className="text-[12.5px] font-semibold text-white/90 leading-snug line-clamp-3 group-hover:text-white">
          {item.headline}
        </h4>
      </div>
    </Link>
  );
}
