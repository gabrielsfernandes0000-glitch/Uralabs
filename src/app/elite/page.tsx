import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { ArrowRight, FileText, Brain, Radio, PenLine, Play, CalendarClock, Moon, Flame } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/elite/Avatar";
import { impactMeta, type EconomicEvent } from "@/lib/market-news";
import { instrumentsForEvent } from "@/lib/economic-events";
import { RecentSurpriseCard } from "@/components/elite/RecentSurpriseCard";
import { loadLastReleasedEvent, loadTodayEvents } from "@/lib/events-today";
import { getUserState } from "@/lib/ura-coin";
import { DashboardHero } from "@/components/elite/DashboardHero";
import { PriceTickerTape } from "@/components/elite/PriceTickerTape";
import { NextHighImpactCard } from "@/components/elite/NextHighImpactCard";
import { DashboardMetrics } from "@/components/elite/DashboardMetrics";

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
  const map: Record<string, string> = {
    US: "EUA", EU: "UE", BR: "BR",
    UK: "UK", GB: "UK", // ISO 3166 usa GB; providers mistura. Normaliza.
    CN: "CN", JP: "JP", CA: "CA", AU: "AU", NZ: "NZ",
    DE: "ALE", FR: "FRA", ES: "ESP", IT: "ITA", CH: "SUI", TR: "TUR",
  };
  return map[country] ?? country;
}

/** Normaliza country pra agrupamento — GB e UK viram a mesma coisa. */
function normalizeCountry(country: string): string {
  if (country === "GB") return "UK";
  return country;
}

function nyNowMinutes(): number {
  // Agora em BRT — eventos sao armazenados em BRT pra alinhar com Forex Factory.
  const s = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

/** `loadTodayEvents` traz janela de 2 dias BRT pra cobrir drift do ingestor.
 *  A DashboardAgenda conceitualmente mostra "hoje BRT" — filtra pelo dia BRT
 *  atual (ou eventos legados sem `date`). */
function filterTodayBRT(events: EconomicEvent[]): EconomicEvent[] {
  const todayBRT = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return events.filter((e) => !e.date || e.date === todayBRT);
}

/**
 * Estado do dia em BRT: flag se a call está ao vivo agora + hora atual.
 * Seg-Qui 10:30–12:30 BRT = call ao vivo.
 */
function getDayContext(): { isCallLive: boolean; brHour: number } {
  const now = new Date();
  const brTotalMins = ((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes();
  const brHour = Math.floor(brTotalMins / 60);
  const weekday = now.getUTCDay(); // 0=dom..6=sáb
  const isCallDay = weekday >= 1 && weekday <= 4; // seg-qui
  const isCallLive = isCallDay && brTotalMins >= 10 * 60 + 30 && brTotalMins < 12 * 60 + 30;
  return { isCallLive, brHour };
}

/* ────────────────────────────────────────────
   Trading Day Bar — fases da sessão NY em BRT
   Killzone = janela de maior edge. Lunch = evitar.
   ──────────────────────────────────────────── */

type SessionPhase = {
  id: string;
  label: string;
  range: string;
  startMin: number;
  endMin: number;
  emphasis?: "killzone" | "avoid";
};

const SESSIONS: SessionPhase[] = [
  { id: "pre",      label: "Pré-open",   range: "até 10:30", startMin: 0,         endMin: 10 * 60 + 30 },
  { id: "killzone", label: "Killzone",   range: "10:30–12:00", startMin: 10 * 60 + 30, endMin: 12 * 60, emphasis: "killzone" },
  { id: "lunch",    label: "Lunch",      range: "12:00–13:30", startMin: 12 * 60,      endMin: 13 * 60 + 30, emphasis: "avoid" },
  { id: "pm",       label: "Sessão PM",  range: "13:30–16:30", startMin: 13 * 60 + 30, endMin: 16 * 60 + 30 },
  { id: "close",    label: "After",      range: "16:30+",      startMin: 16 * 60 + 30, endMin: 24 * 60 },
];

function formatEta(mins: number): string {
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function TradingDayBar() {
  const now = new Date();
  const brTotalMins = ((now.getUTCHours() - 3 + 24) % 24) * 60 + now.getUTCMinutes();
  const currentIdx = SESSIONS.findIndex((s) => brTotalMins >= s.startMin && brTotalMins < s.endMin);
  const current = currentIdx >= 0 ? SESSIONS[currentIdx] : SESSIONS[SESSIONS.length - 1];
  const next = currentIdx >= 0 && currentIdx < SESSIONS.length - 1 ? SESSIONS[currentIdx + 1] : null;
  const minsLeft = current.endMin - brTotalMins;

  const accent = current.emphasis === "killzone" ? "#FF5500" : current.emphasis === "avoid" ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.55)";
  const statusText = current.emphasis === "killzone"
    ? `Killzone ativa · termina em ${formatEta(minsLeft)}`
    : current.emphasis === "avoid"
    ? `Lunch chop · ${next ? `${next.label} em ${formatEta(minsLeft)}` : "evitar setups"}`
    : next
    ? `${current.label} · ${next.label} em ${formatEta(minsLeft)}`
    : `${current.label}`;

  return (
    <div className="animate-in-up delay-1">
      <div className="flex items-center justify-end mb-2 px-1">
        <span className="text-[10px] font-mono tabular-nums" style={{ color: accent }}>{statusText}</span>
      </div>
      <div className="flex items-center gap-2">
        {SESSIONS.map((s, i) => {
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx || (currentIdx === -1 && s.endMin <= brTotalMins);
          const segColor = isCurrent
            ? s.emphasis === "killzone" ? "#FF5500" : s.emphasis === "avoid" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)"
            : isPast
            ? "rgba(255,255,255,0.18)"
            : "rgba(255,255,255,0.08)";
          const labelColor = isCurrent
            ? s.emphasis === "killzone" ? "text-brand-500" : "text-white"
            : isPast
            ? "text-white/45"
            : "text-white/55";
          // Progresso dentro do segmento atual (0..1) — barra "preenche" enquanto o tempo passa.
          const segProgress = isCurrent
            ? Math.min(1, Math.max(0, (brTotalMins - s.startMin) / (s.endMin - s.startMin)))
            : isPast ? 1 : 0;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div
                className="relative w-full h-[3px] rounded-full overflow-hidden"
                style={{ backgroundColor: isCurrent ? "rgba(255,255,255,0.06)" : segColor }}
              >
                {isCurrent && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                    style={{
                      width: `${segProgress * 100}%`,
                      backgroundColor: segColor,
                      boxShadow: s.emphasis === "killzone" ? `0 0 12px ${segColor}aa` : undefined,
                    }}
                  />
                )}
              </div>
              <div className={`flex items-baseline gap-1.5 leading-none truncate ${labelColor}`}>
                <span className={`text-[10.5px] tracking-tight ${isCurrent ? "font-bold" : "font-medium"}`}>{s.label}</span>
                <span className="text-[9px] font-mono tabular-nums text-white/35 hidden md:inline">{s.range}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  const { isCallLive } = getDayContext();
  const primaryAction = getPrimaryAction(isElite, { isCallLive, brHour, weekday });
  const tierAccent = isElite ? "#FF5500" : "#60A5FA";

  const [todayEvents, lastReleased, userState] = await Promise.all([
    isElite ? loadTodayEvents() : Promise.resolve([] as EconomicEvent[]),
    isElite ? loadLastReleasedEvent() : Promise.resolve(null),
    session ? getUserState(session.userId, 0).catch(() => null) : Promise.resolve(null),
  ]);
  const equippedBannerSlug = userState?.cosmetics.banner?.prize_slug ?? null;
  const hasBanner = !!equippedBannerSlug && BANNER_SLUGS.has(equippedBannerSlug);

  return (
    <div className="space-y-5">
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
                  className={`text-[11px] font-medium ${hasBanner ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : ""}`}
                  style={{ color: tierAccent }}
                >
                  {tierLabelText}
                </span>
                <span className={hasBanner ? "text-white/40" : "text-white/20"}>·</span>
                <span className={`text-[10px] ${hasBanner ? "text-white/65 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" : "text-white/30"}`}>{dateStr}</span>
              </div>
            </div>
          </div>
      </DashboardHero>

      {/* ── Ticker tape — server-rendered, carrega junto com o resto da página
           (era widget TradingView externo, demorava 1-2s extra pra montar) ── */}
      <div className="animate-in-up delay-1">
        <PriceTickerTape
          tickers={[
            { symbol: "NQ",   label: "Nasdaq" },
            { symbol: "BTC",  label: "BTC" },
            { symbol: "ETH",  label: "ETH" },
            { symbol: "SOL",  label: "SOL" },
            { symbol: "DXY",  label: "DXY" },
            { symbol: "GOLD", label: "Ouro" },
          ]}
        />
      </div>

      {/* ── Trading day bar — sessão NY em BRT (Elite only) ── */}
      {isElite && <TradingDayBar />}

      {/* ── Primary Action (compact 1-row) + Market Pulse ──
           Card contextual: mostra "o que fazer agora" com accent stripe
           lateral pra reforçar hierarquia (este é o CTA principal da home). */}
      <Link
        href={primaryAction.href}
        target={primaryAction.target}
        rel={primaryAction.target === "_blank" ? "noreferrer" : undefined}
        className="interactive animate-in-up delay-2 group block relative overflow-hidden rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
      >
        {/* Accent stripe lateral — diferencia visualmente como ação primária */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: primaryAction.accent }}
        />
        {/* Glow sutil atrás do ícone que reforça o accent sem chamar excesso de atenção */}
        <div
          className="absolute left-0 top-0 w-[180px] h-full pointer-events-none opacity-40"
          style={{ background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${primaryAction.accent}22, transparent 70%)` }}
        />
        <div className="relative z-10 pl-5 pr-4 py-3.5 md:py-4 flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <primaryAction.icon className="w-5 h-5 shrink-0" style={{ color: primaryAction.accent }} strokeWidth={1.8} />
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              {primaryAction.isLive && (
                <span className="relative flex w-1.5 h-1.5 shrink-0">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: primaryAction.accent, opacity: 0.5 }} />
                  <span className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryAction.accent }} />
                </span>
              )}
              <span className="text-[10.5px] font-bold tracking-wider uppercase shrink-0" style={{ color: primaryAction.accent }}>
                {primaryAction.tag}
              </span>
              <span className="text-white/15 text-[10px] shrink-0 hidden sm:inline">·</span>
              <h2 className="text-[14px] font-bold text-white leading-none truncate">{primaryAction.label}</h2>
              <span className="text-[11.5px] text-white/40 leading-none truncate hidden lg:inline">— {primaryAction.description}</span>
            </div>
          </div>
          {primaryAction.tag !== "Madrugada" && (
            <div className="flex items-center gap-1 text-[11.5px] font-bold transition-transform shrink-0 group-hover:translate-x-0.5"
              style={{ color: primaryAction.accent }}>
              {primaryAction.isLive ? "Entrar" : "Ir"}
              <ArrowRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </Link>

      {/* ── Market Pulse: Próximo evento + Último release (par conceitual) ── */}
      {isElite && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in-up delay-3">
          <NextHighImpactCard events={todayEvents} />
          {lastReleased ? (
            <RecentSurpriseCard event={lastReleased} />
          ) : (
            <div className="rounded-xl surface-card p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-3.5 h-3.5 text-white/30" />
                <h3 className="text-[12px] font-semibold text-white/85">Último release</h3>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[12px] text-white/35 leading-relaxed">
                  Nenhum release de impacto nas últimas 24h.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Métricas pessoais: P&L + Corretora + Metas (quando existem) ── */}
      {isElite ? (
        <DashboardMetrics />
      ) : (
        <Link href="/elite/desbloquear" className="interactive animate-in-up delay-3 group relative overflow-hidden rounded-xl border border-brand-500/20 bg-[#131316] p-5 hover:border-brand-500/40 transition-all block">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-brand-500/40" />
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

      {/* ── Agenda do dia (Elite, compact) ── */}
      {isElite && (
        <div className="animate-in-up delay-5">
          <DashboardAgenda events={filterTodayBRT(todayEvents)} />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Dashboard Agenda — mini-versão dos eventos de hoje
   ──────────────────────────────────────────── */

function DashboardAgenda({ events }: { events: EconomicEvent[] }) {
  const nowMins = nyNowMinutes();
  const upcoming = events.filter((e) => {
    const m = parseMins(e.time);
    return m !== null && m >= nowMins;
  });
  const nextEvent = upcoming[0];
  const nextEta = nextEvent ? etaFromNow(nextEvent.time, nowMins) : null;
  const nextEventImpact = nextEvent?.impact === "high" ? "high" : nextEvent?.impact === "medium" ? "medium" : "low";
  const nextAccent = nextEventImpact === "high" ? "#EF4444" : nextEventImpact === "medium" ? "#F59E0B" : "#6B7280";

  const groups = events.length > 0 ? groupDashboardEvents(events) : [];
  const visibleGroups = groups.slice(0, 5);
  const hiddenEventCount = groups.slice(5).reduce((s, g) => s + g.items.length, 0);
  const nextGroupIdx = visibleGroups.findIndex((g) => {
    const m = parseMins(g.time);
    return m !== null && m >= nowMins;
  });

  return (
    <div className="dashboard-agenda-scope relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-white/[0.05] p-6 flex flex-col">
      {nextEvent && (
        <div
          className="absolute top-0 right-0 w-[360px] h-[260px] pointer-events-none opacity-60"
          style={{ background: `radial-gradient(ellipse 50% 60% at 100% 0%, ${nextAccent}14, transparent 70%)` }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-white/60" strokeWidth={1.8} />
            <h3 className="text-[15px] font-bold text-white tracking-tight">Agenda de hoje</h3>
          </div>
          {nextEta ? (
            <p className="text-[11.5px] text-white/50 leading-relaxed">
              Próximo release <span className="font-mono tabular-nums font-semibold" style={{ color: nextAccent }}>{nextEta}</span>
              <span className="text-white/20 mx-1.5">·</span>
              <span className="text-white/55">{nextEvent?.event}</span>
            </p>
          ) : groups.length > 0 ? (
            <p className="text-[11.5px] text-white/45">Todos os releases do dia já saíram · revise o impacto</p>
          ) : (
            <p className="text-[11.5px] text-white/45">Mercado calmo — nada programado</p>
          )}
        </div>
        <Link
          href="/elite/noticias"
          className="interactive-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-[11px] text-white/60 hover:text-white hover:border-white/[0.18] transition-colors shrink-0"
        >
          Agenda completa <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="relative z-10 py-6 text-center">
          <p className="text-[13px] font-semibold text-white/70 mb-1">Mercado calmo hoje</p>
          <p className="text-[11px] text-white/35 leading-relaxed max-w-xs mx-auto">
            Sem evento de alto/médio impacto. Dia pra operar só gráfico.
          </p>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Timeline vertical */}
          <div className="relative">
            <div className="absolute left-[58px] top-3 bottom-3 w-px bg-white/[0.06]" />
            <div className="space-y-0">
              {visibleGroups.map((g, i) => (
                <AgendaRow key={g.key} group={g} nowMins={nowMins} isNext={i === nextGroupIdx} />
              ))}
            </div>
          </div>
          {hiddenEventCount > 0 && (
            <Link
              href="/elite/noticias"
              className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] text-white/45 hover:text-white/85 hover:bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.1] transition-colors"
            >
              + {hiddenEventCount} eventos hoje
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
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

/**
 * Agrupa eventos que ocorrem no mesmo horário + país (após normalização
 * GB→UK). ONS UK libera 4-5 séries juntas às 07:00 UTC, não faz sentido
 * listar cada uma como linha separada.
 */
type AgendaGroup = {
  key: string;
  time: string;
  country: string;
  highestImpact: "high" | "medium" | "low";
  items: EconomicEvent[];
  instruments: string[]; // união dos instruments de todos os items
};

function groupDashboardEvents(events: EconomicEvent[]): AgendaGroup[] {
  const map = new Map<string, AgendaGroup>();
  for (const ev of events) {
    const country = normalizeCountry(ev.country);
    const key = `${ev.time}__${country}`;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        time: ev.time,
        country,
        highestImpact: "low",
        items: [],
        instruments: [],
      };
      map.set(key, g);
    }
    g.items.push(ev);
    if (ev.impact === "high") g.highestImpact = "high";
    else if (ev.impact === "medium" && g.highestImpact !== "high") g.highestImpact = "medium";
    for (const ins of instrumentsForEvent(ev.event, ev.country)) {
      if (!g.instruments.includes(ins)) g.instruments.push(ins);
    }
  }
  return [...map.values()].sort((a, z) => {
    const am = parseMins(a.time) ?? 99999;
    const zm = parseMins(z.time) ?? 99999;
    return am - zm;
  });
}

function AgendaRow({ group, nowMins, isNext }: { group: AgendaGroup; nowMins: number; isNext: boolean }) {
  const m = impactMeta(group.highestImpact);
  const mins = parseMins(group.time);
  const isPast = mins !== null && mins < nowMins;
  const allReleased = group.items.every((e) => !!e.actual);
  const instrumentsAttr = group.instruments.join(" ");
  const instrumentsLabel = group.instruments.slice(0, 3).map((s) => s.replace(/^\$/, "")).join(" · ");
  const multi = group.items.length > 1;
  const isHigh = group.highestImpact === "high";

  return (
    <div
      data-filterable-event
      data-instruments={instrumentsAttr}
      className={`relative flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
        isNext ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
      } ${isPast && !isNext ? "opacity-40" : ""}`}
    >
      {isNext && (
        <div
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
          style={{ backgroundColor: m.dotBg }}
        />
      )}

      <div className="shrink-0 w-14 text-right pt-0.5">
        <p className={`text-[14px] font-bold font-mono tabular-nums leading-none ${isNext ? "text-white" : "text-white/85"}`}>
          {group.time || "—"}
        </p>
        <p className="text-[9px] text-white/35 font-mono mt-1">
          {countryCode(group.country)}
        </p>
      </div>

      <span
        className="relative shrink-0 w-2 h-2 rounded-full mt-[6px] z-10"
        style={{
          backgroundColor: m.dotBg,
          boxShadow: isHigh && !isPast ? `0 0 0 4px ${m.dotBg}28, 0 0 12px ${m.dotBg}55` : `0 0 0 3px #0e0e10`,
        }}
      >
        {isNext && isHigh && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: m.dotBg, opacity: 0.45 }}
          />
        )}
      </span>

      <div className="flex-1 min-w-0">
        {multi ? (
          <>
            <p className={`text-[12.5px] leading-tight ${isNext ? "font-semibold text-white" : "font-medium text-white/80"}`}>
              {group.items.length} releases simultâneos
            </p>
            <ul className="mt-1 space-y-0.5">
              {group.items.slice(0, 3).map((ev) => (
                <li key={ev.id} className="text-[11px] text-white/50 truncate">
                  · {ev.event}
                </li>
              ))}
              {group.items.length > 3 && (
                <li className="text-[10px] text-white/30 tabular-nums">
                  +{group.items.length - 3}
                </li>
              )}
            </ul>
          </>
        ) : (
          <>
            <p className={`text-[12.5px] truncate leading-tight ${isNext ? "font-semibold text-white" : "font-medium text-white/80"}`}>
              {group.items[0].event}
            </p>
            {instrumentsLabel && (
              <p className="text-[9.5px] text-white/35 font-mono mt-1">
                {instrumentsLabel}
              </p>
            )}
          </>
        )}
      </div>

      {isHigh && !isPast && (
        <span
          className="shrink-0 text-[11px] font-medium mt-1"
          style={{ color: m.dotBg }}
        >
          Alto
        </span>
      )}
      {allReleased && (
        <span className="shrink-0 text-[11px] text-[#22C55E] mt-1">
          ✓
        </span>
      )}
    </div>
  );
}
