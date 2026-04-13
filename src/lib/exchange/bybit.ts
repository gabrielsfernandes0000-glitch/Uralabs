// Bybit V5 API client — read-only operations
// Docs: https://bybit-exchange.github.io/docs/v5/intro

import { createHmac } from "crypto";

const BASE_URL = "https://api.bybit.com";

interface Credentials {
  apiKey: string;
  apiSecret: string;
}

function sign(timestamp: string, apiKey: string, recvWindow: string, queryString: string, secret: string): string {
  const payload = timestamp + apiKey + recvWindow + queryString;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

async function request(path: string, creds: Credentials, extraParams: Record<string, string> = {}) {
  const timestamp = Date.now().toString();
  const recvWindow = "10000";

  const qs = Object.entries(extraParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const signature = sign(timestamp, creds.apiKey, recvWindow, qs, creds.apiSecret);

  const url = `${BASE_URL}${path}${qs ? "?" + qs : ""}`;

  const res = await fetch(url, {
    headers: {
      "X-BAPI-API-KEY": creds.apiKey,
      "X-BAPI-SIGN": signature,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bybit ${path}: ${res.status} ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.retCode !== 0) {
    throw new Error(`Bybit ${path}: code ${json.retCode} — ${json.retMsg || ""}`);
  }

  return json.result;
}

export async function validateCredentials(creds: Credentials): Promise<boolean> {
  const data = await request("/v5/account/wallet-balance", creds, { accountType: "UNIFIED" });
  return !!data;
}

export async function getBalance(creds: Credentials) {
  const data = await request("/v5/account/wallet-balance", creds, { accountType: "UNIFIED" });
  const account = data?.list?.[0] || {};
  return {
    totalEquity: parseFloat(account.totalEquity || "0"),
    availableMargin: parseFloat(account.totalAvailableBalance || "0"),
    usedMargin: parseFloat(account.totalInitialMargin || "0"),
    unrealizedPnL: parseFloat(account.totalPerpUPL || "0"),
    realisedPnL: 0,
    raw: account,
  };
}

export async function getPositions(creds: Credentials) {
  const data = await request("/v5/position/list", creds, { category: "linear", settleCoin: "USDT" });
  const list = data?.list || [];
  return (Array.isArray(list) ? list : [])
    .filter((p: Record<string, string>) => parseFloat(p.size || "0") !== 0)
    .map((p: Record<string, string>) => ({
      symbol: p.symbol || "",
      side: p.side === "Buy" ? "LONG" : "SHORT",
      size: parseFloat(p.size || "0"),
      entryPrice: parseFloat(p.avgPrice || "0"),
      markPrice: parseFloat(p.markPrice || "0"),
      unrealizedPnL: parseFloat(p.unrealisedPnl || "0"),
      leverage: p.leverage || "1",
      marginType: p.tradeMode === "0" ? "cross" : "isolated",
      liquidationPrice: parseFloat(p.liqPrice || "0"),
    }));
}

export async function getTradeHistory(creds: Credentials, opts: { symbol?: string; limit?: number; lastDays?: number } = {}) {
  const params: Record<string, string> = { category: "linear" };
  if (opts.symbol) params.symbol = opts.symbol;
  params.limit = String(opts.limit || 50);

  const data = await request("/v5/execution/list", creds, params);
  const list = data?.list || [];
  return (Array.isArray(list) ? list : []).map((o: Record<string, string>) => ({
    orderId: o.orderId || "",
    symbol: o.symbol || "",
    side: o.side || "",
    type: o.orderType || "",
    price: parseFloat(o.execPrice || o.orderPrice || "0"),
    quantity: parseFloat(o.execQty || "0"),
    profit: parseFloat(o.closedPnl || "0"),
    commission: parseFloat(o.execFee || "0"),
    status: "FILLED",
    time: parseInt(o.execTime || "0"),
  }));
}

export async function getIncome(creds: Credentials, opts: { lastDays?: number; limit?: number } = {}) {
  // Bybit: closed PnL endpoint
  const params: Record<string, string> = { category: "linear" };
  params.limit = String(opts.limit || 50);

  const data = await request("/v5/position/closed-pnl", creds, params);
  const list = data?.list || [];
  return (Array.isArray(list) ? list : []).map((i: Record<string, string>) => ({
    symbol: i.symbol || "",
    incomeType: "REALIZED_PNL",
    income: parseFloat(i.closedPnl || "0"),
    asset: "USDT",
    time: parseInt(i.updatedTime || i.createdTime || "0"),
  }));
}
