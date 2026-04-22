/**
 * Price snapshots — fetchers gratuitos.
 *
 *   - Crypto spot: Binance REST (free, ilimitado)
 *   - Stocks/forex/indices: TwelveData free (800 req/dia) OU Yahoo unofficial (delayed 15min)
 *
 * Retorna o último preço + change % 24h.
 * Para produção real-time usar Binance WebSocket (grátis) no client.
 */

export type PriceSnapshot = {
  symbol: string;
  price: number;
  changePct24h: number | null;
  asOf: string;      // ISO
  source: "binance" | "twelvedata" | "yahoo";
  delayed: boolean;
};

const BINANCE_MAP: Record<string, string> = {
  BTC: "BTCUSDT", ETH: "ETHUSDT", SOL: "SOLUSDT", BNB: "BNBUSDT", XRP: "XRPUSDT",
  ADA: "ADAUSDT", DOGE: "DOGEUSDT", AVAX: "AVAXUSDT", LINK: "LINKUSDT", DOT: "DOTUSDT",
};

/** Binance 24hr ticker stats. Zero auth. */
async function fetchBinance(symbol: string): Promise<PriceSnapshot | null> {
  const pair = BINANCE_MAP[symbol.toUpperCase()];
  if (!pair) return null;
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      symbol: symbol.toUpperCase(),
      price: Number(d.lastPrice),
      changePct24h: Number(d.priceChangePercent),
      asOf: new Date().toISOString(),
      source: "binance",
      delayed: false,
    };
  } catch {
    return null;
  }
}

/** TwelveData — stocks, forex, index. Requer API key. */
async function fetchTwelveData(symbol: string): Promise<PriceSnapshot | null> {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${key}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (d?.code || !d?.close) return null;
    const close = Number(d.close);
    const prev = Number(d.previous_close);
    const changePct = prev > 0 ? ((close - prev) / prev) * 100 : null;
    return {
      symbol: symbol.toUpperCase(),
      price: close,
      changePct24h: changePct,
      asOf: new Date().toISOString(),
      source: "twelvedata",
      delayed: false,
    };
  } catch {
    return null;
  }
}

/** Yahoo Finance v8 — sem key, delayed 15min, quebra às vezes. Usado como último fallback. */
async function fetchYahoo(symbol: string): Promise<PriceSnapshot | null> {
  try {
    // Mapa de símbolos comuns pra yahoo format
    const yahoo: Record<string, string> = {
      NQ: "NQ=F", ES: "ES=F", DXY: "DX=F",
      SPX: "^GSPC", NDX: "^NDX", VIX: "^VIX",
      GOLD: "GC=F", OIL: "CL=F",
    };
    const yahooSym = yahoo[symbol.toUpperCase()] ?? symbol;
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=2d`,
      { headers: { "User-Agent": "Mozilla/5.0 (URA Labs)" }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const quote = d?.chart?.result?.[0];
    if (!quote) return null;
    const meta = quote.meta;
    const close = Number(meta?.regularMarketPrice);
    const prev = Number(meta?.chartPreviousClose);
    if (!close) return null;
    const changePct = prev > 0 ? ((close - prev) / prev) * 100 : null;
    return {
      symbol: symbol.toUpperCase(),
      price: close,
      changePct24h: changePct,
      asOf: new Date().toISOString(),
      source: "yahoo",
      delayed: true,
    };
  } catch {
    return null;
  }
}

/**
 * Busca snapshot do preço. Tenta na ordem: binance (crypto) → twelvedata (paid key) → yahoo (free delayed).
 */
export async function fetchPriceSnapshot(symbol: string): Promise<PriceSnapshot | null> {
  const sym = symbol.toUpperCase();
  if (BINANCE_MAP[sym]) {
    const b = await fetchBinance(sym);
    if (b) return b;
  }
  const td = await fetchTwelveData(sym);
  if (td) return td;
  return fetchYahoo(sym);
}

export async function fetchPriceSnapshots(symbols: string[]): Promise<Record<string, PriceSnapshot | null>> {
  const entries = await Promise.all(symbols.map(async (s) => [s.toUpperCase(), await fetchPriceSnapshot(s)] as const));
  return Object.fromEntries(entries);
}

export function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 100)   return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 1)     return price.toLocaleString("en-US", { maximumFractionDigits: 3 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 5 });
}
