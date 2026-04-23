"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

interface Kline { time: number; open: number; high: number; low: number; close: number }

interface Props {
  symbol: string;
  tradeTime: number;
  entryPrice: number;
  stopLoss?: number | null;
  side: string; // BUY = long, SELL = short
  height?: number;
}

/** Candlestick chart compacto ao redor do momento do trade.
 *  Janela +-30min (1m candles). Overlays: linha de entrada + stop (se houver). */
export function TradeChart({ symbol, tradeTime, entryPrice, stopLoss, side, height = 200 }: Props) {
  const [data, setData] = useState<Kline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    setLoading(true);
    setError(null);
    const windowMs = 30 * 60 * 1000;
    const startTime = tradeTime - windowMs;
    const endTime = tradeTime + windowMs;
    fetch(`/api/exchange/klines?symbol=${encodeURIComponent(symbol)}&interval=1m&startTime=${startTime}&endTime=${endTime}&limit=120`)
      .then((r) => r.json())
      .then((d) => {
        if (abort) return;
        if (d.klines) setData(d.klines);
        else setError(d.error || "Sem dados");
      })
      .catch(() => !abort && setError("Falha ao carregar chart"))
      .finally(() => !abort && setLoading(false));
    return () => { abort = true; };
  }, [symbol, tradeTime]);

  const { candlesSvg, entryY, stopY, mfePrice, maePrice, scaleInfo } = useMemo(() => {
    if (!data || !data.length) return { candlesSvg: null, entryY: null, stopY: null, mfePrice: null, maePrice: null, scaleInfo: null };
    const W = 1000;
    const H = height;
    const padding = 8;
    const low = Math.min(...data.map((c) => c.low), entryPrice, stopLoss || entryPrice);
    const high = Math.max(...data.map((c) => c.high), entryPrice, stopLoss || entryPrice);
    const range = high - low || 1;
    const ySpan = H - padding * 2;
    const yFor = (price: number) => padding + ((high - price) / range) * ySpan;

    const candleWidth = W / data.length * 0.65;
    const candleGap = W / data.length * 0.35;
    const xFor = (i: number) => i * (candleWidth + candleGap) + candleGap / 2;

    const candles = data.map((c, i) => {
      const x = xFor(i);
      const xMid = x + candleWidth / 2;
      const up = c.close >= c.open;
      const color = up ? "#22c55e" : "#ef4444";
      const bodyTop = yFor(Math.max(c.open, c.close));
      const bodyBottom = yFor(Math.min(c.open, c.close));
      const wickTop = yFor(c.high);
      const wickBottom = yFor(c.low);
      const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
      return (
        <g key={c.time}>
          <line x1={xMid} y1={wickTop} x2={xMid} y2={wickBottom} stroke={color} strokeOpacity={0.6} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <rect x={x} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} fillOpacity={0.7} />
        </g>
      );
    });

    // Linha vertical do trade time
    const closestIdx = data.reduce((best, c, i) => Math.abs(c.time - tradeTime) < Math.abs(data[best].time - tradeTime) ? i : best, 0);
    const tradeX = xFor(closestIdx) + candleWidth / 2;

    const mfe = side.toUpperCase() === "BUY" ? Math.max(...data.map((c) => c.high)) : Math.min(...data.map((c) => c.low));
    const mae = side.toUpperCase() === "BUY" ? Math.min(...data.map((c) => c.low)) : Math.max(...data.map((c) => c.high));

    return {
      candlesSvg: (
        <g>
          {candles}
          <line x1={tradeX} y1={padding} x2={tradeX} y2={H - padding} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 4" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </g>
      ),
      entryY: yFor(entryPrice),
      stopY: stopLoss ? yFor(stopLoss) : null,
      mfePrice: mfe,
      maePrice: mae,
      scaleInfo: { low, high, yFor },
    };
  }, [data, height, entryPrice, stopLoss, tradeTime, side]);

  if (loading) {
    return (
      <div className="flex items-center justify-center text-[11px] text-white/35" style={{ height }}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> Carregando chart…
      </div>
    );
  }
  if (error || !data || !data.length) {
    return (
      <div className="flex items-center justify-center text-[11px] text-white/30" style={{ height }}>
        {error || "Sem dados de klines"}
      </div>
    );
  }

  const sideIsLong = side.toUpperCase() === "BUY";
  const mfeColor = "#22c55e";
  const maeColor = "#ef4444";

  return (
    <div className="w-full">
      <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="w-full block" style={{ height }}>
        {candlesSvg}
        {entryY !== null && (
          <>
            <line x1={0} y1={entryY} x2={1000} y2={entryY} stroke="#fbbf24" strokeWidth={1.2} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          </>
        )}
        {stopY !== null && (
          <line x1={0} y1={stopY} x2={1000} y2={stopY} stroke="#ef4444" strokeWidth={1} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" opacity={0.7} />
        )}
        {/* MFE/MAE horizontal lines */}
        {scaleInfo && mfePrice !== null && (
          <line x1={0} y1={scaleInfo.yFor(mfePrice)} x2={1000} y2={scaleInfo.yFor(mfePrice)} stroke={sideIsLong ? mfeColor : maeColor} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="1 3" vectorEffect="non-scaling-stroke" />
        )}
        {scaleInfo && maePrice !== null && (
          <line x1={0} y1={scaleInfo.yFor(maePrice)} x2={1000} y2={scaleInfo.yFor(maePrice)} stroke={sideIsLong ? maeColor : mfeColor} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="1 3" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <div className="flex items-center justify-between text-[9.5px] text-white/35 font-mono tabular-nums mt-1.5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-[1px] bg-amber-400" /> entry {entryPrice < 1 ? entryPrice.toFixed(6) : entryPrice.toFixed(2)}
        </span>
        {stopLoss && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-[1px] bg-red-400 opacity-70" /> stop {stopLoss < 1 ? stopLoss.toFixed(6) : stopLoss.toFixed(2)}
          </span>
        )}
        <span className="text-white/25">1m · ±30min</span>
      </div>
    </div>
  );
}
