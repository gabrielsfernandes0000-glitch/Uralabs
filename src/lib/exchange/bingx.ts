// BingX API client — read-only operations
// Docs: https://bingx-api.github.io/docs/

import { createHmac } from "crypto";

const DIRECT_BASE = "https://open-api.bingx.com";

/** Resolve base URL e headers por request.
 *  Se BINGX_PROXY_URL + BINGX_PROXY_SECRET estiverem setadas, roteia via CF Worker
 *  (elimina IP concentration da Vercel, aumenta capacidade 10x+).
 *  Caso contrário, bate direto no BingX (comportamento antigo). */
function resolveEndpoint(path: string): { url: string; extraHeaders: Record<string, string> } {
  const proxy = process.env.BINGX_PROXY_URL;
  const secret = process.env.BINGX_PROXY_SECRET;
  if (proxy && secret) {
    return {
      url: `${proxy.replace(/\/$/, "")}/bingx${path}`,
      extraHeaders: { "X-URA-PROXY-SECRET": secret },
    };
  }
  return { url: `${DIRECT_BASE}${path}`, extraHeaders: {} };
}

interface BingXCredentials {
  apiKey: string;
  apiSecret: string;
}

/** Make an authenticated GET request to BingX.
 *
 * BingX verifica a signature reconstruindo a queryString **na ordem que chega**
 * (não ordena alfabeticamente). A signature deve ser HMAC-SHA256 do EXACT
 * queryString (sem encoding e sem sort) que vai na URL, e aí appenda
 * `&signature=X` no final. */
async function request(
  path: string,
  creds: BingXCredentials,
  extraParams: Record<string, string> = {}
) {
  const params: Record<string, string> = {
    ...extraParams,
    timestamp: Date.now().toString(),
  };
  const qsForSign = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const signature = createHmac("sha256", creds.apiSecret).update(qsForSign).digest("hex");
  const qs = `${qsForSign}&signature=${signature}`;
  const { url, extraHeaders } = resolveEndpoint(`${path}?${qs}`);

  const res = await fetch(url, {
    headers: {
      "X-BX-APIKEY": creds.apiKey,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BingX ${path}: ${res.status} ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.code && json.code !== 0) {
    throw new Error(`BingX ${path}: code ${json.code} — ${json.msg || ""}`);
  }

  return json;
}

/** Validate API key by fetching account info. Throws on bad credentials. */
export async function validateCredentials(creds: BingXCredentials): Promise<boolean> {
  const result = await request("/openApi/swap/v2/user/balance", creds);
  return !!result.data;
}

/** Get perpetual futures balance */
export async function getBalance(creds: BingXCredentials) {
  const result = await request("/openApi/swap/v2/user/balance", creds);
  const d = result.data?.balance || result.data;

  return {
    totalEquity: parseFloat(d?.balance || d?.equity || "0"),
    availableMargin: parseFloat(d?.availableMargin || "0"),
    usedMargin: parseFloat(d?.usedMargin || "0"),
    unrealizedPnL: parseFloat(d?.unrealizedProfit || "0"),
    realisedPnL: parseFloat(d?.realisedProfit || d?.realizedProfit || "0"),
    raw: d,
  };
}

/** Get open positions */
export async function getPositions(creds: BingXCredentials) {
  const result = await request("/openApi/swap/v2/user/positions", creds);
  const positions = Array.isArray(result.data) ? result.data : [];

  return positions.map((p: Record<string, string>) => ({
    symbol: p.symbol || "",
    side: p.positionSide || p.side || "",
    size: parseFloat(p.positionAmt || p.positionVolume || "0"),
    entryPrice: parseFloat(p.avgPrice || p.entryPrice || "0"),
    markPrice: parseFloat(p.markPrice || "0"),
    unrealizedPnL: parseFloat(p.unrealizedProfit || "0"),
    leverage: p.leverage || "1",
    marginType: p.marginType || "cross",
    liquidationPrice: parseFloat(p.liquidationPrice || "0"),
  }));
}

/** Get trade history (last N trades) */
export async function getTradeHistory(
  creds: BingXCredentials,
  opts: { symbol?: string; limit?: number; lastDays?: number } = {}
) {
  const params: Record<string, string> = {};
  if (opts.symbol) params.symbol = opts.symbol;
  params.limit = String(opts.limit || 50);

  if (opts.lastDays) {
    // BingX /trade/allOrders tem cap de 7 dias no range (erro 109400 acima disso)
    const days = Math.min(opts.lastDays, 7);
    params.startTime = (Date.now() - days * 24 * 60 * 60 * 1000).toString();
  }

  const result = await request("/openApi/swap/v2/trade/allOrders", creds, params);
  const orders = result.data?.orders || result.data || [];

  return (Array.isArray(orders) ? orders : []).map((o: Record<string, string>) => ({
    orderId: o.orderId || o.orderID || "",
    symbol: o.symbol || "",
    side: o.side || "",
    type: o.type || "",
    price: parseFloat(o.price || o.avgPrice || "0"),
    quantity: parseFloat(o.origQty || o.executedQty || "0"),
    profit: parseFloat(o.profit || o.realizedPnl || "0"),
    commission: parseFloat(o.commission || "0"),
    status: o.status || "",
    time: parseInt(o.time || o.updateTime || "0"),
  }));
}

/** Get liquidation history (forced orders). Empty array = nunca liquidou. */
export async function getForceOrders(creds: BingXCredentials, opts: { lastDays?: number; limit?: number } = {}) {
  const params: Record<string, string> = {};
  params.limit = String(opts.limit || 100);
  if (opts.lastDays) {
    const days = Math.min(opts.lastDays, 7);
    params.startTime = (Date.now() - days * 24 * 60 * 60 * 1000).toString();
  }
  const result = await request("/openApi/swap/v2/trade/forceOrders", creds, params);
  const orders = result.data?.orders || result.data || [];
  return (Array.isArray(orders) ? orders : []).map((o: Record<string, string>) => ({
    orderId: o.orderId || "",
    symbol: o.symbol || "",
    side: o.side || "",
    type: o.type || "LIQUIDATION",
    price: parseFloat(o.avgPrice || o.price || "0"),
    quantity: parseFloat(o.executedQty || o.origQty || "0"),
    time: parseInt(o.updateTime || o.time || "0"),
  }));
}

/** Get open (pending) orders — limits, stops, tp/sl aguardando gatilho */
export async function getOpenOrders(creds: BingXCredentials) {
  const result = await request("/openApi/swap/v2/trade/openOrders", creds);
  const orders = result.data?.orders || result.data || [];
  return (Array.isArray(orders) ? orders : []).map((o: Record<string, string>) => ({
    orderId: o.orderId || "",
    symbol: o.symbol || "",
    side: o.side || "",
    positionSide: o.positionSide || "",
    type: o.type || "",
    price: parseFloat(o.price || "0"),
    stopPrice: parseFloat(o.stopPrice || "0"),
    quantity: parseFloat(o.origQty || "0"),
    leverage: o.leverage || "",
    time: parseInt(o.time || "0"),
  }));
}

/** Get klines (candles) — endpoint público, sem auth */
export async function getKlines(symbol: string, interval: string, startTime: number, endTime: number, limit = 500) {
  const qs = new URLSearchParams({
    symbol,
    interval,
    startTime: String(startTime),
    endTime: String(endTime),
    limit: String(limit),
  });
  const { url, extraHeaders } = resolveEndpoint(`/openApi/swap/v2/quote/klines?${qs.toString()}`);
  const res = await fetch(url, {
    headers: extraHeaders,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`BingX klines: ${res.status}`);
  const json = await res.json();
  if (json.code && json.code !== 0) throw new Error(`BingX klines: code ${json.code} — ${json.msg || ""}`);
  const data = Array.isArray(json.data) ? json.data : [];
  return data.map((k: Record<string, string>) => ({
    time: parseInt(k.time || "0"),
    open: parseFloat(k.open || "0"),
    high: parseFloat(k.high || "0"),
    low: parseFloat(k.low || "0"),
    close: parseFloat(k.close || "0"),
    volume: parseFloat(k.volume || "0"),
  })).sort((a: { time: number }, b: { time: number }) => a.time - b.time);
}

/** Get PnL summary — income history (funding, realized PnL, commissions) */
export async function getIncome(
  creds: BingXCredentials,
  opts: { lastDays?: number; limit?: number } = {}
) {
  const params: Record<string, string> = {};
  params.limit = String(opts.limit || 100);

  if (opts.lastDays) {
    params.startTime = (Date.now() - opts.lastDays * 24 * 60 * 60 * 1000).toString();
  }

  const result = await request("/openApi/swap/v2/user/income", creds, params);
  const items = result.data || [];

  return (Array.isArray(items) ? items : []).map((i: Record<string, string>) => ({
    symbol: i.symbol || "",
    incomeType: i.incomeType || i.type || "",
    income: parseFloat(i.income || i.amount || "0"),
    asset: i.asset || "USDT",
    time: parseInt(i.time || "0"),
  }));
}

/** Compute performance metrics from trade history */
export function computeMetrics(trades: ReturnType<typeof getTradeHistory> extends Promise<infer T> ? T : never) {
  const empty = {
    totalTrades: 0, wins: 0, losses: 0, winRate: 0,
    totalPnL: 0, avgPnL: 0, bestTrade: 0, worstTrade: 0,
    avgWin: 0, avgLoss: 0, profitFactor: 0, expectancy: 0,
    currentStreak: 0, currentStreakType: "none" as "win" | "loss" | "none",
    maxWinStreak: 0, maxLossStreak: 0,
  };
  if (!trades.length) return empty;

  const closed = trades.filter((t) => t.profit !== 0);
  if (!closed.length) return empty;

  const wins = closed.filter((t) => t.profit > 0);
  const losses = closed.filter((t) => t.profit < 0);
  const totalPnL = closed.reduce((s, t) => s + t.profit, 0);
  const grossWin = wins.reduce((s, t) => s + t.profit, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.profit, 0));
  const profits = closed.map((t) => t.profit);
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? -grossLoss / losses.length : 0;
  const winRate = wins.length / closed.length;

  // Ordena por tempo ASC pra calcular streaks cronologicamente
  const chrono = [...closed].sort((a, b) => a.time - b.time);
  let maxWinStreak = 0, maxLossStreak = 0, curWin = 0, curLoss = 0;
  for (const t of chrono) {
    if (t.profit > 0) { curWin++; curLoss = 0; maxWinStreak = Math.max(maxWinStreak, curWin); }
    else if (t.profit < 0) { curLoss++; curWin = 0; maxLossStreak = Math.max(maxLossStreak, curLoss); }
  }
  const last = chrono[chrono.length - 1];
  const currentStreak = last.profit > 0 ? curWin : last.profit < 0 ? curLoss : 0;
  const currentStreakType: "win" | "loss" | "none" = last.profit > 0 ? "win" : last.profit < 0 ? "loss" : "none";

  return {
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: winRate * 100,
    totalPnL,
    avgPnL: totalPnL / closed.length,
    bestTrade: Math.max(...profits),
    worstTrade: Math.min(...profits),
    avgWin,
    avgLoss,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0,
    expectancy: winRate * avgWin + (1 - winRate) * avgLoss,
    currentStreak,
    currentStreakType,
    maxWinStreak,
    maxLossStreak,
  };
}
