"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Award, Target, DollarSign, AlertCircle } from "lucide-react";
import { computeStats, useTrades } from "@/lib/trading-journal";

/**
 * Dashboard de estatísticas do trader — lê trades do localStorage e mostra
 * winrate, avg R, profit factor, expectancy, max DD, melhor/pior trade.
 */

export function TraderStats({ compact }: { compact?: boolean }) {
  const [trades] = useTrades();
  const stats = useMemo(() => computeStats(trades), [trades]);

  if (stats.total === 0) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-8 text-center">
        <Target className="w-8 h-8 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-[13px] text-white/50 mb-1">Nenhum trade registrado ainda.</p>
        <p className="text-[11px] text-white/30">Registre seu primeiro trade no Diário pra começar a ver estatísticas.</p>
      </div>
    );
  }

  const closedCount = stats.total - stats.open;
  const hasClosed = closedCount > 0;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-brand-500" strokeWidth={1.8} />
          <h3 className="text-[13px] font-bold text-white/90">Suas estatísticas</h3>
        </div>
        <span className="text-[10.5px] font-mono tabular-nums text-white/40">
          {stats.total} {stats.total === 1 ? "trade" : "trades"}
          {stats.open > 0 && <span className="text-amber-400/60"> · {stats.open} abertos</span>}
        </span>
      </div>

      {!hasClosed && (
        <div className="rounded-lg surface-card border-l-2 border-l-amber-500 px-3 py-2 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[11px] text-amber-200/80">
            Feche um trade (marque win/loss/breakeven) pra começar a ver estatísticas.
          </p>
        </div>
      )}

      {hasClosed && (
        <>
          {/* Grid de métricas principais */}
          <div className={`grid gap-2.5 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
            <Stat
              label="Winrate"
              value={`${(stats.winrate * 100).toFixed(0)}%`}
              sub={`${stats.wins}W / ${stats.losses}L`}
              accent={stats.winrate >= 0.5 ? "#10B981" : stats.winrate >= 0.35 ? "#F59E0B" : "#EF4444"}
            />
            <Stat
              label="R médio"
              value={`${stats.avgR >= 0 ? "+" : ""}${stats.avgR.toFixed(2)}R`}
              sub={`total ${stats.totalR >= 0 ? "+" : ""}${stats.totalR.toFixed(1)}R`}
              accent={stats.avgR >= 0.5 ? "#10B981" : stats.avgR >= 0 ? "#F59E0B" : "#EF4444"}
            />
            <Stat
              label="Profit factor"
              value={
                !isFinite(stats.profitFactor)
                  ? "∞"
                  : stats.profitFactor.toFixed(2)
              }
              sub={stats.profitFactor >= 1.5 ? "bom" : stats.profitFactor >= 1 ? "break-even" : "ruim"}
              accent={stats.profitFactor >= 1.5 ? "#10B981" : stats.profitFactor >= 1 ? "#F59E0B" : "#EF4444"}
            />
            <Stat
              label="P&L total"
              value={`${stats.totalPnlUsd >= 0 ? "+" : ""}$${Math.abs(stats.totalPnlUsd).toFixed(0)}`}
              sub={`drawdown ${stats.maxDrawdownR.toFixed(1)}R`}
              accent={stats.totalPnlUsd >= 0 ? "#10B981" : "#EF4444"}
            />
          </div>

          {/* Best / worst trade */}
          {(stats.bestTrade || stats.worstTrade) && !compact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-white/[0.04]">
              {stats.bestTrade && (
                <div className="flex items-center gap-3 rounded-lg surface-card border-l-2 border-l-emerald-500 px-3 py-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9.5px] text-emerald-400/80 mb-0.5">Melhor trade</p>
                    <p className="text-[11px] font-mono text-white/80 truncate">
                      {stats.bestTrade.asset} · {stats.bestTrade.direction}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold font-mono tabular-nums text-emerald-300 shrink-0">
                    +{(stats.bestTrade.rMultiple ?? 0).toFixed(2)}R
                  </p>
                </div>
              )}
              {stats.worstTrade && (
                <div className="flex items-center gap-3 rounded-lg bg-red-500/[0.04] border border-red-500/20 px-3 py-2.5">
                  <TrendingDown className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9.5px] text-red-400/80 mb-0.5">Pior trade</p>
                    <p className="text-[11px] font-mono text-white/80 truncate">
                      {stats.worstTrade.asset} · {stats.worstTrade.direction}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold font-mono tabular-nums text-red-300 shrink-0">
                    {(stats.worstTrade.rMultiple ?? 0).toFixed(2)}R
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="rounded-lg bg-[#0a0a0c] border border-white/[0.05] p-3">
      <p className="text-[9.5px] text-white/35">{label}</p>
      <p className="text-[18px] font-bold font-mono tabular-nums mt-0.5" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-[10px] text-white/35 mt-0.5">{sub}</p>
    </div>
  );
}
