"use client";

import { useEffect, useState } from "react";
import { Lock, TrendingUp, Brain, Target, ChevronRight, ArrowUp, ArrowRight, Sparkles, X, Check, Trophy } from "lucide-react";
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
import { CURRICULUM } from "@/lib/curriculum";

/* ────────────────────────────────────────────
   Unlock hints — texto humano de como conquistar
   cada badge. Um por ID, manual ou automático.
   ──────────────────────────────────────────── */
const UNLOCK_HINTS: Record<string, string> = {
  /* Learning — auto */
  "first-lesson":  "Complete a primeira aula em Aulas.",
  "module-base":   "Conclua as 3 aulas do módulo Base (Intro, Candles, Risco).",
  "module-smc":    "Conclua as 4 aulas do módulo Leitura SMC (OBs, FVG, Premium/Discount, Liquidez).",
  "all-lessons":   "Termine todas as 14 aulas do currículo Elite.",
  /* Practice — auto */
  "first-quiz-a":  "Tire 100% em qualquer quiz de aula.",
  "quiz-master":   "Tire 100% em 10 quizzes diferentes.",
  "trinity":       "Tire 100% em 3 quizzes no mesmo módulo.",
  /* Milestones — auto (voz+mensagens tracked pelo bot) */
  "streak-7":      "Mantenha streak de voz + mensagens no Discord por 7 dias.",
  "streak-30":     "Mantenha streak de voz + mensagens no Discord por 30 dias.",
  "streak-100":    "Mantenha streak de voz + mensagens no Discord por 100 dias.",
  "trades-100":    "Registre 100 trades no Diário (aba Prática).",
  /* Trading — manual (URA valida com print) */
  "mesa-fp":       "Aprovação no Challenge 2-phase da FundingPips. Mande o print pro URA no Discord pra validar.",
  "mesa-ts":       "Aprovação no Trader Combine da TopStep. Mande o print pro URA no Discord pra validar.",
  "mesa-5ers":     "Aprovação no Hyper Growth da The 5%ers. Mande o print pro URA no Discord pra validar.",
  "payout-1":      "Receber seu primeiro saque aprovado de qualquer mesa prop. Mande o comprovante pro URA validar.",
  "payout-10k":    "Acumular US$ 10.000 em payouts somados. URA valida o total conforme você envia comprovantes.",
  /* Community — manual */
  "peer-reviewer": "Dê 10+ reviews em trades/análises de colegas no Mural. URA reconhece após o 10º.",
  "mentor":        "Ajude múltiplos membros na jornada — posts, DMs, chamadas. URA libera quando reconhece o impacto.",
  /* OG — edição limitada */
  "og-elite":      "Entrar na mentoria Elite. Libera automaticamente quando seu cargo Elite é atribuído.",
  "og-1":          "Exclusiva da turma fundadora Elite 1.0 — não é mais emitida.",
  "og-2":          "Exclusiva da turma Elite 2.0 — não é mais emitida.",
  "og-3":          "Exclusiva da turma Elite 3.0 — não é mais emitida.",
  "og-4":          "Exclusiva da turma atual Elite 4.0 — liberada ao ingressar na turma.",
};
function unlockHint(a: Achievement): string {
  return UNLOCK_HINTS[a.id]
    ?? (a.autoDistribute
      ? "Continue progredindo no currículo — essa libera automaticamente."
      : "Validação manual pelo URA. Cumpra o marco e mande comprovante no Discord.");
}

/* ────────────────────────────────────────────
   Display order — OG em destaque primeiro, depois trading (manual),
   depois as auto (learning, practice, milestone), por fim community.
   ──────────────────────────────────────────── */

const DISPLAY_ORDER: Category[] = ["og", "trading", "learning", "practice", "milestone", "community"];

/* ────────────────────────────────────────────
   Skill Tree — mapa do currículo real (5 módulos, 14 aulas)
   Progresso e unlock vêm do completedLessons. Módulo N destravado
   quando N-1 está 100% concluído. Nodes clicáveis abrem o módulo
   em /elite/aulas#module-{id}.
   ──────────────────────────────────────────── */

interface ModuleSkill {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  accentHex: string;
  lessons: { id: string; title: string }[];
  completed: number;
  total: number;
  progress: number; // 0-100
  unlocked: boolean;
}

function buildModuleSkills(completedLessons: string[]): ModuleSkill[] {
  const done = new Set(completedLessons);
  let prevComplete = true; // primeiro módulo sempre destravado
  return CURRICULUM.map((mod) => {
    const total = mod.lessons.length;
    const completed = mod.lessons.filter((l) => done.has(l.id)).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    const unlocked = prevComplete;
    // módulo "lives" (Operação, 0 aulas) nunca destrava por quiz — sempre acessível como aviso.
    const moduleComplete = total === 0 ? false : completed === total;
    prevComplete = moduleComplete;
    return {
      id: mod.id,
      number: mod.number,
      title: mod.title,
      subtitle: mod.subtitle,
      accentHex: mod.accentHex,
      lessons: mod.lessons.map((l) => ({ id: l.id, title: l.title })),
      completed,
      total,
      progress,
      unlocked,
    };
  });
}

/* ────────────────────────────────────────────
   Insights Mock Data (will come from Supabase)
   ──────────────────────────────────────────── */

// INSIGHTS are now computed from real progress data inside InsightsView

/* ────────────────────────────────────────────
   Components
   ──────────────────────────────────────────── */

type ViewTab = "badges" | "timeline" | "tree" | "insights";

/** Unlock cru vindo do backend — achievement_id + quando/como/quanto ganhou */
interface UnlockMeta {
  achievement_id: string;
  unlocked_at: string;
  coins_granted: number;
  source: "admin" | "system" | "self";
}

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/* ── Badge card — clicável em qualquer estado. Locked mostra badge ofuscado
     (opacidade ~75% + grayscale 45%) em vez de invisível, com lock discreto
     no canto. Click abre modal de detalhe com hint de como conquistar. ── */
function BadgeCard({
  achievement,
  unlocked,
  large,
  onOpen,
}: {
  achievement: Achievement;
  unlocked: boolean;
  large?: boolean;
  onOpen: (a: Achievement) => void;
}) {
  const rarity = RARITY_META[achievement.rarity];
  const size = large ? 140 : 88;
  const isLegendary = achievement.rarity === "legendary";

  const borderClass = unlocked
    ? isLegendary
      ? "border-[#FF5500]/20 hover:border-[#FF5500]/45 hover:shadow-[0_0_60px_rgba(255,85,0,0.18)]"
      : achievement.rarity === "gold"
        ? "border-[#F59E0B]/15 hover:border-[#F59E0B]/35 hover:shadow-[0_0_32px_rgba(245,158,11,0.10)]"
        : "border-white/[0.06] hover:border-white/[0.18]"
    : "border-dashed border-white/[0.07] hover:border-white/[0.15]";

  return (
    <button
      type="button"
      onClick={() => onOpen(achievement)}
      className={`group relative w-full text-left rounded-2xl border bg-[#111114] transition-all duration-500 overflow-hidden cursor-pointer ${borderClass} hover:-translate-y-1`}
    >
      {isLegendary && unlocked && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      )}

      {/* Manual flag — mostra em qualquer estado */}
      {!achievement.autoDistribute && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">· Manual</span>
        </div>
      )}

      {/* Lock discreto no canto quando locked */}
      {!unlocked && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Lock className="w-3 h-3 text-white/30" />
        </div>
      )}

      <div className={`relative z-10 flex flex-col items-center text-center ${large ? "px-6 pt-8 pb-6" : "px-5 pt-6 pb-5"}`}>
        <div className={`relative transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:-translate-y-0.5`}>
          <div
            style={!unlocked ? { filter: "grayscale(0.55) brightness(0.7) contrast(0.85)", opacity: 0.75 } : undefined}
            className="transition-[filter,opacity] duration-300 group-hover:!opacity-90"
          >
            <AchievementBadge achievement={achievement} size={size} locked={!unlocked} />
          </div>
        </div>

        <div className={`w-full ${large ? "mt-5" : "mt-4"}`}>
          <span className={`block text-[9px] font-bold tracking-[0.22em] uppercase ${unlocked ? rarity.className : "text-white/35"} mb-1.5`}>
            {rarity.label}
          </span>
          <h4 className={`font-bold tracking-tight ${unlocked ? "text-white" : "text-white/55"} ${large ? "text-[18px] mb-1.5" : "text-[13.5px] mb-1"}`}>
            {achievement.label}
          </h4>
          <p className={`leading-relaxed ${unlocked ? "text-white/45" : "text-white/30"} ${large ? "text-[12px]" : "text-[10.5px]"}`}>
            {achievement.detail}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ── Modal de detalhe — abre ao clicar em qualquer badge (incl. locked).
     Mostra badge em destaque + hint de como conseguir se ainda não liberado. ── */
function AchievementModal({
  achievement,
  unlocked,
  unlockedAt,
  onClose,
}: {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const rarity = RARITY_META[achievement.rarity];
  const category = CATEGORY_META[achievement.category];
  const hint = unlockHint(achievement);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#141417] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge em destaque */}
        <div className="relative flex justify-center pt-10 pb-6">
          <div
            style={!unlocked ? { filter: "grayscale(0.35) brightness(0.85)", opacity: 0.85 } : undefined}
            className="transition-[filter,opacity] duration-300"
          >
            <AchievementBadge achievement={achievement} size={160} locked={!unlocked} />
          </div>
        </div>

        {/* Metadata */}
        <div className="px-7 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-[9px] font-bold tracking-[0.22em] uppercase ${rarity.className}`}>
              {rarity.label}
            </span>
            <span className="text-white/15">·</span>
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/40">
              {category.label}
            </span>
          </div>
          <h3 className="text-[22px] font-bold text-white tracking-tight mb-2">{achievement.label}</h3>
          <p className="text-[13px] text-white/50 leading-relaxed">{achievement.detail}</p>
        </div>

        {/* Status + hint */}
        <div className="mx-5 mb-5 rounded-xl border border-white/[0.05] bg-white/[0.015] p-5">
          {unlocked ? (
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" strokeWidth={1.8} />
              <div>
                <p className="text-[12px] font-bold text-green-400 uppercase tracking-wider mb-1">Desbloqueada</p>
                <p className="text-[12px] text-white/50 leading-relaxed">
                  {unlockedAt ? `Conquistada em ${formatFullDate(unlockedAt)}.` : "Você já tem essa conquista."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white/50" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white/60 uppercase tracking-wider mb-1">Como desbloquear</p>
                <p className="text-[12px] text-white/55 leading-relaxed">{hint}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Timeline — linha cronológica de conquistas desbloqueadas ── */

function TimelineView({ unlocks }: { unlocks: UnlockMeta[] }) {
  const sorted = [...unlocks].sort(
    (a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Trophy className="w-6 h-6 text-white/20" />
        </div>
        <h3 className="text-[15px] font-bold text-white/70 mb-2">Ainda sem conquistas</h3>
        <p className="text-[12px] text-white/35 max-w-sm">
          Complete aulas, mantenha streak e participe de calls. Cada conquista desbloqueada aparece aqui com data e recompensa.
        </p>
      </div>
    );
  }

  const sourceLabel: Record<UnlockMeta["source"], string> = {
    admin:  "Liberada pelo URA",
    system: "Automática",
    self:   "Auto-concedida",
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-white/90 mb-1">Timeline</h2>
        <p className="text-[12px] text-white/35">Suas conquistas em ordem cronológica · {sorted.length} no total</p>
      </div>

      <div className="relative">
        {/* Linha vertical conectando os eventos */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />

        <ol className="space-y-3">
          {sorted.map((u) => {
            const ach = ACHIEVEMENTS[u.achievement_id];
            if (!ach) return null;
            const rarity = RARITY_META[ach.rarity];
            return (
              <li key={u.achievement_id} className="relative flex items-start gap-4 group">
                {/* Dot na linha + badge thumbnail */}
                <div className="relative z-10 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#141417] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                    <AchievementBadge achievement={ach} size={32} />
                  </div>
                </div>

                {/* Card do evento */}
                <div className="flex-1 min-w-0 rounded-xl border border-white/[0.06] bg-gradient-to-r from-[#141417] to-[#111114] px-4 py-3 transition-colors duration-200 group-hover:border-white/[0.12]">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13.5px] font-bold text-white/90 leading-tight">{ach.label}</span>
                        <span className={`text-[9px] font-bold tracking-[0.18em] uppercase ${rarity.className}`}>
                          {rarity.label}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-white/45 mt-0.5 truncate">{ach.detail}</p>
                    </div>
                    {u.coins_granted > 0 && (
                      <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-bold tabular-nums text-amber-300">
                        +{u.coins_granted.toLocaleString("pt-BR")}
                        <span className="text-[9px] text-amber-300/60 uppercase tracking-wider font-normal">coin</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-white/30">
                    <time>{formatFullDate(u.unlocked_at)}</time>
                    <span>·</span>
                    <span>{sourceLabel[u.source]}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ── Skill Tree ── */

function SkillTreeView({ completedLessons }: { completedLessons: string[] }) {
  const modules = buildModuleSkills(completedLessons);
  const totalLessons = modules.reduce((s, m) => s + m.total, 0);
  const doneLessons = modules.reduce((s, m) => s + m.completed, 0);
  const currentIdx = modules.findIndex((m) => m.unlocked && m.progress < 100 && m.total > 0);
  const allDone = modules.every((m) => m.total === 0 || m.progress === 100);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold text-white/90 mb-1">Mapa do Currículo</h2>
          <p className="text-[12px] text-white/45 leading-relaxed max-w-xl">
            As 14 aulas do Elite 4.0 em 5 módulos sequenciais. Cada módulo destrava o próximo quando 100% completo.
            Clique pra abrir a aula.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[22px] font-bold text-white leading-none font-mono tabular-nums">
              {doneLessons}<span className="text-white/25">/{totalLessons}</span>
            </p>
            <p className="text-[10px] text-white/35 mt-1 uppercase tracking-wider">aulas</p>
          </div>
          {currentIdx !== -1 && !allDone && (
            <div className="pl-4 border-l border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Módulo atual</p>
              <p className="text-[13px] font-bold text-white/80">{modules[currentIdx].number}. {modules[currentIdx].title}</p>
            </div>
          )}
        </div>
      </div>

      <ol className="relative space-y-3">
        {/* linha conectora vertical à esquerda */}
        <div className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.05] to-transparent pointer-events-none" aria-hidden />

        {modules.map((mod, idx) => {
          const isCurrent = idx === currentIdx;
          const isComplete = mod.total > 0 && mod.progress === 100;
          const hasLessons = mod.total > 0;

          const clickable = mod.unlocked && hasLessons;
          const wrapperClass = `group relative block rounded-xl border overflow-hidden transition-all duration-300 ${
            mod.unlocked
              ? "border-white/[0.07] bg-[#111114] hover:border-white/[0.18] hover:-translate-y-0.5"
              : "border-white/[0.04] bg-[#0b0b0e] opacity-55"
          } ${clickable ? "cursor-pointer" : ""}`;

          const inner = (<>
                {/* Faixa accent à esquerda no módulo atual */}
                {isCurrent && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ backgroundColor: mod.accentHex }}
                    aria-hidden
                  />
                )}

                <div className="flex items-center gap-4 p-4 pl-5">
                  {/* Progress ring com número do módulo */}
                  <div className="relative w-[44px] h-[44px] shrink-0">
                    <svg className="w-[44px] h-[44px] -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                      {mod.progress > 0 && (
                        <circle
                          cx="22" cy="22" r="18" fill="none"
                          stroke={mod.accentHex}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${(mod.progress / 100) * 113.1} 113.1`}
                          className="transition-all duration-700"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {!mod.unlocked ? (
                        <Lock className="w-4 h-4 text-white/25" />
                      ) : isComplete ? (
                        <Check className="w-4 h-4" style={{ color: mod.accentHex }} strokeWidth={2.5} />
                      ) : (
                        <span className="text-[12px] font-bold font-mono tabular-nums" style={{ color: mod.accentHex }}>
                          {mod.number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título + aulas */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2.5 flex-wrap mb-0.5">
                      <h3 className={`text-[14px] font-bold tracking-tight ${mod.unlocked ? "text-white/90" : "text-white/40"}`}>
                        {mod.title}
                      </h3>
                      <span className={`text-[10.5px] uppercase tracking-[0.15em] font-medium ${mod.unlocked ? "text-white/30" : "text-white/20"}`}>
                        {mod.subtitle}
                      </span>
                    </div>

                    {/* Lista de aulas inline com check/lock */}
                    {hasLessons ? (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        {mod.lessons.map((l) => {
                          const done = completedLessons.includes(l.id);
                          return (
                            <span
                              key={l.id}
                              className={`inline-flex items-center gap-1 text-[11px] ${
                                done ? "text-white/55" : mod.unlocked ? "text-white/30" : "text-white/20"
                              }`}
                            >
                              {done ? (
                                <Check className="w-2.5 h-2.5 shrink-0" style={{ color: mod.accentHex }} strokeWidth={3} />
                              ) : (
                                <span className="w-[5px] h-[5px] rounded-full bg-white/15 shrink-0" />
                              )}
                              <span className="truncate">{l.title}</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/30 mt-1 italic">
                        Conteúdo ao vivo — sem aulas gravadas. Participa pelas calls.
                      </p>
                    )}
                  </div>

                  {/* Status + chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className={`text-[13px] font-bold font-mono tabular-nums ${mod.unlocked ? "text-white/80" : "text-white/30"}`}>
                        {hasLessons ? `${mod.completed}/${mod.total}` : "—"}
                      </p>
                      <p className="text-[9.5px] uppercase tracking-wider mt-0.5" style={{ color: mod.unlocked ? `${mod.accentHex}cc` : "rgba(255,255,255,0.2)" }}>
                        {!mod.unlocked ? "Bloqueado" : isComplete ? "Completo" : isCurrent ? "Em curso" : hasLessons ? "A fazer" : "Ao vivo"}
                      </p>
                    </div>
                    {mod.unlocked && hasLessons && (
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>
          </>);

          return (
            <li key={mod.id} className="relative">
              {clickable ? (
                <Link href={`/elite/aulas#module-${mod.id}`} className={wrapperClass}>{inner}</Link>
              ) : (
                <div className={wrapperClass}>{inner}</div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Legenda de como funciona */}
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-bold mb-2">Como funciona</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] text-white/50">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-white/60">1</span>
            </span>
            <span>Assista a aula e marque como concluída.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-white/60">2</span>
            </span>
            <span>Complete todas as aulas do módulo pra destravar o próximo.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-white/60">3</span>
            </span>
            <span>Badges de conclusão aparecem automaticamente na aba Badges.</span>
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
            <Link href="/elite/pratica" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500/40 text-[12px] text-brand-500 font-medium hover:bg-brand-500/[0.04] transition-colors">
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
  const [selected, setSelected] = useState<Achievement | null>(null);
  const { progress } = useProgress();

  // Unlocks reais vindos do DB + voice streak do bot tracking.
  // Guardamos a lista completa (com unlocked_at, source, coins_granted) pra
  // a Timeline. Set de IDs é derivado via useMemo.
  const [unlocks, setUnlocks] = useState<UnlockMeta[] | null>(null);
  const unlockedIds = unlocks == null ? null : new Set(unlocks.map((u) => u.achievement_id));
  const [serverStreak, setServerStreak] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/achievements/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          unlocks: UnlockMeta[];
          streak_days: number;
        };
        if (cancelled) return;
        setUnlocks(data.unlocks ?? []);
        setServerStreak(data.streak_days ?? 0);
      } catch {
        // fail silently — mostra tudo como locked
        if (!cancelled) setUnlocks([]);
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
          const data = (await res.json()) as { status?: string; unlocked_at?: string; coins_granted?: number; source?: UnlockMeta["source"] };
          if (data.status === "granted" || data.status === "restored") {
            const entry: UnlockMeta = {
              achievement_id: id,
              unlocked_at: data.unlocked_at ?? new Date().toISOString(),
              coins_granted: data.coins_granted ?? 0,
              source: data.source ?? "system",
            };
            setUnlocks((prev) => (prev ? [...prev, entry] : [entry]));
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
            { id: "timeline" as ViewTab, label: "Timeline",   icon: ArrowUp },
            { id: "tree" as ViewTab,     label: "Skill Tree", icon: TrendingUp },
            { id: "insights" as ViewTab, label: "Insights",   icon: Brain },
          ]).map((tab) => {
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
                  active
                    ? "border-white/[0.22] text-white"
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
                    <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/35">
                      · Manual
                    </span>
                  )}
                </div>

                <div className={
                  useLarge
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                }>
                  {items.map((a) => (
                    <BadgeCard key={a.id} achievement={a} unlocked={isUnlocked(a)} large={useLarge} onOpen={setSelected} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === "timeline" && <TimelineView unlocks={unlocks ?? []} />}
      {view === "tree" && <SkillTreeView completedLessons={lessonsCompleted} />}
      {view === "insights" && <InsightsView />}

      {selected && (
        <AchievementModal
          achievement={selected}
          unlocked={isUnlocked(selected)}
          unlockedAt={unlocks?.find((u) => u.achievement_id === selected.id)?.unlocked_at}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
