import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import type { EconomicEvent } from "@/lib/market-news";
import { computeSurprise, eventCategory, eventExplanation } from "@/lib/economic-events";

/**
 * Card que mostra o ÚLTIMO evento econômico divulgado com seu surprise.
 * Transforma o "divulgou o CPI" em info acionável: foi acima, abaixo, em linha?
 * Server component — recebe o event já buscado pelo parent.
 */
export function RecentSurpriseCard({ event: ev }: { event: EconomicEvent }) {
  const surprise = computeSurprise(ev.actual, ev.forecast);
  const explanation = eventExplanation(ev.event);
  const category = eventCategory(ev.event);
  const countryCode = (c: string): string =>
    ({ US: "EUA", EU: "UE", BR: "BR", UK: "UK", CN: "CN", JP: "JP", CA: "CA", NZ: "NZ" } as Record<string, string>)[c] ?? c;

  const directionColor = surprise
    ? surprise.direction === "up"
      ? "#22C55E"
      : surprise.direction === "down"
      ? "#EF4444"
      : "rgba(255,255,255,0.45)"
    : "rgba(255,255,255,0.45)";

  return (
    <div className="relative overflow-hidden rounded-xl surface-card p-5">
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ backgroundColor: `${directionColor}40` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {surprise?.direction === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: directionColor }} strokeWidth={2} />
            ) : surprise?.direction === "down" ? (
              <TrendingDown className="w-3.5 h-3.5" style={{ color: directionColor }} strokeWidth={2} />
            ) : (
              <Minus className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />
            )}
            <span className="text-[12px] font-semibold text-white/85">
              Último release · {category}
            </span>
          </div>
          <span className="text-[11px] text-white/40 font-mono tabular-nums">{countryCode(ev.country)} · {ev.time}</span>
        </div>

        <h3 className="text-[16px] font-semibold text-white leading-tight tracking-tight mb-2">{ev.event}</h3>

        <div className="grid grid-cols-3 gap-3 mb-3 pt-2 border-t border-white/[0.04]">
          <div>
            <p className="text-[11px] text-white/40 mb-1">Consenso</p>
            <p className="text-[15px] font-mono font-semibold text-white/60 tabular-nums">{ev.forecast ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/40 mb-1">Real</p>
            <p className="text-[15px] font-mono font-semibold text-white tabular-nums">{ev.actual ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/40 mb-1">Surpresa</p>
            {surprise ? (
              <p className="text-[15px] font-mono font-bold tabular-nums" style={{ color: directionColor }}>
                {surprise.direction === "up" ? "↑" : surprise.direction === "down" ? "↓" : "≈"} {surprise.label}
              </p>
            ) : (
              <p className="text-[15px] font-mono text-white/20">—</p>
            )}
          </div>
        </div>

        {explanation && surprise && surprise.direction !== "flat" && (
          <p className="text-[11.5px] text-white/55 leading-relaxed">
            {surprise.direction === "up" ? "Resultado acima do consenso." : "Resultado abaixo do consenso."}{" "}
            <span className="text-white/40">{explanation.whyMatters}</span>
          </p>
        )}
        {surprise && surprise.direction === "flat" && (
          <p className="text-[11.5px] text-white/45 leading-relaxed">
            Veio em linha com o consenso — reação do mercado geralmente limitada.
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <Link href="/elite/noticias" className="text-[10.5px] text-white/30 hover:text-white/60 transition-colors">
            Ver agenda completa →
          </Link>
        </div>
      </div>
    </div>
  );
}
