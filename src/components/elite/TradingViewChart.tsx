"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

function ensureTvScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${TV_SCRIPT_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve) => {
      if (window.TradingView) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
    });
  }
  const s = document.createElement("script");
  s.src = TV_SCRIPT_SRC;
  s.async = true;
  document.head.appendChild(s);
  return new Promise((resolve) => s.addEventListener("load", () => resolve(), { once: true }));
}

export interface TradingViewChartProps {
  symbol: string;
  interval?: "1" | "5" | "15" | "30" | "60" | "240" | "D" | "W" | "M";
  height?: number | string;
  hideTopToolbar?: boolean;
  allowSymbolChange?: boolean;
  studies?: string[];
  /** Quando true, remove borda e rounded — pra uso em cockpit full-bleed. */
  bare?: boolean;
}

export function TradingViewChart({
  symbol,
  interval = "60",
  height = 620,
  hideTopToolbar = false,
  allowSymbolChange = true,
  studies = [],
  bare = false,
}: TradingViewChartProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const containerIdRef = useRef(`tv_${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = `<div id="${containerIdRef.current}" style="height:100%;width:100%"></div>`;

    ensureTvScript().then(() => {
      if (cancelled || !window.TradingView) return;
      new window.TradingView.widget({
        container_id: containerIdRef.current,
        symbol,
        interval,
        autosize: true,
        timezone: "America/Sao_Paulo",
        theme: "dark",
        style: "1",
        locale: "br",
        toolbar_bg: "#0a0a0c",
        enable_publishing: false,
        allow_symbol_change: allowSymbolChange,
        hide_top_toolbar: hideTopToolbar,
        hide_legend: false,
        save_image: false,
        withdateranges: true,
        studies,
        backgroundColor: "#0a0a0c",
        gridColor: "rgba(255,255,255,0.04)",
      });
    });

    return () => {
      cancelled = true;
      if (host) host.innerHTML = "";
    };
  }, [symbol, interval, hideTopToolbar, allowSymbolChange, studies]);

  return (
    <div
      ref={hostRef}
      style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
      className={
        bare
          ? "overflow-hidden bg-[#0a0a0c]"
          : "rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0c]"
      }
    />
  );
}
