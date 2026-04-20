import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Flame, ArrowRight, BookOpen, FileText, TrendingUp, Brain, Zap, ChevronRight, Target, Radio, PenLine, Users, Play, CalendarClock } from "lucide-react";
import Link from "next/link";
import { getCurriculum } from "@/lib/curriculum.server";
import { LiveStat } from "@/components/elite/ProgressStats";
import { Avatar } from "@/components/elite/Avatar";
import { GlowBorder } from "@/components/elite/GlowBorder";
import { CountUp, ProgressFill } from "@/components/motion";
import { impactMeta, type EconomicEvent } from "@/lib/market-news";
import { instrumentsForEvent } from "@/lib/economic-events";
import { InstrumentFilterStyle } from "@/components/elite/InstrumentFilterStyle";
import { RecentSurpriseCard } from "@/components/elite/RecentSurpriseCard";
import { loadLastReleasedEvent, loadTodayEvents } from "@/lib/events-today";

/** Código curto PT-BR do país pro header da agenda (mesma convenção de /elite/noticias). */
function countryCode(country: string): string {
  const map: Record<string, string> = { US: "EUA", EU: "UE", BR: "BR", UK: "UK", CN: "CN", JP: "JP", CA: "CA", AU: "AU", NZ: "NZ" };
  return map[country] ?? country;
}

function nyNowMinutes(): number {
  const s = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

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

  const [curriculum, todayEvents, lastReleased] = await Promise.all([
    getCurriculum(),
    isElite ? loadTodayEvents() : Promise.resolve([] as EconomicEvent[]),
    isElite ? loadLastReleasedEvent() : Promise.resolve(null),
  ]);
  const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
  const stats = {
    lessonsCompleted: 0,
    totalLessons,
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

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatar} name={displayName} size={60} className="rounded-xl ring-1 ring-white/[0.08]" />
            <div>
              <p className="text-[11px] text-white/30 font-medium">{greeting},</p>
              <h1 className="text-[26px] md:text-[30px] font-bold text-white leading-tight tracking-tight">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Flame className={`w-3 h-3 ${isElite ? "text-brand-500/80" : "text-blue-400/80"}`} strokeWidth={2} />
                <span className={`text-[9.5px] font-bold tracking-[0.25em] uppercase ${isElite ? "text-brand-500/80" : "text-blue-400/80"}`}>
                  {tierLabelText}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/30 capitalize">{dateStr}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div className="text-right">
              <p className="text-[32px] md:text-[38px] font-bold text-white leading-none font-mono"><CountUp end={stats.streak} duration={1} /></p>
              <p className="text-[10px] text-brand-500/50 uppercase tracking-[0.2em] mt-1.5">streak</p>
            </div>
            <div className="h-10 w-px bg-white/[0.08]" />
            <div className="text-right">
              <p className="text-[32px] md:text-[38px] font-bold text-white leading-none font-mono"><CountUp end={stats.daysRemaining} duration={1.5} delay={0.3} /></p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1.5">dias rest.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Action + Rotina side by side on desktop ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Primary action — 2 cols */}
        <Link href={currentStep.href} className="interactive lg:col-span-2 animate-in-up delay-2 group block relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10] hover:border-white/[0.12] transition-all duration-300">
          <GlowBorder color={currentStep.accent} duration={8} />
          <div className="relative z-10 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <currentStep.icon className="w-8 h-8 shrink-0" style={{ color: currentStep.accent }} strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-0.5">Próximo · {currentStep.timeHint}</p>
                <h2 className="text-[18px] font-bold text-white leading-tight">{currentStep.label}</h2>
                <p className="text-[12px] text-white/40 mt-0.5 truncate">{currentStep.description}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-[12.5px] font-bold transition-all group-hover:scale-105 shrink-0"
              style={{ borderColor: currentStep.accent, color: currentStep.accent }}>
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

                <Link href={step.href} className={`interactive-tap relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  step.done
                    ? "border border-green-500/40"
                    : isCurrent
                    ? "border-2"
                    : "border border-white/[0.08] hover:border-white/[0.15]"
                }`} style={isCurrent && !step.done ? { borderColor: step.accent + "60", boxShadow: `0 0 18px ${step.accent}20` } : undefined}>
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
          <Link key={item.href} href={item.href} className={`interactive animate-in-up delay-${5 + i} group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-[#0e0e10] p-4 hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300`}>
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
            {curriculum.filter(m => m.lessons.length > 0).map((mod, i) => (
              <div key={mod.id} className="flex items-center gap-3">
                <span className="text-[10px] font-mono w-5" style={{ color: mod.accentHex + "70" }}>{mod.number}</span>
                <span className="text-[11px] text-white/50 flex-1 truncate">{mod.title}</span>
                <ProgressFill value={0} color={mod.accentHex} delay={0.8 + i * 0.15} className="w-[120px]" />
                <span className="text-[10px] text-white/30 font-mono w-8 text-right">0/{mod.lessons.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Agenda econômica (Elite) or Upgrade CTA (VIP) */}
        {isElite ? (
          <div className="space-y-4">
            <DashboardAgenda events={todayEvents} />
            {lastReleased && <RecentSurpriseCard event={lastReleased} />}
          </div>
        ) : (
          <Link href="/elite/desbloquear" className="interactive animate-in-up delay-8 group relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-[#1a0e05] to-[#0e0e10] p-5 hover:border-brand-500/40 transition-all">
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

/* ────────────────────────────────────────────
   Dashboard Agenda — mini-versão dos eventos de hoje
   ──────────────────────────────────────────── */

function DashboardAgenda({ events }: { events: EconomicEvent[] }) {
  const nowMins = nyNowMinutes();
  const nextEvent = events.find((e) => {
    const m = parseMins(e.time);
    return m !== null && m >= nowMins;
  });
  const nextEta = nextEvent ? etaFromNow(nextEvent.time, nowMins) : null;

  return (
    <div className="animate-in-up delay-8 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-white/60" strokeWidth={1.8} />
          <h3 className="text-[13px] font-bold text-white/85">Agenda de hoje</h3>
          {nextEta && (
            <>
              <span className="text-white/15 text-[10px]">·</span>
              <span className="text-[10px] font-mono tabular-nums text-white/55">próximo {nextEta}</span>
            </>
          )}
        </div>
        <Link href="/elite/noticias" className="text-[10px] text-white/30 hover:text-brand-500/60 transition-colors flex items-center gap-1">
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <InstrumentFilterStyle />
      {events.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[12.5px] font-semibold text-white/70 mb-1">Mercado calmo hoje</p>
          <p className="text-[10.5px] text-white/35 leading-relaxed max-w-xs mx-auto">
            Sem evento de alto/médio impacto na agenda. Dia pra operar o que o gráfico entrega.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {events.map((ev) => {
            const m = impactMeta(ev.impact);
            const mins = parseMins(ev.time);
            const isPast = mins !== null && mins < nowMins;
            const released = !!ev.actual;
            const instruments = instrumentsForEvent(ev.event, ev.country).join(" ");
            return (
              <div
                key={ev.id}
                data-filterable-event
                data-instruments={instruments}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-white/[0.02] ${isPast ? "opacity-45" : ""}`}
              >
                <div className="shrink-0 w-12 text-right">
                  <p className="text-[12.5px] font-bold font-mono tabular-nums text-white/90 leading-none">{ev.time || "—"}</p>
                  <p className="text-[9px] text-white/30 font-mono uppercase tracking-[0.15em] mt-1">{countryCode(ev.country)}</p>
                </div>
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: m.dotBg,
                    boxShadow: ev.impact === "high" && !isPast ? `0 0 0 3px ${m.dotBg}22` : undefined,
                  }}
                />
                <p className="text-[11.5px] text-white/80 flex-1 truncate font-medium">{ev.event}</p>
                {released && <span className="shrink-0 text-[9px] font-bold tracking-[0.18em] uppercase text-emerald-400/80">✓</span>}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/25 mt-3 pt-3 border-t border-white/[0.04]">
        ET (NY) · alto/médio impacto
      </p>
    </div>
  );
}

function parseMins(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function etaFromNow(time: string, nowMins: number): string | null {
  const m = parseMins(time);
  if (m === null) return null;
  const diff = m - nowMins;
  if (diff < 0) return null;
  if (diff < 1) return "agora";
  if (diff < 60) return `em ${diff}min`;
  const h = Math.floor(diff / 60);
  const mm = diff % 60;
  return mm > 0 ? `em ${h}h${String(mm).padStart(2, "0")}` : `em ${h}h`;
}
