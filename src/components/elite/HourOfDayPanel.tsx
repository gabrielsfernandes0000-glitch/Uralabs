"use client";

import type { HourOfDayStats } from "@/lib/trade-metrics";

/**
 * Performance por hora de abertura (BRT).
 *
 * Trader famoso do Tradervue: "perco dinheiro das 12:00-14:00 (lunch)".
 * Esse painel mostra esse padrão concretamente. Horas sem trades somem.
 */
export function HourOfDayPanel({ hod }: { hod: HourOfDayStats[] }) {
  if (hod.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5 text-center">
        <h4 className="text-[12px] font-semibold text-white/80 mb-2">Por hora do dia</h4>
        <p className="text-[11px] text-white/40 max-w-md mx-auto">
          Registre a <span className="text-white/60 font-semibold">hora de abertura</span> do trade no form pra ver seu padrão por hora.
          Concorrentes mostram que traders perdem dinheiro consistentemente em horários específicos (lunch, pós-open).
        </p>
      </div>
    );
  }

  const maxAbsR = Math.max(...hod.map((h) => Math.abs(h.totalR)), 0.1);

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h4 className="text-[12px] font-semibold text-white/80">Por hora do dia (BRT)</h4>
        <span className="text-[10.5px] text-white/35 font-mono tabular-nums">
          {hod.reduce((s, h) => s + h.trades, 0)} trades em {hod.length} hora{hod.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Bar chart horizontal com hora como eixo */}
      <div className="space-y-1.5">
        {hod.map((h) => {
          const pct = maxAbsR > 0 ? Math.abs(h.totalR) / maxAbsR : 0;
          const color = h.totalR > 0 ? "#10B981" : h.totalR < 0 ? "#EF4444" : "rgba(255,255,255,0.35)";
          return (
            <div key={h.hour} className="flex items-center gap-2 text-[10.5px]">
              <span className="shrink-0 w-10 font-mono tabular-nums text-white/45">
                {String(h.hour).padStart(2, "0")}h
              </span>
              <div className="flex-1 min-w-0 relative h-4 rounded bg-white/[0.03] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                  style={{ width: `${pct * 100}%`, backgroundColor: color + "CC" }}
                />
              </div>
              <div className="shrink-0 flex items-center gap-2 font-mono tabular-nums">
                <span className="text-white/35 w-7 text-right">{h.trades}x</span>
                <span className="text-white/40 w-10 text-right">{h.winRate.toFixed(0)}%</span>
                <span className="font-bold w-14 text-right" style={{ color }}>
                  {h.totalR > 0 ? "+" : ""}{h.totalR.toFixed(2)}R
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-white/30 mt-3 italic">
        Use essa janela pra decidir quando ligar/desligar o terminal.
      </p>
    </div>
  );
}
