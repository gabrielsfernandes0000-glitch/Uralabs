"use client";

import { useEffect, useState } from "react";
import { WatchlistManager } from "./WatchlistManager";
import { SavedNewsPanel } from "./SavedNewsPanel";
import { NoticiasToolbar } from "./NoticiasToolbar";

/**
 * Sidebar sticky desktop. Mobile: colapsa em accordion ("Ferramentas").
 */
export function NoticiasSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Keyboard shortcuts: W → foca busca da watchlist, B → scroll pra saved
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;

      if (e.key.toLowerCase() === "w") {
        const el = document.querySelector<HTMLInputElement>('[data-watchlist-input]');
        el?.focus();
        e.preventDefault();
      }
      if (e.key.toLowerCase() === "b") {
        const el = document.querySelector<HTMLElement>('[data-saved-panel]');
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Desktop sidebar — sticky coluna direita */}
      <aside className="hidden lg:block sticky top-4 space-y-3 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">
        <NoticiasToolbar />
        <WatchlistManager />
        <div data-saved-panel>
          <SavedNewsPanel />
        </div>
      </aside>

      {/* Mobile — accordion abre no bottom */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[12px] font-semibold text-white/80"
        >
          <span>Ferramentas</span>
          <span className="text-white/40">{mobileOpen ? "–" : "+"}</span>
        </button>
        {mobileOpen && (
          <div className="mt-3 space-y-3">
            <NoticiasToolbar />
            <WatchlistManager />
            <SavedNewsPanel />
          </div>
        )}
      </div>
    </>
  );
}
