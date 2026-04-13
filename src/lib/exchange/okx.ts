// OKX V5 API client — read-only operations
// Docs: https://www.okx.com/docs-v5/en/

import { createHmac } from "crypto";

const BASE_URL = "https://www.okx.com";

interface Credentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

function sign(timestamp: string, method: string, path: string, body: string, secret: string): string {
  const payload = timestamp + method + path + body;
  return createHmac("sha256", secret).update(payload).digest("base64");
}

async function request(path: string, creds: Credentials, extraParams: Record<string, string> = {}) {
  const timestamp = new Date().toISOString();
  const qs = Object.entries(extraParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const fullPath = qs ? `${path}?${qs}` : path;

  const signature = sign(timestamp, "GET", fullPath, "", creds.apiSecret);

  const res = await fetch(`${BASE_URL}${fullPath}`, {
    headers: {
      "OK-ACCESS-KEY": creds.apiKey,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": creds.passphrase || "",
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OKX ${path}: ${res.status} ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.code !== "0") {
    throw new Error(`OKX ${path}: code ${json.code} — ${json.msg || ""}`);
  }

  return json.data;
}

export async function validateCredentials(creds: Credentials): Promise<boolean> {
  const data = await request("/api/v5/account/balance", creds);
  return Array.isArray(data) && data.length > 0;
}

export async function getBalance(creds: Credentials) {
  const data = await request("/api/v5/account/balance", creds);
  const account = data?.[0] || {};
  return {
    totalEquity: parseFloat(account.totalEq || "0"),
    availableMargin: parseFloat(account.adjEq || account.availBal || "0"),
    usedMargin: parseFloat(account.imr || "0"),
    unrealizedPnL: parseFloat(account.upl || "0"),
    realisedPnL: 0,
    raw: account,
  };
}

export async function getPositions(creds: Credentials) {
  const data = await request("/api/v5/account/positions", creds, { instType: "SWAP" });
  return (Array.isArray(data) ? data : [])
    .filter((p: Record<string, string>) => parseFloat(p.pos || "0") !== 0)
    .map((p: Record<string, string>) => ({
      symbol: p.instId || "",
      side: p.posSide === "long" ? "LONG" : p.posSide === "short" ? "SHORT" : parseFloat(p.pos || "0") > 0 ? "LONG" : "SHORT",
      size: Math.abs(parseFloat(p.pos || "0")),
      entryPrice: parseFloat(p.avgPx || "0"),
      markPrice: parseFloat(p.markPx || "0"),
      unrealizedPnL: parseFloat(p.upl || "0"),
      leverage: p.lever || "1",
      marginType: p.mgnMode || "cross",
      liquidationPrice: parseFloat(p.liqPx || "0"),
    }));
}

export async function getTradeHistory(creds: Credentials, opts: { symbol?: string; limit?: number; lastDays?: number } = {}) {
  const params: Record<string, string> = { instType: "SWAP" };
  if (opts.symbol) params.instId = opts.symbol;
  params.limit = String(opts.limit || 50);

  const data = await request("/api/v5/trade/fills-history", creds, params);
  return (Array.isArray(data) ? data : []).map((o: Record<string, string>) => ({
    orderId: o.ordId || o.tradeId || "",
    symbol: o.instId || "",
    side: o.side || "",
    type: o.ordType || "",
    price: parseFloat(o.fillPx || o.px || "0"),
    quantity: parseFloat(o.fillSz || o.sz || "0"),
    profit: parseFloat(o.pnl || "0"),
    commission: parseFloat(o.fee || "0"),
    status: "FILLED",
    time: parseInt(o.ts || "0"),
  }));
}

export async function getIncome(creds: Credentials, opts: { lastDays?: number; limit?: number } = {}) {
  const params: Record<string, string> = { instType: "SWAP" };
  params.limit = String(opts.limit || 50);

  const data = await request("/api/v5/trade/fills-history", creds, params);
  return (Array.isArray(data) ? data : [])
    .filter((i: Record<string, string>) => parseFloat(i.pnl || "0") !== 0)
    .map((i: Record<string, string>) => ({
      symbol: i.instId || "",
      incomeType: "REALIZED_PNL",
      income: parseFloat(i.pnl || "0"),
      asset: "USDT",
      time: parseInt(i.ts || "0"),
    }));
}
