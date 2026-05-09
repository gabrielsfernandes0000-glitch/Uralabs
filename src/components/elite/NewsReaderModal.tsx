"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Clock, Loader2 } from "lucide-react";
import { categoryMeta, impactMeta, formatRelative, type MarketNews } from "@/lib/market-news";
import { NewsThumbFallback } from "@/components/elite/NewsThumbFallback";
import { applyT, useNewsLang } from "@/components/elite/NewsLangProvider";

interface ReadResponse {
  ok: boolean;
  id: string;
  headline: string;
  source: string;
  url: string;
  image_url: string | null;
  published_at: string;
  content: string;
  content_source: "jina" | "guardian" | "summary" | "none";
}

export function NewsReaderModal({
  item,
  onClose,
}: {
  item: MarketNews;
  onClose: () => void;
}) {
  // Optimistic: mostra summary imediato; em background pede Jina; substitui
  // quando chegar. Assim o modal abre instant e não "trava" esperando.
  const [data, setData] = useState<ReadResponse | null>(() => ({
    ok: true,
    id: item.id,
    headline: item.headline,
    source: item.source,
    url: item.url,
    image_url: item.imageUrl ?? null,
    published_at: item.publishedAt,
    content: item.summary ?? "",
    content_source: item.summary ? "summary" : "none",
  }));
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    // Counter de notícias lidas (achievement tracking). Contamos 1 por artigo único
    // aberto por sessão — evita inflar com múltiplos abres do mesmo item.
    try {
      const sessionKey = "elite_news_read_session";
      const readThisSession = JSON.parse(sessionStorage.getItem(sessionKey) ?? "[]") as string[];
      if (!readThisSession.includes(item.id)) {
        readThisSession.push(item.id);
        sessionStorage.setItem(sessionKey, JSON.stringify(readThisSession));
        const total = parseInt(localStorage.getItem("elite_news_read_count") ?? "0", 10);
        localStorage.setItem("elite_news_read_count", String(total + 1));
      }
    } catch { /* ignore storage errors */ }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose, item.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/news/read?id=${encodeURIComponent(item.id)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`http ${res.status}`);
        const json = (await res.json()) as ReadResponse;
        if (!cancelled && (json.content_source === "jina" || json.content_source === "guardian")) setData(json);
      } catch {
        /* mantém summary optimistic */
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [item.id]);

  const loading = fetching && data?.content_source === "summary";
  const error: string | null = null;

  const cat = categoryMeta(item.category);
  const imp = impactMeta(item.importance);
  const published = new Date(item.publishedAt);
  const { lang, translations, ensureTranslated } = useNewsLang();
  const view = applyT({ id: item.id, headline: item.headline, summary: item.summary ?? null }, lang, translations);

  // Body translation: só roda quando body "real" (jina/guardian) chegou e PT tá ligado
  const [bodyPt, setBodyPt] = useState<string | null>(null);
  const [translatingBody, setTranslatingBody] = useState(false);

  useEffect(() => {
    if (lang === "pt") {
      ensureTranslated([{ id: item.id, headline: item.headline, summary: item.summary ?? null }]);
    }
  }, [lang, item.id, item.headline, item.summary, ensureTranslated]);

  useEffect(() => {
    if (lang !== "pt") return;
    if (!data) return;
    if (data.content_source !== "jina" && data.content_source !== "guardian") return;
    if (!data.content || data.content.length < 40) return;
    if (bodyPt) return;

    let cancelled = false;
    setTranslatingBody(true);
    (async () => {
      try {
        const r = await fetch("/api/news/translate-body", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: data.id, content: data.content }),
        });
        if (!r.ok) return;
        const json = (await r.json()) as { ok: boolean; body?: string };
        if (!cancelled && json.ok && json.body) setBodyPt(json.body);
      } finally {
        if (!cancelled) setTranslatingBody(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, data, bodyPt]);

  const bodyText = lang === "pt" && bodyPt ? bodyPt : data?.content ?? "";
  const bodySource = data?.content_source ?? "none";

  return (
    <div
      className="modal-in-backdrop fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-in-panel relative w-full max-w-3xl rounded-2xl border border-white/[0.08] bg-[#0e0e10] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="interactive-tap absolute top-3 right-3 z-30 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] bg-black/40 backdrop-blur-sm border border-white/[0.06]"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Cover image */}
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#0a0a0c]">
          {item.imageUrl ? (
            <>
              <Image
                src={item.imageUrl}
                alt={item.headline}
                fill
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-cover"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0e0e10]" />
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}55, transparent)` }} />
            </>
          ) : (
            <NewsThumbFallback source={item.source} category={item.category} variant="hero" />
          )}
        </div>

        {/* Header meta */}
        <div className="relative z-10 px-6 lg:px-8 pt-6 pb-3">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: imp.dotBg }} />
            <span className="text-[11px] text-white/55" style={{ color: cat.accent }}>
              {cat.label}
            </span>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="text-[11px] text-white/55 text-white/55">{item.source}</span>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-white/35 font-mono tabular-nums">
              <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
              <span>{formatRelative(item.publishedAt)}</span>
            </span>
          </div>

          <h1 className="text-[20px] lg:text-[26px] font-bold text-white leading-[1.2] tracking-tight">
            {view.headline}
          </h1>

          <p className="text-[11px] text-white/30 font-mono tabular-nums mt-2">
            Publicado em {published.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        {/* Body — enquanto Jina busca mostra skeleton; depois mostra artigo completo */}
        <div className="relative z-10 px-6 lg:px-8 pb-5">
          {loading ? (
            <LoadingSkeleton summary={view.summary ?? undefined} />
          ) : error || !data ? (
            <ContentError summary={view.summary ?? undefined} />
          ) : (
            <>
              {translatingBody && (
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <Loader2 className="w-3 h-3 text-white/60 animate-spin" strokeWidth={2} />
                  <span className="text-[10.5px] font-semibold tracking-wider uppercase text-white/60">
                    Traduzindo artigo
                  </span>
                </div>
              )}
              <MarkdownContent text={bodyText} source={bodySource} fetching={false} />
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 z-20 px-6 lg:px-8 py-4 border-t border-white/[0.05] bg-[#0e0e10]/95 backdrop-blur-sm flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] text-white/35 leading-relaxed max-w-md">
            {loading
              ? "Buscando artigo completo…"
              : data?.content_source === "jina" || data?.content_source === "guardian"
                ? "Conteúdo editorial da fonte. Pra ler no layout original, abra no site."
                : "Resumo editorial. Artigo completo só no site do publisher."}
          </p>
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.10] bg-white/[0.02] text-[12px] font-semibold text-white/80 hover:text-white hover:border-white/[0.20]"
          >
            Abrir no {item.source}
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ContentLoader() {
  return (
    <div className="flex flex-col items-center py-10">
      <Loader2 className="w-5 h-5 text-white/40 animate-spin mb-3" strokeWidth={1.8} />
      <p className="text-[12px] text-white/40">Buscando artigo completo…</p>
    </div>
  );
}

/**
 * Loading state — mostra o summary já disponível como "preview" discreto +
 * skeleton shimmer por baixo que simula o artigo completo vindo. Zero aviso
 * de erro/aviso até o fetch terminar.
 */
function LoadingSkeleton({ summary }: { summary?: string }) {
  return (
    <div className="space-y-4">
      {/* Header com spinner inline e texto informativo claro */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
        <Loader2 className="w-3 h-3 text-white/60 animate-spin" strokeWidth={2} />
        <span className="text-[10.5px] font-semibold tracking-wider uppercase text-white/60">
          Carregando artigo completo
        </span>
      </div>

      {/* Summary já exibido (se existe) */}
      {summary && (
        <p className="text-[13.5px] text-white/70 leading-[1.75]">{summary}</p>
      )}

      {/* Skeleton shimmer simulando parágrafos do artigo */}
      <div className="space-y-3 pt-2">
        {[100, 96, 88, 100, 92, 72].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded bg-white/[0.05] animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function ContentError({ summary }: { summary?: string }) {
  return (
    <div className="space-y-3">
      {summary && (
        <p className="text-[13px] text-white/70 leading-[1.7]">{summary}</p>
      )}
      <p className="text-[11px] text-white/35 italic">
        Não foi possível extrair o artigo completo — o publisher pode ter bloqueio ativo. Abra no original pra ler.
      </p>
    </div>
  );
}

/**
 * Render markdown simples: parágrafos, negrito, itálico, links, headings, listas.
 * Não instalamos react-markdown pra não inflar bundle; parsing básico é suficiente
 * pro conteúdo editorial do Jina Reader.
 */
function MarkdownContent({ text, source, fetching = false }: { text: string; source: string; fetching?: boolean }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const hasContent = blocks.length > 0;
  const isFallbackSource = !fetching && source !== "jina" && source !== "guardian";

  // Sem conteúdo + fonte fallback = publisher bloqueou extração e não temos summary.
  // Em vez de aviso amarelo seguido de vazio, dá uma mensagem direta no corpo.
  if (!hasContent && isFallbackSource) {
    return (
      <div className="rounded-lg bg-white/[0.02] px-5 py-8 text-center">
        <p className="text-[12.5px] text-white/55 leading-relaxed max-w-md mx-auto">
          Esta fonte não permite extração do artigo aqui. Use o botão abaixo pra abrir no site original.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFallbackSource && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-amber-400/20 text-[11px] text-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden />
          Artigo completo não disponível aqui. Veja o resumo abaixo ou abra o original.
        </div>
      )}
      {blocks.slice(0, 40).map((block, i) => (
        <Block key={i} text={block} />
      ))}
    </div>
  );
}

function Block({ text }: { text: string }) {
  // Heading
  const hMatch = /^(#{1,6})\s+(.+)$/.exec(text);
  if (hMatch) {
    const level = hMatch[1].length;
    const content = hMatch[2];
    if (level <= 2) {
      return <h3 className="text-[16px] lg:text-[18px] font-bold text-white/90 leading-tight mt-5 mb-1">{renderInline(content)}</h3>;
    }
    return <h4 className="text-[14px] font-bold text-white/85 leading-tight mt-4 mb-1">{renderInline(content)}</h4>;
  }

  // Imagem sozinha na linha — renderiza como figure com caption
  const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(text);
  if (imgMatch) {
    const alt = imgMatch[1].replace(/^Image\s+\d+:?\s*/i, "").trim();
    const src = imgMatch[2];
    if (!isValidArticleImage(src, alt)) return null;
    return (
      <figure className="my-5 rounded-lg overflow-hidden border border-white/[0.06] bg-[#0a0a0c]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-auto max-h-[520px] object-contain block mx-auto"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        {alt && alt.length > 15 && (
          <figcaption className="px-4 py-2.5 text-[11px] text-white/45 leading-relaxed border-t border-white/[0.04]">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }

  // Lista (linhas começando com -, *, ou n.)
  if (/^(\s*[-*]|\s*\d+\.)\s+/m.test(text)) {
    const items = text.split(/\n/).map((l) => l.replace(/^(\s*[-*]|\s*\d+\.)\s+/, "").trim()).filter(Boolean);
    return (
      <ul className="space-y-1.5 list-disc list-outside pl-5">
        {items.map((it, i) => (
          <li key={i} className="text-[13.5px] text-white/70 leading-[1.65]">{renderInline(it)}</li>
        ))}
      </ul>
    );
  }

  // Parágrafo normal — filtra se é só ![img] residual
  if (/^!\[.*?\]/.test(text.trim())) return null;

  return <p className="text-[13.5px] text-white/70 leading-[1.75]">{renderInline(text)}</p>;
}

/**
 * Só aceita imagens que parecem ser fotos reais do conteúdo.
 * Rejeita logos, ícones, tracking pixels, avatares de autor, SVG de navegação.
 */
function isValidArticleImage(src: string, alt: string = ""): boolean {
  if (!src.startsWith("http")) return false;
  const lower = src.toLowerCase();

  // Rejeita logos e ícones genéricos
  if (/\/(logo|icon|favicon|sprite|pixel|tracker)[-_./]/i.test(lower)) return false;
  if (/\blogo\.(svg|png|jpe?g|webp)(\?|$)/i.test(lower)) return false;
  if (/(static-redesign\.cnbcfm\.com\/dist|static\..*\/dist\/)/i.test(lower)) return false;

  // Rejeita fotos de autor/editor/byline (pequenas, ficam pixeladas esticadas)
  if (/\/(author|authors|avatar|avatars|byline|bylines|profile|profiles|writer|writers|staff|contributor|contributors|user-content)[-_./]/i.test(lower)) return false;
  if (/\b(author|avatar|byline|headshot|profile)\.(jpe?g|png|webp)/i.test(lower)) return false;

  // Rejeita muito pequenos (thumbnails/tracking)
  if (/[?&](w|width)=(16|24|32|48|64|80|96|120)\b/i.test(lower)) return false;
  if (/[?&]size=(small|thumb|avatar|profile)\b/i.test(lower)) return false;

  // SVG é tipicamente logo/icon
  if (/\.svg(\?|$)/i.test(lower)) return false;

  // Heurística por alt: nomes de pessoa (2 palavras capitalizadas curtas) = foto de autor
  if (alt && alt.length < 30 && /^[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}$/.test(alt.trim())) return false;

  return true;
}

/**
 * Renderiza inline markdown sem regex complexa: **bold**, *italic*, [link](url).
 * Ignora imagens e HTML inline.
 */
function renderInline(text: string): React.ReactNode {
  // Tokenize: alternate between plain and formatted
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  let lastEnd = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastEnd) {
      parts.push(<span key={idx++}>{text.slice(lastEnd, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={idx++} className="text-white/90 font-semibold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={idx++} className="px-1 py-0.5 rounded bg-white/[0.05] font-mono text-[12px] text-white/80">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        parts.push(
          <a
            key={idx++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C9A461] hover:text-[#D4B474] underline decoration-white/20 underline-offset-2"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    } else if (token.startsWith("*")) {
      parts.push(<em key={idx++} className="italic text-white/75">{token.slice(1, -1)}</em>);
    }
    lastEnd = match.index + token.length;
  }
  if (lastEnd < text.length) {
    parts.push(<span key={idx++}>{text.slice(lastEnd)}</span>);
  }
  return parts.length > 0 ? <>{parts}</> : text;
}
