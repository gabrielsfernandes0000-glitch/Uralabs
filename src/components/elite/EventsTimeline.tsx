"use client";

import { useEffect, useMemo, useState } from "react";
import { impactMeta, type EconomicEvent } from "@/lib/market-news";
import { Check } from "lucide-react";

/**
 * Agenda intradiária — últimas 2h até próximas 6h, em cards divididos.
 * Cada evento é um card self-contained. Separador "Agora" entre passado/futuro.
 */

const WINDOW_BACK_MIN = 120;
const WINDOW_FWD_MIN = 360;

function parseMins(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function EventsTimeline({ events }: { events: EconomicEvent[] }) {
  const [nowMins, setNowMins] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowMins(((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes());
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const { past, future } = useMemo(() => {
    if (nowMins === null) return { past: [] as EconomicEvent[], future: [] as EconomicEvent[] };
    const inWindow = events
      .filter((e) => {
        const m = parseMins(e.time);
        if (m === null) return false;
        return m >= nowMins - WINDOW_BACK_MIN && m <= nowMins + WINDOW_FWD_MIN;
      })
      .sort((a, b) => (parseMins(a.time) ?? 0) - (parseMins(b.time) ?? 0));
    return {
      past: inWindow.filter((e) => (parseMins(e.time) ?? 0) < nowMins),
      future: inWindow.filter((e) => (parseMins(e.time) ?? 0) >= nowMins),
    };
  }, [events, nowMins]);

  if (nowMins === null) {
    return <div className="h-[140px] rounded-xl bg-white/[0.02] animate-pulse" />;
  }

  const total = past.length + future.length;
  if (total === 0) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] px-5 py-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-brand-500">Agora</span>
        </div>
        <p className="text-[12px] text-white/45">Sem eventos nas próximas 6h</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] p-4 space-y-3">
      {/* Seção passado (se houver) */}
      {past.length > 0 && (
        <section>
          <SectionLabel text={`Últimas ${Math.min(WINDOW_BACK_MIN / 60, 2)}h`} count={past.length} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {past.map((ev) => (
              <EventCard key={ev.id} ev={ev} past />
            ))}
          </div>
        </section>
      )}

      {/* Separador "Agora" */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
        <span className="text-[10px] font-bold text-brand-500 tracking-[0.2em] uppercase">Agora</span>
        <div className="flex-1 h-px bg-gradient-to-r from-brand-500/40 via-white/[0.06] to-transparent" />
      </div>

      {/* Seção futuro */}
      {future.length > 0 ? (
        <section>
          <SectionLabel text={`Próximas ${WINDOW_FWD_MIN / 60}h`} count={future.length} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {future.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-[11px] text-white/35 text-center py-3">Sem eventos nas próximas 6h</p>
      )}
    </div>
  );
}

function SectionLabel({ text, count }: { text: string; count: number }) {
  return (
    <div className="flex items-baseline gap-2 mb-2 px-0.5">
      <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-white/45">{text}</span>
      <span className="text-[10px] font-mono tabular-nums text-white/30">{count}</span>
    </div>
  );
}

function EventCard({ ev, past = false }: { ev: EconomicEvent; past?: boolean }) {
  const m = impactMeta(ev.impact);
  const released = !!ev.actual;
  const isHigh = ev.impact === "high";

  return (
    <div
      className={`group relative rounded-lg border px-2.5 py-2 transition-colors ${
        past ? "border-white/[0.04] bg-white/[0.01]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.03]"
      }`}
      style={past ? { opacity: released ? 0.7 : 0.45 } : undefined}
      title={`${ev.event} · ${ev.country} · ${m.label}`}
    >
      {/* Header: hora + dot + country */}
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: m.dotBg,
            boxShadow: isHigh && !past ? `0 0 0 2px ${m.dotBg}22` : undefined,
          }}
        />
        <span className="text-[11px] font-mono tabular-nums font-bold text-white/85">{ev.time}</span>
        <span className="text-white/15 text-[9px]">·</span>
        <span className="text-[10px] font-mono text-white/40 truncate">{ev.country}</span>
        {released && (
          <Check className="ml-auto w-3 h-3 text-white/55" strokeWidth={2.5} />
        )}
      </div>

      {/* Event name */}
      <p className="text-[11.5px] text-white/80 leading-snug line-clamp-2">{ev.event}</p>

      {/* Actual vs forecast (se liberado) */}
      {released && (
        <div className="mt-1.5 pt-1.5 border-t border-white/[0.04] flex items-center gap-2 text-[9.5px] font-mono tabular-nums">
          <span className="text-white/35">Prev. {ev.forecast ?? "—"}</span>
          <span className="text-white/15">·</span>
          <span className="text-white/85">Real {ev.actual}</span>
        </div>
      )}
    </div>
  );
}
