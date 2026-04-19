"use client";

import { Lock, Package } from "lucide-react";
import type { BoxWithPrizes } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";
import { PrizeTile } from "./prize-tile";

const TIER_STYLES: Record<
  "basic" | "premium" | "legendary",
  { accent: string; glow: string; label: string }
> = {
  basic: {
    accent: "from-zinc-500/20 to-zinc-600/10",
    glow: "shadow-zinc-500/10",
    label: "Básica",
  },
  premium: {
    accent: "from-purple-500/25 to-pink-500/10",
    glow: "shadow-purple-500/20",
    label: "Premium",
  },
  legendary: {
    accent: "from-amber-500/30 to-orange-500/10",
    glow: "shadow-amber-500/30",
    label: "Lendária",
  },
};

export function BoxCard({
  box,
  balance,
  onOpen,
  disabled,
}: {
  box: BoxWithPrizes;
  balance: number;
  onOpen: () => void;
  disabled: boolean;
}) {
  const canAfford = balance >= box.cost_coins;
  const style = TIER_STYLES[box.tier];
  const topPrizes = box.prizes.slice(0, 4);

  return (
    <div
      className={`group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br ${style.accent} overflow-hidden ${style.glow} shadow-xl transition-all hover:border-white/20`}
    >
      {/* Tier ribbon */}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-black/40 border border-white/[0.08] text-white/60">
          {style.label}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-white/5" />
            <div className="relative w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Package className="w-6 h-6 text-white/70" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight">{box.name}</h3>
            {box.description && (
              <p className="text-[11px] text-white/40 mt-1 line-clamp-2">
                {box.description}
              </p>
            )}
          </div>
        </div>

        {/* Prize preview */}
        {topPrizes.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
              Pode cair
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {topPrizes.map((p) => (
                <div key={p.id} className="relative">
                  <PrizeTile
                    name={p.name}
                    type={p.type}
                    rarity={p.rarity}
                    valueBrl={p.value_brl}
                    compact
                    exhausted={p.exhausted_today}
                  />
                  <div className="text-[9px] text-white/40 text-center mt-1 tabular-nums">
                    {p.chance.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            {box.prizes.length > 4 && (
              <p className="text-[10px] text-white/30 mt-2 text-center">
                +{box.prizes.length - 4} outros possíveis
              </p>
            )}
          </div>
        )}

        <button
          onClick={onOpen}
          disabled={disabled || !canAfford || !box.any_available}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:bg-white/[0.06] disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
        >
          {!box.any_available ? (
            <>
              <Lock className="w-4 h-4" />
              Esgotada hoje
            </>
          ) : !canAfford ? (
            <>
              <Lock className="w-4 h-4" />
              Saldo insuficiente
            </>
          ) : (
            <>
              <UraCoinIcon className="w-4 h-4" />
              Abrir por {box.cost_coins.toLocaleString("pt-BR")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
