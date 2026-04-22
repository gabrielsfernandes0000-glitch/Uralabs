"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

export function BookmarkButton({
  id,
  headline,
  url,
  source,
  publishedAt,
  className = "",
}: {
  id: string;
  headline: string;
  url: string;
  source: string;
  publishedAt: string;
  className?: string;
}) {
  const { has, toggle } = useBookmarks();
  const saved = has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle({ id, headline, url, source, publishedAt });
      }}
      aria-label={saved ? "Remover dos salvos" : "Salvar pra ler depois"}
      title={saved ? "Remover dos salvos" : "Salvar pra ler depois"}
      className={`interactive-tap inline-flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors border ${
        saved
          ? "border-white/25 text-white bg-white/[0.04]"
          : "text-white/40 hover:text-white/80 hover:bg-white/[0.04] border-transparent"
      } ${className}`}
    >
      {saved ? <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2.2} /> : <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />}
    </button>
  );
}
