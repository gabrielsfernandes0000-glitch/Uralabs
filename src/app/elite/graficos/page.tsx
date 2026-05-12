"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Maximize2, Minimize2, Plus, X, Loader2, Info, Zap, GitCompare, Square, Grid2x2, Rows2, Flame } from "lucide-react";
import { TradingViewChart, SMC_STUDIES } from "@/components/elite/TradingViewChart";
import { HeatmapWidget } from "@/components/elite/HeatmapWidget";

/* ────────────────────────────────────────────
   Instrumento — pode vir da nossa lista curada OU da API pública do TradingView.
   ──────────────────────────────────────────── */

type Instrument = {
  code: string;        // ID estável ("BTC", "BINANCE:DOGEUSDT", etc)
  label: string;       // descrição legível
  short: string;       // ticker curto
  tvSymbol: string;    // EXCHANGE:SYMBOL pro widget
  exchange?: string;
  type?: string;       // crypto, stock, futures, forex, index, economic...
};

/* Sugestões rápidas — aparecem quando o campo de busca está vazio.
   São só "starters", a busca real cobre TODO o universo TradingView. */
const QUICK_SUGGESTIONS: Array<{ group: string; items: Instrument[] }> = [
  {
    group: "Crypto populares",
    items: [
      { code: "BINANCE:BTCUSDT",   label: "Bitcoin",    short: "BTC",   tvSymbol: "BINANCE:BTCUSDT",   exchange: "BINANCE", type: "crypto" },
      { code: "BINANCE:ETHUSDT",   label: "Ethereum",   short: "ETH",   tvSymbol: "BINANCE:ETHUSDT",   exchange: "BINANCE", type: "crypto" },
      { code: "BINANCE:SOLUSDT",   label: "Solana",     short: "SOL",   tvSymbol: "BINANCE:SOLUSDT",   exchange: "BINANCE", type: "crypto" },
      { code: "BINANCE:BNBUSDT",   label: "BNB",        short: "BNB",   tvSymbol: "BINANCE:BNBUSDT",   exchange: "BINANCE", type: "crypto" },
      { code: "BINANCE:XRPUSDT",   label: "XRP",        short: "XRP",   tvSymbol: "BINANCE:XRPUSDT",   exchange: "BINANCE", type: "crypto" },
      { code: "BINANCE:DOGEUSDT",  label: "Dogecoin",   short: "DOGE",  tvSymbol: "BINANCE:DOGEUSDT",  exchange: "BINANCE", type: "crypto" },
    ],
  },
  {
    group: "Índices",
    items: [
      { code: "NASDAQ:NDX",        label: "Nasdaq 100",          short: "NDX",  tvSymbol: "NASDAQ:NDX",        exchange: "NASDAQ",  type: "index" },
      { code: "SP:SPX",            label: "S&P 500",             short: "SPX",  tvSymbol: "SP:SPX",            exchange: "SP",      type: "index" },
      { code: "DJ:DJI",            label: "Dow Jones",           short: "DJI",  tvSymbol: "DJ:DJI",            exchange: "DJ",      type: "index" },
      { code: "TVC:RUT",           label: "Russell 2000",        short: "RUT",  tvSymbol: "TVC:RUT",           exchange: "TVC",     type: "index" },
      { code: "BMFBOVESPA:IBOV",   label: "Ibovespa",            short: "IBOV", tvSymbol: "BMFBOVESPA:IBOV",   exchange: "BMFBOVESPA", type: "index" },
    ],
  },
  {
    group: "Forex & Commodities",
    items: [
      { code: "TVC:DXY",           label: "Dólar Index",     short: "DXY",    tvSymbol: "TVC:DXY",           exchange: "TVC",     type: "index" },
      { code: "FX:EURUSD",         label: "EUR/USD",         short: "EURUSD", tvSymbol: "FX:EURUSD",         exchange: "FX",      type: "forex" },
      { code: "FX_IDC:USDBRL",     label: "USD/BRL",         short: "USDBRL", tvSymbol: "FX_IDC:USDBRL",     exchange: "FX_IDC",  type: "forex" },
      { code: "OANDA:XAUUSD",      label: "Ouro",            short: "XAUUSD", tvSymbol: "OANDA:XAUUSD",      exchange: "OANDA",   type: "commodity" },
      { code: "TVC:USOIL",         label: "Petróleo WTI",    short: "USOIL",  tvSymbol: "TVC:USOIL",         exchange: "TVC",     type: "commodity" },
    ],
  },
];

const ALL_SUGGESTED: Instrument[] = QUICK_SUGGESTIONS.flatMap((g) => g.items);

const WATCHLIST_KEY = "elite_tv_watchlist_v3"; // v3: sem futuros CME (só pago)
const DEFAULT_WATCHLIST = [
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "NASDAQ:NDX",
  "TVC:DXY",
  "OANDA:XAUUSD",
];

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string") ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

function saveWatchlist(list: string[]) {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

const META_KEY = "elite_tv_watchlist_meta_v1"; // cache tvSymbol → {short, label}

function loadMeta(): Record<string, { short: string; label: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMeta(meta: Record<string, { short: string; label: string }>) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

function shortFromSymbol(tvSymbol: string): string {
  const after = tvSymbol.includes(":") ? tvSymbol.split(":")[1] : tvSymbol;
  return after.replace("USDT", "").replace("USD", "").replace(/1!$/, "") || after;
}

/* ────────────────────────────────────────────
   TradingView Symbol Search — endpoint público, sem auth.
   Retorna ações/futures/forex/crypto/indices de TODO o universo TV.
   ──────────────────────────────────────────── */

type TvSearchHit = {
  symbol: string;         // "BTCUSDT"
  description: string;    // "Bitcoin / TetherUS"
  exchange: string;       // "BINANCE"
  type: string;           // "crypto", "stock", "futures", "forex"...
  prefix?: string;        // às vezes "BINANCE"
};

const stripEm = (s: string) => (s || "").replace(/<\/?em>/g, "");

async function searchTvSymbols(q: string, signal: AbortSignal): Promise<Instrument[]> {
  const res = await fetch(`/api/tv-search?q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as TvSearchHit[] | { error: string };
  if (!Array.isArray(data)) return [];
  return data.slice(0, 50).map((hit) => {
    const symbol = stripEm(hit.symbol);
    const exchange = (hit.prefix || hit.exchange || "").toUpperCase();
    const tvSymbol = `${exchange}:${symbol}`;
    const label = stripEm(hit.description) || symbol;
    return {
      code: tvSymbol,
      label,
      short: symbol,
      tvSymbol,
      exchange,
      type: hit.type,
    };
  });
}

/* ────────────────────────────────────────────
   Picker — busca remota no TradingView (debounced 220ms).
   ──────────────────────────────────────────── */

function SymbolPicker({
  open,
  onClose,
  onPick,
  activeSymbol,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (ins: Instrument) => void;
  activeSymbol: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setResults([]);
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  useEffect(() => {
    const needle = q.trim();
    if (!needle) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      searchTvSymbols(needle, ctrl.signal)
        .then((hits) => setResults(hits))
        .catch(() => {
          /* abort ou rede — mantém resultados antigos */
        })
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  if (!open) return null;

  const showing = q.trim() ? "results" : "suggestions";

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-xl border border-white/[0.08] bg-[#0e0e10] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
          {loading ? (
            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-white/40" />
          )}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar qualquer ativo do TradingView (PEPE, DOGE, AAPL, Nasdaq…)"
            className="flex-1 bg-transparent outline-none text-[13.5px] text-white placeholder:text-white/25"
          />
          <button onClick={onClose} className="text-white/30 hover:text-white/70">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {showing === "suggestions" && (
            <>
              {QUICK_SUGGESTIONS.map((group) => (
                <div key={group.group} className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[9.5px] font-bold text-white/25">
                    {group.group}
                  </p>
                  {group.items.map((ins) => (
                    <PickerRow
                      key={ins.tvSymbol}
                      ins={ins}
                      active={ins.tvSymbol === activeSymbol}
                      onPick={() => {
                        onPick(ins);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              ))}
              <p className="px-4 py-3 border-t border-white/[0.04] text-[10.5px] text-white/35 leading-relaxed">
                Digite pra buscar qualquer ativo — Binance, Bybit, Coinbase, NYSE, Nasdaq, B3, Forex…
                a busca cobre <span className="text-white/60">todo o universo TradingView</span>.
              </p>
            </>
          )}

          {showing === "results" && (
            <>
              {results.length === 0 && !loading && (
                <p className="px-4 py-8 text-center text-[12px] text-white/35">
                  Nenhum símbolo encontrado pra <span className="font-mono text-white/60">{q}</span>.
                </p>
              )}
              {results.length > 0 &&
                results.map((ins) => (
                  <PickerRow
                    key={ins.tvSymbol}
                    ins={ins}
                    active={ins.tvSymbol === activeSymbol}
                    onPick={() => {
                      onPick(ins);
                      onClose();
                    }}
                  />
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PickerRow({
  ins,
  active,
  onPick,
}: {
  ins: Instrument;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/[0.04] transition-colors ${
        active ? "bg-white/[0.03]" : ""
      }`}
    >
      <span className="font-mono text-[11px] font-bold text-white/85 w-16 truncate shrink-0">{ins.short}</span>
      <span className="flex-1 text-[12.5px] text-white/70 truncate">{ins.label}</span>
      <span className="font-mono text-[10px] text-white/30 truncate max-w-[180px]">{ins.exchange}</span>
      {ins.type && (
        <span className="text-[9px] text-white/25 shrink-0">{ins.type}</span>
      )}
    </button>
  );
}

/* ────────────────────────────────────────────
   Data Badge — avisa sobre delay/real-time do ativo atual.
   Crypto spot (Binance, Bybit, Coinbase, Kraken) = real-time.
   Resto (ações, futuros, forex, índices) = delayed 15min no plano free TV.
   ──────────────────────────────────────────── */

const REALTIME_EXCHANGES = new Set([
  "BINANCE", "BYBIT", "COINBASE", "KRAKEN", "BITSTAMP", "OKX", "KUCOIN",
  "GATEIO", "BITFINEX", "HUOBI", "MEXC", "BITGET", "CRYPTO", "CRYPTOCOM",
]);

function isRealtime(exchange?: string, type?: string): boolean {
  if (!exchange) return false;
  if (REALTIME_EXCHANGES.has(exchange.toUpperCase())) return true;
  // Alguns type hints do TV pra crypto
  if (type === "crypto" && REALTIME_EXCHANGES.has(exchange.toUpperCase())) return true;
  return false;
}

function DataBadge({ exchange, type }: { exchange?: string; type?: string }) {
  const [open, setOpen] = useState(false);
  const live = isRealtime(exchange, type);

  return (
    <div className="absolute top-3 right-3 z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium backdrop-blur-sm transition-colors ${
          live
            ? "border-white/25 bg-white/[0.04] text-white hover:bg-white/[0.06]"
            : "border-white/[0.10] bg-white/[0.02] text-white/60 hover:text-white"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-[#22C55E] animate-pulse" : "bg-white/45"}`} />
        {live ? "Real-time" : "Delayed 15min"}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-[280px] rounded-lg border border-white/[0.08] bg-[#0e0e10]/95 backdrop-blur-sm p-3 shadow-2xl">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" strokeWidth={1.8} />
            <div className="space-y-2 flex-1">
              {live ? (
                <>
                  <p className="text-[11px] font-bold text-white">Dados em tempo real</p>
                  <p className="text-[10.5px] text-white/55 leading-relaxed">
                    Feed direto da exchange <span className="font-mono text-white/80">{exchange}</span>.
                    Latência típica de 100–300ms.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-white">Dados com delay de 15min</p>
                  <p className="text-[10.5px] text-white/55 leading-relaxed">
                    Pro plano gratuito do TradingView, ações, futuros, forex e índices têm delay.
                    Se você tem conta TradingView Pro+, abra <span className="font-mono text-white/80">tradingview.com</span> em outra aba e loga lá — a sessão passa pro gráfico daqui automaticamente (se seu browser aceitar cookies de terceiros).
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Página
   ──────────────────────────────────────────── */

type Layout = "single" | "2x1" | "2x2" | "heatmap-crypto" | "heatmap-stocks";

export default function GraficosPage() {
  const [active, setActive] = useState<Instrument>(ALL_SUGGESTED[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [meta, setMeta] = useState<Record<string, { short: string; label: string }>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState<Layout>("single");
  const [smcEnabled, setSmcEnabled] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareWith, setCompareWith] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWatchlist(loadWatchlist());
    setMeta(loadMeta());
  }, []);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  useEffect(() => {
    saveMeta(meta);
  }, [meta]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!rootRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      rootRef.current.requestFullscreen().catch(() => {});
    }
  };

  const setActiveAndCacheMeta = (ins: Instrument) => {
    setActive(ins);
    setMeta((prev) =>
      prev[ins.tvSymbol] ? prev : { ...prev, [ins.tvSymbol]: { short: ins.short, label: ins.label } },
    );
  };

  const inWatchlist = watchlist.includes(active.tvSymbol);
  const addToWatchlist = () => {
    if (!watchlist.includes(active.tvSymbol)) {
      setWatchlist([...watchlist, active.tvSymbol]);
      setMeta((prev) => ({ ...prev, [active.tvSymbol]: { short: active.short, label: active.label } }));
    }
  };
  const removeFromWatchlist = (tvSymbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== tvSymbol));
  };

  const resolveMeta = (tvSymbol: string): { short: string; label: string } => {
    if (meta[tvSymbol]) return meta[tvSymbol];
    const suggested = ALL_SUGGESTED.find((s) => s.tvSymbol === tvSymbol);
    if (suggested) return { short: suggested.short, label: suggested.label };
    return { short: shortFromSymbol(tvSymbol), label: tvSymbol };
  };

  const pickFromWatchlist = (tvSymbol: string) => {
    const m = resolveMeta(tvSymbol);
    const exchange = tvSymbol.includes(":") ? tvSymbol.split(":")[0] : undefined;
    const suggested = ALL_SUGGESTED.find((s) => s.tvSymbol === tvSymbol);
    setActive({
      code: tvSymbol,
      label: m.label,
      short: m.short,
      tvSymbol,
      exchange,
      type: suggested?.type,
    });
  };

  const watchlistItems = useMemo(
    () => watchlist.map((s) => ({ tvSymbol: s, ...resolveMeta(s) })),
    [watchlist, meta],
  );

  return (
    <div
      ref={rootRef}
      className="-mx-5 -my-6 lg:-mx-10 lg:-my-8 h-[100vh] flex flex-col bg-[#0a0a0c] overflow-hidden"
    >
      <div className="shrink-0 h-[44px] flex items-center gap-2 px-3 border-b border-white/[0.05] bg-[#0b0b0d] overflow-x-auto">
        <button
          onClick={() => setPickerOpen(true)}
          title="Trocar símbolo (clique ou busque)"
          className="group shrink-0 flex items-center gap-2 pl-2.5 pr-2 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
        >
          <span className="font-mono text-[11.5px] font-bold text-white tracking-wide">{active.short}</span>
          <Search className="w-3 h-3 text-white/35 group-hover:text-white/70" />
        </button>

        <div className="w-px h-4 bg-white/[0.06]" />

        <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto">
          {watchlistItems
            .filter((w) => w.tvSymbol !== active.tvSymbol)
            .map((w) => (
              <div
                key={w.tvSymbol}
                className="group shrink-0 flex items-center rounded text-[11px] font-bold font-mono text-white/45 hover:text-white transition-colors cursor-pointer"
                onClick={() => pickFromWatchlist(w.tvSymbol)}
                title={w.label}
              >
                <span className="px-2 py-1 hover:bg-white/[0.04] rounded-l">{w.short}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(w.tvSymbol);
                  }}
                  title="Remover"
                  className="opacity-0 group-hover:opacity-100 h-full px-1 hover:text-red-400 transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          {!inWatchlist && (
            <button
              onClick={addToWatchlist}
              title="Fixar símbolo atual"
              className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold text-white/30 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Fixar {active.short}</span>
            </button>
          )}
        </div>

        <div className="w-px h-4 bg-white/[0.06]" />

        {/* Layout selector */}
        <div className="flex items-center gap-0.5" title="Layout">
          {[
            { v: "single" as Layout,         Icon: Square,  label: "1 chart" },
            { v: "2x1" as Layout,            Icon: Rows2,   label: "2 charts lado a lado" },
            { v: "2x2" as Layout,            Icon: Grid2x2, label: "4 charts" },
            { v: "heatmap-crypto" as Layout, Icon: Flame,   label: "Heatmap crypto" },
          ].map(({ v, Icon, label }) => (
            <button
              key={v}
              onClick={() => setLayout(v)}
              title={label}
              className={`p-1.5 rounded-md transition-colors ${
                layout === v ? "bg-white/[0.08] text-white" : "text-white/35 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-white/[0.06]" />

        {/* SMC preset */}
        <button
          onClick={() => setSmcEnabled((v) => !v)}
          title="Ativa preset SMC (EMA + VWAP + Volume)"
          className={`shrink-0 flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] font-medium transition-colors ${
            smcEnabled
              ? "bg-white/[0.06] text-white border border-white/25"
              : "text-white/45 hover:text-white hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <Zap className="w-3 h-3" strokeWidth={2} />
          SMC
        </button>

        {/* Compare */}
        <button
          onClick={() => setCompareOpen((v) => !v)}
          title="Sobrepor segundo ativo"
          className={`shrink-0 flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] font-medium transition-colors ${
            compareWith
              ? "bg-white/[0.06] text-white border border-white/25"
              : "text-white/45 hover:text-white hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <GitCompare className="w-3 h-3" strokeWidth={2} />
          {compareWith ? `+ ${resolveMeta(compareWith).short}` : "Comparar"}
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair do fullscreen" : "Fullscreen"}
          className="shrink-0 p-1.5 rounded-md text-white/35 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Compare picker dropdown */}
      {compareOpen && (
        <div className="shrink-0 border-b border-white/[0.05] bg-[#0b0b0d] px-3 py-2 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-white/35">Sobrepor com</span>
          {watchlistItems.filter((w) => w.tvSymbol !== active.tvSymbol).map((w) => (
            <button
              key={w.tvSymbol}
              onClick={() => { setCompareWith(w.tvSymbol); setCompareOpen(false); }}
              className="px-2 py-1 rounded text-[10.5px] font-bold font-mono text-white/55 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"
            >
              {w.short}
            </button>
          ))}
          {compareWith && (
            <button
              onClick={() => { setCompareWith(null); setCompareOpen(false); }}
              className="ml-auto px-2 py-1 rounded text-[10px] text-red-300 hover:bg-red-500/[0.08]"
            >
              Remover sobreposição
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 relative">
        {layout === "single" && (
          <>
            <TradingViewChart
              symbol={active.tvSymbol}
              height="100%"
              allowSymbolChange={false}
              studies={smcEnabled ? SMC_STUDIES : []}
              compareSymbols={compareWith ? [compareWith] : []}
              bare
            />
            <DataBadge exchange={active.exchange} type={active.type} />
          </>
        )}
        {layout === "2x1" && (
          <div className="grid grid-cols-2 gap-px h-full bg-white/[0.04]">
            {[active.tvSymbol, watchlistItems[0]?.tvSymbol ?? active.tvSymbol].slice(0, 2).map((s, i) => (
              <TradingViewChart
                key={`${i}-${s}`}
                symbol={s}
                height="100%"
                allowSymbolChange={false}
                hideTopToolbar
                studies={smcEnabled ? SMC_STUDIES : []}
                bare
              />
            ))}
          </div>
        )}
        {layout === "2x2" && (
          <div className="grid grid-cols-2 grid-rows-2 gap-px h-full bg-white/[0.04]">
            {(() => {
              const symbols = [active.tvSymbol];
              for (const w of watchlistItems) {
                if (symbols.length >= 4) break;
                if (w.tvSymbol !== active.tvSymbol) symbols.push(w.tvSymbol);
              }
              while (symbols.length < 4) symbols.push(active.tvSymbol);
              return symbols.map((s, i) => (
                <TradingViewChart
                  key={`${i}-${s}`}
                  symbol={s}
                  height="100%"
                  allowSymbolChange={false}
                  hideTopToolbar
                  studies={smcEnabled ? SMC_STUDIES : []}
                  bare
                />
              ));
            })()}
          </div>
        )}
        {(layout === "heatmap-crypto" || layout === "heatmap-stocks") && (
          <div className="h-full">
            <HeatmapWidget kind={layout === "heatmap-crypto" ? "crypto" : "stocks-us"} height={10000} />
          </div>
        )}
      </div>

      <SymbolPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={setActiveAndCacheMeta}
        activeSymbol={active.tvSymbol}
      />
    </div>
  );
}
