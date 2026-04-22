"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, TrendingUp } from "lucide-react";
import type { TradeEntry } from "@/lib/progress";

/**
 * Intraday chart pro trade expand.
 *
 * Fluxo:
 *  1. Busca candles 1m do dia do trade via /api/market/candles (Binance public).
 *  2. Se não achar (símbolo não-cripto), cai pro TradingView widget embed com delay.
 *  3. Plota entry/stop/target/exit como price lines.
 *  4. Se openTime registrado, marca o candle de entrada.
 *
 * Performance: lazy-loaded só quando trade é expandido, não na render inicial.
 */

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type State =
  | { status: "loading" }
  | { status: "ready"; candles: Candle[] }
  | { status: "fallback" }
  | { status: "error"; message: string };

export function TradeIntradayChart({ trade }: { trade: TradeEntry }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trade.symbol) {
      setState({ status: "error", message: "Símbolo não registrado — não dá pra buscar histórico." });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/market/candles?symbol=${encodeURIComponent(trade.symbol!)}&date=${trade.date}&timeframe=1m`,
          { cache: "force-cache" }
        );
        if (cancelled) return;
        if (res.status === 404) {
          setState({ status: "fallback" });
          return;
        }
        if (!res.ok) {
          setState({ status: "error", message: `API retornou ${res.status}` });
          return;
        }
        const { candles } = (await res.json()) as { candles: Candle[] };
        if (!candles || candles.length === 0) {
          setState({ status: "fallback" });
          return;
        }
        setState({ status: "ready", candles });
      } catch (e) {
        if (cancelled) return;
        setState({ status: "error", message: e instanceof Error ? e.message : "Erro" });
      }
    })();
    return () => { cancelled = true; };
  }, [trade.symbol, trade.date]);

  // Render chart quando candles prontos
  useEffect(() => {
    if (state.status !== "ready") return;
    if (!containerRef.current) return;
    let disposed = false;
    let cleanupResize: (() => void) | null = null;
    type ChartApi = ReturnType<typeof import("lightweight-charts").createChart>;
    let chart: ChartApi | null = null;

    const init = async () => {
      const { createChart, CandlestickSeries, ColorType } = await import("lightweight-charts");
      if (disposed || !containerRef.current) return;

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 280,
        layout: {
          background: { type: ColorType.Solid, color: "#0a0a0c" },
          textColor: "rgba(255,255,255,0.4)",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.02)" },
          horzLines: { color: "rgba(255,255,255,0.02)" },
        },
        crosshair: {
          vertLine: { color: "rgba(255,255,255,0.15)", width: 1, style: 3, labelBackgroundColor: "#141417" },
          horzLine: { color: "rgba(255,255,255,0.15)", width: 1, style: 3, labelBackgroundColor: "#141417" },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.04)",
          scaleMargins: { top: 0.08, bottom: 0.08 },
          textColor: "rgba(255,255,255,0.4)",
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.04)",
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 2,
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#10B981",
        downColor: "#EF4444",
        borderUpColor: "#10B981",
        borderDownColor: "#EF4444",
        wickUpColor: "#10B981",
        wickDownColor: "#EF4444",
      });

      type UTCTimestamp = import("lightweight-charts").UTCTimestamp;
      series.setData(state.candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open, high: c.high, low: c.low, close: c.close,
      })));

      // Price lines — entry/stop/target/exit
      const pLines: Array<{ price: number; color: string; title: string; dashed?: boolean }> = [];
      if (trade.entryNum != null) pLines.push({ price: trade.entryNum, color: "#94A3B8", title: "Entry" });
      if (trade.stopNum != null) pLines.push({ price: trade.stopNum, color: "#EF4444", title: "Stop", dashed: true });
      if (trade.targetNum != null) pLines.push({ price: trade.targetNum, color: "#10B981", title: "Target", dashed: true });
      if (trade.exitNum != null) pLines.push({ price: trade.exitNum, color: "#60A5FA", title: "Exit" });

      for (const p of pLines) {
        series.createPriceLine({
          price: p.price,
          color: p.color,
          lineWidth: 1,
          lineStyle: p.dashed ? 2 : 0,
          axisLabelVisible: true,
          title: p.title,
        });
      }

      chart.timeScale().fitContent();

      const resize = () => {
        if (!containerRef.current || !chart) return;
        chart.applyOptions({ width: containerRef.current.clientWidth });
      };
      const ro = new ResizeObserver(resize);
      ro.observe(containerRef.current);
      cleanupResize = () => ro.disconnect();
    };

    init();
    return () => {
      disposed = true;
      cleanupResize?.();
      chart?.remove();
    };
  }, [state, trade]);

  if (state.status === "loading") {
    return (
      <div className="h-[280px] flex items-center justify-center rounded-lg bg-white/[0.015] border border-white/[0.04]">
        <div className="w-3.5 h-3.5 border-2 border-white/15 border-t-white/55 rounded-full animate-spin" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-lg bg-white/[0.015] border border-white/[0.04] px-4 py-6 text-center">
        <AlertCircle className="w-5 h-5 text-white/25 mx-auto mb-2" />
        <p className="text-[11.5px] text-white/50">{state.message}</p>
      </div>
    );
  }

  if (state.status === "fallback") {
    // TradingView embed widget (delayed pra não-cripto)
    return <TradingViewFallback symbol={trade.symbol!} date={trade.date} />;
  }

  return (
    <div className="rounded-lg bg-[#0a0a0c] border border-white/[0.04] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-white/35" />
          <span className="text-[10.5px] font-semibold text-white/60">Candles 1m · Binance</span>
        </div>
        <div className="flex items-center gap-2.5 text-[9.5px] font-mono">
          {trade.entryNum != null && <Legend color="#94A3B8" label="entry" />}
          {trade.stopNum != null && <Legend color="#EF4444" label="stop" dashed />}
          {trade.targetNum != null && <Legend color="#10B981" label="target" dashed />}
          {trade.exitNum != null && <Legend color="#60A5FA" label="exit" />}
        </div>
      </div>
      <div ref={containerRef} className="w-full" style={{ height: 280 }} />
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-white/50">
      <span
        className={`inline-block w-3 h-[2px] ${dashed ? "" : ""}`}
        style={{
          background: dashed
            ? `repeating-linear-gradient(to right, ${color}, ${color} 2px, transparent 2px, transparent 4px)`
            : color,
        }}
      />
      {label}
    </span>
  );
}

function TradingViewFallback({ symbol, date }: { symbol: string; date: string }) {
  const tvSymbol = symbol.endsWith("USDT") || symbol.endsWith("USD")
    ? `BINANCE:${symbol}`
    : symbol === "NQ" ? "CME_MINI:NQ1!"
    : symbol === "ES" ? "CME_MINI:ES1!"
    : `NASDAQ:${symbol}`;

  return (
    <div className="rounded-lg bg-white/[0.015] border border-white/[0.04] p-4 text-center space-y-2">
      <p className="text-[12px] text-white/60 font-semibold">Sem candles disponíveis pro diário</p>
      <p className="text-[11px] text-white/40">
        Esse símbolo não está na Binance (spot/futures). Abra no TradingView pra ver o chart do dia {date}.
      </p>
      <a
        href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/[0.1] text-[11.5px] font-semibold text-white/70 hover:text-white hover:border-white/[0.2] transition-colors"
      >
        Abrir no TradingView
      </a>
    </div>
  );
}
