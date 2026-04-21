"use client";

import { DollarSign, Gift, Sparkles, Zap, Ticket } from "lucide-react";
import Image from "next/image";
import type { PrizeType, PrizeRarity } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";

/** Tile visual de prêmio — usado na grid da caixa, recent list e na animação. */

const RARITY_STYLES: Record<
  PrizeRarity,
  { bg: string; border: string; glow: string; text: string; label: string }
> = {
  common: {
    bg: "bg-zinc-800/40",
    border: "border-zinc-600/40",
    glow: "shadow-zinc-500/10",
    text: "text-zinc-300",
    label: "Comum",
  },
  uncommon: {
    bg: "bg-emerald-900/20",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-300",
    label: "Incomum",
  },
  rare: {
    bg: "bg-blue-900/20",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/25",
    text: "text-blue-300",
    label: "Rara",
  },
  epic: {
    bg: "bg-purple-900/25",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/30",
    text: "text-purple-300",
    label: "Épica",
  },
  legendary: {
    bg: "bg-amber-900/20",
    border: "border-amber-500/50",
    glow: "shadow-amber-500/40",
    text: "text-amber-300",
    label: "Lendária",
  },
};

function typeIcon(type: PrizeType) {
  switch (type) {
    case "cash_brl":
      return DollarSign;
    case "nitro_basic":
    case "nitro_boost":
      return Zap;
    case "elite_discount":
    case "cupom_custom":
      return Ticket;
    case "sub_vip":
    case "sub_elite":
      return Sparkles;
    default:
      return Gift;
  }
}

// Render-prop: alguns tipos merecem ícone custom (UraCoinIcon) em vez de lucide.
function renderTypeIcon(type: PrizeType, className: string) {
  if (type === "ura_coin_bonus") {
    return <UraCoinIcon className={className} />;
  }
  const Icon = typeIcon(type);
  return <Icon className={className} strokeWidth={1.8} />;
}

export function PrizeTile({
  name,
  type,
  rarity,
  valueBrl,
  imageUrl,
  compact,
  exhausted,
}: {
  name: string;
  type: PrizeType;
  rarity: PrizeRarity;
  valueBrl: number | null;
  imageUrl?: string | null;
  compact?: boolean;
  exhausted?: boolean;
}) {
  const s = RARITY_STYLES[rarity];
  const hasImage = !!imageUrl;

  if (compact) {
    return (
      <div
        className={`relative shrink-0 w-11 h-11 rounded-lg border ${s.bg} ${s.border} flex items-center justify-center overflow-hidden ${exhausted ? "opacity-30 grayscale" : ""}`}
      >
        {hasImage ? (
          <Image
            src={imageUrl!}
            alt={name}
            fill
            sizes="44px"
            className="object-cover"
            unoptimized
          />
        ) : (
          renderTypeIcon(type, `w-5 h-5 ${s.text}`)
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border ${s.bg} ${s.border} overflow-hidden transition-all ${exhausted ? "opacity-40 grayscale" : `shadow-lg ${s.glow}`}`}
    >
      {hasImage ? (
        <div className="relative aspect-square bg-black/40 flex flex-col">
          <div className="relative flex-1 min-h-0 p-2">
            <Image
              src={imageUrl!}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <div className="px-2 py-1.5 text-center bg-black/70 border-t border-white/5">
            <div className="text-[11px] font-medium leading-tight line-clamp-1 text-white">
              {name}
            </div>
            {valueBrl != null && valueBrl > 0 && (
              <div className="text-[10px] text-white/60 tabular-nums mt-0.5">
                R${valueBrl.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col items-center text-center gap-2 aspect-square justify-center">
          {renderTypeIcon(type, `w-8 h-8 ${s.text}`)}
          <div className="text-xs font-medium leading-tight line-clamp-2 text-white">
            {name}
          </div>
          {valueBrl != null && valueBrl > 0 && (
            <div className="text-[10px] text-white/40 tabular-nums">
              R${valueBrl.toFixed(2)}
            </div>
          )}
        </div>
      )}
      <div
        className={`px-2 py-0.5 text-[9px] uppercase tracking-wider text-center ${s.text} border-t ${s.border} bg-black/30 backdrop-blur-sm`}
      >
        {s.label}
      </div>
      {exhausted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
            Esgotado hoje
          </span>
        </div>
      )}
    </div>
  );
}

export { RARITY_STYLES };
