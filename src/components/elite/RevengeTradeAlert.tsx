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
      className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02] p-4 animate-in slide-in-from-top"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(239,68,68,0.12),transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <AlertOctagon className="w-5 h-5 text-red-300" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-red-300">
              Possível revenge trade
            </span>
            <span className="text-red-400/50 text-[10px]">·</span>
            <span className="text-[10.5px] font-mono text-red-200/70">{signal.reason}</span>
          </div>
          <p className="text-[12.5px] text-white/80 leading-relaxed mb-2">
            Você teve <span className="font-bold text-red-300">{signal.lastLosses} losses consecutivos</span>.
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
          className="shrink-0 p-1.5 rounded-lg text-red-300/60 hover:text-red-200 hover:bg-red-500/10 transition-colors"
          aria-label="Dispensar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
