"use client";

import { useEffect, useState } from "react";

/**
 * Detecta estado da sessão NY em BRT.
 * Killzone = 10:30–12:00 BRT (janela de maior edge).
 *
 * Atualiza a cada 30s pra capturar transições sem keep-alive pesado.
 */
export type TradingPhase = "pre" | "killzone" | "lunch" | "pm" | "after";

export type TradingState = {
  phase: TradingPhase;
  isKillzone: boolean;
  isLive: boolean;
  brMinutes: number;
  label: string;
  minutesToKillzone: number | null;
};

function compute(): TradingState {
  const now = new Date();
  const brTotal = ((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes();

  let phase: TradingPhase = "pre";
  let label = "Pré-open";
  if (brTotal >= 10 * 60 + 30 && brTotal < 12 * 60) { phase = "killzone"; label = "Killzone"; }
  else if (brTotal >= 12 * 60 && brTotal < 13 * 60 + 30) { phase = "lunch"; label = "Lunch"; }
  else if (brTotal >= 13 * 60 + 30 && brTotal < 16 * 60 + 30) { phase = "pm"; label = "Sessão PM"; }
  else if (brTotal >= 16 * 60 + 30) { phase = "after"; label = "After"; }

  const weekday = now.getUTCDay();
  const isWeekday = weekday >= 1 && weekday <= 5;
  const isKillzone = phase === "killzone" && isWeekday;
  const isLive = phase !== "pre" && phase !== "after" && isWeekday;

  const kStart = 10 * 60 + 30;
  const minutesToKillzone = brTotal < kStart ? kStart - brTotal : null;

  return { phase, isKillzone, isLive, brMinutes: brTotal, label, minutesToKillzone };
}

export function useKillzoneMode() {
  const [state, setState] = useState<TradingState | null>(null);

  useEffect(() => {
    setState(compute());
    const t = setInterval(() => setState(compute()), 30_000);
    return () => clearInterval(t);
  }, []);

  return state;
}
