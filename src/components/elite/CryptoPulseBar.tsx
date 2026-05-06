import { Gauge } from "lucide-react";
import type { GlobalStats, AltSeasonIndex } from "@/lib/crypto-pulse";
import { classifyFG, fgAccent, type FearGreedReading } from "@/lib/fear-greed";

/**
 * Crypto Regime Bar — 3 indicadores que mudam setup (não decoração).
 *   1. Fear & Greed crypto (timing macro)
 *   2. BTC Dominance (regime BTC vs alts)
 *   3. Altcoin Season Index (rotação)
 *
 * + Sentimento de ações (S&P) quando disponível — 4ª cell opcional.
 *
 * Server component. Sem trending coin / market cap / volume — informação sem
 * utilidade direta pra decisão.
 */
export function CryptoPulseBar({
  fearGreedCrypto,
  fearGreedEquities,
  globalStats,
  altSeason,
}: {
  fearGreedCrypto: FearGreedReading | null;
  fearGreedEquities: FearGreedReading | null;
  globalStats: GlobalStats | null;
  altSeason: AltSeasonIndex | null;
}) {
  // Se não tem nada utilizável, não renderiza.
  if (!fearGreedCrypto && !fearGreedEquities && !globalStats && !altSeason) return null;

  // Renderizado dentro do container "Pulse" da página /noticias — sem
  // background/border próprios. Mantém divisores verticais p/ ritmo de tape.
  return (
    <div className="flex items-stretch divide-x divide-white/[0.04] overflow-x-auto">
      <HeaderCell />
      {fearGreedEquities && <FGCell label="Ações S&P" reading={fearGreedEquities} />}
      {fearGreedCrypto && <FGCell label="Crypto" reading={fearGreedCrypto} />}
      {globalStats && <DominanceCell btc={globalStats.btcDominance} />}
      {altSeason && <AltSeasonCell data={altSeason} />}
    </div>
  );
}

function HeaderCell() {
  return (
    <div className="shrink-0 px-4 py-2.5 flex items-center gap-2 bg-white/[0.015]">
      <Gauge className="w-3 h-3 text-white/45" strokeWidth={2} />
      <span className="text-[10px] font-bold tracking-wider uppercase text-white/55">Regime</span>
    </div>
  );
}

function FGCell({ label, reading }: { label: string; reading: FearGreedReading }) {
  const color = fgAccent(reading.value);
  return (
    <div className="shrink-0 px-4 py-2.5 min-w-[160px]">
      <p className="text-[11px] text-white/40 leading-none">{label}</p>
      <div className="flex items-center gap-2.5 mt-1.5">
        <p className="text-[18px] font-semibold font-mono tabular-nums text-white leading-none">
          {reading.value}
        </p>
        <div className="flex-1 min-w-[50px] h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${reading.value}%`, backgroundColor: color }} />
        </div>
      </div>
      <p className="text-[11px] mt-1.5 leading-none" style={{ color }}>{classifyFG(reading.value)}</p>
    </div>
  );
}

function DominanceCell({ btc }: { btc: number }) {
  const regime = btc > 55 ? "BTC forte" : btc < 45 ? "Alts fortes" : "Equilibrado";
  return (
    <div className="shrink-0 px-4 py-2.5 min-w-[160px]">
      <p className="text-[11px] text-white/40 leading-none">BTC Dominance</p>
      <div className="flex items-baseline gap-2 mt-1.5">
        <p className="text-[18px] font-semibold font-mono tabular-nums text-white leading-none">
          {btc.toFixed(1)}<span className="text-[11px] text-white/40">%</span>
        </p>
      </div>
      <p className="text-[11px] text-white/55 mt-1.5 leading-none">{regime}</p>
    </div>
  );
}

function AltSeasonCell({ data }: { data: AltSeasonIndex }) {
  return (
    <div className="shrink-0 px-4 py-3 min-w-[180px]">
      <p className="text-[11px] text-white/40 leading-none">Altcoin Season</p>
      <div className="flex items-center gap-2.5 mt-1.5">
        <p className="text-[18px] font-semibold font-mono tabular-nums text-white leading-none">
          {data.score}<span className="text-white/30 text-[10px]">/100</span>
        </p>
        <div className="flex-1 min-w-[50px] h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full rounded-full bg-white/50" style={{ width: `${data.score}%` }} />
        </div>
      </div>
      <p className="text-[11px] text-white/55 mt-1.5 leading-none">{data.label}</p>
    </div>
  );
}
