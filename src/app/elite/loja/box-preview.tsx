"use client";

/**
 * BoxPreview — modal de inspeção antes de abrir a caixa.
 *
 * UX: click "Abrir" no card → preview com TODOS os prêmios + chances → confirma
 * gasto → dispara strip animation. Usuário sempre vê odds antes de gastar coin.
 *
 * Ordenação: raridade desc (legendary primeiro) → chance desc dentro da tier.
 * Consistente com padrões de skin markets.
 */

import { useEffect } from "react";
import { X, DollarSign, Gift, Zap, Ticket, Sparkles } from "lucide-react";
import Image from "next/image";
import type { BoxWithPrizes, PrizeType, PrizeRarity } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";

const RARITY_ORDER: Record<PrizeRarity, number> = {
  legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1,
};

const RARITY_DOT: Record<PrizeRarity, string> = {
  common: "bg-zinc-400",
  uncommon: "bg-emerald-400",
  rare: "bg-blue-400",
  epic: "bg-purple-400",
  legendary: "bg-amber-400",
};

const RARITY_LABEL: Record<PrizeRarity, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Rara",
  epic: "Épica",
  legendary: "Lendária",
};

const TIER_LABEL: Record<BoxWithPrizes["tier"], string> = {
  basic: "Básica",
  premium: "Premium",
  legendary: "Lendária",
};

const TIER_DOT: Record<BoxWithPrizes["tier"], string> = {
  basic: "bg-zinc-400",
  premium: "bg-white/70",
  legendary: "bg-amber-400",
};

export function BoxPreview({
  box,
  balance,
  onConfirm,
  onClose,
}: {
  box: BoxWithPrizes;
  balance: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  // ESC fecha
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...box.prizes].sort((a, z) => {
    const rDiff = RARITY_ORDER[z.rarity] - RARITY_ORDER[a.rarity];
    if (rDiff !== 0) return rDiff;
    return z.chance - a.chance;
  });

  // Agrupa por rarity pra subtítulo visual
  const byRarity: Record<PrizeRarity, typeof sorted> = {
    legendary: [], epic: [], rare: [], uncommon: [], common: [],
  };
  for (const p of sorted) byRarity[p.rarity].push(p);
  const rarityGroups: PrizeRarity[] = ["legendary", "epic", "rare", "uncommon", "common"];

  const canAfford = balance >= box.cost_coins;
  const canOpen = canAfford && box.any_available;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="rounded-2xl bg-[#0b0b0d] border border-white/[0.08] w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5 border-b border-white/[0.05]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${TIER_DOT[box.tier]}`} />
              <span className="text-[11px] text-white/50 tracking-[0.06em]">
                Caixa {TIER_LABEL[box.tier]}
              </span>
            </div>
            <h2 className="text-[22px] font-semibold text-white tracking-tight leading-tight">
              {box.name}
            </h2>
            {box.description && (
              <p className="text-[13px] text-white/45 mt-1.5 leading-relaxed line-clamp-2">
                {box.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Prizes grid — agrupada por raridade */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[11px] text-white/35 mb-4">
            {box.prizes.length} prêmios · chances sorteadas server-side
          </p>

          {rarityGroups.map((rarity) => {
            const items = byRarity[rarity];
            if (items.length === 0) return null;
            const groupChance = items.reduce((s, p) => s + p.chance, 0);
            return (
              <div key={rarity} className="mb-5 last:mb-0">
                <div className="flex items-baseline gap-2 mb-2.5">
                  <span className={`w-1 h-1 rounded-full ${RARITY_DOT[rarity]}`} />
                  <p className="text-[11px] text-white/55">{RARITY_LABEL[rarity]}</p>
                  <p className="text-[10.5px] text-white/30 font-mono tabular-nums ml-auto">
                    {groupChance.toFixed(groupChance < 1 ? 2 : 1)}% no total
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {items.map((p) => (
                    <PrizeCell key={p.id} prize={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: custo + CTAs */}
        <div className="px-6 py-5 border-t border-white/[0.05] flex items-center justify-between gap-4 flex-wrap bg-white/[0.015]">
          <div>
            <p className="text-[10.5px] text-white/35 tracking-[0.05em] mb-1">Custo</p>
            <div className="flex items-baseline gap-1.5">
              <UraCoinIcon className="w-5 h-5" />
              <span className="text-[22px] font-semibold tabular-nums tracking-tight">
                {box.cost_coins.toLocaleString("pt-BR")}
              </span>
              <span className="text-[11px] text-white/35 ml-1 tabular-nums">
                saldo {balance.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="interactive-tap h-10 px-4 rounded-full border border-white/[0.1] text-white/70 text-[12.5px] font-medium hover:text-white hover:border-white/[0.22] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!canOpen}
              className="interactive-tap h-10 px-5 rounded-full bg-white text-black text-[12.5px] font-semibold hover:bg-white/90 disabled:bg-white/[0.05] disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
            >
              {!box.any_available
                ? "Esgotada hoje"
                : !canAfford
                  ? `Faltam ${(box.cost_coins - balance).toLocaleString("pt-BR")}`
                  : `Abrir por ${box.cost_coins.toLocaleString("pt-BR")}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrizeCell({ prize }: { prize: BoxWithPrizes["prizes"][number] }) {
  return (
    <div
      className={`rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden transition-colors hover:border-white/[0.12] ${
        prize.exhausted_today ? "opacity-40" : ""
      }`}
    >
      <div className="relative aspect-square bg-white/[0.02] flex items-center justify-center">
        {prize.image_url ? (
          <Image
            src={prize.image_url}
            alt={prize.name}
            fill
            sizes="120px"
            className="object-contain p-2.5"
            unoptimized
          />
        ) : (
          renderIconFor(prize.type)
        )}
        {prize.exhausted_today && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-[9.5px] text-white/60 tracking-wide">Esgotado hoje</span>
          </div>
        )}
      </div>
      <div className="px-2 py-2 border-t border-white/[0.04]">
        <p className="text-[11px] font-medium text-white leading-tight truncate">
          {prize.name}
        </p>
        <div className="flex items-center justify-between mt-1 gap-1">
          {prize.value_brl != null && prize.value_brl > 0 ? (
            <span className="text-[10px] text-white/40 tabular-nums">
              R${prize.value_brl.toFixed(0)}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-white/60 font-mono tabular-nums">
            {prize.chance.toFixed(prize.chance < 1 ? 2 : 1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function renderIconFor(type: PrizeType) {
  const cls = "w-6 h-6 text-white/40";
  if (type === "cash_brl") return <DollarSign className={cls} strokeWidth={1.8} />;
  if (type === "nitro_basic" || type === "nitro_boost") return <Zap className={cls} strokeWidth={1.8} />;
  if (type === "elite_discount" || type === "cupom_custom") return <Ticket className={cls} strokeWidth={1.8} />;
  if (type === "sub_vip" || type === "sub_elite") return <Sparkles className={cls} strokeWidth={1.8} />;
  if (type === "ura_coin_bonus") return <UraCoinIcon className={cls.replace("text-white/40", "")} />;
  return <Gift className={cls} strokeWidth={1.8} />;
}
