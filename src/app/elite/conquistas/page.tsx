"use client";

import { useEffect, useState } from "react";
import { Lock, TrendingUp, Brain, Flame, Target, ChevronRight, ArrowUp, Sparkles } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import {
  ACHIEVEMENTS,
  CATEGORY_META,
  RARITY_META,
  groupByCategory,
  type Achievement,
  type Category,
} from "@/lib/achievements";
import { AchievementBadge } from "@/components/elite/AchievementBadge";

/* ────────────────────────────────────────────
   Display order — OG em destaque primeiro, depois trading (manual),
   depois as auto (learning, practice, milestone), por fim community.
   ──────────────────────────────────────────── */

const DISPLAY_ORDER: Category[] = ["og", "trading", "learning", "practice", "milestone", "community"];

/* ────────────────────────────────────────────
   Skill Tree Data
   ──────────────────────────────────────────── */

type SkillNode = {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  unlocked: boolean;
  progress: number; // 0-100
  accent: string;
  requires?: string[];
};

const SKILL_ACCENT = "#C9A461"; // gold — premium progress color

const SKILL_TREE: SkillNode[][] = [
  // Row 0 — Foundation
  [
    { id: "mindset", name: "Mindset", desc: "Mentalidade profissional", icon: Brain, unlocked: true, progress: 100, accent: SKILL_ACCENT },
  ],
  // Row 1 — Core skills
  [
    { id: "leitura", name: "Leitura de Preço", desc: "Candles, TFs, contexto", icon: TrendingUp, unlocked: true, progress: 60, accent: SKILL_ACCENT, requires: ["mindset"] },
    { id: "risco", name: "Gestão de Risco", desc: "1% diário, 2.5% semanal", icon: Target, unlocked: true, progress: 40, accent: SKILL_ACCENT, requires: ["mindset"] },
  ],
  // Row 2 — SMC
  [
    { id: "smc", name: "Smart Money", desc: "OB, FVG, Premium/Discount", icon: Brain, unlocked: true, progress: 20, accent: SKILL_ACCENT, requires: ["leitura"] },
    { id: "liquidez", name: "Liquidez", desc: "BSL, SSL, sweeps", icon: TrendingUp, unlocked: false, progress: 0, accent: SKILL_ACCENT, requires: ["leitura", "risco"] },
  ],
  // Row 3 — Strategy
  [
    { id: "amd", name: "AMD", desc: "Acumulação, Manipulação, Distribuição", icon: Target, unlocked: false, progress: 0, accent: SKILL_ACCENT, requires: ["smc", "liquidez"] },
    { id: "sessoes", name: "Sessões", desc: "Ásia, Londres, NY, Kill Zones", icon: Flame, unlocked: false, progress: 0, accent: SKILL_ACCENT, requires: ["smc"] },
  ],
  // Row 4 — Execution
  [
    { id: "execucao", name: "Execução", desc: "Entrada, saída, mesas prop", icon: TrendingUp, unlocked: false, progress: 0, accent: SKILL_ACCENT, requires: ["amd", "sessoes"] },
  ],
];

/* ────────────────────────────────────────────
   Insights Mock Data (will come from Supabase)
   ──────────────────────────────────────────── */

// INSIGHTS are now computed from real progress data inside InsightsView

/* ────────────────────────────────────────────
   Components
   ──────────────────────────────────────────── */

type ViewTab = "badges" | "tree" | "insights";

/* ── Badge card (unlocked state) — large variant pra OG/legendary, small pra resto ── */
function BadgeCard({ achievement, unlocked, large }: { achievement: Achievement; unlocked: boolean; large?: boolean }) {
  const rarity = RARITY_META[achievement.rarity];
  const size = large ? 140 : 88;
  const isLegendary = achievement.rarity === "legendary";

  const borderClass = unlocked
    ? isLegendary
      ? "border-[#FF5500]/20 hover:border-[#FF5500]/45 hover:shadow-[0_0_60px_rgba(255,85,0,0.18)]"
      : achievement.rarity === "gold"
        ? "border-[#F59E0B]/15 hover:border-[#F59E0B]/35 hover:shadow-[0_0_32px_rgba(245,158,11,0.10)]"
        : "border-white/[0.06] hover:border-white/[0.18]"
    : "border-white/[0.03]";

  const content = (
    <div className={`group relative rounded-2xl border bg-[#111114] transition-all duration-500 overflow-hidden ${borderClass} ${unlocked ? "hover:-translate-y-1" : "opacity-55"}`}>
      {isLegendary && unlocked && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      )}

      {!achievement.autoDistribute && unlocked && (
        <div className="absolute top-3 right-3 z-10 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
          <span className="text-[8px] font-bold text-white/45 uppercase tracking-[0.15em]">Manual</span>
        </div>
      )}

      {/* All cards: centered vertical layout. Large só tem mais padding + badge maior. */}
      <div className={`relative z-10 flex flex-col items-center text-center ${large ? "px-6 pt-8 pb-6" : "px-5 pt-6 pb-5"}`}>
        <div className={`relative transition-transform duration-500 ease-out ${unlocked ? "group-hover:scale-[1.06] group-hover:-translate-y-0.5" : ""}`}>
          <AchievementBadge achievement={achievement} size={size} locked={!unlocked} />
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white/25" />
            </div>
          )}
        </div>

        <div className={`w-full ${large ? "mt-5" : "mt-4"}`}>
          <span className={`block text-[9px] font-bold tracking-[0.22em] uppercase ${unlocked ? rarity.className : "text-white/20"} mb-1.5`}>
            {rarity.label}
          </span>
          <h4 className={`font-bold tracking-tight ${unlocked ? "text-white" : "text-white/20"} ${large ? "text-[18px] mb-1.5" : "text-[13.5px] mb-1"}`}>
            {achievement.label}
          </h4>
          <p className={`leading-relaxed ${unlocked ? "text-white/45" : "text-white/15"} ${large ? "text-[12px]" : "text-[10.5px]"}`}>
            {achievement.detail}
          </p>
        </div>
      </div>
    </div>
  );

  if (unlocked) {
    return <Link href={`/elite/conquistas/${achievement.id}`} className="block">{content}</Link>;
  }
  return content;
}

/* ── Skill Tree ── */

function SkillTreeView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[18px] font-bold text-white/90 mb-1">Árvore de Habilidades</h2>
        <p className="text-[12px] text-white/35">Seu progresso no currículo Elite — do mindset à execução real.</p>
      </div>

      <div className="relative">
        {SKILL_TREE.map((row, rowIdx) => (
          <div key={rowIdx}>
            {/* Connector lines to this row */}
            {rowIdx > 0 && (
              <div className="flex justify-center py-3">
                <svg width="200" height="24" viewBox="0 0 200 24" fill="none" className="text-white/[0.06]">
                  <line x1="50" y1="0" x2="100" y2="24" stroke="currentColor" strokeWidth="2" />
                  <line x1="150" y1="0" x2="100" y2="24" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            )}

            <div className={`flex items-center justify-center gap-4 ${row.length === 1 ? "" : "gap-6"}`}>
              {row.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.id}
                    className={`group relative w-[220px] rounded-xl border p-4 transition-all duration-300 ${
                      node.unlocked
                        ? "border-white/[0.08] bg-gradient-to-b from-[#161619] to-[#111114] hover:border-white/[0.18] hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                        : "border-white/[0.03] bg-[#0c0c0e] opacity-40"
                    }`}
                  >
                    {/* Progress ring */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-10 h-10 shrink-0">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                          {node.progress > 0 && (
                            <circle
                              cx="20" cy="20" r="16" fill="none"
                              stroke={node.accent}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${(node.progress / 100) * 100.5} 100.5`}
                              className="transition-all duration-1000"
                            />
                          )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {node.unlocked ? (
                            <Icon className="w-4 h-4" style={{ color: node.accent }} />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-white/15" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] font-bold leading-tight ${node.unlocked ? "text-white/90" : "text-white/25"}`}>
                          {node.name}
                        </h4>
                        <p className={`text-[10px] leading-tight mt-0.5 ${node.unlocked ? "text-white/35" : "text-white/15"}`}>
                          {node.desc}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${node.progress}%`, backgroundColor: node.accent }}
                      />
                    </div>
                    <p className={`text-[10px] mt-1.5 text-right font-mono ${node.unlocked ? "text-white/30" : "text-white/15"}`}>
                      {node.progress}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Flow direction label */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A461]/50" />
            <span className="text-[10px] text-white/30 font-medium">Base → Leitura → Estratégia → Execução</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Insights ── */

function InsightsView() {
  const { stats, progress } = useProgress();
  const emotionalEmojis = ["", "😰", "😕", "😐", "😊", "🔥"];

  const avgEmotional = stats?.avgEmotional ?? 0;
  const disciplineRate = stats?.disciplineRate ?? 0;
  const totalTrades = stats?.totalTrades ?? 0;
  const winRate = stats?.winRate ?? 0;
  const streak = stats?.streak ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;

  // Last 7 days emotional data from preps
  const lastWeek: number[] = [];
  if (progress) {
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 24 + 3) * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      lastWeek.push(progress.preps[dateKey]?.emotional ?? 0);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[18px] font-bold text-white/90 mb-1">Insights</h2>
        <p className="text-[12px] text-white/35">Padrões do seu operacional e estado emocional ao longo do tempo.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Emotional avg */}
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Estado Emocional</p>
          <div className="flex items-end gap-2">
            <span className="text-[28px] leading-none">{avgEmotional > 0 ? emotionalEmojis[Math.round(avgEmotional)] : "—"}</span>
            <div>
              <p className="text-[16px] font-bold text-white">{avgEmotional > 0 ? avgEmotional.toFixed(1) : "—"}</p>
              {avgEmotional > 0 && (
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400/70">Estável</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discipline */}
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Disciplina</p>
          <p className="text-[28px] font-bold text-white leading-none">{totalTrades > 0 ? `${disciplineRate}%` : "—"}</p>
          <p className="text-[11px] text-white/35 mt-1">seguiu o plano</p>
        </div>

        {/* Win rate */}
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Win Rate</p>
          {totalTrades > 0 ? (
            <>
              <p className="text-[28px] font-bold text-white leading-none">{winRate}%</p>
              <p className="text-[11px] text-white/35 mt-1">{totalTrades} trades</p>
            </>
          ) : (
            <>
              <p className="text-[28px] font-bold text-white/20 leading-none">—</p>
              <p className="text-[11px] text-white/25 mt-1">Nenhum trade registrado</p>
            </>
          )}
        </div>

        {/* Streak */}
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Streak</p>
          <p className="text-[28px] font-bold text-white leading-none">{streak}</p>
          <p className="text-[11px] text-white/35 mt-1">dias · recorde: {bestStreak}</p>
        </div>
      </div>

      {/* Emotional week chart */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6 hover:border-white/[0.12] transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-semibold text-white/60">Emocional da Semana</h3>
          <span className="text-[10px] text-white/25 font-mono">últimos 7 dias</span>
        </div>

        {lastWeek.some(v => v > 0) ? (
          <div className="flex items-end gap-2 h-[120px]">
            {lastWeek.map((val, i) => {
              const height = val > 0 ? (val / 5) * 100 : 5;
              const colors = ["#333", "#EF4444", "#F59E0B", "#6B7280", "#10B981", "#FF5500"];
              const color = val > 0 ? colors[val] : "#333";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        backgroundColor: color + "30",
                        borderTop: `2px solid ${color}60`,
                      }}
                    />
                  </div>
                  <span className="text-[16px]">{val > 0 ? emotionalEmojis[val] : "·"}</span>
                  <span className="text-[9px] text-white/20 font-mono">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <p className="text-[13px] text-white/25">Preencha Prep Sheets pra ver seu gráfico emocional</p>
          </div>
        )}
      </div>

      {/* Patterns & suggestions */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6 hover:border-white/[0.12] transition-all duration-300">
        <h3 className="text-[14px] font-semibold text-white/60 mb-4">Padrões Detectados</h3>

        {totalTrades === 0 ? (
          <div className="flex flex-col items-center py-8">
            <Brain className="w-8 h-8 text-white/[0.08] mb-3" />
            <p className="text-[13px] text-white/30 mb-1">Sem dados suficientes</p>
            <p className="text-[11px] text-white/25 max-w-sm text-center">
              Registre trades no Diário e preencha Prep Sheets pra desbloquear insights personalizados sobre seu operacional.
            </p>
            <Link href="/elite/pratica" className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-[12px] text-brand-500 font-medium hover:bg-brand-500/15 transition-all">
              Ir pra Prática <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {disciplineRate >= 80 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/[0.05] border border-green-500/10">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-[12px] text-white/50">Disciplina alta — você segue o plano {disciplineRate}% das vezes</p>
              </div>
            )}
            {disciplineRate < 50 && totalTrades >= 3 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/[0.05] border border-red-500/10">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-[12px] text-white/50">Atenção: apenas {disciplineRate}% dos trades seguiram o plano. Revise seu Prep Sheet.</p>
              </div>
            )}
            {winRate >= 60 && totalTrades >= 5 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/[0.05] border border-green-500/10">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-[12px] text-white/50">Win rate de {winRate}% — consistência acima da média</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function ConquistasPage() {
  const [view, setView] = useState<ViewTab>("badges");
  const { progress } = useProgress();

  // Unlocks reais vindos do DB + voice streak do bot tracking
  const [unlockedIds, setUnlockedIds] = useState<Set<string> | null>(null);
  const [serverStreak, setServerStreak] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/achievements/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          unlocks: Array<{ achievement_id: string }>;
          voice_streak: number;
        };
        if (cancelled) return;
        setUnlockedIds(new Set(data.unlocks.map((u) => u.achievement_id)));
        setServerStreak(data.voice_streak ?? 0);
      } catch {
        // fail silently — mostra tudo como locked
        if (!cancelled) setUnlockedIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Progresso local (localStorage) — ainda libera auto-distribuídas pra feedback
  // imediato antes de o backend registrar. DB unlocks é o source of truth canônico.
  const lessonsCompleted = progress?.completedLessons ?? [];
  const quizScores = progress?.quizScores ?? {};
  const perfectQuizzes = Object.values(quizScores).filter((s) => s === 100).length;
  const allLessonsDone = lessonsCompleted.length >= 14;
  const trades = progress?.trades ?? [];
  const streak = progress?.streak ?? 0;

  // Auto-grant: quando progresso local cumpre milestone e DB ainda não registrou,
  // dispara POST /api/achievements/auto-grant. API valida tudo server-side
  // (RPC só aceita auto_distribute=true). Idempotente: chamar 2x retorna already_unlocked.
  useEffect(() => {
    if (!unlockedIds) return; // ainda carregando DB state
    if (!progress) return;     // sem progress local

    function qualifies(id: string): boolean {
      switch (id) {
        case "first-lesson":  return lessonsCompleted.length >= 1;
        case "module-base":   return lessonsCompleted.length >= 3;
        case "module-smc":    return lessonsCompleted.length >= 7;
        case "all-lessons":   return allLessonsDone;
        case "first-quiz-a":  return perfectQuizzes >= 1;
        case "quiz-master":   return perfectQuizzes >= 10;
        case "trinity":       return perfectQuizzes >= 3;
        // Streaks usam DADO SERVER (voice tracking do bot), não localStorage.
        // Anti-fraude: user não consegue inflar via dev-tools.
        case "streak-7":      return serverStreak >= 7;
        case "streak-30":     return serverStreak >= 30;
        case "streak-100":    return serverStreak >= 100;
        case "trades-100":    return trades.length >= 100;
        default:              return false;
      }
    }

    const autoIds = Object.values(ACHIEVEMENTS).filter((a) => a.autoDistribute).map((a) => a.id);
    const toGrant = autoIds.filter((id) => qualifies(id) && !unlockedIds.has(id));
    if (toGrant.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const id of toGrant) {
        try {
          const res = await fetch("/api/achievements/auto-grant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ achievement_id: id }),
          });
          if (!res.ok || cancelled) continue;
          const data = (await res.json()) as { status?: string };
          if (data.status === "granted" || data.status === "restored") {
            setUnlockedIds((prev) => (prev ? new Set([...prev, id]) : new Set([id])));
          }
        } catch {
          /* silencioso — tenta de novo no próximo render */
        }
      }
    })();
    return () => { cancelled = true; };
  }, [unlockedIds, lessonsCompleted.length, perfectQuizzes, allLessonsDone, trades.length, streak, serverStreak, progress]);

  function isUnlocked(ach: Achievement): boolean {
    // Fonte canônica: unlocks do banco (admin grant, trigger, self)
    if (unlockedIds?.has(ach.id)) return true;
    // Fallback local pra auto-distribuídas enquanto carrega
    if (unlockedIds === null && ach.autoDistribute) {
      switch (ach.id) {
        case "first-lesson":   return lessonsCompleted.length >= 1;
        case "module-base":    return lessonsCompleted.length >= 3;
        case "module-smc":     return lessonsCompleted.length >= 7;
        case "all-lessons":    return allLessonsDone;
        case "first-quiz-a":   return perfectQuizzes >= 1;
        case "quiz-master":    return perfectQuizzes >= 10;
        case "trinity":        return perfectQuizzes >= 3;
        case "streak-7":       return streak >= 7;
        case "streak-30":      return streak >= 30;
        case "streak-100":     return streak >= 100;
        case "trades-100":     return trades.length >= 100;
      }
    }
    return false;
  }

  const grouped = groupByCategory();
  const allIds = Object.values(ACHIEVEMENTS);
  const unlockedCount = allIds.filter((a) => isUnlocked(a)).length;
  const legendaryUnlocked = allIds.filter((a) => isUnlocked(a) && a.rarity === "legendary").length;

  return (
    <div className="space-y-5">
      {/* Header + stats + tabs */}
      <div className="flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-5">
          <div>
            <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">Suas Conquistas</h1>
            <p className="text-[12px] text-white/40 mt-0.5">Badges · Skill Tree · Insights</p>
          </div>
          <div className="h-10 w-px bg-white/[0.06]" />
          <div className="flex items-center gap-5">
            <div>
              <p className="text-[22px] font-bold text-white leading-none font-mono">{unlockedCount}<span className="text-white/30">/{allIds.length}</span></p>
              <p className="text-[10px] text-white/35 mt-1 uppercase tracking-wider">badges</p>
            </div>
            <div className="h-8 w-px bg-white/[0.06]" />
            <div>
              <p className="text-[22px] font-bold text-[#FF5500]/90 leading-none font-mono">{legendaryUnlocked}</p>
              <p className="text-[10px] text-[#FF5500]/50 mt-1 uppercase tracking-wider">lendárias</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {([
            { id: "badges" as ViewTab,   label: "Badges",     icon: Target },
            { id: "tree" as ViewTab,     label: "Skill Tree", icon: TrendingUp },
            { id: "insights" as ViewTab, label: "Insights",   icon: Brain },
          ]).map((tab) => {
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
                  active
                    ? "border-white/[0.20] bg-white/[0.05] text-white"
                    : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12]"
                }`}>
                <tab.icon className={`w-3.5 h-3.5 ${active ? "text-brand-500" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rarity legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02]">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Raridade</span>
        {(["bronze", "silver", "gold", "legendary"] as const).map((r) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full`} style={{
              backgroundColor: r === "bronze" ? "#C4833F" : r === "silver" ? "#CBD5E1" : r === "gold" ? "#F59E0B" : "#FF5500",
              boxShadow: r === "legendary" ? "0 0 8px #FF5500aa" : r === "gold" ? "0 0 6px #F59E0B80" : "none",
            }} />
            <span className={`text-[11px] font-medium ${RARITY_META[r].className}`}>{RARITY_META[r].label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-white/30" />
          <span className="text-[10px] text-white/35">Badges manuais são validadas pelo URA</span>
        </div>
      </div>

      {/* Tab Content */}
      {view === "badges" && (
        <div className="space-y-10">
          {DISPLAY_ORDER.map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            const meta = CATEGORY_META[category];
            const isOG = category === "og";
            const isTrading = category === "trading";
            const useLarge = isOG;

            return (
              <section key={category}>
                <div className="mb-5 flex items-baseline gap-3 flex-wrap">
                  <h2 className="text-[18px] font-bold text-white/90">{meta.label}</h2>
                  <span className="text-[12px] text-white/35">{meta.sub}</span>
                  {(isOG || isTrading) && (
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30 px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.02]">
                      Manual
                    </span>
                  )}
                </div>

                <div className={
                  useLarge
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                }>
                  {items.map((a) => (
                    <BadgeCard key={a.id} achievement={a} unlocked={isUnlocked(a)} large={useLarge} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === "tree" && <SkillTreeView />}
      {view === "insights" && <InsightsView />}
    </div>
  );
}
