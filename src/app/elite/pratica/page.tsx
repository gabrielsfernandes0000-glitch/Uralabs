"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Check, X, ChevronRight, Target, BookOpen, Sparkles, Flame, Trophy,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import {
  SCENARIOS,
  TREINO_CATEGORIES,
  countByCategory,
  getDailyTheme,
  getDailyScenarios,
  todayKey,
  getCategoryMeta,
  type Scenario,
} from "@/lib/treino-scenarios";

/* ────────────────────────────────────────────
   Prática — hub de treinos. Hero · Diário c/ streak · Livre · Por Tema · Skills.
   ──────────────────────────────────────────── */

interface GuidedTreino {
  id: string; title: string; desc: string;
  requiredLesson: string; requiredLessonTitle: string;
  module: string; moduleColor: string;
  difficulty: "iniciante" | "intermediário" | "avançado";
  type: "identificar" | "decisão" | "execução";
  steps: number;
}

const GUIDED_TREINOS: GuidedTreino[] = [
  { id: "t-candles",  title: "Leitura de Candle",      desc: "Identifique o que cada candle está dizendo sobre compradores vs vendedores.", requiredLesson: "leitura-candle",   requiredLessonTitle: "Leitura de Candle",       module: "Base",          moduleColor: "#FF5500", difficulty: "iniciante",     type: "identificar", steps: 3 },
  { id: "t-risco",    title: "Calcule o Risco",        desc: "Posicione stop e alvo corretamente. Qual o tamanho do lote?",                 requiredLesson: "risco",            requiredLessonTitle: "Gerenciamento de Risco",  module: "Base",          moduleColor: "#FF5500", difficulty: "iniciante",     type: "decisão",     steps: 3 },
  { id: "t-obs",      title: "Marque os Order Blocks", desc: "Encontre as zonas onde os institucionais se posicionaram.",                   requiredLesson: "order-blocks",     requiredLessonTitle: "Order Blocks",            module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-fvg",      title: "Identifique FVGs",       desc: "Marque os Fair Value Gaps e diga quais serão preenchidos.",                   requiredLesson: "fvg-breaker",      requiredLessonTitle: "FVG & Breaker Blocks",    module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-premium",  title: "Premium ou Discount?",   desc: "Defina as zonas de desconto e premium usando Fibonacci 50%.",                 requiredLesson: "premium-discount", requiredLessonTitle: "Premium & Discount",      module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-liquidez", title: "Onde Está a Liquidez?",  desc: "Mapeie os pools de liquidez que os big players vão buscar.",                  requiredLesson: "liquidez",         requiredLessonTitle: "Liquidez",                module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-sessoes",  title: "Qual Sessão Operar?",    desc: "Identifique a sessão e o comportamento esperado do mercado.",                 requiredLesson: "sessoes",          requiredLessonTitle: "Sessões de Mercado",      module: "Estratégia",    moduleColor: "#A855F7", difficulty: "avançado",      type: "decisão",     steps: 3 },
  { id: "t-amd",      title: "Leitura AMD Completa",   desc: "Identifique Acumulação, Manipulação e Distribuição em tempo real.",           requiredLesson: "amd",              requiredLessonTitle: "AMD",                     module: "Estratégia",    moduleColor: "#A855F7", difficulty: "avançado",      type: "decisão",     steps: 3 },
  { id: "t-bias",     title: "Monte o Viés do Dia",    desc: "Com base na estrutura, defina se o dia é bullish ou bearish.",                requiredLesson: "daily-bias",       requiredLessonTitle: "Daily Bias & Judas Swing", module: "Estratégia",   moduleColor: "#A855F7", difficulty: "avançado",      type: "decisão",     steps: 3 },
  { id: "t-entrada",  title: "Execute o Trade",        desc: "Cenário completo: identifique a zona, defina entrada, stop e alvo.",          requiredLesson: "entrada-saida",    requiredLessonTitle: "Entrada & Saída",         module: "Execução",      moduleColor: "#10B981", difficulty: "avançado",      type: "execução",    steps: 3 },
];

/* ────────────────────────────────────────────
   Helpers de streak — localStorage
   ──────────────────────────────────────────── */

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  const today = new Date();
  const todayDone = localStorage.getItem(`treino-diario-${dateKey(today)}`) === "done";
  const offset = todayDone ? 0 : 1;
  for (let i = offset; i < 100; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (localStorage.getItem(`treino-diario-${dateKey(d)}`) === "done") count++;
    else break;
  }
  return count;
}

function last14Days(): { key: string; done: boolean; isToday: boolean; label: string }[] {
  if (typeof window === "undefined") return [];
  const out = [];
  const today = new Date();
  const weekday = ["D", "S", "T", "Q", "Q", "S", "S"];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      key: dateKey(d),
      done: localStorage.getItem(`treino-diario-${dateKey(d)}`) === "done",
      isToday: i === 0,
      label: weekday[d.getDay()],
    });
  }
  return out;
}

/* ────────────────────────────────────────────
   Streak panel — contador + calendário 14 dias
   ──────────────────────────────────────────── */

function StreakPanel({ streakVersion }: { streakVersion: number }) {
  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [days, setDays] = useState<ReturnType<typeof last14Days>>([]);
  const [themesCovered, setThemesCovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStreak(computeStreak());
    setDays(last14Days());
    // Temas cobertos nos últimos 30 dias concluídos
    if (typeof window !== "undefined") {
      const covered = new Set<string>();
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const k = dateKey(d);
        if (localStorage.getItem(`treino-diario-${k}`) === "done") {
          covered.add(getDailyTheme(k));
        }
      }
      setThemesCovered(covered);
    }
    setLoaded(true);
  }, [streakVersion]);

  if (!loaded) return <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] h-[220px]" />;

  const milestone =
    streak >= 30 ? { next: null, msg: "Você é máquina. Consistência rara." } :
    streak >= 14 ? { next: 30, msg: "Faltam poucos dias pra 30 seguidos." } :
    streak >= 7  ? { next: 14, msg: "Hábito se formando. Próximo: 14 dias." } :
    streak >= 3  ? { next: 7,  msg: "Tá pegando ritmo. Próximo: 7 dias." } :
    streak >= 1  ? { next: 3,  msg: "Bom começo. Faltam pouco pra 3 seguidos." } :
                   { next: 1,  msg: "Cada grande streak começa com o primeiro dia." };

  const done14 = days.filter((d) => d.done).length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6">
      <div className="absolute top-[-30%] right-[-10%] w-[280px] h-[180px] bg-amber-500/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center gap-4">
          <Flame className={`w-10 h-10 shrink-0 ${streak > 0 ? "text-amber-400" : "text-white/25"}`} strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className={`text-[32px] font-bold font-mono leading-none ${streak > 0 ? "text-amber-300" : "text-white/80"}`}>{streak}</p>
              <p className="text-[12px] text-white/45 font-medium">{streak === 1 ? "dia seguido" : "dias seguidos"}</p>
            </div>
            <p className="text-[11px] text-white/40 mt-1 leading-relaxed">{milestone.msg}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Últimos 14 dias</p>
            <p className="text-[10.5px] font-mono text-white/40">{done14}/14</p>
          </div>
          <div className="grid gap-[5px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {days.map((d) => (
              <div
                key={d.key}
                title={`${d.key}${d.done ? " · ✓ concluído" : d.isToday ? " · hoje" : ""}`}
                className={`aspect-square rounded-[4px] flex items-center justify-center text-[8.5px] font-mono font-bold border ${
                  d.done
                    ? "border-amber-500/45 text-amber-400"
                    : d.isToday
                    ? "border-brand-500/50 text-white/50"
                    : "border-white/[0.05] text-white/20"
                }`}
              >
                {d.done ? <Check className="w-2.5 h-2.5" strokeWidth={2.5} /> : d.label}
              </div>
            ))}
          </div>
        </div>

        {milestone.next && (
          <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-white/30" strokeWidth={1.8} />
              <p className="text-[11px] text-white/45">Próximo marco</p>
            </div>
            <p className="text-[11px] font-bold font-mono text-white/70">
              {milestone.next - streak} {milestone.next - streak === 1 ? "dia" : "dias"} · {milestone.next} seguidos
            </p>
          </div>
        )}

        {/* Temas cobertos — mini constelação */}
        <div className="pt-3 border-t border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Temas cobertos</p>
            <p className="text-[10.5px] font-mono text-white/40">{themesCovered.size}/{TREINO_CATEGORIES.length}</p>
          </div>
          <div className="space-y-1.5">
            {TREINO_CATEGORIES.map((cat) => {
              const covered = themesCovered.has(cat.key);
              return (
                <div key={cat.key} className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: covered ? cat.accent : "rgba(255,255,255,0.12)" }}
                  />
                  <span className="text-[10.5px] font-medium" style={{ color: covered ? cat.accent : "rgba(255,255,255,0.30)" }}>
                    {cat.key}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-white/35 leading-relaxed mt-3">
            Cada dia um tema diferente. Em ~15 dias você passa por todos.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Treino Diário — missão do dia: tema único, 3 cenários
   ──────────────────────────────────────────── */

function DailyTreinoCard({ onComplete }: { onComplete: () => void }) {
  const day = todayKey();
  const theme = useMemo(() => getDailyTheme(day), [day]);
  const scenarios = useMemo(() => getDailyScenarios(day, 3), [day]);
  const storageKey = `treino-diario-${day}`;
  const catMeta = getCategoryMeta(theme);
  const catAccent = catMeta?.accent ?? "#FF5500";

  const [loaded, setLoaded] = useState(false);
  const [doneToday, setDoneToday] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => scenarios.map(() => null));

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDoneToday(localStorage.getItem(storageKey) === "done");
    setLoaded(true);
  }, [storageKey]);

  const currentScenario: Scenario | undefined = scenarios[currentIdx];
  const currentPick = picks[currentIdx];
  const showAnswer = currentPick !== null;
  const allAnswered = picks.every((p) => p !== null);
  const correctCount = picks.filter((p, i) => p === scenarios[i]?.correct).length;

  const handlePick = (idx: number) => {
    if (showAnswer) return;
    setPicks((prev) => {
      const next = [...prev];
      next[currentIdx] = idx;
      return next;
    });
  };

  const handleNext = () => {
    if (currentIdx < scenarios.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handleFinalize = () => {
    if (typeof window !== "undefined") localStorage.setItem(storageKey, "done");
    setDoneToday(true);
    onComplete();
  };

  if (!loaded) {
    return <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] h-[460px]" />;
  }

  // Estado: já concluiu hoje
  if (doneToday) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-[#0e0e10] min-h-[460px] flex items-center justify-center p-8">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,185,129,0.04), transparent 70%)"
        }} />
        <div className="relative z-10 text-center space-y-5 max-w-sm">
          <Check className="mx-auto w-14 h-14 text-green-400" strokeWidth={1.5} />
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-green-400/80 mb-2">Concluído</p>
            <h3 className="text-[22px] font-bold text-white tracking-tight leading-tight">Missão do dia completa</h3>
            <p className="text-[12.5px] text-white/45 mt-2 leading-relaxed">
              Hoje você treinou <span className="text-white/70 font-semibold">{theme}</span> — 3 cenários respondidos.
              Volte amanhã pra um novo tema.
            </p>
          </div>
          <div className="inline-flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.8} />
            <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-amber-300/90">Streak mantida</span>
          </div>
        </div>
      </div>
    );
  }

  // Estado: terminou os 3, aguardando finalizar
  if (allAnswered) {
    const accuracy = Math.round((correctCount / scenarios.length) * 100);
    const performanceCopy =
      correctCount === scenarios.length ? "Leitura cirúrgica. Todos no ponto." :
      correctCount >= 2 ? "Boa leitura. Revê a que errou e fixa o conceito." :
      correctCount >= 1 ? "Tá formando. Volta pra teoria do tema hoje." :
                          "Dia de aprender. Revisita o conteúdo e tenta amanhã.";

    return (
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-[#0e0e10] min-h-[460px] p-8 flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${catAccent}14, transparent 70%)`
        }} />
        <div className="relative z-10 space-y-5 max-w-sm">
          <Trophy className="mx-auto w-12 h-12" style={{ color: catAccent }} strokeWidth={1.5} />
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: catAccent }}>{theme}</p>
            <h3 className="text-[22px] font-bold text-white tracking-tight leading-tight">Missão finalizada</h3>
            <p className="text-[12.5px] text-white/50 mt-3 leading-relaxed">{performanceCopy}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            {picks.map((p, i) => {
              const ok = p === scenarios[i]?.correct;
              return ok ? (
                <Check key={i} className="w-5 h-5 text-green-400" strokeWidth={2} />
              ) : (
                <X key={i} className="w-5 h-5 text-red-400" strokeWidth={2} />
              );
            })}
          </div>
          <p className="text-[11px] text-white/50 font-mono tracking-wide">{correctCount}/{scenarios.length} corretos · {accuracy}%</p>
          <button onClick={handleFinalize}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-brand-500 text-brand-500 text-[13px] font-bold hover:bg-brand-500/[0.04]">
            <Check className="w-4 h-4" strokeWidth={2} />
            Concluir missão de hoje
          </button>
        </div>
      </div>
    );
  }

  // Estado: respondendo cenário atual
  if (!currentScenario) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-b from-[#15110e] to-[#0e0e10] min-h-[460px] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[200px] bg-brand-500/[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[240px] h-[160px] pointer-events-none" style={{
        background: `radial-gradient(ellipse, ${catAccent}18, transparent 70%)`,
      }} />

      {/* Header — missão + tema + progress */}
      <div className="relative z-10 px-6 pt-5 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-500 shrink-0" strokeWidth={1.8} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-white tracking-tight">Missão do dia</h3>
                <span className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-brand-500/80">· Hoje</span>
              </div>
              <p className="text-[10.5px] text-white/40 mt-0.5">Tema: <span className="font-bold" style={{ color: catAccent }}>{theme}</span> · 3 cenários</p>
            </div>
          </div>
          <p className="text-[11px] font-mono text-white/45">{currentIdx + 1}/{scenarios.length}</p>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {scenarios.map((_, i) => {
            const state = picks[i] === null ? (i === currentIdx ? "current" : "pending") : (picks[i] === scenarios[i].correct ? "correct" : "wrong");
            return (
              <div key={i} className={`flex-1 h-1 rounded-full ${
                state === "correct" ? "bg-green-500/60" :
                state === "wrong"   ? "bg-red-500/60" :
                state === "current" ? "bg-brand-500/80" :
                                      "bg-white/[0.08]"
              }`} />
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-[17px] font-bold text-white leading-tight mb-2">{currentScenario.title}</h4>
              <p className="text-[12.5px] text-white/55 leading-relaxed">{currentScenario.context}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentScenario.options.map((opt, idx) => {
                const isPicked = currentPick === idx;
                const isRight = idx === currentScenario.correct;
                let cls = "border-white/[0.06] bg-[#0e0e10] text-white/60 hover:border-white/[0.14] hover:bg-white/[0.02]";
                if (showAnswer) {
                  if (isRight) cls = "border-green-500/40 bg-green-500/[0.08] text-green-200";
                  else if (isPicked) cls = "border-red-500/40 bg-red-500/[0.08] text-red-200";
                  else cls = "border-white/[0.04] bg-transparent text-white/25";
                }
                return (
                  <button key={idx} onClick={() => handlePick(idx)} disabled={showAnswer}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-[12.5px] font-medium ${cls}`}>
                    <span className="font-mono mr-2 text-white/35">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-xl border p-4 ${currentPick === currentScenario.correct ? "border-green-500/25 bg-green-500/[0.04]" : "border-red-500/25 bg-red-500/[0.04]"}`}
              >
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${currentPick === currentScenario.correct ? "text-green-400" : "text-red-400"}`}>
                  {currentPick === currentScenario.correct ? "Correto" : "Não exatamente"}
                </p>
                <p className="text-[12px] text-white/55 leading-relaxed">{currentScenario.explanation}</p>
                <button onClick={handleNext}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500 text-brand-500 text-[12px] font-bold hover:bg-brand-500/[0.04]">
                  {currentIdx < scenarios.length - 1 ? "Próximo cenário" : "Ver resultado"} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Card "Por Tema" — editorial com mini-arte custom
   ──────────────────────────────────────────── */

function ThemeCard({ category }: { category: { key: string; accent: string; tagline: string; keyTerms: string[] } }) {
  const count = useMemo(() => SCENARIOS.filter((s) => s.category === category.key).length, [category.key]);
  const a = category.accent;

  return (
    <Link
      href={`/elite/treino/livre?category=${encodeURIComponent(category.key)}`}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.18] transition-colors min-h-[180px] flex flex-col"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${a}80 50%, transparent)` }}
      />
      {/* Ambient glow */}
      <div className="absolute top-[-30%] right-[-20%] w-[200px] h-[140px] pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
        style={{ background: `radial-gradient(ellipse, ${a}22, transparent 70%)` }}
      />
      {/* Watermark category name */}
      <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
        <span className="font-black tracking-tighter whitespace-nowrap select-none pr-4"
          style={{ fontSize: "90px", color: a, opacity: 0.035, letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          {category.key.toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 p-5 flex-1 flex flex-col">
        {/* Header row — side accent bar + tagline caps */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-0.5 h-5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: a }} />
          <p className="text-[9.5px] font-bold tracking-[0.25em] uppercase" style={{ color: a }}>{category.tagline}</p>
        </div>

        {/* Category name — hero typography */}
        <h3 className="text-[22px] font-bold text-white tracking-tight leading-[1.05] mb-3">{category.key}</h3>

        {/* Key terms preview */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
          {category.keyTerms.slice(0, 3).map((term, i) => (
            <span key={term} className="text-[10.5px] text-white/40 font-mono">
              {term}{i < Math.min(category.keyTerms.length, 3) - 1 && <span className="text-white/15 ml-2">·</span>}
            </span>
          ))}
        </div>

        {/* Footer — count + chevron */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold font-mono" style={{ color: a }}>{count}</span>
            <span className="text-[11px] text-white/35">cenários</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────
   Página
   ──────────────────────────────────────────── */

export default function PraticaPage() {
  const { completedLessons } = useProgress();
  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);
  const [streakVersion, setStreakVersion] = useState(0);

  const counts = countByCategory();
  const totalScenarios = SCENARIOS.length;
  const totalGuided = GUIDED_TREINOS.length;
  const totalThemes = TREINO_CATEGORIES.length;

  const grouped = GUIDED_TREINOS.reduce<Record<string, GuidedTreino[]>>((acc, t) => {
    (acc[t.module] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {/* ───── HERO ───── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0e0e10] border border-white/[0.06]">
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
          <span
            className="font-black tracking-tighter whitespace-nowrap select-none opacity-[0.025] text-brand-500 pr-12"
            style={{ fontSize: "240px", letterSpacing: "-0.06em", lineHeight: 1 }}
          >
            PRÁTICA
          </span>
        </div>
        <div className="absolute top-[-40%] left-[5%] w-[600px] h-[400px] bg-brand-500/[0.05] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[5%] w-[500px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

        <div className="relative z-10 p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-1 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-500">Modo infinito · 24/7</span>
              </div>
              <h1 className="text-[34px] lg:text-[44px] font-bold text-white tracking-tight leading-[1.05]">Prática</h1>
              <p className="text-[14px] text-white/45 mt-3 max-w-lg leading-relaxed">
                Treine leitura e decisão com cenários reais. Missão diária rotativa pelos temas, centenas de cenários filtráveis e 10 skills com sequência de 3 passos e gráfico real.
              </p>
            </div>
            <div className="flex items-end gap-6">
              <div className="text-right">
                <p className="text-[36px] lg:text-[44px] font-bold text-white leading-none font-mono">{totalScenarios}</p>
                <p className="text-[10.5px] text-white/30 uppercase tracking-[0.15em] mt-1.5">cenários</p>
              </div>
              <div className="h-12 w-px bg-white/[0.08]" />
              <div className="text-right">
                <p className="text-[36px] lg:text-[44px] font-bold text-white leading-none font-mono">{totalThemes}</p>
                <p className="text-[10.5px] text-white/30 uppercase tracking-[0.15em] mt-1.5">temas</p>
              </div>
              <div className="h-12 w-px bg-white/[0.08]" />
              <div className="text-right">
                <p className="text-[36px] lg:text-[44px] font-bold text-white leading-none font-mono">{totalGuided}</p>
                <p className="text-[10.5px] text-white/30 uppercase tracking-[0.15em] mt-1.5">skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── HOJE ───── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1 h-5 rounded-full bg-brand-500/60" />
          <h2 className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Hoje</h2>
          <span className="text-[10.5px] text-white/30">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-stretch">
          <DailyTreinoCard onComplete={() => setStreakVersion((v) => v + 1)} />
          <StreakPanel streakVersion={streakVersion} />
        </div>
      </div>

      {/* ───── Treino Livre — card único destacado ───── */}
      <Link href="/elite/treino/livre" className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-brand-500/30 transition-colors block">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        <div className="absolute top-[-30%] right-[10%] w-[400px] h-[240px] bg-brand-500/[0.04] blur-[120px] pointer-events-none" />
        <div className="relative z-10 p-6 flex items-center gap-5">
          <Zap className="w-10 h-10 text-brand-500 shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[17px] font-bold text-white tracking-tight">Treino Livre</h3>
              <span className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-white/35">· Infinito</span>
            </div>
            <p className="text-[12px] text-white/45 leading-relaxed">
              <span className="font-mono text-white/70">{totalScenarios}</span> cenários embaralhados · todos os temas · responde e avança sem fim
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/25 group-hover:text-brand-500/70 transition-colors" />
        </div>
      </Link>

      {/* ───── Por Tema ───── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1 h-5 rounded-full bg-white/[0.25]" />
          <h2 className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Por tema</h2>
          <span className="text-[10.5px] text-white/30 font-mono">{totalThemes} · escolha o que treinar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TREINO_CATEGORIES.map((cat) => (
            <ThemeCard key={cat.key} category={cat} />
          ))}
        </div>
      </div>

      {/* ───── Skills ───── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1 h-5 rounded-full bg-white/[0.25]" />
          <h2 className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Skills</h2>
          <span className="text-[10.5px] text-white/30 font-mono">{totalGuided} · sequência de 3 passos com gráfico real</span>
        </div>

        {Object.entries(grouped).map(([moduleName, treinos]) => {
          const moduleColor = treinos[0].moduleColor;
          return (
            <div key={moduleName} className="space-y-2.5">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: moduleColor + "80" }} />
                <h4 className="text-[11.5px] font-semibold text-white/55 uppercase tracking-wider">{moduleName}</h4>
                <span className="text-[10px] text-white/25 font-mono">{treinos.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {treinos.map((treino) => {
                  const lessonDone = isCompleted(treino.requiredLesson);
                  return (
                    <Link
                      key={treino.id}
                      href={`/elite/treino/${treino.id}`}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4 block hover:border-white/[0.16] transition-colors cursor-pointer"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${moduleColor}40, transparent)` }} />
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <Target className="w-5 h-5 shrink-0" style={{ color: moduleColor }} strokeWidth={1.5} />
                          <div className="min-w-0">
                            <h5 className="text-[13.5px] font-bold text-white/90 leading-tight truncate">{treino.title}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/30">{treino.difficulty.charAt(0).toUpperCase() + treino.difficulty.slice(1)}</span>
                              <span className="text-[10px] text-white/20">·</span>
                              <span className="text-[10px] text-white/30 font-mono">{treino.steps} passos</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/15 mt-1 shrink-0" />
                      </div>
                      <p className="text-[11.5px] leading-relaxed ml-8 text-white/40">{treino.desc}</p>
                      <div className="mt-2 ml-8 inline-flex items-center gap-1.5 text-[10px] text-white/35">
                        {lessonDone ? (
                          <>
                            <Check className="w-3 h-3 text-green-400/70" />
                            <span>Baseado em &ldquo;{treino.requiredLessonTitle}&rdquo;</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3 h-3 text-white/30" />
                            <span>Recomendado: ver &ldquo;{treino.requiredLessonTitle}&rdquo; antes</span>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
