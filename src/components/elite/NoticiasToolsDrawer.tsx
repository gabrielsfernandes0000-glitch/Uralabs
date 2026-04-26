"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useWatchlist, WATCHLIST_PRESETS } from "@/hooks/useWatchlist";
import { SavedNewsPanel } from "./SavedNewsPanel";

/**
 * Drawer lateral (desktop) / bottom sheet (mobile) com tickers sugeridos +
 * salvos. Aberto pela strip via botão "Mais". Fecha em ESC ou clique no overlay.
 */
export function NoticiasToolsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items: watchlist, toggle } = useWatchlist();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const visiblePresets = showAll ? WATCHLIST_PRESETS : WATCHLIST_PRESETS.slice(0, 9);

  return (
    <div
      className="modal-in-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Popup centralizado */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-in-panel relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-[13px] font-bold text-white/90">Ferramentas</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="interactive-tap w-8 h-8 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Sugeridos */}
          <section>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3 className="text-[11px] font-semibold text-white/65 uppercase tracking-wider">Sugeridos</h3>
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
                const active = watchlist.includes(p.symbol);
                return (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => toggle(p.symbol)}
                    className={`h-8 px-1.5 rounded-md border text-[11px] font-mono transition-colors ${
                      active
                        ? "border-white/25 bg-white/[0.06] text-white font-bold"
                        : "border-white/[0.06] text-white/55 hover:border-white/[0.18] hover:text-white/85 hover:bg-white/[0.02]"
                    }`}
                    title={p.label}
                  >
                    {p.symbol}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Salvos */}
          <section data-saved-panel>
            <SavedNewsPanel />
          </section>
        </div>
      </div>
    </div>
  );
}
