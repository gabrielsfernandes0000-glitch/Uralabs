"use client";

import { useEffect, useState } from "react";

export type SessionLayoutMode = "focus" | "normal" | "quiet" | "planning";

/**
 * Layout mode baseado em horário BRT + weekday.
 *
 *   focus    (killzone 10:30–12:00 seg-sex) → UI enxuta, só essencial
 *   quiet    (lunch 12:00–13:30 seg-sex)    → baixa ênfase, evita distrair
 *   planning (after 16:30+ ou weekend)       → foco em revisão/prep
 *   normal   (resto)                          → layout completo
 */
export function useSessionLayoutMode(): { mode: SessionLayoutMode; brMinutes: number } | null {
  const [state, setState] = useState<{ mode: SessionLayoutMode; brMinutes: number } | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const brTotal = ((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes();
      const weekday = now.getUTCDay();
      const isWeekday = weekday >= 1 && weekday <= 5;

      let mode: SessionLayoutMode = "normal";
      if (!isWeekday) mode = "planning";
      else if (brTotal >= 10 * 60 + 30 && brTotal < 12 * 60) mode = "focus";
      else if (brTotal >= 12 * 60 && brTotal < 13 * 60 + 30) mode = "quiet";
      else if (brTotal >= 16 * 60 + 30 || brTotal < 8 * 60) mode = "planning";

      return { mode, brMinutes: brTotal };
    };

    setState(compute());
    const t = setInterval(() => setState(compute()), 30_000);
    return () => clearInterval(t);
  }, []);

  return state;
}
