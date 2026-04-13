// Bitget V2 API client — read-only operations
// Docs: https://www.bitget.com/api-doc/common/intro

import { createHmac } from "crypto";

const BASE_URL = "https://api.bitget.com";

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
  const timestamp = Date.now().toString();
  const qs = Object.entries(extraParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const fullPath = qs ? `${path}?${qs}` : path;

  const signature = sign(timestamp, "GET", fullPath, "", creds.apiSecret);

  const res = await fetch(`${BASE_URL}${fullPath}`, {
    headers: {
      "ACCESS-KEY": creds.apiKey,
      "ACCESS-SIGN": signature,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": creds.passphrase || "",
      "Content-Type": "application/json",
      locale: "en-US",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bitget ${path}: ${res.status} ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.code !== "00000") {
    throw new Error(`Bitget ${path}: code ${json.code} — ${json.msg || ""}`);
  }

  return json.data;
}

export async function validateCredentials(creds: Credentials): Promise<boolean> {
  const data = await request("/api/v2/mix/account/account", creds, { productType: "USDT-FUTURES" });
  return !!data;
}

export async function getBalance(creds: Credentials) {
  const data = await request("/api/v2/mix/account/account", creds, { productType: "USDT-FUTURES" });
  return {
    totalEquity: parseFloat(data?.accountEquity || data?.equity || "0"),
    availableMargin: parseFloat(data?.crossedMaxAvailable || data?.available || "0"),
    usedMargin: parseFloat(data?.locked || "0"),
    unrealizedPnL: parseFloat(data?.unrealizedPL || "0"),
    realisedPnL: parseFloat(data?.bonus || "0"),
    raw: data,
  };
}

export async function getPositions(creds: Credentials) {
  const data = await request("/api/v2/mix/position/all-position", creds, { productType: "USDT-FUTURES" });
  return (Array.isArray(data) ? data : [])
    .filter((p: Record<string, string>) => parseFloat(p.total || p.available || "0") !== 0)
    .map((p: Record<string, string>) => ({
      symbol: p.symbol || "",
      side: p.holdSide === "long" ? "LONG" : "SHORT",
      size: parseFloat(p.total || p.available || "0"),
      entryPrice: parseFloat(p.openPriceAvg || "0"),
      markPrice: parseFloat(p.markPrice || "0"),
      unrealizedPnL: parseFloat(p.unrealizedPL || "0"),
      leverage: p.leverage || "1",
      marginType: p.marginMode || "cross",
      liquidationPrice: parseFloat(p.liquidationPrice || "0"),
    }));
}

export async function getTradeHistory(creds: Credentials, opts: { symbol?: string; limit?: number; lastDays?: number } = {}) {
  const params: Record<string, string> = { productType: "USDT-FUTURES" };
  if (opts.symbol) params.symbol = opts.symbol;
  params.limit = String(opts.limit || 50);

  if (opts.lastDays) {
    params.startTime = (Date.now() - opts.lastDays * 24 * 60 * 60 * 1000).toString();
  }

  const data = await request("/api/v2/mix/order/fill-history", creds, params);
  const list = data?.fillList || data || [];
  return (Array.isArray(list) ? list : []).map((o: Record<string, string>) => ({
    orderId: o.orderId || o.tradeId || "",
    symbol: o.symbol || "",
    side: o.side || "",
    type: o.orderType || "",
    price: parseFloat(o.price || o.fillPrice || "0"),
    quantity: parseFloat(o.size || o.fillAmount || "0"),
    profit: parseFloat(o.profit || "0"),
    commission: parseFloat(o.fee || "0"),
    status: "FILLED",
    time: parseInt(o.cTime || o.uTime || "0"),
  }));
}

export async function getIncome(creds: Credentials, opts: { lastDays?: number; limit?: number } = {}) {
  const params: Record<string, string> = { productType: "USDT-FUTURES" };
  params.limit = String(opts.limit || 50);

  const data = await request("/api/v2/mix/order/fill-history", creds, params);
  const list = data?.fillList || data || [];
  return (Array.isArray(list) ? list : [])
    .filter((i: Record<string, string>) => parseFloat(i.profit || "0") !== 0)
    .map((i: Record<string, string>) => ({
      symbol: i.symbol || "",
      incomeType: "REALIZED_PNL",
      income: parseFloat(i.profit || "0"),
      asset: "USDT",
      time: parseInt(i.cTime || "0"),
    }));
}
