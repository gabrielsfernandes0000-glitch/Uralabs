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

  // Renderizado dentro do container "Pulse" da página /noticias — sem
  // background/border próprios. As cells dividem com left-border discreta
  // pra dar ritmo de tape sem virar tabela.
  // Última cell (GOLD) tem espaço extra reservado pra timestamp não colidir
  // com o valor numérico.
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-white/[0.04]">
      {valid.map(({ symbol, snap }, i) => (
        <AssetCell
          key={symbol}
          symbol={symbol}
          snap={snap}
          rightSlot={i === valid.length - 1 ? <TimestampAgo iso={latest ?? undefined} /> : null}
        />
      ))}
    </div>
  );
}

function AssetCell({ symbol, snap, rightSlot }: { symbol: string; snap: PriceSnapshot | null; rightSlot?: React.ReactNode }) {
  if (!snap) {
    return (
      <div className="px-4 py-3 opacity-40 relative">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/35">{symbol}</p>
          {/* Timestamp escondido em mobile/tablet pra não bagunçar o grid 2-col estreito */}
          {rightSlot && <span className="shrink-0 hidden lg:block">{rightSlot}</span>}
        </div>
        <p className="text-[14px] font-mono tabular-nums text-white/40 mt-1">—</p>
        <p className="text-[10px] text-white/20 mt-1">sem dado</p>
      </div>
    );
  }
  const up = (snap.changePct24h ?? 0) >= 0;
  const color = up ? "text-emerald-400" : "text-red-400";
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <div className="px-4 py-3 relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/55">{symbol}</p>
          {snap.delayed && <span className="text-[8.5px] font-mono text-amber-400/65 leading-none px-1 py-[1px] rounded bg-amber-500/[0.06] border border-amber-500/[0.12]">D15</span>}
        </div>
        {/* Timestamp escondido em mobile/tablet pra não colidir com o "D15" badge da cell GOLD */}
        {rightSlot && <span className="shrink-0 hidden lg:block">{rightSlot}</span>}
      </div>
      <p className="text-[15px] font-mono tabular-nums text-white font-semibold mt-1.5 leading-none">{formatPrice(snap.price)}</p>
      {snap.changePct24h != null && (
        <span className={`inline-flex items-center gap-0.5 text-[10.5px] font-mono tabular-nums mt-1.5 ${color}`}>
          <Icon className="w-2.5 h-2.5" strokeWidth={2.2} />
          {snap.changePct24h >= 0 ? "+" : ""}{snap.changePct24h.toFixed(2)}%
        </span>
      )}
    </div>
  );
}
