// Binance Futures API client — read-only operations
// Docs: https://binance-docs.github.io/apidocs/futures/en/

import { createHmac } from "crypto";

const BASE_URL = "https://fapi.binance.com";

interface Credentials {
  apiKey: string;
  apiSecret: string;
}

function sign(queryString: string, secret: string): string {
  return createHmac("sha256", secret).update(queryString).digest("hex");
}

async function request(path: string, creds: Credentials, extraParams: Record<string, string> = {}) {
  const params: Record<string, string> = {
    timestamp: Date.now().toString(),
    recvWindow: "10000",
    ...extraParams,
  };

  const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const signature = sign(qs, creds.apiSecret);
  const url = `${BASE_URL}${path}?${qs}&signature=${signature}`;

  const res = await fetch(url, {
    headers: { "X-MBX-APIKEY": creds.apiKey },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Binance ${path}: ${res.status} ${text.slice(0, 200)}`);
  }

  return res.json();
}

export async function validateCredentials(creds: Credentials): Promise<boolean> {
  const data = await request("/fapi/v2/balance", creds);
  return Array.isArray(data);
}

export async function getBalance(creds: Credentials) {
  const data = await request("/fapi/v2/account", creds);
  return {
    totalEquity: parseFloat(data.totalWalletBalance || "0"),
    availableMargin: parseFloat(data.availableBalance || "0"),
    usedMargin: parseFloat(data.totalInitialMargin || "0"),
    unrealizedPnL: parseFloat(data.totalUnrealizedProfit || "0"),
    realisedPnL: 0, // Binance doesn't return this directly in account endpoint
    raw: data,
  };
}

export async function getPositions(creds: Credentials) {
  const data = await request("/fapi/v2/positionRisk", creds);
  return (Array.isArray(data) ? data : [])
    .filter((p: Record<string, string>) => parseFloat(p.positionAmt || "0") !== 0)
    .map((p: Record<string, string>) => ({
      symbol: p.symbol || "",
      side: parseFloat(p.positionAmt || "0") > 0 ? "LONG" : "SHORT",
      size: Math.abs(parseFloat(p.positionAmt || "0")),
      entryPrice: parseFloat(p.entryPrice || "0"),
      markPrice: parseFloat(p.markPrice || "0"),
      unrealizedPnL: parseFloat(p.unRealizedProfit || "0"),
      leverage: p.leverage || "1",
      marginType: p.marginType || "cross",
      liquidationPrice: parseFloat(p.liquidationPrice || "0"),
    }));
}

export async function getTradeHistory(creds: Credentials, opts: { symbol?: string; limit?: number; lastDays?: number } = {}) {
  const params: Record<string, string> = {};
  // Binance requires symbol for trade history — fetch from positions or use default
  if (opts.symbol) params.symbol = opts.symbol;
  else params.symbol = "BTCUSDT"; // fallback
  params.limit = String(opts.limit || 50);

  if (opts.lastDays) {
    params.startTime = (Date.now() - opts.lastDays * 24 * 60 * 60 * 1000).toString();
  }

  const data = await request("/fapi/v1/userTrades", creds, params);
  return (Array.isArray(data) ? data : []).map((o: Record<string, string>) => ({
    orderId: o.orderId || o.id || "",
    symbol: o.symbol || "",
    side: o.side || "",
    type: "MARKET",
    price: parseFloat(o.price || "0"),
    quantity: parseFloat(o.qty || "0"),
    profit: parseFloat(o.realizedPnl || "0"),
    commission: parseFloat(o.commission || "0"),
    status: "FILLED",
    time: parseInt(o.time || "0"),
  }));
}

export async function getIncome(creds: Credentials, opts: { lastDays?: number; limit?: number } = {}) {
  const params: Record<string, string> = {};
  params.limit = String(opts.limit || 100);
  if (opts.lastDays) {
    params.startTime = (Date.now() - opts.lastDays * 24 * 60 * 60 * 1000).toString();
  }

  const data = await request("/fapi/v1/income", creds, params);
  return (Array.isArray(data) ? data : []).map((i: Record<string, string>) => ({
    symbol: i.symbol || "",
    incomeType: i.incomeType || "",
    income: parseFloat(i.income || "0"),
    asset: i.asset || "USDT",
    time: parseInt(i.time || "0"),
  }));
}
