"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { BeginnerModeToggle } from "./BeginnerModeToggle";

const FILTER_KEY = "ura:noticias:watchlist-only:v1";

/**
 * Toolbar superior da /noticias — toggle "só watchlist" + modo iniciante.
 * Injeta CSS que esconde cards sem match.
 */
export function NoticiasToolbar() {
  const { items: watchlist } = useWatchlist();
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_KEY);
      setOn(raw === "1");
    } catch {}
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try { localStorage.setItem(FILTER_KEY, next ? "1" : "0"); } catch {}
  };

  useEffect(() => {
    const styleId = "watchlist-filter-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    if (!on || watchlist.length === 0) {
      style.textContent = "";
      return;
    }
    const eventMatches = watchlist.map((s) => `[data-instruments*="${s}"]`).join(", ");
    const newsMatches = watchlist.map((s) => `[data-headline-upper*="${s}"]`).join(", ");
    style.textContent = `
      [data-filterable-event]:not(${eventMatches}) { display: none !important; }
      [data-filterable-news]:not(${newsMatches}) { display: none !important; }
    `;
    return () => {
      if (style) style.textContent = "";
    };
  }, [on, watchlist]);

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={watchlist.length === 0}
        title={watchlist.length === 0 ? "Adicione ativos à watchlist primeiro" : on ? "Mostrar tudo" : "Filtrar por watchlist"}
        className={`interactive-tap inline-flex items-center justify-center gap-1.5 h-8 px-2 rounded-md text-[11px] font-semibold transition-colors border ${
          on
            ? "border-white/25 text-white bg-white/[0.06]"
            : "border-white/[0.06] text-white/55 hover:border-white/[0.18] hover:text-white/85 hover:bg-white/[0.02]"
        } ${watchlist.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {on ? <Eye className="w-3 h-3" strokeWidth={2} /> : <EyeOff className="w-3 h-3" strokeWidth={2} />}
        <span className="truncate">Só watchlist</span>
      </button>

      <BeginnerModeToggle />
    </div>
  );
}
