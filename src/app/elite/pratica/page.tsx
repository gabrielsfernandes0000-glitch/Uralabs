"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Check, X, ChevronRight, Target, Sparkles, Flame, Trophy, Layers,
} from "lucide-react";
import {
  SCENARIOS,
  TREINO_CATEGORIES,
  getDailyTheme,
  getDailyScenarios,
  todayKey,
  getCategoryMeta,
  type Scenario,
} from "@/lib/treino-scenarios";
import { GUIDED_TREINOS } from "@/lib/pratica-treinos";
import { TodayEventsBanner } from "@/components/elite/TodayEventsBanner";
import { EventBonusTreinoCard } from "@/components/elite/EventBonusTreinoCard";

/* ────────────────────────────────────────────
   Prática — hub enxuto: Hero · Missão do dia · Streak · 3 atalhos.
   Temas e Skills moraram nas sub-rotas /temas e /skills.
   ──────────────────────────────────────────── */

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
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-5">
      <div className="relative z-10 space-y-3.5">
        <div className="flex items-center gap-3">
          <Flame className={`w-8 h-8 shrink-0 ${streak > 0 ? "text-brand-500" : "text-white/25"}`} strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className={`text-[26px] font-bold font-mono leading-none ${streak > 0 ? "text-amber-300" : "text-white/80"}`}>{streak}</p>
              <p className="text-[11px] text-white/45 font-medium">{streak === 1 ? "dia seguido" : "dias seguidos"}</p>
            </div>
            <p className="text-[10.5px] text-white/40 mt-0.5 leading-snug">{milestone.msg}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/30">Últimos 14 dias</p>
            <p className="text-[10px] font-mono text-white/40">{done14}/14</p>
          </div>
          <div className="grid gap-[4px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {days.map((d) => (
              <div
                key={d.key}
                title={`${d.key}${d.done ? " · ✓ concluído" : d.isToday ? " · hoje" : ""}`}
                className={`aspect-square rounded-[4px] flex items-center justify-center text-[8px] font-mono font-bold border ${
                  d.done
                    ? "border-white/30 bg-white/[0.08] text-white"
                    : d.isToday
                    ? "border-white/30 text-white/60"
                    : "border-white/[0.05] text-white/20"
                }`}
              >
                {d.done ? <Check className="w-2.5 h-2.5" strokeWidth={2.5} /> : d.label}
              </div>
            ))}
          </div>
        </div>

        {milestone.next && (
          <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-3 h-3 text-white/30" strokeWidth={1.8} />
              <p className="text-[10.5px] text-white/45">Próximo marco</p>
            </div>
            <p className="text-[10.5px] font-bold font-mono text-white/70">
              {milestone.next - streak}d · {milestone.next} seguidos
            </p>
          </div>
        )}

        {/* Temas cobertos — linha horizontal compacta */}
        <div className="pt-2.5 border-t border-white/[0.05]">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/30">Temas cobertos</p>
            <p className="text-[10px] font-mono text-white/40">{themesCovered.size}/{TREINO_CATEGORIES.length}</p>
          </div>
          <div className="grid gap-[4px]" style={{ gridTemplateColumns: `repeat(${TREINO_CATEGORIES.length}, minmax(0, 1fr))` }}>
            {TREINO_CATEGORIES.map((cat) => {
              const covered = themesCovered.has(cat.key);
              return (
                <div
                  key={cat.key}
                  title={`${cat.key}${covered ? " · ✓ coberto" : ""}`}
                  className={`aspect-square rounded-[3px] border ${
                    covered
                      ? "border-white/30 bg-white/[0.12]"
                      : "border-white/[0.05] bg-transparent"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Uncovered Themes — temas que o user ainda não treinou,
   acionáveis (click = vai direto pro treino daquele tema).
   Fecha o loop do streak card (2/15 cobertos → "estes aqui te esperam").
   ──────────────────────────────────────────── */

function UncoveredThemesPanel({ streakVersion }: { streakVersion: number }) {
  const [loaded, setLoaded] = useState(false);
  const [covered, setCovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = dateKey(d);
      if (localStorage.getItem(`treino-diario-${k}`) === "done") {
        s.add(getDailyTheme(k));
      }
    }
    setCovered(s);
    setLoaded(true);
  }, [streakVersion]);

  if (!loaded) return null;
  const uncovered = TREINO_CATEGORIES.filter((cat) => !covered.has(cat.key));
  if (uncovered.length === 0) return null; // user cobriu tudo

  const visibleCount = Math.min(uncovered.length, 6);
  const remaining = uncovered.length - visibleCount;

  return (
    <div className="rounded-2xl bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-bold text-white/85">Temas que faltam</h3>
          <span className="text-[10.5px] text-white/30 font-mono tabular-nums">
            {uncovered.length}/{TREINO_CATEGORIES.length}
          </span>
        </div>
        <Link
          href="/elite/pratica/temas"
          className="text-[10px] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
        >
          Ver todos <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {uncovered.slice(0, visibleCount).map((cat) => (
          <Link
            key={cat.key}
            href={`/elite/treino/livre?category=${encodeURIComponent(cat.key)}`}
            className="interactive group relative overflow-hidden rounded-lg bg-white/[0.02] px-3 py-2.5 transition-colors flex items-center gap-2.5"
          >
            {/* Hover wash da cor da categoria (mesmo pattern dos ThemeCards) */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${cat.accent}14, ${cat.accent}05 60%, transparent)` }}
            />
            <span className="relative w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: cat.accent }} />
            <div className="relative flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white/90 leading-tight truncate">{cat.key}</p>
              <p className="text-[9.5px] text-white/35 truncate mt-0.5">{cat.tagline}</p>
            </div>
            <ChevronRight className="relative w-3 h-3 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      {remaining > 0 && (
        <p className="text-[10px] text-white/25 mt-3 text-center">
          + {remaining} {remaining === 1 ? "tema" : "temas"} em{" "}
          <Link href="/elite/pratica/temas" className="text-white/45 hover:text-white/80 underline underline-offset-2">
            Por Tema
          </Link>
        </p>
      )}
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
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10] p-5 flex items-center gap-5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/35 to-transparent" />

        <div className="relative z-10 shrink-0 w-14 h-14 rounded-full bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
          <Check className="w-7 h-7 text-green-400" strokeWidth={2} />
        </div>

        <div className="relative z-10 flex-1 min-w-0">
          <span className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-green-400/80">Concluído</span>
          <h3 className="text-[17px] font-bold text-white tracking-tight leading-tight mt-0.5">Missão do dia completa</h3>
          <p className="text-[11.5px] text-white/45 mt-1 leading-relaxed">
            Hoje você treinou <span className="text-white/70 font-semibold">{theme}</span> — 3 cenários respondidos. Volte amanhã pra um novo tema.
          </p>
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
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10] p-6 flex flex-col items-center justify-center text-center">
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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      <div className="absolute top-[-30%] right-[-10%] w-[260px] h-[160px] bg-brand-500/[0.04] blur-[110px] pointer-events-none" />

      {/* Header — missão + tema + progress */}
      <div className="relative z-10 px-5 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4.5 h-4.5 text-brand-500 shrink-0" strokeWidth={1.8} />
            <div>
              <h3 className="text-[13px] font-bold text-white tracking-tight">Missão do dia</h3>
              <p className="text-[10.5px] text-white/40 mt-0.5">Tema: <span className="font-bold text-white/70">{theme}</span> · 3 cenários</p>
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
      <div className="relative z-10 p-5">
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
                let icon: React.ReactNode = null;
                if (showAnswer) {
                  if (isRight) {
                    cls = "border-green-500/60 bg-green-500/[0.16] text-green-100 shadow-[0_0_0_1px_rgba(74,222,128,0.25),0_8px_32px_rgba(74,222,128,0.12)]";
                    icon = <Check className="w-4 h-4 text-green-400 shrink-0" strokeWidth={2.5} />;
                  } else if (isPicked) {
                    cls = "border-red-500/60 bg-red-500/[0.14] text-red-100 shadow-[0_0_0_1px_rgba(248,113,113,0.2)]";
                    icon = <X className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2.5} />;
                  } else {
                    cls = "border-white/[0.04] bg-transparent text-white/20";
                  }
                }
                return (
                  <motion.button
                    key={idx}
                    onClick={() => handlePick(idx)}
                    disabled={showAnswer}
                    animate={showAnswer && (isRight || isPicked) ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-[12.5px] font-medium flex items-center gap-2.5 ${cls}`}
                  >
                    <span className="font-mono text-white/35 shrink-0">{String.fromCharCode(65 + idx)}.</span>
                    <span className="flex-1">{opt}</span>
                    {icon}
                  </motion.button>
                );
              })}
            </div>

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`relative overflow-hidden rounded-xl p-4 ${currentPick === currentScenario.correct ? "bg-green-500/[0.08]" : "bg-red-500/[0.08]"}`}
              >
                <div className={`absolute top-0 left-0 bottom-0 w-[3px] ${currentPick === currentScenario.correct ? "bg-green-400" : "bg-red-400"}`} />
                <div className="flex items-center gap-2 mb-2">
                  {currentPick === currentScenario.correct ? (
                    <Check className="w-4 h-4 text-green-400" strokeWidth={2.5} />
                  ) : (
                    <X className="w-4 h-4 text-red-400" strokeWidth={2.5} />
                  )}
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${currentPick === currentScenario.correct ? "text-green-400" : "text-red-400"}`}>
                    {currentPick === currentScenario.correct ? "Isso mesmo" : "Ainda não"}
                  </p>
                </div>
                <p className="text-[12.5px] text-white/75 leading-relaxed">{currentScenario.explanation}</p>
                <button onClick={handleNext}
                  className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500 text-brand-500 text-[12px] font-bold hover:bg-brand-500/[0.04]">
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
   Página
   ──────────────────────────────────────────── */

export default function PraticaPage() {
  const [streakVersion, setStreakVersion] = useState(0);

  const totalScenarios = SCENARIOS.length;
  const totalGuided = GUIDED_TREINOS.length;
  const totalThemes = TREINO_CATEGORIES.length;

  return (
    <div className="space-y-6">
      {/* ───── HERO ───── */}
      <div className="animate-in-up relative overflow-hidden rounded-2xl bg-white/[0.02]">
        <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
          <span
            className="font-black tracking-tighter whitespace-nowrap select-none opacity-[0.025] text-white pr-10"
            style={{ fontSize: "160px", letterSpacing: "-0.06em", lineHeight: 1 }}
          >
            PRÁTICA
          </span>
        </div>

        <div className="relative z-10 p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5">
            <div>
              <h1 className="text-[26px] lg:text-[30px] font-bold text-white tracking-tight leading-[1.05]">Prática</h1>
              <p className="text-[12.5px] text-white/45 mt-2 max-w-lg leading-relaxed">
                Treine leitura e decisão com cenários reais. Missão diária rotativa, {totalScenarios} cenários filtráveis e {totalGuided} skills guiadas.
              </p>
            </div>
            <div className="flex items-end gap-5">
              <div className="text-right">
                <p className="text-[26px] lg:text-[30px] font-bold text-white leading-none font-mono">{totalScenarios}</p>
                <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-1">cenários</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-right">
                <p className="text-[26px] lg:text-[30px] font-bold text-white leading-none font-mono">{totalThemes}</p>
                <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-1">temas</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-right">
                <p className="text-[26px] lg:text-[30px] font-bold text-white leading-none font-mono">{totalGuided}</p>
                <p className="text-[9.5px] text-white/30 uppercase tracking-[0.15em] mt-1">skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Grid principal: missão+modos (esquerda) · streak (direita) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Coluna esquerda — hierarquia: contexto > a\u00e7\u00e3o do dia > alternativas > descoberta */}
        <div className="space-y-3">
          <div className="animate-in-up delay-0">
            <EventBonusTreinoCard />
          </div>

          <div className="animate-in-up delay-1">
            <DailyTreinoCard onComplete={() => setStreakVersion((v) => v + 1)} />
          </div>

          {/* Modos de treino — accent lateral por modo + ícone colorido, cor como acento */}
          <div className="animate-in-up delay-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { href: "/elite/treino/livre",   icon: Zap,    title: "Treino Livre", tag: "Infinito", count: totalScenarios, hint: "cenários · todos os temas",   accent: "#FF5500" },
              { href: "/elite/pratica/temas",  icon: Layers, title: "Por Tema",     tag: "Focado",   count: totalThemes,    hint: "temas · cenários filtrados",   accent: "#3B82F6" },
              { href: "/elite/pratica/skills", icon: Target, title: "Skills",       tag: "Guiado",   count: totalGuided,    hint: "sequências · gráfico real",    accent: "#10B981" },
            ].map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                className="interactive group relative overflow-hidden rounded-xl bg-white/[0.02] hover:bg-white/[0.04] block transition-colors"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity"
                  style={{ backgroundColor: mode.accent, opacity: 0.4 }}
                />
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: mode.accent }}
                />
                <div className="relative z-10 p-4 pl-[18px] flex flex-col gap-2.5 h-full">
                  <div className="flex items-center justify-between">
                    <mode.icon className="w-5 h-5" strokeWidth={1.8} style={{ color: mode.accent }} />
                    <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: mode.accent, opacity: 0.75 }}>{mode.tag}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-bold text-white tracking-tight leading-tight">{mode.title}</h3>
                    <p className="text-[11px] text-white/45 leading-snug mt-1">
                      <span className="font-mono text-white/70">{mode.count}</span> {mode.hint}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="animate-in-up delay-3">
            <UncoveredThemesPanel streakVersion={streakVersion} />
          </div>
        </div>

        {/* Coluna direita — streak panel */}
        <div className="animate-in-up delay-2">
          <StreakPanel streakVersion={streakVersion} />
        </div>
      </div>
    </div>
  );
}
