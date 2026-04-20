"use client";

import { useEffect, useState } from "react";
import { Lock, TrendingUp, Brain, Flame, Target, ChevronRight, ArrowUp, Sparkles, X, Check, Trophy } from "lucide-react";
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
   Skill Tree — árvore ramificada com dados REAIS do currículo.
   Cada node agrupa 1–3 aulas do CURRICULUM. Progresso = aulas
   concluídas / total do node. Unlock = todas as aulas dos nodes
   `requires` foram concluídas. Cor por módulo. Clique → primeira
   aula não-concluída em /elite/aulas/{id}.
   ──────────────────────────────────────────── */

interface SkillNode {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentHex: string;
  lessons: string[]; // IDs reais do CURRICULUM
  requires: string[]; // IDs de outros nodes
}

const MODULE_ACCENT = {
  base:         "#FF5500",
  smc:          "#3B82F6",
  estrategia:   "#A855F7",
  execucao:     "#10B981",
  operacao:     "#EF4444",
} as const;

const SKILL_TREE: SkillNode[][] = [
  // Row 0 — Fundamento
  [
    { id: "mindset", name: "Mindset", desc: "Mentalidade profissional",
      icon: Brain, accentHex: MODULE_ACCENT.base,
      lessons: ["intro"], requires: [] },
  ],
  // Row 1 — Base
  [
    { id: "leitura-preco", name: "Leitura de Preço", desc: "Candles, TFs, contexto",
      icon: TrendingUp, accentHex: MODULE_ACCENT.base,
      lessons: ["leitura-candle"], requires: ["mindset"] },
    { id: "risco", name: "Gestão de Risco", desc: "1% diário, 2.5% semanal",
      icon: Target, accentHex: MODULE_ACCENT.base,
      lessons: ["risco"], requires: ["mindset"] },
  ],
  // Row 2 — SMC
  [
    { id: "smc-core", name: "Smart Money", desc: "Order Blocks, FVG, Breakers",
      icon: Brain, accentHex: MODULE_ACCENT.smc,
      lessons: ["order-blocks", "fvg-breaker"], requires: ["leitura-preco"] },
    { id: "pd-liquidez", name: "P&D · Liquidez", desc: "Premium/Discount, BSL, SSL",
      icon: TrendingUp, accentHex: MODULE_ACCENT.smc,
      lessons: ["premium-discount", "liquidez"], requires: ["leitura-preco", "risco"] },
  ],
  // Row 3 — Estratégia
  [
    { id: "amd-sessoes", name: "AMD & Sessões", desc: "Acumulação, manipulação, Kill Zones",
      icon: Target, accentHex: MODULE_ACCENT.estrategia,
      lessons: ["sessoes", "amd"], requires: ["smc-core", "pd-liquidez"] },
    { id: "bias-smt", name: "Bias & SMT", desc: "Daily Bias, Judas Swing, divergência",
      icon: Flame, accentHex: MODULE_ACCENT.estrategia,
      lessons: ["daily-bias", "smt"], requires: ["smc-core"] },
  ],
  // Row 4 — Execução
  [
    { id: "execucao-real", name: "Execução Real", desc: "Entrada, saída, mesas prop",
      icon: TrendingUp, accentHex: MODULE_ACCENT.execucao,
      lessons: ["entrada-saida", "mesas-prop", "gerenciamento-contas"],
      requires: ["amd-sessoes", "bias-smt"] },
  ],
];

interface ResolvedNode extends SkillNode {
  completed: number;
  total: number;
  progress: number;
  unlocked: boolean;
  /** próxima aula não-concluída (ou a primeira se todas feitas) */
  targetLessonId: string;
}

/** Resolve progresso e unlock de todos os nodes dado completedLessons. */
function resolveSkillTree(completedLessons: string[]): ResolvedNode[][] {
  const done = new Set(completedLessons);
  const allNodes = SKILL_TREE.flat();
  const nodeComplete = new Map<string, boolean>();

  // Pre-compute completion por node
  for (const n of allNodes) {
    nodeComplete.set(n.id, n.lessons.every((l) => done.has(l)));
  }

  return SKILL_TREE.map((row) =>
    row.map((n) => {
      const total = n.lessons.length;
      const completed = n.lessons.filter((l) => done.has(l)).length;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      const unlocked = n.requires.length === 0 || n.requires.every((r) => nodeComplete.get(r));
      const targetLessonId = n.lessons.find((l) => !done.has(l)) ?? n.lessons[0];
      return { ...n, completed, total, progress, unlocked, targetLessonId };
    })
  );
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
      className={`interactive group relative w-full text-left rounded-2xl border bg-[#111114] transition-all duration-500 overflow-hidden cursor-pointer ${borderClass} hover:-translate-y-1`}
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
      className="modal-in-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-in-panel relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#141417] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="interactive-tap absolute top-3 right-3 z-30 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
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
  const tree = resolveSkillTree(completedLessons);
  const flat = tree.flat();
  const totalLessons = flat.reduce((s, n) => s + n.total, 0);
  const doneLessons = flat.reduce((s, n) => s + n.completed, 0);
  const currentNode = flat.find((n) => n.unlocked && n.progress < 100);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-[18px] font-bold text-white/90 mb-1">Árvore de Habilidades</h2>
          <p className="text-[12px] text-white/45 leading-relaxed">
            Cada node agrupa aulas relacionadas do currículo Elite. Complete as aulas de um node
            pra destravar os que dependem dele. Clique pra ir direto pra próxima aula.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[22px] font-bold text-white leading-none font-mono tabular-nums">
              {doneLessons}<span className="text-white/25">/{totalLessons}</span>
            </p>
            <p className="text-[10px] text-white/35 mt-1 uppercase tracking-wider">aulas</p>
          </div>
          {currentNode && (
            <div className="pl-4 border-l border-white/[0.06] max-w-[180px]">
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Próximo node</p>
              <p className="text-[13px] font-bold truncate" style={{ color: currentNode.accentHex }}>
                {currentNode.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legenda de módulos */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015]">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Módulos</span>
        {[
          { label: "Base", hex: MODULE_ACCENT.base },
          { label: "SMC", hex: MODULE_ACCENT.smc },
          { label: "Estratégia", hex: MODULE_ACCENT.estrategia },
          { label: "Execução", hex: MODULE_ACCENT.execucao },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.hex }} />
            <span className="text-[11px] text-white/55">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          {tree.map((row, rowIdx) => (
            <div key={rowIdx}>
              {/* Connectors — branching SVG */}
              {rowIdx > 0 && (
                <div className="flex justify-center py-2">
                  <svg width="260" height="32" viewBox="0 0 260 32" fill="none" className="text-white/[0.08]">
                    <line x1="65"  y1="0" x2="130" y2="32" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="195" y1="0" x2="130" y2="32" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}

              <div className={`flex items-stretch justify-center gap-5 ${row.length === 1 ? "" : ""}`}>
                {row.map((node) => {
                  const Icon = node.icon;
                  const isComplete = node.progress === 100;
                  const clickable = node.unlocked;
                  const wrapperClass = `interactive group relative w-[250px] rounded-xl border p-4 transition-all duration-300 overflow-hidden ${
                    node.unlocked
                      ? isComplete
                        ? "border-white/[0.10] bg-gradient-to-b from-[#16161a] to-[#111114] hover:-translate-y-0.5"
                        : "border-white/[0.08] bg-gradient-to-b from-[#161619] to-[#111114] hover:-translate-y-0.5 hover:shadow-lg"
                      : "border-white/[0.04] bg-[#0b0b0e] opacity-45"
                  } ${clickable ? "cursor-pointer" : ""}`;

                  const inner = (
                    <>
                      {/* Faixa accent sutil no topo quando unlocked */}
                      {node.unlocked && (
                        <div
                          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${node.accentHex}, transparent)`,
                          }}
                          aria-hidden
                        />
                      )}

                      {/* Header: ring + título */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-11 h-11 shrink-0">
                          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            {node.progress > 0 && (
                              <circle
                                cx="22" cy="22" r="18" fill="none"
                                stroke={node.accentHex}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${(node.progress / 100) * 113.1} 113.1`}
                                className="transition-all duration-700"
                              />
                            )}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            {!node.unlocked ? (
                              <Lock className="w-3.5 h-3.5 text-white/20" />
                            ) : isComplete ? (
                              <Check className="w-4 h-4" style={{ color: node.accentHex }} strokeWidth={2.5} />
                            ) : (
                              <Icon className="w-4 h-4" style={{ color: node.accentHex }} />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-[13px] font-bold leading-tight tracking-tight ${node.unlocked ? "text-white/90" : "text-white/30"}`}>
                            {node.name}
                          </h4>
                          <p className={`text-[10.5px] leading-tight mt-0.5 ${node.unlocked ? "text-white/40" : "text-white/20"}`}>
                            {node.desc}
                          </p>
                        </div>
                      </div>

                      {/* Lista de aulas do node */}
                      <div className="space-y-1 mb-3">
                        {node.lessons.map((lessonId) => {
                          const lesson = CURRICULUM.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
                          if (!lesson) return null;
                          const done = completedLessons.includes(lessonId);
                          return (
                            <div
                              key={lessonId}
                              className={`flex items-center gap-1.5 text-[10.5px] ${
                                done ? "text-white/60" : node.unlocked ? "text-white/35" : "text-white/20"
                              }`}
                            >
                              {done ? (
                                <Check className="w-2.5 h-2.5 shrink-0" style={{ color: node.accentHex }} strokeWidth={3} />
                              ) : (
                                <span className="w-[5px] h-[5px] rounded-full bg-white/15 shrink-0 ml-[3px] mr-[3px]" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer: progress bar + % */}
                      <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${node.progress}%`, backgroundColor: node.accentHex }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[9.5px] uppercase tracking-wider ${node.unlocked ? "text-white/40" : "text-white/20"}`}>
                          {!node.unlocked ? "Bloqueado" : isComplete ? "Completo" : node.progress > 0 ? "Em curso" : "A fazer"}
                        </span>
                        <span className={`text-[10px] font-mono tabular-nums ${node.unlocked ? "text-white/50" : "text-white/20"}`}>
                          {node.completed}/{node.total}
                        </span>
                      </div>
                    </>
                  );

                  return clickable ? (
                    <Link key={node.id} href={`/elite/aulas/${node.targetLessonId}`} className={wrapperClass}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={node.id} className={wrapperClass}>{inner}</div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Flow direction label */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MODULE_ACCENT.base }} />
              <span className="text-[10px] text-white/40 font-medium">Base → SMC → Estratégia → Execução</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MODULE_ACCENT.execucao }} />
            </div>
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
            <Link href="/elite/pratica" className="interactive-tap mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500/40 text-[12px] text-brand-500 font-medium hover:bg-brand-500/[0.04] transition-colors">
              Ir pra Prática <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {disciplineRate >= 80 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-[12px] text-white/60">Disciplina alta — você segue o plano {disciplineRate}% das vezes</p>
              </div>
            )}
            {disciplineRate < 50 && totalTrades >= 3 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-[12px] text-white/60">Atenção: apenas {disciplineRate}% dos trades seguiram o plano. Revise seu Prep Sheet.</p>
              </div>
            )}
            {winRate >= 60 && totalTrades >= 5 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-[12px] text-white/60">Win rate de {winRate}% — consistência acima da média</p>
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

    const disciplinedCount = trades.filter((t: { followedPlan?: boolean }) => t.followedPlan === true).length;
    const newsReadCount = typeof window !== "undefined" ? parseInt(localStorage.getItem("elite_news_read_count") ?? "0", 10) : 0;
    const watchlistConfigured = typeof window !== "undefined"
      ? (() => {
          try {
            const raw = localStorage.getItem("elite_watchlist_v1");
            return raw !== null && JSON.parse(raw).length > 0;
          } catch { return false; }
        })()
      : false;

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
        // Disciplina (followedPlan=true count). Client-side, pode ser fraudado mas
        // edge function valida achievement_id (auto_distribute check).
        case "disciplined-5":   return disciplinedCount >= 5;
        case "disciplined-25":  return disciplinedCount >= 25;
        case "disciplined-100": return disciplinedCount >= 100;
        // Event-driven (localStorage): news reads, watchlist setup.
        // TODO edge function: adicionar esses IDs na whitelist do achievement-auto-grant.
        case "news-reader":   return newsReadCount >= 10;
        case "newshound":     return newsReadCount >= 50;
        case "watchlist-set": return watchlistConfigured;
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
      <div className="animate-in-up flex items-center justify-between flex-wrap gap-5">
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
                className={`interactive-tap flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
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
      <div className="animate-in-up delay-1 flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02]">
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
        <div className="animate-in-up delay-2 space-y-10">
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

      {view === "timeline" && <div className="animate-in-up delay-2"><TimelineView unlocks={unlocks ?? []} /></div>}
      {view === "tree" && <div className="animate-in-up delay-2"><SkillTreeView completedLessons={lessonsCompleted} /></div>}
      {view === "insights" && <div className="animate-in-up delay-2"><InsightsView /></div>}

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
