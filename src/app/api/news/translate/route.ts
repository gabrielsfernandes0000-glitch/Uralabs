import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/news/translate
 * Body: { items: [{ id, headline, summary? }] }
 * Retorno: { translations: { [id]: { h, s } } }
 *
 * Pipeline:
 * 1. Exige sessão de usuário elite/vip (bloqueia abuso externo da key).
 * 2. Rate limit 30 req/min por IP (não por usuário — uma request traduz dezenas).
 * 3. Lê cache em market_news_translations.
 * 4. Faltantes: tenta Claude Haiku (batch único de até 40 itens). Cai pro Google
 *    free endpoint se a Anthropic falhar (sem key, spend limit, timeout).
 * 5. Persiste pra próxima chamada ser instantânea.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_ITEMS = 40;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

type InItem = { id: string; headline: string; summary?: string | null };
type OutT = { h: string; s: string | null };

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "não autenticado" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`news-translate:${ip}`, 30, 60);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate limit" }, { status: 429 });
  }

  let body: { items?: InItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const items = Array.isArray(body.items)
    ? body.items.filter((x) => x?.id && typeof x.headline === "string").slice(0, MAX_ITEMS)
    : [];
  if (!items.length) return NextResponse.json({ ok: true, translations: {} });

  const sb = getSupabaseAdmin();
  const ids = items.map((x) => x.id);

  const { data: cached } = await sb
    .from("market_news_translations")
    .select("news_id, headline_pt, summary_pt")
    .in("news_id", ids);

  const cacheMap = new Map<string, OutT>();
  for (const r of cached ?? []) {
    cacheMap.set(r.news_id as string, { h: r.headline_pt as string, s: (r.summary_pt as string | null) ?? null });
  }

  const missing = items.filter((x) => !cacheMap.has(x.id));

  if (missing.length) {
    const translated = await translateItems(missing);
    for (const [id, v] of translated) cacheMap.set(id, v);

    const rows = [...translated.entries()].map(([news_id, v]) => ({
      news_id,
      headline_pt: v.h,
      summary_pt: v.s,
    }));
    if (rows.length) {
      await sb.from("market_news_translations").upsert(rows, { onConflict: "news_id" });
    }
  }

  const out: Record<string, OutT> = {};
  for (const it of items) {
    const v = cacheMap.get(it.id);
    if (v) out[it.id] = v;
  }
  return NextResponse.json({ ok: true, translations: out });
}

async function translateItems(items: InItem[]): Promise<Map<string, OutT>> {
  // 1ª tentativa: Claude Haiku (batch único, mantém contexto financeiro).
  if (ANTHROPIC_KEY) {
    try {
      const result = await translateWithClaude(items);
      if (result.size === items.length) return result;
      // Preenche faltantes via Google no final
      const remaining = items.filter((it) => !result.has(it.id));
      const fallback = await translateWithGoogle(remaining);
      for (const [k, v] of fallback) result.set(k, v);
      return result;
    } catch (err) {
      console.warn("[news-translate] claude failed, falling back to google:", err);
    }
  }
  // Fallback: Google Translate público
  return translateWithGoogle(items);
}

async function translateWithClaude(items: InItem[]): Promise<Map<string, OutT>> {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY! });
  const payload = items.map((it) => ({
    id: it.id,
    h: it.headline.trim(),
    s: (it.summary ?? "").trim() || null,
  }));

  const prompt = `Você traduz manchetes de notícias financeiras de inglês pra português brasileiro, mantendo jargão de mercado (Fed, earnings, hawkish, dovish, bull, bear, short, long, pivot, hedge, spread, treasury, CPI, PPI, NFP, PMI, etc) sem traduzir literalmente. Tom jornalístico, direto, sem firulas.

Para cada item, retorne \`id\`, \`h\` (headline traduzida) e \`s\` (summary traduzida, ou null se era null/vazio).

Input (JSON):
${JSON.stringify(payload)}

Regras:
- Preserve nomes de empresas, tickers e moedas em inglês.
- Números, datas e percentuais intactos.
- Se o texto já estiver em português, devolva tal qual.
- Nunca invente conteúdo.

Retorne APENAS um array JSON válido no formato [{"id":"...","h":"...","s":"..."|null}]. Sem texto antes/depois.`;

  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonStr = extractJsonArray(text);
  if (!jsonStr) throw new Error("claude returned no JSON");

  const parsed = JSON.parse(jsonStr) as Array<{ id: string; h: string; s: string | null }>;
  const map = new Map<string, OutT>();
  for (const row of parsed) {
    if (row?.id && typeof row.h === "string") {
      map.set(row.id, { h: row.h, s: typeof row.s === "string" ? row.s : null });
    }
  }
  return map;
}

function extractJsonArray(text: string): string | null {
  const t = text.trim();
  if (t.startsWith("[")) return t;
  const match = t.match(/\[[\s\S]*\]/);
  return match ? match[0] : null;
}

async function translateWithGoogle(items: InItem[]): Promise<Map<string, OutT>> {
  const result = new Map<string, OutT>();
  const concurrency = 5;
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      const it = items[i];
      try {
        const [h, s] = await Promise.all([
          googleTranslate(it.headline),
          it.summary ? googleTranslate(it.summary) : Promise.resolve(null),
        ]);
        result.set(it.id, { h: h ?? it.headline, s: s ?? it.summary ?? null });
      } catch {
        result.set(it.id, { h: it.headline, s: it.summary ?? null });
      }
    }
  });
  await Promise.all(workers);
  return result;
}

async function googleTranslate(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt-BR&dt=t&q=" +
    encodeURIComponent(trimmed);
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) return null;
  const data = (await r.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
  const chunks = (data[0] as unknown[]).map((row) => (Array.isArray(row) ? String(row[0] ?? "") : ""));
  return chunks.join("").trim() || null;
}
