"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, X } from "lucide-react";
import { detectRevengeRisk, useTrades } from "@/lib/trading-journal";

/**
 * Banner que aparece quando detecta padrão de revenge trade:
 * 2+ losses consecutivos nos últimos 15min. Força pausa mental.
 *
 * Checa a cada 30s (caso o user abra a aba no meio do dia).
 */

export function RevengeTradeAlert() {
  const [trades] = useTrades();
  const [dismissed, setDismissed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Reset do dismissed quando novos trades chegam
  useEffect(() => {
    setDismissed(false);
  }, [trades.length]);

  const signal = detectRevengeRisk(trades);
  if (!signal.active || dismissed) return null;

  return (
    <div
      key={tick}
      className="relative overflow-hidden rounded-xl surface-card border-l-2 border-l-red-500 p-4 animate-in slide-in-from-top"
    >
      <div className="relative z-10 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[13px] font-semibold text-white">
              Possível revenge trade
            </span>
            <span className="text-white/20 text-[10px]">·</span>
            <span className="text-[11px] text-white/45">{signal.reason}</span>
          </div>
          <p className="text-[12.5px] text-white/75 leading-relaxed mb-2">
            Você teve <span className="font-semibold text-white">{signal.lastLosses} losses consecutivos</span>.
            Entrar agora raramente é decisão racional — é cobrança emocional tentando recuperar.
          </p>
          <ul className="text-[11.5px] text-white/55 space-y-0.5 list-disc pl-4">
            <li>Levanta, respira 5 minutos</li>
            <li>Revê o que tá acontecendo no mercado</li>
            <li>Revê os trades — foi erro de setup, execução ou fora do plano?</li>
            <li>Só volte pra operar se tiver setup A+ claro</li>
          </ul>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
          aria-label="Dispensar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
