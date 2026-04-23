// Unified exchange router — one interface, multiple exchanges

import * as bingx from "./bingx";
import * as binance from "./binance";
import * as bybit from "./bybit";
import * as okx from "./okx";
import * as bitget from "./bitget";

export type ExchangeId = "bingx" | "binance" | "bybit" | "okx" | "bitget";

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // OKX and Bitget require this
}

export interface ExchangeMeta {
  id: ExchangeId;
  name: string;
  color: string;
  shortLabel: string;
  needsPassphrase: boolean;
}

export const EXCHANGES: ExchangeMeta[] = [
  { id: "bingx", name: "BingX", color: "#2b6af5", shortLabel: "Bx", needsPassphrase: false },
  { id: "binance", name: "Binance", color: "#F0B90B", shortLabel: "Bn", needsPassphrase: false },
  { id: "bybit", name: "Bybit", color: "#f7a600", shortLabel: "By", needsPassphrase: false },
  { id: "okx", name: "OKX", color: "#ffffff", shortLabel: "OK", needsPassphrase: true },
  { id: "bitget", name: "Bitget", color: "#00f0ff", shortLabel: "Bg", needsPassphrase: true },
];

export function getExchangeMeta(id: ExchangeId): ExchangeMeta {
  return EXCHANGES.find((e) => e.id === id) || EXCHANGES[0];
}

// Route calls to the correct exchange module
function getModule(exchange: ExchangeId) {
  switch (exchange) {
    case "bingx": return bingx;
    case "binance": return binance;
    case "bybit": return bybit;
    case "okx": return okx;
    case "bitget": return bitget;
    default: throw new Error(`Exchange not supported: ${exchange}`);
  }
}

export async function validateCredentials(exchange: ExchangeId, creds: ExchangeCredentials) {
  return getModule(exchange).validateCredentials(creds);
}

export async function getBalance(exchange: ExchangeId, creds: ExchangeCredentials) {
  return getModule(exchange).getBalance(creds);
}

export async function getPositions(exchange: ExchangeId, creds: ExchangeCredentials) {
  return getModule(exchange).getPositions(creds);
}

export async function getTradeHistory(exchange: ExchangeId, creds: ExchangeCredentials, opts?: { symbol?: string; limit?: number; lastDays?: number }) {
  return getModule(exchange).getTradeHistory(creds, opts);
}

export async function getIncome(exchange: ExchangeId, creds: ExchangeCredentials, opts?: { lastDays?: number; limit?: number }) {
  return getModule(exchange).getIncome(creds, opts);
}

// Re-export computeMetrics from bingx (it's exchange-agnostic)
export { computeMetrics } from "./bingx";

// BingX-specific helpers (outros exchanges podem ganhar implementacao depois)
export { getForceOrders, getOpenOrders, getKlines } from "./bingx";
