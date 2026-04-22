"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { computeHeatmap, useTrades } from "@/lib/trading-journal";

/**
 * Heatmap 7×24 (dia da semana × hora) colorido por R médio.
 * Verde = melhor performance, vermelho = pior, cinza = sem trades.
 */

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function PerformanceHeatmap() {
  const [trades] = useTrades();
  const cells = useMemo(() => computeHeatmap(trades), [trades]);

  // Escala de cor baseada no range observado
  const { minR, maxR } = useMemo(() => {
    const withTrades = cells.filter((c) => c.trades > 0);
    if (withTrades.length === 0) return { minR: 0, maxR: 0 };
    return {
      minR: Math.min(...withTrades.map((c) => c.avgR)),
      maxR: Math.max(...withTrades.map((c) => c.avgR)),
    };
  }, [cells]);

  const colorFor = (avgR: number, hasTrades: boolean): string => {
    if (!hasTrades) return "rgba(255,255,255,0.03)";
    if (avgR > 0) {
      const intensity = maxR > 0 ? Math.min(avgR / maxR, 1) : 0;
      return `rgba(16,185,129,${0.15 + intensity * 0.55})`;
    } else if (avgR < 0) {
      const intensity = minR < 0 ? Math.min(avgR / minR, 1) : 0;
      return `rgba(239,68,68,${0.15 + intensity * 0.55})`;
    }
    return "rgba(255,255,255,0.08)";
  };

  const hasAnyTrade = cells.some((c) => c.trades > 0);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-500" strokeWidth={1.8} />
          <h3 className="text-[13px] font-bold text-white/90">Heatmap de performance</h3>
        </div>
        {hasAnyTrade && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-white/40">Pior</span>
            <div className="flex gap-px">
              {[-1, -0.5, 0, 0.5, 1].map((v) => (
                <div
                  key={v}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colorFor(v * (v < 0 ? Math.abs(minR) : maxR), true) }}
                />
              ))}
            </div>
            <span className="text-white/40">Melhor</span>
          </div>
        )}
      </div>

      {!hasAnyTrade ? (
        <p className="text-[12px] text-white/40 text-center py-8">
          Registre trades pra ver padrões de performance por dia/hora.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header: horas */}
            <div className="flex items-center gap-[2px] mb-1 pl-9">
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className="w-[14px] text-[8px] text-white/30 font-mono text-center"
                >
                  {h % 3 === 0 ? h : ""}
                </div>
              ))}
            </div>

            {/* Grid: 7 dias × 24 horas */}
            <div className="space-y-[2px]">
              {DAYS_PT.map((dayLabel, day) => (
                <div key={day} className="flex items-center gap-[2px]">
                  <div className="w-8 text-[10px] font-bold text-white/45 pr-1 text-right">
                    {dayLabel}
                  </div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = cells.find((c) => c.day === day && c.hour === hour)!;
                    const color = colorFor(cell.avgR, cell.trades > 0);
                    return (
                      <div
                        key={hour}
                        className="relative w-[14px] h-[14px] rounded-[2px] cursor-help group"
                        style={{ backgroundColor: color }}
                        title={
                          cell.trades === 0
                            ? `${dayLabel} ${hour}h · sem trades`
                            : `${dayLabel} ${hour}h · ${cell.trades} ${cell.trades === 1 ? "trade" : "trades"} · ${cell.avgR >= 0 ? "+" : ""}${cell.avgR.toFixed(2)}R médio`
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-white/30 font-mono">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>23h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
