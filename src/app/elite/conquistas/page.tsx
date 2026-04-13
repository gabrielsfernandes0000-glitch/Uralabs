"use client";

import { useState } from "react";
import { Lock, TrendingUp, Brain, Flame, Target, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";

/* ────────────────────────────────────────────
   Types & Data
   ──────────────────────────────────────────── */

type Rarity = "legendary" | "rare" | "uncommon" | "common";

type Badge = {
  id: string;
  name: string;
  desc: string;
  image: string;
  unlocked: boolean;
  hasPlaque?: boolean;
  rarity: Rarity;
};

const BADGES = {
  og: [
    { id: "elite-member", name: "Elite Member", desc: "Entrou na mentoria Elite", image: "/badges/badge-elite-member.png", unlocked: true, hasPlaque: true, rarity: "legendary" as Rarity },
    { id: "og-10", name: "OG 1.0", desc: "Fundador turma 1.0", image: "/badges/badge-og-10.png", unlocked: true, hasPlaque: true, rarity: "legendary" as Rarity },
    { id: "og-20", name: "OG 2.0", desc: "Membro turma 2.0", image: "/badges/badge-og-20.png", unlocked: true, hasPlaque: true, rarity: "legendary" as Rarity },
    { id: "og-30", name: "OG 3.0", desc: "Membro turma 3.0", image: "/badges/badge-og-30.png", unlocked: true, hasPlaque: true, rarity: "legendary" as Rarity },
  ],
  trading: [
    { id: "first-payout", name: "First Payout", desc: "Primeiro saque de mesa funded", image: "/badges/badge-first-payout.png", unlocked: true, hasPlaque: true, rarity: "rare" as Rarity },
    { id: "mesa-approved", name: "Mesa Aprovada", desc: "Aprovado em prop firm", image: "/badges/badge-mesa-approved.png", unlocked: true, rarity: "rare" as Rarity },
    { id: "verde-7", name: "7 No Verde", desc: "7 dias consecutivos no verde", image: "/badges/badge-verde-7.png", unlocked: true, rarity: "uncommon" as Rarity },
  ],
  academic: [
    { id: "first-lesson", name: "Primeira Aula", desc: "Completou a primeira aula", image: "/badges/badge-primeira-aula.png", unlocked: true, rarity: "common" as Rarity },
    { id: "module-complete", name: "Módulo Completo", desc: "Completou um módulo inteiro", image: "/badges/badge-modulo-completo.png", unlocked: true, rarity: "uncommon" as Rarity },
    { id: "quiz-master", name: "Quiz Master", desc: "Gabaritou um quiz", image: "/badges/badge-quiz-master.png", unlocked: true, rarity: "uncommon" as Rarity },
    { id: "all-lessons", name: "Estudante Dedicado", desc: "Todas as aulas completas", image: "/badges/badge-estudante-dedicado.png", unlocked: true, rarity: "rare" as Rarity },
  ],
  community: [
    { id: "presenca-ferro", name: "Presença de Ferro", desc: "90%+ presença nas calls", image: "/badges/badge-presenca-ferro.png", unlocked: true, rarity: "uncommon" as Rarity },
    { id: "professor", name: "Professor", desc: "Ajudou 5+ membros", image: "/badges/badge-professor.png", unlocked: true, rarity: "rare" as Rarity },
    { id: "check-in-30", name: "Check-in Master", desc: "30 check-ins consecutivos", image: "/badges/badge-checkin-master.png", unlocked: true, rarity: "rare" as Rarity },
  ],
};

const RARITY = {
  legendary: { label: "Lendária", color: "text-yellow-400", dot: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]", border: "border-yellow-500/25", hoverBorder: "hover:border-yellow-500/50", glow: "shadow-[0_0_40px_rgba(250,204,21,0.08)]", hoverGlow: "hover:shadow-[0_0_60px_rgba(250,204,21,0.18)]" },
  rare: { label: "Rara", color: "text-blue-400", dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]", border: "border-blue-500/15", hoverBorder: "hover:border-blue-500/35", glow: "", hoverGlow: "hover:shadow-[0_0_30px_rgba(96,165,250,0.1)]" },
  uncommon: { label: "Incomum", color: "text-emerald-400", dot: "bg-emerald-400/70", border: "border-white/[0.05]", hoverBorder: "hover:border-emerald-500/25", glow: "", hoverGlow: "" },
  common: { label: "Comum", color: "text-white/40", dot: "bg-white/25", border: "border-white/[0.04]", hoverBorder: "hover:border-white/[0.1]", glow: "", hoverGlow: "" },
};

const SECTIONS = [
  { key: "og" as const, title: "Edição Limitada", sub: "Exclusivas por turma — nunca mais emitidas", legendary: true },
  { key: "trading" as const, title: "Trading", sub: "Resultados reais no mercado" },
  { key: "academic" as const, title: "Acadêmicas", sub: "Progresso nas aulas" },
  { key: "community" as const, title: "Comunidade", sub: "Engajamento e presença" },
];

/* ────────────────────────────────────────────
   Skill Tree Data
   ──────────────────────────────────────────── */

type SkillNode = {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
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

function BadgeCard({ badge, large }: { badge: Badge; large?: boolean }) {
  const r = RARITY[badge.rarity];
  const imgSize = large ? 200 : 150;

  const content = (
    <div className={`group relative rounded-2xl border bg-[#111114] transition-all duration-500 overflow-hidden ${
      badge.unlocked
        ? `${r.border} ${r.hoverBorder} ${r.glow} ${r.hoverGlow} hover:-translate-y-1.5`
        : "border-white/[0.03]"
    }`}>
      {badge.rarity === "legendary" && badge.unlocked && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent animate-pulse" />
      )}

      {badge.hasPlaque && badge.unlocked && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/15">
          <span className="text-[8px] font-bold text-yellow-500/60 uppercase tracking-wider">Plaquinha</span>
        </div>
      )}

      <div className={`relative z-10 flex ${large ? "flex-row items-center gap-8 p-7" : "flex-col items-center p-5 pt-7"}`}>
        <div className={`relative shrink-0 transition-transform duration-700 ease-out ${badge.unlocked ? "group-hover:scale-[1.08]" : ""}`}>
          {badge.unlocked ? (
            <Image src={badge.image} alt={badge.name} width={imgSize} height={imgSize} className="object-contain" style={{ width: imgSize, height: imgSize }} />
          ) : (
            <div className="relative" style={{ width: imgSize, height: imgSize }}>
              <Image src={badge.image} alt={badge.name} width={imgSize} height={imgSize} className="object-contain opacity-[0.04] grayscale" style={{ width: imgSize, height: imgSize }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white/[0.08]" />
              </div>
            </div>
          )}
        </div>

        <div className={large ? "flex-1" : "text-center mt-4"}>
          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${badge.unlocked ? r.color : "text-white/20"} block ${large ? "mb-1.5" : "mb-1"}`}>
            {r.label}
          </span>
          <h4 className={`font-bold tracking-tight ${badge.unlocked ? "text-white" : "text-white/[0.08]"} ${large ? "text-[22px] mb-2" : "text-[14px] mb-1"}`}>
            {badge.name}
          </h4>
          <p className={`leading-relaxed ${badge.unlocked ? "text-white/50" : "text-white/[0.05]"} ${large ? "text-[13px]" : "text-[11px]"}`}>
            {badge.desc}
          </p>
          {badge.unlocked && large && (
            <span className="inline-block mt-4 text-[11px] text-white/30 group-hover:text-white/50 transition-colors">
              Ver detalhes →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (badge.unlocked) {
    return <Link href={`/elite/conquistas/${badge.id}`} className="block">{content}</Link>;
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

  // Compute dynamic unlock state based on real progress
  const lessonsCompleted = progress?.completedLessons ?? [];
  const quizScores = progress?.quizScores ?? {};
  const hasPerfectQuiz = Object.values(quizScores).some((s) => s === 100);
  const hasAnyModule = lessonsCompleted.length >= 3; // rough: 3 lessons = 1 module
  const allLessonsDone = lessonsCompleted.length >= 14;
  const trades = progress?.trades ?? [];
  const streak = progress?.streak ?? 0;

  // Override unlock state for non-OG badges
  function isUnlocked(badgeId: string): boolean {
    // OG/limited badges are always shown as unlocked (they're edition badges)
    if (["elite-member", "og-10", "og-20", "og-30"].includes(badgeId)) return true;
    // Trading badges — not unlockable from platform alone
    if (["first-payout", "mesa-approved"].includes(badgeId)) return false;
    if (badgeId === "verde-7") return streak >= 7;
    // Academic
    if (badgeId === "first-lesson") return lessonsCompleted.length >= 1;
    if (badgeId === "module-complete") return hasAnyModule;
    if (badgeId === "quiz-master") return hasPerfectQuiz;
    if (badgeId === "all-lessons") return allLessonsDone;
    // Community
    if (badgeId === "presenca-ferro") return false; // needs call tracking
    if (badgeId === "professor") return false; // needs peer review count
    if (badgeId === "check-in-30") return streak >= 30;
    return false;
  }

  // Build badges with dynamic unlock
  const dynamicBadges = Object.fromEntries(
    Object.entries(BADGES).map(([key, badges]) => [
      key,
      badges.map((b) => ({ ...b, unlocked: isUnlocked(b.id) })),
    ])
  ) as typeof BADGES;

  const allBadges = Object.values(dynamicBadges).flat();
  const unlocked = allBadges.filter((b) => b.unlocked).length;
  const plaques = allBadges.filter((b) => b.unlocked && b.hasPlaque).length;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111114] border border-white/[0.06]">
        <div className="absolute top-[-50%] left-[20%] w-[600px] h-[400px] bg-yellow-500/[0.04] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[10%] w-[400px] h-[300px] bg-brand-500/[0.04] blur-[120px] pointer-events-none" />

        <div className="relative z-10 p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-6">
            <div>
              <h1 className="text-[32px] lg:text-[40px] font-bold text-white tracking-tight leading-none">
                Suas Conquistas
              </h1>
              <p className="text-[14px] text-white/40 mt-3 max-w-md">
                Cada badge conta uma história. As mais raras brilham — literalmente.
              </p>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-[36px] lg:text-[42px] font-bold text-white leading-none tracking-tight">{unlocked}</p>
                <p className="text-[12px] text-white/30 mt-1">de {allBadges.length} badges</p>
              </div>
              <div className="w-px h-14 bg-white/[0.06]" />
              <div>
                <p className="text-[36px] lg:text-[42px] font-bold text-yellow-400/80 leading-none tracking-tight">{plaques}</p>
                <p className="text-[12px] text-yellow-500/35 mt-1">plaquinhas físicas</p>
              </div>
            </div>
          </div>

          {/* Rarity legend */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-6 border-t border-white/[0.04]">
            {(["legendary", "rare", "uncommon", "common"] as Rarity[]).map((r) => (
              <div key={r} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${RARITY[r].dot}`} />
                <span className={`text-[11px] font-medium ${RARITY[r].color}`}>{RARITY[r].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── View Tabs ── */}
      <div className="flex gap-2">
        {([
          { id: "badges" as ViewTab, label: "Badges", icon: Target },
          { id: "tree" as ViewTab, label: "Skill Tree", icon: TrendingUp },
          { id: "insights" as ViewTab, label: "Insights", icon: Brain },
        ]).map((tab) => {
          const active = view === tab.id;
          return (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl border text-[14px] font-semibold transition-all ${
                active
                  ? "border-white/[0.20] bg-white/[0.05] text-white"
                  : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12] hover:bg-white/[0.02]"
              }`}>
              <tab.icon className={`w-4 h-4 ${active ? "text-brand-500" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {view === "badges" && (
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            const badges = dynamicBadges[section.key];
            const isLegendary = "legendary" in section && section.legendary;

            return (
              <div key={section.key}>
                <div className="mb-5">
                  <h2 className="text-[18px] font-bold text-white/90">{section.title}</h2>
                  <p className="text-[12px] text-white/30 mt-0.5">{section.sub}</p>
                </div>

                <div className={
                  isLegendary
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                }>
                  {badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} large={isLegendary} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "tree" && <SkillTreeView />}
      {view === "insights" && <InsightsView />}
    </div>
  );
}
