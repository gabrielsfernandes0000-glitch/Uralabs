import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/news/translate-body
 * Body: { id: string, content: string }
 * Retorno: { body: string }
 *
 * Traduz corpo longo do artigo (markdown do Jina) preservando formatação.
 * Cache DB em market_news_translations.body_pt. Próximo abrir é instant.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MAX_CONTENT = 20000; // ~15k tokens input, seguro no Haiku

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "não autenticado" }, { status: 401 });

  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`news-translate-body:${ip}`, 20, 60);
  if (!allowed) return NextResponse.json({ ok: false, error: "rate limit" }, { status: 429 });

  let body: { id?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  const content = typeof body.content === "string" ? body.content.slice(0, MAX_CONTENT) : null;
  if (!id || !content) {
    return NextResponse.json({ ok: false, error: "missing id or content" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  const { data: cached } = await sb
    .from("market_news_translations")
    .select("body_pt")
    .eq("news_id", id)
    .maybeSingle();
  if (cached?.body_pt) {
    return NextResponse.json({ ok: true, body: cached.body_pt, cached: true });
  }

  let translated: string | null = null;
  if (ANTHROPIC_KEY) {
    try {
      translated = await translateWithClaude(content);
    } catch (err) {
      console.warn("[news-translate-body] claude failed:", err);
    }
  }
  if (!translated) {
    translated = await translateWithGoogle(content);
  }
  if (!translated) {
    return NextResponse.json({ ok: false, error: "translation failed" }, { status: 502 });
  }

  await sb
    .from("market_news_translations")
    .upsert({ news_id: id, body_pt: translated }, { onConflict: "news_id", ignoreDuplicates: false });

  return NextResponse.json({ ok: true, body: translated, cached: false });
}

async function translateWithClaude(markdown: string): Promise<string | null> {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY! });
  const prompt = `Traduza este artigo jornalístico de inglês para português brasileiro. Preserve TODA a formatação markdown (headings, bullets, links, imagens, blockquotes, bold, italic). Mantenha jargão financeiro em inglês quando for do mercado (Fed, CPI, NFP, hawkish, dovish, earnings, etc) e tickers/nomes de empresas intactos. Tom jornalístico, direto. Se já estiver em português, devolva tal qual. Retorne APENAS o markdown traduzido, sem prefácio.

---

${markdown}`;

  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  return text || null;
}

/**
 * Fallback Google: traduz em chunks de ~4k chars (limite URL) e remonta.
 * Markdown simples sobrevive ok; formatos exóticos podem quebrar.
 */
async function translateWithGoogle(text: string): Promise<string | null> {
  const CHUNK = 4000;
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    // Corta preferencialmente em \n\n pra preservar parágrafos
    let end = Math.min(cursor + CHUNK, text.length);
    if (end < text.length) {
      const nl = text.lastIndexOf("\n\n", end);
      if (nl > cursor + CHUNK / 2) end = nl;
    }
    chunks.push(text.slice(cursor, end));
    cursor = end;
  }

  const out: string[] = [];
  for (const chunk of chunks) {
    const t = await googleOne(chunk);
    if (!t) return null;
    out.push(t);
  }
  return out.join("\n\n");
}

async function googleOne(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt-BR&dt=t&q=" +
    encodeURIComponent(trimmed);
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) return null;
  const data = (await r.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
  const parts = (data[0] as unknown[]).map((row) => (Array.isArray(row) ? String(row[0] ?? "") : ""));
  return parts.join("");
}
