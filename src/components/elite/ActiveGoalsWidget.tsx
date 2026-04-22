"use client";

import Link from "next/link";
import { Target, ArrowRight, Check } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { activeGoals, evaluateGoal } from "@/lib/trade-metrics";

/**
 * Widget compacto de metas ativas pro dashboard.
 * Só renderiza se houver metas ativas — empty state nenhum (dashboard não precisa recrutar).
 */
export function ActiveGoalsWidget() {
  const { progress } = useProgress();
  if (!progress) return null;

  const active = activeGoals(progress.goals ?? []);
  if (active.length === 0) return null;

  const trades = progress.trades ?? [];
  const evaluated = active.map((g) => evaluateGoal(g, trades));
  const hitCount = evaluated.filter((e) => e.hit).length;

  return (
    <Link
      href="/elite/diario?tab=stats"
      className="interactive group block rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-colors"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-white/50" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Metas</h3>
        </div>
        <span className="text-[10px] font-mono tabular-nums text-white/40">
          {hitCount}/{evaluated.length} batidas
        </span>
      </div>

      <div className="space-y-2.5">
        {evaluated.slice(0, 3).map((e) => {
          const accent = e.hit ? "#10B981" : e.pct > 65 ? "#F59E0B" : "rgba(255,255,255,0.6)";
          return (
            <div key={e.goal.id}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {e.hit && <Check className="w-3 h-3 text-emerald-400 shrink-0" strokeWidth={2.5} />}
                  <p className="text-[11.5px] font-semibold text-white/80 truncate">{e.label}</p>
                </div>
                <span className="text-[10.5px] font-mono tabular-nums font-bold shrink-0" style={{ color: accent }}>
                  {e.current > 0 && e.goal.direction === "min" ? "+" : ""}{e.current}{e.unit}
                </span>
              </div>
              <div className="h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${e.pct}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          );
        })}
        {evaluated.length > 3 && (
          <p className="text-[10px] text-white/35 pt-1">+{evaluated.length - 3} metas</p>
        )}
      </div>

      <p className="flex items-center gap-1 text-[10px] text-white/30 mt-3 group-hover:text-white/60 transition-colors">
        Editar no diário <ArrowRight className="w-2.5 h-2.5" />
      </p>
    </Link>
  );
}
