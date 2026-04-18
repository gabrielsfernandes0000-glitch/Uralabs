"use client";

import { Coins, DollarSign, Gift, Sparkles, Zap, Ticket } from "lucide-react";
import type { PrizeType, PrizeRarity } from "@/lib/ura-coin";

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
    case "ura_coin_bonus":
      return Coins;
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

export function PrizeTile({
  name,
  type,
  rarity,
  valueBrl,
  compact,
  exhausted,
}: {
  name: string;
  type: PrizeType;
  rarity: PrizeRarity;
  valueBrl: number | null;
  compact?: boolean;
  exhausted?: boolean;
}) {
  const s = RARITY_STYLES[rarity];
  const Icon = typeIcon(type);

  if (compact) {
    return (
      <div
        className={`relative shrink-0 w-11 h-11 rounded-lg border ${s.bg} ${s.border} flex items-center justify-center ${exhausted ? "opacity-30 grayscale" : ""}`}
      >
        <Icon className={`w-5 h-5 ${s.text}`} />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border ${s.bg} ${s.border} overflow-hidden transition-all ${exhausted ? "opacity-40 grayscale" : `shadow-lg ${s.glow}`}`}
    >
      <div className="p-4 flex flex-col items-center text-center gap-2 aspect-square justify-center">
        <Icon className={`w-8 h-8 ${s.text}`} />
        <div className="text-xs font-medium leading-tight line-clamp-2 text-white">
          {name}
        </div>
        {valueBrl != null && valueBrl > 0 && (
          <div className="text-[10px] text-white/40 tabular-nums">
            R${valueBrl.toFixed(2)}
          </div>
        )}
      </div>
      <div
        className={`px-2 py-0.5 text-[9px] uppercase tracking-wider text-center ${s.text} border-t ${s.border}`}
      >
        {s.label}
      </div>
      {exhausted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
            Esgotado hoje
          </span>
        </div>
      )}
    </div>
  );
}

export { RARITY_STYLES };
