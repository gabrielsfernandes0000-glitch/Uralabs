"use client";

import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { WatchlistPicker, useWatchlist } from "./InstrumentWatchlist";

/* ────────────────────────────────────────────
   Watchlist Filter — toggle "só meus ativos" + picker.
   Estado persistido em localStorage (key: "elite_watchlist_filter_v1").
   Emite event "watchlist-filter:changed" pra componentes consumidores.
   ──────────────────────────────────────────── */

const FILTER_KEY = "elite_watchlist_filter_v1";

export function getWatchlistFilterOn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FILTER_KEY) === "1";
}

function setWatchlistFilterOn(on: boolean) {
  try {
    if (on) localStorage.setItem(FILTER_KEY, "1");
    else localStorage.removeItem(FILTER_KEY);
    window.dispatchEvent(new CustomEvent("watchlist-filter:changed"));
  } catch {
    /* ignore */
  }
}

export function useWatchlistFilter(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(getWatchlistFilterOn());
    const onChange = () => setOn(getWatchlistFilterOn());
    window.addEventListener("watchlist-filter:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("watchlist-filter:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = (next: boolean) => {
    setOn(next);
    setWatchlistFilterOn(next);
  };
  return [on, update];
}

export function WatchlistFilterControls() {
  const [on, setOn] = useWatchlistFilter();
  const [list] = useWatchlist();
  const hasAny = list.length > 0;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setOn(!on && hasAny)}
        aria-pressed={on}
        disabled={!hasAny}
        className={`interactive-tap rounded-md border px-2 py-1 text-[10.5px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
          on
            ? "border-emerald-400/40 text-emerald-400"
            : hasAny
              ? "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.12]"
              : "border-white/[0.04] text-white/25 cursor-not-allowed"
        }`}
        title={hasAny ? "Mostrar só eventos que afetam meus ativos" : "Adicione ativos primeiro"}
      >
        <Filter className="w-2.5 h-2.5" strokeWidth={2} />
        Só meus
      </button>
      <WatchlistPicker />
    </div>
  );
}
