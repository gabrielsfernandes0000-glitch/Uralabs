import { TrendingUp } from "lucide-react";
import type { EconomicEvent } from "@/lib/market-news";
import { CryptoPulseBar } from "@/components/elite/CryptoPulseBar";
import { MultiAssetTape } from "@/components/elite/MultiAssetTape";
import { UpcomingAgenda } from "@/components/elite/UpcomingAgenda";
import { fetchFearGreedSnapshot } from "@/lib/fear-greed";
import { fetchGlobalStats, fetchAltSeasonIndex } from "@/lib/crypto-pulse";
import { fetchUpcomingEarnings } from "@/lib/earnings";
import { fetchNextFedMeetingProb } from "@/lib/fed-watch";
import { fetchPriceSnapshots } from "@/lib/price-snapshot";

/**
 * Server components async pra streaming. Cada um faz seu próprio fetch
 * de APIs externas (lentas — 300-2000ms). A page principal só await o
 * fetch crítico do Supabase e renderiza shell + feed; estes ficam em
 * <Suspense> pra streamar conforme respondem.
 */

/* ──────────────────────────────────────────────────────────────
   Pulse strip — preços + regime de mercado (4 fetches externos)
   ────────────────────────────────────────────────────────────── */

export async function PulseStripAsync() {
  const [priceSnaps, fgSnapshot, globalStats, altSeason] = await Promise.all([
    fetchPriceSnapshots(["NQ", "BTC", "ETH", "DXY", "GOLD"]).catch(() => ({} as Record<string, null>)),
    fetchFearGreedSnapshot().catch(() => ({ crypto: null, equities: null })),
    fetchGlobalStats().catch(() => null),
    fetchAltSeasonIndex().catch(() => null),
  ]);

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0a0a0c] overflow-hidden">
      <MultiAssetTape snapshots={priceSnaps} />
      <div className="border-t border-white/[0.04]">
        <CryptoPulseBar
          fearGreedCrypto={fgSnapshot.crypto}
          fearGreedEquities={fgSnapshot.equities}
          globalStats={globalStats}
          altSeason={altSeason}
        />
      </div>
    </div>
  );
}

export function PulseStripSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0a0a0c] overflow-hidden">
      <div className="h-[58px] bg-white/[0.015] animate-pulse" />
      <div className="border-t border-white/[0.04] h-[78px] bg-white/[0.01] animate-pulse" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   FedWatch — probabilidade da próxima reunião do FOMC
   ────────────────────────────────────────────────────────────── */

export async function FedWatchAsync() {
  const prob = await fetchNextFedMeetingProb().catch(() => null);
  if (!prob) return null;

  const meeting = new Date(`${prob.meetingDate}T00:00:00`);
  const meetingLabel = meeting.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const color = prob.dominant.direction === "cut" ? "#10B981" : prob.dominant.direction === "hike" ? "#EF4444" : "rgba(255,255,255,0.7)";

  const rows: Array<[string, number]> = [
    ["Corte 50bps", prob.cuts50],
    ["Corte 25bps", prob.cuts25],
    ["Manter", prob.hold],
    ["Alta 25bps", prob.hikes25],
    ["Alta 50bps", prob.hikes50],
  ];

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-white/55" strokeWidth={1.8} />
          <h3 className="text-[12px] font-bold text-white/75">FedWatch</h3>
          <span className="text-[10px] font-mono tabular-nums text-white/35">{meetingLabel}</span>
        </div>
        <span className="text-[14px] font-bold" style={{ color }}>
          {prob.dominant.label} <span className="text-white/40 text-[11px] font-mono">{(prob.dominant.pct * 100).toFixed(0)}%</span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {rows.map(([label, pct]) => {
          const isDominant = pct === prob.dominant.pct;
          return (
            <div key={label} className={`rounded-lg px-3 py-2 ${isDominant ? "border border-white/15 bg-white/[0.03]" : "border border-white/[0.04]"}`}>
              <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">{label}</p>
              <p className={`text-[15px] font-bold font-mono tabular-nums mt-0.5 ${isDominant ? "text-white" : "text-white/55"}`}>
                {(pct * 100).toFixed(0)}<span className="text-[10px] text-white/30">%</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FedWatchSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="h-4 w-32 rounded bg-white/[0.05] animate-pulse" />
        <div className="h-4 w-24 rounded bg-white/[0.05] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-white/[0.04] px-3 py-2 h-[52px] bg-white/[0.01] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   UpcomingAgenda — eventos próximos + earnings (1 fetch externo)
   `events` vem do caminho crítico (page já tem), `earnings` é externo
   ────────────────────────────────────────────────────────────── */

export async function UpcomingAgendaAsync({
  events,
  today,
}: {
  events: EconomicEvent[];
  today: string;
}) {
  const earnings = await fetchUpcomingEarnings(7).catch(() => []);
  return <UpcomingAgenda events={events} earnings={earnings} today={today} />;
}

export function UpcomingAgendaSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] p-5">
      <div className="h-4 w-40 rounded bg-white/[0.05] animate-pulse mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 rounded bg-white/[0.015] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
