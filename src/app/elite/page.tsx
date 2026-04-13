import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Flame, ArrowRight, BookOpen, FileText, TrendingUp, Brain, Zap, ChevronRight, Target, Radio, PenLine, Users, Play } from "lucide-react";
import Link from "next/link";
import { CURRICULUM, TOTAL_LESSONS } from "@/lib/curriculum";
import { LiveStat } from "@/components/elite/ProgressStats";
import { Avatar } from "@/components/elite/Avatar";
import { GlowBorder } from "@/components/elite/GlowBorder";
import { CountUp, ProgressFill } from "@/components/motion";

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
  return [
    { id: "prep", label: "Prep Sheet", description: "Monte o plano do dia", icon: FileText, href: "/elite/pratica", accent: "#FF5500", timeHint: "Antes do mercado", done: false },
    { id: "call", label: "Call de Operação", description: "Participe da call com o URA", icon: Radio, href: "#", accent: "#FF5500", timeHint: "10:30 — 12:30", done: false },
    { id: "trade", label: "Registrar Trade", description: "Documente o que aconteceu", icon: PenLine, href: "/elite/pratica", accent: "#FF5500", timeHint: "Depois do mercado", done: false },
    { id: "study", label: "Aula do Dia", description: "Continue o currículo", icon: Play, href: "/elite/aulas", accent: "#FF5500", timeHint: "Quando quiser", done: false },
    { id: "review", label: "Revisão", description: "Flashcards ou simulador", icon: Brain, href: "/elite/pratica", accent: "#FF5500", timeHint: "Final do dia", done: false },
  ];
}

function getCurrentStepIndex(steps: DayStep[]): number {
  const now = new Date();
  const brHour = (now.getUTCHours() - 3 + 24) % 24;

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
  const session = await getSession();
  const devSession = { userId: "dev", username: "dev", globalName: "Dev", avatar: null, roles: [], isElite: true, isVip: false };
  const s = session || devSession;
  const avatar = avatarUrl(s.userId, s.avatar, 128);
  const displayName = s.globalName || s.username;

  const now = new Date();
  const brHour = (now.getUTCHours() - 3 + 24) % 24;
  const greeting = brHour < 12 ? "Bom dia" : brHour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const steps = getDaySteps();
  const currentIdx = getCurrentStepIndex(steps);
  const currentStep = steps[currentIdx] || steps[0];
  const completedSteps = steps.filter(s => s.done).length;

  const stats = {
    lessonsCompleted: 0,
    totalLessons: TOTAL_LESSONS,
    streak: 0,
    daysRemaining: 180,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-in-up relative overflow-hidden rounded-2xl border border-brand-500/10 bg-[#0e0e10]">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] blur-[120px] pointer-events-none"
          style={{ backgroundColor: currentStep.accent + "08" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_70%_20%,#000_40%,transparent_100%)]" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl blur-md" style={{ backgroundColor: currentStep.accent + "25" }} />
              <Avatar src={avatar} name={displayName} size={64} className="relative rounded-2xl ring-2 ring-white/[0.06] ring-offset-2 ring-offset-[#0e0e10]" />
            </div>
            <div>
              <p className="text-[12px] text-white/30 font-medium">{greeting},</p>
              <h1 className="text-[24px] font-bold text-white leading-tight tracking-tight">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-brand-500/70 font-semibold tracking-[0.2em] uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Elite 4.0
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/25 capitalize">{dateStr}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white/[0.02] border border-brand-500/10 rounded-xl text-center min-w-[72px]">
              <p className="text-[20px] text-white font-bold leading-none"><CountUp end={stats.streak} duration={1} /></p>
              <p className="text-[9px] text-brand-500/40 uppercase tracking-wider mt-1">streak</p>
            </div>
            <div className="px-5 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center min-w-[72px]">
              <p className="text-[20px] text-white font-bold leading-none"><CountUp end={stats.daysRemaining} duration={1.5} delay={0.3} /></p>
              <p className="text-[9px] text-white/30 uppercase tracking-wider mt-1">dias restantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Action — THE one thing to do now ── */}
      <Link href={currentStep.href} className="animate-in-up delay-2 group block relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10] hover:border-white/[0.12] transition-all duration-300">
        <GlowBorder color={currentStep.accent} duration={8} />
        <div className="relative z-10 p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ borderColor: currentStep.accent + "30", backgroundColor: currentStep.accent + "10" }}>
              <currentStep.icon className="w-6 h-6" style={{ color: currentStep.accent }} />
            </div>
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Próximo passo · {currentStep.timeHint}</p>
              <h2 className="text-[22px] font-bold text-white">{currentStep.label}</h2>
              <p className="text-[13px] text-white/40 mt-0.5">{currentStep.description}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold transition-all group-hover:scale-105"
            style={{ backgroundColor: currentStep.accent, color: "white" }}>
            Ir agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>

      {/* ── Day Timeline — horizontal steps ── */}
      <div className="animate-in-up delay-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-semibold text-white/60">Rotina do Dia</h3>
          <span className="text-[11px] text-white/30 font-mono">{completedSteps}/{steps.length}</span>
        </div>

        <div className="flex items-start gap-0">
          {steps.map((step, i) => {
            const isCurrent = i === currentIdx;
            const isPast = i < currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-6 h-[2px] z-0" style={{ left: "calc(50% + 30px)", right: "calc(-50% + 30px)" }}>
                    <div className={`h-full rounded-full ${isPast || step.done ? "bg-green-500/30" : "bg-white/[0.06]"}`} />
                  </div>
                )}

                <Link href={step.href} className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  step.done
                    ? "bg-green-500/15 border-2 border-green-500/30"
                    : isCurrent
                    ? "border-2 shadow-lg"
                    : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15]"
                }`} style={isCurrent && !step.done ? { borderColor: step.accent + "50", boxShadow: `0 0 25px ${step.accent}25` } : undefined}>
                  {step.done ? (
                    <span className="text-green-400 text-[14px] font-bold">✓</span>
                  ) : (
                    <StepIcon className="w-5 h-5" style={{ color: isCurrent ? step.accent : "rgba(255,255,255,0.20)" }} />
                  )}
                </Link>

                <p className={`text-[10px] mt-2 text-center leading-tight ${
                  isCurrent ? "text-white/70 font-medium" : step.done ? "text-green-400/50" : "text-white/30"
                }`}>
                  {step.label}
                </p>
                <p className={`text-[9px] mt-0.5 ${isCurrent ? "text-white/30" : "text-white/20"}`}>
                  {step.timeHint}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick access grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/elite/aulas" className="animate-in-up delay-5 group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-[#0e0e10] p-5 hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-5 h-5 text-white/40" />
            <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[15px] text-white/80 font-bold"><LiveStat type="lessons" />/{stats.totalLessons}</p>
          <p className="text-[11px] text-white/30">Aulas</p>
        </Link>

        <Link href="/elite/pratica" className="animate-in-up delay-6 group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-[#0e0e10] p-5 hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <Zap className="w-5 h-5 text-white/40" />
            <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[15px] text-white/80 font-bold">Simulador</p>
          <p className="text-[11px] text-white/30">Treinar sem risco</p>
        </Link>

        <Link href="/elite/conquistas" className="animate-in-up delay-7 group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-[#0e0e10] p-5 hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <Target className="w-5 h-5 text-white/40" />
            <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[15px] text-white/80 font-bold"><LiveStat type="progress" totalLessons={stats.totalLessons} /></p>
          <p className="text-[11px] text-white/30">Progresso</p>
        </Link>

        <Link href="/elite/turma" className="animate-in-up delay-8 group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-[#0e0e10] p-5 hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-white/40" />
            <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[15px] text-white/80 font-bold">Turma</p>
          <p className="text-[11px] text-white/30">Comunidade</p>
        </Link>
      </div>

      {/* ── Curriculum progress — compact ── */}
      <div className="animate-in-up delay-8 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-brand-500/40" />
            <h3 className="text-[14px] font-semibold text-white/70">Currículo</h3>
          </div>
          <Link href="/elite/aulas" className="text-[10px] text-white/30 hover:text-brand-500/60 transition-colors flex items-center gap-1">
            Ver tudo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {CURRICULUM.filter(m => m.lessons.length > 0).map((mod, i) => (
            <div key={mod.id} className="flex items-center gap-3">
              <span className="text-[10px] font-mono w-5" style={{ color: mod.accentHex + "60" }}>{mod.number}</span>
              <span className="text-[11px] text-white/40 w-28 truncate">{mod.title}</span>
              <ProgressFill value={0} color={mod.accentHex} delay={0.8 + i * 0.15} className="flex-1" />
              <span className="text-[10px] text-white/30 font-mono w-8 text-right">0/{mod.lessons.length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
