"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Check, X, Shuffle, ArrowRight, Trophy, RotateCcw, Zap, Brain,
} from "lucide-react";
import { LessonChart } from "@/components/elite/LessonChart";
import { SCENARIOS, getCategoryMeta, type Scenario } from "@/lib/treino-scenarios";

const SCENARIO_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

/* ────────────────────────────────────────────
   Concept Visual — cartão do cenário específico (não só categoria).
   Hero: título do cenário · Preview: primeira frase · Arte mini + padrão variável por id.
   ──────────────────────────────────────────── */

function scenarioHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

/** Padrão geométrico decorativo — 4 variantes, escolhido pelo hash do id. */
function ScenarioPattern({ seed, accent }: { seed: number; accent: string }) {
  const variant = seed % 4;
  const rot = (seed >> 2) % 4;    // 0, 90, 180, 270
  const rotate = rot * 90;

  if (variant === 0) {
    // Linhas diagonais
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 pointer-events-none"
        style={{ transform: `rotate(${rotate}deg)` }} preserveAspectRatio="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={-50 + i * 30} y1={220} x2={150 + i * 30} y2={-20} stroke={accent} strokeOpacity="0.035" strokeWidth="1" />
        ))}
      </svg>
    );
  }
  if (variant === 1) {
    // Círculos concêntricos no canto
    const cx = rot % 2 === 0 ? 30 : 170;
    const cy = rot < 2 ? 30 : 170;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none">
        {[20, 35, 55, 80, 110, 145].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} stroke={accent} strokeOpacity={0.06 - i * 0.008} strokeWidth="1" fill="none" />
        ))}
      </svg>
    );
  }
  if (variant === 2) {
    // Pontos em grid
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 pointer-events-none"
        style={{ transform: `rotate(${rotate * 0.5}deg)` }} preserveAspectRatio="none">
        {Array.from({ length: 8 }).map((_, i) =>
          Array.from({ length: 8 }).map((_, j) => (
            <circle key={`${i}-${j}`} cx={10 + i * 24} cy={10 + j * 24} r={((seed + i * j) % 3) + 0.8}
              fill={accent} fillOpacity={0.04 + ((seed + i + j) % 3) * 0.01} />
          ))
        )}
      </svg>
    );
  }
  // variant 3 — ondas
  const yBase = 40 + (rot * 30);
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none">
      {[0, 40, 80, 120, 160].map((offset, i) => (
        <path key={i}
          d={`M -20 ${yBase + offset} Q 50 ${yBase + offset - 15} 100 ${yBase + offset} T 220 ${yBase + offset}`}
          stroke={accent} strokeOpacity={0.045 - i * 0.005} strokeWidth="1" fill="none" />
      ))}
    </svg>
  );
}

function ConceptVisual({ scenario }: { scenario: Scenario }) {
  const meta = getCategoryMeta(scenario.category);
  const Icon = meta?.icon ?? Brain;
  const a = meta?.accent ?? "#FF5500";
  const keyTerms = meta?.keyTerms ?? [];
  const seed = scenarioHash(scenario.id);

  // Preview: primeira frase (até o primeiro "." seguido de espaço/fim) ou primeiros ~120 chars
  const firstStop = scenario.context.search(/\.\s/);
  const preview = firstStop > 20 && firstStop < 180
    ? scenario.context.slice(0, firstStop + 1)
    : scenario.context.slice(0, 140) + (scenario.context.length > 140 ? "…" : "");

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.06] min-h-[460px] flex flex-col" style={{ backgroundColor: "#0e0e10" }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${a}80 30%, ${a}60 70%, transparent)`,
      }} />

      {/* Ambient glow — posição varia por seed */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 50% at ${20 + (seed % 60)}% ${20 + ((seed >> 3) % 60)}%, ${a}1c, transparent 70%)`,
      }} />

      {/* Padrão decorativo único por cenário */}
      <ScenarioPattern seed={seed} accent={a} />

      {/* Header */}
      <div className="relative z-10 px-5 py-3 border-b border-white/[0.04] flex items-center justify-between bg-[#111114]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-[5px] flex items-center justify-center" style={{ backgroundColor: a + "22" }}>
            <Icon className="w-3 h-3" style={{ color: a }} strokeWidth={2.5} />
          </div>
          <span className="text-[12.5px] font-bold text-white tracking-tight">Conceito · {scenario.category}</span>
        </div>
        <span className="text-[10px] font-mono text-white/30">#{scenario.id}</span>
      </div>

      {/* Corpo — hero scenario-driven */}
      <div className="relative z-10 flex-1 flex flex-col px-8 py-8 gap-5">
        {/* Pill da categoria + tagline */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] text-white/55"
            style={{ backgroundColor: a + "10", borderColor: a + "35", color: a }}>
            {scenario.category}
          </span>
          {meta?.tagline && (
            <span className="text-[10.5px] text-white/35 italic">· {meta.tagline}</span>
          )}
        </div>

        {/* Hero: título do cenário */}
        <h3 className="text-[26px] lg:text-[30px] font-bold text-white tracking-tight leading-[1.1]">
          {scenario.title}
        </h3>

        {/* Preview do contexto */}
        <div className="relative pl-4">
          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full" style={{ backgroundColor: a + "45" }} />
          <p className="text-[13px] text-white/55 leading-relaxed italic">&ldquo;{preview}&rdquo;</p>
        </div>

        {/* Big number/mark decorativo único do cenário — preenche o espaço sem repetir arte */}
        <div className="flex-1 flex items-center justify-center min-h-[140px] relative">
          <div
            className="font-black tracking-tighter select-none pointer-events-none leading-none"
            style={{
              fontSize: "180px",
              color: a,
              opacity: 0.05,
              letterSpacing: "-0.08em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {scenario.id.replace(/^s/, "").padStart(2, "0")}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] text-white/55" style={{ color: a + "cc" }}>
              cenário {scenario.id.replace(/^s/, "")}
            </span>
          </div>
        </div>

        {/* Key terms do tema — rodapé sutil */}
        {keyTerms.length > 0 && (
          <div className="pt-3 border-t border-white/[0.04]">
            <p className="text-[9px] text-white/25 font-semibold mb-2">Tópicos do tema</p>
            <div className="flex flex-wrap gap-1.5">
              {keyTerms.map((term) => (
                <span key={term}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium font-mono"
                  style={{
                    backgroundColor: a + "0c",
                    color: a + "cc",
                  }}>
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ────────────────────────────────────────────
   Shuffle helper
   ──────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle a scenario's options and return the new correct index.
 *  Eliminates position bias — student can't memorize "always B". */
function shuffleScenarioOptions(scenario: Scenario): { options: string[]; correct: number } {
  const order = shuffle([0, 1, 2, 3]);
  return {
    options: order.map((i) => scenario.options[i]),
    correct: order.indexOf(scenario.correct),
  };
}

/* ────────────────────────────────────────────
   Treino Livre — Modo Infinito
   ──────────────────────────────────────────── */

export default function TreinoLivrePage() {
  return (
    <Suspense fallback={<div className="h-32" />}>
      <TreinoLivreInner />
    </Suspense>
  );
}

function TreinoLivreInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const pool = useMemo(
    () => (category ? SCENARIOS.filter((s) => s.category === category) : SCENARIOS),
    [category]
  );
  const [queue, setQueue] = useState<Scenario[]>(() => shuffle(pool));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const scenario = queue[currentIdx];

  // Shuffle options per question — prevents "always B" bias.
  // Re-computes when scenario id changes (not on every render).
  const shuffled = useMemo(() => shuffleScenarioOptions(scenario), [scenario.id]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    setStats(prev => ({
      correct: prev.correct + (idx === shuffled.correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIdx >= queue.length - 1) {
      // Reshuffle and restart
      setQueue(shuffle(pool));
      setCurrentIdx(0);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const handleFinish = () => {
    if (stats.total > 0 && !window.confirm(`Encerrar sessão agora? Você fez ${stats.correct}/${stats.total} até aqui — o resumo vai fechar a sessão.`)) return;
    setSessionDone(true);
  };

  const handleRestart = () => {
    setQueue(shuffle(pool));
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setStats({ correct: 0, total: 0 });
    setSessionDone(false);
  };

  // Session summary
  if (sessionDone) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>

        <div className="relative overflow-hidden rounded-xl bg-white/[0.02] p-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

          <div className="mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-14 h-14 text-brand-500" strokeWidth={1.5} />
          </div>

          <h2 className="text-[28px] font-bold text-white mb-2">Sessão Encerrada</h2>
          <p className="text-[42px] font-bold text-brand-500 mb-1">{pct}%</p>
          <p className="text-[14px] text-white/40 mb-8">{stats.correct} de {stats.total} decisões corretas</p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart} className="interactive-tap flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/60 font-medium hover:bg-white/[0.06] transition-all">
              <RotateCcw className="w-4 h-4" /> Nova sessão
            </button>
            <button onClick={() => router.push("/elite/pratica")} className="interactive-tap flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-[13px] font-bold text-white transition-all hover:brightness-110">
              Voltar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-5">
      {/* Header + badge — full width */}
      <div className="animate-in-up space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/30">Acertos:</span>
              <span className="text-[13px] text-white/70 font-bold font-mono">{stats.correct}/{stats.total}</span>
            </div>
            <button onClick={handleFinish} className="text-[12px] text-white/25 hover:text-white/50">
              Encerrar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Shuffle className="w-4 h-4 text-brand-500/50" />
          <span className="text-[11px] text-white/30 font-semibold">Treino Livre</span>
          <span className="text-[11px] text-white/20">·</span>
          <span className="text-[11px] text-white/25">{scenario.category}</span>
          <span className="text-[11px] text-white/20">·</span>
          <span className="text-[11px] text-white/25 font-mono">{pool.length} cenários</span>
          {category && (
            <>
              <span className="text-[11px] text-white/20">·</span>
              <span className="text-[10.5px] font-bold tracking-wide uppercase text-brand-500 flex items-center gap-1.5">
                Filtro: {category}
                <button
                  onClick={() => router.replace("/elite/treino/livre")}
                  className="interactive-tap text-white/35 hover:text-white/70 ml-1"
                  title="Limpar filtro"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Split: visual à esquerda · pergunta + opções à direita (desktop lg+) */}
      <div className="animate-in-up delay-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">
        {/* LEFT — Visual (gráfico ou cartão conceitual) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`visual-${scenario.id}`} {...SCENARIO_TRANSITION}>
            {scenario.chartType ? (
              <LessonChart scenario={scenario.chartType} />
            ) : (
              <ConceptVisual scenario={scenario} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* RIGHT — pergunta + opções + explicação (sticky no desktop) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`qa-${scenario.id}`}
            {...SCENARIO_TRANSITION}
            transition={{ ...SCENARIO_TRANSITION.transition, delay: 0.04 }}
            className="lg:sticky lg:top-4 space-y-3 self-start"
          >
          {/* Pergunta compacta — altura mínima pra não pular layout entre cenários */}
          <div className="relative overflow-hidden rounded-xl bg-white/[0.02] p-5 min-h-[140px]">
            <h3 className="text-[16px] font-bold text-white mb-2 leading-tight">{scenario.title}</h3>
            <p className="text-[12.5px] text-white/50 leading-relaxed">{scenario.context}</p>
          </div>

          {/* Opções */}
          <div className="space-y-2">
            {shuffled.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === shuffled.correct;
              let borderColor = "border-white/[0.06]";
              let bg = "bg-[#0e0e10]";
              let textColor = "text-white/60";

              if (answered) {
                if (isCorrect) {
                  borderColor = "border-green-500/40";
                  bg = "bg-green-500/[0.06]";
                  textColor = "text-green-400";
                } else if (isSelected && !isCorrect) {
                  borderColor = "border-red-500/40";
                  bg = "bg-red-500/[0.06]";
                  textColor = "text-red-400";
                } else {
                  textColor = "text-white/20";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`interactive-tap w-full text-left px-4 py-3 rounded-lg border ${borderColor} ${bg} ${textColor} ${
                    !answered ? "hover:border-white/[0.15] hover:bg-white/[0.02] cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      answered && isCorrect ? "border-green-500 bg-green-500/20" :
                      answered && isSelected && !isCorrect ? "border-red-500 bg-red-500/20" :
                      isSelected ? "border-white/40" : "border-white/[0.10]"
                    }`}>
                      {answered && isCorrect && <Check className="w-2.5 h-2.5 text-green-400" />}
                      {answered && isSelected && !isCorrect && <X className="w-2.5 h-2.5 text-red-400" />}
                    </div>
                    <span className="text-[12.5px] leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explicação + próxima */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl bg-white/[0.02] p-4"
            >
              <p className="text-[10.5px] text-white/30 font-semibold mb-1.5">Explicação</p>
              <p className="text-[12px] text-white/55 leading-relaxed">{scenario.explanation}</p>

              <button onClick={handleNext} className="interactive-tap mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-[12.5px] font-bold text-white hover:brightness-110">
                Próxima <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
