import Link from "next/link";
import { Zap, CalendarClock } from "lucide-react";
import { instrumentsForEvent } from "@/lib/economic-events";
import type { EconomicEvent } from "@/lib/market-news";

/** Timestamp absoluto (ms UTC) de um evento date+time interpretado como BRT. */
function brtTimestamp(dateStr: string, time: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{1,2}:\d{2}$/.test(time)) return null;
  // BRT = UTC-3 fixo (Brasil não tem DST há anos).
  const d = new Date(`${dateStr}T${time.padStart(5, "0")}:00-03:00`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

function brtTodayStr(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function formatEta(mins: number): string {
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const mm = mins % 60;
  return mm > 0 ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
}

function countryCode(country: string): string {
  const map: Record<string, string> = {
    US: "EUA", EU: "UE", BR: "BR", UK: "UK", GB: "UK",
    CN: "CN", JP: "JP", CA: "CA", AU: "AU", NZ: "NZ",
    DE: "ALE", FR: "FRA", ES: "ESP",
  };
  return map[country] ?? country;
}

export function NextHighImpactCard({ events }: { events: EconomicEvent[] }) {
  const nowMs = Date.now();
  const windowEndMs = nowMs + 36 * 3600_000; // olha até 36h à frente
  const todayBRT = brtTodayStr();

  // Próximo evento de ALTO impacto ainda não liberado, via timestamp absoluto
  // BRT — cobre eventos depois de meia-noite UTC (ex: Japan às 20:30 BRT
  // salvos com event_date = amanhã).
  const upcoming = events
    .filter((e) => e.impact === "high" && !e.actual)
    .map((e) => ({ ev: e, ts: brtTimestamp(e.date ?? todayBRT, e.time) }))
    .filter((x): x is { ev: EconomicEvent; ts: number } =>
      x.ts !== null && x.ts >= nowMs && x.ts <= windowEndMs,
    )
    .sort((a, b) => a.ts - b.ts);

  const nextEntry = upcoming[0];
  const next = nextEntry?.ev;

  if (!next) {
    const highInWindow = events.filter(
      (e) => e.impact === "high" && (!e.date || e.date === todayBRT),
    );
    const allReleased = highInWindow.length > 0 && highInWindow.every((e) => !!e.actual);
    return (
      <Link
        href="/elite/noticias"
        className="interactive group rounded-xl bg-white/[0.02] hover:bg-white/[0.04] p-5 h-full flex flex-col transition-colors"
      >
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-3.5 h-3.5 text-white/35" />
          <h3 className="text-[12px] font-semibold text-white/85">Próximo evento</h3>
        </div>
        <div className="flex-1 flex flex-col items-start justify-center">
          <p className="text-[18px] font-semibold text-white/60 leading-tight">
            {allReleased ? "Tudo liberado" : "Nenhum alto impacto"}
          </p>
          <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
            {allReleased ? "Todos os releases de hoje já saíram." : "Dia pra operar só com gráfico."}
          </p>
        </div>
      </Link>
    );
  }

  const diff = Math.max(0, Math.round((nextEntry.ts - nowMs) / 60_000));
  const instruments = instrumentsForEvent(next.event, next.country).slice(0, 3);

  return (
    <Link
      href="/elite/noticias"
      className="interactive group rounded-xl surface-card hover:border-white/[0.12] p-5 h-full flex flex-col transition-colors relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-brand-500/40" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-500" strokeWidth={2} />
            <h3 className="text-[12px] font-semibold text-white/85">Próximo evento</h3>
          </div>
          <span className="text-[11px] font-medium text-brand-500">Alto impacto</span>
        </div>

        <div className="flex-1 flex flex-col items-start justify-center">
          <div className="flex items-baseline gap-2">
            <p className="text-[26px] font-bold text-white leading-none font-mono tabular-nums">
              {formatEta(diff)}
            </p>
            <p className="text-[11px] text-white/35 font-mono">
              · {next.time} {countryCode(next.country)}
            </p>
          </div>
          <p className="text-[12px] text-white/80 leading-tight mt-2 line-clamp-1 font-medium">
            {next.event}
          </p>
          {instruments.length > 0 && (
            <p className="text-[11px] text-white/40 font-mono mt-1">
              {instruments.map((s) => s.replace(/^\$/, "")).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
