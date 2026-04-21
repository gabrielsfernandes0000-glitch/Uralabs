import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Flame, ArrowRight, BookOpen, FileText, Brain, Zap, ChevronRight, Target, Radio, PenLine, Users, Play, CalendarClock, Moon, Check } from "lucide-react";
import Link from "next/link";
import { getCurriculum } from "@/lib/curriculum.server";
import { LiveStat } from "@/components/elite/ProgressStats";
import { Avatar } from "@/components/elite/Avatar";
import { GlowBorder } from "@/components/elite/GlowBorder";
import { CountUp } from "@/components/motion";
import { impactMeta, type EconomicEvent } from "@/lib/market-news";
import { instrumentsForEvent } from "@/lib/economic-events";
import { InstrumentFilterStyle } from "@/components/elite/InstrumentFilterStyle";
import { RecentSurpriseCard } from "@/components/elite/RecentSurpriseCard";
import { loadLastReleasedEvent, loadTodayEvents } from "@/lib/events-today";
import { getUserState } from "@/lib/ura-coin";
import { DashboardHero } from "@/components/elite/DashboardHero";

const BANNER_SLUGS = new Set([
  "diamond-hands", "o-sol-bull", "a-torre-flash", "a-temperanca-rr",
  "o-louco-yolo", "a-imperatriz-liquidez", "a-morte-cycle", "vegas-lambo",
  "crypto-monastery", "phoenix-rebirth", "dragon-gold",
  "neural-net", "cyber-samurai", "hologram-chart", "matrix-throne",
  "smoke-mirrors", "warrior-king-bull",
  "favela-3am", "saci-degen", "copacabana-cyber", "capoeira-bull-vs-bear",
  "leao-dourado", "tigre-neon", "aguia-mercado", "orca-apex",
  "ampulheta-bitcoin", "dojo-samurai",
]);

/** Código curto PT-BR do país pro header da agenda (mesma convenção de /elite/noticias). */
function countryCode(country: string): string {
  const map: Record<string, string> = { US: "EUA", EU: "UE", BR: "BR", UK: "UK", CN: "CN", JP: "JP", CA: "CA", AU: "AU", NZ: "NZ" };
  return map[country] ?? country;
}

function nyNowMinutes(): number {
  // Agora em BRT — eventos sao armazenados em BRT pra alinhar com Forex Factory.
  const s = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

/* ────────────────────────────────────────────
   Daily Steps — the 5 phases of a trading day (macro structure)
   ──────────────────────────────────────────── */

interface DayStep {
  id: "prep" | "call" | "trade" | "study" | "review";
  label: string;
  done: boolean;
}

function getDaySteps(): DayStep[] {
  return [
    { id: "prep",   label: "Prep",    done: false },
    { id: "call",   label: "Call",    done: false },
    { id: "trade",  label: "Trade",   done: false },
    { id: "study",  label: "Aula",    done: false },
    { id: "review", label: "Revisão", done: false },
  ];
}

/**
 * Estado do dia em BRT: posição na rotina + flag se a call está ao vivo agora.
 * Seg-Qui 10:30–12:30 BRT = call ao vivo. Fora disso a posição varia por hora.
 */
function getDayContext(): { currentIdx: number; isCallLive: boolean; brHour: number } {
  const now = new Date();
  const brTotalMins = ((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes();
  const brHour = Math.floor(brTotalMins / 60);
  const weekday = now.getUTCDay(); // 0=dom..6=sáb
  const isCallDay = weekday >= 1 && weekday <= 4; // seg-qui
  const isCallLive = isCallDay && brTotalMins >= 10 * 60 + 30 && brTotalMins < 12 * 60 + 30;

  let currentIdx = 0;
  if (brHour >= 10 && brHour < 13) currentIdx = 1; // call window
  else if (brHour >= 13 && brHour < 17) currentIdx = 2; // registrar trade
  else if (brHour >= 17 && brHour < 20) currentIdx = 3; // aula
  else if (brHour >= 20 && brHour < 24) currentIdx = 4; // revisão
  // 0-10 fica no Prep (default 0)
  return { currentIdx, isCallLive, brHour };
}

/**
 * Card primário contextual por horário + live state.
 * Responde à pergunta: "O que eu deveria fazer AGORA?".
 */
interface PrimaryAction {
  label: string;
  description: string;
  tag: string;
  icon: typeof Play;
  href: string;
  accent: string;
  isLive?: boolean;
  target?: string;
}

function getPrimaryAction(isElite: boolean, ctx: { isCallLive: boolean; brHour: number; weekday: number }): PrimaryAction {
  if (!isElite) {
    return {
      label: "Continuar aula",
      description: "Próxima aula do currículo Elite",
      tag: "Quando quiser",
      icon: Play,
      href: "/elite/aulas",
      accent: "#60A5FA",
    };
  }

  if (ctx.isCallLive) {
    return {
      label: "Call de Operação rolando",
      description: "AMD na sessão NY · análise ao vivo + entradas com o URA",
      tag: "Ao vivo agora",
      icon: Radio,
      href: "https://discord.com/channels/@me",
      accent: "#EF4444",
      isLive: true,
      target: "_blank",
    };
  }

  if (ctx.brHour < 9) {
    return {
      label: "Prep Sheet do dia",
      description: "Monte o plano antes do mercado abrir",
      tag: "Antes do open",
      icon: FileText,
      href: "/elite/diario",
      accent: "#FF5500",
    };
  }

  if (ctx.brHour < 10 || (ctx.brHour === 10 && ctx.weekday >= 1 && ctx.weekday <= 4)) {
    const isCallDay = ctx.weekday >= 1 && ctx.weekday <= 4;
    return {
      label: "Últimos ajustes no Prep",
      description: isCallDay ? "Call do URA começa 10:30 BRT" : "Hoje não tem call — olhe a agenda",
      tag: isCallDay ? "Call em breve" : "Pré-open",
      icon: FileText,
      href: "/elite/diario",
      accent: "#F59E0B",
    };
  }

  if (ctx.brHour < 13) {
    return {
      label: "Revise a call",
      description: "Anote insights da call enquanto tá fresco",
      tag: "Pós-call",
      icon: PenLine,
      href: "/elite/diario",
      accent: "#FF5500",
    };
  }

  if (ctx.brHour < 17) {
    return {
      label: "Registrar Trade",
      description: "Documente o que aconteceu na sessão",
      tag: "Sessão em curso",
      icon: PenLine,
      href: "/elite/diario",
      accent: "#FF5500",
    };
  }

  if (ctx.brHour < 20) {
    return {
      label: "Aula do Dia",
      description: "Continue o currículo Elite",
      tag: "Hora de estudar",
      icon: Play,
      href: "/elite/aulas",
      accent: "#FF5500",
    };
  }

  if (ctx.brHour < 23) {
    return {
      label: "Revisão do dia",
      description: "Treine decisões no modo prática",
      tag: "Fim do dia",
      icon: Brain,
      href: "/elite/pratica",
      accent: "#FF5500",
    };
  }

  return {
    label: "Descanse",
    description: "Amanhã o dia começa no Prep. Durma bem.",
    tag: "Madrugada",
    icon: Moon,
    href: "/elite/aulas",
    accent: "#6366F1",
  };
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
  const weekday = now.getUTCDay();
  const greeting = brHour < 12 ? "Bom dia" : brHour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const steps = getDaySteps();
  const { currentIdx, isCallLive } = getDayContext();
  const primaryAction = getPrimaryAction(isElite, { isCallLive, brHour, weekday });
  const completedSteps = steps.filter(s => s.done).length;
  const tierAccent = isElite ? "#FF5500" : "#60A5FA";

  const [curriculum, todayEvents, lastReleased, userState] = await Promise.all([
    getCurriculum(),
    isElite ? loadTodayEvents() : Promise.resolve([] as EconomicEvent[]),
    isElite ? loadLastReleasedEvent() : Promise.resolve(null),
    session ? getUserState(session.userId, 0).catch(() => null) : Promise.resolve(null),
  ]);
  const equippedBannerSlug = userState?.cosmetics.banner?.prize_slug ?? null;
  const hasBanner = !!equippedBannerSlug && BANNER_SLUGS.has(equippedBannerSlug);
  const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
  const stats = {
    lessonsCompleted: 0,
    totalLessons,
    streak: 0,
    daysRemaining: 180,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── banner 6:1 edge-to-edge como fundo (container matcha
           aspectRatio da imagem pra NUNCA cortar). Conteúdo sobreposto.
           Botão "ocultar banner" no canto pra quem não quiser a decoração. */}
      <DashboardHero bannerSlug={hasBanner ? equippedBannerSlug : null} tierAccent={tierAccent}>
          <div className="flex items-center gap-4">
            <Avatar
              src={avatar}
              name={displayName}
              size={60}
              className={hasBanner
                ? "rounded-xl ring-2 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                : "rounded-xl ring-1 ring-white/[0.08]"
              }
            />
            <div>
              <p className={`text-[11px] font-medium ${hasBanner ? "text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : "text-white/30"}`}>{greeting},</p>
              <h1 className={`text-[26px] md:text-[30px] font-bold text-white leading-tight tracking-tight ${hasBanner ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]" : ""}`}>{displayName}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: tierAccent }} />
                <span
                  className={`text-[9.5px] font-bold tracking-[0.25em] uppercase ${hasBanner ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : ""}`}
                  style={{ color: hasBanner ? tierAccent : tierAccent + "CC" }}
                >
                  {tierLabelText}
                </span>
                <span className={hasBanner ? "text-white/40" : "text-white/20"}>·</span>
                <span className={`text-[10px] ${hasBanner ? "text-white/65 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : "text-white/30"}`}>{dateStr}</span>
              </div>
            </div>
          </div>

          {/* Streak — reactive state */}
          {stats.streak > 0 ? (
            <div className="text-right">
              <div className="flex items-baseline gap-3 justify-end">
                <Flame className={`w-6 h-6 shrink-0 text-amber-400 ${hasBanner ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]" : ""}`} strokeWidth={1.5} />
                <p className={`text-[44px] md:text-[54px] font-bold text-white leading-none font-mono tabular-nums ${hasBanner ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]" : ""}`}><CountUp end={stats.streak} duration={1} /></p>
              </div>
              <p className={`text-[10px] text-amber-400/80 uppercase tracking-[0.22em] mt-1 ${hasBanner ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : ""}`}>dias seguidos</p>
              <p className={`text-[10px] mt-2 ${hasBanner ? "text-white/60 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : "text-white/25"}`}>
                <span className={`font-mono font-semibold tabular-nums ${hasBanner ? "text-white/75" : "text-white/35"}`}><CountUp end={stats.daysRemaining} duration={1.5} delay={0.3} /></span>
                {" dias na temporada"}
              </p>
            </div>
          ) : (
            <div className="text-right">
              <div className="flex items-baseline gap-2 justify-end">
                <Flame className={`w-4 h-4 shrink-0 ${hasBanner ? "text-white/35 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : "text-white/15"}`} strokeWidth={1.5} />
                <p className={`text-[22px] font-semibold leading-none ${hasBanner ? "text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]" : "text-white/50"}`}>Primeiro dia</p>
              </div>
              <p className={`text-[10px] mt-1.5 max-w-[200px] leading-relaxed ${hasBanner ? "text-white/55 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : "text-white/25"}`}>
                Comece a construir seu streak <span className={hasBanner ? "text-white/75" : "text-white/40"}>hoje</span>. São {stats.daysRemaining} dias na temporada.
              </p>
            </div>
          )}
      </DashboardHero>

      {/* ── Primary Action — context-aware (hour-of-day + live state) ── */}
      <Link
        href={primaryAction.href}
        target={primaryAction.target}
        rel={primaryAction.target === "_blank" ? "noreferrer" : undefined}
        className="interactive animate-in-up delay-1 group block relative overflow-hidden rounded-2xl bg-white/[0.02] hover:bg-white/[0.035] transition-all duration-300"
      >
        <div className="relative z-10 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <primaryAction.icon className="w-8 h-8 shrink-0" style={{ color: primaryAction.accent }} strokeWidth={1.5} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {primaryAction.isLive && (
                  <span className="relative flex w-1.5 h-1.5 shrink-0">
                    <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: primaryAction.accent, opacity: 0.5 }} />
                    <span className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryAction.accent }} />
                  </span>
                )}
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: primaryAction.accent + "CC" }}>
                  {primaryAction.tag}
                </p>
              </div>
              <h2 className="text-[18px] font-bold text-white leading-tight">{primaryAction.label}</h2>
              <p className="text-[12px] text-white/40 mt-0.5">{primaryAction.description}</p>
            </div>
          </div>
          {primaryAction.tag !== "Madrugada" && (
            <div className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-[12.5px] font-bold transition-colors shrink-0"
              style={{ borderColor: primaryAction.accent, color: primaryAction.accent }}>
              {primaryAction.isLive ? "Entrar" : "Ir agora"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </Link>

      {/* ── Day Progress — compact bar-segments (not expanded; hero carries the "now" focus) ── */}
      {isElite && (
      <div className="animate-in-up delay-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/30">Rotina do dia</h3>
          <span className="text-[9.5px] text-white/25 font-mono tabular-nums">{completedSteps}/{steps.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((step, i) => {
            const isCurrent = i === currentIdx;
            const isPast = i < currentIdx;
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full h-[3px] rounded-full transition-all"
                  style={{
                    backgroundColor: step.done || isPast ? "rgba(74, 222, 128, 0.45)" : isCurrent ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.06)",
                  }}
                />
                <p className={`text-[9.5px] leading-none ${isCurrent ? "text-white/70 font-semibold" : step.done || isPast ? "text-green-400/40" : "text-white/25"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* ── Quick access: 1 primary (Aulas) + 3 secondary links ── */}
      {(() => {
        const secondary = isElite ? [
          { href: "/elite/calls",   icon: Radio, label: "Calls ao vivo" },
          { href: "/elite/pratica", icon: Zap,   label: "Treino" },
          { href: "/elite/turma",   icon: Users, label: "Turma" },
        ] : [
          { href: "/elite/turma",       icon: Users,  label: "Turma" },
          { href: "/elite/conquistas",  icon: Target, label: "Conquistas" },
          { href: "/elite/desbloquear", icon: Zap,    label: "Destravar Elite" },
        ];
        const progressPct = stats.totalLessons > 0 ? (stats.lessonsCompleted / stats.totalLessons) * 100 : 0;

        return (
          <div className="grid lg:grid-cols-5 gap-3">
            {/* Primary: Aulas */}
            <Link href="/elite/aulas" className="interactive animate-in-up delay-5 group lg:col-span-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-colors flex items-center gap-4">
              <BookOpen className="w-6 h-6 text-white/60 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h3 className="text-[14px] font-bold text-white">Aulas</h3>
                  <span className="text-[11px] font-mono text-white/50 font-semibold tabular-nums">
                    <LiveStat type="lessons" />/{stats.totalLessons}
                  </span>
                </div>
                <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            {/* Secondary: 3 compact links */}
            {secondary.map((item, i) => (
              <Link key={item.href} href={item.href} className={`interactive animate-in-up delay-${6 + i} group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-colors flex items-center gap-3`}>
                <item.icon className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors shrink-0" strokeWidth={1.5} />
                <span className="text-[13px] font-semibold text-white/75 group-hover:text-white transition-colors flex-1">{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        );
      })()}

      {/* ── Curriculum + Turma activity side by side ── */}
      <div className="grid lg:grid-cols-2 gap-4 items-stretch">
        {/* Currículo — warmer empty state when lessons=0, else module progress list */}
        <div className="animate-in-up delay-3 rounded-2xl bg-white/[0.02] p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: tierAccent + "80" }} />
              <h3 className="text-[13px] font-bold text-white/85">Currículo</h3>
            </div>
            <Link href="/elite/aulas" className="text-[10px] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.lessonsCompleted === 0 && curriculum[0]?.lessons[0] ? (
            <div className="space-y-4">
              <Link
                href={`/elite/aulas/${curriculum[0].lessons[0].id}`}
                className="group relative block overflow-hidden rounded-xl bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: tierAccent + "18" }}>
                    <Play className="w-5 h-5" style={{ color: tierAccent }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/35 mb-1">Comece por aqui</p>
                    <h4 className="text-[15px] font-bold text-white leading-tight truncate">{curriculum[0].lessons[0].title}</h4>
                    <p className="text-[11px] text-white/45 mt-1 line-clamp-1">{curriculum[0].lessons[0].subtitle}</p>
                    <div className="flex items-center gap-3 mt-2.5 text-[10px] text-white/30">
                      <span className="font-mono">{curriculum[0].lessons[0].duration}</span>
                      <span className="text-white/15">·</span>
                      <span>{curriculum.length} módulos · {totalLessons} aulas no total</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                </div>
              </Link>

              {/* Roadmap: módulos futuros — dá visão do caminho inteiro sem deixar vazio */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30 mb-2.5 px-1">Caminho completo</p>
                <div className="space-y-1.5">
                  {curriculum.filter(m => m.lessons.length > 0).map((mod) => (
                    <div key={mod.id} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                      <span className="text-[10px] font-mono w-5 text-white/25">{mod.number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white/60 truncate leading-tight">{mod.title}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{mod.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-white/30 font-mono tabular-nums shrink-0">{mod.lessons.length} {mod.lessons.length === 1 ? "aula" : "aulas"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {curriculum.filter(m => m.lessons.length > 0).map((mod) => {
                const modPct = 0;
                return (
                  <div key={mod.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono w-5 text-white/30">{mod.number}</span>
                    <span className="text-[11px] text-white/50 flex-1 truncate">{mod.title}</span>
                    <div className="w-[120px] h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${modPct}%`, backgroundColor: "rgba(255,255,255,0.35)" }} />
                    </div>
                    <span className="text-[10px] text-white/30 font-mono w-8 text-right">0/{mod.lessons.length}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel: Agenda econômica (Elite) or Upgrade CTA (VIP) */}
        {isElite ? (
          <DashboardAgenda events={todayEvents} />
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

      {/* ── Último release (full-width, compacto) — só quando existe ── */}
      {isElite && lastReleased && <RecentSurpriseCard event={lastReleased} />}
    </div>
  );
}

/* ────────────────────────────────────────────
   Dashboard Agenda — mini-versão dos eventos de hoje
   ──────────────────────────────────────────── */

function DashboardAgenda({ events }: { events: EconomicEvent[] }) {
  const nowMins = nyNowMinutes();
  // Filtra só eventos que ainda não aconteceram (upcoming). Passados não agregam à decisão de "próximos passos" do dia.
  const upcoming = events.filter((e) => {
    const m = parseMins(e.time);
    return m !== null && m >= nowMins;
  });
  const nextEvent = upcoming[0];
  const nextEta = nextEvent ? etaFromNow(nextEvent.time, nowMins) : null;
  const pastCount = events.length - upcoming.length;

  return (
    <div className="animate-in-up delay-8 rounded-2xl bg-white/[0.02] p-6 flex flex-col h-full">
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
          {events.slice(0, 5).map((ev) => {
            const m = impactMeta(ev.impact);
            const mins = parseMins(ev.time);
            const isPast = mins !== null && mins < nowMins;
            const released = !!ev.actual;
            const instruments = instrumentsForEvent(ev.event, ev.country);
            const instrumentsAttr = instruments.join(" ");
            const instrumentsLabel = instruments.slice(0, 3).map(s => s.replace(/^\$/, "")).join(" · ");
            return (
              <div
                key={ev.id}
                data-filterable-event
                data-instruments={instrumentsAttr}
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
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] text-white/80 truncate font-medium">{ev.event}</p>
                  {instrumentsLabel && (
                    <p className="text-[9px] text-white/30 font-mono uppercase tracking-[0.15em] mt-0.5">{instrumentsLabel}</p>
                  )}
                </div>
                {released && <span className="shrink-0 text-[9px] font-bold tracking-[0.18em] uppercase text-emerald-400/80">✓</span>}
              </div>
            );
          })}
          {events.length > 5 && (
            <Link href="/elite/noticias" className="flex items-center justify-center gap-1.5 px-2 py-2 mt-1 rounded-lg text-[10.5px] text-white/35 hover:text-white/70 hover:bg-white/[0.02] transition-colors">
              + {events.length - 5} eventos hoje
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/25 mt-auto pt-3 border-t border-white/[0.04]">
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
