"use client";

import React from "react";

/* ────────────────────────────────────────────────────────────────────────────
   CosmeticBanner — mini-cena SVG animada por slug.

   Cada banner é um ambient loop + hover boost. 4 variants de tamanho:
   - "full"    → modal header (alto, full scene + hover)
   - "sidebar" → fade no topo da sidebar (ambient-only)
   - "card"    → thumbnail em cards de membros (simplificado)
   - "strip"   → barra fina 40px em posts (só accent + shine)

   ── Adicionando um banner novo:
   1. Adiciona o slug em BannerSlug union
   2. Cria um case no switch do CosmeticBanner abaixo
   3. Seed em prizes com metadata.slug_kind = <slug>
   ──────────────────────────────────────────────────────────── */

export type BannerSlug =
  | "bull-run"
  | "bear-cave"
  | "diamond-hands"
  | "smc-wizard"
  | "liquidity-hunter"
  | "btc-fire"
  | "judas-swing"
  | "degen-nights"
  // Tarot-trading v3
  | "a-torre-flash"
  | "o-sol-bull"
  | "a-temperanca-rr";

export type BannerVariant = "full" | "sidebar" | "card" | "strip";

/** Controle de performance das animações:
 * - "always": mount + loop ambient + hover boost. Usar em perfil/modal (1 instância).
 * - "hover":  mount one-shot, estático depois, animação só no hover. DEFAULT pra listas.
 * - "off":    só renderiza shape inicial, nenhuma animação. Pra thumbnails estáticos.
 */
export type AnimMode = "always" | "hover" | "off";

export interface CosmeticBannerProps {
  slug: BannerSlug | string | null | undefined;
  variant?: BannerVariant;
  animated?: AnimMode;
  /** @deprecated use `animated` — kept pra não quebrar callers */
  interactive?: boolean;
  className?: string;
}

const BANNER_ACCENT: Record<BannerSlug, string> = {
  "bull-run": "#10B981",
  "bear-cave": "#EF4444",
  "diamond-hands": "#06B6D4",
  "smc-wizard": "#8B5CF6",
  "liquidity-hunter": "#F59E0B",
  "btc-fire": "#F7931A",
  "judas-swing": "#A855F7",
  "degen-nights": "#EC4899",
  // Tarot v3
  "a-torre-flash": "#3B82F6",
  "o-sol-bull": "#F59E0B",
  "a-temperanca-rr": "#10B981",
};

const ALL_SLUGS: BannerSlug[] = Object.keys(BANNER_ACCENT) as BannerSlug[];

export function isBannerSlug(s: unknown): s is BannerSlug {
  return typeof s === "string" && (ALL_SLUGS as string[]).includes(s);
}

export function bannerAccent(slug: BannerSlug | string | null | undefined): string {
  return isBannerSlug(slug) ? BANNER_ACCENT[slug] : "#FF5500";
}

export function CosmeticBanner({ slug, variant = "full", animated, interactive, className }: CosmeticBannerProps) {
  if (!isBannerSlug(slug)) return null;

  // Backward compat: se veio interactive={false} (legado "ambient ON"), mapeia pra "always".
  // Se nada passado, default é "hover" (perf-safe).
  const anim: AnimMode = animated ?? (interactive === false ? "always" : "hover");

  const commonProps = { variant, animated: anim, accent: BANNER_ACCENT[slug] };

  switch (slug) {
    case "bull-run":         return <BullRun       {...commonProps} className={className} />;
    case "bear-cave":        return <BearCave      {...commonProps} className={className} />;
    case "diamond-hands":    return <DiamondHands  {...commonProps} className={className} />;
    case "smc-wizard":       return <SmcWizard     {...commonProps} className={className} />;
    case "liquidity-hunter": return <LiquidityHunter {...commonProps} className={className} />;
    case "btc-fire":         return <BtcFire       {...commonProps} className={className} />;
    case "judas-swing":      return <JudasSwing    {...commonProps} className={className} />;
    case "degen-nights":     return <DegenNights   {...commonProps} className={className} />;
    // Tarot v3 — só os que passam em qualidade visual
    case "a-torre-flash":    return <ATorreFlash    {...commonProps} className={className} />;
    case "o-sol-bull":       return <OSolBull       {...commonProps} className={className} />;
    case "a-temperanca-rr":  return <ATemperancaRr  {...commonProps} className={className} />;
  }
}

interface BannerChildProps {
  variant: BannerVariant;
  animated: AnimMode;
  accent: string;
  className?: string;
}

/** Wrapper comum: aplica `data-anim` pras regras CSS dentro de cada variant.
 *  Ver AnimMode pra semântica de cada valor. */
function Frame({
  children, variant, animated, accent, style, className, animName,
}: BannerChildProps & {
  children: React.ReactNode;
  style?: React.CSSProperties;
  animName: string;
}) {
  return (
    <div
      className={`banner-frame banner-${animName} ${className ?? ""}`}
      data-anim={animated}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        ["--banner-accent" as string]: accent,
        ["--banner-accent-20" as string]: accent + "33",
        ["--banner-accent-40" as string]: accent + "66",
        ...style,
      }}
      data-variant={variant}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   1. BULL RUN — velas verdes escalando + glow pulsante
   ────────────────────────────────────────────────────── */
function BullRun({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="up" className={className} />;
  const candles = [
    { x: 60,  openY: 120, closeY: 105, h: 95 },
    { x: 110, openY: 115, closeY: 95,  h: 85 },
    { x: 160, openY: 105, closeY: 80,  h: 70 },
    { x: 210, openY: 90,  closeY: 60,  h: 52 },
    { x: 260, openY: 70,  closeY: 40,  h: 32 },
    { x: 310, openY: 55,  closeY: 22,  h: 14 },
  ];
  return (
    <Frame animName="bull-run" variant={variant} animated={animated} accent={accent} className={className}>
      {/* Gradient base */}
      <div className="banner-base" style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${accent}28 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 85% 50%, ${accent}20, transparent 70%)`,
      }} />
      {/* Grid fundo */}
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {[40, 80, 120].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={`${accent}14`} strokeWidth="0.5" strokeDasharray="3 4" />
        ))}
        {/* Price trajectory line */}
        <path d="M 20 140 Q 80 130 110 110 T 210 70 T 310 25 T 390 10"
          stroke={`${accent}90`} strokeWidth="1.5" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${accent}80)` }} />
        {/* Candles */}
        {candles.map((c, i) => (
          <g key={i} className="bull-candle" style={{ ["--i" as string]: i }}>
            <line x1={c.x} y1={c.h} x2={c.x} y2={c.openY + 8} stroke={`${accent}bb`} strokeWidth="1.5" />
            <rect x={c.x - 8} y={c.closeY} width="16" height={c.openY - c.closeY}
              fill={accent} opacity="0.9" rx="1.5"
              style={{ filter: `drop-shadow(0 0 3px ${accent}80)` }} />
          </g>
        ))}
        {/* Arrow up */}
        <g transform="translate(350, 30)">
          <path d="M 0 15 L 10 0 L 20 15 M 5 15 L 15 15" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        </g>
      </svg>
      <style>{`
        .banner-bull-run .bull-candle { animation: bullAppear 0.5s ease-out calc(var(--i) * 0.15s) backwards; transform-origin: center bottom; }
        .banner-bull-run:hover .bull-candle { animation: bullPulse 0.8s ease-in-out calc(var(--i) * 0.1s) infinite; }
        .banner-bull-run[data-anim="always"] .bull-candle { animation: bullAppear 0.5s ease-out calc(var(--i) * 0.15s) backwards, bullPulse 3s ease-in-out calc(var(--i) * 0.15s) infinite 0.5s; }
        @keyframes bullAppear { from { transform: translateY(12px) scaleY(0.3); opacity: 0 } to { transform: translateY(0) scaleY(1); opacity: 1 } }
        @keyframes bullPulse { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   2. BEAR CAVE — velas vermelhas caindo + fog drift
   ────────────────────────────────────────────────────── */
function BearCave({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="down" className={className} />;
  const candles = [
    { x: 60,  openY: 55,  closeY: 85,  h: 100 },
    { x: 110, openY: 70,  closeY: 100, h: 115 },
    { x: 160, openY: 85,  closeY: 115, h: 130 },
    { x: 210, openY: 105, closeY: 130, h: 150 },
    { x: 260, openY: 115, closeY: 145, h: 160 },
    { x: 310, openY: 125, closeY: 155, h: 170 },
  ];
  return (
    <Frame animName="bear-cave" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, transparent 0%, ${accent}30 100%), radial-gradient(ellipse 80% 60% at 50% 100%, ${accent}35, transparent 60%)`,
      }} />
      {/* Fog drifting */}
      <div className="bear-fog" style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 30% 20% at 20% 80%, ${accent}40, transparent 60%), radial-gradient(ellipse 40% 30% at 70% 90%, ${accent}25, transparent 60%)`,
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d="M 20 30 Q 80 50 110 70 T 210 115 T 310 150 T 390 170"
          stroke={`${accent}aa`} strokeWidth="1.5" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${accent}80)` }} />
        {candles.map((c, i) => (
          <g key={i} className="bear-candle" style={{ ["--i" as string]: i }}>
            <line x1={c.x} y1={c.openY - 8} x2={c.x} y2={c.h} stroke={`${accent}bb`} strokeWidth="1.5" />
            <rect x={c.x - 8} y={c.openY} width="16" height={c.closeY - c.openY}
              fill={accent} opacity="0.9" rx="1.5"
              style={{ filter: `drop-shadow(0 0 3px ${accent}80)` }} />
          </g>
        ))}
        {/* Arrow down */}
        <g transform="translate(350, 135)">
          <path d="M 0 0 L 10 15 L 20 0 M 5 0 L 15 0" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        </g>
      </svg>
      <style>{`
        .banner-bear-cave .bear-fog { animation: bearFog 12s linear infinite; }
        .banner-bear-cave .bear-candle { animation: bearDrop 0.5s ease-in calc(var(--i) * 0.15s) backwards; }
        .banner-bear-cave:hover .bear-fog { animation-duration: 4s; opacity: 1.4; }
        .banner-bear-cave:hover .bear-candle { animation: bearPulse 0.8s ease-in-out calc(var(--i) * 0.1s) infinite; }
        @keyframes bearFog { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(25px) } }
        @keyframes bearDrop { from { transform: translateY(-12px) scaleY(0.3); opacity: 0 } to { transform: translateY(0) scaleY(1); opacity: 1 } }
        @keyframes bearPulse { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(2px) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   3. DIAMOND HANDS — diamante + 8 sparkles com twinkle
   ────────────────────────────────────────────────────── */
function DiamondHands({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="sparkle" className={className} />;
  const sparkles = Array.from({ length: 10 }, (_, i) => ({
    x: 40 + (i * 36) % 320 + (i % 3) * 10,
    y: 25 + ((i * 23) % 130),
    size: 2 + (i % 3),
    delay: (i * 0.35) % 2.5,
  }));
  return (
    <Frame animName="diamond-hands" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${accent}22 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 50% 50%, ${accent}28, transparent 70%)`,
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="diamondGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Diamante central */}
        <g className="diamond-shape" transform="translate(200, 90)">
          <polygon points="0,-40 28,-10 0,40 -28,-10" fill="url(#diamondGrad)" stroke={accent} strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 12px ${accent})` }} />
          <polygon points="0,-40 28,-10 0,-10 -28,-10" fill={accent} opacity="0.3" />
          <line x1="-28" y1="-10" x2="28" y2="-10" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.8" />
          <line x1="-14" y1="-25" x2="0" y2="-10" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.5" />
          <line x1="14" y1="-25" x2="0" y2="-10" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.5" />
        </g>
        {/* Sparkles */}
        {sparkles.map((s, i) => (
          <g key={i} className="diamond-sparkle" style={{ ["--delay" as string]: `${s.delay}s` }}>
            <path d={`M ${s.x} ${s.y - s.size * 2} L ${s.x + s.size / 3} ${s.y - s.size / 3} L ${s.x + s.size * 2} ${s.y} L ${s.x + s.size / 3} ${s.y + s.size / 3} L ${s.x} ${s.y + s.size * 2} L ${s.x - s.size / 3} ${s.y + s.size / 3} L ${s.x - s.size * 2} ${s.y} L ${s.x - s.size / 3} ${s.y - s.size / 3} Z`}
              fill="#ffffff" style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
          </g>
        ))}
      </svg>
      <style>{`
        .banner-diamond-hands .diamond-shape { animation: diaFloat 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .banner-diamond-hands .diamond-sparkle { animation: diaTwinkle 2.5s ease-in-out var(--delay) infinite; transform-origin: center; transform-box: fill-box; }
        .banner-diamond-hands:hover .diamond-shape { animation: diaSpin 3s linear infinite; }
        @keyframes diaFloat { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-4px) rotate(2deg) } }
        @keyframes diaSpin { from { transform: rotateY(0) } to { transform: rotateY(360deg) } }
        @keyframes diaTwinkle { 0%, 100% { opacity: 0; transform: scale(0.3) } 50% { opacity: 1; transform: scale(1.2) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   4. SMC WIZARD — OBs e FVG iluminando em sequência
   ────────────────────────────────────────────────────── */
function SmcWizard({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="zones" className={className} />;
  return (
    <Frame animName="smc-wizard" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, ${accent}18 0%, transparent 60%), radial-gradient(ellipse 80% 50% at 50% 50%, ${accent}22, transparent 70%)`,
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Price line serpenteando pelos OBs */}
        <path d="M 0 100 L 60 100 L 80 60 L 150 60 L 170 120 L 260 120 L 280 50 L 400 50"
          stroke={`${accent}80`} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${accent}60)` }} />
        {/* OB 1 (bullish) */}
        <g className="smc-ob" style={{ ["--i" as string]: 0 }}>
          <rect x="20" y="95" width="50" height="20" fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="1.5" rx="2" />
          <text x="45" y="109" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" fill={accent}>OB</text>
        </g>
        {/* FVG */}
        <g className="smc-ob" style={{ ["--i" as string]: 1 }}>
          <rect x="110" y="55" width="45" height="18" fill={accent} fillOpacity="0.35" strokeDasharray="3 2" stroke={accent} strokeWidth="1" rx="2" />
          <text x="132" y="68" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={accent}>FVG</text>
        </g>
        {/* OB 2 (bearish) */}
        <g className="smc-ob" style={{ ["--i" as string]: 2 }}>
          <rect x="195" y="115" width="55" height="18" fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="1.5" rx="2" />
          <text x="222" y="128" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" fill={accent}>OB</text>
        </g>
        {/* Target zone */}
        <g className="smc-ob" style={{ ["--i" as string]: 3 }}>
          <rect x="290" y="40" width="85" height="22" fill={accent} fillOpacity="0.3" stroke={accent} strokeWidth="1.5" strokeDasharray="4 3" rx="2" />
          <text x="332" y="55" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" fill={accent}>TARGET</text>
        </g>
        {/* Liquidity sweep marks */}
        <circle cx="170" cy="140" r="3" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
        <text x="170" y="160" textAnchor="middle" fontSize="7" fontFamily="monospace" fill={`${accent}aa`}>SSL</text>
      </svg>
      <style>{`
        .banner-smc-wizard .smc-ob { animation: smcFade 0.6s ease-out calc(var(--i) * 0.2s) backwards; }
        .banner-smc-wizard[data-anim="always"] .smc-ob { animation: smcFade 0.6s ease-out calc(var(--i) * 0.2s) backwards, smcGlow 5s ease-in-out calc(var(--i) * 0.5s) infinite 0.8s; }
        .banner-smc-wizard:hover .smc-ob { animation: smcGlow 1.2s ease-in-out calc(var(--i) * 0.15s) infinite; }
        @keyframes smcFade { from { opacity: 0; transform: scale(0.7) } to { opacity: 1; transform: scale(1) } }
        @keyframes smcGlow { 0%, 100% { opacity: 0.8 } 50% { opacity: 1; filter: brightness(1.4) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   5. LIQUIDITY HUNTER — sweep varrendo stops
   ────────────────────────────────────────────────────── */
function LiquidityHunter({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="sweep" className={className} />;
  return (
    <Frame animName="liquidity-hunter" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, transparent 0%, ${accent}20 100%)`,
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Equal lows line */}
        <line x1="40" y1="125" x2="360" y2="125" stroke={`${accent}80`} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="50" y="120" fontSize="10" fontFamily="monospace" fontWeight="bold" fill={accent}>SSL</text>
        {/* Stops (X marks) abaixo da linha */}
        {[70, 120, 170, 220, 270, 320].map((x, i) => (
          <g key={i} className="liq-stop" style={{ ["--i" as string]: i }}>
            <circle cx={x} cy="140" r="5" fill={accent} fillOpacity="0.15" stroke={`${accent}80`} strokeWidth="1" />
            <path d={`M ${x - 3} ${137} L ${x + 3} ${143} M ${x + 3} ${137} L ${x - 3} ${143}`} stroke={accent} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        ))}
        {/* Price path doing sweep + reversion */}
        <path d="M 0 60 Q 80 65 150 85 Q 250 110 280 145 Q 320 160 350 120 T 400 40"
          stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${accent}90)` }} />
        {/* Sweep line que se move horizontalmente */}
        <g className="liq-sweep">
          <line x1="0" y1="0" x2="0" y2="180" stroke={accent} strokeWidth="2" opacity="0.9"
            style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
          <line x1="0" y1="0" x2="0" y2="180" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
        </g>
      </svg>
      <style>{`
        .banner-liquidity-hunter .liq-sweep { animation: liqSweep 4s linear infinite; }
        .banner-liquidity-hunter:hover .liq-sweep { animation-duration: 1.5s; }
        .banner-liquidity-hunter .liq-stop { animation: liqStopAppear 0.4s ease-out calc(var(--i) * 0.1s + 0.5s) backwards; }
        @keyframes liqSweep { 0% { transform: translateX(-10px); opacity: 0 } 10%, 90% { opacity: 1 } 100% { transform: translateX(420px); opacity: 0 } }
        @keyframes liqStopAppear { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   6. BTC FIRE — Bitcoin logo + particulas de fogo subindo
   ────────────────────────────────────────────────────── */
function BtcFire({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="fire" className={className} />;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: 150 + (i * 13) % 100,
    size: 2 + (i % 3),
    delay: (i * 0.2) % 3,
    duration: 2 + (i % 3) * 0.5,
  }));
  return (
    <Frame animName="btc-fire" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 50% 80% at 50% 100%, ${accent}45, transparent 60%), linear-gradient(180deg, transparent 0%, ${accent}18 100%)`,
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Fire particles */}
        {particles.map((p, i) => (
          <circle
            key={i} className="btc-particle"
            cx={p.x} cy="180" r={p.size}
            fill={accent}
            style={{
              filter: `drop-shadow(0 0 4px ${accent})`,
              ["--delay" as string]: `${p.delay}s`,
              ["--duration" as string]: `${p.duration}s`,
            } as React.CSSProperties}
          />
        ))}
        {/* BTC logo center */}
        <g className="btc-logo" transform="translate(200, 85)">
          <circle r="40" fill={accent} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 16px ${accent})` }} />
          <circle r="38" fill="none" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="0.5" />
          <text x="0" y="12" textAnchor="middle" fontSize="42" fontFamily="serif" fontWeight="bold" fill="#ffffff">₿</text>
        </g>
        {/* Chart arrow up */}
        <path d="M 50 140 L 90 120 L 120 100 L 160 80" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M 240 80 L 280 60 L 320 50 L 360 30" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      </svg>
      <style>{`
        .banner-btc-fire .btc-logo { transform-origin: center; transform-box: fill-box; animation: btcFloat 3s ease-in-out infinite; }
        .banner-btc-fire:hover .btc-logo { animation: btcSpin 2s linear infinite; }
        .banner-btc-fire .btc-particle { animation: btcRise var(--duration, 2.5s) ease-out var(--delay, 0s) infinite; }
        .banner-btc-fire:hover .btc-particle { animation-duration: 1.2s; }
        @keyframes btcFloat { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes btcSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes btcRise { 0% { transform: translateY(0) scale(1); opacity: 0 } 15% { opacity: 1 } 100% { transform: translateY(-200px) scale(0.2); opacity: 0 } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   7. JUDAS SWING — fake out + reversão violenta
   ────────────────────────────────────────────────────── */
function JudasSwing({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="zigzag" className={className} />;
  return (
    <Frame animName="judas-swing" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${accent}22 0%, transparent 60%)`,
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Horizontal mid line reference */}
        <line x1="0" y1="90" x2="400" y2="90" stroke={`${accent}30`} strokeWidth="0.5" strokeDasharray="4 4" />
        {/* Fake-out path (downward trap) */}
        <path className="judas-fake" d="M 0 90 L 60 95 L 120 130 L 180 155" stroke={`${accent}60`} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="4 3" opacity="0.7" />
        {/* Real path (reversal up) */}
        <path className="judas-real" d="M 180 155 Q 200 130 220 100 L 280 60 L 340 25 L 400 10" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        {/* X mark on fake bottom */}
        <g className="judas-mark-x" transform="translate(180, 155)">
          <circle r="7" fill={`${accent}25`} stroke={`${accent}90`} strokeWidth="1.2" />
          <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        </g>
        {/* Rocket on real top */}
        <g className="judas-mark-check" transform="translate(400, 10)">
          <circle r="9" fill={accent} stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.2"
            style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
          <path d="M -3 0 L -1 2 L 4 -3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        {/* Labels */}
        <text x="100" y="175" fontSize="8" fontFamily="monospace" fill={`${accent}a0`}>JUDAS</text>
        <text x="290" y="20" fontSize="9" fontFamily="monospace" fontWeight="bold" fill={accent}>REAL MOVE</text>
      </svg>
      <style>{`
        .banner-judas-swing .judas-fake { stroke-dasharray: 250; stroke-dashoffset: 250; animation: judasDrawFake 3s ease-out infinite; }
        .banner-judas-swing .judas-real { stroke-dasharray: 300; stroke-dashoffset: 300; animation: judasDrawReal 3s ease-out infinite 1s; }
        .banner-judas-swing .judas-mark-x { animation: judasMarkX 3s ease-out infinite; }
        .banner-judas-swing .judas-mark-check { animation: judasMarkCheck 3s ease-out infinite 1.8s; }
        .banner-judas-swing:hover .judas-fake, .banner-judas-swing:hover .judas-real { animation-duration: 1.8s; }
        @keyframes judasDrawFake { 0% { stroke-dashoffset: 250 } 30%, 100% { stroke-dashoffset: 0 } }
        @keyframes judasDrawReal { 0%, 15% { stroke-dashoffset: 300 } 60%, 100% { stroke-dashoffset: 0 } }
        @keyframes judasMarkX { 0%, 30% { opacity: 0; transform: translate(180px, 155px) scale(0) } 40%, 100% { opacity: 1; transform: translate(180px, 155px) scale(1) } }
        @keyframes judasMarkCheck { 0%, 40% { opacity: 0; transform: translate(400px, 10px) scale(0) } 55%, 100% { opacity: 1; transform: translate(400px, 10px) scale(1) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   8. DEGEN NIGHTS — grid cyberpunk neon + pulse circuits
   ────────────────────────────────────────────────────── */
function DegenNights({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="neon" className={className} />;
  const nodes = [
    { x: 50,  y: 60  }, { x: 130, y: 40  }, { x: 210, y: 70  }, { x: 280, y: 50  }, { x: 350, y: 90  },
    { x: 90,  y: 140 }, { x: 170, y: 120 }, { x: 250, y: 145 }, { x: 320, y: 130 }, { x: 150, y: 80  },
  ];
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [2, 6], [6, 9], [9, 1], [4, 8], [7, 8], [5, 6], [6, 7]];
  return (
    <Frame animName="degen-nights" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 80% at 20% 30%, ${accent}30, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, ${accent}25, transparent 60%), #0a0a0c`,
      }} />
      {/* Grid hexagonal de fundo */}
      <div className="degen-grid" style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${accent}12 1px, transparent 1px), linear-gradient(90deg, ${accent}12 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
      }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Edges */}
        {edges.map(([a, b], i) => (
          <line key={i} className="degen-edge"
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke={accent} strokeWidth="1.2" opacity="0.4"
            style={{ ["--i" as string]: i, filter: `drop-shadow(0 0 3px ${accent})` }}
          />
        ))}
        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={i} className="degen-node" style={{ ["--i" as string]: i }}>
            <circle cx={n.x} cy={n.y} r="4" fill={accent} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
            <circle cx={n.x} cy={n.y} r="7" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.5" className="degen-node-ring" />
          </g>
        ))}
        <text x="200" y="175" textAnchor="middle" fontSize="8" fontFamily="monospace" fill={`${accent}80`} letterSpacing="3">DEGEN.SYS</text>
      </svg>
      <style>{`
        .banner-degen-nights .degen-edge { animation: degenPulse 3s ease-in-out calc(var(--i) * 0.15s) infinite; }
        .banner-degen-nights .degen-node-ring { animation: degenRing 2s ease-out calc(var(--i) * 0.2s) infinite; transform-origin: center; transform-box: fill-box; }
        .banner-degen-nights:hover .degen-edge { animation-duration: 1.2s; opacity: 0.9; }
        .banner-degen-nights:hover .degen-node-ring { animation-duration: 1s; }
        @keyframes degenPulse { 0%, 100% { opacity: 0.3 } 50% { opacity: 0.9; filter: brightness(1.3) drop-shadow(0 0 6px var(--banner-accent, ${accent})); } }
        @keyframes degenRing { 0% { transform: scale(1); opacity: 0.8 } 100% { transform: scale(2.5); opacity: 0 } }
      `}</style>
    </Frame>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TAROT v3 — banners arcanos adaptados pro nicho trade/crypto
   ═════════════════════════════════════════════════════════════════════ */

function ATorreFlash({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="torre" className={className} />;
  return (
    <Frame animName="a-torre-flash" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${accent}15 0%, #1a0a0a 100%)` }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Torre quebrando */}
        <g transform="translate(180, 20) rotate(15)">
          <rect x="-18" y="0" width="36" height="80" fill="#1f2937" stroke={accent} strokeWidth="0.8" />
          <rect x="-18" y="0" width="36" height="10" fill={accent} opacity="0.3" />
          <line x1="-18" y1="25" x2="18" y2="40" stroke={accent} strokeWidth="1" opacity="0.5" />
          <line x1="18" y1="25" x2="-18" y2="50" stroke={accent} strokeWidth="1" opacity="0.5" />
          {/* Rachaduras */}
          <path d="M -5 10 L 3 30 L -3 50 L 5 80" stroke="#fbbf24" strokeWidth="0.8" fill="none" opacity="0.7" />
        </g>
        {/* Raios */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} className="torre-bolt" d={`M ${80 + i * 90} 10 L ${72 + i * 90} 40 L ${82 + i * 90} 45 L ${70 + i * 90} 80`}
            stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"
            style={{ ["--i" as string]: i, filter: `drop-shadow(0 0 6px ${accent})` }} />
        ))}
        {/* Velas vermelhas caindo */}
        {[30, 80, 240, 310, 350].map((x, i) => (
          <g key={i} className="torre-candle" style={{ ["--i" as string]: i }}>
            <rect x={x - 4} y={130} width="8" height="28" fill="#EF4444" opacity="0.7" rx="1" />
            <line x1={x} y1={125} x2={x} y2={160} stroke="#EF4444" strokeWidth="1" opacity="0.5" />
          </g>
        ))}
        <text x="200" y="172" textAnchor="middle" fontSize="8" fontFamily="serif" letterSpacing="3" fill={`${accent}90`}>XVI · A TORRE</text>
      </svg>
      <style>{`
        .banner-a-torre-flash .torre-bolt { animation: torreBolt 2.5s ease-in-out calc(var(--i) * 0.3s) infinite; }
        .banner-a-torre-flash .torre-candle { animation: torreFall 0.8s ease-in calc(var(--i) * 0.15s) backwards; }
        .banner-a-torre-flash[data-anim="always"] .torre-bolt { animation: torreBolt 1.2s ease-in-out calc(var(--i) * 0.15s) infinite; }
        .banner-a-torre-flash[data-anim="always"]:hover .torre-bolt, .banner-a-torre-flash[data-anim="hover"]:hover .torre-bolt { animation: torreBolt 0.4s ease-in-out calc(var(--i) * 0.05s) infinite; }
        @keyframes torreBolt { 0%, 40%, 100% { opacity: 0 } 45%, 55% { opacity: 1 } }
        @keyframes torreFall { from { transform: translateY(-40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </Frame>
  );
}

function OSolBull({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="sol" className={className} />;
  const rays = Array.from({ length: 16 }, (_, i) => ({ angle: i * (360 / 16) }));
  return (
    <Frame animName="o-sol-bull" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${accent}35, transparent 70%), linear-gradient(180deg, ${accent}08 0%, transparent 70%)` }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <g className="sol-rays" transform="translate(200, 85)">
          {rays.map((r, i) => (
            <line key={i} x1="0" y1="-40" x2="0" y2="-68" stroke={accent} strokeWidth="2" strokeLinecap="round" transform={`rotate(${r.angle})`} opacity="0.7"
              style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
          ))}
        </g>
        <circle cx="200" cy="85" r="30" fill={accent} opacity="0.85" style={{ filter: `drop-shadow(0 0 18px ${accent})` }} />
        <circle cx="200" cy="85" r="28" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
        {/* Números verdes subindo */}
        {["+2.4%", "+0.8%", "+5.1%", "+1.7%"].map((n, i) => (
          <text key={i} className="sol-price" x={30 + i * 110} y={155} fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#10B981"
            style={{ ["--i" as string]: i, filter: "drop-shadow(0 0 4px #10B98180)" }}>{n}</text>
        ))}
        <text x="200" y="172" textAnchor="middle" fontSize="8" fontFamily="serif" letterSpacing="3" fill={`${accent}a0`}>XIX · O SOL</text>
      </svg>
      <style>{`
        .banner-o-sol-bull .sol-rays { transform-origin: center; transform-box: fill-box; }
        .banner-o-sol-bull .sol-price { animation: solPrice 2.5s ease-out calc(var(--i) * 0.3s) infinite; }
        .banner-o-sol-bull[data-anim="always"] .sol-rays { animation: solSpin 20s linear infinite; }
        .banner-o-sol-bull[data-anim="always"]:hover .sol-rays, .banner-o-sol-bull[data-anim="hover"]:hover .sol-rays { animation: solSpin 4s linear infinite; }
        @keyframes solSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        @keyframes solPrice { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(-20px); opacity: 0 } }
      `}</style>
    </Frame>
  );
}

function ATemperancaRr({ variant, animated, accent, className }: BannerChildProps) {
  if (variant === "strip") return <StripAccent accent={accent} pattern="balanca" className={className} />;
  return (
    <Frame animName="a-temperanca-rr" variant={variant} animated={animated} accent={accent} className={className}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${accent}25, transparent 65%), linear-gradient(135deg, ${accent}10 0%, transparent 60%)` }} />
      <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Pedestal vertical */}
        <line x1="200" y1="40" x2="200" y2="140" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="200" cy="40" r="5" fill={accent} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        {/* Barra da balança */}
        <g className="balanca-bar" transform="translate(200, 50)">
          <line x1="-90" y1="0" x2="90" y2="0" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          {/* Lado esquerdo: 1R (pequeno) */}
          <line x1="-90" y1="0" x2="-90" y2="30" stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
          <rect x="-108" y="30" width="36" height="18" fill="#EF4444" opacity="0.6" stroke="#EF4444" strokeWidth="1" rx="2" />
          <text x="-90" y="42" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#ffffff">1R</text>
          {/* Lado direito: 3R (grande) */}
          <line x1="90" y1="0" x2="90" y2="50" stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
          <rect x="65" y="50" width="50" height="34" fill="#10B981" opacity="0.7" stroke="#10B981" strokeWidth="1" rx="2"
            style={{ filter: "drop-shadow(0 0 6px #10B98180)" }} />
          <text x="90" y="70" textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="bold" fill="#ffffff">3R</text>
        </g>
        <text x="200" y="170" textAnchor="middle" fontSize="8" fontFamily="serif" letterSpacing="3" fill={`${accent}a0`}>XIV · A TEMPERANÇA</text>
      </svg>
      <style>{`
        .banner-a-temperanca-rr .balanca-bar { transform-origin: 200px 50px; transform-box: view-box; }
        .banner-a-temperanca-rr[data-anim="always"] .balanca-bar { animation: balancaTilt 5s ease-in-out infinite; }
        .banner-a-temperanca-rr[data-anim="always"]:hover .balanca-bar, .banner-a-temperanca-rr[data-anim="hover"]:hover .balanca-bar { animation: balancaTilt 1.5s ease-in-out infinite; }
        @keyframes balancaTilt { 0%, 100% { transform: rotate(-2deg) } 50% { transform: rotate(3deg) } }
      `}</style>
    </Frame>
  );
}

/* ──────────────────────────────────────────────────────────
   StripAccent — variant "strip" (40px) pra posts: só cor + shine
   ────────────────────────────────────────────────────── */
function StripAccent({ accent, pattern, className }: { accent: string; pattern: string; className?: string }) {
  return (
    <div className={`strip-accent strip-${pattern} ${className ?? ""}`} style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(90deg, ${accent}10 0%, ${accent}40 50%, ${accent}10 100%)`,
      overflow: "hidden",
    }}>
      <div className="strip-shine" style={{
        position: "absolute", top: 0, bottom: 0, width: "30%",
        background: `linear-gradient(90deg, transparent 0%, ${accent}80 50%, transparent 100%)`,
      }} />
      <style>{`
        .strip-shine { animation: stripShine 4s ease-in-out infinite; }
        @keyframes stripShine { 0% { left: -30% } 100% { left: 100% } }
      `}</style>
    </div>
  );
}
