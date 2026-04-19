import { Newspaper } from "lucide-react";
import { categoryMeta, type NewsCategory } from "@/lib/market-news";

/**
 * Fallback visual pra cards de news sem image_url.
 * Gradient sutil na cor da categoria + marca d'água da source.
 * `variant` controla altura/tamanho do texto.
 */
export function NewsThumbFallback({
  source,
  category,
  variant = "card",
}: {
  source: string;
  category: NewsCategory;
  variant?: "card" | "hero";
}) {
  const cat = categoryMeta(category);
  const accent = cat.accent;

  const isHero = variant === "hero";
  const textSize = isHero ? 90 : 58;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 30% 30%, ${accent}18, transparent 60%), radial-gradient(ellipse at 75% 75%, ${accent}0c, transparent 60%), #0a0a0c`,
      }}
    >
      {/* Marca d'água com source */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <span
          className="font-black tracking-tighter whitespace-nowrap select-none"
          style={{
            fontSize: `${textSize}px`,
            color: accent,
            opacity: 0.09,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          {source.toUpperCase()}
        </span>
      </div>

      {/* Pattern diagonal sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 12px)`,
        }}
      />

      {/* Ícone no canto */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/[0.06]">
        <Newspaper className="w-2.5 h-2.5" style={{ color: accent, opacity: 0.7 }} strokeWidth={2} />
        <span className="text-[8.5px] font-bold tracking-[0.22em] uppercase text-white/55">{cat.label}</span>
      </div>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
      />
    </div>
  );
}
