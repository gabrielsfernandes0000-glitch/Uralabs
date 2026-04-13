"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Check, Lock, Clock, BookOpen, FileText, Calendar } from "lucide-react";

/* ────────────────────────────────────────────
   Curriculum Data — Elite 4.0
   ──────────────────────────────────────────── */

interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  hasQuiz: boolean;
  hasPdf: boolean;
}

interface Module {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accentHex: string;
  lessons: Lesson[];
}

const CURRICULUM: Module[] = [
  {
    id: "base",
    number: "01",
    title: "Base",
    subtitle: "Fundamentos",
    description: "Do zero ao gráfico. Mindset, ferramentas e gerenciamento de risco.",
    accentHex: "#FF5500",
    lessons: [
      { id: "intro", title: "Introdução ao Trade", subtitle: "O que é trade, como funciona a mentoria, mindset profissional", duration: "20min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "leitura-candle", title: "Leitura de Candle", subtitle: "Timeframes, o que é um candle, como ler preço no gráfico", duration: "18min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "risco", title: "Gerenciamento de Risco", subtitle: "1% diário, 2.5% semanal — as regras que te mantêm vivo", duration: "22min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
    ],
  },
  {
    id: "leitura-smc",
    number: "02",
    title: "Leitura SMC",
    subtitle: "Smart Money Concepts",
    description: "Order Blocks, FVG, Premium & Discount, Liquidez.",
    accentHex: "#3B82F6",
    lessons: [
      { id: "order-blocks", title: "Order Blocks", subtitle: "Zonas institucionais — onde os grandes players se posicionam", duration: "25min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "fvg-breaker", title: "FVG & Breaker Blocks", subtitle: "Fair Value Gaps, preenchimento e confluência com OB", duration: "20min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "premium-discount", title: "Premium & Discount", subtitle: "Fibonacci 50% — onde comprar e onde vender", duration: "18min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "liquidez", title: "Liquidez", subtitle: "Buy side, sell side — onde as sardinhas estão posicionadas", duration: "22min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
    ],
  },
  {
    id: "estrategia",
    number: "03",
    title: "Estratégia",
    subtitle: "Setup Operacional",
    description: "AMD, Sessões, Daily Bias, SMT.",
    accentHex: "#A855F7",
    lessons: [
      { id: "sessoes", title: "Sessões de Mercado", subtitle: "Ásia, Londres, Nova York — horários e comportamento", duration: "22min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "amd", title: "AMD", subtitle: "Acumulação, Manipulação, Distribuição — o padrão mestre", duration: "25min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "daily-bias", title: "Daily Bias & Judas Swing", subtitle: "Como montar viés antes do mercado abrir", duration: "20min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "smt", title: "SMT Divergence", subtitle: "Divergência NQ/SP500 — confirmação ou alerta", duration: "18min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
    ],
  },
  {
    id: "execucao",
    number: "04",
    title: "Execução",
    subtitle: "Na Prática",
    description: "Entrada, saída, mesas proprietárias.",
    accentHex: "#10B981",
    lessons: [
      { id: "entrada-saida", title: "Entrada & Saída", subtitle: "Quando apertar o botão — stop, alvo, 1.5-3R", duration: "22min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "mesas-prop", title: "Mesas Proprietárias", subtitle: "FundingPips, TopStep — fases, regras, qual escolher", duration: "25min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
      { id: "gerenciamento-contas", title: "Gerenciamento de Contas", subtitle: "Priorizar por fase, drawdown, quando parar", duration: "20min", completed: false, locked: false, hasQuiz: true, hasPdf: true },
    ],
  },
  {
    id: "operacao",
    number: "05",
    title: "Operação",
    subtitle: "Prática Real",
    description: "Calls ao vivo, revisão de trades, accountability.",
    accentHex: "#EF4444",
    lessons: [],
  },
];

/* ────────────────────────────────────────────
   Shared Thumbnail Shell — base layers every thumb has
   ──────────────────────────────────────────── */

function ThumbShell({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: "#0e0e10" }}>
      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 70% 70% at 60% 40%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 60% 40%, black 20%, transparent 75%)"
      }} />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${accent}60 30%, ${accent}40 70%, transparent)`
      }} />
      {children}
    </div>
  );
}

/* ThumbTitle removed — title lives in card content area for cleaner hierarchy */

/* ────────────────────────────────────────────
   14 Unique Thumbnails — one per lesson
   ──────────────────────────────────────────── */

/* 01.01 — Introdução ao Trade: rocket/launch visual */
function Thumb_Intro({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 70% 60% at 30% 60%, ${a}20, transparent 60%),
                     radial-gradient(ellipse 50% 50% at 80% 20%, ${a}10, transparent 50%)`
      }} />
      {/* Rising line — trajectory */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <path d="M 40 190 Q 120 180 180 140 Q 240 100 280 60 Q 320 20 380 10" stroke={a + "40"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 40 190 Q 120 180 180 140 Q 240 100 280 60 Q 320 20 380 10" stroke={a + "15"} strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* Spark at top */}
        <circle cx="380" cy="10" r="4" fill={a + "70"} />
        <circle cx="380" cy="10" r="10" fill={a + "15"} />
        <circle cx="380" cy="10" r="18" fill={a + "08"} />
        {/* Trail dots */}
        {[{x:100,y:185},{x:150,y:160},{x:210,y:125},{x:260,y:80},{x:310,y:40}].map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.5 + i * 0.3} fill={a + "30"} />
        ))}
      </svg>
      {/* Crosshair center element */}
      <div className="absolute top-[22%] right-[18%] w-12 h-12">
        <div className="absolute inset-0 rounded-full border border-dashed" style={{ borderColor: a + "20" }} />
        <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: a + "15" }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: a + "15" }} />
      </div>
    </>
  );
}

/* 01.02 — Leitura de Candle: candle breakdown visual */
function Thumb_Candle({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${a}15, transparent 60%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Large center candle — anatomy */}
        <line x1="200" y1="20" x2="200" y2="200" stroke={a + "30"} strokeWidth="2" />
        <rect x="175" y="60" width="50" height="100" fill={a + "25"} stroke={a + "60"} strokeWidth="2" rx="3" />
        {/* Labels with lines */}
        <line x1="230" y1="20" x2="280" y2="20" stroke={a + "30"} strokeWidth="1" />
        <text x="284" y="24" fill={a + "70"} fontSize="10" fontFamily="monospace">HIGH</text>
        <line x1="230" y1="60" x2="280" y2="45" stroke={a + "30"} strokeWidth="1" />
        <text x="284" y="49" fill={a + "70"} fontSize="10" fontFamily="monospace">OPEN</text>
        <line x1="230" y1="160" x2="280" y2="155" stroke={a + "30"} strokeWidth="1" />
        <text x="284" y="159" fill={a + "70"} fontSize="10" fontFamily="monospace">CLOSE</text>
        <line x1="230" y1="200" x2="280" y2="185" stroke={a + "30"} strokeWidth="1" />
        <text x="284" y="189" fill={a + "70"} fontSize="10" fontFamily="monospace">LOW</text>
        {/* Body label */}
        <text x="150" y="115" textAnchor="end" fill={a + "50"} fontSize="10" fontFamily="monospace">BODY</text>
        <line x1="155" y1="112" x2="172" y2="110" stroke={a + "25"} strokeWidth="1" />
        {/* Small comparison candles */}
        {[{x:60,bull:true,t:70,b:140},{x:90,bull:false,t:50,b:110},{x:120,bull:true,t:80,b:160}].map((c,i) => (
          <g key={i}>
            <line x1={c.x} y1={c.t-15} x2={c.x} y2={c.b+15} stroke={a + "20"} strokeWidth="1.5" />
            <rect x={c.x-6} y={c.t} width="12" height={c.b-c.t} fill={c.bull?a+"20":"transparent"} stroke={a+"35"} strokeWidth="1" rx="1.5" />
          </g>
        ))}
      </svg>
    </>
  );
}

/* 01.03 — Gerenciamento de Risco: shield + percentages */
function Thumb_Risco({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 50% 60% at 35% 45%, ${a}18, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Shield shape */}
        <path d="M 140 30 L 200 15 L 260 30 L 260 120 Q 260 170 200 195 Q 140 170 140 120 Z"
          fill={a + "08"} stroke={a + "35"} strokeWidth="2" />
        <path d="M 165 55 L 200 45 L 235 55 L 235 110 Q 235 145 200 160 Q 165 145 165 110 Z"
          fill={a + "06"} stroke={a + "20"} strokeWidth="1" strokeDasharray="4 3" />
        {/* Checkmark inside */}
        <polyline points="185,105 197,118 220,85" stroke={a + "50"} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right side — risk rules */}
        <text x="290" y="65" fill={a + "80"} fontSize="13" fontFamily="monospace" fontWeight="bold">1%</text>
        <text x="330" y="65" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">/dia</text>
        <line x1="290" y1="75" x2="370" y2="75" stroke={a + "15"} strokeWidth="1" />
        <text x="290" y="100" fill={a + "80"} fontSize="13" fontFamily="monospace" fontWeight="bold">2.5%</text>
        <text x="342" y="100" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">/sem</text>
        <line x1="290" y1="110" x2="370" y2="110" stroke={a + "15"} strokeWidth="1" />
        <text x="290" y="135" fill={a + "80"} fontSize="13" fontFamily="monospace" fontWeight="bold">1.5-3R</text>
        <text x="290" y="152" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">alvo</text>
      </svg>
    </>
  );
}

/* 02.01 — Order Blocks: highlighted zone on chart */
function Thumb_OB({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 50% at 45% 40%, ${a}18, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <polyline points="30,170 60,165 90,155 120,140 140,150 155,120 170,125 190,90 210,95 230,70 260,75 290,55 320,60 350,40 380,35"
          stroke={a+"40"} strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* OB zone highlighted */}
        <rect x="110" y="115" width="85" height="40" fill={a+"18"} stroke={a+"50"} strokeWidth="1.5" rx="3" />
        <text x="152" y="140" textAnchor="middle" fill={a+"90"} fontSize="14" fontFamily="monospace" fontWeight="bold">OB</text>
        {/* Arrow showing bounce */}
        <path d="M 155 155 Q 160 180 175 165 Q 190 150 200 95" stroke={a+"40"} strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <polygon points="198,90 204,100 193,98" fill={a+"50"} />
        {/* Institutional icon */}
        <rect x="300" y="80" width="60" height="45" fill={a+"06"} stroke={a+"20"} strokeWidth="1" rx="4" />
        <text x="330" y="100" textAnchor="middle" fill={a+"50"} fontSize="8" fontFamily="monospace">SMART</text>
        <text x="330" y="115" textAnchor="middle" fill={a+"50"} fontSize="8" fontFamily="monospace">MONEY</text>
      </svg>
    </>
  );
}

/* 02.02 — FVG & Breaker: gaps in price */
function Thumb_FVG({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 55% 55% at 50% 45%, ${a}15, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Three candles showing FVG gap */}
        {/* Candle 1 — bullish up */}
        <line x1="120" y1="50" x2="120" y2="160" stroke={a+"35"} strokeWidth="2" />
        <rect x="105" y="80" width="30" height="60" fill={a+"30"} stroke={a+"50"} strokeWidth="1.5" rx="2" />
        {/* Gap zone */}
        <rect x="140" y="80" width="80" height="30" fill={a+"12"} stroke={a+"30"} strokeWidth="1" rx="2" strokeDasharray="5 3" />
        <text x="180" y="99" textAnchor="middle" fill={a+"70"} fontSize="12" fontFamily="monospace" fontWeight="bold">FVG</text>
        {/* Candle 2 — big move */}
        <line x1="180" y1="20" x2="180" y2="110" stroke={a+"35"} strokeWidth="2" />
        <rect x="165" y="30" width="30" height="50" fill={a+"30"} stroke={a+"50"} strokeWidth="1.5" rx="2" />
        {/* Candle 3 */}
        <line x1="240" y1="35" x2="240" y2="120" stroke={a+"35"} strokeWidth="2" />
        <rect x="225" y="45" width="30" height="40" fill={a+"30"} stroke={a+"50"} strokeWidth="1.5" rx="2" />
        {/* Breaker block */}
        <rect x="280" y="130" width="80" height="35" fill={a+"08"} stroke={a+"25"} strokeWidth="1" rx="3" />
        <text x="320" y="148" textAnchor="middle" fill={a+"55"} fontSize="9" fontFamily="monospace">BREAKER</text>
        <text x="320" y="160" textAnchor="middle" fill={a+"55"} fontSize="9" fontFamily="monospace">BLOCK</text>
        {/* Arrow showing fill */}
        <path d="M 280 140 L 260 125 L 250 110" stroke={a+"30"} strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
      </svg>
    </>
  );
}

/* 02.03 — Premium & Discount: fibonacci zones */
function Thumb_PD({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${a}12, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Premium zone — top */}
        <rect x="50" y="10" width="300" height="95" fill="#EF444408" stroke="#EF444418" strokeWidth="1" rx="4" />
        <text x="70" y="35" fill="#EF444460" fontSize="11" fontFamily="monospace" fontWeight="bold">PREMIUM</text>
        <text x="70" y="50" fill="#EF444435" fontSize="9" fontFamily="monospace">Zona de venda</text>
        {/* Equilibrium line */}
        <line x1="50" y1="110" x2="350" y2="110" stroke={a+"50"} strokeWidth="2" strokeDasharray="8 4" />
        <text x="355" y="114" fill={a+"80"} fontSize="12" fontFamily="monospace" fontWeight="bold">50%</text>
        <text x="355" y="128" fill={a+"50"} fontSize="9" fontFamily="monospace">EQ</text>
        {/* Discount zone — bottom */}
        <rect x="50" y="115" width="300" height="95" fill="#10B98108" stroke="#10B98118" strokeWidth="1" rx="4" />
        <text x="70" y="150" fill="#10B98160" fontSize="11" fontFamily="monospace" fontWeight="bold">DISCOUNT</text>
        <text x="70" y="165" fill="#10B98135" fontSize="9" fontFamily="monospace">Zona de compra</text>
        {/* Fibonacci levels */}
        {[{y:35,l:"0%"},{y:72,l:"38.2%"},{y:110,l:"50%"},{y:145,l:"61.8%"},{y:195,l:"100%"}].map((f,i) => (
          <g key={i}>
            <line x1="330" y1={f.y} x2="350" y2={f.y} stroke={a+"25"} strokeWidth="1" />
            <text x="325" y={f.y+4} textAnchor="end" fill={a+"40"} fontSize="8" fontFamily="monospace">{f.l}</text>
          </g>
        ))}
      </svg>
    </>
  );
}

/* 02.04 — Liquidez: pools of liquidity */
function Thumb_Liquidez({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 55% 55% at 55% 40%, ${a}15, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Price line */}
        <polyline points="30,120 70,115 100,125 130,100 160,105 190,80 220,90 250,70 280,65 310,75 340,60 370,50"
          stroke={a+"45"} strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Buy side liquidity — top */}
        <rect x="240" y="20" width="130" height="28" fill="#10B98110" stroke="#10B98130" strokeWidth="1" rx="4" />
        <text x="305" y="39" textAnchor="middle" fill="#10B98170" fontSize="10" fontFamily="monospace" fontWeight="bold">BUY SIDE LQ</text>
        {/* Dots cluster — buy */}
        {[{x:260,y:15},{x:280,y:12},{x:300,y:18},{x:320,y:10},{x:340,y:16},{x:355,y:13}].map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r="3" fill="#10B98140" />
        ))}
        {/* Sell side liquidity — bottom */}
        <rect x="30" y="170" width="140" height="28" fill="#EF444410" stroke="#EF444430" strokeWidth="1" rx="4" />
        <text x="100" y="189" textAnchor="middle" fill="#EF444470" fontSize="10" fontFamily="monospace" fontWeight="bold">SELL SIDE LQ</text>
        {/* Dots cluster — sell */}
        {[{x:50,y:205},{x:70,y:208},{x:90,y:203},{x:110,y:210},{x:130,y:206},{x:150,y:202}].map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r="3" fill="#EF444440" />
        ))}
        {/* Sweep arrows */}
        <path d="M 370 50 Q 380 30 365 18" stroke={a+"35"} strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M 30 120 Q 20 140 35 160" stroke={a+"35"} strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
      </svg>
    </>
  );
}

/* 03.01 — Sessões de Mercado: timeline blocks */
function Thumb_Sessoes({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 70% 50% at 50% 60%, ${a}12, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Timeline bar */}
        <line x1="30" y1="95" x2="370" y2="95" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        {/* Asia */}
        <rect x="30" y="75" width="90" height="40" fill="#6366F115" stroke="#6366F135" strokeWidth="1.5" rx="6" />
        <text x="75" y="100" textAnchor="middle" fill="#6366F180" fontSize="12" fontFamily="monospace" fontWeight="bold">ASIA</text>
        <text x="75" y="65" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">20:00 - 04:00</text>
        {/* London */}
        <rect x="140" y="75" width="100" height="40" fill="#F59E0B15" stroke="#F59E0B35" strokeWidth="1.5" rx="6" />
        <text x="190" y="100" textAnchor="middle" fill="#F59E0B80" fontSize="12" fontFamily="monospace" fontWeight="bold">LONDON</text>
        <text x="190" y="65" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">03:00 - 11:00</text>
        {/* New York */}
        <rect x="260" y="75" width="110" height="40" fill={a+"15"} stroke={a+"35"} strokeWidth="1.5" rx="6" />
        <text x="315" y="100" textAnchor="middle" fill={a+"80"} fontSize="12" fontFamily="monospace" fontWeight="bold">NEW YORK</text>
        <text x="315" y="65" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">09:30 - 16:00</text>
        {/* Kill zone markers */}
        {[{x:45,c:"#6366F1"},{x:155,c:"#F59E0B"},{x:280,c:a}].map((k,i) => (
          <g key={i}>
            <circle cx={k.x} cy="140" r="4" fill={k.c+"30"} stroke={k.c+"50"} strokeWidth="1" />
            <line x1={k.x} y1="115" x2={k.x} y2="136" stroke={k.c+"20"} strokeWidth="1" strokeDasharray="2 2" />
          </g>
        ))}
        <text x="200" y="155" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">KILL ZONES</text>
      </svg>
    </>
  );
}

/* 03.02 — AMD: the master pattern */
function Thumb_AMD({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${a}15, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* AMD price action — the full pattern */}
        <polyline points="30,110 50,108 65,112 80,107 95,115 110,105 120,118 130,120 140,108 150,130 155,95 165,70 175,75 185,50 200,55 215,45 230,48 250,42 270,38 290,35 310,40 330,35 350,30 370,32"
          stroke={a+"50"} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        {/* Phase zones */}
        <rect x="30" y="20" width="120" height="180" fill={a+"04"} rx="4" />
        <rect x="130" y="20" width="80" height="180" fill={a+"08"} rx="4" />
        <rect x="200" y="20" width="170" height="180" fill={a+"04"} rx="4" />
        {/* Phase labels — big */}
        <text x="90" y="185" textAnchor="middle" fill={a+"60"} fontSize="22" fontWeight="900" fontFamily="monospace">A</text>
        <text x="170" y="185" textAnchor="middle" fill={a+"80"} fontSize="22" fontWeight="900" fontFamily="monospace">M</text>
        <text x="285" y="185" textAnchor="middle" fill={a+"60"} fontSize="22" fontWeight="900" fontFamily="monospace">D</text>
        {/* Sub-labels */}
        <text x="90" y="205" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace">ACUMULAÇÃO</text>
        <text x="170" y="205" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">MANIPULAÇÃO</text>
        <text x="285" y="205" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace">DISTRIBUIÇÃO</text>
        {/* Manipulation sweep */}
        <path d="M 140 108 Q 135 135 150 130" stroke="#EF444440" strokeWidth="1.5" fill="none" />
        <text x="145" y="145" textAnchor="middle" fill="#EF444450" fontSize="7" fontFamily="monospace">SWEEP</text>
      </svg>
    </>
  );
}

/* 03.03 — Daily Bias & Judas Swing */
function Thumb_Bias({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 55% 55% at 40% 40%, ${a}15, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Day structure — candle */}
        <rect x="60" y="40" width="80" height="140" fill={a+"06"} stroke={a+"20"} strokeWidth="1" rx="4" />
        <text x="100" y="30" textAnchor="middle" fill={a+"50"} fontSize="10" fontFamily="monospace" fontWeight="bold">DAILY</text>
        {/* Bias arrow — bullish */}
        <line x1="100" y1="170" x2="100" y2="55" stroke="#10B98150" strokeWidth="3" strokeLinecap="round" />
        <polygon points="92,60 100,42 108,60" fill="#10B98150" />
        <text x="100" y="195" textAnchor="middle" fill="#10B98170" fontSize="10" fontFamily="monospace" fontWeight="bold">BULLISH BIAS</text>
        {/* Judas swing illustration — right side */}
        <polyline points="200,120 220,115 240,125 250,135 255,140 260,120 275,80 290,75 310,60 330,50 350,45 370,40"
          stroke={a+"45"} strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Judas sweep down */}
        <path d="M 240 125 L 255 140" stroke="#EF444450" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="255" cy="140" r="4" fill="#EF444430" stroke="#EF444450" strokeWidth="1" />
        <text x="265" y="155" fill="#EF444460" fontSize="8" fontFamily="monospace">JUDAS</text>
        <text x="265" y="165" fill="#EF444460" fontSize="8" fontFamily="monospace">SWING</text>
        {/* True move arrow */}
        <path d="M 270 130 C 280 110 290 90 310 60" stroke="#10B98140" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <text x="320" y="45" fill="#10B98160" fontSize="8" fontFamily="monospace">TRUE MOVE</text>
      </svg>
    </>
  );
}

/* 03.04 — SMT Divergence: NQ vs SP500 */
function Thumb_SMT({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 55% at 50% 45%, ${a}12, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* NQ line */}
        <polyline points="30,100 70,95 110,90 140,85 170,75 200,90 230,60 260,55 290,50 320,45 360,40"
          stroke={a+"60"} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <text x="365" y="38" fill={a+"80"} fontSize="10" fontFamily="monospace" fontWeight="bold">NQ</text>
        {/* SP500 line — diverging */}
        <polyline points="30,110 70,108 110,105 140,100 170,95 200,110 230,80 260,85 290,90 320,95 360,100"
          stroke="#F59E0B60" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <text x="365" y="103" fill="#F59E0B80" fontSize="10" fontFamily="monospace" fontWeight="bold">ES</text>
        {/* Divergence zone highlighted */}
        <rect x="250" y="35" width="80" height="75" fill={a+"06"} stroke={a+"20"} strokeWidth="1" rx="4" strokeDasharray="4 3" />
        <text x="290" y="130" textAnchor="middle" fill={a+"70"} fontSize="13" fontFamily="monospace" fontWeight="bold">SMT</text>
        <text x="290" y="145" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">DIVERGENCE</text>
        {/* Alert icon */}
        <polygon points="290,155 284,167 296,167" fill="none" stroke="#F59E0B60" strokeWidth="1.5" />
        <text x="290" y="165" textAnchor="middle" fill="#F59E0B70" fontSize="7" fontFamily="monospace" fontWeight="bold">!</text>
      </svg>
    </>
  );
}

/* 04.01 — Entrada & Saída: entry point visual */
function Thumb_Entry({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 55% 55% at 45% 50%, ${a}15, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Price action */}
        <polyline points="30,160 60,155 90,150 120,145 150,130 170,140 180,150 190,125 210,100 240,85 270,75 300,65 330,55 360,45 385,40"
          stroke={a+"45"} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        {/* Entry point — highlighted */}
        <circle cx="190" cy="125" r="8" fill="none" stroke={a+"70"} strokeWidth="2" />
        <circle cx="190" cy="125" r="3" fill={a+"70"} />
        <line x1="200" y1="125" x2="240" y2="125" stroke={a+"30"} strokeWidth="1" strokeDasharray="3 2" />
        <text x="245" y="129" fill={a+"80"} fontSize="11" fontFamily="monospace" fontWeight="bold">ENTRY</text>
        {/* Take profit */}
        <line x1="30" y1="45" x2="385" y2="45" stroke="#10B98140" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x="380" y="38" textAnchor="end" fill="#10B98180" fontSize="11" fontFamily="monospace" fontWeight="bold">TP +3R</text>
        {/* Stop loss */}
        <line x1="130" y1="160" x2="280" y2="160" stroke="#EF444440" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x="285" y="164" fill="#EF444480" fontSize="11" fontFamily="monospace" fontWeight="bold">SL -1R</text>
        {/* R:R box */}
        <rect x="320" y="90" width="55" height="40" fill={a+"10"} stroke={a+"30"} strokeWidth="1.5" rx="6" />
        <text x="347" y="108" textAnchor="middle" fill={a+"50"} fontSize="9" fontFamily="monospace">R:R</text>
        <text x="347" y="124" textAnchor="middle" fill={a+"90"} fontSize="16" fontFamily="monospace" fontWeight="bold">3:1</text>
      </svg>
    </>
  );
}

/* 04.02 — Mesas Proprietárias: funded accounts */
function Thumb_Mesas({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${a}12, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Phase progression — stepped */}
        <rect x="40" y="50" width="90" height="55" fill={a+"10"} stroke={a+"30"} strokeWidth="1.5" rx="6" />
        <text x="85" y="72" textAnchor="middle" fill={a+"70"} fontSize="10" fontFamily="monospace" fontWeight="bold">FASE 1</text>
        <text x="85" y="90" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">Avaliação</text>
        {/* Arrow */}
        <line x1="135" y1="77" x2="155" y2="77" stroke={a+"30"} strokeWidth="1.5" />
        <polygon points="155,73 163,77 155,81" fill={a+"40"} />
        <rect x="165" y="50" width="90" height="55" fill={a+"14"} stroke={a+"35"} strokeWidth="1.5" rx="6" />
        <text x="210" y="72" textAnchor="middle" fill={a+"80"} fontSize="10" fontFamily="monospace" fontWeight="bold">FASE 2</text>
        <text x="210" y="90" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">Verificação</text>
        {/* Arrow */}
        <line x1="260" y1="77" x2="280" y2="77" stroke={a+"30"} strokeWidth="1.5" />
        <polygon points="280,73 288,77 280,81" fill={a+"40"} />
        <rect x="290" y="50" width="80" height="55" fill={a+"18"} stroke={a+"40"} strokeWidth="1.5" rx="6" />
        <text x="330" y="72" textAnchor="middle" fill={a+"90"} fontSize="10" fontFamily="monospace" fontWeight="bold">FUNDED</text>
        <text x="330" y="90" textAnchor="middle" fill="#10B98160" fontSize="8" fontFamily="monospace">$$$</text>
        {/* Providers */}
        <text x="120" y="145" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">FundingPips</text>
        <text x="280" y="145" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">TopStep</text>
        <line x1="60" y1="155" x2="180" y2="155" stroke={a+"12"} strokeWidth="1" />
        <line x1="220" y1="155" x2="340" y2="155" stroke={a+"12"} strokeWidth="1" />
      </svg>
    </>
  );
}

/* 04.03 — Gerenciamento de Contas: multi-account dashboard */
function Thumb_GerContas({ a }: { a: string }) {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 55% 55% at 50% 45%, ${a}12, transparent 55%)`
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        {/* Account cards — mini dashboard */}
        <rect x="30" y="35" width="105" height="70" fill={a+"08"} stroke={a+"25"} strokeWidth="1.5" rx="6" />
        <text x="82" y="55" textAnchor="middle" fill={a+"60"} fontSize="9" fontFamily="monospace">CONTA #1</text>
        <text x="82" y="78" textAnchor="middle" fill="#10B98180" fontSize="16" fontFamily="monospace" fontWeight="bold">$25K</text>
        <text x="82" y="95" textAnchor="middle" fill="#10B98150" fontSize="8" fontFamily="monospace">Fase 2 — 72%</text>

        <rect x="148" y="35" width="105" height="70" fill={a+"08"} stroke={a+"25"} strokeWidth="1.5" rx="6" />
        <text x="200" y="55" textAnchor="middle" fill={a+"60"} fontSize="9" fontFamily="monospace">CONTA #2</text>
        <text x="200" y="78" textAnchor="middle" fill={a+"80"} fontSize="16" fontFamily="monospace" fontWeight="bold">$50K</text>
        <text x="200" y="95" textAnchor="middle" fill="#F59E0B50" fontSize="8" fontFamily="monospace">Fase 1 — 45%</text>

        <rect x="266" y="35" width="105" height="70" fill={a+"08"} stroke={a+"25"} strokeWidth="1.5" rx="6" />
        <text x="318" y="55" textAnchor="middle" fill={a+"60"} fontSize="9" fontFamily="monospace">CONTA #3</text>
        <text x="318" y="78" textAnchor="middle" fill="#10B98180" fontSize="16" fontFamily="monospace" fontWeight="bold">$10K</text>
        <text x="318" y="95" textAnchor="middle" fill="#10B98150" fontSize="8" fontFamily="monospace">Funded ✓</text>

        {/* Priority arrow */}
        <text x="200" y="135" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">PRIORIDADE DE RISCO</text>
        <line x1="80" y1="145" x2="320" y2="145" stroke={a+"20"} strokeWidth="1.5" />
        <polygon points="320,141 330,145 320,149" fill={a+"30"} />
        {/* Drawdown indicator */}
        <rect x="120" y="160" width="160" height="20" fill={a+"06"} stroke={a+"15"} strokeWidth="1" rx="3" />
        <rect x="120" y="160" width="96" height="20" fill="#EF444415" rx="3" />
        <text x="200" y="174" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="monospace">DRAWDOWN TOTAL: 60%</text>
      </svg>
    </>
  );
}

/* ────────────────────────────────────────────
   Thumbnail Router — picks the right visual per lesson
   ──────────────────────────────────────────── */

function LessonThumbnail({ lesson, mod, index }: { lesson: Lesson; mod: Module; index: number }) {
  const a = mod.accentHex;

  const thumbMap: Record<string, React.ReactNode> = {
    "intro": <Thumb_Intro a={a} />,
    "leitura-candle": <Thumb_Candle a={a} />,
    "risco": <Thumb_Risco a={a} />,
    "order-blocks": <Thumb_OB a={a} />,
    "fvg-breaker": <Thumb_FVG a={a} />,
    "premium-discount": <Thumb_PD a={a} />,
    "liquidez": <Thumb_Liquidez a={a} />,
    "sessoes": <Thumb_Sessoes a={a} />,
    "amd": <Thumb_AMD a={a} />,
    "daily-bias": <Thumb_Bias a={a} />,
    "smt": <Thumb_SMT a={a} />,
    "entrada-saida": <Thumb_Entry a={a} />,
    "mesas-prop": <Thumb_Mesas a={a} />,
    "gerenciamento-contas": <Thumb_GerContas a={a} />,
  };

  return (
    <ThumbShell accent={a}>
      {thumbMap[lesson.id] || null}
      {/* Soft bottom fade — no text, just blends into content area */}
      <div className="absolute bottom-0 left-0 right-0 h-12 z-10"
        style={{ background: "linear-gradient(to top, #141417, transparent)" }} />
    </ThumbShell>
  );
}

/* ────────────────────────────────────────────
   Netflix Card
   ──────────────────────────────────────────── */

function NetflixCard({ lesson, mod, index }: { lesson: Lesson; mod: Module; index: number }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (!lesson.locked) router.push(`/elite/aulas/${lesson.id}`);
  };

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          lesson.locked
            ? "border-white/[0.04] opacity-45"
            : "border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-1"
        }`}
        style={
          hovered && !lesson.locked
            ? { boxShadow: `0 16px 60px ${mod.accentHex}20` }
            : undefined
        }
      >
        {/* Thumbnail area — 16:9 ratio */}
        <div className="relative aspect-video overflow-hidden">
          <LessonThumbnail lesson={lesson} mod={mod} index={index} />

          {/* Lock overlay */}
          {lesson.locked && (
            <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.10] flex items-center justify-center">
                <Lock className="w-5 h-5 text-white/40" />
              </div>
            </div>
          )}

          {/* Completed */}
          {lesson.completed && !lesson.locked && (
            <div className="absolute top-3 left-3">
              <div className="w-7 h-7 rounded-full bg-green-500/25 border border-green-500/50 flex items-center justify-center backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-green-400" />
              </div>
            </div>
          )}

          {/* Play on hover */}
          {!lesson.locked && hovered && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: mod.accentHex }}>
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Content — fixed height */}
        <div className="px-4 pt-3 pb-4 bg-[#141417] h-[110px] flex flex-col">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[12px] font-bold font-mono shrink-0" style={{ color: lesson.locked ? "rgba(255,255,255,0.1)" : mod.accentHex + "70" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={`text-[14px] font-bold tracking-tight leading-snug line-clamp-1 ${lesson.locked ? "text-white/30" : "text-white/90"}`}>
              {lesson.title}
            </h3>
          </div>

          <p className={`text-[11px] leading-relaxed line-clamp-2 flex-1 ${lesson.locked ? "text-white/20" : "text-white/40"}`}>
            {lesson.subtitle}
          </p>

          <div className="flex items-center gap-3 mt-auto pt-1.5">
            <div className={`flex items-center gap-1.5 ${lesson.locked ? "text-white/20" : "text-white/35"}`}>
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">{lesson.duration}</span>
            </div>
            <div className={`w-px h-3 ${lesson.locked ? "bg-white/5" : "bg-white/10"}`} />
            {lesson.hasQuiz && (
              <div className={`flex items-center gap-1 ${lesson.locked ? "text-white/20" : "text-white/30"}`}>
                <BookOpen className="w-3 h-3" />
                <span className="text-[10px]">Quiz</span>
              </div>
            )}
            {lesson.hasPdf && (
              <div className={`flex items-center gap-1 ${lesson.locked ? "text-white/20" : "text-white/30"}`}>
                <FileText className="w-3 h-3" />
                <span className="text-[10px]">PDF</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Module Section — grid layout, no horizontal scroll
   ──────────────────────────────────────────── */

function ModuleSection({ mod }: { mod: Module }) {
  const completed = mod.lessons.filter((l) => l.completed).length;
  const total = mod.lessons.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isLive = mod.id === "operacao";

  if (isLive) {
    return (
      <section id={`module-${mod.id}`}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-1 h-7 rounded-full" style={{ backgroundColor: mod.accentHex + "80" }} />
          <h2 className="text-[22px] font-bold text-white tracking-tight">{mod.title}</h2>
          <span className="text-[13px] text-white/40 font-medium">{mod.subtitle}</span>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141417]">
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 60% 60% at 70% 30%, ${mod.accentHex}12, transparent)`
          }} />
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-40" />
                </div>
                <span className="text-[13px] text-red-400 font-bold uppercase tracking-wider">Ao Vivo</span>
              </div>
              <h3 className="text-[24px] font-bold text-white mb-3">Calls de Operação</h3>
              <p className="text-[14px] text-white/45 leading-relaxed max-w-lg">
                Calls diárias com o URA, revisão de trades e accountability semanal. Disponível após completar o Módulo 4.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1.5">Horário</p>
                <p className="text-[18px] text-white font-bold">10:30 — 12:30</p>
              </div>
              <div className="px-6 py-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1.5">Requer</p>
                <p className="text-[18px] text-white font-bold">Módulo 04</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={`module-${mod.id}`}>
      {/* Section header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-1 h-7 rounded-full" style={{ backgroundColor: mod.accentHex + "80" }} />
        <h2 className="text-[22px] font-bold text-white tracking-tight">{mod.title}</h2>
        <span className="text-[13px] text-white/40 font-medium">{mod.subtitle}</span>
        {total > 0 && (
          <div className="hidden md:flex items-center gap-3 ml-3">
            <div className="w-24 h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: mod.accentHex }} />
            </div>
            <span className="text-[12px] text-white/40 font-mono font-medium">{completed}/{total}</span>
          </div>
        )}
      </div>

      {/* Grid — responsive, no scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mod.lessons.map((lesson, idx) => (
          <NetflixCard key={lesson.id} lesson={lesson} mod={mod} index={idx} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Hero — large featured banner
   ──────────────────────────────────────────── */

function Hero() {
  const router = useRouter();
  const totalLessons = CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = CURRICULUM.flatMap((m) => m.lessons).filter((l) => l.completed).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  let next: { lesson: Lesson; mod: Module; idx: number } | null = null;
  for (const mod of CURRICULUM) {
    for (let i = 0; i < mod.lessons.length; i++) {
      if (!mod.lessons[i].completed && !mod.lessons[i].locked) {
        next = { lesson: mod.lessons[i], mod, idx: i };
        break;
      }
    }
    if (next) break;
  }

  const heroAccent = next?.mod.accentHex || "#FF5500";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] min-h-[320px]" style={{ background: "#111114" }}>
      {/* Background effects */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 80% 80% at 80% 30%, ${heroAccent}15, transparent 60%),
                     radial-gradient(ellipse 50% 50% at 10% 80%, ${heroAccent}08, transparent 40%)`
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 60% 60% at 70% 40%, black 20%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 70% 40%, black 20%, transparent 70%)"
      }} />
      {/* Left fade for readability */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, #111114 30%, #111114aa 50%, transparent 75%)"
      }} />

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 min-h-[320px]">
        <div className="flex-1 flex flex-col justify-end">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: heroAccent + "AA" }}>
            Turma 4.0 · Elite
          </span>

          {next ? (
            <>
              <p className="text-[14px] text-white/45 mb-2">Continue de onde parou</p>
              <h1 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-[1.1] mb-3">
                {next.lesson.title}
              </h1>
              <p className="text-[15px] text-white/45 mb-8 max-w-lg leading-relaxed">{next.lesson.subtitle}</p>

              <div className="flex items-center gap-5 flex-wrap">
                <button
                  onClick={() => next && router.push(`/elite/aulas/${next.lesson.id}`)}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl text-[15px] font-bold transition-all shadow-xl hover:brightness-110 hover:-translate-y-0.5"
                  style={{ backgroundColor: heroAccent, color: "white", boxShadow: `0 8px 32px ${heroAccent}40` }}>
                  <Play className="w-5 h-5 fill-white" />
                  Assistir Aula
                </button>
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="w-4 h-4" />
                  <span className="text-[14px] font-medium">{next.lesson.duration}</span>
                </div>
                <span className="text-[13px] text-white/30 font-medium">
                  Módulo {next.mod.number} · Aula {String(next.idx + 1).padStart(2, "0")}
                </span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight mb-3">Currículo Elite</h1>
              <p className="text-[15px] text-white/45">5 módulos · {totalLessons} aulas · Do zero à mesa proprietária</p>
            </>
          )}
        </div>

        {/* Progress card */}
        <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
          <div className="relative w-[76px] h-[76px]">
            <svg className="w-[76px] h-[76px] -rotate-90" viewBox="0 0 76 76">
              <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="38" cy="38" r="32" fill="none" stroke={heroAccent} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${progress * 2.01} 201`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[20px] font-bold text-white">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-[20px] text-white font-bold">{completedLessons}/{totalLessons}</p>
            <p className="text-[12px] text-white/40 mt-0.5">aulas completas</p>
            <p className="text-[11px] text-white/25 mt-2">
              {CURRICULUM.filter((m) => m.lessons.length > 0 && m.lessons.every((l) => l.completed)).length} de 4 módulos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   Lives Recentes — recorded live sessions (grid + unique thumbs)
   ──────────────────────────────────────────── */

interface LiveRecording {
  id: string;
  title: string;
  date: string;
  duration: string;
  topic: string;
  type: "trade" | "aula" | "revisao";
}

const LIVES_RECENTES: LiveRecording[] = [
  { id: "live-1", title: "Sessão de Trade — NQ", date: "11 Abr", duration: "1h 42min", topic: "AMD na sessão NY, short após manipulação", type: "trade" },
  { id: "live-2", title: "Aula ao Vivo — SMT", date: "09 Abr", duration: "1h 15min", topic: "Divergência NQ/ES confirmando viés bullish", type: "aula" },
  { id: "live-3", title: "Revisão de Trades", date: "07 Abr", duration: "58min", topic: "Revisão das operações da semana dos alunos", type: "revisao" },
  { id: "live-4", title: "Sessão de Trade — NQ", date: "04 Abr", duration: "1h 30min", topic: "Long na sessão London, OB + FVG confluência", type: "trade" },
];

/* Unique thumbnail art per live type */
function LiveThumbArt({ type }: { type: LiveRecording["type"] }) {
  switch (type) {
    case "trade":
      // Live trading — candlesticks + heartbeat line
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Heartbeat / price pulse line */}
          <polyline points="0,100 30,100 45,100 55,60 65,130 75,90 85,95 120,95 140,90 160,50 175,55 195,40 220,45 250,38 280,42 320,30 360,35 400,28"
            stroke="#EF444445" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          {/* Active candles */}
          {[
            { x: 160, o: 55, c: 40, h: 30, l: 65 },
            { x: 195, o: 42, c: 55, h: 35, l: 60 },
            { x: 230, o: 50, c: 38, h: 28, l: 58 },
            { x: 265, o: 40, c: 48, h: 32, l: 55 },
          ].map((c, i) => (
            <g key={i}>
              <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.c < c.o ? "#10B98150" : "#EF444440"} strokeWidth="1.5" />
              <rect x={c.x - 8} y={Math.min(c.o, c.c)} width="16" height={Math.abs(c.c - c.o) || 2}
                fill={c.c < c.o ? "#10B98125" : "transparent"} stroke={c.c < c.o ? "#10B98140" : "#EF444435"} strokeWidth="1" rx="1.5" />
            </g>
          ))}
          {/* Crosshair on current price */}
          <line x1="310" y1="0" x2="310" y2="180" stroke="#EF444418" strokeWidth="1" strokeDasharray="3 4" />
          <line x1="0" y1="32" x2="400" y2="32" stroke="#EF444418" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="310" cy="32" r="4" fill="none" stroke="#EF444450" strokeWidth="1.5" />
        </svg>
      );
    case "aula":
      // Live lesson — whiteboard / presentation feel
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Presentation slide outline */}
          <rect x="60" y="25" width="280" height="130" rx="6" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.15)" strokeWidth="1.5" />
          {/* Content lines — like bullet points */}
          <rect x="85" y="50" width="120" height="4" rx="2" fill="rgba(168,85,247,0.15)" />
          <rect x="85" y="65" width="90" height="4" rx="2" fill="rgba(168,85,247,0.10)" />
          <rect x="85" y="80" width="140" height="4" rx="2" fill="rgba(168,85,247,0.12)" />
          <rect x="85" y="95" width="100" height="4" rx="2" fill="rgba(168,85,247,0.08)" />
          {/* Chart mini diagram on right */}
          <rect x="240" y="45" width="80" height="60" rx="4" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.12)" strokeWidth="1" />
          <polyline points="250,90 260,80 270,85 280,65 290,70 300,55 310,50" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          {/* Pointer / cursor */}
          <circle cx="270" cy="85" r="6" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.30)" strokeWidth="1" />
          <circle cx="270" cy="85" r="2" fill="rgba(168,85,247,0.40)" />
        </svg>
      );
    case "revisao":
      // Review session — checklist / analysis
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Checklist items */}
          {[
            { y: 35, done: true },
            { y: 65, done: true },
            { y: 95, done: false },
            { y: 125, done: false },
          ].map((item, i) => (
            <g key={i}>
              <rect x="100" y={item.y} width="18" height="18" rx="4" fill={item.done ? "#10B98115" : "rgba(255,255,255,0.03)"} stroke={item.done ? "#10B98140" : "rgba(255,255,255,0.08)"} strokeWidth="1.5" />
              {item.done && <polyline points={`${105},${item.y + 10} ${108},${item.y + 13} ${114},${item.y + 6}`} stroke="#10B98170" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="130" y={item.y + 5} width={70 + i * 15} height="4" rx="2" fill={item.done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)"} />
            </g>
          ))}
          {/* Score / result badge */}
          <rect x="260" y="50" width="80" height="75" rx="8" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.18)" strokeWidth="1.5" />
          <text x="300" y="82" textAnchor="middle" fill="rgba(245,158,11,0.50)" fontSize="9" fontFamily="monospace">SCORE</text>
          <text x="300" y="108" textAnchor="middle" fill="rgba(245,158,11,0.70)" fontSize="22" fontFamily="monospace" fontWeight="bold">2/4</text>
        </svg>
      );
  }
}

function LiveCard({ live }: { live: LiveRecording }) {
  const [hovered, setHovered] = useState(false);

  const typeColors: Record<string, { accent: string; label: string }> = {
    trade: { accent: "#EF4444", label: "Trade" },
    aula: { accent: "#A855F7", label: "Aula" },
    revisao: { accent: "#F59E0B", label: "Revisão" },
  };
  const tc = typeColors[live.type];

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 border-white/[0.06] hover:border-white/[0.15] flex`}
        style={hovered ? { boxShadow: `0 8px 32px ${tc.accent}12` } : undefined}>

        {/* Thumbnail — square, left side */}
        <div className="relative w-[140px] shrink-0 overflow-hidden" style={{ background: "#0e0e10" }}>
          {/* Glow */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${tc.accent}12, transparent 60%)`
          }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)"
          }} />
          {/* Left accent line */}
          <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{
            background: `linear-gradient(to bottom, transparent, ${tc.accent}50 30%, ${tc.accent}30 70%, transparent)`
          }} />

          {/* SVG art — compact version */}
          <LiveThumbArt type={live.type} />

          {/* Play on hover */}
          {hovered && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
                style={{ backgroundColor: tc.accent }}>
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Content — right side */}
        <div className="flex-1 px-4 py-3.5 bg-[#141417] flex flex-col justify-between min-h-[100px]">
          {/* Type + date row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tc.accent }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tc.accent + "BB" }}>{tc.label}</span>
            </div>
            <div className="flex items-center gap-1 text-white/30">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px]">{live.date}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[13px] font-bold text-white/90 tracking-tight line-clamp-1 mb-1">
            {live.title}
          </h3>

          {/* Topic */}
          <p className="text-[11px] text-white/30 line-clamp-1 flex-1">
            {live.topic}
          </p>

          {/* Duration */}
          <div className="flex items-center gap-1.5 mt-1.5 text-white/25">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium">{live.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivesSection() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-1 h-7 rounded-full bg-red-500/60" />
        <h2 className="text-[22px] font-bold text-white tracking-tight">Lives Recentes</h2>
        <span className="text-[13px] text-white/40 font-medium">Gravações das aulas ao vivo</span>
      </div>

      {/* 2-column grid — horizontal cards, visually distinct from lesson cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {LIVES_RECENTES.map((live) => (
          <LiveCard key={live.id} live={live} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function AulasPage() {
  return (
    <div className="space-y-14">
      <Hero />
      <LivesSection />

      {CURRICULUM.map((mod) => (
        <ModuleSection key={mod.id} mod={mod} />
      ))}

      <div className="text-center py-6">
        <p className="text-[12px] text-white/30">
          Conteúdo exclusivo Elite 4.0 · Aulas gravadas + lives semanais + calls diárias
        </p>
      </div>
    </div>
  );
}
