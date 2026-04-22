"use client";

import { useEffect, useRef } from "react";

/**
 * Heatmap oficial da TradingView. Mostra ativos crypto OU ações numa grid
 * colorida por performance. Útil pra ver mercado inteiro de uma vez.
 */

export type HeatmapKind = "crypto" | "stocks-us";

export function HeatmapWidget({
  kind = "crypto",
  height = 520,
}: {
  kind?: HeatmapKind;
  height?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = `<div class="tradingview-widget-container__widget"></div>`;

    const isCrypto = kind === "crypto";
    const src = isCrypto
      ? "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js"
      : "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";

    const config = isCrypto
      ? {
          dataSource: "Crypto",
          blockSize: "market_cap_calc",
          blockColor: "change",
          locale: "br",
          symbolUrl: "",
          colorTheme: "dark",
          hasTopBar: false,
          isDataSetEnabled: false,
          isZoomEnabled: true,
          hasSymbolTooltip: true,
          isMonoSize: false,
          width: "100%",
          height: "100%",
        }
      : {
          dataSource: "SPX500",
          blockSize: "market_cap_basic",
          blockColor: "change",
          grouping: "sector",
          locale: "br",
          symbolUrl: "",
          colorTheme: "dark",
          hasTopBar: false,
          isDataSetEnabled: false,
          isZoomEnabled: true,
          hasSymbolTooltip: true,
          width: "100%",
          height: "100%",
        };

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    host.appendChild(script);

    return () => {
      if (host) host.innerHTML = "";
    };
  }, [kind]);

  return (
    <div
      ref={hostRef}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0c]"
      style={{ height }}
    />
  );
}
