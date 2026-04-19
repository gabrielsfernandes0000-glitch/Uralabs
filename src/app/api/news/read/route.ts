import { NextResponse } from "next/server";
import { getSupabaseAnon } from "@/lib/supabase";

/**
 * GET /api/news/read?id=xxx
 * Lê a notícia completa.
 *
 * Estratégia de cache:
 * 1. Se `full_content` já está no DB, retorna imediato (instant).
 * 2. Se não, chama Jina Reader, grava no DB, retorna.
 * 3. Em caso de falha, retorna só o summary do Finnhub.
 *
 * Primeira visita a um artigo = 2-6s (Jina). Segunda em diante = ~50ms (DB cache).
 */

export const dynamic = "force-dynamic";

// Jina Reader key — free tier 200k req/mês. Sem key compartilha rate limit global
// com anônimos (=> bloqueios aleatórios por domínio). Com key, isolado.
const JINA_KEY = process.env.JINA_API_KEY ?? "jina_6c5df26a802b48d59beddc26dd33cea9V6X-g3RPPSGHpt_M-Qbs3B_o9a5L";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const sb = getSupabaseAnon();
  const { data, error } = await sb
    .from("market_news")
    .select("id, headline, source, url, summary, image_url, published_at, full_content, full_content_source, full_content_fetched_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  // Cache hit: já temos o conteúdo extraído (jina OU guardian OU qualquer fonte confiável)
  if (data.full_content && data.full_content_source) {
    return NextResponse.json({
      ok: true,
      id: data.id,
      headline: data.headline,
      source: data.source,
      url: data.url,
      image_url: data.image_url,
      published_at: data.published_at,
      content: data.full_content,
      content_source: data.full_content_source,
      cached: true,
    });
  }

  // Cache miss: tenta Jina Reader (exceto Google News redirects — Reuters bloqueado)
  let content = data.summary ?? "";
  let contentSource: "jina" | "summary" | "none" = data.summary ? "summary" : "none";
  const isGoogleNewsRedirect = /news\.google\.com\/rss\/articles/i.test(data.url);

  if (!isGoogleNewsRedirect) {
    // Tenta 2 engines em sequência. Readability é melhor (filtra nav/ads) mas
    // falha em páginas minimalistas; direct é mais bruto mas sempre retorna algo.
    const attempts: Array<{ engine: "readability" | "direct"; timeout: number }> = [
      { engine: "readability", timeout: 10_000 },
      { engine: "direct",      timeout: 8_000  },
    ];

    for (const { engine, timeout } of attempts) {
      try {
        const r = await fetch(`https://r.jina.ai/${data.url}`, {
          headers: {
            Authorization: `Bearer ${JINA_KEY}`,
            Accept: "text/markdown, text/plain",
            "User-Agent": "Mozilla/5.0 (compatible; URALabs/1.0; +https://uralabs.com.br)",
            "X-Return-Format": "markdown",
            "X-Engine": engine,
            "X-Remove-Selector": "header, nav, footer, aside, .ad, .advertisement, .newsletter, [class*='subscribe'], [class*='cookie'], [class*='related'], [class*='share'], [class*='social']",
          },
          signal: AbortSignal.timeout(timeout),
        });
        if (!r.ok) continue;
        const raw = await r.text();
        const cleaned = cleanMarkdown(raw);
        if (cleaned && cleaned.length > 400) {
          content = cleaned;
          contentSource = "jina";
          break; // sucesso, não tenta próximo engine
        }
      } catch {
        // próximo engine
      }
    }
  }

  // Persiste no DB pra cache hit na próxima chamada (fire-and-forget)
  if (contentSource === "jina") {
    sb
      .from("market_news")
      .update({
        full_content: content,
        full_content_source: contentSource,
        full_content_fetched_at: new Date().toISOString(),
      })
      .eq("id", id)
      .then(() => { /* ignora erro */ });
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    headline: data.headline,
    source: data.source,
    url: data.url,
    image_url: data.image_url,
    published_at: data.published_at,
    content,
    content_source: contentSource,
    cached: false,
  });
}

/**
 * Limpa markdown do Jina Reader — remove boilerplate, navegação, ads.
 * Corta em sections-fim tipo "Trending Now", "Related Articles", disclaimer.
 */
function cleanMarkdown(raw: string): string {
  let t = raw;

  // Jina header
  t = t.replace(/^(?:Title|URL Source|Published Time|Warning|Markdown Content):.*\n/gim, "");

  // Navegação/cookies/subscribe line-based
  t = t.replace(/^.*(Skip Navigation|Subscribe for|Sign up for|Accept Cookies?|Manage Cookies|Advertisement|Sign In|Log In|Register|Newsletter|Create Free Account|CREATE FREE ACCOUNT|Follow us on|Share this article|Pre-Markets|Livestream|Copy link|X \(Twitter\)|LinkedInFacebook|Share\s*$|Facebook\s*Email\s*$).*$/gim, "");

  // Imagens markdown com quebra de linha no meio — colapsa primeiro
  // Ex: "![alt text\nmultiline](url)" vira uma linha só
  t = t.replace(/!\[([^\]]*?)\]/gs, (match, p1) => `![${p1.replace(/\s*\n\s*/g, " ")}]`);

  // Imagens que seguem formato "![...](newline...url)" — une
  t = t.replace(/\]\s*\n\s*\(/g, "](");

  // Linhas que são puramente um link — ex: [](url), [Markets](...)
  t = t.replace(/^\s*\[\s*\]\(.*?\)\s*$/gm, "");
  t = t.replace(/^\[[^\]]+\]\([^)]+\)\s*$/gm, "");

  // Corta em marcadores de fim de artigo comuns
  const endMarkers = [
    /\n#+\s*Trending Now\s*\n/i,
    /\n#+\s*Related Articles?\s*\n/i,
    /\n#+\s*Read More\s*\n/i,
    /\n#+\s*More from [^\n]+\n/i,
    /\nThis site is now part of\s/i,
    /\nPrivacy Policy\s/i,
    /\nYour Privacy Choices/i,
    /\n© \d{4}/,
    /\nAll rights reserved/i,
    /\nBy continuing, you agree/i,
    /\nWritten by\s+[A-Z]/,
    /\nReviewed by\s+[A-Z]/,
    /\nEdited by\s+[A-Z]/,
    /\nReporting by\s+[A-Z]/,
    /\nAdditional reporting/i,
  ];
  for (const m of endMarkers) {
    const i = t.search(m);
    if (i > 300) t = t.slice(0, i);
  }

  // Colapsa linhas vazias múltiplas
  t = t.replace(/\n{3,}/g, "\n\n");

  // Pula navegação até o primeiro parágrafo substancial
  const lines = t.split("\n");
  let articleStart = 0;
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i].trim();
    if (line.length > 80 && !line.startsWith("#") && !line.startsWith("![") && !line.startsWith("[")) {
      articleStart = Math.max(0, i - 2);
      break;
    }
  }
  t = lines.slice(articleStart).join("\n");

  return t.trim();
}
