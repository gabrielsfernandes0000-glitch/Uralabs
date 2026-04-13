import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Flame, ArrowRight, BookOpen, FileText, TrendingUp, Brain, Zap, ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { CURRICULUM, TOTAL_LESSONS } from "@/lib/curriculum";

/* ────────────────────────────────────────────
   Daily Steps — the 5 steps of a trading day
   ──────────────────────────────────────────── */

interface DayStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  accent: string;
  timeHint: string;
  done: boolean;
}

function getDaySteps(): DayStep[] {
  // TODO: pull "done" from Supabase
  return [
    { id: "prep", label: "Prep Sheet", description: "Monte o plano do dia", icon: FileText, href: "/elite/pratica", accent: "#F59E0B", timeHint: "Antes do mercado", done: false },
    { id: "call", label: "Call de Operação", description: "Participe da call com o URA", icon: TrendingUp, href: "#", accent: "#10B981", timeHint: "10:30 — 12:30", done: false },
    { id: "trade", label: "Registrar Trade", description: "Documente o que aconteceu", icon: TrendingUp, href: "/elite/pratica", accent: "#3B82F6", timeHint: "Depois do mercado", done: false },
    { id: "study", label: "Aula do Dia", description: "Continue o currículo", icon: BookOpen, href: "/elite/aulas", accent: "#A855F7", timeHint: "Quando quiser", done: false },
    { id: "review", label: "Revisão", description: "Flashcards ou simulador", icon: Brain, href: "/elite/pratica", accent: "#FF5500", timeHint: "Final do dia", done: false },
  ];
}

function getCurrentStepIndex(steps: DayStep[]): number {
  const now = new Date();
  const brHour = (now.getUTCHours() - 3 + 24) % 24;

  // Find first incomplete step, weighted by time of day
  if (brHour < 10) return steps.findIndex(s => s.id === "prep");
  if (brHour < 13) return steps.findIndex(s => s.id === "call");
  if (brHour < 16) return steps.findIndex(s => s.id === "trade");
  if (brHour < 20) return steps.findIndex(s => s.id === "study");
  return steps.findIndex(s => s.id === "review");
}

/* ────────────────────────────────────────────
   Main Dashboard
   ──────────────────────────────────────────── */

export default async function EliteDashboard() {
  const session = (await getSession())!;
  const avatar = avatarUrl(session.userId, session.avatar, 128);
  const displayName = session.globalName || session.username;

  const now = new Date();
  const brHour = (now.getUTCHours() - 3 + 24) % 24;
  const greeting = brHour < 12 ? "Bom dia" : brHour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const steps = getDaySteps();
  const currentIdx = getCurrentStepIndex(steps);
  const currentStep = steps[currentIdx] || steps[0];
  const completedSteps = steps.filter(s => s.done).length;

  // TODO: from Supabase
  const stats = {
    lessonsCompleted: 0,
    totalLessons: TOTAL_LESSONS,
    streak: 0,
    daysRemaining: 180,
  };
  const progress = stats.totalLessons > 0 ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] blur-[120px] pointer-events-none"
          style={{ backgroundColor: currentStep.accent + "08" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_70%_20%,#000_40%,transparent_100%)]" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl blur-md" style={{ backgroundColor: currentStep.accent + "25" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt={displayName} className="relative w-[64px] h-[64px] rounded-2xl object-cover ring-2 ring-white/[0.06] ring-offset-2 ring-offset-[#080b14]" />
            </div>
            <div>
              <p className="text-[12px] text-white/30 font-medium">{greeting},</p>
              <h1 className="text-[24px] font-bold text-white leading-tight tracking-tight">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-brand-500/70 font-semibold tracking-[0.2em] uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Elite 4.0
                </span>
                <span className="text-white/8">·</span>
                <span className="text-[10px] text-white/25 capitalize">{dateStr}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
              <p className="text-[18px] text-white font-bold">{stats.streak}</p>
              <p className="text-[9px] text-white/20 uppercase tracking-wider">streak</p>
            </div>
            <div className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
              <p className="text-[18px] text-white font-bold">{stats.daysRemaining}</p>
              <p className="text-[9px] text-white/20 uppercase tracking-wider">dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Action — THE one thing to do now ── */}
      <Link href={currentStep.href} className="group block relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080b14] hover:border-white/[0.15] transition-all duration-300">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${currentStep.accent}08, transparent)` }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${currentStep.accent}40, transparent)` }} />

        <div className="relative z-10 p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: currentStep.accent + "15" }}>
              <currentStep.icon className="w-6 h-6" style={{ color: currentStep.accent }} />
            </div>
            <div>
              <p className="text-[11px] text-white/25 uppercase tracking-wider mb-1">Próximo passo · {currentStep.timeHint}</p>
              <h2 className="text-[20px] font-bold text-white/90 group-hover:text-white transition-colors">{currentStep.label}</h2>
              <p className="text-[13px] text-white/35 mt-0.5">{currentStep.description}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold transition-all group-hover:brightness-110"
            style={{ backgroundColor: currentStep.accent, color: "white" }}>
            Ir agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>

      {/* ── Day Timeline — horizontal steps ── */}
      <div className="rounded-2xl border border-white/[0.04] bg-[#080b14] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-semibold text-white/60">Rotina do Dia</h3>
          <span className="text-[11px] text-white/20 font-mono">{completedSteps}/{steps.length}</span>
        </div>

        {/* Timeline */}
        <div className="flex items-start gap-0">
          {steps.map((step, i) => {
            const isCurrent = i === currentIdx;
            const isPast = i < currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-[50%] right-0 w-full h-[2px] z-0">
                    <div className={`h-full ${isPast || step.done ? "bg-green-500/30" : "bg-white/[0.04]"}`} />
                  </div>
                )}

                {/* Step circle */}
                <Link href={step.href} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step.done
                    ? "bg-green-500/15 border-2 border-green-500/30"
                    : isCurrent
                    ? "border-2 shadow-lg"
                    : "bg-white/[0.02] border border-white/[0.06]"
                }`} style={isCurrent && !step.done ? { borderColor: step.accent + "50", boxShadow: `0 0 20px ${step.accent}20` } : undefined}>
                  {step.done ? (
                    <span className="text-green-400 text-[12px] font-bold">✓</span>
                  ) : (
                    <StepIcon className="w-4 h-4" style={{ color: isCurrent ? step.accent : "rgba(255,255,255,0.15)" }} />
                  )}
                </Link>

                {/* Label */}
                <p className={`text-[10px] mt-2 text-center leading-tight ${
                  isCurrent ? "text-white/70 font-medium" : step.done ? "text-green-400/50" : "text-white/15"
                }`}>
                  {step.label}
                </p>
                <p className={`text-[8px] mt-0.5 ${isCurrent ? "text-white/25" : "text-white/8"}`}>
                  {step.timeHint}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick access grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/elite/aulas" className="group rounded-xl border border-white/[0.04] bg-[#080b14] p-5 hover:border-white/[0.08] transition-all">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-4 h-4 text-brand-500/50" />
            <ChevronRight className="w-3 h-3 text-white/8 group-hover:text-white/20 transition-colors" />
          </div>
          <p className="text-[13px] text-white/70 font-bold">{stats.lessonsCompleted}/{stats.totalLessons}</p>
          <p className="text-[10px] text-white/20">Aulas</p>
        </Link>

        <Link href="/elite/pratica" className="group rounded-xl border border-white/[0.04] bg-[#080b14] p-5 hover:border-white/[0.08] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Zap className="w-4 h-4 text-brand-500/50" />
            <ChevronRight className="w-3 h-3 text-white/8 group-hover:text-white/20 transition-colors" />
          </div>
          <p className="text-[13px] text-white/70 font-bold">Simulador</p>
          <p className="text-[10px] text-white/20">Treinar sem risco</p>
        </Link>

        <Link href="/elite/conquistas" className="group rounded-xl border border-white/[0.04] bg-[#080b14] p-5 hover:border-white/[0.08] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-4 h-4 text-yellow-500/50" />
            <ChevronRight className="w-3 h-3 text-white/8 group-hover:text-white/20 transition-colors" />
          </div>
          <p className="text-[13px] text-white/70 font-bold">{progress}%</p>
          <p className="text-[10px] text-white/20">Progresso</p>
        </Link>

        <Link href="/elite/turma" className="group rounded-xl border border-white/[0.04] bg-[#080b14] p-5 hover:border-white/[0.08] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Brain className="w-4 h-4 text-blue-500/50" />
            <ChevronRight className="w-3 h-3 text-white/8 group-hover:text-white/20 transition-colors" />
          </div>
          <p className="text-[13px] text-white/70 font-bold">Turma</p>
          <p className="text-[10px] text-white/20">Comunidade</p>
        </Link>
      </div>

      {/* ── Curriculum progress — compact ── */}
      <div className="rounded-2xl border border-white/[0.04] bg-[#080b14] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-brand-500/30" />
            <h3 className="text-[14px] font-semibold text-white/60">Currículo</h3>
          </div>
          <Link href="/elite/aulas" className="text-[10px] text-white/20 hover:text-brand-500/60 transition-colors flex items-center gap-1">
            Ver tudo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {CURRICULUM.filter(m => m.lessons.length > 0).map((mod) => (
            <div key={mod.id} className="flex items-center gap-3">
              <span className="text-[10px] font-mono w-5" style={{ color: mod.accentHex + "60" }}>{mod.number}</span>
              <span className="text-[11px] text-white/40 w-28 truncate">{mod.title}</span>
              <div className="flex-1 h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "0%", backgroundColor: mod.accentHex }} />
              </div>
              <span className="text-[10px] text-white/15 font-mono w-8 text-right">0/{mod.lessons.length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
