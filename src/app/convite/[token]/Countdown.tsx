"use client";

import { useEffect, useState } from "react";

function computeParts(expiresAt: string): { d: number; h: number; m: number; s: number; expired: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s, expired: false };
}

export function Countdown({ expiresAt }: { expiresAt: string }) {
  const [parts, setParts] = useState(() => computeParts(expiresAt));

  useEffect(() => {
    const tick = () => setParts(computeParts(expiresAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (parts.expired) {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-mono" style={{ color: "#ef4444" }}>
        <span className="size-1.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
        Convite expirado
      </div>
    );
  }

  const units: { label: string; value: number }[] = [];
  if (parts.d > 0) units.push({ label: "d", value: parts.d });
  units.push({ label: "h", value: parts.h });
  units.push({ label: "m", value: parts.m });
  if (parts.d === 0 && parts.h === 0) units.push({ label: "s", value: parts.s });

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="flex items-center gap-1 font-mono tabular-nums text-sm"
        style={{ color: "#C9A461" }}
      >
        {units.map((u, i) => (
          <span key={u.label} className="inline-flex items-baseline gap-0.5">
            <span>{String(u.value).padStart(2, "0")}</span>
            <span className="text-[10px] uppercase" style={{ opacity: 0.6 }}>
              {u.label}
            </span>
            {i < units.length - 1 && <span className="opacity-40 mx-0.5">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
