"use client";

import { Globe, Loader2 } from "lucide-react";
import { useNewsLang } from "./NewsLangProvider";

export function NewsLangToggle() {
  const { lang, toggle, loading, pending, total } = useNewsLang();
  const active = lang === "pt";

  // Status visual: se tá ativo em PT, mostra "PT" ou "PT · X/Y" enquanto traduz
  const label = active
    ? loading || pending > 0
      ? `PT · ${Math.max(0, total - pending)}/${total}`
      : "PT"
    : "EN";

  return (
    <button
      type="button"
      onClick={toggle}
      title={active ? "Voltar para inglês" : "Traduzir para português"}
      className={`interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all active:scale-[0.97] ${
        active
          ? "border-white/25 text-white bg-white/[0.06]"
          : "border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.20]"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
      ) : (
        <Globe className="w-3 h-3" strokeWidth={2} />
      )}
      <span className="font-mono tracking-wider tabular-nums">{label}</span>
    </button>
  );
}
