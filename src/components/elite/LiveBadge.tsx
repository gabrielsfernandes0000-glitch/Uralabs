"use client";

import { useEffect, useState } from "react";

/**
 * Indicador "atualizado há X". Atualiza a cada 15s.
 * Cores pelos thresholds: fresh (<5min), okay (<30min), stale (>30min).
 */
export function TimestampAgo({
  iso,
  prefix = "atualizado",
  className = "",
}: {
  iso: string | null | undefined;
  prefix?: string;
  className?: string;
}) {
  const [label, setLabel] = useState<string>("");
  const [state, setState] = useState<"fresh" | "okay" | "stale">("okay");

  useEffect(() => {
    if (!iso) return;
    const update = () => {
      const ms = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(ms / 60000);
      if (mins < 1) setLabel("agora mesmo");
      else if (mins < 60) setLabel(`há ${mins}min`);
      else if (mins < 1440) setLabel(`há ${Math.floor(mins / 60)}h`);
      else setLabel(`há ${Math.floor(mins / 1440)}d`);

      if (mins < 5) setState("fresh");
      else if (mins < 30) setState("okay");
      else setState("stale");
    };
    update();
    const t = setInterval(update, 15_000);
    return () => clearInterval(t);
  }, [iso]);

  if (!iso) return null;

  const color = state === "fresh" ? "text-emerald-400/75" : state === "okay" ? "text-white/40" : "text-amber-400/70";
  const dotColor = state === "fresh" ? "bg-emerald-400" : state === "okay" ? "bg-white/35" : "bg-amber-400";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono tabular-nums ${color} ${className}`}>
      <span className="relative flex w-1.5 h-1.5">
        <span className={`absolute inset-0 rounded-full ${dotColor} ${state === "fresh" ? "live-pulse" : ""}`} />
      </span>
      {prefix} {label}
    </span>
  );
}

/** Badge "LIVE" com pulso — usar em dados streaming. */
export function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-500 ${className}`}>
      <span className="relative flex w-1.5 h-1.5">
        <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-70" />
        <span className="relative w-1.5 h-1.5 rounded-full bg-brand-500" />
      </span>
      Ao vivo
    </span>
  );
}
