"use client";

import React from "react";

/* ────────────────────────────────────────────────────────────────────────────
   CosmeticBanner — banners em imagem (WebP) servidos de /cosmetics/banners/.

   Migração 2026-04-20: saiu do SVG+CSS pra PNG gerado no Nano Banana Pro.
   Migração 2026-04-21: PNG → WebP (-92% em peso; 202MB → 15MB no total).
   Imagens ficam em `public/cosmetics/banners/<slug>.webp`.

   Variants:
   - "full"    → modal header (cena completa, altura total)
   - "sidebar" → fade no topo da sidebar (crop superior)
   - "card"    → thumbnail em cards de membros
   - "strip"   → barra fina 40px em posts (crop central)

   Adicionar um banner novo:
   1. Salva PNG em `site/public/cosmetics/banners/<slug>.png` (1792×512 ideal)
      Depois roda `node scripts/optimize-banners.mjs` pra virar WebP (-92%)
   2. Adiciona slug em BannerSlug union + entry em BANNER_ACCENT (cor pra UI)
   3. Seed em prizes com metadata.slug_kind = <slug>
   ──────────────────────────────────────────────────────────── */

export type BannerSlug =
  // Batch 1 (tarot v1)
  | "diamond-hands"
  | "o-sol-bull"
  | "a-torre-flash"
  | "a-temperanca-rr"
  // Batch 2 — tarot v2
  | "o-louco-yolo"
  | "a-imperatriz-liquidez"
  | "o-eremita-paciencia"
  | "a-morte-cycle"
  // Batch 2 — degen / street
  | "mesa-trader"
  | "whale-alert"
  | "vegas-lambo"
  // Batch 2 — mystical / nature
  | "wolfpack-alpha"
  | "crypto-monastery"
  | "phoenix-rebirth"
  | "dragon-gold"
  // Batch 2 — cyber / tech
  | "neural-net"
  | "cyber-samurai"
  | "hologram-chart"
  | "matrix-throne"
  // Batch 2 — royalty / classical
  | "golden-gates"
  | "smoke-mirrors"
  | "warrior-king-bull";

export type BannerVariant = "full" | "sidebar" | "card" | "strip" | "cover";

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
  // Batch 1
  "diamond-hands": "#06B6D4",
  "o-sol-bull": "#F59E0B",
  "a-torre-flash": "#3B82F6",
  "a-temperanca-rr": "#10B981",
  // Tarot v2
  "o-louco-yolo": "#FBBF24",         // amarelo ensolarado
  "a-imperatriz-liquidez": "#10B981", // esmeralda
  "o-eremita-paciencia": "#6366F1",   // violeta/índigo frio
  "a-morte-cycle": "#DC2626",         // carmesim
  // Degen / street
  "mesa-trader": "#F97316",           // laranja do monitor
  "whale-alert": "#06B6D4",           // azul-ciano deep
  "vegas-lambo": "#F59E0B",           // laranja Lambo + neon magenta
  // Mystical / nature
  "wolfpack-alpha": "#94A3B8",        // prata lobo
  "crypto-monastery": "#FCD34D",      // dourado suave
  "phoenix-rebirth": "#F97316",       // fênix laranja
  "dragon-gold": "#EAB308",           // dourado imperial
  // Cyber / tech
  "neural-net": "#A855F7",            // magenta/ciano neural
  "cyber-samurai": "#EF4444",         // vermelho katana
  "hologram-chart": "#06B6D4",        // ciano holográfico
  "matrix-throne": "#22C55E",         // verde Matrix
  // Royalty / classical
  "golden-gates": "#EAB308",          // ouro baroque
  "smoke-mirrors": "#8B5CF6",         // púrpura victorian
  "warrior-king-bull": "#B45309",     // bronze guerreiro
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
  // "cover" (perfil): arte inteira sem crop, centralizada com letterbox
  cover:   { objectFit: "contain", objectPosition: "center center" },
};

// card/strip → thumb 560×160 (~20KB); full/sidebar/cover → full 1792×512 (~500KB).
// Thumb evita decodar 50 imagens full quando o seletor abre.
const USE_THUMB: Record<BannerVariant, boolean> = {
  full:    false,
  sidebar: false,
  cover:   false,
  card:    true,
  strip:   true,
};

export function CosmeticBanner({ slug, variant = "full", className }: CosmeticBannerProps) {
  if (!isBannerSlug(slug)) return null;

  const suffix = USE_THUMB[variant] ? "-thumb" : "";
  const src = `/cosmetics/banners/${slug}${suffix}.webp`;
  // Ambient mode: "cover" (perfil) mostra a arte inteira sem crop, e as sobras
  // (quando o container é mais largo/alto que a proporção da imagem) ficam
  // preenchidas com uma versão borrada e escurecida do mesmo banner. Zero
  // barras pretas, zero aumento de área — estilo Apple TV / YouTube ambient.
  const isAmbient = variant === "cover";

  return (
    <div
      className={`banner-frame ${className ?? ""}`}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      data-variant={variant}
    >
      {isAmbient && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(36px) saturate(1.25) brightness(0.35)",
            // scale evita o efeito de "corte" nas bordas que o blur causa
            transform: "scale(1.15)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        decoding="async"
        fetchPriority={USE_THUMB[variant] ? "low" : "auto"}
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
