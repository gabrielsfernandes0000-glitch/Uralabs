"use client";

import { useMemo, useState } from "react";

interface DayPnL { date: string; pnl: number }

const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmtUsd(n: number) {
  const p = n >= 0 ? "$" : "-$";
  return `${p}${Math.abs(n).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Calendar heatmap estilo GitHub, PnL diário. 6 meses rolling + sidebar de stats. */
export function PnLHeatmap({ data }: { data: DayPnL[] }) {
  const [hover, setHover] = useState<DayPnL | null>(null);
  const cellSize = 20;
  const gap = 4;
  const days = 180;

  const { weeks, maxAbs, monthLabels, stats, todayISO } = useMemo(() => {
    // Normaliza pra `days` terminando hoje
    const now = new Date();
    now.setHours(now.getHours() - 3);
    const today = now.toISOString().slice(0, 10);
    const byDate = new Map(data.map((d) => [d.date, d.pnl]));

    const filled: DayPnL[] = [];
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      filled.push({ date: key, pnl: byDate.get(key) || 0 });
    }

    // Agrupa em semanas (colunas). Cada coluna = domingo→sábado.
    const firstDayOfWeek = new Date(filled[0].date + "T12:00:00Z").getUTCDay();
    const padded: (DayPnL | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) padded.push(null);
    padded.push(...filled);
    while (padded.length % 7 !== 0) padded.push(null);

    const cols: (DayPnL | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }

    const absVals = filled.map((d) => Math.abs(d.pnl)).filter((v) => v > 0);
    const mx = absVals.length ? Math.max(...absVals) : 1;

    // Month labels nas colunas onde começa um mês novo
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    cols.forEach((col, idx) => {
      const firstReal = col.find((c) => c);
      if (!firstReal) return;
      const m = new Date(firstReal.date + "T12:00:00Z").getUTCMonth();
      if (m !== lastMonth) {
        labels.push({ col: idx, label: MONTH_LABELS[m] });
        lastMonth = m;
      }
    });

    // Stats derivados — alimentam sidebar
    const traded = filled.filter((d) => d.pnl !== 0);
    const wins = traded.filter((d) => d.pnl > 0);
    const losses = traded.filter((d) => d.pnl < 0);
    const totalPnL = traded.reduce((s, d) => s + d.pnl, 0);
    const best = traded.length ? traded.reduce((a, b) => (b.pnl > a.pnl ? b : a)) : null;
    const worst = traded.length ? traded.reduce((a, b) => (b.pnl < a.pnl ? b : a)) : null;

    // Streak atual: conta dias consecutivos com mesmo sinal a partir do último dia operado.
    let streak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (let i = filled.length - 1; i >= 0; i--) {
      const p = filled[i].pnl;
      if (p === 0) continue;
      if (streakType === "none") {
        streakType = p > 0 ? "win" : "loss";
        streak = 1;
      } else if ((streakType === "win" && p > 0) || (streakType === "loss" && p < 0)) {
        streak++;
      } else {
        break;
      }
    }

    return {
      weeks: cols,
      maxAbs: mx,
      monthLabels: labels,
      todayISO: today,
      stats: {
        totalPnL,
        tradedDays: traded.length,
        winDays: wins.length,
        lossDays: losses.length,
        winRateDays: traded.length ? (wins.length / traded.length) * 100 : 0,
        best,
        worst,
        streak,
        streakType,
      },
    };
  }, [data]);

  const colorFor = (pnl: number) => {
    if (pnl === 0) return "rgba(255,255,255,0.04)";
    const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
    const alpha = 0.15 + intensity * 0.75;
    return pnl > 0
      ? `rgba(34,197,94,${alpha.toFixed(2)})`
      : `rgba(239,68,68,${alpha.toFixed(2)})`;
  };

  const pnlColor = (n: number) => n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "text-white/40";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 items-start">
      {/* Heatmap */}
      <div className="relative min-w-0 overflow-x-auto">
        <div className="flex gap-4 text-[10px] text-white/30 mb-2 pl-6 font-mono">
          {monthLabels.map((m, idx) => (
            <span
              key={`${m.col}-${idx}`}
              style={{
                marginLeft: idx === 0
                  ? m.col * (cellSize + gap)
                  : (m.col - (monthLabels[idx - 1]?.col ?? 0) - 1) * (cellSize + gap),
              }}
              className="shrink-0"
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex">
          <div className="flex flex-col justify-between text-[9.5px] text-white/30 pr-2 font-mono" style={{ height: (cellSize + gap) * 7 - gap }}>
            <span>Dom</span>
            <span>Ter</span>
            <span>Qui</span>
            <span>Sáb</span>
          </div>
          <div className="flex" style={{ gap }}>
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col" style={{ gap }}>
                {col.map((day, di) => {
                  // di === 0 (Dom) e di === 6 (Sáb) — mercado fechado, sem-PnL
                  // ganha bg ainda mais discreto pra trader entender que
                  // "vazio" lá é normal (não falha de operação).
                  const isWeekend = di === 0 || di === 6;
                  const isToday = day?.date === todayISO;
                  const bg = day
                    ? day.pnl === 0 && isWeekend
                      ? "rgba(255,255,255,0.015)"
                      : colorFor(day.pnl)
                    : "transparent";
                  return (
                    <div
                      key={di}
                      onMouseEnter={() => day && setHover(day)}
                      onMouseLeave={() => setHover(null)}
                      className={`rounded-[3px] transition-all ${isToday ? "ring-1 ring-white/55" : ""}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        background: bg,
                        cursor: day ? "pointer" : "default",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hover detail + legend abaixo do grid */}
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <div className="text-[11px] min-h-[16px]">
            {hover ? (
              <span className="inline-flex items-center gap-2">
                <span className="text-white/50">
                  {new Date(hover.date + "T12:00:00Z").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                </span>
                <span className={`font-mono tabular-nums font-semibold ${pnlColor(hover.pnl)}`}>
                  {hover.pnl === 0 ? "Sem PnL" : `${hover.pnl > 0 ? "+" : ""}${fmtUsd(hover.pnl)}`}
                </span>
              </span>
            ) : (
              <span className="text-white/25">passe o mouse num dia pra ver detalhes</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] text-white/30 font-mono">
            <span>perda</span>
            <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: "rgba(239,68,68,0.9)" }} />
            <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: "rgba(239,68,68,0.4)" }} />
            <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: "rgba(34,197,94,0.4)" }} />
            <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: "rgba(34,197,94,0.9)" }} />
            <span>ganho</span>
          </div>
        </div>
      </div>

      {/* Sidebar de stats — derivados do mesmo dataset, preenchem o espaço
          que antes ficava vazio à direita do calendário */}
      <div className="space-y-3.5 lg:border-l lg:border-white/[0.05] lg:pl-6">
        <div>
          <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1">Total no período</p>
          <p className={`text-[20px] font-bold font-mono tabular-nums leading-none ${pnlColor(stats.totalPnL)}`}>
            {stats.totalPnL > 0 ? "+" : ""}{fmtUsd(stats.totalPnL)}
          </p>
          <p className="text-[10px] text-white/30 mt-1 font-mono tabular-nums">
            {stats.tradedDays} {stats.tradedDays === 1 ? "dia operado" : "dias operados"} de {days}
          </p>
        </div>

        {stats.tradedDays > 0 && (
          <>
            <div className="pt-3 border-t border-white/[0.04]">
              <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Dias positivos</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-[15px] font-bold font-mono tabular-nums ${stats.winRateDays >= 50 ? "text-green-400" : "text-red-400"}`}>
                  {stats.winRateDays.toFixed(0)}%
                </p>
                <p className="text-[10.5px] text-white/35 font-mono tabular-nums">
                  {stats.winDays}W · {stats.lossDays}L
                </p>
              </div>
            </div>

            {stats.best && (
              <div className="pt-3 border-t border-white/[0.04]">
                <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1">Melhor dia</p>
                <p className="text-[14px] font-bold font-mono tabular-nums text-green-400">
                  +{fmtUsd(stats.best.pnl)}
                </p>
                <p className="text-[10px] text-white/35 mt-0.5 font-mono">{fmtDate(stats.best.date)}</p>
              </div>
            )}

            {stats.worst && stats.worst.pnl < 0 && (
              <div className="pt-3 border-t border-white/[0.04]">
                <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1">Pior dia</p>
                <p className="text-[14px] font-bold font-mono tabular-nums text-red-400">
                  {fmtUsd(stats.worst.pnl)}
                </p>
                <p className="text-[10px] text-white/35 mt-0.5 font-mono">{fmtDate(stats.worst.date)}</p>
              </div>
            )}

            {stats.streak > 0 && stats.streakType !== "none" && (
              <div className="pt-3 border-t border-white/[0.04]">
                <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1">Streak atual</p>
                <p className={`text-[14px] font-bold font-mono tabular-nums ${stats.streakType === "win" ? "text-green-400" : "text-red-400"}`}>
                  {stats.streak} {stats.streak === 1 ? "dia" : "dias"} {stats.streakType === "win" ? "no verde" : "no vermelho"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
