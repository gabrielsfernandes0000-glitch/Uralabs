"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, MoreHorizontal, Plus, X } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BeginnerModeToggle } from "./BeginnerModeToggle";
import { NoticiasToolsDrawer } from "./NoticiasToolsDrawer";

export const NOTICIAS_FILTER_KEY = "ura:noticias:watchlist-only:v1";
export const NOTICIAS_FILTER_EVENT = "ura:noticias:watchlist-filter:change";
const FILTER_KEY = NOTICIAS_FILTER_KEY;

// Match permissivo: BTC na watchlist libera TODA a categoria crypto, e por aí
// vai. Antes só passava news com o ticker exato no headline — 47 cripto viravam
// 1 quando a watchlist era só "BTC".
const TICKER_TO_CATEGORY: Record<string, "crypto" | "forex" | "stocks"> = {
  BTC: "crypto", ETH: "crypto", SOL: "crypto",
  DXY: "forex", EURUSD: "forex", GBPUSD: "forex", USDJPY: "forex", USDBRL: "forex",
  NQ: "stocks", ES: "stocks", AAPL: "stocks", NVDA: "stocks",
  TSLA: "stocks", META: "stocks", MSFT: "stocks", AMZN: "stocks",
};

/**
 * Strip horizontal no topo da /noticias. Substitui a sidebar vertical.
 * Contém: toggles (só watchlist + modo iniciante) · chips ativos + add ticker
 * · botão "Mais" que abre drawer com Sugeridos + Salvos.
 *
 * Filter CSS (só-watchlist) é injetado aqui — mesma lógica da antiga Toolbar.
 */
export function NoticiasStripBar() {
  const { items: watchlist, add, remove, ready } = useWatchlist();
  const { items: saved } = useBookmarks();
  const [input, setInput] = useState("");
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<{ shown: number; total: number } | null>(null);

  useEffect(() => {
    try {
      setOnlyWatchlist(localStorage.getItem(FILTER_KEY) === "1");
    } catch {}
  }, []);

  const toggleFilter = () => {
    const next = !onlyWatchlist;
    setOnlyWatchlist(next);
    try { localStorage.setItem(FILTER_KEY, next ? "1" : "0"); } catch {}
    // Broadcast pra FeedV2 (que precisa pular o slice de 12 inicial quando
    // filtro tá ativo — senão "Ver mais 18" vira "ver mais 3 visíveis").
    try {
      window.dispatchEvent(new CustomEvent(NOTICIAS_FILTER_EVENT, { detail: { enabled: next } }));
    } catch {}
  };

  // Injeta CSS pra esconder cards fora da watchlist quando ativo
  useEffect(() => {
    const styleId = "watchlist-filter-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    if (!onlyWatchlist || watchlist.length === 0) {
      style.textContent = "";
      setVisibleCount(null);
      return;
    }
    // Tickers libera categoria inteira (BTC → crypto, NQ → stocks, etc).
    const watchedCats = new Set<string>();
    for (const s of watchlist) {
      const cat = TICKER_TO_CATEGORY[s];
      if (cat) watchedCats.add(cat);
    }
    const eventMatches = watchlist.map((s) => `[data-instruments*="${s}"]`).join(", ");
    const newsTickerSel = watchlist.map((s) => `[data-headline-upper*="${s}"]`);
    const newsCatSel = [...watchedCats].map((c) => `[data-news-category="${c}"]`);
    const newsMatches = [...newsTickerSel, ...newsCatSel].join(", ");
    style.textContent = `
      [data-filterable-event]:not(${eventMatches}) { display: none !important; }
      [data-filterable-news]:not(${newsMatches}) { display: none !important; }
    `;

    // Conta visíveis depois do paint pra mostrar "X/Y" no botão
    const id = requestAnimationFrame(() => {
      const all = document.querySelectorAll<HTMLElement>("[data-filterable-news]");
      let shown = 0;
      all.forEach((el) => {
        const head = (el.dataset.headlineUpper ?? "").toUpperCase();
        const cat = el.dataset.newsCategory ?? "";
        if (watchedCats.has(cat) || watchlist.some((s) => head.includes(s))) shown++;
      });
      setVisibleCount({ shown, total: all.length });
    });
    return () => {
      cancelAnimationFrame(id);
      if (style) style.textContent = "";
    };
  }, [onlyWatchlist, watchlist]);

  const handleAdd = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    add(sym);
    setInput("");
  };

  if (!ready) return null;

  return (
    <>
      <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] px-3 py-2 flex items-center gap-2 flex-wrap lg:flex-nowrap">
        {/* Toggles + Mais (esquerda, agrupados) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleFilter}
            disabled={watchlist.length === 0}
            title={watchlist.length === 0 ? "Adicione ativos à watchlist primeiro" : onlyWatchlist ? "Mostrar tudo" : "Filtrar por watchlist"}
            className={`interactive-tap inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md text-[11px] font-semibold transition-colors border ${
              onlyWatchlist
                ? "border-white/25 text-white bg-white/[0.06]"
                : "border-white/[0.06] text-white/55 hover:border-white/[0.18] hover:text-white/85 hover:bg-white/[0.02]"
            } ${watchlist.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {onlyWatchlist ? <Eye className="w-3 h-3" strokeWidth={2} /> : <EyeOff className="w-3 h-3" strokeWidth={2} />}
            <span>Só watchlist</span>
            {onlyWatchlist && visibleCount && visibleCount.total > 0 && (
              <span className="text-[9.5px] font-mono tabular-nums text-white/55">
                {visibleCount.shown}/{visibleCount.total}
              </span>
            )}
          </button>
          <BeginnerModeToggle />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            title="Sugeridos + salvos"
            className="interactive-tap inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11px] font-semibold transition-colors border border-white/[0.06] text-white/55 hover:border-white/[0.18] hover:text-white/85 hover:bg-white/[0.02]"
          >
            <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Mais</span>
            {saved.length > 0 && (
              <span className="text-[9.5px] font-mono tabular-nums text-white/45">{saved.length}</span>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-5 bg-white/[0.06] shrink-0" />

        {/* Chips ativos + add ticker (meio — flexível, ocupa o resto) */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          {watchlist.length === 0 ? (
            <span className="text-[11px] text-white/35">Nenhum ticker na watchlist.</span>
          ) : (
            watchlist.map((s) => (
              <span
                key={s}
                className="group inline-flex items-center gap-1 pl-2 pr-1 h-6 rounded-md bg-white/[0.06] border border-white/[0.12] text-[11px] font-mono font-semibold text-white/90"
              >
                {s}
                <button
                  type="button"
                  onClick={() => remove(s)}
                  className="p-0.5 rounded hover:bg-white/[0.08] text-white/35 hover:text-white/85 transition-colors"
                  aria-label={`Remover ${s}`}
                >
                  <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                </button>
              </span>
            ))
          )}

          {/* Input compacto inline */}
          <div className="inline-flex items-stretch shrink-0">
            <input
              type="text"
              value={input}
              data-watchlist-input
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="+ ticker"
              className="w-24 px-2 h-7 rounded-l-md bg-white/[0.02] border border-white/[0.08] border-r-0 text-[11px] font-mono text-white placeholder:text-white/30 focus:border-white/25 focus:bg-white/[0.04] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!input.trim()}
              className="w-7 h-7 flex items-center justify-center rounded-r-md border border-white/[0.08] text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Adicionar"
            >
              <Plus className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>

      </div>

      <NoticiasToolsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
