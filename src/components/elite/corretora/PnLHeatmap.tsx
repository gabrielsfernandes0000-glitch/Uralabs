"use client";

import { useMemo, useState } from "react";

interface DayPnL { date: string; pnl: number }

/** Calendar heatmap estilo GitHub, PnL diário. 3 meses rolling. */
export function PnLHeatmap({ data }: { data: DayPnL[] }) {
  const [hover, setHover] = useState<DayPnL | null>(null);
  const cellSize = 11;
  const gap = 3;

  const { weeks, maxAbs, monthLabels } = useMemo(() => {
    // Normaliza pra 90 dias terminando hoje
    const now = new Date();
    now.setHours(now.getHours() - 3);
    const today = now.toISOString().slice(0, 10);
    const byDate = new Map(data.map((d) => [d.date, d.pnl]));

    const days: DayPnL[] = [];
    const start = new Date(now);
    start.setDate(start.getDate() - 89);
    for (let i = 0; i < 90; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, pnl: byDate.get(key) || 0 });
    }

    // Agrupa em semanas (colunas). Cada coluna = domingo→sábado.
    const firstDayOfWeek = new Date(days[0].date + "T12:00:00Z").getUTCDay();
    const padded: (DayPnL | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) padded.push(null);
    padded.push(...days);
    while (padded.length % 7 !== 0) padded.push(null);

    const cols: (DayPnL | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }

    const absVals = days.map((d) => Math.abs(d.pnl)).filter((v) => v > 0);
    const mx = absVals.length ? Math.max(...absVals) : 1;

    // Month labels nas colunas onde começa um mês novo
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    cols.forEach((col, idx) => {
      const firstReal = col.find((c) => c);
      if (!firstReal) return;
      const m = new Date(firstReal.date + "T12:00:00Z").getUTCMonth();
      if (m !== lastMonth) {
        labels.push({ col: idx, label: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][m] });
        lastMonth = m;
      }
    });

    return { weeks: cols, maxAbs: mx, monthLabels: labels, today };
  }, [data]);

  const colorFor = (pnl: number) => {
    if (pnl === 0) return "rgba(255,255,255,0.04)";
    const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
    const alpha = 0.15 + intensity * 0.75;
    return pnl > 0
      ? `rgba(34,197,94,${alpha.toFixed(2)})`
      : `rgba(239,68,68,${alpha.toFixed(2)})`;
  };

  return (
    <div className="relative">
      <div className="flex gap-3 text-[10px] text-white/30 mb-1.5 pl-6 font-mono">
        {monthLabels.map((m) => (
          <span key={m.col} style={{ marginLeft: m.col === 0 ? 0 : undefined }} className="shrink-0">
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex">
        <div className="flex flex-col justify-between text-[9px] text-white/25 pr-1.5 font-mono" style={{ height: (cellSize + gap) * 7 }}>
          <span>D</span>
          <span>T</span>
          <span>Q</span>
          <span>S</span>
        </div>
        <div className="flex" style={{ gap }}>
          {weeks.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ gap }}>
              {col.map((day, di) => (
                <div
                  key={di}
                  onMouseEnter={() => day && setHover(day)}
                  onMouseLeave={() => setHover(null)}
                  className="rounded-sm transition-all"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: day ? colorFor(day.pnl) : "transparent",
                    cursor: day ? "pointer" : "default",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {hover && (
        <div className="mt-3 flex items-center gap-3 text-[11px]">
          <span className="text-white/50">
            {new Date(hover.date + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <span className={`font-mono tabular-nums font-semibold ${hover.pnl > 0 ? "text-green-400" : hover.pnl < 0 ? "text-red-400" : "text-white/30"}`}>
            {hover.pnl === 0 ? "Sem PnL" : `${hover.pnl > 0 ? "+" : ""}$${hover.pnl.toFixed(2)}`}
          </span>
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 text-[9px] text-white/30 mt-3 font-mono">
        <span>-</span>
        <div className="w-[9px] h-[9px] rounded-sm" style={{ background: "rgba(239,68,68,0.9)" }} />
        <div className="w-[9px] h-[9px] rounded-sm" style={{ background: "rgba(239,68,68,0.4)" }} />
        <div className="w-[9px] h-[9px] rounded-sm" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="w-[9px] h-[9px] rounded-sm" style={{ background: "rgba(34,197,94,0.4)" }} />
        <div className="w-[9px] h-[9px] rounded-sm" style={{ background: "rgba(34,197,94,0.9)" }} />
        <span>+</span>
      </div>
    </div>
  );
}
