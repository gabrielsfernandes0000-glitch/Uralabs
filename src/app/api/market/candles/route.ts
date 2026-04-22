import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600;

/**
 * Intraday candles — proxy minimalista pra Binance public klines.
 *
 * Uso: /api/market/candles?symbol=BTCUSDT&date=2026-04-21&timeframe=1m
 *
 * Retorna candles do dia BRT inteiro (00:00 BRT → 23:59 BRT) no timeframe pedido.
 * Free API — sem auth. Só funciona pra cripto listada na Binance (spot ou USD-M).
 * Pra futuros (NQ, ES) retorna 404 — o UI deve cair pro TradingView widget embed.
 *
 * Cache por 10min (candles do dia raramente revisados depois da fatía).
 */

const TIMEFRAME_MAP: Record<string, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m", "1h": "1h", "4h": "4h", "1d": "1d",
};

interface Candle {
  time: number;  // UNIX seconds (UTC)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get("symbol") ?? "").toUpperCase();
  const date = url.searchParams.get("date") ?? "";
  const tf = (url.searchParams.get("timeframe") ?? "1m").toLowerCase();

  if (!symbol || !/^[A-Z0-9]+$/.test(symbol)) {
    return NextResponse.json({ error: "symbol inválido" }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) requerido" }, { status: 400 });
  }
  const interval = TIMEFRAME_MAP[tf];
  if (!interval) {
    return NextResponse.json({ error: "timeframe inválido" }, { status: 400 });
  }

  // BRT window: 00:00 BRT = 03:00 UTC
  const startUtc = new Date(`${date}T03:00:00.000Z`).getTime();
  const endUtc = startUtc + 24 * 60 * 60 * 1000;

  // Try spot first, then USD-M futures
  const endpoints = [
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startUtc}&endTime=${endUtc}&limit=1500`,
    `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&startTime=${startUtc}&endTime=${endUtc}&limit=1500`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data) || data.length === 0) continue;
      const candles: Candle[] = data.map((arr) => {
        const a = arr as unknown[];
        return {
          time: Math.floor(Number(a[0]) / 1000),
          open: parseFloat(String(a[1])),
          high: parseFloat(String(a[2])),
          low: parseFloat(String(a[3])),
          close: parseFloat(String(a[4])),
          volume: parseFloat(String(a[5])),
        };
      }).filter((c) => Number.isFinite(c.open));
      if (candles.length === 0) continue;
      return NextResponse.json({ candles, source: "binance", symbol, date, timeframe: tf });
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "symbol não encontrado na Binance (spot ou futures). Tente TradingView widget." },
    { status: 404 }
  );
}
