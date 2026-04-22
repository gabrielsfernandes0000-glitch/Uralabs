"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ura:watchlist:v1";

export const WATCHLIST_PRESETS = [
  { symbol: "NQ", label: "Nasdaq (NQ)" },
  { symbol: "ES", label: "S&P 500 (ES)" },
  { symbol: "DXY", label: "Dólar (DXY)" },
  { symbol: "BTC", label: "Bitcoin" },
  { symbol: "ETH", label: "Ethereum" },
  { symbol: "SOL", label: "Solana" },
  { symbol: "GOLD", label: "Ouro (XAU)" },
  { symbol: "OIL", label: "Petróleo (CL)" },
  { symbol: "EURUSD", label: "EUR/USD" },
  { symbol: "GBPUSD", label: "GBP/USD" },
  { symbol: "USDJPY", label: "USD/JPY" },
  { symbol: "USDBRL", label: "Dólar/Real" },
  { symbol: "AAPL", label: "Apple" },
  { symbol: "NVDA", label: "NVIDIA" },
  { symbol: "TSLA", label: "Tesla" },
  { symbol: "META", label: "Meta" },
  { symbol: "MSFT", label: "Microsoft" },
  { symbol: "AMZN", label: "Amazon" },
] as const;

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return ["NQ", "BTC", "DXY"];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const add = useCallback((symbol: string) => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    setItems((prev) => {
      if (prev.includes(sym)) return prev;
      const next = [...prev, sym];
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const remove = useCallback((symbol: string) => {
    setItems((prev) => {
      const next = prev.filter((s) => s !== symbol);
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggle = useCallback((symbol: string) => {
    const sym = symbol.trim().toUpperCase();
    setItems((prev) => {
      const next = prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym];
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const has = useCallback((symbol: string) => items.includes(symbol.trim().toUpperCase()), [items]);

  return { items, ready, add, remove, toggle, has, set: persist };
}

/**
 * Testa se uma manchete/evento é relevante pra watchlist.
 * Match por substring case-insensitive em qualquer campo textual.
 */
export function matchesWatchlist(text: string, watchlist: string[]): boolean {
  if (watchlist.length === 0) return false;
  const upper = text.toUpperCase();
  return watchlist.some((sym) => upper.includes(sym));
}
