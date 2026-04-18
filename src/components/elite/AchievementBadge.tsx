"use client";

import type { Achievement, Category, Rarity } from "@/lib/achievements";

/* ────────────────────────────────────────────
   URA Labs · Achievement Badge
   Medalhas premium 100% SVG.

   - Bronze: círculo metálico simples
   - Prata: octógono facetado
   - Ouro: hexágono point-top
   - Lendária: estrela 5-pontas 3D (facets + depth shadow + directional light)
   - Elite Member: coroa 3D dourada com gemas (og-elite)

   Cada categoria tem símbolo desenhado à mão.
   OGs têm paleta exclusiva por turma.
   ──────────────────────────────────────────── */

interface Props {
  achievement: Achievement;
  size?: number;
  locked?: boolean;
}

/* ── Paletas metálicas ── */
const PALETTE: Record<Rarity, {
  highlight: string;
  mid: string;
  shadow: string;
  rim: string;
  innerRim: string;
  glow: string;
  engraving: string;
  iconColor: string;
}> = {
  bronze: {
    highlight: "#F4C493", mid: "#A0632B", shadow: "#3B1A0F",
    rim: "#6B3E1F", innerRim: "#D9925B", glow: "#C4833F",
    engraving: "#5A2E16", iconColor: "#FFE3C7",
  },
  silver: {
    highlight: "#FAFBFD", mid: "#9AA3B3", shadow: "#2B323D",
    rim: "#556173", innerRim: "#D6DCE6", glow: "#CBD5E1",
    engraving: "#3A4252", iconColor: "#F8FAFC",
  },
  gold: {
    highlight: "#FFF3C9", mid: "#E39409", shadow: "#5C2A05",
    rim: "#8A4708", innerRim: "#FDD75C", glow: "#F59E0B",
    engraving: "#6F3507", iconColor: "#FFF8DE",
  },
  legendary: {
    highlight: "#FFE3C2", mid: "#FF5500", shadow: "#590F00",
    rim: "#8C1D00", innerRim: "#FF8B4A", glow: "#FF5500",
    engraving: "#6B1300", iconColor: "#FFEFDC",
  },
};

const OG_VARIANTS: Record<string, typeof PALETTE.legendary> = {
  "og-1": { // fundadora — ouro real
    highlight: "#FFF6D6", mid: "#E9A500", shadow: "#4A2500",
    rim: "#7A4200", innerRim: "#FFD246", glow: "#F7B500",
    engraving: "#5C2E00", iconColor: "#FFF9E3",
  },
  "og-2": { // prata polida
    highlight: "#FFFFFF", mid: "#9AA3B3", shadow: "#2B323D",
    rim: "#556173", innerRim: "#E5EAF1", glow: "#D1D5DB",
    engraving: "#3A4252", iconColor: "#FAFBFD",
  },
  "og-3": { // laranja URA brand (turma 3.0)
    highlight: "#FFD6B0", mid: "#FF5500", shadow: "#4A0F00",
    rim: "#7C1D00", innerRim: "#FF8A4A", glow: "#FF5500",
    engraving: "#5C1400", iconColor: "#FFEFDC",
  },
  "og-4": { // obsidian — cor padrão das turmas atuais + futuras
    highlight: "#4A4A52", mid: "#1A1A1F", shadow: "#09090B",
    rim: "#2B2B30", innerRim: "#7A7A82", glow: "#FF5500",
    engraving: "#18181D", iconColor: "#E8E8EA",
  },
  "og-elite": { // Elite Member — estrela champagne com chama URA dourada flamejante no centro
    highlight: "#FFF5D6", mid: "#D4AF37", shadow: "#5A3E00",
    rim: "#7E5B1A", innerRim: "#FFDD5F", glow: "#FFAE00",
    engraving: "#5C2E00", iconColor: "#FFA500",
  },
};

const CAT_ACCENT: Record<Category, string> = {
  learning:  "#60A5FA",
  practice:  "#C084FC",
  trading:   "#34D399",
  community: "#22D3EE",
  milestone: "#FB923C",
  og:        "#FBBF24",
};

function getPalette(a: Achievement) {
  if (a.category === "og" && OG_VARIANTS[a.id]) return OG_VARIANTS[a.id];
  return PALETTE[a.rarity];
}

/* ────────────────────────────────────────────
   Central symbols — dispatch por achievement.id
   com stroke preto pra legibilidade em qualquer fundo
   ──────────────────────────────────────────── */

const MONO_FONT = 'ui-monospace, "SF Mono", "Monaco", monospace';
const SANS_FONT = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

/** Text helper com paint-order stroke preto pra legibilidade em fundo variado */
function TextBadge({
  primary,
  secondary,
  color,
  size = 26,
  font = MONO_FONT,
  letterSpacing = "-1.5",
  primaryY = 52,
  secondaryY = 68,
}: {
  primary: string;
  secondary?: string;
  color: string;
  size?: number;
  font?: string;
  letterSpacing?: string;
  primaryY?: number;
  secondaryY?: number;
}) {
  const hasSecondary = !!secondary;
  const pY = hasSecondary ? primaryY - 3 : primaryY;
  return (
    <g>
      <text
        x="50" y={pY}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={font} fontWeight="900" fontSize={size}
        fill={color} letterSpacing={letterSpacing}
        stroke="rgba(0,0,0,0.85)" strokeWidth="2.4"
        paintOrder="stroke"
        style={{ strokeLinejoin: "round" }}
      >{primary}</text>
      {hasSecondary && (
        <text
          x="50" y={secondaryY}
          textAnchor="middle" dominantBaseline="middle"
          fontFamily={MONO_FONT} fontWeight="700" fontSize="6.5"
          fill={color} opacity="0.9" letterSpacing="2"
          stroke="rgba(0,0,0,0.8)" strokeWidth="1.2"
          paintOrder="stroke"
        >{secondary}</text>
      )}
    </g>
  );
}

/** Three stars horizontal (Trinity) */
function ThreeStars({ color }: { color: string }) {
  const star = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const ao = -Math.PI / 2 + (Math.PI * 2 / 5) * i;
      const ai = ao + Math.PI / 5;
      pts.push(`${(cx + r * Math.cos(ao)).toFixed(2)},${(cy + r * Math.sin(ao)).toFixed(2)}`);
      pts.push(`${(cx + r * 0.42 * Math.cos(ai)).toFixed(2)},${(cy + r * 0.42 * Math.sin(ai)).toFixed(2)}`);
    }
    return pts.join(" ");
  };
  return (
    <g>
      <polygon points={star(32, 50, 8)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" paintOrder="stroke" />
      <polygon points={star(50, 50, 10)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" paintOrder="stroke" />
      <polygon points={star(68, 50, 8)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" paintOrder="stroke" />
    </g>
  );
}

/** Big checkmark (all-lessons / graduation feel) */
function BigCheck({ color }: { color: string }) {
  return (
    <g>
      <circle cx="50" cy="50" r="22" stroke={color} strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M37 50 L46 60 L64 40" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" paintOrder="stroke" />
    </g>
  );
}

/** Dollar symbol — bold com coroa pequena em cima (payout) */
function DollarIcon({ color, label }: { color: string; label?: string }) {
  return (
    <g>
      <text x="50" y={label ? 48 : 55} textAnchor="middle" dominantBaseline="middle"
        fontFamily={MONO_FONT} fontWeight="900" fontSize="36"
        fill={color}
        stroke="rgba(0,0,0,0.55)" strokeWidth="1"
        paintOrder="stroke">$</text>
      {label && (
        <text x="50" y="66" textAnchor="middle" dominantBaseline="middle"
          fontFamily={MONO_FONT} fontWeight="700" fontSize="7"
          fill={color} opacity="0.85" letterSpacing="1.5"
          stroke="rgba(0,0,0,0.5)" strokeWidth="0.4" paintOrder="stroke">{label}</text>
      )}
    </g>
  );
}

/** Speech bubble (peer reviewer) */
function SpeechBubble({ color }: { color: string }) {
  return (
    <g>
      <path d="M26 38 L74 38 Q80 38 80 44 L80 58 Q80 64 74 64 L58 64 L50 72 L50 64 L26 64 Q20 64 20 58 L20 44 Q20 38 26 38 Z"
        fill="none" stroke={color} strokeWidth="2.8" strokeLinejoin="round" />
      <circle cx="36" cy="51" r="2" fill={color} />
      <circle cx="50" cy="51" r="2" fill={color} />
      <circle cx="64" cy="51" r="2" fill={color} />
    </g>
  );
}

/** Graduation cap (mentor) */
function GradCap({ color }: { color: string }) {
  return (
    <g>
      {/* Mortar board top */}
      <path d="M50 30 L82 42 L50 54 L18 42 Z"
        fill={color} opacity="0.92"
        stroke="rgba(0,0,0,0.5)" strokeWidth="0.8" strokeLinejoin="round" paintOrder="stroke" />
      {/* Cap body */}
      <path d="M32 48 L32 60 Q32 68 50 68 Q68 68 68 60 L68 48"
        fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Tassel */}
      <line x1="76" y1="46" x2="76" y2="58" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="76" cy="60" r="2.5" fill={color} />
    </g>
  );
}

/** Single candle + arrow — generic trading fallback (not used agora, mantém por compat) */
function CandlesTrend({ color }: { color: string }) {
  const stroke = color;
  return (
    <g>
      <line x1="34" y1="66" x2="34" y2="72" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="30" y="56" width="8" height="12" fill={color} opacity="0.92" rx="1" />
      <line x1="50" y1="38" x2="50" y2="44" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="46" y="44" width="8" height="20" fill={color} opacity="0.92" rx="1" />
      <line x1="66" y1="32" x2="66" y2="38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="62" y="38" width="8" height="16" stroke={color} strokeWidth="2" fill="none" rx="1" />
      <path d="M26 74 L44 58 L54 64 L74 36" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <path d="M68 32 L74 36 L72 42" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </g>
  );
}

/** Dispatcher principal — cada badge tem seu próprio símbolo */
function CategorySymbolContent({ achievement, color }: { achievement: Achievement; color: string }) {
  // OG: cohort number (Elite Member é roteado pra EliteCrownBadge, não passa aqui)
  if (achievement.category === "og" && achievement.cohort) {
    return (
      <TextBadge
        primary={achievement.cohort}
        color={color}
        size={20}
        letterSpacing="-1"
        primaryY={54}
      />
    );
  }

  // Dispatch por id específico
  switch (achievement.id) {
    // ── Trading: iniciais de mesa + $ variações ──
    case "mesa-fp":       return <TextBadge primary="FP" color={color} size={30} font={SANS_FONT} letterSpacing="-0.5" />;
    case "mesa-ts":       return <TextBadge primary="TS" color={color} size={30} font={SANS_FONT} letterSpacing="-0.5" />;
    case "mesa-5ers":     return <TextBadge primary="5%" color={color} size={28} font={SANS_FONT} letterSpacing="-1" />;
    case "payout-1":      return <DollarIcon color={color} label="1º" />;
    case "payout-10k":    return <TextBadge primary="$10K" color={color} size={22} font={MONO_FONT} letterSpacing="-1.5" />;

    // ── Milestones: número + unidade ──
    case "streak-7":      return <TextBadge primary="7"   secondary="DIAS" color={color} size={34} />;
    case "streak-30":     return <TextBadge primary="30"  secondary="DIAS" color={color} size={30} />;
    case "streak-100":    return <TextBadge primary="100" secondary="DIAS" color={color} size={22} />;
    case "trades-100":    return <TextBadge primary="100" secondary="TRADES" color={color} size={22} />;

    // ── Learning: módulo/progresso ──
    case "first-lesson":  return <TextBadge primary="01" secondary="AULA" color={color} size={30} />;
    case "module-base":   return <TextBadge primary="BASE" color={color} size={16} font={SANS_FONT} letterSpacing="0.5" />;
    case "module-smc":    return <TextBadge primary="SMC" color={color} size={22} font={SANS_FONT} letterSpacing="0" />;
    case "all-lessons":   return <BigCheck color={color} />;

    // ── Practice: grade/score ──
    case "first-quiz-a":  return <TextBadge primary="A+" color={color} size={32} font={SANS_FONT} letterSpacing="-2" />;
    case "trinity":       return <ThreeStars color={color} />;
    case "quiz-master":   return <TextBadge primary="100" secondary="%" color={color} size={22} />;

    // ── Community ──
    case "peer-reviewer": return <SpeechBubble color={color} />;
    case "mentor":        return <GradCap color={color} />;

    // Fallback (não deveria acontecer, mas por seguridade)
    default:
      return <CandlesTrend color={color} />;
  }
}

/** Wrapper que aplica scale em torno do centro (50,50) */
function CategorySymbol({ achievement, color, scale = 1 }: { achievement: Achievement; color: string; scale?: number }) {
  const content = <CategorySymbolContent achievement={achievement} color={color} />;
  if (scale === 1) return content;
  return (
    <g transform={`translate(50 50) scale(${scale}) translate(-50 -50)`}>
      {content}
    </g>
  );
}

/* ────────────────────────────────────────────
   STANDARD BADGES (bronze/silver/gold) — shapes diferentes por raridade
   - Bronze: círculo simples
   - Prata: octógono (8 lados)
   - Ouro: hexágono point-top
   ──────────────────────────────────────────── */

function BronzeShape(props: React.SVGProps<SVGCircleElement>) {
  return <circle cx="50" cy="50" r="46" {...props} />;
}

function SilverShape(props: React.SVGProps<SVGPolygonElement>) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI / 4) * i - Math.PI / 8;
    pts.push(`${(50 + 46 * Math.cos(ang)).toFixed(2)},${(50 + 46 * Math.sin(ang)).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} {...props} />;
}

function GoldShape(props: React.SVGProps<SVGPolygonElement>) {
  return <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" {...props} />;
}

function renderStandardShape(rarity: Rarity, props: React.SVGProps<SVGElement>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = props as any;
  switch (rarity) {
    case "bronze": return <BronzeShape {...p} />;
    case "silver": return <SilverShape {...p} />;
    case "gold":   return <GoldShape {...p} />;
    default: return null;
  }
}

function StandardBadge({ achievement, size, locked }: Props & { size: number; locked: boolean }) {
  const palette = getPalette(achievement);
  const catColor = CAT_ACCENT[achievement.category];
  const uid = `ab-${achievement.id}`;
  const rarity = achievement.rarity as Exclude<Rarity, "legendary">;
  const muted = locked;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`metal-${uid}`} cx="32%" cy="22%" r="98%">
            <stop offset="0%" stopColor={muted ? "#2a2a2f" : palette.highlight} />
            <stop offset="35%" stopColor={muted ? "#1e1e22" : palette.mid} />
            <stop offset="100%" stopColor={muted ? "#0e0e10" : palette.shadow} />
          </radialGradient>

          <linearGradient id={`gloss-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={rarity === "gold" ? 2.8 : 2} />
          </filter>

          <clipPath id={`clip-${uid}`}>
            {renderStandardShape(rarity, {} as React.SVGProps<SVGElement>)}
          </clipPath>
        </defs>

        {!muted && (
          <g filter={`url(#glow-${uid})`} opacity={rarity === "gold" ? 0.5 : rarity === "silver" ? 0.28 : 0.22}>
            {renderStandardShape(rarity, {
              fill: palette.glow,
              transform: "scale(1.08) translate(-4 -4)",
              style: { transformOrigin: "center" },
            } as unknown as React.SVGProps<SVGElement>)}
          </g>
        )}

        {renderStandardShape(rarity, {
          fill: `url(#metal-${uid})`,
          stroke: muted ? "rgba(255,255,255,0.05)" : palette.rim,
          strokeWidth: 1.5,
        } as unknown as React.SVGProps<SVGElement>)}

        {!muted && (
          <g transform="scale(0.88) translate(6.8 6.8)" style={{ transformOrigin: "0 0" }}>
            {renderStandardShape(rarity, {
              fill: "none",
              stroke: palette.innerRim,
              strokeWidth: 0.9,
              opacity: 0.85,
            } as unknown as React.SVGProps<SVGElement>)}
          </g>
        )}

        {!muted && (
          <g transform="scale(0.72) translate(19.4 19.4)" style={{ transformOrigin: "0 0" }}>
            {renderStandardShape(rarity, {
              fill: "none",
              stroke: palette.engraving,
              strokeWidth: 0.8,
              opacity: 0.6,
            } as unknown as React.SVGProps<SVGElement>)}
          </g>
        )}

        {!muted && (
          <circle cx="50" cy="50" r="29" fill="none" stroke={catColor} strokeWidth="0.7" opacity="0.4" strokeDasharray="1 2" />
        )}

        <g opacity={muted ? 0.18 : 1}>
          <CategorySymbol achievement={achievement} color={muted ? "#6B7280" : palette.iconColor} />
        </g>

        {!muted && (
          <g clipPath={`url(#clip-${uid})`}>
            {renderStandardShape(rarity, {
              fill: `url(#gloss-${uid})`,
              opacity: 0.35,
            } as unknown as React.SVGProps<SVGElement>)}
          </g>
        )}

        {!muted && (
          <ellipse cx="40" cy="20" rx="20" ry="5" fill="#fff" opacity="0.18" />
        )}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   LEGENDARY BADGE — estrela 5-pontas 3D facetada
   10 triângulos com luz direcional NW, shadow 3D, glow intenso
   ──────────────────────────────────────────── */

const STAR_OUTER_R = 38;
const STAR_INNER_R = 15;
const CX = 50;
const CY = 50;

type Pt = { x: number; y: number };

function starGeometry() {
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i < 5; i++) {
    const angOut = -Math.PI / 2 + (Math.PI * 2 / 5) * i;
    const angIn  = angOut + Math.PI / 5;
    outer.push({ x: CX + STAR_OUTER_R * Math.cos(angOut), y: CY + STAR_OUTER_R * Math.sin(angOut) });
    inner.push({ x: CX + STAR_INNER_R * Math.cos(angIn),  y: CY + STAR_INNER_R * Math.sin(angIn) });
  }
  return { outer, inner };
}

function starPolygonPoints(): string {
  const { outer, inner } = starGeometry();
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    pts.push(`${outer[i].x.toFixed(2)},${outer[i].y.toFixed(2)}`);
    pts.push(`${inner[i].x.toFixed(2)},${inner[i].y.toFixed(2)}`);
  }
  return pts.join(" ");
}

/** 10 facets: pra cada tip outer[i], tem 2 triângulos (right + left shoulder). */
function starFacets(): Array<{ pts: string; tone: 0 | 1 | 2 }> {
  const { outer, inner } = starGeometry();
  const center = `${CX},${CY}`;
  const facets: Array<{ pts: string; tone: 0 | 1 | 2 }> = [];
  // Tone map: 0 = bright (highlight), 1 = mid, 2 = dark (shadow)
  // Calibrado pra simular luz vindo de NW
  const toneMap: Array<[0 | 1 | 2, 0 | 1 | 2]> = [
    [0, 0], // tip 0 (top): right=bright, left=bright
    [2, 1], // tip 1 (right): right=dark, left=mid
    [2, 2], // tip 2 (bottom-right): both dark
    [1, 1], // tip 3 (bottom-left): both mid
    [0, 0], // tip 4 (left): both bright
  ];
  for (let i = 0; i < 5; i++) {
    const [toneR, toneL] = toneMap[i];
    const prevInner = inner[(i - 1 + 5) % 5];
    // Right facet: center → outer[i] → inner[i]
    facets.push({
      pts: `${center} ${outer[i].x.toFixed(2)},${outer[i].y.toFixed(2)} ${inner[i].x.toFixed(2)},${inner[i].y.toFixed(2)}`,
      tone: toneR,
    });
    // Left facet: center → inner[i-1] → outer[i]
    facets.push({
      pts: `${center} ${prevInner.x.toFixed(2)},${prevInner.y.toFixed(2)} ${outer[i].x.toFixed(2)},${outer[i].y.toFixed(2)}`,
      tone: toneL,
    });
  }
  return facets;
}

function LegendaryBadge({ achievement, size, locked }: Props & { size: number; locked: boolean }) {
  const palette = getPalette(achievement);
  const catColor = CAT_ACCENT[achievement.category];
  const uid = `ab-${achievement.id}`;
  const muted = locked;
  const starPts = starPolygonPoints();
  const facets = starFacets();

  const toneColor = (t: 0 | 1 | 2) => {
    if (muted) return t === 0 ? "#2a2a2f" : t === 1 ? "#1c1c20" : "#0e0e10";
    return t === 0 ? palette.highlight : t === 1 ? palette.mid : palette.shadow;
  };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          {/* Outer glow blur filter */}
          <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>

          {/* Center highlight radial — brilho concentrado no meio */}
          <radialGradient id={`center-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor={palette.highlight} stopOpacity="0.85" />
            <stop offset="50%" stopColor={palette.highlight} stopOpacity="0.20" />
            <stop offset="100%" stopColor={palette.highlight} stopOpacity="0" />
          </radialGradient>

          {/* Gloss overlay */}
          <linearGradient id={`gloss-${uid}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Shimmer animado — bem sutil pra não apagar a paleta */}
          <linearGradient id={`shimmer-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0">
              <animate attributeName="offset" values="-0.4;1.2" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.22">
              <animate attributeName="offset" values="-0.25;1.35" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0">
              <animate attributeName="offset" values="-0.1;1.5" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <clipPath id={`clip-${uid}`}>
            <polygon points={starPts} />
          </clipPath>
        </defs>

        {/* Outer glow aura — big soft orange blur behind star */}
        {!muted && (
          <g filter={`url(#glow-${uid})`} opacity="0.85">
            <polygon points={starPts} fill={palette.glow} transform="scale(1.2)" style={{ transformOrigin: "center" }} />
          </g>
        )}

        {/* Secondary glow — tighter, brighter core */}
        {!muted && (
          <g filter={`url(#glow-${uid})`} opacity="0.7">
            <polygon points={starPts} fill={palette.innerRim} transform="scale(1.08)" style={{ transformOrigin: "center" }} />
          </g>
        )}

        {/* Depth shadow — darker copy offset down-right */}
        {!muted && (
          <polygon points={starPts} fill="rgba(0,0,0,0.55)" transform="translate(1.5 2.5)" />
        )}

        {/* 10 facets com cores alternando pra dar 3D */}
        {facets.map((facet, i) => (
          <polygon
            key={i}
            points={facet.pts}
            fill={toneColor(facet.tone)}
            stroke={muted ? "rgba(255,255,255,0.03)" : palette.engraving}
            strokeWidth="0.35"
            strokeLinejoin="round"
          />
        ))}

        {/* Outline principal da estrela — polish final */}
        <polygon
          points={starPts}
          fill="none"
          stroke={muted ? "rgba(255,255,255,0.04)" : palette.rim}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        {/* Inner star outline sutil — dá dupla cunhagem */}
        {!muted && (
          <polygon
            points={starPts}
            fill="none"
            stroke={palette.innerRim}
            strokeWidth="0.5"
            strokeLinejoin="round"
            opacity="0.6"
            transform="scale(0.82)"
            style={{ transformOrigin: "center" }}
          />
        )}

        {/* Center glow — suave brilho no meio */}
        {!muted && (
          <circle cx="50" cy="50" r="18" fill={`url(#center-${uid})`} />
        )}

        {/* Central symbol — legibilidade via paintOrder stroke grosso (ver TextBadge) */}
        <g opacity={muted ? 0.15 : 1}>
          <CategorySymbol achievement={achievement} color={muted ? "#6B7280" : palette.iconColor} scale={0.85} />
        </g>

        {/* Gloss overlay top-half */}
        {!muted && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon points={starPts} fill={`url(#gloss-${uid})`} opacity="0.40" />
          </g>
        )}

        {/* Shimmer overlay animado — opacity baixa pra não branquear */}
        {!muted && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon points={starPts} fill={`url(#shimmer-${uid})`} style={{ mixBlendMode: "screen" }} opacity="0.3" />
          </g>
        )}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   ELITE CROWN BADGE — 3D crown pra Elite Member.
   Coroa dourada facetada, gemas laterais + ruby central, base com joias.
   Sem estrela. Paleta champagne/gold do OG_VARIANTS["og-elite"].
   ──────────────────────────────────────────── */

/** 5-peak crown silhouette — tips com gemas, base com belt cravejado. */
const CROWN_OUTLINE =
  "20,78 80,78 80,58 78,28 71,52 64,36 57,44 50,18 43,44 36,36 29,52 22,28 20,58";

/** Peaks: tip + left valley + right valley pra faceting 3D. */
const CROWN_PEAKS: Array<{ tip: [number, number]; lv: [number, number]; rv: [number, number]; gem: "ruby" | "pearl" }> = [
  { tip: [22, 28], lv: [20, 58], rv: [29, 52], gem: "pearl" },
  { tip: [36, 36], lv: [29, 52], rv: [43, 44], gem: "pearl" },
  { tip: [50, 18], lv: [43, 44], rv: [57, 44], gem: "ruby" },
  { tip: [64, 36], lv: [57, 44], rv: [71, 52], gem: "pearl" },
  { tip: [78, 28], lv: [71, 52], rv: [80, 58], gem: "pearl" },
];

function EliteCrownBadge({ achievement, size, locked }: Props & { size: number; locked: boolean }) {
  const palette = getPalette(achievement);
  const uid = `ab-${achievement.id}`;
  const muted = locked;

  const lit = muted ? "#2a2a2f" : palette.highlight;
  const mid = muted ? "#1c1c20" : palette.mid;
  const dark = muted ? "#0e0e10" : palette.shadow;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          {/* Soft glow filter */}
          <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>

          {/* Vertical metallic body gradient */}
          <linearGradient id={`body-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor={lit} />
            <stop offset="35%"  stopColor={muted ? "#1e1e22" : palette.innerRim} />
            <stop offset="70%"  stopColor={mid} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>

          {/* Base belt gradient — darker at bottom pra dar massa */}
          <linearGradient id={`base-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor={muted ? "#1e1e22" : palette.innerRim} />
            <stop offset="45%"  stopColor={mid} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>

          {/* Side lighting — lit à esquerda, shadow à direita (luz NW) */}
          <linearGradient id={`side-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="35%"  stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="65%"  stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          {/* Gloss overlay top band */}
          <linearGradient id={`gloss-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Ruby gem (center) — orange/red URA brand */}
          <radialGradient id={`ruby-${uid}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%"  stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFB380" />
            <stop offset="60%" stopColor="#FF5500" />
            <stop offset="100%" stopColor="#4A0F00" />
          </radialGradient>

          {/* Pearl gem (side) — champagne white */}
          <radialGradient id={`pearl-${uid}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%"  stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFF2BF" />
            <stop offset="100%" stopColor="#8A6B1A" />
          </radialGradient>

          {/* Shimmer animado */}
          <linearGradient id={`shimmer-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0">
              <animate attributeName="offset" values="-0.4;1.2" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.28">
              <animate attributeName="offset" values="-0.25;1.35" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0">
              <animate attributeName="offset" values="-0.1;1.5" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <clipPath id={`clip-${uid}`}>
            <polygon points={CROWN_OUTLINE} />
          </clipPath>
        </defs>

        {/* ── Outer glow aura (big soft gold halo) ── */}
        {!muted && (
          <g filter={`url(#glow-${uid})`} opacity="0.9">
            <polygon
              points={CROWN_OUTLINE}
              fill={palette.glow}
              transform="scale(1.22)"
              style={{ transformOrigin: "center" }}
            />
          </g>
        )}
        {!muted && (
          <g filter={`url(#glow-${uid})`} opacity="0.65">
            <polygon
              points={CROWN_OUTLINE}
              fill={palette.innerRim}
              transform="scale(1.1)"
              style={{ transformOrigin: "center" }}
            />
          </g>
        )}

        {/* ── Depth shadow offset ── */}
        {!muted && (
          <polygon points={CROWN_OUTLINE} fill="rgba(0,0,0,0.6)" transform="translate(1.5 2.8)" />
        )}

        {/* ── Main crown body — vertical metallic gradient ── */}
        <polygon
          points={CROWN_OUTLINE}
          fill={`url(#body-${uid})`}
          stroke={muted ? "rgba(255,255,255,0.05)" : palette.rim}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* ── Base belt sobreposta (y=58 a y=78) pra dar peso ── */}
        <rect
          x="20" y="58" width="60" height="20"
          fill={`url(#base-${uid})`}
          opacity={muted ? 1 : 0.92}
        />

        {/* ── Peak facets: split cada peak em left (lit) + right (shadow) ── */}
        {!muted && (
          <g>
            {CROWN_PEAKS.map((p, i) => {
              const [tx, ty] = p.tip;
              const [lx, ly] = p.lv;
              const [rx, ry] = p.rv;
              return (
                <g key={i}>
                  {/* left facet — lit */}
                  <polygon
                    points={`${lx},${ly} ${tx},${ty} ${tx},58 ${lx},58`}
                    fill={lit}
                    opacity="0.35"
                  />
                  {/* right facet — shadow */}
                  <polygon
                    points={`${tx},${ty} ${rx},${ry} ${rx},58 ${tx},58`}
                    fill={dark}
                    opacity="0.4"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ── Seam lines from peak tips down to base (engraving) ── */}
        {!muted && (
          <g stroke={palette.engraving} strokeWidth="0.55" opacity="0.6" strokeLinecap="round">
            {CROWN_PEAKS.map((p, i) => (
              <line key={i} x1={p.tip[0]} y1={p.tip[1] + 2} x2={p.tip[0]} y2="58" />
            ))}
          </g>
        )}

        {/* ── Base decorative lines ── */}
        {!muted && (
          <g>
            <line x1="20" y1="58" x2="80" y2="58" stroke={palette.engraving} strokeWidth="0.9" opacity="0.75" />
            <line x1="20" y1="60.2" x2="80" y2="60.2" stroke={palette.innerRim} strokeWidth="0.45" opacity="0.55" />
            <line x1="20" y1="74" x2="80" y2="74" stroke={palette.engraving} strokeWidth="0.9" opacity="0.65" />
            <line x1="20" y1="75.8" x2="80" y2="75.8" stroke={palette.innerRim} strokeWidth="0.4" opacity="0.4" />
          </g>
        )}

        {/* ── Side lighting overlay (NW light direction) ── */}
        {!muted && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon points={CROWN_OUTLINE} fill={`url(#side-${uid})`} />
          </g>
        )}

        {/* ── Peak tip gems ── */}
        {!muted && (
          <g>
            {CROWN_PEAKS.map((p, i) => {
              const [cx, cy] = p.tip;
              const isRuby = p.gem === "ruby";
              const r = isRuby ? 4.4 : 2.8;
              return (
                <g key={i}>
                  {/* gem shadow */}
                  <circle cx={cx + 0.6} cy={cy + 1} r={r} fill="rgba(0,0,0,0.55)" />
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill={isRuby ? `url(#ruby-${uid})` : `url(#pearl-${uid})`}
                    stroke={palette.rim}
                    strokeWidth={isRuby ? 0.55 : 0.4}
                  />
                  {/* gem highlight speck */}
                  <circle cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 0.28} fill="#FFFFFF" opacity="0.85" />
                </g>
              );
            })}
          </g>
        )}

        {/* ── Base jeweled belt — 5 alternating gems ── */}
        {!muted && (
          <g>
            {[
              { cx: 28, r: 2.2, kind: "pearl" as const },
              { cx: 39, r: 2.8, kind: "ruby" as const },
              { cx: 50, r: 3.4, kind: "ruby" as const },
              { cx: 61, r: 2.8, kind: "ruby" as const },
              { cx: 72, r: 2.2, kind: "pearl" as const },
            ].map((g, i) => (
              <g key={i}>
                <circle cx={g.cx + 0.4} cy="67.5" r={g.r} fill="rgba(0,0,0,0.5)" />
                <circle
                  cx={g.cx} cy="67" r={g.r}
                  fill={g.kind === "ruby" ? `url(#ruby-${uid})` : `url(#pearl-${uid})`}
                  stroke={palette.rim}
                  strokeWidth="0.5"
                />
                <circle cx={g.cx - g.r * 0.35} cy={67 - g.r * 0.4} r={g.r * 0.28} fill="#FFFFFF" opacity="0.85" />
              </g>
            ))}
          </g>
        )}

        {/* ── Gloss overlay top (bright highlight band) ── */}
        {!muted && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon points={CROWN_OUTLINE} fill={`url(#gloss-${uid})`} opacity="0.45" />
          </g>
        )}

        {/* ── Shimmer animado ── */}
        {!muted && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon
              points={CROWN_OUTLINE}
              fill={`url(#shimmer-${uid})`}
              style={{ mixBlendMode: "screen" }}
              opacity="0.35"
            />
          </g>
        )}

        {/* ── Outline final polish ── */}
        <polygon
          points={CROWN_OUTLINE}
          fill="none"
          stroke={muted ? "rgba(255,255,255,0.06)" : palette.rim}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   Entry point
   ──────────────────────────────────────────── */

export function AchievementBadge({ achievement, size = 80, locked = false }: Props) {
  if (achievement.id === "og-elite") {
    return <EliteCrownBadge achievement={achievement} size={size} locked={locked} />;
  }
  if (achievement.rarity === "legendary") {
    return <LegendaryBadge achievement={achievement} size={size} locked={locked} />;
  }
  return <StandardBadge achievement={achievement} size={size} locked={locked} />;
}
