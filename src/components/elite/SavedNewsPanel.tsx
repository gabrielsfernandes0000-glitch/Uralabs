"use client";

import { BookmarkCheck, Trash2, ExternalLink } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { formatRelative } from "@/lib/market-news";

/**
 * Lista de notícias salvas — fica no topo da /noticias quando user tem bookmarks.
 * Colapsável. Máx 5 visíveis, resto via "Ver todos".
 */
export function SavedNewsPanel() {
  const { items, ready, remove } = useBookmarks();
  if (!ready || items.length === 0) return null;

  const visible = items.slice(0, 5);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-[12px] font-semibold text-white/90">Salvos</h3>
        <span className="text-[10.5px] font-mono tabular-nums text-white/30">{items.length}</span>
      </div>
      <ul className="space-y-1.5">
        {visible.map((b) => (
          <li key={b.id} className="flex items-center gap-2 group">
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-0 text-[12px] text-white/80 hover:text-white leading-snug line-clamp-1 flex items-center gap-1.5"
            >
              <span className="truncate">{b.headline}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 shrink-0" strokeWidth={2} />
            </a>
            <span className="text-[9.5px] font-mono text-white/30 shrink-0">{formatRelative(b.savedAt)}</span>
            <button
              type="button"
              onClick={() => remove(b.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/40 hover:text-rose-400 transition-all"
              title="Remover"
              aria-label="Remover"
            >
              <Trash2 className="w-3 h-3" strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <p className="text-[10px] text-white/30 mt-2 font-mono">+{items.length - 5} salvos</p>
      )}
    </div>
  );
}
