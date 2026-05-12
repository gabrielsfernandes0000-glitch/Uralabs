"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ticker tape oficial do TradingView — faixa horizontal com preços real-time.
 * Widget público, zero auth, atualiza sozinho via WS da TV.
 *
 * UX: o script é externo (s3.tradingview.com) — entre hydration e o widget
 * realmente renderizar passam 0.5-2s. Antes esse tempo ficava como um
 * container vazio "piscando" depois do resto da página aparecer. Agora
 * tem skeleton interno que faz transição suave pro widget real (detectado
 * via MutationObserver quando TV popula o DOM).
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = `<div class="tradingview-widget-container__widget"></div>`;
    const widget = host.querySelector(".tradingview-widget-container__widget");

    // MutationObserver detecta quando TradingView termina de popular o DOM
    // dentro do widget container — sinal de que pode fazer crossfade do
    // skeleton pro widget real.
    let observer: MutationObserver | null = null;
    if (widget) {
      observer = new MutationObserver(() => {
        if (widget.children.length > 0) {
          setLoaded(true);
          observer?.disconnect();
        }
      });
      observer.observe(widget, { childList: true, subtree: true });
    }

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

    // Fallback: se nada renderizar em 6s (TV offline / bloqueio de tracker),
    // some o skeleton pra não ficar piscando pra sempre.
    const fallback = setTimeout(() => setLoaded(true), 6000);

    return () => {
      observer?.disconnect();
      clearTimeout(fallback);
      if (host) host.innerHTML = "";
    };
  }, [symbols]);

  return (
    <div
      className="relative tradingview-widget-container rounded-xl overflow-hidden border border-white/[0.05] bg-[#0a0a0c]"
      style={{ height: 46 }}
    >
      {/* Widget real — fade-in quando TV terminar de popular */}
      <div
        ref={hostRef}
        className={`absolute inset-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {/* Skeleton interno — formato similar a tickers (símbolo curto + preço) */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center px-4 gap-7 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 shrink-0 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-3 w-3 rounded-full bg-white/[0.05]" />
              <div className="h-3 w-9 rounded bg-white/[0.05]" />
              <div className="h-3 w-14 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
