"use client";

import React from "react";
import { Avatar } from "./Avatar";

/* ────────────────────────────────────────────────────────────────────────────
   Avatar Cosmetics — Frames + Auras (efeitos luminosos)

   Frames: decorações ao redor do avatar (chifres, coroa, asas, halo).
   Auras:  efeitos pulsantes/partículas atrás do avatar.

   AvatarWithCosmetics envolve o Avatar base com ambos, se fornecidos.
   Cada slug vira um componente SVG + CSS animation próprio.
   Tudo escalado pelo prop `size` — se muda tamanho do avatar, cosméticos
   seguem proporcional.
   ──────────────────────────────────────────────────────────── */

export type FrameSlug =
  | "urso-garras" | "cartola-wall" | "halo-hodler"
  | "laurel-mesa" | "coroa-diamante" | "pix-ring"
  // Tarot v3
  | "arcano-solar" | "arcano-lunar" | "arcano-estelar" | "pentagrama";

export type AuraSlug =
  | "fogo-btc" | "verde-lucro" | "vermelho-rekt" | "matrix-rain"
  | "neon-ring" | "dourada-payout" | "cosmos"
  // Tarot v3
  | "runas-orbital" | "energia-arcana"
  | "sombras" | "luz-divina" | "portal-etereo";

const FRAME_ACCENT: Record<FrameSlug, string> = {
  "urso-garras": "#EF4444", "cartola-wall": "#F59E0B", "halo-hodler": "#FFD700",
  "laurel-mesa": "#10B981", "coroa-diamante": "#06B6D4", "pix-ring": "#00D4FF",
  // Tarot
  "arcano-solar": "#F59E0B", "arcano-lunar": "#06B6D4", "arcano-estelar": "#8B5CF6",
  "pentagrama": "#DC2626",
};

const AURA_ACCENT: Record<AuraSlug, string> = {
  "fogo-btc": "#F7931A", "verde-lucro": "#10B981",
  "vermelho-rekt": "#EF4444", "matrix-rain": "#06B6D4",
  "neon-ring": "#EC4899", "dourada-payout": "#F59E0B",
  "cosmos": "#A855F7",
  // Tarot
  "runas-orbital": "#06B6D4", "energia-arcana": "#EC4899",
  "sombras": "#7F1D1D", "luz-divina": "#FBBF24", "portal-etereo": "#8B5CF6",
};

/** Normaliza slug vindo do DB — remove prefixo "frame-"/"effect-" pra casar com enum */
export function normalizeFrameSlug(s: string | null | undefined): FrameSlug | null {
  if (!s) return null;
  const bare = s.replace(/^frame-/, "");
  return (Object.keys(FRAME_ACCENT) as FrameSlug[]).includes(bare as FrameSlug) ? (bare as FrameSlug) : null;
}
export function normalizeAuraSlug(s: string | null | undefined): AuraSlug | null {
  if (!s) return null;
  const bare = s.replace(/^effect-/, "");
  return (Object.keys(AURA_ACCENT) as AuraSlug[]).includes(bare as AuraSlug) ? (bare as AuraSlug) : null;
}

/** Mesma semântica do AnimMode em CosmeticBanner:
 *  - "always": loop ambient + hover boost (modal, perfil — poucas instâncias)
 *  - "hover":  estático até hover (DEFAULT pra listas)
 *  - "off":    nenhuma animação */
export type AnimMode = "always" | "hover" | "off";

interface WrapperProps {
  src: string | null | undefined;
  name: string;
  size?: number;
  frameSlug?: string | null;
  auraSlug?: string | null;
  className?: string;
  animated?: AnimMode;
  /** @deprecated use `animated` */
  interactive?: boolean;
}

export function AvatarWithCosmetics({
  src, name, size = 48, frameSlug, auraSlug, className, animated, interactive,
}: WrapperProps) {
  const frame = normalizeFrameSlug(frameSlug);
  const aura = normalizeAuraSlug(auraSlug);

  // Compat: interactive={false} (legado "sempre anima") → always; sem nada = hover
  const anim: AnimMode = animated ?? (interactive === false ? "always" : "hover");

  // Padding reserva espaço pros overlays (halo, chifres, asas, partículas).
  // Frames que projetam acima/abaixo do avatar precisam de ~30% extra;
  // auras irradiam em volta e precisam de ~40% extra.
  const padding = Math.round(size * 0.35);
  const total = size + padding * 2;

  return (
    <div
      className={`relative inline-block av-cos-wrap ${className ?? ""}`}
      data-anim={anim}
      style={{ width: total, height: total }}
    >
      {/* Aura (trás) */}
      {aura && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <AuraVariant slug={aura} size={total} />
        </div>
      )}
      {/* Avatar (centro) */}
      <div className="absolute" style={{ top: padding, left: padding, width: size, height: size, zIndex: 1 }}>
        <Avatar src={src ?? ""} name={name} size={size} className="rounded-full ring-2 ring-[#0e0e10]" />
      </div>
      {/* Frame (frente) */}
      {frame && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <FrameVariant slug={frame} size={total} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FRAMES (8)
   ═══════════════════════════════════════════════════════════════════════ */

function FrameVariant({ slug, size }: { slug: FrameSlug; size: number }) {
  const accent = FRAME_ACCENT[slug];
  const props = { size, accent };
  switch (slug) {
    case "urso-garras":    return <FrameUrsoGarras    {...props} />;
    case "cartola-wall":   return <FrameCartolaWall   {...props} />;
    case "halo-hodler":    return <FrameHaloHodler    {...props} />;
    case "laurel-mesa":    return <FrameLaurelMesa    {...props} />;
    case "coroa-diamante": return <FrameCoroaDiamante {...props} />;
    case "pix-ring":       return <FramePixRing       {...props} />;
    // Tarot v3
    case "arcano-solar":   return <FrameArcanoSolar   {...props} />;
    case "arcano-lunar":   return <FrameArcanoLunar   {...props} />;
    case "arcano-estelar": return <FrameArcanoEstelar {...props} />;
    case "pentagrama":     return <FramePentagrama    {...props} />;
  }
}

function FrameTouroChifres({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-touro">
      {/* Chifre esquerdo */}
      <path d="M 35 18 Q 25 6 22 2 Q 30 14 38 22" fill={accent} stroke="#8B4513" strokeWidth="0.8" opacity="0.95"
        style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      {/* Chifre direito */}
      <path d="M 65 18 Q 75 6 78 2 Q 70 14 62 22" fill={accent} stroke="#8B4513" strokeWidth="0.8" opacity="0.95"
        style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      <style>{`.frame-touro { animation: touroSway 4s ease-in-out infinite; transform-origin: center bottom; } @keyframes touroSway { 0%, 100% { transform: rotate(-1deg) } 50% { transform: rotate(1deg) } } .av-cos-wrap[data-anim="always"]:hover .frame-touro, .av-cos-wrap[data-anim="hover"]:hover .frame-touro { animation-duration: 1.5s; }`}</style>
    </svg>
  );
}

function FrameUrsoGarras({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {[
        { x: 18, y: 22, r: -45 },  // top-left
        { x: 82, y: 22, r: 45 },   // top-right
        { x: 18, y: 78, r: -135 }, // bottom-left
        { x: 82, y: 78, r: 135 },  // bottom-right
      ].map((c, i) => (
        <g key={i} className="garra" transform={`translate(${c.x}, ${c.y}) rotate(${c.r})`} style={{ ["--i" as string]: i }}>
          <path d="M 0 0 L 5 8 M 0 0 L 0 10 M 0 0 L -5 8" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 0 0 L 5 8 M 0 0 L 0 10 M 0 0 L -5 8" stroke={accent} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      ))}
      <style>{`.garra { animation: garraFlex 3s ease-in-out calc(var(--i) * 0.2s) infinite; transform-origin: center; transform-box: fill-box; } @keyframes garraFlex { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.15) } } .av-cos-wrap[data-anim="always"]:hover .garra, .av-cos-wrap[data-anim="hover"]:hover .garra { animation-duration: 1s; }`}</style>
    </svg>
  );
}

function FrameCartolaWall({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-cartola">
      <g transform="translate(50, 12)">
        <ellipse cx="0" cy="8" rx="18" ry="2.5" fill="#1a1a1a" />
        <rect x="-14" y="-8" width="28" height="16" fill="#0a0a0a" stroke={accent} strokeWidth="0.6" rx="0.5" />
        <rect x="-14" y="4" width="28" height="2" fill={accent} opacity="0.9" />
        <circle cx="-11" cy="-2" r="1.2" fill={accent} opacity="0.6" />
      </g>
      <style>{`.frame-cartola { animation: cartolaTilt 5s ease-in-out infinite; transform-origin: 50% 15%; } @keyframes cartolaTilt { 0%, 100% { transform: rotate(-2deg) } 50% { transform: rotate(2deg) } } .av-cos-wrap[data-anim="always"]:hover .frame-cartola, .av-cos-wrap[data-anim="hover"]:hover .frame-cartola { animation-duration: 1.5s; }`}</style>
    </svg>
  );
}

function FrameHaloHodler({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-halo">
      <ellipse cx="50" cy="10" rx="24" ry="5" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.9"
        style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
      <ellipse cx="50" cy="10" rx="20" ry="3.5" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
      <style>{`.frame-halo { animation: haloFloat 3s ease-in-out infinite; transform-origin: 50% 10%; } @keyframes haloFloat { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-2px) } } .av-cos-wrap[data-anim="always"]:hover .frame-halo, .av-cos-wrap[data-anim="hover"]:hover .frame-halo { animation: haloSpin 2s linear infinite; }  @keyframes haloSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function FrameLaurelMesa({ size, accent }: { size: number; accent: string }) {
  const leaves = [
    // Esquerda
    { x: 15, y: 45, r: -30 }, { x: 12, y: 55, r: -15 }, { x: 15, y: 65, r: 0 },
    { x: 20, y: 75, r: 15 }, { x: 28, y: 83, r: 30 },
    // Direita
    { x: 85, y: 45, r: 30 }, { x: 88, y: 55, r: 15 }, { x: 85, y: 65, r: 0 },
    { x: 80, y: 75, r: -15 }, { x: 72, y: 83, r: -30 },
  ];
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-laurel">
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x}, ${l.y}) rotate(${l.r})`}>
          <ellipse rx="3.5" ry="1.5" fill={accent} opacity="0.9" />
          <ellipse rx="3" ry="1" fill="#ffffff" opacity="0.2" />
        </g>
      ))}
      {/* "$" no topo */}
      <g transform="translate(50, 8)">
        <circle r="7" fill={accent} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        <text textAnchor="middle" y="3.5" fontSize="10" fontWeight="bold" fontFamily="serif" fill="#ffffff">$</text>
      </g>
      <style>{`.frame-laurel { animation: laurelGlow 3s ease-in-out infinite; } @keyframes laurelGlow { 0%, 100% { filter: brightness(1) } 50% { filter: brightness(1.3) } } .av-cos-wrap[data-anim="always"]:hover .frame-laurel, .av-cos-wrap[data-anim="hover"]:hover .frame-laurel { animation-duration: 1.2s; }`}</style>
    </svg>
  );
}

function FrameCoroaDiamante({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-coroa">
      <g transform="translate(50, 10)">
        {/* Base da coroa */}
        <path d="M -16 4 L -14 -6 L -8 2 L -4 -10 L 0 0 L 4 -10 L 8 2 L 14 -6 L 16 4 Z"
          fill={accent} stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5"
          style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
        {/* Diamantes */}
        {[-8, 0, 8].map((x, i) => (
          <polygon key={i} className="coroa-diamond" points={`${x},-11 ${x + 2},-8 ${x},-5 ${x - 2},-8`}
            fill="#ffffff" style={{ ["--i" as string]: i, filter: `drop-shadow(0 0 3px ${accent})` }} />
        ))}
      </g>
      <style>{`.coroa-diamond { animation: coroaTwinkle 2s ease-in-out calc(var(--i) * 0.3s) infinite; transform-origin: center; transform-box: fill-box; } @keyframes coroaTwinkle { 0%, 100% { opacity: 0.7; transform: scale(1) } 50% { opacity: 1; transform: scale(1.3) } } .av-cos-wrap[data-anim="always"]:hover .coroa-diamond, .av-cos-wrap[data-anim="hover"]:hover .coroa-diamond { animation-duration: 0.7s; }`}</style>
    </svg>
  );
}

function FrameAsasTouro({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {/* Asa esquerda */}
      <g className="asa asa-l">
        <path d="M 15 50 Q 0 40 -5 55 Q 0 60 10 58 Q 4 52 8 48 M 15 55 Q 3 52 -3 62 Q 3 66 12 62 M 18 60 Q 8 60 4 68 Q 10 70 17 66"
          fill={accent} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.4" opacity="0.9"
          style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
      </g>
      {/* Asa direita */}
      <g className="asa asa-r">
        <path d="M 85 50 Q 100 40 105 55 Q 100 60 90 58 Q 96 52 92 48 M 85 55 Q 97 52 103 62 Q 97 66 88 62 M 82 60 Q 92 60 96 68 Q 90 70 83 66"
          fill={accent} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.4" opacity="0.9"
          style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
      </g>
      <style>{`.asa { animation: asaFlap 3s ease-in-out infinite; transform-box: fill-box; } .asa-l { transform-origin: right center; } .asa-r { transform-origin: left center; } @keyframes asaFlap { 0%, 100% { transform: scaleY(1) } 50% { transform: scaleY(0.7) } } .av-cos-wrap[data-anim="always"]:hover .asa, .av-cos-wrap[data-anim="hover"]:hover .asa { animation-duration: 0.8s; }`}</style>
    </svg>
  );
}

function FramePixRing({ size, accent }: { size: number; accent: string }) {
  const blocks = Array.from({ length: 6 }, (_, i) => ({ angle: (i * 360) / 6, delay: i * 0.15 }));
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-pix">
      {blocks.map((b, i) => (
        <g key={i} transform={`rotate(${b.angle}, 50, 50) translate(50, 4)`} style={{ ["--delay" as string]: `${b.delay}s` }}>
          <rect className="pix-block" x="-3" y="-3" width="6" height="6" fill={accent} rx="0.8"
            style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
        </g>
      ))}
      <style>{`.frame-pix { animation: pixRotate 10s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .frame-pix, .av-cos-wrap[data-anim="hover"]:hover .frame-pix { animation-duration: 3s; } .pix-block { animation: pixBlink 1.5s ease-in-out var(--delay) infinite; } @keyframes pixRotate { from { transform: rotate(0) } to { transform: rotate(360deg) } } @keyframes pixBlink { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AURAS (8)
   ═══════════════════════════════════════════════════════════════════════ */

function AuraVariant({ slug, size }: { slug: AuraSlug; size: number }) {
  const accent = AURA_ACCENT[slug];
  const props = { size, accent };
  switch (slug) {
    case "fogo-btc":        return <AuraFogoBtc       {...props} />;
    case "verde-lucro":     return <AuraVerdeLucro    {...props} />;
    case "vermelho-rekt":   return <AuraVermelhoRekt  {...props} />;
    case "matrix-rain":     return <AuraMatrixRain    {...props} />;
    case "neon-ring":       return <AuraNeonRing      {...props} />;
    case "dourada-payout":  return <AuraDouradaPayout {...props} />;
    case "cosmos":          return <AuraCosmos        {...props} />;
    // Tarot v3
    case "runas-orbital":    return <AuraRunasOrbital  {...props} />;
    case "energia-arcana":   return <AuraEnergiaArcana {...props} />;
    case "sombras":          return <AuraSombras       {...props} />;
    case "luz-divina":       return <AuraLuzDivina     {...props} />;
    case "portal-etereo":    return <AuraPortalEtereo  {...props} />;
  }
}

function AuraFogoBtc({ size, accent }: { size: number; accent: string }) {
  const particles = Array.from({ length: 10 }, (_, i) => ({ a: (i * 36), delay: (i * 0.25) % 2 }));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="aura-fogo-pulse" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}40 30%, transparent 65%)`,
      }} />
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {particles.map((p, i) => (
          <circle key={i} className="fogo-particle" cx={50 + Math.cos(p.a * Math.PI / 180) * 38} cy={50 + Math.sin(p.a * Math.PI / 180) * 38}
            r="2" fill={accent}
            style={{ ["--delay" as string]: `${p.delay}s`, filter: `drop-shadow(0 0 3px ${accent})` }} />
        ))}
      </svg>
      <style>{`.aura-fogo-pulse { animation: fogoPulse 2s ease-in-out infinite; } .fogo-particle { animation: fogoRise 2s ease-out var(--delay) infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .aura-fogo-pulse, .av-cos-wrap[data-anim="hover"]:hover .aura-fogo-pulse { animation-duration: 0.8s; } @keyframes fogoPulse { 0%, 100% { opacity: 0.6; transform: scale(1) } 50% { opacity: 1; transform: scale(1.1) } } @keyframes fogoRise { 0% { opacity: 0; transform: scale(1) translateY(0) } 20% { opacity: 1 } 100% { opacity: 0; transform: scale(0.3) translateY(-12px) } }`}</style>
    </div>
  );
}

function AuraVerdeLucro({ size, accent }: { size: number; accent: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="aura-verde-shimmer" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}50 30%, ${accent}15 55%, transparent 70%)`,
      }} />
      <style>{`.aura-verde-shimmer { animation: verdeShimmer 3s ease-in-out infinite; } .av-cos-wrap[data-anim="always"]:hover .aura-verde-shimmer, .av-cos-wrap[data-anim="hover"]:hover .aura-verde-shimmer { animation-duration: 1s; } @keyframes verdeShimmer { 0%, 100% { opacity: 0.7; filter: brightness(1) } 50% { opacity: 1; filter: brightness(1.4) } }`}</style>
    </div>
  );
}

function AuraVermelhoRekt({ size, accent }: { size: number; accent: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="aura-rekt" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}50 25%, transparent 60%)`,
      }} />
      <style>{`.aura-rekt { animation: rektGlitch 1.5s steps(4) infinite; } .av-cos-wrap[data-anim="always"]:hover .aura-rekt, .av-cos-wrap[data-anim="hover"]:hover .aura-rekt { animation-duration: 0.4s; } @keyframes rektGlitch { 0% { transform: translate(0, 0) } 25% { transform: translate(-1px, 1px) } 50% { transform: translate(1px, -1px) } 75% { transform: translate(-1px, -1px) } 100% { transform: translate(0, 0) } }`}</style>
    </div>
  );
}

function AuraMatrixRain({ size, accent }: { size: number; accent: string }) {
  const cols = Array.from({ length: 8 }, (_, i) => ({ x: 10 + i * 11, delay: (i * 0.2) % 2, dur: 2 + (i % 3) * 0.3 }));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}25, transparent 70%)`,
        maskImage: "radial-gradient(circle, black 30%, transparent 65%)",
        WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 65%)",
      }} />
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {cols.map((c, i) => (
          <text key={i} className="matrix-col" x={c.x} y="0" fontSize="7" fontFamily="monospace" fill={accent}
            style={{ ["--delay" as string]: `${c.delay}s`, ["--dur" as string]: `${c.dur}s`, filter: `drop-shadow(0 0 2px ${accent})` }}>
            ₿Ξ0110
          </text>
        ))}
      </svg>
      <style>{`.matrix-col { animation: matrixDrop var(--dur) linear var(--delay) infinite; } .av-cos-wrap[data-anim="always"]:hover .matrix-col, .av-cos-wrap[data-anim="hover"]:hover .matrix-col { animation-duration: calc(var(--dur) * 0.5); } @keyframes matrixDrop { 0% { transform: translateY(-20px); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(110px); opacity: 0 } }`}</style>
    </div>
  );
}

function AuraNeonRing({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={accent} strokeWidth="3" opacity="0.4" className="neon-ring-outer" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.8" className="neon-ring-inner"
        style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
      <style>{`.neon-ring-outer { animation: neonPulseOuter 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; } .neon-ring-inner { animation: neonPulseInner 2s ease-in-out infinite; } .av-cos-wrap[data-anim="always"]:hover .neon-ring-outer, .av-cos-wrap[data-anim="hover"]:hover .neon-ring-outer, .av-cos-wrap[data-anim="always"]:hover .neon-ring-inner, .av-cos-wrap[data-anim="hover"]:hover .neon-ring-inner { animation-duration: 0.6s; } @keyframes neonPulseOuter { 0%, 100% { opacity: 0.3; transform: scale(1) } 50% { opacity: 0.7; transform: scale(1.05) } } @keyframes neonPulseInner { 0%, 100% { opacity: 0.8; filter: brightness(1) drop-shadow(0 0 4px currentColor) } 50% { opacity: 1; filter: brightness(1.5) drop-shadow(0 0 10px currentColor) } }`}</style>
    </svg>
  );
}

function AuraDouradaPayout({ size, accent }: { size: number; accent: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => ({ angle: (i * 360) / 12 }));
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <defs>
        <radialGradient id="douradaGrad"><stop offset="20%" stopColor={accent} stopOpacity="0.6" /><stop offset="70%" stopColor={accent} stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#douradaGrad)" className="dourada-bg" />
      <g className="dourada-rays">
        {rays.map((r, i) => (
          <line key={i} x1="50" y1="50" x2="50" y2="8" stroke={accent} strokeWidth="1.5" opacity="0.6" transform={`rotate(${r.angle}, 50, 50)`} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
        ))}
      </g>
      <style>{`.dourada-bg { animation: douradaBg 3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; } .dourada-rays { animation: douradaRays 12s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .dourada-rays, .av-cos-wrap[data-anim="hover"]:hover .dourada-rays { animation-duration: 3s; } @keyframes douradaBg { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } } @keyframes douradaRays { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function AuraRelampago({ size, accent }: { size: number; accent: string }) {
  const bolts = Array.from({ length: 5 }, (_, i) => ({ a: (i * 72), delay: (i * 0.3) }));
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {bolts.map((b, i) => (
        <g key={i} className="bolt" transform={`rotate(${b.a}, 50, 50)`} style={{ ["--delay" as string]: `${b.delay}s` }}>
          <path d="M 50 10 L 46 26 L 52 28 L 48 46" stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 5px ${accent})` }} />
        </g>
      ))}
      <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <style>{`.bolt { animation: boltFlash 2.5s ease-in-out var(--delay) infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .bolt, .av-cos-wrap[data-anim="hover"]:hover .bolt { animation-duration: 0.9s; } @keyframes boltFlash { 0%, 40%, 100% { opacity: 0 } 45%, 55% { opacity: 1 } }`}</style>
    </svg>
  );
}

function AuraCosmos({ size, accent }: { size: number; accent: string }) {
  const stars = Array.from({ length: 14 }, (_, i) => ({ angle: (i * 360) / 14, orbit: 36 + (i % 3) * 6, delay: (i * 0.15) % 2.5, size: 1 + (i % 3) * 0.7 }));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}40 30%, ${accent}15 55%, transparent 70%)`,
      }} />
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} className="cosmos-orbit">
        {stars.map((s, i) => (
          <circle key={i} className="cosmos-star"
            cx={50 + Math.cos(s.angle * Math.PI / 180) * s.orbit}
            cy={50 + Math.sin(s.angle * Math.PI / 180) * s.orbit}
            r={s.size} fill="#ffffff"
            style={{ ["--delay" as string]: `${s.delay}s`, filter: `drop-shadow(0 0 3px ${accent})` }}
          />
        ))}
      </svg>
      <style>{`.cosmos-orbit { animation: cosmosSpin 20s linear infinite; transform-origin: center; transform-box: fill-box; } .cosmos-star { animation: cosmosTwinkle 2.5s ease-in-out var(--delay) infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .cosmos-orbit, .av-cos-wrap[data-anim="hover"]:hover .cosmos-orbit { animation-duration: 5s; } @keyframes cosmosSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } } @keyframes cosmosTwinkle { 0%, 100% { opacity: 0.4; transform: scale(0.5) } 50% { opacity: 1; transform: scale(1.2) } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TAROT v3 — 6 frames arcanos
   ═════════════════════════════════════════════════════════════════════ */

function FrameArcanoSolar({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-solar">
      <circle cx="50" cy="50" r="47" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.9" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
      <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.4" strokeDasharray="2 3" />
      {[0, 90, 180, 270].map((angle, i) => (
        <g key={i} transform={`rotate(${angle}, 50, 50) translate(50, 3)`}>
          <polygon points="0,-4 3,2 -3,2" fill={accent} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
        </g>
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .frame-solar { animation: solarSpin 12s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .frame-solar, .av-cos-wrap[data-anim="hover"]:hover .frame-solar { animation: solarSpin 3s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes solarSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function FrameArcanoLunar({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-lunar">
      <circle cx="50" cy="50" r="46" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.3" strokeDasharray="4 3" />
      {Array.from({ length: 8 }, (_, i) => i * 45).map((angle, i) => (
        <g key={i} transform={`rotate(${angle}, 50, 50) translate(50, 2)`}>
          <circle cx="0" cy="0" r="3" fill={i % 2 === 0 ? accent : "none"} stroke={accent} strokeWidth="0.8" style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
        </g>
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .frame-lunar { animation: lunarSpin 15s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .frame-lunar, .av-cos-wrap[data-anim="hover"]:hover .frame-lunar { animation: lunarSpin 4s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes lunarSpin { from { transform: rotate(0) } to { transform: rotate(-360deg) } }`}</style>
    </svg>
  );
}

function FrameArcanoEstelar({ size, accent }: { size: number; accent: string }) {
  const stars = [
    { x: 50, y: 5 }, { x: 78, y: 22 }, { x: 90, y: 50 },
    { x: 78, y: 78 }, { x: 50, y: 95 }, { x: 10, y: 50 },
  ];
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <polygon points="50,5 78,22 90,50 78,78 50,95 10,50" fill="none" stroke={accent} strokeWidth="0.4" strokeDasharray="2 2" opacity="0.3" />
      {stars.map((s, i) => (
        <g key={i} className="estelar-star" style={{ ["--i" as string]: i }}>
          <circle cx={s.x} cy={s.y} r="2" fill="#ffffff" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
          <circle cx={s.x} cy={s.y} r="4" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.5" />
        </g>
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .estelar-star { animation: estelarTwinkle 3s ease-in-out calc(var(--i) * 0.3s) infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .estelar-star, .av-cos-wrap[data-anim="hover"]:hover .estelar-star { animation: estelarTwinkle 0.8s ease-in-out calc(var(--i) * 0.1s) infinite; transform-origin: center; transform-box: fill-box; } @keyframes estelarTwinkle { 0%, 100% { opacity: 0.5; transform: scale(0.8) } 50% { opacity: 1; transform: scale(1.3) } }`}</style>
    </svg>
  );
}

function FrameRunasTraders({ size, accent }: { size: number; accent: string }) {
  const runes = [
    { x: 50, y: 5, label: "OB" }, { x: 90, y: 50, label: "FVG" },
    { x: 50, y: 95, label: "LIQ" }, { x: 10, y: 50, label: "$$" },
  ];
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {runes.map((r, i) => (
        <g key={i} className="rune-hex" style={{ ["--i" as string]: i }}>
          <polygon
            points={`${r.x},${r.y - 5} ${r.x + 4.3},${r.y - 2.5} ${r.x + 4.3},${r.y + 2.5} ${r.x},${r.y + 5} ${r.x - 4.3},${r.y + 2.5} ${r.x - 4.3},${r.y - 2.5}`}
            fill={`${accent}20`} stroke={accent} strokeWidth="0.8" style={{ filter: `drop-shadow(0 0 4px ${accent})` }}
          />
          <text x={r.x} y={r.y + 1.5} textAnchor="middle" fontSize="3.5" fontFamily="monospace" fontWeight="bold" fill={accent}>{r.label}</text>
        </g>
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .rune-hex { animation: runeGlow 4s ease-in-out calc(var(--i) * 0.4s) infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .rune-hex, .av-cos-wrap[data-anim="hover"]:hover .rune-hex { animation: runeGlow 1s ease-in-out calc(var(--i) * 0.15s) infinite; transform-origin: center; transform-box: fill-box; } @keyframes runeGlow { 0%, 100% { opacity: 0.5 } 50% { opacity: 1; filter: brightness(1.4) } }`}</style>
    </svg>
  );
}

function FramePentagrama({ size, accent }: { size: number; accent: string }) {
  const tips = [{ x: 50, y: 10 }, { x: 90, y: 50 }, { x: 78, y: 92 }, { x: 22, y: 92 }, { x: 10, y: 50 }];
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-penta">
      <polygon points="50,10 65,50 90,50 70,68 78,92 50,75 22,92 30,68 10,50 35,50"
        fill="none" stroke={accent} strokeWidth="1" opacity="0.8" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
      {tips.map((t, i) => (
        <rect key={i} x={t.x - 1.2} y={t.y - 1.5} width="2.4" height="3" fill={accent} opacity="0.9" rx="0.3"
          style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .frame-penta { animation: pentaSpin 20s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .frame-penta, .av-cos-wrap[data-anim="hover"]:hover .frame-penta { animation: pentaSpin 4s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes pentaSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function FrameSigiloMago({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="frame-sigilo">
      <circle cx="50" cy="50" r="47" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.6" />
      <circle cx="50" cy="50" r="43" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.3" strokeDasharray="3 3" />
      {Array.from({ length: 12 }, (_, i) => i * 30).map((angle, i) => (
        <g key={i} transform={`rotate(${angle}, 50, 50)`}>
          <line x1="50" y1="4" x2="50" y2="8" stroke={accent} strokeWidth="1.2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 2px ${accent})` }} />
        </g>
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .frame-sigilo { animation: sigiloSpin 20s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .frame-sigilo, .av-cos-wrap[data-anim="hover"]:hover .frame-sigilo { animation: sigiloSpin 5s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes sigiloSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TAROT v3 — 6 auras arcanas
   ═════════════════════════════════════════════════════════════════════ */

function AuraNevoa({ size, accent }: { size: number; accent: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="nevoa-layer" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(ellipse 40% 30% at 20% 50%, ${accent}50, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 50%, ${accent}30, transparent 60%)`,
      }} />
      <style>{`.av-cos-wrap[data-anim="always"] .nevoa-layer { animation: nevoaDrift 4s ease-in-out infinite; } .av-cos-wrap[data-anim="always"]:hover .nevoa-layer, .av-cos-wrap[data-anim="hover"]:hover .nevoa-layer { animation: nevoaDrift 1.5s ease-in-out infinite; } @keyframes nevoaDrift { 0%, 100% { transform: translateX(-4px); opacity: 0.7 } 50% { transform: translateX(4px); opacity: 1 } }`}</style>
    </div>
  );
}

function AuraRunasOrbital({ size, accent }: { size: number; accent: string }) {
  const runes = [
    { angle: 0, glyph: "Ω" }, { angle: 72, glyph: "△" }, { angle: 144, glyph: "✦" },
    { angle: 216, glyph: "⧖" }, { angle: 288, glyph: "⚝" },
  ];
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="runas-orbit">
      {runes.map((r, i) => (
        <text key={i}
          x={50 + Math.cos(r.angle * Math.PI / 180) * 42}
          y={50 + Math.sin(r.angle * Math.PI / 180) * 42 + 2}
          textAnchor="middle" fontSize="6" fontFamily="serif" fill={accent}
          style={{ filter: `drop-shadow(0 0 3px ${accent})` }}>{r.glyph}</text>
      ))}
      <style>{`.av-cos-wrap[data-anim="always"] .runas-orbit { animation: runasRotate 12s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .runas-orbit, .av-cos-wrap[data-anim="hover"]:hover .runas-orbit { animation: runasRotate 3s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes runasRotate { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function AuraEnergiaArcana({ size, accent }: { size: number; accent: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="arcana-pulse" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}55 25%, transparent 65%)`,
      }} />
      <div className="arcana-wave" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `2px solid ${accent}`,
      }} />
      <style>{`.av-cos-wrap[data-anim="always"] .arcana-pulse { animation: arcanaPulse 2s ease-in-out infinite; } .av-cos-wrap[data-anim="always"] .arcana-wave { animation: arcanaWave 2s ease-out infinite; } .av-cos-wrap[data-anim="always"]:hover .arcana-pulse, .av-cos-wrap[data-anim="hover"]:hover .arcana-pulse { animation: arcanaPulse 0.6s ease-in-out infinite; } .av-cos-wrap[data-anim="always"]:hover .arcana-wave, .av-cos-wrap[data-anim="hover"]:hover .arcana-wave { animation: arcanaWave 0.8s ease-out infinite; } @keyframes arcanaPulse { 0%, 100% { opacity: 0.6; transform: scale(1) } 50% { opacity: 1; transform: scale(1.05) } } @keyframes arcanaWave { 0% { opacity: 0.9; transform: scale(0.6) } 100% { opacity: 0; transform: scale(1.4) } }`}</style>
    </div>
  );
}

function AuraSombras({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <g className="sombras-group">
        {[0, 120, 240].map((angle, i) => (
          <ellipse key={i} cx="50" cy="50" rx="40" ry="12" fill={accent} opacity="0.5"
            transform={`rotate(${angle}, 50, 50)`}
            style={{ filter: "blur(6px)" }} />
        ))}
      </g>
      <style>{`.av-cos-wrap[data-anim="always"] .sombras-group { animation: sombrasSpin 8s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .sombras-group, .av-cos-wrap[data-anim="hover"]:hover .sombras-group { animation: sombrasSpin 2s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes sombrasSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function AuraLuzDivina({ size, accent }: { size: number; accent: string }) {
  const beams = Array.from({ length: 6 }, (_, i) => ({ x: 20 + i * 12, delay: (i * 0.25) % 1.5 }));
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id="luzGradAura" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="40%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {beams.map((b, i) => (
        <rect key={i} className="luz-beam" x={b.x} y="0" width="2" height="100" fill="url(#luzGradAura)"
          style={{ ["--delay" as string]: `${b.delay}s`, filter: `drop-shadow(0 0 3px ${accent})` }} />
      ))}
      <style>{`.luz-beam { opacity: 0; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"] .luz-beam { animation: luzBeam 2s ease-in-out var(--delay) infinite; } .av-cos-wrap[data-anim="always"]:hover .luz-beam, .av-cos-wrap[data-anim="hover"]:hover .luz-beam { animation: luzBeam 0.8s ease-in-out var(--delay) infinite; } @keyframes luzBeam { 0%, 100% { opacity: 0; transform: scaleY(0.3) } 50% { opacity: 0.8; transform: scaleY(1) } }`}</style>
    </svg>
  );
}

function AuraPortalEtereo({ size, accent }: { size: number; accent: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="portal-swirl" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `conic-gradient(from 0deg, ${accent}00, ${accent}70, ${accent}00, ${accent}50, ${accent}00, ${accent}80, ${accent}00)`,
      }} />
      <style>{`.av-cos-wrap[data-anim="always"] .portal-swirl { animation: portalSpin 4s linear infinite; transform-origin: center; transform-box: fill-box; } .av-cos-wrap[data-anim="always"]:hover .portal-swirl, .av-cos-wrap[data-anim="hover"]:hover .portal-swirl { animation: portalSpin 1.2s linear infinite; transform-origin: center; transform-box: fill-box; } @keyframes portalSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
