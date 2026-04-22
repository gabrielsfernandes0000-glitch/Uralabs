"use client";

import { useMemo, useState } from "react";
import { Target, Plus, X, Check, Trash2, TrendingUp } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { evaluateGoal, activeGoals, currentWeekRange } from "@/lib/trade-metrics";
import type { Goal, TradeEntry } from "@/lib/progress";

/**
 * Metas semanais/mensais — defina objetivos de performance e acompanhe progresso.
 *
 * Métricas suportadas:
 *  - totalR            (min)  · ex: +5R/semana
 *  - winRate           (min)  · ex: ≥55%
 *  - expectancy        (min)  · ex: ≥0.5R/trade
 *  - disciplineRate    (min)  · ex: ≥80%
 *  - maxMistakes       (max)  · ex: ≤2 mistakes sev3
 *  - trades            (min)  · ex: ≥5 trades registrados (engajamento)
 */

const METRIC_OPTIONS: { id: Goal["metric"]; label: string; unit: string; defaultTarget: number; direction: Goal["direction"]; hint: string }[] = [
  { id: "totalR",         label: "Total R",                 unit: "R",       defaultTarget: 5,  direction: "min", hint: "Soma de R acumulada no período" },
  { id: "winRate",        label: "Win rate",                unit: "%",       defaultTarget: 55, direction: "min", hint: "% de wins sobre total de trades" },
  { id: "expectancy",     label: "Expectancy",              unit: "R/trade", defaultTarget: 0.5,direction: "min", hint: "R esperado por trade" },
  { id: "disciplineRate", label: "Disciplina",              unit: "%",       defaultTarget: 80, direction: "min", hint: "% trades com plano seguido + zero mistake" },
  { id: "maxMistakes",    label: "Limite de mistakes",      unit: "",        defaultTarget: 3,  direction: "max", hint: "Máximo de mistake tags no período" },
  { id: "trades",         label: "Trades registrados",      unit: "",        defaultTarget: 5,  direction: "min", hint: "Volume mínimo (disciplina de registro)" },
];

export function GoalsPanel() {
  const { progress, saveGoal, deleteGoal } = useProgress();
  const [adding, setAdding] = useState(false);

  const allGoals = progress?.goals ?? [];
  const active = useMemo(() => activeGoals(allGoals), [allGoals]);
  const trades = progress?.trades ?? [];

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-white/50" />
          <h4 className="text-[12px] font-bold text-white/75">Metas</h4>
          {active.length > 0 && (
            <span className="text-[10.5px] font-mono text-white/35">
              {active.filter((g) => evaluateGoal(g, trades).hit).length}/{active.length} batidas
            </span>
          )}
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/[0.08] hover:border-white/[0.18] text-[10.5px] font-semibold text-white/65 hover:text-white transition-colors"
        >
          {adding ? <><X className="w-3 h-3" /> Cancelar</> : <><Plus className="w-3 h-3" /> Nova meta</>}
        </button>
      </div>

      {adding && (
        <div className="mb-4">
          <GoalForm
            onCancel={() => setAdding(false)}
            onSave={async (goal) => {
              await saveGoal(goal);
              setAdding(false);
            }}
          />
        </div>
      )}

      {active.length === 0 && !adding && (
        <div className="py-6 text-center">
          <p className="text-[12px] text-white/60 mb-1">Sem metas ativas</p>
          <p className="text-[10.5px] text-white/35 max-w-xs mx-auto">
            Defina 1-2 metas por semana. Trader sem meta é casino, trader com meta é disciplina mensurável.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((g) => (
            <GoalRow key={g.id} goal={g} trades={trades} onDelete={() => deleteGoal(g.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalRow({ goal, trades, onDelete }: { goal: Goal; trades: TradeEntry[]; onDelete: () => void }) {
  const prog = evaluateGoal(goal, trades);
  const accent = prog.hit ? "#10B981" : prog.pct > 65 ? "#F59E0B" : "rgba(255,255,255,0.6)";
  const displayCurrent = `${prog.current > 0 && goal.direction === "min" ? "+" : ""}${prog.current}${prog.unit}`;
  const displayTarget = `${goal.direction === "min" ? "≥" : "≤"} ${goal.target}${prog.unit}`;

  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] group relative">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-[12.5px] font-bold text-white truncate">{prog.label}</p>
            <span
              className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: accent, backgroundColor: accent + "15" }}
            >
              {goal.period === "weekly" ? "Semana" : "Mês"}
            </span>
            {prog.hit && (
              <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-emerald-400">
                <Check className="w-2.5 h-2.5" /> Batida
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/35">
            {prog.periodTradesCount} trade{prog.periodTradesCount !== 1 ? "s" : ""} no período
          </p>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400"
          title="Remover meta"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[15px] font-bold font-mono tabular-nums" style={{ color: accent }}>
          {displayCurrent}
        </span>
        <span className="text-[10.5px] font-mono text-white/40">
          Meta: <span className="text-white/65 font-semibold">{displayTarget}</span>
        </span>
      </div>

      <div className="h-[4px] rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${prog.pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}

function GoalForm({ onCancel, onSave }: { onCancel: () => void; onSave: (g: Goal) => Promise<void> }) {
  const [metric, setMetric] = useState<Goal["metric"]>("totalR");
  const [target, setTarget] = useState<string>("5");
  const [period, setPeriod] = useState<Goal["period"]>("weekly");
  const [customLabel, setCustomLabel] = useState<string>("");

  const meta = METRIC_OPTIONS.find((m) => m.id === metric)!;

  // Auto-adjust default target on metric change
  const changeMetric = (id: Goal["metric"]) => {
    setMetric(id);
    const m = METRIC_OPTIONS.find((x) => x.id === id)!;
    setTarget(String(m.defaultTarget));
  };

  const submit = async () => {
    const targetN = parseFloat(target.replace(",", "."));
    if (!Number.isFinite(targetN) || targetN < 0) return;
    const [weekStart] = currentWeekRange();
    const today = new Date().toISOString().split("T")[0];
    const goal: Goal = {
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      period,
      startDate: period === "weekly" ? weekStart : today.slice(0, 8) + "01",
      metric,
      target: targetN,
      direction: meta.direction,
      label: customLabel.trim() || undefined,
    };
    await onSave(goal);
  };

  return (
    <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-3">
      <div>
        <p className="text-[10px] font-bold text-white/45 mb-1.5">Métrica</p>
        <div className="grid grid-cols-2 gap-1.5">
          {METRIC_OPTIONS.map((m) => {
            const active = metric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => changeMetric(m.id)}
                title={m.hint}
                className={`text-left px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-brand-500/60 bg-brand-500/[0.08] text-brand-400"
                    : "border-white/[0.06] text-white/50 hover:text-white/85 hover:border-white/[0.18]"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-white/35 mt-1.5">{meta.hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold text-white/45 mb-1.5">
            Alvo {meta.direction === "min" ? "(≥)" : "(≤)"}
          </p>
          <div className="flex items-center gap-1 rounded-md bg-white/[0.02] border border-white/[0.06] px-3 py-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-transparent text-[13px] font-mono tabular-nums text-white outline-none"
            />
            {meta.unit && <span className="text-[10.5px] font-mono text-white/40">{meta.unit}</span>}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/45 mb-1.5">Período</p>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setPeriod("weekly")}
              className={`py-1.5 rounded-md border text-[11px] font-semibold ${
                period === "weekly" ? "border-brand-500/55 bg-brand-500/[0.08] text-brand-400" : "border-white/[0.06] text-white/45 hover:text-white"
              }`}
            >Semana</button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`py-1.5 rounded-md border text-[11px] font-semibold ${
                period === "monthly" ? "border-brand-500/55 bg-brand-500/[0.08] text-brand-400" : "border-white/[0.06] text-white/45 hover:text-white"
              }`}
            >Mês</button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-white/45 mb-1.5">Rótulo (opcional)</p>
        <input
          type="text"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          placeholder="Ex: Aprovar FundingPips 50k"
          className="w-full px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-[12px] text-white/85 placeholder-white/25 focus:outline-none focus:border-white/[0.18]"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={submit}
          className="flex-1 py-2 rounded-md border border-brand-500/60 text-brand-500 text-[12px] font-bold hover:bg-brand-500/[0.06] transition-colors inline-flex items-center justify-center gap-1"
        >
          <TrendingUp className="w-3 h-3" /> Criar meta
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-md text-[11px] text-white/45 hover:text-white/80 transition-colors"
        >Cancelar</button>
      </div>
    </div>
  );
}
