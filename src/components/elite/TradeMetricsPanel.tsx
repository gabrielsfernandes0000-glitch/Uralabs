"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp, TrendingDown, Target, AlertTriangle, Zap, Award,
  BarChart3, Activity, Flame, Download, ChevronDown,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import {
  computeOverview, computeSetupBreakdown, computeMistakeImpact,
  computeEquityCurve, computeDayOfWeek, filterRecent,
  computeDisciplineStreak, computeHourOfDay,
} from "@/lib/trade-metrics";
import { tradesToCsv, downloadCsv } from "@/lib/trade-export";
import { TradeCalendar } from "./TradeCalendar";
import { WeeklyReviewCard } from "./WeeklyReview";
import { GoalsStrip } from "./GoalsStrip";
import { HourOfDayPanel } from "./HourOfDayPanel";

type Window = 7 | 30 | 90 | 0;

/**
 * Performance panel — modelo narrativo vertical.
 *
 * Fluxo:
 *  1. Hero KPIs (R do dia + R da semana + expectancy + streak)
 *  2. Goals strip (barra fina)
 *  3. Weekly review contextual
 *  4. Calendar mensal
 *  5. Sections colapsáveis com stats detalhados
 *
 * Cada section foca em 1 pergunta pro trader responder.
 */
export function TradeMetricsPanel() {
  const { progress } = useProgress();
  const [window, setWindow] = useState<Window>(30);

  const allTrades = progress?.trades ?? [];
  const trades = window === 0 ? allTrades : filterRecent(allTrades, window);

  const todayBR = useMemo(() => {
    const d = new Date();
    const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return br.toISOString().split("T")[0];
  }, []);

  const todayOverview = useMemo(() => {
    const todayTrades = allTrades.filter((t) => t.date === todayBR);
    return computeOverview(todayTrades);
  }, [allTrades, todayBR]);

  const overview = useMemo(() => computeOverview(trades), [trades]);
  const setups = useMemo(() => computeSetupBreakdown(trades), [trades]);
  const mistakes = useMemo(() => computeMistakeImpact(trades), [trades]);
  const equity = useMemo(() => computeEquityCurve(trades), [trades]);
  const dow = useMemo(() => computeDayOfWeek(trades), [trades]);
  const hod = useMemo(() => computeHourOfDay(trades), [trades]);
  const discStreak = useMemo(() => computeDisciplineStreak(allTrades), [allTrades]);

  const handleExport = () => {
    const csv = tradesToCsv(trades);
    const today = new Date().toISOString().split("T")[0];
    const windowLabel = window === 0 ? "tudo" : `${window}d`;
    downloadCsv(`ura-trades-${windowLabel}-${today}.csv`, csv);
  };

  if (allTrades.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-10 text-center">
        <BarChart3 className="w-10 h-10 text-white/15 mx-auto mb-3" />
        <p className="text-[14px] font-semibold text-white/60 mb-1">Nenhum dado ainda</p>
        <p className="text-[11.5px] text-white/35 max-w-md mx-auto">
          Registre alguns trades na jornada <span className="text-white/60 font-semibold">Durante</span> pra ver estatísticas, padrões e evolução.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Hero KPIs — o que importa agora */}
      <div data-tour="hero-kpis">
        <HeroKPIs
          todayR={todayOverview.totalR}
          todayTrades={todayOverview.total}
          windowR={overview.totalR}
          expectancy={overview.expectancy}
          discStreak={discStreak}
        />
      </div>

      {/* 2. Goals strip */}
      <div data-tour="goals-strip">
        <GoalsStrip />
      </div>

      {/* 3. Weekly review contextual */}
      <WeeklyReviewCard />

      {/* 4. Calendar mensal */}
      <div data-tour="trade-calendar">
        <TradeCalendar />
      </div>

      {/* 5. Janela + export */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-white/[0.04]">
        <h3 className="text-[14px] font-semibold text-white tracking-tight">Aprofundar</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-white transition-colors"
            title="Baixar CSV dos trades no período selecionado"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
          <div className="inline-flex rounded-md border border-white/[0.06] p-0.5 bg-white/[0.02]">
            {([
              { v: 7, label: "7d" },
              { v: 30, label: "30d" },
              { v: 90, label: "90d" },
              { v: 0, label: "Tudo" },
            ] as { v: Window; label: string }[]).map((w) => (
              <button
                key={w.v}
                onClick={() => setWindow(w.v)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  window === w.v ? "bg-white/[0.08] text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 text-center">
          <p className="text-[12px] text-white/40">Nenhum trade nesse período.</p>
        </div>
      ) : (
        <div data-tour="stats-sections" className="space-y-5">
          {/* 6. "O que está funcionando e o que está drenando" */}
          <Section title="O que está funcionando e o que está drenando" defaultOpen>
            <EquityCurve points={equity} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
              <SetupBreakdownPanel setups={setups} />
              <MistakePanel mistakes={mistakes} />
            </div>
          </Section>

          {/* 7. Padrões temporais */}
          <Section title="Quando você opera melhor" defaultOpen={false}>
            <div className="space-y-3">
              <DayOfWeekPanel dow={dow} />
              <HourOfDayPanel hod={hod} />
            </div>
          </Section>

          {/* 8. KPIs completos + extremos */}
          <Section title="Stats completos" defaultOpen={false}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
              <KPI
                label="Total R"
                value={`${overview.totalR > 0 ? "+" : ""}${overview.totalR.toFixed(2)}`}
                unit="R"
                color={overview.totalR > 0 ? "#10B981" : overview.totalR < 0 ? "#EF4444" : undefined}
                Icon={TrendingUp}
              />
              <KPI
                label="Expectancy"
                value={`${overview.expectancy > 0 ? "+" : ""}${overview.expectancy.toFixed(2)}`}
                unit="R/trade"
                color={overview.expectancy > 0 ? "#10B981" : overview.expectancy < 0 ? "#EF4444" : undefined}
                hint="R esperado por trade"
                Icon={Zap}
              />
              <KPI
                label="Win rate"
                value={overview.winRate.toFixed(1)}
                unit="%"
                hint={`${overview.wins}W · ${overview.losses}L · ${overview.bes}BE`}
                Icon={Target}
              />
              <KPI
                label="Profit Factor"
                value={overview.profitFactor.toFixed(2)}
                hint=">1 = lucrativo"
                color={overview.profitFactor > 1.5 ? "#10B981" : overview.profitFactor < 1 ? "#EF4444" : undefined}
                Icon={Activity}
              />
              <KPI
                label="Max DD"
                value={`-${overview.maxDrawdown.toFixed(2)}`}
                unit="R"
                color="#EF4444"
                hint="peak-to-trough"
                Icon={TrendingDown}
              />
              <KPI
                label="Disciplina"
                value={overview.disciplineRate.toString()}
                unit="%"
                hint="seguiu plano, zero mistake"
                color={overview.disciplineRate >= 70 ? "#10B981" : overview.disciplineRate < 40 ? "#EF4444" : undefined}
                Icon={Award}
              />
            </div>
            <ExtraStatsPanel overview={overview} />
          </Section>
        </div>
      )}
    </div>
  );
}

/* ──────────────── Subcomponents ──────────────── */

function HeroKPIs({
  todayR, todayTrades, windowR, expectancy, discStreak,
}: {
  todayR: number;
  todayTrades: number;
  windowR: number;
  expectancy: number;
  discStreak: { current: number; best: number };
}) {
  const todayColor = todayR > 0 ? "#10B981" : todayR < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";
  const windowColor = windowR > 0 ? "#10B981" : windowR < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";
  const expColor = expectancy > 0 ? "#10B981" : expectancy < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <HeroCard
        label="Hoje"
        value={`${todayR > 0 ? "+" : ""}${todayR.toFixed(2)}`}
        unit="R"
        color={todayColor}
        hint={todayTrades > 0 ? `${todayTrades} trade${todayTrades > 1 ? "s" : ""}` : "sem trades"}
      />
      <HeroCard
        label="Período"
        value={`${windowR > 0 ? "+" : ""}${windowR.toFixed(2)}`}
        unit="R"
        color={windowColor}
        hint="acumulado na janela"
      />
      <HeroCard
        label="Expectancy"
        value={`${expectancy > 0 ? "+" : ""}${expectancy.toFixed(2)}`}
        unit="R/trade"
        color={expColor}
        hint="R esperado por trade"
      />
      <HeroCard
        label="Streak disciplina"
        value={String(discStreak.current)}
        unit={discStreak.current === 1 ? "dia" : "dias"}
        color={discStreak.current >= 3 ? "#F59E0B" : "rgba(255,255,255,0.75)"}
        hint={`melhor: ${discStreak.best}`}
        icon={<Flame className="w-3 h-3 text-amber-400/80" strokeWidth={2.2} />}
      />
    </div>
  );
}

function HeroCard({
  label, value, unit, color, hint, icon,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] font-bold text-white/45">{label}</span>
      </div>
      <p className="text-[22px] sm:text-[26px] font-bold leading-none font-mono tabular-nums" style={{ color }}>
        {value}
        {unit && <span className="text-[11px] text-white/40 font-semibold ml-1">{unit}</span>}
      </p>
      {hint && <p className="text-[10.5px] text-white/35 mt-1.5 leading-tight">{hint}</p>}
    </div>
  );
}

function Section({
  title, defaultOpen, children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-2 group"
      >
        <h3 className="text-[14px] font-semibold text-white tracking-tight text-left">{title}</h3>
        <ChevronDown className={`w-3.5 h-3.5 text-white/35 transition-transform group-hover:text-white/70 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function KPI({
  label, value, unit, hint, color, Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  color?: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  const accent = color ?? "rgba(255,255,255,0.85)";
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3" style={{ color: accent + (color ? "99" : "") }} />
        <span className="text-[9.5px] font-bold text-white/45">{label}</span>
      </div>
      <p className="text-[20px] font-bold leading-none font-mono tabular-nums" style={{ color: accent }}>
        {value}
        {unit && <span className="text-[11px] text-white/40 font-semibold ml-0.5">{unit}</span>}
      </p>
      {hint && <p className="text-[9.5px] text-white/35 mt-1.5 leading-tight">{hint}</p>}
    </div>
  );
}

function EquityCurve({ points }: { points: { tradeIdx: number; cumulativeR: number }[] }) {
  if (points.length < 2) return null;

  const width = 800;
  const height = 160;
  const pad = 20;
  const max = Math.max(...points.map((p) => p.cumulativeR), 0);
  const min = Math.min(...points.map((p) => p.cumulativeR), 0);
  const range = Math.max(max - min, 0.5);
  const stepX = (width - pad * 2) / Math.max(points.length - 1, 1);
  const y = (v: number) => pad + ((max - v) / range) * (height - pad * 2);
  const zeroY = y(0);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${y(p.cumulativeR)}`)
    .join(" ");
  const area = `${path} L ${pad + (points.length - 1) * stepX} ${zeroY} L ${pad} ${zeroY} Z`;
  const final = points[points.length - 1].cumulativeR;
  const color = final > 0 ? "#10B981" : final < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[12px] font-semibold text-white/80">Equity curve</h4>
        <span className="text-[10.5px] text-white/35 font-mono tabular-nums">
          {points.length} trades · final <span style={{ color }} className="font-bold">{final > 0 ? "+" : ""}{final.toFixed(2)}R</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[140px]" preserveAspectRatio="none">
        <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" />
        <path d={area} fill={`${color}12`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={pad + i * stepX} cy={y(p.cumulativeR)} r="2" fill={color} opacity="0.6" />
        ))}
      </svg>
    </div>
  );
}

function SetupBreakdownPanel({ setups }: { setups: ReturnType<typeof computeSetupBreakdown> }) {
  if (setups.length === 0) return null;

  const maxR = Math.max(...setups.map((s) => Math.abs(s.totalR)), 0.1);

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <h4 className="text-[12px] font-semibold text-white/80 mb-3">Performance por setup</h4>
      <div className="space-y-2.5">
        {setups.map((s) => {
          const pct = Math.abs(s.totalR) / maxR;
          const color = s.totalR > 0 ? "#10B981" : s.totalR < 0 ? "#EF4444" : "rgba(255,255,255,0.4)";
          return (
            <div key={s.setupId}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-[12px] font-semibold text-white/85 truncate">{s.setupName}</p>
                  <span className="text-[10px] font-mono text-white/35">{s.trades}x</span>
                </div>
                <div className="flex items-center gap-3 text-[10.5px] font-mono tabular-nums shrink-0">
                  <span className="text-white/45">{s.winRate.toFixed(0)}% WR</span>
                  <span className="font-bold" style={{ color }}>
                    {s.totalR > 0 ? "+" : ""}{s.totalR.toFixed(2)}R
                  </span>
                </div>
              </div>
              <div className="h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct * 100}%`, backgroundColor: color + "CC" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MistakePanel({ mistakes }: { mistakes: ReturnType<typeof computeMistakeImpact> }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80" />
        <h4 className="text-[12px] font-semibold text-white/80">Custo por erro</h4>
      </div>
      {mistakes.length === 0 ? (
        <p className="text-[11.5px] text-white/35 py-4 text-center">Nenhum erro tagueado — disciplina limpa.</p>
      ) : (
        <div className="space-y-2">
          {mistakes.slice(0, 6).map((m) => {
            const severityColor = m.severity === 3 ? "#EF4444" : m.severity === 2 ? "#F59E0B" : "#94A3B8";
            const rColor = m.rLost < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";
            return (
              <div key={m.tagId} className="flex items-center gap-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: severityColor }} />
                <span className="text-[12px] text-white/80 font-medium min-w-0 flex-1 truncate">{m.tagName}</span>
                <span className="text-[10px] font-mono text-white/35 shrink-0">{m.count}×</span>
                <span className="text-[11.5px] font-bold font-mono tabular-nums shrink-0" style={{ color: rColor }}>
                  {m.rLost > 0 ? "+" : ""}{m.rLost.toFixed(2)}R
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DayOfWeekPanel({ dow }: { dow: ReturnType<typeof computeDayOfWeek> }) {
  const maxAbsR = Math.max(...dow.map((d) => Math.abs(d.totalR)), 0.1);

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <h4 className="text-[12px] font-semibold text-white/80 mb-3">Por dia da semana</h4>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 items-end" style={{ minHeight: 120 }}>
        {dow.map((d) => {
          const pct = maxAbsR > 0 ? Math.abs(d.totalR) / maxAbsR : 0;
          const isPositive = d.totalR > 0;
          const isEmpty = d.trades === 0;
          const color = isPositive ? "#10B981" : d.totalR < 0 ? "#EF4444" : "rgba(255,255,255,0.25)";
          const barHeight = isEmpty ? 4 : Math.max(pct * 80, 4);
          return (
            <div key={d.day} className="flex flex-col items-center gap-1.5 min-w-0">
              <div className="flex-1 flex items-end w-full">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: isEmpty ? "rgba(255,255,255,0.05)" : color + "BB",
                  }}
                />
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="text-[9px] sm:text-[10px] font-semibold text-white/70 truncate">{d.day}</p>
                <p className="text-[8.5px] sm:text-[9px] font-mono text-white/30 tabular-nums leading-tight truncate">
                  {isEmpty ? "—" : `${d.totalR > 0 ? "+" : ""}${d.totalR.toFixed(1)}R`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExtraStatsPanel({ overview }: { overview: ReturnType<typeof computeOverview> }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <h4 className="text-[12px] font-semibold text-white/80 mb-3">Extremos</h4>
      <div className="space-y-2.5 text-[11.5px]">
        <Row label="Melhor trade" value={`${overview.bestTrade > 0 ? "+" : ""}${overview.bestTrade.toFixed(2)}R`} color="#10B981" />
        <Row label="Pior trade" value={`${overview.worstTrade.toFixed(2)}R`} color="#EF4444" />
        <Row label="Avg R por win" value={`+${overview.avgRWin.toFixed(2)}R`} color="#10B981" />
        <Row label="Avg R por loss" value={`${overview.avgRLoss.toFixed(2)}R`} color="#EF4444" />
        <Row label="Max win streak" value={`${overview.maxWinStreak}`} />
        <Row label="Max loss streak" value={`${overview.maxLossStreak}`} />
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/50">{label}</span>
      <span className="font-mono tabular-nums font-semibold" style={{ color: color ?? "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );
}
