// BingX API client — read-only operations
// Docs: https://bingx-api.github.io/docs/

import { createHmac } from "crypto";

const BASE_URL = "https://open-api.bingx.com";

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

  const res = await fetch(`${BASE_URL}${path}?${qs}`, {
    headers: {
      "X-BX-APIKEY": creds.apiKey,
      "Content-Type": "application/json",
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
    const startTime = Date.now() - opts.lastDays * 24 * 60 * 60 * 1000;
    params.startTime = startTime.toString();
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
  if (!trades.length) {
    return { totalTrades: 0, wins: 0, losses: 0, winRate: 0, totalPnL: 0, avgPnL: 0, bestTrade: 0, worstTrade: 0 };
  }

  const closedTrades = trades.filter((t) => t.profit !== 0);
  const wins = closedTrades.filter((t) => t.profit > 0);
  const losses = closedTrades.filter((t) => t.profit < 0);
  const totalPnL = closedTrades.reduce((s, t) => s + t.profit, 0);
  const profits = closedTrades.map((t) => t.profit);

  return {
    totalTrades: closedTrades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0,
    totalPnL,
    avgPnL: closedTrades.length > 0 ? totalPnL / closedTrades.length : 0,
    bestTrade: profits.length ? Math.max(...profits) : 0,
    worstTrade: profits.length ? Math.min(...profits) : 0,
  };
}
