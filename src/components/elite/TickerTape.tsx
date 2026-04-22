"use client";

import { useEffect, useRef } from "react";

/**
 * Ticker tape oficial do TradingView — faixa horizontal com preços real-time.
 * Widget público, zero auth, atualiza sozinho via WS da TV.
 */

export type TickerSymbol = {
  proName: string;  // ex: "BINANCE:BTCUSDT"
  title: string;    // ex: "BTC"
};

// Só ativos com feed real-time grátis no widget embed (crypto spot + forex OANDA/FX).
// Índices e futuros (NDX, SPX, DXY, NQ1!, Ibov) retornam "!" sem preço no free.
const DEFAULT_SYMBOLS: TickerSymbol[] = [
  { proName: "BINANCE:BTCUSDT", title: "BTC" },
  { proName: "BINANCE:ETHUSDT", title: "ETH" },
  { proName: "BINANCE:SOLUSDT", title: "SOL" },
  { proName: "BINANCE:BNBUSDT", title: "BNB" },
  { proName: "BINANCE:XRPUSDT", title: "XRP" },
  { proName: "OANDA:XAUUSD",    title: "Ouro" },
  { proName: "OANDA:XAGUSD",    title: "Prata" },
  { proName: "FX:EURUSD",       title: "EUR/USD" },
  { proName: "FX:GBPUSD",       title: "GBP/USD" },
  { proName: "FX:USDJPY",       title: "USD/JPY" },
  { proName: "FX_IDC:USDBRL",   title: "USD/BRL" },
];

export function TickerTape({ symbols = DEFAULT_SYMBOLS }: { symbols?: TickerSymbol[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = `<div class="tradingview-widget-container__widget"></div>`;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "br",
    });
    host.appendChild(script);

    return () => {
      if (host) host.innerHTML = "";
    };
  }, [symbols]);

  return (
    <div
      ref={hostRef}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-white/[0.05] bg-[#0a0a0c]"
      style={{ height: 46 }}
    />
  );
}
