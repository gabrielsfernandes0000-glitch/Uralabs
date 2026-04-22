"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useWatchlist, WATCHLIST_PRESETS } from "@/hooks/useWatchlist";

/**
 * Watchlist sidebar — card único com seções alinhadas: header + chips ativos +
 * input de novo ticker + sugeridos. Coluna estreita (~280px), tudo em 1 col.
 * URA tokens: surface-card radius 12px, max 3 cores (só branco + white/alpha).
 */
export function WatchlistManager({ compact = false }: { compact?: boolean }) {
  const { items, ready, toggle, add, remove } = useWatchlist();
  const [input, setInput] = useState("");
  const [showAll, setShowAll] = useState(false);

  if (!ready) return null;

  const handleAdd = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    add(sym);
    setInput("");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {items.length === 0 ? (
          <span className="text-[10.5px] text-white/35">Sem watchlist</span>
        ) : (
          items.map((s) => (
            <span key={s} className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-white/75">
              {s}
            </span>
          ))
        )}
      </div>
    );
  }

  const visiblePresets = showAll ? WATCHLIST_PRESETS : WATCHLIST_PRESETS.slice(0, 9);

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c0c0e] overflow-hidden">
      {/* Header do card */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.04]">
        <h3 className="text-[12px] font-bold text-white/85">Watchlist</h3>
        <span className="text-[10px] font-mono tabular-nums text-white/35">
          {items.length} {items.length === 1 ? "ticker" : "tickers"}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Seção 1: Tickers ativos (só mostra se houver) */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {items.map((s) => (
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
            ))}
          </div>
        )}

        {/* Seção 2: Adicionar ticker */}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            data-watchlist-input
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Adicionar ticker"
            className="flex-1 min-w-0 px-2.5 h-8 rounded-md bg-white/[0.02] border border-white/[0.08] text-[12px] font-mono text-white placeholder:text-white/30 focus:border-white/25 focus:bg-white/[0.04] focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!input.trim()}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-white/[0.08] text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            aria-label="Adicionar"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Seção 3: Sugeridos (divider acima marca mudança de contexto) */}
        <div className="pt-3 border-t border-white/[0.04]">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <p className="text-[10.5px] font-semibold text-white/55">Sugeridos</p>
            {WATCHLIST_PRESETS.length > 9 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-[10px] text-white/35 hover:text-white/75 transition-colors"
              >
                {showAll ? "mostrar menos" : `+${WATCHLIST_PRESETS.length - 9} mais`}
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {visiblePresets.map((p) => {
              const active = items.includes(p.symbol);
              return (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => toggle(p.symbol)}
                  className={`h-6 px-1.5 rounded-md border text-[10.5px] font-mono transition-colors ${
                    active
                      ? "border-white/25 bg-white/[0.06] text-white font-bold"
                      : "border-white/[0.06] text-white/50 hover:border-white/[0.18] hover:text-white/85 hover:bg-white/[0.02]"
                  }`}
                  title={p.label}
                >
                  {p.symbol}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
