"use client";

import React from "react";

/* ────────────────────────────────────────────────────────────────────────────
   CosmeticBanner — banners em imagem (PNG) servidos de /cosmetics/banners/.

   Migração 2026-04-20: saiu do SVG+CSS pra PNG gerado no Nano Banana Pro.
   Imagens ficam em `public/cosmetics/banners/<slug>.png`.

   Variants:
   - "full"    → modal header (cena completa, altura total)
   - "sidebar" → fade no topo da sidebar (crop superior)
   - "card"    → thumbnail em cards de membros
   - "strip"   → barra fina 40px em posts (crop central)

   Adicionar um banner novo:
   1. Salva PNG em `site/public/cosmetics/banners/<slug>.png` (1792×512 ideal)
   2. Adiciona slug em BannerSlug union + entry em BANNER_ACCENT (cor pra UI)
   3. Seed em prizes com metadata.slug_kind = <slug>
   ──────────────────────────────────────────────────────────── */

export type BannerSlug =
  | "diamond-hands"
  | "o-sol-bull"
  | "a-torre-flash"
  | "a-temperanca-rr";

export type BannerVariant = "full" | "sidebar" | "card" | "strip";

/** Mantido pra retrocompat — imagens não animam, mas a prop existe pra
 *  callers antigos (Sidebar, MemberProfileModal) não quebrarem. */
export type AnimMode = "always" | "hover" | "off";

export interface CosmeticBannerProps {
  slug: BannerSlug | string | null | undefined;
  variant?: BannerVariant;
  animated?: AnimMode;
  /** @deprecated legado — ignorado */
  interactive?: boolean;
  className?: string;
}

const BANNER_ACCENT: Record<BannerSlug, string> = {
  "diamond-hands": "#06B6D4",
  "o-sol-bull": "#F59E0B",
  "a-torre-flash": "#3B82F6",
  "a-temperanca-rr": "#10B981",
};

const ALL_SLUGS: BannerSlug[] = Object.keys(BANNER_ACCENT) as BannerSlug[];

export function isBannerSlug(s: unknown): s is BannerSlug {
  return typeof s === "string" && (ALL_SLUGS as string[]).includes(s);
}

export function bannerAccent(slug: BannerSlug | string | null | undefined): string {
  return isBannerSlug(slug) ? BANNER_ACCENT[slug] : "#FF5500";
}

const VARIANT_STYLE: Record<BannerVariant, React.CSSProperties> = {
  full:    { objectFit: "cover", objectPosition: "center center" },
  sidebar: { objectFit: "cover", objectPosition: "center top" },
  card:    { objectFit: "cover", objectPosition: "center center" },
  strip:   { objectFit: "cover", objectPosition: "center center" },
};

export function CosmeticBanner({ slug, variant = "full", className }: CosmeticBannerProps) {
  if (!isBannerSlug(slug)) return null;

  return (
    <div
      className={`banner-frame ${className ?? ""}`}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      data-variant={variant}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/cosmetics/banners/${slug}.png`}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          ...VARIANT_STYLE[variant],
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
