/* ────────────────────────────────────────────
   LessonThumb — minimalist pictograms (v2)

   Cada thumb é um glifo geométrico simples representando o conceito da aula.
   Negative space dominante · 1 forma · cor accent do módulo.
   Reconhecimento instantâneo sem texto.

   34 thumbs · 1 por aula do Elite 4.0.
   ──────────────────────────────────────────── */

export type ThumbKind =
  // Módulo 1 — Base
  | "mindset"
  | "tradingview"
  | "timeframes"
  | "candle"
  | "gestao-risco"
  // Módulo 2 — Leitura SMC
  | "premium-discount"
  | "varejo-smart"
  | "order-block"
  | "liquidez"
  | "fvg"
  | "ifvg-breaker"
  | "heatmap"
  // Módulo 3 — Estratégia & Sessões
  | "amd"
  | "sessoes"
  | "daily-bias"
  | "candle-careca"
  | "std-deviation"
  | "market-maker"
  // Módulo 4 — Execução
  | "marcacao"
  | "confluencia"
  | "unicornio"
  | "continuacao"
  | "amd-sweep"
  | "rr-lotes"
  // Módulo 5 — Mesas Prop
  | "mesa-intro"
  | "drawdown"
  | "lotes-config"
  | "multi-contas"
  // Módulo 6 — Psicologia
  | "espiral"
  | "numero-redondo"
  | "habitos"
  // Módulo 7 — Aplicação
  | "piramide"
  | "estudo-caso"
  | "proximos-passos";

/* ────────────────────────────────────────────
   ThumbBase — wrapper limpo, sem grid nem labels
   Só fundo escuro + glow muito sutil + linha accent no topo
   ──────────────────────────────────────────── */

function ThumbBase({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: "#0a0a0c" }}>
      {/* Glow accent muito sutil — uma fonte de luz só */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 110%, ${accent}18, transparent 70%)`,
        }}
      />
      {/* Linha accent no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}50, transparent)` }}
      />
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────
   Pictogramas — viewBox 100×100 centralizado
   Cada um é uma forma só, bold, com cor accent
   ──────────────────────────────────────────── */

const VB = "0 0 100 100";
const G = "rgba(255,255,255,0.18)"; // gray utility

function Pictogram({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VB}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

// ─── Módulo 1: Base ────────────────────────────────────────────

function Thumb_Mindset({ a }: { a: string }) {
  // Concentric circles — foco / clareza mental
  return (
    <Pictogram>
      <circle cx="50" cy="50" r="22" fill="none" stroke={a} strokeWidth="1.2" opacity="0.35" />
      <circle cx="50" cy="50" r="14" fill="none" stroke={a} strokeWidth="1.5" opacity="0.6" />
      <circle cx="50" cy="50" r="6" fill={a} />
    </Pictogram>
  );
}

function Thumb_TradingView({ a }: { a: string }) {
  // Tela com chart line minimalista
  return (
    <Pictogram>
      <rect x="22" y="30" width="56" height="40" rx="3" fill="none" stroke={a} strokeWidth="1.5" opacity="0.5" />
      <polyline points="28,58 38,52 46,55 56,42 68,46 74,38" stroke={a} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="74" cy="38" r="1.8" fill={a} />
    </Pictogram>
  );
}

function Thumb_Timeframes({ a }: { a: string }) {
  // 5 retângulos empilhados em cascata fractal
  const widths = [56, 44, 34, 24, 14];
  return (
    <Pictogram>
      {widths.map((w, i) => (
        <rect
          key={i}
          x={(100 - w) / 2}
          y={30 + i * 8}
          width={w}
          height="4"
          rx="1.5"
          fill={a}
          opacity={0.85 - i * 0.13}
        />
      ))}
    </Pictogram>
  );
}

function Thumb_Candle({ a }: { a: string }) {
  // Um único candle isolado e centralizado
  return (
    <Pictogram>
      <line x1="50" y1="22" x2="50" y2="35" stroke={a} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="42" y="35" width="16" height="30" rx="1.5" fill={a} />
      <line x1="50" y1="65" x2="50" y2="78" stroke={a} strokeWidth="1.6" strokeLinecap="round" />
    </Pictogram>
  );
}

function Thumb_GestaoRisco({ a }: { a: string }) {
  // Donut com 1% colorido — gauge de risco
  // arc circumference ≈ 2πr; 1% = 2.51 if r=40
  return (
    <Pictogram>
      <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx="50" cy="50" r="22"
        fill="none"
        stroke={a}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * 22 * 0.01} ${2 * Math.PI * 22}`}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="54" textAnchor="middle" fill={a} fontSize="14" fontWeight="700" fontFamily="monospace">1%</text>
    </Pictogram>
  );
}

// ─── Módulo 2: Leitura SMC ─────────────────────────────────────

function Thumb_PremiumDiscount({ a }: { a: string }) {
  // Retângulo dividido ao meio horizontalmente
  return (
    <Pictogram>
      <rect x="25" y="25" width="50" height="22" rx="2" fill={a} opacity="0.18" />
      <rect x="25" y="53" width="50" height="22" rx="2" fill={a} opacity="0.08" />
      <line x1="20" y1="50" x2="80" y2="50" stroke={a} strokeWidth="1.5" strokeDasharray="3 2" />
    </Pictogram>
  );
}

function Thumb_VarejoSmart({ a }: { a: string }) {
  // Duas setas opostas — manada vs smart money
  return (
    <Pictogram>
      <g opacity="0.4">
        <path d="M 25 38 L 70 38" stroke={a} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 65 33 L 70 38 L 65 43" stroke={a} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g>
        <path d="M 75 62 L 30 62" stroke={a} strokeWidth="2" strokeLinecap="round" />
        <path d="M 35 57 L 30 62 L 35 67" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Pictogram>
  );
}

function Thumb_OrderBlock({ a }: { a: string }) {
  // Dois retângulos sobrepostos — OB clássico
  return (
    <Pictogram>
      <rect x="22" y="38" width="56" height="24" rx="2" fill={a} opacity="0.16" stroke={a} strokeWidth="1.2" strokeOpacity="0.5" />
      <rect x="34" y="44" width="32" height="12" rx="1.5" fill={a} />
    </Pictogram>
  );
}

function Thumb_Liquidez({ a }: { a: string }) {
  // Duas linhas horizontais com clusters de pontos
  return (
    <Pictogram>
      <line x1="22" y1="35" x2="78" y2="35" stroke={a} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
      <line x1="22" y1="65" x2="78" y2="65" stroke={a} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
      {[32, 40, 48, 56, 64].map((x) => (
        <g key={x}>
          <circle cx={x} cy="29" r="1.5" fill={a} opacity="0.7" />
          <circle cx={x} cy="71" r="1.5" fill={a} opacity="0.7" />
        </g>
      ))}
    </Pictogram>
  );
}

function Thumb_FVG({ a }: { a: string }) {
  // 3 retângulos com gap visual no meio (FVG = ineficiência)
  return (
    <Pictogram>
      <rect x="26" y="38" width="14" height="10" rx="1.5" fill={a} opacity="0.85" />
      <rect x="60" y="52" width="14" height="10" rx="1.5" fill={a} opacity="0.85" />
      {/* Gap zone */}
      <rect x="26" y="48" width="48" height="4" fill={a} opacity="0.15" />
      <line x1="26" y1="48" x2="74" y2="48" stroke={a} strokeDasharray="2 2" strokeWidth="0.6" opacity="0.5" />
      <line x1="26" y1="52" x2="74" y2="52" stroke={a} strokeDasharray="2 2" strokeWidth="0.6" opacity="0.5" />
    </Pictogram>
  );
}

function Thumb_IFVGBreaker({ a }: { a: string }) {
  // Dois retângulos sobrepostos invertidos — inversão
  return (
    <Pictogram>
      <rect x="22" y="32" width="40" height="18" rx="2" fill={a} opacity="0.18" stroke={a} strokeWidth="1.2" strokeOpacity="0.4" />
      <rect x="38" y="50" width="40" height="18" rx="2" fill={a} opacity="0.45" />
      {/* X / inversion mark */}
      <line x1="48" y1="46" x2="52" y2="54" stroke={a} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="52" y1="46" x2="48" y2="54" stroke={a} strokeWidth="1.5" strokeLinecap="round" />
    </Pictogram>
  );
}

function Thumb_Heatmap({ a }: { a: string }) {
  // Grid 4x3 de pequenos quadrados com gradient de intensidade
  const cells = [
    [0.15, 0.25, 0.45, 0.7],
    [0.25, 0.4, 0.65, 0.9],
    [0.2, 0.3, 0.5, 0.75],
  ];
  return (
    <Pictogram>
      {cells.map((row, ri) =>
        row.map((op, ci) => (
          <rect
            key={`${ri}-${ci}`}
            x={28 + ci * 12}
            y={36 + ri * 12}
            width="8"
            height="8"
            rx="1"
            fill={a}
            opacity={op}
          />
        ))
      )}
    </Pictogram>
  );
}

// ─── Módulo 3: Estratégia & Sessões ────────────────────────────

function Thumb_AMD({ a }: { a: string }) {
  // 3 quadrados crescentes — Acumulação · Manipulação · Distribuição
  return (
    <Pictogram>
      <rect x="22" y="48" width="14" height="14" rx="1.5" fill={a} opacity="0.4" />
      <rect x="42" y="42" width="20" height="20" rx="1.5" fill={a} opacity="0.65" />
      <rect x="68" y="34" width="18" height="32" rx="1.5" fill={a} />
    </Pictogram>
  );
}

function Thumb_Sessoes({ a }: { a: string }) {
  // 3 círculos em fila — Ásia · Londres · NY
  return (
    <Pictogram>
      <circle cx="28" cy="50" r="10" fill="none" stroke={a} strokeWidth="1.5" opacity="0.45" />
      <circle cx="50" cy="50" r="10" fill="none" stroke={a} strokeWidth="1.5" opacity="0.7" />
      <circle cx="72" cy="50" r="10" fill={a} />
    </Pictogram>
  );
}

function Thumb_DailyBias({ a }: { a: string }) {
  // Seta diagonal com dot no destino
  return (
    <Pictogram>
      <line x1="28" y1="68" x2="68" y2="32" stroke={a} strokeWidth="2" strokeLinecap="round" />
      <path d="M 60 30 L 70 32 L 68 42" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="68" r="2.5" fill={a} opacity="0.5" />
    </Pictogram>
  );
}

function Thumb_CandleCareca({ a }: { a: string }) {
  // Só o corpo do candle — sem pavios (careca)
  return (
    <Pictogram>
      <rect x="40" y="30" width="20" height="40" rx="2" fill={a} />
    </Pictogram>
  );
}

function Thumb_StdDeviation({ a }: { a: string }) {
  // Escada de linhas em níveis — projeções
  const lines = [
    { y: 32, o: 1, w: 50 },
    { y: 42, o: 0.7, w: 40 },
    { y: 52, o: 0.5, w: 30 },
    { y: 62, o: 0.35, w: 20 },
  ];
  return (
    <Pictogram>
      {lines.map((l, i) => (
        <rect key={i} x={(100 - l.w) / 2} y={l.y} width={l.w} height="2.5" rx="1" fill={a} opacity={l.o} />
      ))}
    </Pictogram>
  );
}

function Thumb_MarketMaker({ a }: { a: string }) {
  // Quadrado com quadrado dentro com quadrado dentro — fractal
  return (
    <Pictogram>
      <rect x="22" y="22" width="56" height="56" rx="3" fill="none" stroke={a} strokeWidth="1.2" opacity="0.4" />
      <rect x="34" y="34" width="32" height="32" rx="2" fill="none" stroke={a} strokeWidth="1.4" opacity="0.7" />
      <rect x="44" y="44" width="12" height="12" rx="1.5" fill={a} />
    </Pictogram>
  );
}

// ─── Módulo 4: Execução & Setups ───────────────────────────────

function Thumb_Marcacao({ a }: { a: string }) {
  // 3 dots verticais numerados — passo a passo
  return (
    <Pictogram>
      <circle cx="36" cy="32" r="3" fill={a} />
      <line x1="36" y1="36" x2="36" y2="46" stroke={a} strokeWidth="1" opacity="0.4" />
      <circle cx="36" cy="50" r="3" fill={a} opacity="0.7" />
      <line x1="36" y1="54" x2="36" y2="64" stroke={a} strokeWidth="1" opacity="0.4" />
      <circle cx="36" cy="68" r="3" fill={a} opacity="0.5" />
      <line x1="44" y1="32" x2="70" y2="32" stroke={a} strokeWidth="1.2" opacity="0.6" />
      <line x1="44" y1="50" x2="64" y2="50" stroke={a} strokeWidth="1.2" opacity="0.45" />
      <line x1="44" y1="68" x2="58" y2="68" stroke={a} strokeWidth="1.2" opacity="0.3" />
    </Pictogram>
  );
}

function Thumb_Confluencia({ a }: { a: string }) {
  // Diagrama de Venn — 3 círculos sobrepostos
  return (
    <Pictogram>
      <circle cx="40" cy="42" r="16" fill={a} opacity="0.25" />
      <circle cx="60" cy="42" r="16" fill={a} opacity="0.25" />
      <circle cx="50" cy="58" r="16" fill={a} opacity="0.25" />
      <circle cx="50" cy="50" r="3" fill={a} />
    </Pictogram>
  );
}

function Thumb_Unicornio({ a }: { a: string }) {
  // Diamante — raridade
  return (
    <Pictogram>
      <path d="M 50 25 L 72 50 L 50 75 L 28 50 Z" fill="none" stroke={a} strokeWidth="1.5" opacity="0.5" />
      <path d="M 50 35 L 62 50 L 50 65 L 38 50 Z" fill={a} />
    </Pictogram>
  );
}

function Thumb_Continuacao({ a }: { a: string }) {
  // Linha de tendência forte com seta
  return (
    <Pictogram>
      <line x1="22" y1="70" x2="70" y2="32" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 62 30 L 72 30 L 72 40" stroke={a} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Pictogram>
  );
}

function Thumb_AMDSweep({ a }: { a: string }) {
  // V-shape — sweep + reversão
  return (
    <Pictogram>
      <path d="M 25 35 L 50 75 L 75 35" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="75" r="3" fill={a} />
      <line x1="25" y1="35" x2="75" y2="35" stroke={a} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
    </Pictogram>
  );
}

function Thumb_RRLotes({ a }: { a: string }) {
  // 1 barra pequena vermelha + 3 barras grandes verdes — R/R
  return (
    <Pictogram>
      <rect x="32" y="62" width="14" height="8" rx="1" fill={a} opacity="0.4" />
      <rect x="52" y="34" width="14" height="36" rx="1" fill={a} />
      <line x1="22" y1="50" x2="78" y2="50" stroke={a} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
    </Pictogram>
  );
}

// ─── Módulo 5: Mesas Proprietárias ─────────────────────────────

function Thumb_MesaIntro({ a }: { a: string }) {
  // Torre minimalista — mesa proprietária
  return (
    <Pictogram>
      <rect x="38" y="55" width="24" height="20" rx="1" fill={a} opacity="0.4" />
      <rect x="42" y="40" width="16" height="15" rx="1" fill={a} opacity="0.65" />
      <rect x="46" y="28" width="8" height="12" rx="1" fill={a} />
    </Pictogram>
  );
}

function Thumb_Drawdown({ a }: { a: string }) {
  // 3 barras de progresso — prova / financiada / saque
  return (
    <Pictogram>
      <rect x="22" y="30" width="56" height="3" rx="1" fill={`${a}30`} />
      <rect x="22" y="30" width="40" height="3" rx="1" fill={a} />
      <rect x="22" y="48" width="56" height="3" rx="1" fill={`${a}30`} />
      <rect x="22" y="48" width="28" height="3" rx="1" fill={a} opacity="0.7" />
      <rect x="22" y="66" width="56" height="3" rx="1" fill={`${a}30`} />
      <rect x="22" y="66" width="12" height="3" rx="1" fill={a} opacity="0.45" />
    </Pictogram>
  );
}

function Thumb_LotesConfig({ a }: { a: string }) {
  // Slider/dial com marker
  return (
    <Pictogram>
      <line x1="22" y1="50" x2="78" y2="50" stroke={a} strokeWidth="1.2" opacity="0.3" />
      <line x1="22" y1="50" x2="45" y2="50" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="45" cy="50" r="5" fill={a} stroke="#0a0a0c" strokeWidth="1.5" />
      <line x1="22" y1="45" x2="22" y2="55" stroke={a} strokeWidth="0.8" opacity="0.5" />
      <line x1="78" y1="45" x2="78" y2="55" stroke={a} strokeWidth="0.8" opacity="0.5" />
    </Pictogram>
  );
}

function Thumb_MultiContas({ a }: { a: string }) {
  // 3 retângulos lado a lado — 3 contas
  return (
    <Pictogram>
      <rect x="22" y="38" width="16" height="24" rx="1.5" fill={a} opacity="0.35" />
      <rect x="42" y="38" width="16" height="24" rx="1.5" fill={a} opacity="0.6" />
      <rect x="62" y="38" width="16" height="24" rx="1.5" fill={a} />
    </Pictogram>
  );
}

// ─── Módulo 6: Psicologia ──────────────────────────────────────

function Thumb_Espiral({ a }: { a: string }) {
  // Espiral decay — espiral da morte
  return (
    <Pictogram>
      <path
        d="M 50 30 Q 65 30 65 45 Q 65 60 50 60 Q 38 60 38 50 Q 38 42 46 42 Q 52 42 52 48"
        stroke={a}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="52" cy="48" r="1.5" fill={a} />
    </Pictogram>
  );
}

function Thumb_NumeroRedondo({ a }: { a: string }) {
  // Zero gigante com linha cruzando
  return (
    <Pictogram>
      <circle cx="50" cy="50" r="20" fill="none" stroke={a} strokeWidth="2.5" />
      <line x1="32" y1="50" x2="68" y2="50" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
    </Pictogram>
  );
}

function Thumb_Habitos({ a }: { a: string }) {
  // Streak de 5 dots todos preenchidos
  return (
    <Pictogram>
      {[28, 39, 50, 61, 72].map((x, i) => (
        <circle key={x} cx={x} cy="50" r={i === 4 ? "4.5" : "3.5"} fill={a} opacity={0.5 + i * 0.12} />
      ))}
    </Pictogram>
  );
}

// ─── Módulo 7: Aplicação & Consolidação ────────────────────────

function Thumb_Piramide({ a }: { a: string }) {
  // Pirâmide de 5 níveis — método consolidado
  const tiers = [
    { y: 26, w: 14 },
    { y: 36, w: 24 },
    { y: 46, w: 34 },
    { y: 56, w: 44 },
    { y: 66, w: 54 },
  ];
  return (
    <Pictogram>
      {tiers.map((t, i) => (
        <rect
          key={i}
          x={(100 - t.w) / 2}
          y={t.y}
          width={t.w}
          height="8"
          rx="0.5"
          fill={a}
          opacity={1 - i * 0.13}
        />
      ))}
    </Pictogram>
  );
}

function Thumb_EstudoCaso({ a }: { a: string }) {
  // Check em círculo — trade fechado com sucesso
  return (
    <Pictogram>
      <circle cx="50" cy="50" r="22" fill="none" stroke={a} strokeWidth="2" opacity="0.4" />
      <path d="M 38 50 L 46 58 L 62 42" stroke={a} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Pictogram>
  );
}

function Thumb_ProximosPassos({ a }: { a: string }) {
  // Seta avançando com dot de destino
  return (
    <Pictogram>
      <line x1="22" y1="50" x2="68" y2="50" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 60 42 L 70 50 L 60 58" stroke={a} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="76" cy="50" r="3.5" fill={a} />
    </Pictogram>
  );
}

/* ────────────────────────────────────────────
   Render dispatcher
   ──────────────────────────────────────────── */

const THUMBS: Record<ThumbKind, (props: { a: string }) => React.ReactElement> = {
  // Módulo 1
  "mindset": Thumb_Mindset,
  "tradingview": Thumb_TradingView,
  "timeframes": Thumb_Timeframes,
  "candle": Thumb_Candle,
  "gestao-risco": Thumb_GestaoRisco,
  // Módulo 2
  "premium-discount": Thumb_PremiumDiscount,
  "varejo-smart": Thumb_VarejoSmart,
  "order-block": Thumb_OrderBlock,
  "liquidez": Thumb_Liquidez,
  "fvg": Thumb_FVG,
  "ifvg-breaker": Thumb_IFVGBreaker,
  "heatmap": Thumb_Heatmap,
  // Módulo 3
  "amd": Thumb_AMD,
  "sessoes": Thumb_Sessoes,
  "daily-bias": Thumb_DailyBias,
  "candle-careca": Thumb_CandleCareca,
  "std-deviation": Thumb_StdDeviation,
  "market-maker": Thumb_MarketMaker,
  // Módulo 4
  "marcacao": Thumb_Marcacao,
  "confluencia": Thumb_Confluencia,
  "unicornio": Thumb_Unicornio,
  "continuacao": Thumb_Continuacao,
  "amd-sweep": Thumb_AMDSweep,
  "rr-lotes": Thumb_RRLotes,
  // Módulo 5
  "mesa-intro": Thumb_MesaIntro,
  "drawdown": Thumb_Drawdown,
  "lotes-config": Thumb_LotesConfig,
  "multi-contas": Thumb_MultiContas,
  // Módulo 6
  "espiral": Thumb_Espiral,
  "numero-redondo": Thumb_NumeroRedondo,
  "habitos": Thumb_Habitos,
  // Módulo 7
  "piramide": Thumb_Piramide,
  "estudo-caso": Thumb_EstudoCaso,
  "proximos-passos": Thumb_ProximosPassos,
};

export function LessonThumb({ kind, accent }: { kind: ThumbKind; accent: string }) {
  const Pict = THUMBS[kind] ?? Thumb_Mindset;
  return (
    <ThumbBase accent={accent}>
      <Pict a={accent} />
    </ThumbBase>
  );
}

/** Map lesson id (novo currículo Elite 4.0) para sua ThumbKind. */
export function lessonThumbKind(lessonId: string): ThumbKind {
  const map: Record<string, ThumbKind> = {
    // Módulo 1 — Base
    "mindset-filosofia": "mindset",
    "tradingview-setup": "tradingview",
    "timeframes-top-down": "timeframes",
    "candle-mercados": "candle",
    "gestao-capital-risco": "gestao-risco",
    // Módulo 2 — Leitura SMC
    "premium-discount": "premium-discount",
    "varejo-vs-smart-money": "varejo-smart",
    "order-block": "order-block",
    "bsl-ssl": "liquidez",
    "fvg": "fvg",
    "ifvg-breaker": "ifvg-breaker",
    "heatmap": "heatmap",
    // Módulo 3 — Estratégia & Sessões
    "amd-juda-sweep": "amd",
    "sessoes-killzones": "sessoes",
    "daily-bias": "daily-bias",
    "candle-careca": "candle-careca",
    "standard-deviation": "std-deviation",
    "micro-amd-mmm": "market-maker",
    // Módulo 4 — Execução & Setups
    "ordem-marcacao": "marcacao",
    "confluencia-setups": "confluencia",
    "setup-unicornio": "unicornio",
    "setup-continuacao": "continuacao",
    "setup-amd-sweep": "amd-sweep",
    "rr-lotes-pavios": "rr-lotes",
    // Módulo 5 — Mesas Proprietárias
    "mesa-prop-intro": "mesa-intro",
    "drawdown-fases": "drawdown",
    "lotes-risk-settings": "lotes-config",
    "gestao-multi-contas": "multi-contas",
    // Módulo 6 — Psicologia
    "espiral-da-morte": "espiral",
    "numero-redondo": "numero-redondo",
    "habitos-trader": "habitos",
    // Módulo 7 — Aplicação & Consolidação
    "piramide-conceitos": "piramide",
    "estudo-caso-trade": "estudo-caso",
    "proximos-passos": "proximos-passos",
  };
  return map[lessonId] ?? "mindset";
}
