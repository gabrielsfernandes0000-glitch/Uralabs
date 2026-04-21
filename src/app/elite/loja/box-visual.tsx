"use client";

/**
 * BoxVisual — "poster" da caixa, consistente entre todas.
 *
 * Todas as caixas usam cover SVG customizado por tier (/loja/box-{tier}.svg).
 * Escalada visual: Básica fechada → Premium semi-aberta → Lendária aberta
 * com light beams. Imagem de prêmio individual (ex: gift card Nike) NÃO é
 * mostrada aqui — fica pro open overlay e pra grid de prêmios. Assim todas
 * as caixas ficam com visual coeso.
 */

import Image from "next/image";
import type { BoxWithPrizes } from "@/lib/ura-coin";

type Tier = BoxWithPrizes["tier"];

const TIER_COVER: Record<Tier, string> = {
  basic: "/loja/box-basic.svg",
  premium: "/loja/box-premium.svg",
  legendary: "/loja/box-legendary.svg",
};

export function BoxVisual({ box }: { box: BoxWithPrizes }) {
  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0a0a0c]">
      <Image
        src={TIER_COVER[box.tier]}
        alt={tierLabel(box.tier)}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover"
        unoptimized
      />

      <span className="absolute top-4 left-4 text-[10.5px] text-white/60 tracking-[0.08em] px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
        {tierLabel(box.tier)}
      </span>
      <span className="absolute top-4 right-4 text-[10.5px] text-white/55 font-mono tabular-nums px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
        {box.prizes.length} {box.prizes.length === 1 ? "prêmio" : "prêmios"}
      </span>
    </div>
  );
}

function tierLabel(tier: Tier): string {
  if (tier === "basic") return "Básica";
  if (tier === "premium") return "Premium";
  return "Lendária";
}
