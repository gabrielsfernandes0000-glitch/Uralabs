"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useWatchlist } from "./InstrumentWatchlist";

/**
 * Filtro auto-ligado pra Agenda do dashboard.
 *
 * Diferente do InstrumentFilterStyle global: aqui NÃO depende do toggle
 * "Só meus". Se o user tem watchlist, a agenda filtra automaticamente. Isso
 * evita a fricção de ter que ir em Notícias pra ligar o filtro.
 *
 * Escopado ao container `.dashboard-agenda-scope` pra não afetar outras
 * páginas que usam `data-filterable-event`.
 */
export function DashboardAgendaFilter() {
  const [list] = useWatchlist();
  const [showAll, setShowAll] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);

  // Conta quantos eventos estão escondidos pra mostrar no badge
  useEffect(() => {
    if (list.length === 0 || showAll) {
      setHiddenCount(0);
      return;
    }
    const scope = document.querySelector(".dashboard-agenda-scope");
    if (!scope) return;
    const items = scope.querySelectorAll("[data-filterable-event]");
    const sel = list.map((c) => `[data-instruments~="${c}"]`).join(", ");
    let hidden = 0;
    items.forEach((el) => {
      if (!(el as HTMLElement).matches(sel)) hidden++;
    });
    setHiddenCount(hidden);
  }, [list, showAll]);

  if (list.length === 0) return null;

  const selectors = list.map((c) => `[data-instruments~="${c}"]`).join(", ");

  return (
    <>
      {!showAll && (
        <style>{`.dashboard-agenda-scope [data-filterable-event]:not(${selectors}) { display: none !important; }`}</style>
      )}
      <div className="flex items-center justify-between gap-2 mb-3 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <span className="text-[10.5px] text-white/45">
          {showAll
            ? `Mostrando todos · ${list.length} ${list.length === 1 ? "ativo" : "ativos"} na sua watchlist`
            : hiddenCount > 0
              ? `Filtrado pela sua watchlist · ${hiddenCount} ${hiddenCount === 1 ? "escondido" : "escondidos"}`
              : `Filtrado pela sua watchlist`}
        </span>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="interactive-tap text-[10.5px] text-white/55 hover:text-white flex items-center gap-1 transition-colors"
        >
          {showAll ? (
            <>
              <EyeOff className="w-2.5 h-2.5" strokeWidth={2} />
              Filtrar
            </>
          ) : (
            <>
              <Eye className="w-2.5 h-2.5" strokeWidth={2} />
              Ver todos
            </>
          )}
        </button>
      </div>
    </>
  );
}
