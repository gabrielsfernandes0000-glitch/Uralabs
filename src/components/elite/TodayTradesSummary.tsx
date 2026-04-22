"use client";

import { useMemo } from "react";
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { tradeR, setupById, symbolById } from "@/lib/playbook";

/**
 * Resumo do que foi operado hoje — aparece durante a jornada "Durante".
 *
 * 1 linha por trade. Sem filtros, sem paginação, sem expand.
 * Só trades do dia. Se o user quiser editar/ver detalhe, vai pra jornada Depois.
 */

function todayBR(): string {
  const now = new Date();
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

export function TodayTradesSummary() {
  const { progress } = useProgress();

  const todayTrades = useMemo(() => {
    const today = todayBR();
    return (progress?.trades ?? []).filter((t) => t.date === today).slice().reverse();
  }, [progress?.trades]);

  if (todayTrades.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 text-center">
        <p className="text-[12.5px] text-white/55 font-semibold mb-1">Nenhum trade registrado hoje</p>
        <p className="text-[11px] text-white/35">
          Depois de fechar um trade, registre acima — aparece aqui pra acompanhar o dia.
        </p>
      </div>
    );
  }

  const dayR = todayTrades.reduce((s, t) => s + tradeR(t), 0);
  const wins = todayTrades.filter((t) => t.result === "win").length;
  const losses = todayTrades.filter((t) => t.result === "loss").length;
  const bes = todayTrades.filter((t) => t.result === "be").length;
  const dayAccent = dayR > 0 ? "#10B981" : dayR < 0 ? "#EF4444" : "rgba(255,255,255,0.5)";

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
      {/* Header com resumo */}
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-white/75">Hoje</span>
          <span className="text-[10.5px] font-mono text-white/50">{todayTrades.length} {todayTrades.length === 1 ? "trade" : "trades"}</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] font-mono tabular-nums">
          {wins > 0 && <span className="text-emerald-400/85">{wins}W</span>}
          {losses > 0 && <span className="text-red-400/85">{losses}L</span>}
          {bes > 0 && <span className="text-white/50">{bes}BE</span>}
          <span className="text-white/25">·</span>
          <span className="font-bold text-[12.5px]" style={{ color: dayAccent }}>
            {dayR > 0 ? "+" : ""}{dayR.toFixed(2)}R
          </span>
        </div>
      </div>

      {/* Lista compacta */}
      <div className="divide-y divide-white/[0.03]">
        {todayTrades.map((t) => {
          const r = tradeR(t);
          const isLong = t.direction === "long";
          const isWin = t.result === "win";
          const isLoss = t.result === "loss";
          const DirIcon = isLong ? ArrowUp : ArrowDown;
          const dirColor = isLong ? "text-emerald-400/80" : "text-red-400/80";
          const ResultIcon = isWin ? ArrowUp : isLoss ? ArrowDown : Minus;
          const resultColor = isWin ? "#10B981" : isLoss ? "#EF4444" : "#94A3B8";
          const rColor = r > 0 ? "text-emerald-400" : r < 0 ? "text-red-400" : "text-white/45";

          const setup = setupById(t.setup);
          const symbol = symbolById(t.symbol);
          const mistakeCount = (t.mistakes ?? []).length;

          return (
            <div key={t.id} className="flex items-center gap-2.5 sm:gap-3 px-4 py-2.5">
              <div className="flex items-center gap-1.5 shrink-0">
                <DirIcon className={`w-3.5 h-3.5 ${dirColor}`} strokeWidth={2.5} />
                <ResultIcon className="w-3 h-3 shrink-0" style={{ color: resultColor }} strokeWidth={2} />
              </div>

              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                {symbol && (
                  <span
                    className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                    style={{ color: symbol.color, backgroundColor: symbol.color + "15" }}
                  >
                    {symbol.label}
                  </span>
                )}
                {t.timeframe && (
                  <span className="shrink-0 text-[9.5px] font-mono text-white/35 uppercase">{t.timeframe}</span>
                )}
                {setup && (
                  <span className="shrink-0 text-[11px] text-white/70 font-medium truncate">{setup.name}</span>
                )}
                {mistakeCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[9.5px] text-amber-400/75 shrink-0">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {mistakeCount}
                  </span>
                )}
              </div>

              <span className={`text-[12.5px] font-bold font-mono tabular-nums shrink-0 ${rColor}`}>
                {r > 0 ? "+" : ""}{r.toFixed(2)}R
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer — link pra ver todos */}
      <div className="px-4 py-2.5 border-t border-white/[0.04] bg-white/[0.01]">
        <p className="text-[10.5px] text-white/35 text-center">
          Detalhes, edição e screenshot — vá pra jornada <span className="text-white/55 font-semibold">Depois</span>
        </p>
      </div>
    </div>
  );
}
