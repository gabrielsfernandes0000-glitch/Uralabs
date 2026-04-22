import { TrendingUp, TrendingDown } from "lucide-react";
import type { PriceSnapshot } from "@/lib/price-snapshot";
import { formatPrice } from "@/lib/price-snapshot";
import { TimestampAgo } from "@/components/elite/LiveBadge";

/**
 * MultiAssetTape — NQ / BTC / DXY / ETH em uma barra comparativa.
 * Server component. Rotação de risco visível numa linha.
 */
export function MultiAssetTape({ snapshots }: { snapshots: Record<string, PriceSnapshot | null> }) {
  const symbols = ["NQ", "BTC", "ETH", "DXY", "GOLD"];
  const valid = symbols.map((s) => ({ symbol: s, snap: snapshots[s] }));
  const hasAny = valid.some((v) => v.snap !== null);
  if (!hasAny) return null;

  const latest = valid.map((v) => v.snap?.asOf).filter(Boolean).sort().pop() ?? null;

  return (
    <div className="surface-panel rounded-xl px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="label-xs text-white/40">Rotação de Risco</span>
        <TimestampAgo iso={latest ?? undefined} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {valid.map(({ symbol, snap }) => (
          <AssetCell key={symbol} symbol={symbol} snap={snap} />
        ))}
      </div>
    </div>
  );
}

function AssetCell({ symbol, snap }: { symbol: string; snap: PriceSnapshot | null }) {
  if (!snap) {
    return (
      <div className="opacity-30">
        <p className="label-xs text-white/35">{symbol}</p>
        <p className="t-14 font-mono tabular-nums text-white/40 mt-1">—</p>
      </div>
    );
  }
  const up = (snap.changePct24h ?? 0) >= 0;
  const color = up ? "text-emerald-400" : "text-red-400";
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="label-xs text-white/55">{symbol}</p>
        {snap.delayed && <span className="text-[8px] font-mono text-amber-400/60">·D15</span>}
      </div>
      <p className="t-14 font-mono tabular-nums text-white font-semibold mt-1">{formatPrice(snap.price)}</p>
      {snap.changePct24h != null && (
        <span className={`inline-flex items-center gap-0.5 text-[10.5px] font-mono tabular-nums mt-0.5 ${color}`}>
          <Icon className="w-2.5 h-2.5" strokeWidth={2.2} />
          {snap.changePct24h >= 0 ? "+" : ""}{snap.changePct24h.toFixed(2)}%
        </span>
      )}
    </div>
  );
}
