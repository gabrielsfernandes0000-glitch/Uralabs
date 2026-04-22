import Link from "next/link";
import { Zap, CalendarClock } from "lucide-react";
import { instrumentsForEvent } from "@/lib/economic-events";
import type { EconomicEvent } from "@/lib/market-news";

function parseMins(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function brtNowMins(): number {
  const s = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
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
  const nowMins = brtNowMins();

  // Próximo evento de ALTO impacto ainda não liberado
  const next = events
    .filter((e) => {
      if (e.impact !== "high") return false;
      const m = parseMins(e.time);
      return m !== null && m >= nowMins;
    })
    .sort((a, z) => (parseMins(a.time) ?? 99999) - (parseMins(z.time) ?? 99999))[0];

  if (!next) {
    const highToday = events.filter((e) => e.impact === "high");
    const allReleased = highToday.length > 0 && highToday.every((e) => !!e.actual);
    return (
      <Link
        href="/elite/noticias"
        className="interactive group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 h-full flex flex-col transition-colors"
      >
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-3.5 h-3.5 text-white/35" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Próximo evento</h3>
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

  const eventMins = parseMins(next.time) ?? nowMins;
  const diff = eventMins - nowMins;
  const instruments = instrumentsForEvent(next.event, next.country).slice(0, 3);

  return (
    <Link
      href="/elite/noticias"
      className="interactive group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 h-full flex flex-col transition-colors relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.04] to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-red-400/80" strokeWidth={2} />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Próximo evento</h3>
          </div>
          <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-red-400/80">Alto impacto</span>
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
            <p className="text-[9px] text-white/35 font-mono uppercase tracking-[0.15em] mt-1">
              {instruments.map((s) => s.replace(/^\$/, "")).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
