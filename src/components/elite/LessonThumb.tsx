/* ────────────────────────────────────────────
   LessonThumb — mini-chart thumbnails for lesson cards

   Static SVG previews that visually match the full LessonChart.
   Each thumb illustrates the core concept of its lesson so a student
   can recognize the content at a glance before clicking.
   ──────────────────────────────────────────── */

export type ThumbKind =
  | "roadmap"         // intro
  | "candle-anatomy"  // leitura-candle
  | "risk-shield"     // risco
  | "ob-bounce"       // order-blocks
  | "fvg-fill"        // fvg-breaker
  | "premium"         // premium-discount
  | "liquidity"       // liquidez
  | "sessions"        // sessoes
  | "amd"             // amd
  | "judas"           // daily-bias
  | "smt"             // smt
  | "entry-setup"     // entrada-saida
  | "prop-firms"      // mesas-prop
  | "accounts";       // gerenciamento-contas

const C = {
  green: "#10B981",
  red:   "#EF4444",
  blue:  "#3B82F6",
  purple:"#A855F7",
  gold:  "#F59E0B",
  brand: "#FF5500",
  gray:  "rgba(255,255,255,0.35)",
};

/* ────────────────────────────────────────────
   Shared pieces: background, grid, accent glow
   ──────────────────────────────────────────── */

function ThumbBase({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: "#0e0e10" }}>
      {/* Subtle grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)",
      }} />
      {/* Accent glow */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 60% at 80% 30%, ${accent}14, transparent 60%),
                     radial-gradient(ellipse 40% 40% at 15% 80%, ${accent}08, transparent 55%)`,
      }} />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${accent}70 30%, ${accent}50 70%, transparent)`,
      }} />
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────
   Helper: render a candle
   ──────────────────────────────────────────── */

interface CandleData { x: number; o: number; h: number; l: number; c: number; w?: number; op?: number; }
function Candle({ x, o, h, l, c, w = 9, op = 1 }: CandleData) {
  const bullish = c >= o;
  const color = bullish ? C.green : C.red;
  const bodyTop = Math.min(o, c);
  const bodyH = Math.max(Math.abs(c - o), 1.5);
  return (
    <g opacity={op}>
      <line x1={x} y1={h} x2={x} y2={l} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <rect x={x - w / 2} y={bodyTop} width={w} height={bodyH} fill={color} rx={1} />
    </g>
  );
}

/* ────────────────────────────────────────────
   Thumb definitions — viewBox 400×220 (16:9-ish)
   ──────────────────────────────────────────── */

const VB = "0 0 400 220";

function Thumb_Roadmap() {
  // Introdução — path from zero to goal with milestones
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Curved path */}
      <path d="M 40 180 Q 120 170 160 140 T 260 90 T 360 40"
        stroke={C.brand + "55"} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="5 5" />
      {/* Milestones */}
      {[{ x: 40, y: 180, a: 0.35 }, { x: 160, y: 140, a: 0.55 }, { x: 260, y: 90, a: 0.75 }, { x: 360, y: 40, a: 1 }].map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r={10 - i} fill={C.brand + "10"} />
          <circle cx={m.x} cy={m.y} r={5 - i * 0.7} fill={C.brand} opacity={m.a} />
          {i === 3 && (
            <>
              <circle cx={m.x} cy={m.y} r="16" fill="none" stroke={C.brand + "40"} strokeWidth="1" />
              <circle cx={m.x} cy={m.y} r="24" fill="none" stroke={C.brand + "20"} strokeWidth="1" />
            </>
          )}
        </g>
      ))}
      {/* Final checkmark at endpoint */}
      <path d="M 353 40 L 358 45 L 368 33" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Thumb_CandleAnatomy() {
  // Show a few candles with one dominant anatomy candle
  const candles: CandleData[] = [
    { x: 60,  o: 145, h: 125, l: 160, c: 130 },
    { x: 95,  o: 135, h: 115, l: 145, c: 120, w: 8 },
    { x: 130, o: 125, h: 108, l: 140, c: 140 },
    // Big anatomy candle
    { x: 200, o: 160, h: 50,  l: 190, c: 70,  w: 24 },
    { x: 280, o: 80,  h: 60,  l: 95,  c: 65,  w: 10 },
    { x: 315, o: 70,  h: 48,  l: 85,  c: 55 },
    { x: 350, o: 60,  h: 38,  l: 72,  c: 48 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {candles.map((c, i) => <Candle key={i} {...c} />)}
      {/* Anatomy guides on big candle */}
      <line x1="228" y1="50" x2="260" y2="50" stroke={C.gray} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
      <line x1="228" y1="70" x2="260" y2="70" stroke={C.gray} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
      <line x1="228" y1="160" x2="260" y2="160" stroke={C.gray} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
      <line x1="228" y1="190" x2="260" y2="190" stroke={C.gray} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
    </svg>
  );
}

function Thumb_RiskShield() {
  // Entry + SL + TP with 1R/3R zones
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* 3R profit zone */}
      <rect x="20" y="30" width="360" height="80" fill={C.green} opacity="0.08" />
      {/* 1R risk zone */}
      <rect x="20" y="130" width="360" height="40" fill={C.red} opacity="0.10" />
      {/* Entry line */}
      <line x1="20" y1="130" x2="380" y2="130" stroke={C.blue} strokeWidth="1.5" />
      <rect x="24" y="120" width="38" height="14" fill={C.blue} rx="2" />
      <text x="43" y="130" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">ENTRY</text>
      {/* SL line */}
      <line x1="20" y1="170" x2="380" y2="170" stroke={C.red} strokeWidth="1.2" strokeDasharray="4 3" />
      {/* TP line */}
      <line x1="20" y1="30" x2="380" y2="30" stroke={C.green} strokeWidth="1.2" strokeDasharray="4 3" />
      {/* Candle action — rising to TP */}
      <Candle x={110} o={135} h={125} l={142} c={130} w={8} />
      <Candle x={150} o={128} h={105} l={132} c={108} w={8} />
      <Candle x={190} o={105} h={85}  l={110} c={88} w={8} />
      <Candle x={230} o={88}  h={65}  l={92}  c={68} w={8} />
      <Candle x={270} o={68}  h={50}  l={72}  c={55} w={8} />
      <Candle x={310} o={55}  h={38}  l={60}  c={42} w={8} />
      {/* Arrow up */}
      <path d="M 340 55 L 345 35 L 350 55" stroke={C.green} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Labels */}
      <text x="370" y="26" textAnchor="end" fill={C.green} fontSize="9" fontWeight="700" fontFamily="monospace">+3R</text>
      <text x="370" y="183" textAnchor="end" fill={C.red} fontSize="9" fontWeight="700" fontFamily="monospace">-1R</text>
    </svg>
  );
}

function Thumb_OBBounce() {
  // OB zone with price touching + bouncing
  const candles: CandleData[] = [
    { x: 50,  o: 70,  h: 60,  l: 80,  c: 62 },
    { x: 85,  o: 62,  h: 50,  l: 70,  c: 55 },
    { x: 120, o: 55,  h: 70,  l: 50,  c: 68 },
    { x: 155, o: 68,  h: 90,  l: 65,  c: 85 },
    { x: 190, o: 85,  h: 115, l: 80,  c: 110 },
    { x: 225, o: 110, h: 120, l: 95,  c: 100 },
    { x: 260, o: 100, h: 105, l: 75,  c: 78 },
    // Touch the OB
    { x: 295, o: 78,  h: 82,  l: 68,  c: 80 },
    // Engulfing bounce
    { x: 330, o: 80,  h: 55,  l: 85,  c: 58 },
    { x: 365, o: 58,  h: 35,  l: 62,  c: 40 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* OB zone */}
      <rect x="30" y="65" width="360" height="22" fill={C.blue} opacity="0.18" stroke={C.blue} strokeWidth="1" rx="2" />
      {/* OB label */}
      <rect x="30" y="48" width="34" height="14" fill={C.blue} rx="2" />
      <text x="47" y="58" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">OB</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
    </svg>
  );
}

function Thumb_FVGFill() {
  // FVG gap + price return + CE line
  const candles: CandleData[] = [
    { x: 40,  o: 175, h: 165, l: 185, c: 168 },
    { x: 75,  o: 168, h: 160, l: 175, c: 163 },
    { x: 110, o: 163, h: 155, l: 170, c: 158 }, // before gap
    // Impulse candle (creates FVG)
    { x: 150, o: 158, h: 80,  l: 162, c: 90,  w: 14 },
    { x: 195, o: 90,  h: 60,  l: 95,  c: 70,  w: 9 },
    { x: 230, o: 70,  h: 60,  l: 95,  c: 88,  w: 9 },
    { x: 265, o: 88,  h: 95,  l: 115, c: 112, w: 9 },
    { x: 300, o: 112, h: 100, l: 140, c: 138, w: 9 }, // returning to FVG
    { x: 335, o: 138, h: 110, l: 145, c: 115, w: 9 }, // reaction
    { x: 370, o: 115, h: 80,  l: 120, c: 85,  w: 9 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* FVG zone */}
      <rect x="130" y="100" width="260" height="50" fill={C.purple} opacity="0.18" stroke={C.purple} strokeWidth="1" strokeDasharray="5 3" rx="2" />
      {/* CE (50%) line */}
      <line x1="130" y1="125" x2="390" y2="125" stroke={C.purple} strokeWidth="1" strokeDasharray="3 3" opacity="0.9" />
      {/* FVG label */}
      <rect x="130" y="83" width="40" height="14" fill={C.purple} rx="2" />
      <text x="150" y="93" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">FVG</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
    </svg>
  );
}

function Thumb_Premium() {
  // Premium (top red) / Discount (bottom green) with 50% line
  const candles: CandleData[] = [
    { x: 35,  o: 40,  h: 30,  l: 50,  c: 45 },
    { x: 70,  o: 45,  h: 40,  l: 65,  c: 60 },
    { x: 105, o: 60,  h: 55,  l: 85,  c: 82 },
    { x: 140, o: 82,  h: 78,  l: 110, c: 108 },
    { x: 175, o: 108, h: 105, l: 140, c: 135 },
    { x: 210, o: 135, h: 128, l: 170, c: 165 },
    { x: 245, o: 165, h: 158, l: 190, c: 182 },
    { x: 280, o: 182, h: 150, l: 188, c: 155 },
    { x: 315, o: 155, h: 125, l: 160, c: 128 },
    { x: 350, o: 128, h: 95,  l: 135, c: 100 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Premium zone */}
      <rect x="0" y="0" width="400" height="110" fill={C.red} opacity="0.07" />
      {/* Discount zone */}
      <rect x="0" y="110" width="400" height="110" fill={C.green} opacity="0.07" />
      {/* EQ line at 50% */}
      <line x1="0" y1="110" x2="400" y2="110" stroke={C.brand} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.9" />
      <rect x="340" y="102" width="50" height="16" fill={C.brand} rx="2" />
      <text x="365" y="113" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">50%</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
      {/* Labels */}
      <text x="20" y="30" fill={C.red} opacity="0.7" fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.12em">PREMIUM</text>
      <text x="20" y="200" fill={C.green} opacity="0.7" fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.12em">DISCOUNT</text>
    </svg>
  );
}

function Thumb_Liquidity() {
  // Equal lows + sweep
  const candles: CandleData[] = [
    { x: 40,  o: 90,  h: 70,  l: 100, c: 78 },
    { x: 70,  o: 78,  h: 60,  l: 85,  c: 65 },
    { x: 100, o: 65,  h: 55,  l: 120, c: 115 }, // equal low 1
    { x: 130, o: 115, h: 100, l: 120, c: 108 },
    { x: 160, o: 108, h: 95,  l: 120, c: 112 }, // equal low 2
    { x: 190, o: 112, h: 100, l: 120, c: 116 }, // equal low 3
    { x: 220, o: 116, h: 105, l: 130, c: 120 },
    // Sweep (spike below)
    { x: 250, o: 120, h: 115, l: 175, c: 165, w: 10 },
    // Engulfing reversal
    { x: 290, o: 165, h: 75,  l: 170, c: 80, w: 11 },
    { x: 325, o: 80,  h: 50,  l: 85,  c: 55 },
    { x: 360, o: 55,  h: 30,  l: 62,  c: 38 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Equal lows line (SSL) */}
      <line x1="20" y1="120" x2="280" y2="120" stroke={C.red} strokeWidth="1.2" strokeDasharray="5 3" opacity="0.85" />
      {/* Stops clustered below */}
      {[{ x: 110, y: 130 }, { x: 145, y: 132 }, { x: 175, y: 129 }, { x: 205, y: 131 }].map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2" fill={C.red} opacity="0.55" />
      ))}
      {/* Sweep low marker */}
      <line x1="20" y1="175" x2="280" y2="175" stroke={C.red} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      {candles.map((c, i) => <Candle key={i} {...c} />)}
      {/* SSL label */}
      <rect x="20" y="105" width="34" height="13" fill={C.red} rx="2" />
      <text x="37" y="114" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="monospace">SSL</text>
    </svg>
  );
}

function Thumb_Sessions() {
  // 3 vertical bands: Asia / London / NY
  const candles: CandleData[] = [
    { x: 25, o: 115, h: 110, l: 128, c: 125, w: 6 },
    { x: 50, o: 125, h: 115, l: 130, c: 120, w: 6 },
    { x: 75, o: 120, h: 110, l: 128, c: 118, w: 6 },
    { x: 100, o: 118, h: 112, l: 126, c: 120, w: 6 },
    { x: 125, o: 120, h: 105, l: 125, c: 110, w: 6 },
    // London
    { x: 160, o: 110, h: 90,  l: 118, c: 92,  w: 7 },
    { x: 190, o: 92,  h: 80,  l: 100, c: 85,  w: 7 },
    { x: 220, o: 85,  h: 95,  l: 80,  c: 100, w: 7 }, // sweep up
    { x: 250, o: 100, h: 95,  l: 125, c: 120, w: 7 }, // reverse
    // NY
    { x: 290, o: 120, h: 115, l: 150, c: 148, w: 8 },
    { x: 325, o: 148, h: 142, l: 175, c: 170, w: 8 },
    { x: 360, o: 170, h: 165, l: 195, c: 190, w: 8 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Session bands */}
      <rect x="0"   y="0" width="145" height="220" fill={C.blue}   opacity="0.08" />
      <rect x="145" y="0" width="130" height="220" fill={C.gold}   opacity="0.08" />
      <rect x="275" y="0" width="125" height="220" fill={C.brand}  opacity="0.08" />
      {/* Dividers */}
      <line x1="145" y1="0" x2="145" y2="220" stroke={C.gold} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      <line x1="275" y1="0" x2="275" y2="220" stroke={C.brand} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      {/* Labels */}
      <text x="72"  y="22" textAnchor="middle" fill={C.blue}  opacity="0.8" fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.15em">ÁSIA</text>
      <text x="210" y="22" textAnchor="middle" fill={C.gold}  opacity="0.8" fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.15em">LONDRES</text>
      <text x="337" y="22" textAnchor="middle" fill={C.brand} opacity="0.8" fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.15em">NY</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
    </svg>
  );
}

function Thumb_AMD() {
  // 3 phases: Accumulation / Manipulation / Distribution
  const candles: CandleData[] = [
    // Acumulação — sideways range
    { x: 25,  o: 115, h: 108, l: 125, c: 120, w: 7 },
    { x: 55,  o: 120, h: 112, l: 128, c: 115, w: 7 },
    { x: 85,  o: 115, h: 105, l: 122, c: 120, w: 7 },
    { x: 115, o: 120, h: 110, l: 128, c: 118, w: 7 },
    { x: 145, o: 118, h: 112, l: 125, c: 120, w: 7 },
    // Manipulação — spike down
    { x: 180, o: 120, h: 115, l: 165, c: 155, w: 8 },
    { x: 210, o: 155, h: 148, l: 180, c: 172, w: 8 },
    // Distribuição — strong up
    { x: 250, o: 172, h: 85,  l: 180, c: 100, w: 10 },
    { x: 285, o: 100, h: 70,  l: 108, c: 75,  w: 9 },
    { x: 320, o: 75,  h: 48,  l: 82,  c: 55,  w: 9 },
    { x: 360, o: 55,  h: 28,  l: 62,  c: 35,  w: 9 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Phase bands */}
      <rect x="0"   y="0" width="160" height="220" fill={C.purple} opacity="0.14" />
      <rect x="160" y="0" width="65"  height="220" fill={C.red}    opacity="0.14" />
      <rect x="225" y="0" width="175" height="220" fill={C.green}  opacity="0.14" />
      {/* Dividers */}
      <line x1="160" y1="0" x2="160" y2="220" stroke={C.purple} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      <line x1="225" y1="0" x2="225" y2="220" stroke={C.red} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      {/* Labels */}
      <text x="80"  y="22" textAnchor="middle" fill={C.purple} opacity="0.9" fontSize="9.5" fontWeight="700" fontFamily="monospace" letterSpacing="0.13em">ACC</text>
      <text x="192" y="22" textAnchor="middle" fill={C.red}    opacity="0.9" fontSize="9.5" fontWeight="700" fontFamily="monospace" letterSpacing="0.13em">MAN</text>
      <text x="312" y="22" textAnchor="middle" fill={C.green}  opacity="0.9" fontSize="9.5" fontWeight="700" fontFamily="monospace" letterSpacing="0.13em">DIST</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
    </svg>
  );
}

function Thumb_Judas() {
  // Fake down move + reversal up
  const candles: CandleData[] = [
    { x: 40,  o: 145, h: 138, l: 155, c: 148, w: 8 },
    { x: 75,  o: 148, h: 140, l: 158, c: 142, w: 8 },
    { x: 110, o: 142, h: 135, l: 150, c: 138, w: 8 },
    // Judas down
    { x: 150, o: 138, h: 132, l: 175, c: 170, w: 9 },
    { x: 185, o: 170, h: 165, l: 195, c: 190, w: 9 },
    // Reversal
    { x: 220, o: 190, h: 115, l: 195, c: 125, w: 10 },
    { x: 255, o: 125, h: 85,  l: 132, c: 92,  w: 9 },
    { x: 290, o: 92,  h: 58,  l: 98,  c: 65,  w: 9 },
    { x: 325, o: 65,  h: 35,  l: 72,  c: 42,  w: 9 },
    { x: 360, o: 42,  h: 18,  l: 48,  c: 25,  w: 9 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Open price */}
      <line x1="20" y1="145" x2="380" y2="145" stroke={C.gray} strokeWidth="0.8" strokeDasharray="3 5" opacity="0.5" />
      {/* Judas zone */}
      <rect x="135" y="0" width="65" height="220" fill={C.red} opacity="0.12" />
      {/* Real move zone */}
      <rect x="200" y="0" width="200" height="220" fill={C.green} opacity="0.10" />
      {/* Labels */}
      <text x="167" y="22" textAnchor="middle" fill={C.red}   opacity="0.85" fontSize="9" fontWeight="700" fontFamily="monospace" letterSpacing="0.12em">JUDAS</text>
      <text x="300" y="22" textAnchor="middle" fill={C.green} opacity="0.85" fontSize="9" fontWeight="700" fontFamily="monospace" letterSpacing="0.12em">MOV. REAL</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
    </svg>
  );
}

function Thumb_SMT() {
  // Two asset lines diverging (NQ makes HH, ES doesn't)
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* NQ line — purple, makes HH */}
      <polyline
        points="30,140 65,130 100,155 135,105 170,100 205,125 240,80 275,70 310,85 345,55 380,60"
        stroke={C.purple} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* ES line — gold, fails to make HH (divergence) */}
      <polyline
        points="30,155 65,150 100,170 135,130 170,125 205,145 240,110 275,120 310,135 345,125 380,140"
        stroke={C.gold + "aa"} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4"
      />
      {/* High 1 marker */}
      <line x1="135" y1="105" x2="170" y2="100" stroke={C.gray} strokeWidth="0.7" strokeDasharray="2 3" />
      <circle cx="170" cy="100" r="3" fill="none" stroke={C.purple} strokeWidth="1" />
      {/* HH marker */}
      <line x1="275" y1="70" x2="345" y2="55" stroke={C.red} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="345" cy="55" r="5" fill={C.red} opacity="0.35" />
      <circle cx="345" cy="55" r="2.5" fill={C.red} />
      {/* Divergence arrows */}
      <path d="M 345 55 L 355 55" stroke={C.red} strokeWidth="1.2" />
      <path d="M 345 125 L 355 125" stroke={C.gold} strokeWidth="1.2" />
      {/* Labels */}
      <rect x="360" y="48" width="30" height="14" fill={C.purple} rx="2" />
      <text x="375" y="58" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">NQ</text>
      <rect x="360" y="118" width="30" height="14" fill={C.gold} rx="2" />
      <text x="375" y="128" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">ES</text>
      {/* SMT flag */}
      <text x="30" y="30" fill={C.red} opacity="0.75" fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.12em">SMT DIVERGENCE</text>
    </svg>
  );
}

function Thumb_EntrySetup() {
  // Full trade: OB zone, Entry, SL, TP
  const candles: CandleData[] = [
    { x: 35,  o: 140, h: 130, l: 150, c: 135 },
    { x: 65,  o: 135, h: 128, l: 155, c: 152 }, // OB candle
    { x: 95,  o: 152, h: 90,  l: 155, c: 95 },
    { x: 125, o: 95,  h: 70,  l: 100, c: 75 },
    { x: 155, o: 75,  h: 80,  l: 110, c: 108 },
    { x: 185, o: 108, h: 105, l: 150, c: 145 }, // pullback into OB
    { x: 215, o: 145, h: 135, l: 160, c: 152 },
    // Reaction up
    { x: 245, o: 152, h: 95,  l: 158, c: 100 },
    { x: 280, o: 100, h: 60,  l: 108, c: 65 },
    { x: 315, o: 65,  h: 35,  l: 72,  c: 42 },
    { x: 355, o: 42,  h: 15,  l: 48,  c: 22 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* OB + FVG zone */}
      <rect x="50" y="128" width="200" height="28" fill={C.blue} opacity="0.18" stroke={C.blue} strokeWidth="1" rx="2" />
      <rect x="50" y="110" width="60" height="14" fill={C.blue} rx="2" />
      <text x="80" y="120" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">OB+FVG</text>
      {/* Lines */}
      <line x1="20" y1="140" x2="380" y2="140" stroke={C.blue} strokeWidth="1.2" />
      <line x1="20" y1="175" x2="380" y2="175" stroke={C.red}  strokeWidth="1" strokeDasharray="4 3" />
      <line x1="20" y1="20"  x2="380" y2="20"  stroke={C.green} strokeWidth="1" strokeDasharray="4 3" />
      {/* Tags */}
      <rect x="330" y="13" width="50" height="14" fill={C.green} rx="2" />
      <text x="355" y="23" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">TP +3R</text>
      <rect x="330" y="168" width="50" height="14" fill={C.red} rx="2" />
      <text x="355" y="178" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">SL -1R</text>
      {candles.map((c, i) => <Candle key={i} {...c} />)}
    </svg>
  );
}

function Thumb_PropFirms() {
  // 3 challenge phases stacked
  const phases = [
    { label: "PHASE 1", pct: 0.70, color: C.blue, active: true },
    { label: "PHASE 2", pct: 0.40, color: C.purple, active: true },
    { label: "FUNDED", pct: 0.15, color: C.green, active: false },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {phases.map((p, i) => {
        const y = 40 + i * 55;
        return (
          <g key={i}>
            {/* Label */}
            <text x="30" y={y + 5} fill={p.color} opacity={p.active ? 1 : 0.35} fontSize="10" fontWeight="700" fontFamily="monospace" letterSpacing="0.1em">{p.label}</text>
            {/* Progress bar bg */}
            <rect x="30" y={y + 10} width="340" height="10" fill="rgba(255,255,255,0.05)" rx="5" />
            {/* Progress bar fill */}
            <rect x="30" y={y + 10} width={340 * p.pct} height="10" fill={p.color} opacity={p.active ? 0.9 : 0.3} rx="5" />
            {/* Percentage */}
            <text x="370" y={y + 5} textAnchor="end" fill={p.color} opacity={p.active ? 0.9 : 0.4} fontSize="10" fontWeight="700" fontFamily="monospace">{Math.round(p.pct * 100)}%</text>
            {/* Check on completed */}
            {i < 2 && (
              <g>
                <circle cx="385" cy={y + 15} r="8" fill={p.color} opacity="0.15" />
                <path d={`M 381 ${y + 15} L 384 ${y + 18} L 389 ${y + 12}`} stroke={p.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Thumb_Accounts() {
  // Risk gauge / multiple accounts
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VB} preserveAspectRatio="xMidYMid slice">
      {/* Big percentage gauge */}
      <g transform="translate(110, 110)">
        <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="0" cy="0" r="70" fill="none" stroke={C.brand} strokeWidth="10" strokeLinecap="round"
          strokeDasharray="220 440" transform="rotate(-90)" />
        <text x="0" y="-2" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800" fontFamily="monospace">1%</text>
        <text x="0" y="20" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="0.15em">RISCO / DIA</text>
      </g>
      {/* Account boxes */}
      {[
        { label: "CONTA A", val: "-2.0%", color: C.red, y: 50 },
        { label: "CONTA B", val: "-0.5%", color: C.gold, y: 100 },
        { label: "CONTA C", val: "+1.2%", color: C.green, y: 150 },
      ].map((a, i) => (
        <g key={i}>
          <rect x="220" y={a.y} width="155" height="35" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="220" y={a.y} width="3" height="35" fill={a.color} opacity="0.8" rx="1.5" />
          <text x="235" y={a.y + 15} fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="monospace" letterSpacing="0.1em">{a.label}</text>
          <text x="235" y={a.y + 28} fill={a.color} fontSize="11" fontWeight="700" fontFamily="monospace">{a.val}</text>
        </g>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */

export function LessonThumb({ kind, accent }: { kind: ThumbKind; accent: string }) {
  const Content = {
    "roadmap":        Thumb_Roadmap,
    "candle-anatomy": Thumb_CandleAnatomy,
    "risk-shield":    Thumb_RiskShield,
    "ob-bounce":      Thumb_OBBounce,
    "fvg-fill":       Thumb_FVGFill,
    "premium":        Thumb_Premium,
    "liquidity":      Thumb_Liquidity,
    "sessions":       Thumb_Sessions,
    "amd":            Thumb_AMD,
    "judas":          Thumb_Judas,
    "smt":            Thumb_SMT,
    "entry-setup":    Thumb_EntrySetup,
    "prop-firms":     Thumb_PropFirms,
    "accounts":       Thumb_Accounts,
  }[kind];

  return (
    <ThumbBase accent={accent}>
      <Content />
    </ThumbBase>
  );
}

/** Map a lesson id to its thumb kind. */
export function lessonThumbKind(lessonId: string): ThumbKind {
  const map: Record<string, ThumbKind> = {
    "intro":                "roadmap",
    "leitura-candle":       "candle-anatomy",
    "risco":                "risk-shield",
    "order-blocks":         "ob-bounce",
    "fvg-breaker":          "fvg-fill",
    "premium-discount":     "premium",
    "liquidez":             "liquidity",
    "sessoes":              "sessions",
    "amd":                  "amd",
    "daily-bias":           "judas",
    "smt":                  "smt",
    "entrada-saida":        "entry-setup",
    "mesas-prop":           "prop-firms",
    "gerenciamento-contas": "accounts",
  };
  return map[lessonId] ?? "roadmap";
}
