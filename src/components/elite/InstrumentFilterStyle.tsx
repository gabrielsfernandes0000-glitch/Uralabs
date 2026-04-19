"use client";

import { useWatchlist } from "./InstrumentWatchlist";
import { useWatchlistFilter } from "./WatchlistFilter";

/**
 * Injeta <style> que oculta `[data-filterable-event]` cujos `data-instruments`
 * (space-separated) não batem com a watchlist, quando o filtro tá ativo.
 *
 * Uso: renderize uma vez dentro do container de eventos. Cada item deve ter:
 *   data-filterable-event data-instruments="NQ ES DXY"
 *
 * Vantagem: servidor renderiza normal, cliente só esconde via CSS. Zero re-render.
 */
export function InstrumentFilterStyle() {
  const [list] = useWatchlist();
  const [on] = useWatchlistFilter();
  if (!on || list.length === 0) return null;
  // ~= em CSS matches space-separated tokens. "NQ ES DXY" contém "NQ".
  const showSelectors = list.map((c) => `[data-instruments~="${c}"]`).join(", ");
  return (
    <style>{`[data-filterable-event]:not(${showSelectors}) { display: none !important; }`}</style>
  );
}
