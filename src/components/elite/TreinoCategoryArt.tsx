/* ────────────────────────────────────────────
   Artes temáticas SVG por categoria — usadas em:
   · ConceptVisual (Treino Livre, cenários sem gráfico)
   · Cards "Por Tema" (Prática hub)
   Cada arte traduz o conceito visualmente, não só ícone.
   ──────────────────────────────────────────── */

import { Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ArtPsicologia({ a }: { a: string }) {
  // Balança assimétrica — "loss aversion": dor pesa mais que prazer
  return (
    <svg viewBox="0 0 220 140" className="w-full max-w-[280px] h-auto">
      <defs>
        <linearGradient id="pain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#EF4444" stopOpacity="0.6" />
          <stop offset="1" stopColor="#EF4444" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="gain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#10B981" stopOpacity="0.5" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* base + haste */}
      <rect x="105" y="118" width="10" height="14" fill={a} opacity="0.5" rx="2" />
      <rect x="85" y="130" width="50" height="6" fill={a} opacity="0.7" rx="2" />
      <line x1="110" y1="118" x2="110" y2="40" stroke={a} strokeWidth="2" opacity="0.55" />
      {/* barra da balança inclinada (viés da dor) */}
      <line x1="40" y1="62" x2="180" y2="22" stroke={a} strokeWidth="2" opacity="0.8" strokeLinecap="round" />
      {/* prato dor (esquerda, embaixo = mais peso) */}
      <line x1="40" y1="62" x2="40" y2="78" stroke={a} strokeWidth="1.5" opacity="0.5" />
      <rect x="10" y="78" width="60" height="28" fill="url(#pain)" stroke="#EF4444" strokeWidth="1.2" strokeOpacity="0.55" rx="4" />
      <text x="40" y="97" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FCA5A5" fontFamily="monospace">-3R</text>
      {/* prato ganho (direita, em cima = mais leve) */}
      <line x1="180" y1="22" x2="180" y2="38" stroke={a} strokeWidth="1.5" opacity="0.5" />
      <rect x="156" y="38" width="48" height="20" fill="url(#gain)" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.55" rx="4" />
      <text x="180" y="52" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6EE7B7" fontFamily="monospace">+1R</text>
      {/* seta de peso */}
      <path d="M 40 110 L 40 120 M 35 116 L 40 121 L 45 116" stroke="#EF444490" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ArtCandles({ a }: { a: string }) {
  // Trio de candles signature: Doji · Engulfing · Pin bar
  const C = { bg: "#0e0e10", green: "#10B981", red: "#EF4444" };
  return (
    <svg viewBox="0 0 260 140" className="w-full max-w-[300px] h-auto">
      {/* Doji */}
      <line x1="45" y1="15" x2="45" y2="125" stroke="#9CA3AF" strokeWidth="1.5" opacity="0.6" />
      <rect x="36" y="65" width="18" height="10" fill="#9CA3AF" opacity="0.8" />
      <text x="45" y="138" textAnchor="middle" fontSize="9" fill={a} fontWeight="700" fontFamily="monospace">DOJI</text>
      {/* Engulfing bullish */}
      <line x1="120" y1="35" x2="120" y2="110" stroke={C.green} strokeWidth="1.5" opacity="0.7" />
      <rect x="110" y="40" width="20" height="50" fill={C.green} opacity="0.85" rx="1" />
      <line x1="145" y1="60" x2="145" y2="95" stroke={C.red} strokeWidth="1.5" opacity="0.7" />
      <rect x="138" y="68" width="14" height="22" fill={C.red} opacity="0.55" rx="1" />
      <text x="128" y="138" textAnchor="middle" fontSize="9" fill={a} fontWeight="700" fontFamily="monospace">ENGULFING</text>
      {/* Pin bar */}
      <line x1="215" y1="18" x2="215" y2="95" stroke={C.green} strokeWidth="1.5" opacity="0.7" />
      <line x1="215" y1="95" x2="215" y2="120" stroke={C.green} strokeWidth="1.5" opacity="0.4" />
      <rect x="207" y="82" width="16" height="16" fill={C.green} opacity="0.85" rx="1" />
      <text x="215" y="138" textAnchor="middle" fontSize="9" fill={a} fontWeight="700" fontFamily="monospace">PIN BAR</text>
    </svg>
  );
}

export function ArtGestao({ a }: { a: string }) {
  // Anéis concêntricos — camadas de risco (1R, 2R, max drawdown)
  return (
    <svg viewBox="0 0 160 160" className="w-[200px] h-[200px]">
      {[60, 48, 36, 24].map((r, i) => (
        <circle key={i} cx="80" cy="80" r={r}
          fill="none"
          stroke={a}
          strokeWidth="1.2"
          strokeOpacity={0.15 + i * 0.14}
          strokeDasharray={i === 0 ? "4 3" : "0"}
        />
      ))}
      {/* centro — stop tight */}
      <circle cx="80" cy="80" r="14" fill={a} opacity="0.15" />
      <circle cx="80" cy="80" r="6" fill={a} />
      {/* labels */}
      <text x="80" y="22" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={a + "90"} fontFamily="monospace">MAX DD</text>
      <text x="80" y="35" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={a + "a0"} fontFamily="monospace">3R</text>
      <text x="80" y="50" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={a + "b0"} fontFamily="monospace">2R</text>
      <text x="80" y="65" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={a} fontFamily="monospace">1R</text>
    </svg>
  );
}

export function ArtAMD({ a }: { a: string }) {
  // 3 blocos horizontais — Acumulação · Manipulação · Distribuição
  return (
    <svg viewBox="0 0 280 120" className="w-full max-w-[340px] h-auto">
      {/* curva que atravessa as 3 fases */}
      <path d="M 15 55 Q 50 60 80 58 Q 100 90 135 95 Q 150 48 185 25 Q 230 22 265 18"
        stroke={a} strokeWidth="1.5" fill="none" strokeOpacity="0.55" strokeLinecap="round" />
      {/* fase A */}
      <rect x="10" y="20" width="80" height="80" rx="6" fill="#3B82F6" opacity="0.07" stroke="#3B82F6" strokeOpacity="0.35" strokeWidth="1.2" />
      <text x="50" y="68" textAnchor="middle" fontSize="28" fontWeight="900" fill="#3B82F6" opacity="0.7" fontFamily="serif">A</text>
      <text x="50" y="108" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#3B82F6" opacity="0.9" fontFamily="monospace">ACUMULAÇÃO</text>
      {/* fase M */}
      <rect x="100" y="20" width="80" height="80" rx="6" fill="#A855F7" opacity="0.07" stroke="#A855F7" strokeOpacity="0.35" strokeWidth="1.2" />
      <text x="140" y="68" textAnchor="middle" fontSize="28" fontWeight="900" fill="#A855F7" opacity="0.7" fontFamily="serif">M</text>
      <text x="140" y="108" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#A855F7" opacity="0.9" fontFamily="monospace">MANIPULAÇÃO</text>
      {/* fase D */}
      <rect x="190" y="20" width="80" height="80" rx="6" fill="#10B981" opacity="0.07" stroke="#10B981" strokeOpacity="0.35" strokeWidth="1.2" />
      <text x="230" y="68" textAnchor="middle" fontSize="28" fontWeight="900" fill="#10B981" opacity="0.7" fontFamily="serif">D</text>
      <text x="230" y="108" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#10B981" opacity="0.9" fontFamily="monospace">DISTRIBUIÇÃO</text>
    </svg>
  );
}

export function ArtEstrutura({ a }: { a: string }) {
  // Zigzag HH/HL + CHoCH (quebra)
  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-[320px] h-auto">
      <polyline points="15,90 45,60 75,75 105,40 135,55 165,25" stroke={a} strokeWidth="2" fill="none" strokeOpacity="0.85" strokeLinejoin="round" />
      <polyline points="165,25 195,70 225,55 255,105" stroke="#EF4444" strokeWidth="2" fill="none" strokeOpacity="0.85" strokeLinejoin="round" />
      <line x1="15" y1="75" x2="170" y2="75" stroke={a} strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
      <text x="20" y="70" fontSize="8.5" fontWeight="700" fill={a} opacity="0.7" fontFamily="monospace">Last HL</text>
      <circle cx="225" cy="55" r="2.5" fill="#EF4444" />
      <text x="235" y="58" fontSize="9" fontWeight="700" fill="#EF4444" fontFamily="monospace">CHoCH</text>
      <circle cx="165" cy="25" r="3" fill={a} />
      <text x="120" y="20" fontSize="8.5" fontWeight="700" fill={a} opacity="0.8" fontFamily="monospace">Higher High</text>
    </svg>
  );
}

export function ArtOrderBlocks({ a }: { a: string }) {
  // Candle bearish (OB) + rally + pullback tocando a zona
  const green = "#10B981", red = "#EF4444";
  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-[320px] h-auto">
      {/* Zona OB sombreada */}
      <rect x="30" y="55" width="240" height="18" fill={a} opacity="0.12" />
      <line x1="30" y1="55" x2="270" y2="55" stroke={a} strokeWidth="1.2" strokeOpacity="0.55" strokeDasharray="4 3" />
      <line x1="30" y1="73" x2="270" y2="73" stroke={a} strokeWidth="1.2" strokeOpacity="0.55" strokeDasharray="4 3" />
      <text x="36" y="51" fontSize="8.5" fontWeight="700" fill={a} fontFamily="monospace">ORDER BLOCK</text>
      {/* Candle OB bearish */}
      <line x1="50" y1="50" x2="50" y2="80" stroke={red} strokeWidth="1.5" opacity="0.85" />
      <rect x="43" y="55" width="14" height="22" fill={red} opacity="0.85" />
      {/* Rally down */}
      <line x1="75" y1="70" x2="75" y2="95" stroke={red} strokeWidth="1.5" opacity="0.8" />
      <rect x="69" y="72" width="12" height="20" fill={red} opacity="0.75" />
      <line x1="95" y1="85" x2="95" y2="115" stroke={red} strokeWidth="1.5" opacity="0.75" />
      <rect x="89" y="90" width="12" height="22" fill={red} opacity="0.7" />
      {/* Fundo + reversão verde */}
      <line x1="120" y1="105" x2="120" y2="125" stroke={green} strokeWidth="1.5" opacity="0.85" />
      <rect x="114" y="108" width="12" height="16" fill={green} opacity="0.85" />
      <line x1="145" y1="88" x2="145" y2="118" stroke={green} strokeWidth="1.5" opacity="0.85" />
      <rect x="139" y="92" width="12" height="22" fill={green} opacity="0.85" />
      {/* Pullback testando OB */}
      <line x1="175" y1="60" x2="175" y2="95" stroke={green} strokeWidth="1.5" opacity="0.85" />
      <rect x="169" y="65" width="12" height="25" fill={green} opacity="0.85" />
      {/* Seta de rejeição no OB */}
      <path d="M 210 64 L 210 54 M 205 59 L 210 54 L 215 59" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="218" y="60" fontSize="8.5" fontWeight="700" fill={a} fontFamily="monospace">REJEIÇÃO</text>
    </svg>
  );
}

export function ArtFVG({ a }: { a: string }) {
  // 3 candles com gap destacado entre candle1 high e candle3 low
  const green = "#10B981";
  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-[300px] h-auto">
      {/* FVG destacado */}
      <rect x="50" y="55" width="180" height="22" fill={a} opacity="0.20" />
      <line x1="50" y1="55" x2="230" y2="55" stroke={a} strokeOpacity="0.7" strokeDasharray="3 2" />
      <line x1="50" y1="77" x2="230" y2="77" stroke={a} strokeOpacity="0.7" strokeDasharray="3 2" />
      <text x="140" y="71" textAnchor="middle" fontSize="10" fontWeight="800" fill={a} fontFamily="monospace">GAP · FVG</text>
      {/* Candle 1 — para no high 55 */}
      <line x1="95" y1="55" x2="95" y2="100" stroke={green} strokeWidth="1.5" opacity="0.85" />
      <rect x="87" y="60" width="16" height="35" fill={green} opacity="0.85" />
      {/* Candle 2 — impulso forte, corpo atravessando o gap */}
      <line x1="140" y1="30" x2="140" y2="85" stroke={green} strokeWidth="1.5" opacity="0.95" />
      <rect x="130" y="35" width="20" height="48" fill={green} opacity="0.95" />
      {/* Candle 3 — começa no low 77 */}
      <line x1="185" y1="50" x2="185" y2="90" stroke={green} strokeWidth="1.5" opacity="0.85" />
      <rect x="177" y="77" width="16" height="12" fill={green} opacity="0.85" />
      {/* Nota 50% */}
      <line x1="50" y1="66" x2="230" y2="66" stroke={a} strokeOpacity="0.85" strokeDasharray="1 2" strokeWidth="1" />
      <text x="236" y="69" fontSize="8" fontWeight="700" fill={a} fontFamily="monospace">CE 50%</text>
    </svg>
  );
}

export function ArtLiquidez({ a }: { a: string }) {
  // BSL acima com stops como dots, price sobe, sweep dos stops
  const red = "#EF4444", green = "#10B981";
  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-[320px] h-auto">
      {/* BSL line */}
      <line x1="15" y1="38" x2="265" y2="38" stroke={red} strokeWidth="1.4" strokeOpacity="0.75" strokeDasharray="4 3" />
      <text x="20" y="32" fontSize="9" fontWeight="800" fill={red} fontFamily="monospace">BSL · stops</text>
      {/* stops dots */}
      {[35, 75, 115, 155, 195].map((x) => (
        <circle key={x} cx={x} cy="32" r="3" fill={red} opacity="0.7" />
      ))}
      {/* price action */}
      <polyline points="20,95 50,85 80,75 110,80 140,60 170,55 200,45 225,28 240,60" stroke={a} strokeWidth="2" fill="none" strokeOpacity="0.85" strokeLinejoin="round" />
      {/* Sweep */}
      <circle cx="225" cy="28" r="6" fill="none" stroke={red} strokeWidth="1.8" opacity="0.9" />
      <text x="205" y="112" fontSize="9" fontWeight="700" fill={red} fontFamily="monospace">SWEEP</text>
      {/* reversão */}
      <path d="M 250 100 L 260 110 L 250 120" stroke={green} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeOpacity="0.8" />
      <text x="200" y="125" fontSize="8" fontWeight="700" fill={green} opacity="0.8" fontFamily="monospace">reversão</text>
    </svg>
  );
}

export function ArtSessoes({ a }: { a: string }) {
  // Timeline 3 sessões
  return (
    <svg viewBox="0 0 280 110" className="w-full max-w-[340px] h-auto">
      {/* Asia */}
      <rect x="10" y="30" width="85" height="40" rx="4" fill="#3B82F6" opacity="0.12" stroke="#3B82F6" strokeOpacity="0.4" strokeWidth="1" />
      <text x="52" y="53" textAnchor="middle" fontSize="11" fontWeight="800" fill="#3B82F6" fontFamily="monospace">ASIA</text>
      <text x="52" y="85" textAnchor="middle" fontSize="8" fontWeight="600" fill="#3B82F6" opacity="0.7" fontFamily="monospace">20h–03h BRT</text>
      {/* London */}
      <rect x="100" y="30" width="85" height="40" rx="4" fill="#F59E0B" opacity="0.15" stroke="#F59E0B" strokeOpacity="0.5" strokeWidth="1.2" />
      <text x="142" y="53" textAnchor="middle" fontSize="11" fontWeight="800" fill="#F59E0B" fontFamily="monospace">LONDRES</text>
      <text x="142" y="85" textAnchor="middle" fontSize="8" fontWeight="600" fill="#F59E0B" opacity="0.7" fontFamily="monospace">04h–09h BRT</text>
      <circle cx="142" cy="22" r="3" fill="#F59E0B" opacity="0.9" />
      <text x="142" y="18" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#F59E0B" opacity="0.85" fontFamily="monospace">KILL ZONE</text>
      {/* NY */}
      <rect x="190" y="30" width="85" height="40" rx="4" fill="#EF4444" opacity="0.12" stroke="#EF4444" strokeOpacity="0.4" strokeWidth="1" />
      <text x="232" y="53" textAnchor="middle" fontSize="11" fontWeight="800" fill="#EF4444" fontFamily="monospace">NY</text>
      <text x="232" y="85" textAnchor="middle" fontSize="8" fontWeight="600" fill="#EF4444" opacity="0.7" fontFamily="monospace">09h30–12h BRT</text>
      {/* seta tempo */}
      <line x1="10" y1="100" x2="275" y2="100" stroke={a} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M 275 100 L 270 97 M 275 100 L 270 103" stroke={a} strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function ArtPremiumDiscount({ a }: { a: string }) {
  // Range vertical com premium (top) e discount (bottom), fib 50%
  const red = "#EF4444", green = "#10B981";
  return (
    <svg viewBox="0 0 220 150" className="w-[240px] h-auto">
      {/* Range box */}
      <rect x="40" y="15" width="140" height="120" fill="none" stroke={a} strokeOpacity="0.3" strokeWidth="1" />
      {/* Premium zone */}
      <rect x="40" y="15" width="140" height="55" fill={red} opacity="0.10" />
      {/* Discount zone */}
      <rect x="40" y="80" width="140" height="55" fill={green} opacity="0.10" />
      {/* 50% line */}
      <line x1="40" y1="75" x2="180" y2="75" stroke={a} strokeOpacity="0.95" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Labels */}
      <text x="110" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill={red} fontFamily="monospace">PREMIUM</text>
      <text x="110" y="52" textAnchor="middle" fontSize="8" fontWeight="600" fill={red} opacity="0.7" fontFamily="monospace">vender aqui</text>
      <text x="110" y="112" textAnchor="middle" fontSize="11" fontWeight="800" fill={green} fontFamily="monospace">DISCOUNT</text>
      <text x="110" y="126" textAnchor="middle" fontSize="8" fontWeight="600" fill={green} opacity="0.7" fontFamily="monospace">comprar aqui</text>
      {/* Equilibrium pill */}
      <rect x="184" y="68" width="30" height="14" rx="3" fill={a} opacity="0.2" stroke={a} strokeOpacity="0.6" strokeWidth="1" />
      <text x="199" y="78" textAnchor="middle" fontSize="8" fontWeight="800" fill={a} fontFamily="monospace">50%</text>
      {/* highs/lows ticks */}
      <text x="36" y="19" textAnchor="end" fontSize="8" fontWeight="700" fill={red} opacity="0.7" fontFamily="monospace">HIGH</text>
      <text x="36" y="138" textAnchor="end" fontSize="8" fontWeight="700" fill={green} opacity="0.7" fontFamily="monospace">LOW</text>
    </svg>
  );
}

export function ArtSMT({ a }: { a: string }) {
  // 2 charts lado a lado, um HH e outro falhando
  const green = "#10B981", red = "#EF4444";
  return (
    <svg viewBox="0 0 280 150" className="w-full max-w-[320px] h-auto">
      {/* Par A — faz HH */}
      <text x="50" y="15" textAnchor="middle" fontSize="9" fontWeight="800" fill={a} fontFamily="monospace">NQ</text>
      <polyline points="15,90 35,60 55,75 75,40 95,55" stroke={green} strokeWidth="1.8" fill="none" strokeOpacity="0.9" strokeLinejoin="round" />
      <circle cx="75" cy="40" r="3" fill={green} />
      <text x="78" y="36" fontSize="7" fontWeight="700" fill={green} fontFamily="monospace">HH</text>
      {/* Par B — falha em HH */}
      <text x="200" y="15" textAnchor="middle" fontSize="9" fontWeight="800" fill={a} fontFamily="monospace">ES</text>
      <polyline points="160,90 180,60 200,72 220,55 240,70" stroke={red} strokeWidth="1.8" fill="none" strokeOpacity="0.85" strokeLinejoin="round" />
      <circle cx="220" cy="55" r="3" fill={red} />
      <line x1="220" y1="55" x2="220" y2="40" stroke={red} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
      <circle cx="220" cy="40" r="3" fill="none" stroke={red} strokeWidth="1.3" strokeOpacity="0.6" strokeDasharray="2 2" />
      <text x="223" y="36" fontSize="7" fontWeight="700" fill={red} fontFamily="monospace">LH</text>
      {/* Divider */}
      <line x1="127" y1="20" x2="127" y2="110" stroke={a} strokeOpacity="0.2" strokeDasharray="2 3" />
      {/* Label SMT */}
      <rect x="95" y="120" width="90" height="20" rx="4" fill={a} opacity="0.12" stroke={a} strokeOpacity="0.5" strokeWidth="1" />
      <text x="140" y="133" textAnchor="middle" fontSize="9" fontWeight="800" fill={a} fontFamily="monospace">SMT DIVERGENCE</text>
    </svg>
  );
}

export function ArtVies({ a }: { a: string }) {
  // Cascata de timeframes HTF → MTF → LTF apontando mesma direção
  return (
    <svg viewBox="0 0 220 140" className="w-full max-w-[280px] h-auto">
      {/* 3 timeframes vertically stacked */}
      {[
        { y: 20, label: "HTF · Weekly",  w: 160 },
        { y: 60, label: "MTF · Daily",   w: 120 },
        { y: 100, label: "LTF · H4",     w: 80 },
      ].map((tf, i) => (
        <g key={i}>
          <rect x="30" y={tf.y} width={tf.w} height="24" rx="3" fill={a} opacity={0.08 + i * 0.06} stroke={a} strokeOpacity={0.35 + i * 0.1} strokeWidth="1" />
          <text x="40" y={tf.y + 16} fontSize="9.5" fontWeight="700" fill={a} fontFamily="monospace">{tf.label}</text>
          <path d={`M ${30 + tf.w + 4} ${tf.y + 12} L ${30 + tf.w + 18} ${tf.y + 12} M ${30 + tf.w + 14} ${tf.y + 8} L ${30 + tf.w + 18} ${tf.y + 12} L ${30 + tf.w + 14} ${tf.y + 16}`}
            stroke={a} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeOpacity={0.5 + i * 0.15} />
        </g>
      ))}
      {/* Vertical alignment indicator */}
      <line x1="22" y1="20" x2="22" y2="124" stroke={a} strokeWidth="2" strokeOpacity="0.4" strokeDasharray="2 3" />
      <text x="20" y="134" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={a} opacity="0.6" fontFamily="monospace">ALIGN</text>
    </svg>
  );
}

export function ArtMesas({ a }: { a: string }) {
  // 3 fases tier: Challenge → Verification → Funded
  return (
    <svg viewBox="0 0 220 150" className="w-full max-w-[280px] h-auto">
      {/* Phase 1 */}
      <rect x="25" y="100" width="170" height="30" rx="4" fill={a} opacity="0.10" stroke={a} strokeOpacity="0.4" strokeWidth="1" />
      <text x="110" y="120" textAnchor="middle" fontSize="10" fontWeight="800" fill={a} fontFamily="monospace">PHASE 1 · 8%</text>
      {/* Phase 2 */}
      <rect x="45" y="60" width="130" height="30" rx="4" fill={a} opacity="0.15" stroke={a} strokeOpacity="0.55" strokeWidth="1" />
      <text x="110" y="80" textAnchor="middle" fontSize="10" fontWeight="800" fill={a} fontFamily="monospace">PHASE 2 · 5%</text>
      {/* Funded */}
      <rect x="65" y="22" width="90" height="30" rx="4" fill={a} opacity="0.25" stroke={a} strokeOpacity="0.8" strokeWidth="1.3" />
      <text x="110" y="42" textAnchor="middle" fontSize="10" fontWeight="900" fill={a} fontFamily="monospace">FUNDED</text>
      {/* Crown/payout */}
      <path d="M 95 14 L 100 6 L 110 10 L 120 6 L 125 14 Z" fill={a} opacity="0.8" />
      {/* arrow up */}
      <path d="M 12 100 L 12 30 M 8 36 L 12 30 L 16 36" stroke={a} strokeWidth="1.4" fill="none" strokeOpacity="0.55" strokeLinecap="round" />
      <text x="8" y="138" fontSize="7" fontWeight="700" fill={a} opacity="0.55" fontFamily="monospace">SCALE</text>
    </svg>
  );
}

export function ArtTiming({ a }: { a: string }) {
  // Relógio com arcos de kill zone destacados
  return (
    <svg viewBox="0 0 180 180" className="w-[200px] h-[200px]">
      {/* Clock outer */}
      <circle cx="90" cy="90" r="78" fill="none" stroke={a} strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="90" cy="90" r="62" fill={a} opacity="0.03" />
      {/* Kill Zone London (04-07h → 120°-210°) */}
      <path d="M 90 90 L 42 66 A 60 60 0 0 1 42 114 Z"
        fill="#F59E0B" opacity="0.25" stroke="#F59E0B" strokeOpacity="0.6" strokeWidth="1.2" />
      {/* Kill Zone NY (09-12h → 270°-360°) */}
      <path d="M 90 90 L 90 30 A 60 60 0 0 1 150 90 Z"
        fill="#EF4444" opacity="0.18" stroke="#EF4444" strokeOpacity="0.5" strokeWidth="1.2" />
      {/* Ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = (i * 30 - 90) * Math.PI / 180;
        const x1 = 90 + Math.cos(ang) * 72;
        const y1 = 90 + Math.sin(ang) * 72;
        const x2 = 90 + Math.cos(ang) * 78;
        const y2 = 90 + Math.sin(ang) * 78;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={a} strokeOpacity="0.5" strokeWidth="1.5" />;
      })}
      {/* Ponteiro */}
      <line x1="90" y1="90" x2="90" y2="45" stroke={a} strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="90" x2="115" y2="78" stroke={a} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.65" />
      <circle cx="90" cy="90" r="4" fill={a} />
      {/* Labels */}
      <text x="55" y="92" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#F59E0B" fontFamily="monospace">KILL LDN</text>
      <text x="124" y="48" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#EF4444" fontFamily="monospace">KILL NY</text>
    </svg>
  );
}

export function ArtSaida({ a }: { a: string }) {
  // Linha de entry → 3 pontos de saída diferentes
  const green = "#10B981";
  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-[320px] h-auto">
      {/* Entry line */}
      <line x1="15" y1="95" x2="265" y2="95" stroke={a} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 2" />
      <text x="20" y="110" fontSize="8.5" fontWeight="700" fill={a} opacity="0.7" fontFamily="monospace">ENTRY</text>
      {/* Price path up */}
      <polyline points="15,95 60,78 105,62 150,45 195,55 240,30" stroke={green} strokeWidth="2" fill="none" strokeOpacity="0.9" strokeLinejoin="round" />
      {/* Exit 1: BE */}
      <circle cx="60" cy="78" r="5" fill="#0e0e10" stroke={a} strokeWidth="1.5" />
      <text x="60" y="72" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={a} fontFamily="monospace">BE</text>
      {/* Exit 2: Partial 1R */}
      <circle cx="105" cy="62" r="5" fill={a} opacity="0.3" stroke={a} strokeWidth="1.5" />
      <text x="105" y="56" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={a} fontFamily="monospace">+1R</text>
      {/* Exit 3: Target 3R */}
      <circle cx="240" cy="30" r="6" fill={green} opacity="0.9" />
      <text x="240" y="22" textAnchor="middle" fontSize="8" fontWeight="800" fill={green} fontFamily="monospace">TP +3R</text>
      {/* Trailing */}
      <line x1="150" y1="45" x2="240" y2="30" stroke={a} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 2" />
      <text x="195" y="48" textAnchor="middle" fontSize="7" fontWeight="700" fill={a} opacity="0.55" fontFamily="monospace">trail</text>
    </svg>
  );
}

export function CategoryArt({ category, accent, Icon }: { category: string; accent: string; Icon: typeof Brain }) {
  switch (category) {
    case "Estrutura":         return <ArtEstrutura a={accent} />;
    case "Order Blocks":      return <ArtOrderBlocks a={accent} />;
    case "FVG":               return <ArtFVG a={accent} />;
    case "Liquidez":          return <ArtLiquidez a={accent} />;
    case "Sessões":           return <ArtSessoes a={accent} />;
    case "AMD":               return <ArtAMD a={accent} />;
    case "Premium/Discount":  return <ArtPremiumDiscount a={accent} />;
    case "Gestão":            return <ArtGestao a={accent} />;
    case "SMT":               return <ArtSMT a={accent} />;
    case "Psicologia":        return <ArtPsicologia a={accent} />;
    case "Candles":           return <ArtCandles a={accent} />;
    case "Viés":              return <ArtVies a={accent} />;
    case "Mesas":             return <ArtMesas a={accent} />;
    case "Timing":            return <ArtTiming a={accent} />;
    case "Saída":             return <ArtSaida a={accent} />;
    default:
      return (
        <div className="relative">
          <div className="absolute -inset-8 blur-3xl rounded-full opacity-70" style={{ backgroundColor: accent + "40" }} />
          <div className="absolute -inset-3 blur-xl rounded-full opacity-60" style={{ backgroundColor: accent + "55" }} />
          <div
            className="relative w-28 h-28 rounded-3xl flex items-center justify-center border-2"
            style={{
              background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
              borderColor: accent + "55",
              boxShadow: `0 20px 48px -12px ${accent}40, inset 0 1px 0 ${accent}40`,
            }}
          >
            <Icon className="w-12 h-12" style={{ color: accent }} strokeWidth={1.5} />
          </div>
        </div>
      );
  }
}
