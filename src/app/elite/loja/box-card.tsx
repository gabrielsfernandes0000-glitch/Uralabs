"use client";

import type { BoxWithPrizes } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";
import { BoxVisual } from "./box-visual";

/**
 * BoxCard — Apple clean.
 *
 * Visual: card escuro sem border colorido, key art do prêmio destaque,
 * tipografia generosa, CTA único claro. Sem 3D, sem rotação, sem tier colors.
 * Diferenciação entre caixas vem do conteúdo (nome, prêmio destaque, preço),
 * não de cor.
 */

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
  const keyPrize = [...box.prizes].sort((a, z) => a.chance - z.chance)[0] ?? box.prizes[0];
  const enabled = !disabled && canAfford && box.any_available;

  return (
    <div className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden transition-colors hover:border-white/[0.1]">
      <BoxVisual box={box} />

      <div className="p-5 pt-4">
        <h3 className="text-[16px] font-semibold text-white leading-tight tracking-tight">
          {box.name}
        </h3>
        {box.description && (
          <p className="text-[12px] text-white/45 mt-1.5 line-clamp-1 leading-snug">
            {box.description}
          </p>
        )}

        {keyPrize && (
          <div className="mt-4 flex items-center gap-2 text-[11.5px] text-white/55">
            <span className="truncate">
              <span className="text-white/35">Destaque </span>
              <span className="font-medium text-white/80">{keyPrize.name}</span>
            </span>
            <span className="text-white/25">·</span>
            <span className="font-mono tabular-nums shrink-0 text-white/45">
              {keyPrize.chance.toFixed(keyPrize.chance < 1 ? 2 : 1)}%
            </span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <UraCoinIcon className="w-4 h-4" />
            <span className="text-[18px] font-semibold tabular-nums tracking-tight">
              {box.cost_coins.toLocaleString("pt-BR")}
            </span>
          </div>

          <button
            onClick={onOpen}
            disabled={!enabled}
            className="interactive-tap h-9 px-4 rounded-full bg-white text-black text-[12.5px] font-semibold hover:bg-white/90 disabled:bg-white/[0.05] disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
          >
            {!box.any_available
              ? "Esgotada"
              : !canAfford
                ? `Faltam ${(box.cost_coins - balance).toLocaleString("pt-BR")}`
                : "Abrir"}
          </button>
        </div>
      </div>
    </div>
  );
}
