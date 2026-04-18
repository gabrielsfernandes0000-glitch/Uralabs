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
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
    { id: "review", label: "Revisão", description: "Revise o dia e treine", icon: Brain, href: "/elite/pratica", accent: "#FF5500", timeHint: "Final do dia", done: false },
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
  const isElite = s.isElite;
  const tierLabelText = isElite ? "Elite 4.0" : "VIP";

  const now = new Date();
  const brHour = (now.getUTCHours() - 3 + 24) % 24;
  const greeting = brHour < 12 ? "Bom dia" : brHour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const steps = getDaySteps();
  const currentIdx = getCurrentStepIndex(steps);
  // For VIPs, the "next step" is always continuing a lesson (no live calls / pratica access)
  const currentStep = isElite ? (steps[currentIdx] || steps[0]) : {
    id: "study",
    label: "Continuar aula",
    description: "Próxima aula do currículo",
    icon: Play,
    href: "/elite/aulas",
    accent: "#FF5500",
    timeHint: "Quando quiser",
    done: false,
  };
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

        <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl blur-md" style={{ backgroundColor: currentStep.accent + "25" }} />
              <Avatar src={avatar} name={displayName} size={52} className="relative rounded-xl ring-2 ring-white/[0.06] ring-offset-2 ring-offset-[#0e0e10]" />
            </div>
            <div>
              <p className="text-[11px] text-white/30 font-medium">{greeting},</p>
              <h1 className="text-[20px] font-bold text-white leading-tight tracking-tight">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase flex items-center gap-1 ${isElite ? "text-brand-500/70" : "text-blue-400/70"}`}>
                  <Flame className="w-3 h-3" /> {tierLabelText}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/25 capitalize">{dateStr}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 bg-white/[0.02] border border-brand-500/10 rounded-lg text-center min-w-[64px]">
              <p className="text-[17px] text-white font-bold leading-none"><CountUp end={stats.streak} duration={1} /></p>
              <p className="text-[9px] text-brand-500/40 uppercase tracking-wider mt-0.5">streak</p>
            </div>
            <div className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-lg text-center min-w-[64px]">
              <p className="text-[17px] text-white font-bold leading-none"><CountUp end={stats.daysRemaining} duration={1.5} delay={0.3} /></p>
              <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">dias rest.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Action + Rotina side by side on desktop ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Primary action — 2 cols */}
        <Link href={currentStep.href} className="lg:col-span-2 animate-in-up delay-2 group block relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10] hover:border-white/[0.12] transition-all duration-300">
          <GlowBorder color={currentStep.accent} duration={8} />
          <div className="relative z-10 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0" style={{ borderColor: currentStep.accent + "30", backgroundColor: currentStep.accent + "10" }}>
                <currentStep.icon className="w-5 h-5" style={{ color: currentStep.accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-0.5">Próximo · {currentStep.timeHint}</p>
                <h2 className="text-[18px] font-bold text-white leading-tight">{currentStep.label}</h2>
                <p className="text-[12px] text-white/40 mt-0.5 truncate">{currentStep.description}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12.5px] font-bold transition-all group-hover:scale-105 shrink-0"
              style={{ backgroundColor: currentStep.accent, color: "white" }}>
              Ir agora
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Progress summary — 1 col */}
        <div className="animate-in-up delay-3 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Rotina hoje</p>
            <span className="text-[12px] text-white/50 font-mono font-bold">{completedSteps}/{steps.length}</span>
          </div>
          <div className="h-[4px] bg-white/[0.04] rounded-full overflow-hidden mb-2">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${(completedSteps / steps.length) * 100}%` }} />
          </div>
          <p className="text-[11px] text-white/35 leading-relaxed">
            {completedSteps === 0 ? "Comece o dia pelo Prep Sheet." : completedSteps === steps.length ? "Dia completo! Excelente disciplina." : `${steps.length - completedSteps} passos restantes hoje.`}
          </p>
        </div>
      </div>

      {/* ── Day Timeline — Elite-only (VIPs don't have live calls / pratica) ── */}
      {isElite && (
      <div className="animate-in-up delay-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-white/40">Rotina do Dia</h3>
          <span className="text-[10px] text-white/30 font-mono">{completedSteps}/{steps.length}</span>
        </div>

        <div className="flex items-start gap-0">
          {steps.map((step, i) => {
            const isCurrent = i === currentIdx;
            const isPast = i < currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-[18px] h-[2px] z-0" style={{ left: "calc(50% + 22px)", right: "calc(-50% + 22px)" }}>
                    <div className={`h-full rounded-full ${isPast || step.done ? "bg-green-500/30" : "bg-white/[0.06]"}`} />
                  </div>
                )}

                <Link href={step.href} className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  step.done
                    ? "bg-green-500/15 border-2 border-green-500/30"
                    : isCurrent
                    ? "border-2"
                    : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15]"
                }`} style={isCurrent && !step.done ? { borderColor: step.accent + "60", boxShadow: `0 0 18px ${step.accent}25` } : undefined}>
                  {step.done ? (
                    <span className="text-green-400 text-[12px] font-bold">✓</span>
                  ) : (
                    <StepIcon className="w-4 h-4" style={{ color: isCurrent ? step.accent : "rgba(255,255,255,0.20)" }} />
                  )}
                </Link>

                <p className={`text-[10px] mt-1.5 text-center leading-tight ${
                  isCurrent ? "text-white/70 font-semibold" : step.done ? "text-green-400/50" : "text-white/30"
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
      )}

      {/* ── Quick access grid ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {(isElite ? [
          { href: "/elite/aulas",       icon: BookOpen, value: <><LiveStat type="lessons" />/{stats.totalLessons}</>, label: "Aulas" },
          { href: "/elite/calls",       icon: Radio,    value: "Live",                                                label: "Calls ao vivo" },
          { href: "/elite/pratica",     icon: Zap,      value: "Treino",                                              label: "Pratique o que aprendeu" },
          { href: "/elite/turma",       icon: Users,    value: "Turma",                                               label: "Comunidade" },
        ] : [
          { href: "/elite/aulas",       icon: BookOpen, value: <><LiveStat type="lessons" />/{stats.totalLessons}</>, label: "Aulas" },
          { href: "/elite/turma",       icon: Users,    value: "Turma",                                               label: "Ver comunidade" },
          { href: "/elite/conquistas",  icon: Target,   value: <LiveStat type="progress" totalLessons={stats.totalLessons} />, label: "Conquistas" },
          { href: "/elite/desbloquear", icon: Zap,      value: "Elite",                                               label: "Destravar calls" },
        ]).map((item, i) => (
          <Link key={item.href} href={item.href} className={`animate-in-up delay-${5 + i} group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-[#0e0e10] p-4 hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300`}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <item.icon className="w-4 h-4 text-white/40" />
              <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[14px] text-white/85 font-bold leading-tight">{item.value}</p>
            <p className="text-[10.5px] text-white/30 mt-0.5">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Curriculum + Turma activity side by side ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Currículo */}
        <div className="animate-in-up delay-8 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-brand-500/40" />
              <h3 className="text-[13px] font-bold text-white/85">Currículo</h3>
            </div>
            <Link href="/elite/aulas" className="text-[10px] text-white/30 hover:text-brand-500/60 transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {CURRICULUM.filter(m => m.lessons.length > 0).map((mod, i) => (
              <div key={mod.id} className="flex items-center gap-3">
                <span className="text-[10px] font-mono w-5" style={{ color: mod.accentHex + "70" }}>{mod.number}</span>
                <span className="text-[11px] text-white/50 flex-1 truncate">{mod.title}</span>
                <ProgressFill value={0} color={mod.accentHex} delay={0.8 + i * 0.15} className="w-[120px]" />
                <span className="text-[10px] text-white/30 font-mono w-8 text-right">0/{mod.lessons.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Atividade da Turma (Elite) or Upgrade CTA (VIP) */}
        {isElite ? (
          <div className="animate-in-up delay-8 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <div className="absolute inset-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping opacity-60" />
                </div>
                <h3 className="text-[13px] font-bold text-white/85">Atividade da Turma</h3>
              </div>
              <Link href="/elite/turma" className="text-[10px] text-white/30 hover:text-brand-500/60 transition-colors flex items-center gap-1">
                Ver tudo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {[
                { initials: "MO", color: "#3B82F6", name: "Mateus",  action: "payout",  detail: "FundingPips $2.400", time: "2h" },
                { initials: "JP", color: "#10B981", name: "JP",      action: "mesa",    detail: "Aprovado na 5%ers",  time: "5h" },
                { initials: "BA", color: "#EC4899", name: "Bruna",   action: "badge",   detail: "Badge Trinity",       time: "1d" },
                { initials: "LR", color: "#A855F7", name: "Lucas",   action: "payout",  detail: "TopStep $1.100",     time: "1d" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
                    style={{ background: `linear-gradient(135deg, ${a.color}30, ${a.color}10)`, color: a.color, border: `1px solid ${a.color}40` }}>
                    {a.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] text-white/80 leading-tight truncate">
                      <span className="font-semibold">{a.name}</span>
                      <span className="text-white/35"> · {a.detail}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Link href="/elite/desbloquear" className="animate-in-up delay-8 group relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-[#1a0e05] to-[#0e0e10] p-5 hover:border-brand-500/40 transition-all">
            <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-brand-500/[0.10] blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3.5 h-3.5 text-brand-500" fill="currentColor" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-500">Upgrade Elite</span>
              </div>
              <h3 className="text-[16px] font-bold text-white tracking-tight leading-tight mb-1">
                Calls ao vivo + mesa prop
              </h3>
              <p className="text-[12px] text-white/45 leading-relaxed mb-4">
                Você já tem as aulas gravadas. Elite destrava calls diárias com o URA, aulas de mesa prop, treinos e publicar na turma.
              </p>
              <div className="flex items-center gap-2 text-[12px] font-bold text-brand-500 group-hover:translate-x-0.5 transition-transform">
                Ver o que destrava
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
