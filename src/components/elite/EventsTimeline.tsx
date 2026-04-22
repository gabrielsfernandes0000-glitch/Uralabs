"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { impactMeta, type EconomicEvent } from "@/lib/market-news";
import { Check } from "lucide-react";

/**
 * Timeline horizontal — últimas 2h até próximas 6h.
 * "Agora" marcado no centro. Scroll horizontal livre.
 * Cada tick = evento econômico. Densidade adaptável ao horário.
 */

const WINDOW_BACK_MIN = 120;   // 2h atrás
const WINDOW_FWD_MIN = 360;    // 6h pra frente
const TOTAL_WINDOW = WINDOW_BACK_MIN + WINDOW_FWD_MIN;
const PX_PER_MIN = 4;          // 4px por min = 1920px total = scroll horizontal

function parseMins(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function EventsTimeline({ events }: { events: EconomicEvent[] }) {
  const [nowMins, setNowMins] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowMins(((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes());
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(() => {
    if (nowMins === null) return [];
    return events
      .filter((e) => {
        const m = parseMins(e.time);
        if (m === null) return false;
        return m >= nowMins - WINDOW_BACK_MIN && m <= nowMins + WINDOW_FWD_MIN;
      })
      .sort((a, b) => (parseMins(a.time) ?? 0) - (parseMins(b.time) ?? 0));
  }, [events, nowMins]);

  // Scroll inicial pro "agora" ficar no primeiro terço visível
  useEffect(() => {
    if (!scrollRef.current || nowMins === null) return;
    const el = scrollRef.current;
    const nowPx = WINDOW_BACK_MIN * PX_PER_MIN;
    el.scrollLeft = Math.max(0, nowPx - el.clientWidth / 3);
  }, [nowMins]);

  if (nowMins === null) {
    return <div className="h-[90px] rounded-xl bg-white/[0.02] animate-pulse" />;
  }

  const totalWidth = TOTAL_WINDOW * PX_PER_MIN;
  const nowPx = WINDOW_BACK_MIN * PX_PER_MIN;

  // Hour ticks (cada hora cheia)
  const hourTicks: Array<{ px: number; label: string; isNow?: boolean }> = [];
  const startHour = Math.floor((nowMins - WINDOW_BACK_MIN) / 60);
  const endHour = Math.ceil((nowMins + WINDOW_FWD_MIN) / 60);
  for (let h = startHour; h <= endHour; h++) {
    const absMin = h * 60;
    const px = (absMin - (nowMins - WINDOW_BACK_MIN)) * PX_PER_MIN;
    if (px >= 0 && px <= totalWidth) {
      const hourMod = ((h % 24) + 24) % 24;
      hourTicks.push({ px, label: `${String(hourMod).padStart(2, "0")}h` });
    }
  }

  return (
    <div className="relative rounded-xl border border-white/[0.05] bg-[#0c0c0e] overflow-hidden">
      <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden scrollbar-thin">
        <div className="relative h-[110px]" style={{ width: totalWidth, minWidth: "100%" }}>
          {/* Hour grid */}
          {hourTicks.map((t, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex flex-col items-start pointer-events-none"
              style={{ left: t.px }}
            >
              <div className="w-px h-full bg-white/[0.04]" />
              <span className="absolute top-1 left-1.5 text-[9px] font-mono tabular-nums text-white/25">{t.label}</span>
            </div>
          ))}

          {/* Now line — marcador central */}
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-brand-500 z-10 pointer-events-none"
            style={{ left: nowPx, boxShadow: "0 0 12px rgba(255,85,0,0.6)" }}
          >
            <span className="absolute top-1 left-1 text-[10px] font-semibold text-brand-500 whitespace-nowrap">
              Agora
            </span>
          </div>

          {/* Events como pins */}
          {visible.map((ev) => {
            const m = parseMins(ev.time)!;
            const px = (m - (nowMins - WINDOW_BACK_MIN)) * PX_PER_MIN;
            return <TimelinePin key={ev.id} ev={ev} px={px} isPast={m < nowMins} />;
          })}

          {/* Empty state */}
          {visible.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[11px] text-white/35">Sem eventos nas próximas 6h</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelinePin({ ev, px, isPast }: { ev: EconomicEvent; px: number; isPast: boolean }) {
  const m = impactMeta(ev.impact);
  const released = !!ev.actual;
  const opacity = isPast && !released ? 0.35 : isPast ? 0.55 : 1;

  const isHigh = ev.impact === "high";
  const dotSize = isHigh ? "w-2.5 h-2.5" : "w-2 h-2";

  return (
    <div
      className="absolute group"
      style={{ left: px - 6, top: 36, opacity }}
    >
      <div className="flex flex-col items-center">
        <span
          className={`${dotSize} rounded-full shrink-0 relative`}
          style={{
            backgroundColor: m.dotBg,
            boxShadow: isHigh && !isPast ? `0 0 0 3px ${m.dotBg}28, 0 0 10px ${m.dotBg}66` : undefined,
          }}
        >
          {released && (
            <Check className="absolute inset-0 w-full h-full text-[#0c0c0e] p-0.5" strokeWidth={3.5} />
          )}
        </span>
        <span className="mt-2 text-[9.5px] font-mono tabular-nums text-white/60 whitespace-nowrap">{ev.time}</span>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-20">
          <div className="px-2.5 py-1.5 rounded-lg bg-[#0a0a0c] border border-white/[0.12] shadow-lg whitespace-nowrap max-w-[280px]">
            <p className="text-[10.5px] font-semibold text-white truncate">{ev.event}</p>
            <p className="text-[9.5px] text-white/50 font-mono">{ev.country} · {m.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
