import { fetchPriceSnapshots, formatPrice, type PriceSnapshot } from "@/lib/price-snapshot";

/**
 * Substituto server-rendered do TickerTape (widget TradingView).
 *
 * Por quê: o widget TV é script externo que demora 1-2s pra montar
 * depois da hidratação — sempre "carregava depois" do resto da página.
 * Esse componente é server component, faz fetch dos preços junto com
 * o resto da page e renderiza HTML estático com animação CSS de
 * marquee. Zero JS no cliente.
 *
 * Trade-off: preços são cached (binance 60s, twelvedata 120s, yahoo
 * 300s) em vez de tick-by-tick. Pro contexto de "ver onde mercado
 * tá" é equivalente; pra scalp use o /elite/graficos com TradingView
 * full chart.
 */

export type PriceTickerSymbol = {
  /** Símbolo curto pro fetchPriceSnapshot (ex: "BTC", "NQ", "DXY"). */
  symbol: string;
  /** Label que aparece no ticker (ex: "BTC", "Nasdaq"). */
  label: string;
};

const DEFAULT_TICKERS: PriceTickerSymbol[] = [
  { symbol: "BTC",  label: "BTC" },
  { symbol: "ETH",  label: "ETH" },
  { symbol: "SOL",  label: "SOL" },
  { symbol: "BNB",  label: "BNB" },
  { symbol: "XRP",  label: "XRP" },
  { symbol: "GOLD", label: "Ouro" },
];

export async function PriceTickerTape({ tickers = DEFAULT_TICKERS }: { tickers?: PriceTickerSymbol[] }) {
  const snaps = await fetchPriceSnapshots(tickers.map((t) => t.symbol));
  const items = tickers.map((t) => ({ ...t, snap: snaps[t.symbol.toUpperCase()] ?? null }));
  // Só renderiza se tiver pelo menos 1 ticker com dado — empty state
  // evita marquee piscando vazio quando todas as APIs falharam.
  if (!items.some((i) => i.snap)) return null;

  // Duplica items pra animação seamless (loop sem "salto")
  const loopItems = [...items, ...items];

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/[0.05] bg-[#0a0a0c]"
      style={{ height: 46 }}
    >
      <div className="absolute inset-0 flex items-center">
        <div className="ticker-marquee flex items-center whitespace-nowrap">
          {loopItems.map((item, i) => (
            <TickerCell key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TickerCell({
  item,
}: {
  item: PriceTickerSymbol & { snap: PriceSnapshot | null };
}) {
  if (!item.snap) {
    return (
      <div className="px-5 flex items-center gap-2 text-[11.5px] text-white/30 shrink-0">
        <span className="font-bold tracking-wider uppercase">{item.label}</span>
        <span className="font-mono">—</span>
      </div>
    );
  }
  const up = (item.snap.changePct24h ?? 0) >= 0;
  const color = up ? "text-emerald-400" : "text-red-400";
  return (
    <div className="px-5 flex items-center gap-2 text-[12px] shrink-0">
      <span className="font-bold tracking-wider uppercase text-white/85">{item.label}</span>
      <span className="font-mono tabular-nums text-white font-semibold">{formatPrice(item.snap.price)}</span>
      {item.snap.changePct24h !== null && (
        <span className={`font-mono tabular-nums ${color}`}>
          {item.snap.changePct24h >= 0 ? "+" : ""}
          {item.snap.changePct24h.toFixed(2)}%
        </span>
      )}
      {item.snap.delayed && (
        <span className="text-[8.5px] font-mono text-amber-400/70 px-1 py-[1px] rounded bg-amber-500/[0.06] border border-amber-500/[0.12]">D15</span>
      )}
      <span className="text-white/15 ml-1">·</span>
    </div>
  );
}
