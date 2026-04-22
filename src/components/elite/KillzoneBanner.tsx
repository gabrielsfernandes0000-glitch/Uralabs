"use client";

import { useKillzoneMode } from "@/hooks/useKillzoneMode";
import { Radio, AlertCircle } from "lucide-react";

/**
 * Banner que aparece quando está na killzone (10:30–12:00 BRT, seg-sex).
 * Modo compacto — só o essencial.
 * Oculto fora do horário.
 */
export function KillzoneBanner() {
  const state = useKillzoneMode();
  if (!state) return null;
  if (!state.isKillzone) return null;

  return (
    <div className="rounded-xl surface-card border-l-2 border-l-brand-500 px-4 py-3 flex items-center gap-3">
      <span className="relative flex w-2 h-2 shrink-0">
        <span className="absolute inset-0 rounded-full animate-ping bg-brand-500 opacity-60" />
        <span className="relative w-2 h-2 rounded-full bg-brand-500" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white leading-none">
          Killzone ativa
        </p>
        <p className="text-[12px] text-white/55 mt-1 leading-snug">
          Janela de maior edge. Foco total — evite abrir novas abas.
        </p>
      </div>
    </div>
  );
}

/**
 * Alerta quando killzone está a 30min ou menos. Prep final.
 */
export function KillzoneWarmup() {
  const state = useKillzoneMode();
  if (!state) return null;
  if (state.minutesToKillzone === null) return null;
  if (state.minutesToKillzone > 30 || state.minutesToKillzone <= 0) return null;

  return (
    <div className="rounded-xl surface-card border-l-2 border-l-white/25 px-4 py-3 flex items-center gap-3">
      <AlertCircle className="w-4 h-4 text-white/55 shrink-0" strokeWidth={2} />
      <div className="flex-1">
        <p className="text-[12px] font-semibold text-white leading-none">
          Killzone em {state.minutesToKillzone}min
        </p>
        <p className="text-[12px] text-white/55 mt-1 leading-snug">
          Últimos ajustes no prep. Marque níveis, confira watchlist.
        </p>
      </div>
    </div>
  );
}

export function SessionPhaseIndicator() {
  const state = useKillzoneMode();
  if (!state) return null;

  const colors: Record<string, string> = {
    pre: "text-white/55",
    killzone: "text-brand-500",
    lunch: "text-white/45",
    pm: "text-white/75",
    after: "text-white/40",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] ${colors[state.phase]}`}>
      <Radio className="w-3 h-3" strokeWidth={2} />
      {state.label}
    </span>
  );
}
