"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Play, Check, CheckCircle, Clock,
  FileText, Download, BookOpen, ChevronDown, ChevronUp, RotateCcw,
  Sparkles, Star, RefreshCw, Target,
} from "lucide-react";
import type { QuizQuestion, LessonData, ModuleData } from "@/lib/curriculum";
import { getTreinosForLesson } from "@/lib/module-treinos";
import { LessonChart, hasLiveChart } from "@/components/elite/LessonChart";
import { LessonComments } from "@/components/elite/LessonComments";

/* ────────────────────────────────────────────
   Confetti — lightweight celebration particles
   ──────────────────────────────────────────── */

function Confetti({ active, accent }: { active: boolean; accent: string }) {
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number; r: number; color: string; delay: number; duration: number; drift: number;
  }>>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const colors = [accent, "#10B981", "#F59E0B", "#3B82F6", "#A855F7", "#EF4444", "#FFFFFF"];
    const ps = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: -10 - Math.random() * 20,
      r: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      drift: -30 + Math.random() * 60,
    }));
    setParticles(ps);
    const timer = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(timer);
  }, [active, accent]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.r,
            height: p.r,
            backgroundColor: p.color,
            opacity: 0.9,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────
   Scenario Chart SVGs — visual context for quiz questions
   ──────────────────────────────────────────── */

function ScenarioChart({ type }: { type: string }) {
  const charts: Record<string, React.ReactNode> = {
    "amd-sweep": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {/* Grid */}
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* Phase labels */}
        <rect x="20" y="10" width="160" height="180" fill="rgba(168,85,247,0.03)" rx="4" />
        <rect x="180" y="10" width="120" height="180" fill="rgba(168,85,247,0.06)" rx="4" />
        <rect x="300" y="10" width="280" height="180" fill="rgba(168,85,247,0.03)" rx="4" />
        <text x="100" y="195" textAnchor="middle" fill="rgba(168,85,247,0.5)" fontSize="11" fontWeight="bold" fontFamily="monospace">ACUMULAÇÃO</text>
        <text x="240" y="195" textAnchor="middle" fill="rgba(168,85,247,0.7)" fontSize="11" fontWeight="bold" fontFamily="monospace">MANIPULAÇÃO</text>
        <text x="440" y="195" textAnchor="middle" fill="rgba(168,85,247,0.5)" fontSize="11" fontWeight="bold" fontFamily="monospace">DISTRIBUIÇÃO</text>
        {/* Price action — accumulation (sideways) */}
        <polyline points="30,100 50,98 70,103 90,97 110,102 130,96 150,101 170,99"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Manipulation — sweep down then reverse */}
        <polyline points="170,99 190,105 210,120 225,135 230,140"
          stroke="#EF444460" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <circle cx="230" cy="140" r="5" fill="none" stroke="#EF4444" strokeWidth="1.5" />
        <text x="245" y="148" fill="#EF444480" fontSize="9" fontFamily="monospace">SWEEP</text>
        {/* Sell side liquidity line */}
        <line x1="20" y1="135" x2="230" y2="135" stroke="#EF444425" strokeWidth="1" strokeDasharray="4 3" />
        <text x="25" y="132" fill="#EF444440" fontSize="8" fontFamily="monospace">SSL</text>
        {/* Reversal + distribution */}
        <polyline points="230,140 245,125 260,110 280,95 300,85 330,70 360,60 390,55 420,50 460,42 500,38 540,35 580,30"
          stroke="#10B98160" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        {/* Entry arrow */}
        <line x1="260" y1="110" x2="260" y2="75" stroke="#10B98140" strokeWidth="1" strokeDasharray="3 2" />
        <text x="270" y="72" fill="#10B98170" fontSize="9" fontFamily="monospace">ENTRY</text>
      </svg>
    ),
    "ob-bounce": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* Price drop */}
        <polyline points="30,40 60,45 90,55 120,65 150,80 170,90 185,100"
          stroke="#EF444450" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* OB zone — last bearish candle before drop */}
        <rect x="55" y="40" width="40" height="25" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.40)" strokeWidth="1.5" rx="3" />
        <text x="75" y="55" textAnchor="middle" fill="rgba(59,130,246,0.8)" fontSize="9" fontWeight="bold" fontFamily="monospace">OB</text>
        {/* Continuation down, then return to OB */}
        <polyline points="185,100 210,120 240,140 270,150 300,155 330,148 360,130 390,110 410,90 430,70 450,55"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Bounce at OB */}
        <polyline points="450,55 460,50 470,48 475,50 480,55"
          stroke="#10B98160" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Return arrow */}
        <path d="M 430 70 Q 440 55 460 48" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <text x="480" y="42" fill="rgba(59,130,246,0.7)" fontSize="9" fontFamily="monospace">Preço retorna ao OB</text>
        {/* Bounce up */}
        <polyline points="480,55 500,45 530,35 560,28 590,22"
          stroke="#10B98160" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    "fvg-fill": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* 3 candles creating FVG */}
        {/* Candle 1 — small */}
        <line x1="150" y1="120" x2="150" y2="160" stroke="#10B98140" strokeWidth="2" />
        <rect x="140" y="130" width="20" height="20" fill="#10B98120" stroke="#10B98140" strokeWidth="1.5" rx="2" />
        {/* Candle 2 — big impulse */}
        <line x1="200" y1="60" x2="200" y2="125" stroke="#10B98150" strokeWidth="2" />
        <rect x="190" y="70" width="20" height="40" fill="#10B98125" stroke="#10B98150" strokeWidth="1.5" rx="2" />
        {/* Candle 3 — continuation */}
        <line x1="250" y1="45" x2="250" y2="85" stroke="#10B98140" strokeWidth="2" />
        <rect x="240" y="50" width="20" height="25" fill="#10B98120" stroke="#10B98140" strokeWidth="1.5" rx="2" />
        {/* FVG zone — gap between candle 1 high and candle 3 low */}
        <rect x="155" y="85" width="100" height="35" fill="rgba(59,130,246,0.10)" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" rx="3" strokeDasharray="5 3" />
        <text x="205" y="106" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="11" fontWeight="bold" fontFamily="monospace">FVG</text>
        {/* Price returning to fill */}
        <polyline points="260,55 290,50 320,48 350,52 380,60 400,72 420,85 435,95 440,100"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <text x="450" y="100" fill="rgba(59,130,246,0.6)" fontSize="9" fontFamily="monospace">Preenchimento</text>
        {/* Continue up after fill */}
        <polyline points="440,100 455,92 475,80 500,65 530,55 560,48"
          stroke="#10B98150" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    "premium-discount": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {/* Premium zone */}
        <rect x="30" y="10" width="540" height="85" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.12)" strokeWidth="1" rx="4" />
        <text x="50" y="35" fill="rgba(239,68,68,0.6)" fontSize="12" fontWeight="bold" fontFamily="monospace">PREMIUM</text>
        <text x="50" y="50" fill="rgba(239,68,68,0.3)" fontSize="9" fontFamily="monospace">Zona cara — vender aqui</text>
        {/* EQ line */}
        <line x1="30" y1="100" x2="570" y2="100" stroke="rgba(168,85,247,0.5)" strokeWidth="2" strokeDasharray="8 4" />
        <text x="540" y="95" fill="rgba(168,85,247,0.8)" fontSize="11" fontWeight="bold" fontFamily="monospace">50%</text>
        {/* Discount zone */}
        <rect x="30" y="105" width="540" height="85" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.12)" strokeWidth="1" rx="4" />
        <text x="50" y="135" fill="rgba(16,185,129,0.6)" fontSize="12" fontWeight="bold" fontFamily="monospace">DISCOUNT</text>
        <text x="50" y="150" fill="rgba(16,185,129,0.3)" fontSize="9" fontFamily="monospace">Zona barata — comprar aqui</text>
        {/* Price in discount */}
        <circle cx="400" cy="145" r="8" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="2" />
        <circle cx="400" cy="145" r="3" fill="rgba(16,185,129,0.6)" />
        <text x="415" y="149" fill="rgba(16,185,129,0.7)" fontSize="10" fontFamily="monospace">Preço atual</text>
      </svg>
    ),
    "liquidity-sweep": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* Multiple equal lows — liquidity building */}
        <polyline points="40,100 80,95 110,105 140,80 170,90 200,85 230,100 250,95 270,88"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Equal lows line */}
        <line x1="40" y1="140" x2="300" y2="140" stroke="#EF444435" strokeWidth="1.5" strokeDasharray="5 3" />
        {/* Dots below — stops clustered */}
        {[{x:80,y:145},{x:120,y:148},{x:160,y:146},{x:200,y:149},{x:240,y:147}].map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r="3" fill="#EF444440" />
        ))}
        <text x="155" y="165" textAnchor="middle" fill="#EF444460" fontSize="9" fontFamily="monospace">Stops das sardinhas (SSL)</text>
        {/* Sweep — price dips below */}
        <polyline points="270,88 290,100 310,120 325,138 335,150 340,155"
          stroke="#EF444460" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <circle cx="340" cy="155" r="5" fill="none" stroke="#EF4444" strokeWidth="1.5" />
        <text x="355" y="160" fill="#EF444480" fontSize="9" fontWeight="bold" fontFamily="monospace">SWEEP</text>
        {/* Reversal */}
        <polyline points="340,155 350,145 365,120 385,95 410,70 440,55 480,42 530,35 580,30"
          stroke="#10B98160" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    "session-asia": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {/* Session boxes */}
        <rect x="30" y="140" width="160" height="40" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" rx="6" />
        <text x="110" y="165" textAnchor="middle" fill="rgba(99,102,241,0.7)" fontSize="12" fontWeight="bold" fontFamily="monospace">ASIA</text>
        <rect x="220" y="140" width="160" height="40" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1.5" rx="6" />
        <text x="300" y="165" textAnchor="middle" fill="rgba(245,158,11,0.7)" fontSize="12" fontWeight="bold" fontFamily="monospace">LONDON</text>
        <rect x="410" y="140" width="160" height="40" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.25)" strokeWidth="1.5" rx="6" />
        <text x="490" y="165" textAnchor="middle" fill="rgba(168,85,247,0.7)" fontSize="12" fontWeight="bold" fontFamily="monospace">NEW YORK</text>
        {/* Asia range — flat */}
        <rect x="50" y="65" width="120" height="35" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.15)" strokeWidth="1" rx="3" strokeDasharray="4 3" />
        <text x="110" y="60" textAnchor="middle" fill="rgba(99,102,241,0.5)" fontSize="8" fontFamily="monospace">ASIA RANGE</text>
        {/* Price sweeps asia high in London, then drops */}
        <polyline points="50,85 80,80 110,82 140,78 170,80 200,78 230,72 250,62 260,58"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* London sweep of asia high */}
        <circle cx="260" cy="58" r="4" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="275" y="55" fill="#F59E0B80" fontSize="8" fontFamily="monospace">Sweep Asia High</text>
        {/* NY move down */}
        <polyline points="260,58 280,62 310,75 350,90 400,100 430,95 460,80 500,60 540,45 580,35"
          stroke="#10B98150" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    "judas-swing": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* Daily bias arrow — bullish */}
        <rect x="30" y="20" width="80" height="35" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.20)" strokeWidth="1" rx="4" />
        <text x="70" y="35" textAnchor="middle" fill="rgba(16,185,129,0.6)" fontSize="8" fontFamily="monospace">DAILY BIAS</text>
        <text x="70" y="48" textAnchor="middle" fill="rgba(16,185,129,0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace">BULLISH</text>
        {/* Opening price */}
        <line x1="150" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        <text x="155" y="95" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">Open</text>
        {/* Judas swing — false move DOWN */}
        <polyline points="160,100 180,105 200,115 220,125 240,140 250,148"
          stroke="#EF444460" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <circle cx="250" cy="148" r="5" fill="none" stroke="#EF4444" strokeWidth="1.5" />
        <text x="195" y="158" fill="#EF444480" fontSize="10" fontWeight="bold" fontFamily="monospace">JUDAS SWING</text>
        <text x="195" y="170" fill="#EF444450" fontSize="8" fontFamily="monospace">Falso movimento</text>
        {/* True move UP */}
        <polyline points="250,148 270,135 300,110 330,85 360,65 400,50 450,38 500,30 560,25"
          stroke="#10B98170" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <text x="420" y="28" fill="#10B98180" fontSize="10" fontWeight="bold" fontFamily="monospace">TRUE MOVE</text>
      </svg>
    ),
    "smt-diverge": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* NQ line — makes higher high */}
        <polyline points="40,80 100,75 160,90 220,60 280,55 340,70 400,45 460,40 520,50 580,35"
          stroke="rgba(168,85,247,0.6)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <text x="585" y="32" fill="rgba(168,85,247,0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace">NQ</text>
        {/* ES line — fails to make higher high (divergence) */}
        <polyline points="40,90 100,88 160,100 220,75 280,72 340,82 400,68 460,72 520,80 580,78"
          stroke="#F59E0B60" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <text x="585" y="82" fill="#F59E0B80" fontSize="10" fontWeight="bold" fontFamily="monospace">ES</text>
        {/* Divergence zone */}
        <rect x="380" y="25" width="130" height="70" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.18)" strokeWidth="1.5" rx="4" strokeDasharray="5 3" />
        {/* Arrows showing divergence */}
        <line x1="400" y1="45" x2="460" y2="40" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
        <text x="470" y="38" fill="rgba(168,85,247,0.5)" fontSize="7" fontFamily="monospace">Higher High</text>
        <line x1="400" y1="68" x2="460" y2="72" stroke="#F59E0B40" strokeWidth="1" />
        <text x="470" y="75" fill="#F59E0B50" fontSize="7" fontFamily="monospace">Lower High</text>
        {/* Alert */}
        <text x="445" y="110" textAnchor="middle" fill="#EF444480" fontSize="11" fontWeight="bold" fontFamily="monospace">SMT DIVERGENCE</text>
        <text x="445" y="122" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">NQ sobe mas ES não confirma</text>
      </svg>
    ),
    "entry-setup": (
      <svg viewBox="0 0 600 200" fill="none" className="w-full">
        {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />)}
        {/* Price action */}
        <polyline points="30,150 60,145 90,140 120,135 150,120 170,130 185,140 195,145 200,150"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {/* Sweep + OB */}
        <rect x="170" y="135" width="35" height="20" fill="rgba(59,130,246,0.10)" stroke="rgba(59,130,246,0.30)" strokeWidth="1" rx="2" strokeDasharray="3 2" />
        <text x="187" y="148" textAnchor="middle" fill="rgba(59,130,246,0.5)" fontSize="7" fontFamily="monospace">OB</text>
        <circle cx="200" cy="150" r="4" fill="none" stroke="#EF4444" strokeWidth="1.5" />
        {/* Entry */}
        <circle cx="210" cy="140" r="6" fill="none" stroke="#10B981" strokeWidth="2" />
        <circle cx="210" cy="140" r="2.5" fill="#10B981" />
        <text x="225" y="138" fill="#10B98180" fontSize="9" fontWeight="bold" fontFamily="monospace">ENTRY</text>
        {/* Move up */}
        <polyline points="210,140 230,125 260,105 290,85 320,70 360,55 400,45 450,38 500,32 560,28"
          stroke="#10B98160" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        {/* SL */}
        <line x1="170" y1="158" x2="300" y2="158" stroke="#EF444445" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="305" y="162" fill="#EF444475" fontSize="9" fontWeight="bold" fontFamily="monospace">SL -1R</text>
        {/* TP */}
        <line x1="300" y1="38" x2="560" y2="38" stroke="#10B98145" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="565" y="42" fill="#10B98175" fontSize="9" fontWeight="bold" fontFamily="monospace">TP +3R</text>
      </svg>
    ),
  };

  // Use interactive Lightweight Charts when available
  if (hasLiveChart(type)) {
    return <LessonChart scenario={type} />;
  }

  if (!charts[type]) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0c] p-4 mb-5 overflow-hidden">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 font-mono">Cenário</p>
      {charts[type]}
    </div>
  );
}

/* ────────────────────────────────────────────
   Quiz — one question at a time, with explanations + charts
   ──────────────────────────────────────────── */

function QuizSection({ questions, accent, onComplete }: {
  questions: QuizQuestion[];
  accent: string;
  onComplete: (score: number, total: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);

  const q = questions[current];

  // Shuffle options per question — prevents position bias ("always B").
  const shuffled = useMemo(() => {
    const order = [0, 1, 2, 3];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      options: order.map((i) => q.options[i]),
      correct: order.indexOf(q.correct),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, q.question]);

  const isCorrect = selected !== null && selected === shuffled.correct;
  const score = results.filter(Boolean).length;

  const handleSelect = (optIdx: number) => {
    if (revealed) return;
    setSelected(optIdx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setRevealed(true);
    const correct = selected === shuffled.correct;
    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setResults((prev) => [...prev, correct]);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
      onComplete(results.filter(Boolean).length + (isCorrect ? 1 : 0), questions.length);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setResults([]);
    setFinished(false);
  };

  // Score card
  if (finished) {
    const finalScore = results.filter(Boolean).length;
    const pct = Math.round((finalScore / questions.length) * 100);
    const grade = pct === 100 ? "A+" : pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";
    const passed = pct >= 80;

    return (
      <div className="flex flex-col items-center py-8">
        <div className="relative w-28 h-28 mb-6">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
            <circle cx="56" cy="56" r="48" fill="none" stroke={passed ? "#10B981" : accent} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 3.016} 302`} className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[32px] font-black" style={{ color: passed ? "#10B981" : accent }}>{grade}</span>
          </div>
        </div>
        <p className="text-[20px] font-bold text-white mb-1">{finalScore}/{questions.length} corretas</p>
        <p className="text-[13px] text-white/35 mb-6">
          {pct === 100 ? "Perfeito! Domínio total." : pct >= 80 ? "Muito bom!" : pct >= 60 ? "Bom, mas revise o material." : "Revise o material e tente novamente."}
        </p>
        <div className="flex gap-1 mb-6">
          {[0, 1, 2].map((i) => (
            <Star key={i} className={`w-6 h-6 transition-all duration-500 ${
              i < (pct === 100 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0) ? "text-yellow-400 fill-yellow-400" : "text-white/20"
            }`} style={{ transitionDelay: `${i * 200}ms` }} />
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {results.map((r, i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono ${
              r ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
            }`}>{i + 1}</div>
          ))}
        </div>
        <div className="flex gap-3">
          {!passed && (
            <button onClick={handleRetry} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-[13px] text-white/50 hover:text-white/80 transition-all">
              <RotateCcw className="w-4 h-4" /> Refazer Quiz
            </button>
          )}
          {passed && (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[13px] text-green-400 font-medium">
              <CheckCircle className="w-4 h-4" /> Quiz aprovado
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${((current + (revealed ? 1 : 0)) / questions.length) * 100}%`,
            backgroundColor: accent,
          }} />
        </div>
        <span className="text-[11px] text-white/30 font-mono">{current + 1}/{questions.length}</span>
      </div>

      <div className={`transition-transform duration-300 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
        {/* Scenario chart — if this question has one */}
        {q.chart && <ScenarioChart type={q.chart} />}

        {/* Question */}
        <p className="text-[16px] text-white/90 font-medium mb-6 leading-relaxed">{q.question}</p>

        {/* Options */}
        <div className="space-y-3">
          {shuffled.options.map((opt, optIdx) => {
            const isSelected = selected === optIdx;
            const isCorrectOpt = shuffled.correct === optIdx;
            let cls = "border-white/[0.06] bg-transparent text-white/50 hover:border-white/[0.12] hover:bg-white/[0.02]";

            if (revealed) {
              if (isCorrectOpt) cls = "border-green-500/40 bg-green-500/[0.08] text-green-400";
              else if (isSelected && !isCorrectOpt) cls = "border-red-500/40 bg-red-500/[0.08] text-red-400";
              else cls = "border-white/[0.03] bg-transparent text-white/30";
            } else if (isSelected) {
              cls = "border-white/[0.20] bg-white/[0.04] text-white/90";
            }

            return (
              <button key={optIdx} onClick={() => handleSelect(optIdx)} disabled={revealed}
                className={`w-full text-left px-5 py-4 rounded-xl border ${cls} text-[14px] transition-all duration-200`}>
                <span className="font-mono text-white/30 mr-3">{String.fromCharCode(65 + optIdx)}</span>
                {opt}
                {revealed && isCorrectOpt && <Check className="inline w-4 h-4 ml-2 text-green-400" />}
              </button>
            );
          })}
        </div>

        {/* Explanation — shown after reveal */}
        {revealed && q.explanation && (
          <div className="mt-5 px-5 py-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-[11px] text-white/25 uppercase tracking-wider font-bold mb-2">Por que?</p>
            <p className="text-[13px] text-white/60 leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex justify-end mt-6">
        {!revealed ? (
          <button onClick={handleConfirm} disabled={selected === null}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${
              selected !== null ? "text-white hover:brightness-110" : "bg-white/[0.03] text-white/30 cursor-not-allowed"
            }`}
            style={selected !== null ? { backgroundColor: accent, boxShadow: `0 4px 20px ${accent}30` } : undefined}>
            Confirmar
          </button>
        ) : (
          <button onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: accent, boxShadow: `0 4px 20px ${accent}30` }}>
            {current < questions.length - 1 ? "Próxima" : "Ver Resultado"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────
   Flashcards — flip to reveal
   ──────────────────────────────────────────── */

interface Flashcard { front: string; back: string; }

function FlashcardsSection({ cards, accent }: { cards: Flashcard[]; accent: string }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  const remaining = cards.filter((_, i) => !known.has(i));
  const allDone = known.size === cards.length;

  const currentCard = remaining.length > 0
    ? cards[Array.from({ length: cards.length }, (_, i) => i).filter((i) => !known.has(i))[current % remaining.length]]
    : null;
  const currentIdx = currentCard ? cards.indexOf(currentCard) : -1;

  const handleMark = (know: boolean) => {
    if (currentIdx === -1) return;
    if (know) {
      setKnown((prev) => new Set(prev).add(currentIdx));
    } else {
      setUnknown((prev) => new Set(prev).add(currentIdx));
    }
    setFlipped(false);
    setCurrent((prev) => prev + 1);
  };

  const handleReset = () => {
    setKnown(new Set());
    setUnknown(new Set());
    setCurrent(0);
    setFlipped(false);
  };

  if (allDone) {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: accent + "15" }}>
          <Sparkles className="w-7 h-7" style={{ color: accent }} />
        </div>
        <p className="text-[18px] font-bold text-white mb-1">Todos revisados!</p>
        <p className="text-[13px] text-white/35 mb-5">{cards.length} conceitos dominados</p>
        <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-[13px] text-white/50 hover:text-white/80 transition-all">
          <RefreshCw className="w-4 h-4" />
          Revisar novamente
        </button>
      </div>
    );
  }

  const cardNumber = cards.length - remaining.length + 1;

  return (
    <div>
      {/* Instructions + progress */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] text-white/30">Tente responder mentalmente, depois vire o card pra conferir.</p>
        <span className="text-[11px] text-white/25 font-mono">{cardNumber}/{cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${(known.size / cards.length) * 100}%`,
            backgroundColor: accent,
          }} />
        </div>
        <div className="flex gap-1">
          <span className="text-[10px] text-green-400/60">{known.size} ok</span>
          {unknown.size > 0 && <span className="text-[10px] text-yellow-400/50">· {unknown.size - known.size > 0 ? remaining.length : 0} revisar</span>}
        </div>
      </div>

      {/* Card */}
      {currentCard && (
        <div
          className="relative cursor-pointer mb-6"
          onClick={() => setFlipped(!flipped)}
          style={{ perspective: "800px" }}
        >
          <div className={`relative w-full min-h-[240px] transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
            {/* Front — the question */}
            <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border border-white/[0.08] bg-[#111114] overflow-hidden">
              {/* Accent glow */}
              <div className="absolute inset-0" style={{
                background: `radial-gradient(ellipse 50% 50% at 50% 30%, ${accent}08, transparent)`
              }} />
              <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full text-center">
                {/* Question mark icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: accent + "15" }}>
                  <span className="text-[20px] font-black" style={{ color: accent + "80" }}>?</span>
                </div>
                {/* Question */}
                <p className="text-[18px] text-white/90 font-bold leading-relaxed max-w-md">{currentCard.front}</p>
                {/* CTA */}
                <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-white/25">Pensou na resposta?</span>
                  <span className="text-[11px] font-medium" style={{ color: accent + "90" }}>Clique pra virar</span>
                </div>
              </div>
            </div>

            {/* Back — the answer */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border bg-[#111114] overflow-hidden"
              style={{ borderColor: accent + "30" }}>
              {/* Accent glow */}
              <div className="absolute inset-0" style={{
                background: `radial-gradient(ellipse 50% 50% at 50% 30%, ${accent}0C, transparent)`
              }} />
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                background: `linear-gradient(90deg, transparent, ${accent}50 30%, ${accent}30 70%, transparent)`
              }} />
              <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full text-center">
                {/* Check icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: accent + "15" }}>
                  <Check className="w-5 h-5" style={{ color: accent + "90" }} />
                </div>
                {/* Answer */}
                <p className="text-[15px] text-white/80 leading-relaxed max-w-md">{currentCard.back}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions — only show after flip */}
      {flipped ? (
        <div className="space-y-3">
          <p className="text-[12px] text-white/25 text-center mb-3">Você sabia a resposta?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => handleMark(false)} className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] text-[13px] text-yellow-400/80 font-medium hover:bg-yellow-500/[0.08] transition-all">
              <RotateCcw className="w-4 h-4" />
              Não sabia
            </button>
            <button onClick={() => handleMark(true)} className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-green-500/20 bg-green-500/[0.04] text-[13px] text-green-400/80 font-medium hover:bg-green-500/[0.08] transition-all">
              <Check className="w-4 h-4" />
              Sabia
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[11px] text-white/30">Pense na resposta antes de virar o card</p>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Checklist Component
   ──────────────────────────────────────────── */

function ChecklistSection({ items, accent }: { items: string[]; accent: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const total = items.length;
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
          className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
            checked[i]
              ? "border-green-500/15 bg-green-500/[0.03]"
              : "border-white/[0.04] hover:border-white/[0.08] bg-transparent"
          }`}
        >
          <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
            checked[i] ? "border-green-500/50 bg-green-500/15" : "border-white/10"
          }`}>
            {checked[i] && <Check className="w-3 h-3 text-green-400" />}
          </div>
          <span className={`text-[13px] leading-relaxed ${checked[i] ? "text-white/40 line-through" : "text-white/70"}`}>
            {item}
          </span>
        </button>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${(done / total) * 100}%`,
            backgroundColor: done === total ? "#10B981" : accent,
          }} />
        </div>
        <span className="text-[11px] text-white/30 font-mono">{done}/{total}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Collapsible Section
   ──────────────────────────────────────────── */

function Section({ title, icon: Icon, defaultOpen, accent, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  defaultOpen?: boolean;
  accent: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden hover:border-white/[0.10] transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.01] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "15" }}>
            <Icon className="w-4 h-4" style={{ color: accent + "BB" }} />
          </div>
          <span className="text-[15px] font-bold text-white/80">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/25" /> : <ChevronDown className="w-4 h-4 text-white/25" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────
   Lesson Flashcard + Chart Data
   Per-lesson interactive content
   ──────────────────────────────────────────── */

const FLASHCARDS: Record<string, Flashcard[]> = {
  intro: [
    { front: "O que é AMD?", back: "Acumulação, Manipulação, Distribuição — o ciclo que os institucionais seguem para mover o mercado." },
    { front: "Por que não usar indicadores tradicionais?", back: "Indicadores usam dados do passado e todo mundo usa igual. SMC rastreia dinheiro institucional em tempo real." },
    { front: "Qual a mentalidade certa no trade?", back: "Foco no longo prazo, disciplina, seguir o operacional. Um trade perdido não pode te afetar emocionalmente." },
  ],
  "leitura-candle": [
    { front: "O que o corpo do candle representa?", back: "A diferença entre o preço de abertura e o preço de fechamento naquele período." },
    { front: "O que é o pavio (wick)?", back: "O pavio mostra o preço máximo (high) e mínimo (low) que o ativo atingiu naquele candle." },
    { front: "Candle verde vs vermelho?", back: "Verde (bullish) = fechou acima da abertura. Vermelho (bearish) = fechou abaixo da abertura." },
  ],
  risco: [
    { front: "Regra de 1%", back: "Nunca arriscar mais que 1% do capital total em um único dia de operação." },
    { front: "Regra de 2.5%", back: "Risco máximo semanal de 2.5%. Se atingiu, para de operar até a próxima semana." },
    { front: "O que é R:R?", back: "Risk/Reward — relação entre quanto você arrisca e quanto pode ganhar. Mínimo recomendado: 1.5R." },
  ],
  "order-blocks": [
    { front: "O que é um Order Block?", back: "A última vela de impulso antes de um movimento forte — marca onde os institucionais se posicionaram." },
    { front: "OB bullish vs bearish?", back: "Bullish OB = última vela bearish antes de uma alta forte. Bearish OB = última vela bullish antes de uma queda forte." },
  ],
  "fvg-breaker": [
    { front: "O que é FVG?", back: "Fair Value Gap — espaço de preço não preenchido entre 3 candles consecutivos. O mercado tende a preencher." },
    { front: "O que é Breaker Block?", back: "Um Order Block que falhou e foi rompido — agora funciona como zona invertida (suporte vira resistência e vice-versa)." },
  ],
  "premium-discount": [
    { front: "Zona de Premium", back: "Acima de 50% do range — zona cara, ideal para vender." },
    { front: "Zona de Discount", back: "Abaixo de 50% do range — zona barata, ideal para comprar." },
    { front: "Equilibrium (EQ)", back: "O nível de 50% — separa Premium de Discount. Calculado com Fibonacci." },
  ],
  liquidez: [
    { front: "Buy Side Liquidity", back: "Stops e ordens acima de highs. Institucionais buscam essa liquidez antes de reverter." },
    { front: "Sell Side Liquidity", back: "Stops e ordens abaixo de lows. Institucionais varrem antes de subir." },
  ],
  sessoes: [
    { front: "Kill Zone", back: "Janelas de tempo nas aberturas das sessões onde as melhores oportunidades aparecem." },
    { front: "Sessão de NY", back: "09:30 — 16:00 (horário NY). A sessão com mais volume e onde o URA opera." },
  ],
  amd: [
    { front: "Fase A (Acumulação)", back: "Preço anda de lado. Institucionais acumulam posições sem chamar atenção." },
    { front: "Fase M (Manipulação)", back: "Falso movimento que varre liquidez e engana os traders retail." },
    { front: "Fase D (Distribuição)", back: "O movimento real. Institucionais distribuem na direção verdadeira." },
  ],
};


/* ────────────────────────────────────────────
   Main Lesson Page
   ──────────────────────────────────────────── */

interface LessonClientProps {
  lessonId: string;
  lesson: LessonData;
  mod: ModuleData;
  index: number;
  prev: { lesson: LessonData; mod: ModuleData } | null;
  next: { lesson: LessonData; mod: ModuleData } | null;
}

export default function LessonClient({ lessonId, lesson, mod, index, prev, next }: LessonClientProps) {
  const router = useRouter();

  const [quizPassed, setQuizPassed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  type Resource = "quiz" | "flashcards" | "checklist" | "treino";
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  // Discord user id do usuário logado — usado pelo CommentSection pra saber
  // quais comentários pode deletar e marcar "Você".
  const [myId, setMyId] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.userId) setMyId(String(d.userId)); })
      .catch(() => {});
  }, []);

  // Track completion of all sections
  const [sections, setSections] = useState({ quiz: false, checklist: false, chart: false, flashcards: false });

  const accent = mod.accentHex;
  const flashcards = FLASHCARDS[lessonId];

  const handleQuizComplete = (score: number, total: number) => {
    const passed = score / total >= 0.8;
    setQuizPassed(passed);
    setSections((prev) => ({ ...prev, quiz: passed }));
    if (passed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
  };

  const treinosDaAula = getTreinosForLesson(lessonId);
  const hasFlashcards = flashcards && flashcards.length > 0;
  const hasChecklist = Boolean(lesson.checklist && lesson.checklist.length > 0);
  const hasTreinos = treinosDaAula.length > 0;

  const activateResource = (resource: Resource) => {
    setActiveResource(resource);
    // Smooth scroll down to the opened content so it's visible
    setTimeout(() => {
      const el = document.getElementById("active-resource-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Confetti active={showConfetti} accent={accent} />

      {/* Compact header — back + lesson title + meta in one block */}
      <div>
        <Link href="/elite/aulas" className="inline-flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para aulas
        </Link>
        <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider"
            style={{ backgroundColor: accent + "18", color: accent + "CC" }}>
            Módulo {mod.number} · Aula {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[11px] text-white/30 font-medium">{mod.subtitle}</span>
          <span className="ml-auto flex items-center gap-3 text-white/30">
            <span className="flex items-center gap-1 text-[11px]"><Clock className="w-3 h-3" />{lesson.duration}</span>
            {lesson.hasQuiz && <span className="flex items-center gap-1 text-[11px]"><BookOpen className="w-3 h-3" />Quiz</span>}
            {lesson.hasPdf && <span className="flex items-center gap-1 text-[11px]"><FileText className="w-3 h-3" />PDF</span>}
          </span>
        </div>
        <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">
          {lesson.title}
        </h1>
        <p className="text-[13px] text-white/40 mt-1">{lesson.subtitle}</p>
      </div>

      {/* Main grid — video (2/3) + resources sidebar (1/3) */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Video */}
        <div className="md:col-span-2">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0c]">
            {lesson.videoUrl ? (
              <iframe src={lesson.videoUrl} className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${accent}08, transparent)` }} />
                <div className="absolute inset-0" style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, black 20%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, black 20%, transparent 70%)"
                }} />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed" style={{ borderColor: accent + "30" }}>
                    <Play className="w-8 h-8 ml-1" style={{ color: accent + "50" }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] text-white/30 font-medium">Vídeo em breve</p>
                    <p className="text-[11px] text-white/30 mt-1">A gravação será disponibilizada aqui</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resources sidebar */}
        <aside className="md:col-span-1 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-0.5 pl-1">Recursos da aula</p>

          {lesson.hasPdf && (
            <button onClick={() => {}} className="group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.14] hover:bg-white/[0.02] transition-all text-left">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "14" }}>
                <FileText className="w-4 h-4" style={{ color: accent + "CC" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/85 font-semibold leading-tight">Material da Aula</p>
                <p className="text-[10.5px] text-white/35 mt-0.5">Baixar PDF</p>
              </div>
              <Download className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
            </button>
          )}

          {lesson.hasQuiz && lesson.quiz && lesson.quiz.length > 0 && (
            <button onClick={() => activateResource("quiz")}
              className={`group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${
                activeResource === "quiz"
                  ? "shadow-lg"
                  : "border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.14] hover:bg-white/[0.02]"
              }`}
              style={activeResource === "quiz" ? { borderColor: accent + "55", backgroundColor: accent + "10", boxShadow: `0 4px 16px ${accent}15` } : undefined}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + (activeResource === "quiz" ? "22" : "14") }}>
                <BookOpen className="w-4 h-4" style={{ color: activeResource === "quiz" ? accent : accent + "CC" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/85 font-semibold leading-tight">Quiz</p>
                <p className="text-[10.5px] text-white/35 mt-0.5">{lesson.quiz.length} perguntas</p>
              </div>
              {quizPassed ? (
                <CheckCircle className="w-4 h-4 text-green-400/80 shrink-0" />
              ) : activeResource === "quiz" ? (
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-all group-hover:translate-x-0.5 shrink-0" />
              )}
            </button>
          )}

          {hasFlashcards && (
            <button onClick={() => activateResource("flashcards")}
              className={`group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${
                activeResource === "flashcards"
                  ? "shadow-lg"
                  : "border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.14] hover:bg-white/[0.02]"
              }`}
              style={activeResource === "flashcards" ? { borderColor: accent + "55", backgroundColor: accent + "10", boxShadow: `0 4px 16px ${accent}15` } : undefined}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + (activeResource === "flashcards" ? "22" : "14") }}>
                <Sparkles className="w-4 h-4" style={{ color: activeResource === "flashcards" ? accent : accent + "CC" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/85 font-semibold leading-tight">Flashcards</p>
                <p className="text-[10.5px] text-white/35 mt-0.5">{flashcards!.length} conceitos</p>
              </div>
              {activeResource === "flashcards" ? (
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-all group-hover:translate-x-0.5 shrink-0" />
              )}
            </button>
          )}

          {hasChecklist && (
            <button onClick={() => activateResource("checklist")}
              className={`group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${
                activeResource === "checklist"
                  ? "shadow-lg"
                  : "border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.14] hover:bg-white/[0.02]"
              }`}
              style={activeResource === "checklist" ? { borderColor: accent + "55", backgroundColor: accent + "10", boxShadow: `0 4px 16px ${accent}15` } : undefined}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + (activeResource === "checklist" ? "22" : "14") }}>
                <CheckCircle className="w-4 h-4" style={{ color: activeResource === "checklist" ? accent : accent + "CC" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/85 font-semibold leading-tight">Exercício Prático</p>
                <p className="text-[10.5px] text-white/35 mt-0.5">{lesson.checklist!.length} items</p>
              </div>
              {activeResource === "checklist" ? (
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-all group-hover:translate-x-0.5 shrink-0" />
              )}
            </button>
          )}

          {hasTreinos && (
            <button onClick={() => activateResource("treino")}
              className="group relative overflow-hidden w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all hover:-translate-y-0.5"
              style={{
                borderColor: activeResource === "treino" ? accent + "70" : accent + "40",
                backgroundColor: activeResource === "treino" ? accent + "18" : accent + "0C",
                boxShadow: activeResource === "treino" ? `0 4px 16px ${accent}25` : undefined,
              }}>
              <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{
                background: `linear-gradient(90deg, transparent, ${accent}70, transparent)`
              }} />
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "22" }}>
                <Target className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white font-bold leading-tight">Agora pratique</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: accent + "AA" }}>
                  {treinosDaAula.length === 1 ? "1 treino" : `${treinosDaAula.length} treinos`}
                </p>
              </div>
              {activeResource === "treino" ? (
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-all" style={{ color: accent + "99" }} />
              )}
            </button>
          )}

          {/* Progress summary — fills empty sidebar space */}
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0c] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Progresso</p>
                <span className="text-[11px] font-bold text-white/60 font-mono">
                  {[quizPassed].filter(Boolean).length}/{[lesson.hasQuiz, hasFlashcards, hasChecklist, hasTreinos].filter(Boolean).length}
                </span>
              </div>
              <div className="h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${([quizPassed].filter(Boolean).length / Math.max(1, [lesson.hasQuiz, hasFlashcards, hasChecklist, hasTreinos].filter(Boolean).length)) * 100}%`,
                  backgroundColor: accent,
                }} />
              </div>
              <p className="text-[10.5px] text-white/30 mt-2 leading-relaxed">
                {quizPassed ? "Mandou bem! Continue pra próxima aula." : "Complete os recursos pra dominar o conteúdo."}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Active resource panel — renders only the selected resource */}
      {activeResource && (
        <div id="active-resource-panel" className="scroll-mt-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: `linear-gradient(90deg, transparent, ${accent}70 30%, ${accent}50 70%, transparent)`
          }} />
          {/* Header with close */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "18" }}>
                {activeResource === "quiz" && <BookOpen className="w-4 h-4" style={{ color: accent }} />}
                {activeResource === "flashcards" && <Sparkles className="w-4 h-4" style={{ color: accent }} />}
                {activeResource === "checklist" && <CheckCircle className="w-4 h-4" style={{ color: accent }} />}
                {activeResource === "treino" && <Target className="w-4 h-4" style={{ color: accent }} />}
              </div>
              <h2 className="text-[16px] font-bold text-white tracking-tight">
                {activeResource === "quiz" && `Quiz — ${lesson.quiz?.length ?? 0} perguntas`}
                {activeResource === "flashcards" && `Flashcards — ${flashcards?.length ?? 0} conceitos`}
                {activeResource === "checklist" && "Exercício Prático"}
                {activeResource === "treino" && "Agora pratique"}
              </h2>
            </div>
            <button onClick={() => setActiveResource(null)}
              className="text-[11px] text-white/30 hover:text-white/70 transition-colors font-medium">
              Fechar
            </button>
          </div>

          {/* Content */}
          {activeResource === "quiz" && lesson.quiz && (
            <QuizSection questions={lesson.quiz} accent={accent} onComplete={handleQuizComplete} />
          )}
          {activeResource === "flashcards" && flashcards && (
            <FlashcardsSection cards={flashcards} accent={accent} />
          )}
          {activeResource === "checklist" && lesson.checklist && (
            <ChecklistSection items={lesson.checklist} accent={accent} />
          )}
          {activeResource === "treino" && treinosDaAula.length > 0 && (
            <div className={`grid gap-3 ${treinosDaAula.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
              {treinosDaAula.map((treino) => (
                <Link
                  key={treino.id}
                  href={`/elite/treino/${treino.id}`}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0e10] p-5 hover:border-white/[0.18] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity" style={{
                    background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`
                  }} />
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: accent + "15", color: accent + "DD" }}>Treino</span>
                      <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{treino.difficulty}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[15px] font-bold text-white/95 mb-1.5 tracking-tight">{treino.title}</h4>
                  <p className="text-[12px] text-white/45 leading-relaxed">{treino.desc}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-white/30">
                    <Play className="w-3 h-3 fill-current" />
                    <span className="text-[11px] font-semibold">Começar treino</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Comentários da aula — discussão entre alunos */}
      <LessonComments lessonId={lessonId} currentUserId={myId} accent={accent} />

      {/* Navigation — prev/next */}
      <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
        {prev ? (
          <button onClick={() => router.push(`/elite/aulas/${prev.lesson.id}`)}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all text-left group">
            <ArrowLeft className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Anterior</p>
              <p className="text-[13px] text-white/60 font-medium">{prev.lesson.title}</p>
            </div>
          </button>
        ) : <div />}
        {next ? (
          <button onClick={() => router.push(`/elite/aulas/${next.lesson.id}`)}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all text-right group">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Próxima</p>
              <p className="text-[13px] text-white/60 font-medium">{next.lesson.title}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/[0.06] border border-green-500/15">
            <CheckCircle className="w-4 h-4 text-green-400/70" />
            <span className="text-[13px] text-green-400/70 font-medium">Última aula do currículo</span>
          </div>
        )}
      </div>
    </div>
  );
}
