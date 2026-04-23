"use client";

import { useMemo } from "react";

interface Point { date: string; dd: number; ddPct: number }

export function DrawdownCurve({ data, height = 80 }: { data: Point[]; height?: number }) {
  const { path, area, maxDD } = useMemo(() => {
    if (!data.length) return { path: "", area: "", maxDD: 0 };
    const min = Math.min(...data.map((d) => d.dd), 0);
    const yRange = Math.abs(min) || 1;
    const W = 1000;
    const H = height;
    const pts = data.map((d, i) => {
      const x = data.length === 1 ? W / 2 : (i / (data.length - 1)) * W;
      // dd é <= 0. Plota invertido: dd=0 no topo, dd min no bottom.
      const y = (Math.abs(d.dd) / yRange) * H;
      return { x, y };
    });
    const pathStr = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaStr = `M${pts[0].x.toFixed(1)},0 ${pathStr.slice(1)} L${pts[pts.length - 1].x.toFixed(1)},0 Z`;
    return { path: pathStr, area: areaStr, maxDD: min };
  }, [data, height]);

  if (!data.length) return null;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[10.5px] font-semibold text-white/40 uppercase tracking-wider">Underwater</p>
        <p className="text-[10.5px] text-white/30 font-mono tabular-nums">
          Max DD: <span className="text-red-400">${Math.abs(maxDD).toFixed(2)}</span>
        </p>
      </div>
      <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="w-full block" style={{ height }}>
        <defs>
          <linearGradient id="dd-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#dd-grad)" />
        <path d={path} fill="none" stroke="#ef4444" strokeOpacity={0.7} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
