import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getKlines } from "@/lib/exchange";

export const dynamic = "force-dynamic";

/** Proxy leve pra BingX klines (endpoint publico, sem auth).
 *  Gate em sessao pra evitar abuso externo da nossa Vercel.
 *  Usado pelo TradeChart no detail modal. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");
  const interval = url.searchParams.get("interval") || "1m";
  const startTime = parseInt(url.searchParams.get("startTime") || "0");
  const endTime = parseInt(url.searchParams.get("endTime") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "300");

  if (!symbol || !startTime || !endTime) {
    return NextResponse.json({ error: "symbol, startTime, endTime obrigatorios" }, { status: 400 });
  }

  // Validacao simples pra evitar abuse: range max 7 dias
  if (endTime - startTime > 7 * 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Range maximo 7 dias" }, { status: 400 });
  }

  try {
    const klines = await getKlines(symbol, interval, startTime, endTime, Math.min(limit, 500));
    return NextResponse.json({ klines }, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
