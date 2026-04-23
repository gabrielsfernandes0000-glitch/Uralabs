"use client";

import { useMemo, useState } from "react";

interface Point { date: string; equity: number }

export function EquityCurve({ data, height = 180 }: { data: Point[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, min, max, points, deltaPct, deltaAbs } = useMemo(() => {
    if (!data.length) {
      return { path: "", area: "", min: 0, max: 0, points: [] as { x: number; y: number; d: Point }[], deltaPct: 0, deltaAbs: 0 };
    }
    const values = data.map((d) => d.equity);
    const mn = Math.min(...values);
    const mx = Math.max(...values);
    const range = mx - mn || 1;
    const pad = range * 0.1;
    const yMin = mn - pad;
    const yMax = mx + pad;
    const yRange = yMax - yMin || 1;
    const W = 1000;
    const H = height;
    const pts = data.map((d, i) => {
      const x = data.length === 1 ? W / 2 : (i / (data.length - 1)) * W;
      const y = H - ((d.equity - yMin) / yRange) * H;
      return { x, y, d };
    });
    const pathStr = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaStr = `${pathStr} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
    const first = data[0].equity;
    const last = data[data.length - 1].equity;
    const dA = last - first;
    const dP = first !== 0 ? (dA / first) * 100 : 0;
    return { path: pathStr, area: areaStr, min: mn, max: mx, points: pts, deltaPct: dP, deltaAbs: dA };
  }, [data, height]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-[11px] text-white/25" style={{ height }}>
        Sem histórico suficiente ainda
      </div>
    );
  }

  const color = deltaAbs >= 0 ? "#22c55e" : "#ef4444";
  const gradId = `equity-grad-${deltaAbs >= 0 ? "up" : "down"}`;
  const H = height;
  const hoverPoint = hover !== null ? points[hover] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 1000 ${H}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const xPct = (e.clientX - rect.left) / rect.width;
          const idx = Math.max(0, Math.min(points.length - 1, Math.round(xPct * (points.length - 1))));
          setHover(idx);
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Reference lines — min/max discretas */}
        <line x1="0" y1={H * 0.5} x2="1000" y2={H * 0.5} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />

        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {hoverPoint && (
          <>
            <line x1={hoverPoint.x} y1={0} x2={hoverPoint.x} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <circle cx={hoverPoint.x} cy={hoverPoint.y} r={3.5} fill={color} />
          </>
        )}
      </svg>

      {hoverPoint && (
        <div
          className="absolute pointer-events-none rounded-md border border-white/10 bg-black/85 backdrop-blur px-2.5 py-1.5 text-[11px] whitespace-nowrap z-10"
          style={{
            left: `${(hoverPoint.x / 1000) * 100}%`,
            top: 4,
            transform: hoverPoint.x > 700 ? "translateX(-100%)" : "translateX(8px)",
          }}
        >
          <div className="text-white/50 font-mono tabular-nums">
            {new Date(hoverPoint.d.date + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </div>
          <div className="text-white font-semibold tabular-nums">
            ${hoverPoint.d.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-white/25 font-mono tabular-nums pt-1">
        <span>${min.toFixed(2)}</span>
        <span style={{ color }}>
          {deltaAbs >= 0 ? "+" : ""}
          {deltaAbs.toFixed(2)} ({deltaAbs >= 0 ? "+" : ""}{deltaPct.toFixed(2)}%)
        </span>
        <span>${max.toFixed(2)}</span>
      </div>
    </div>
  );
}
