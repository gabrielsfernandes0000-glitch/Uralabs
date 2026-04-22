"use client";

import { useState } from "react";
import { Target, ChevronDown } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { activeGoals, evaluateGoal } from "@/lib/trade-metrics";
import { GoalsPanel } from "./GoalsPanel";

/**
 * Barra fina com resumo das metas ativas.
 * Colapsa a GoalsPanel completa atrás de um expand — mostra só o essencial
 * pra não competir com stats e review.
 */
export function GoalsStrip() {
  const { progress } = useProgress();
  const [expanded, setExpanded] = useState(false);

  const goals = activeGoals(progress?.goals ?? []);
  const trades = progress?.trades ?? [];

  // Se não tem meta, CTA pra adicionar
  if (goals.length === 0) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] px-4 py-2.5 transition-colors"
      >
        <Target className="w-3.5 h-3.5 text-white/40" />
        <span className="text-[12.5px] text-white/55 flex-1 text-left">
          {expanded ? "Definir meta semanal ou mensal" : "Sem metas ativas — defina 1 pra virar hábito"}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`} />
        {!expanded && <span className="text-[10.5px] text-white/30">configurar</span>}
      </button>
    );
  }

  // Com metas: mostra hero goal (a primeira ativa)
  const hero = goals[0];
  const prog = evaluateGoal(hero, trades);
  const accent = prog.hit ? "#10B981" : prog.pct > 65 ? "#F59E0B" : "rgba(255,255,255,0.5)";
  const extraCount = goals.length - 1;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] px-4 py-2.5 transition-colors text-left"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <Target className="w-3.5 h-3.5 text-white/45 shrink-0" />
          <span className="text-[12px] font-semibold text-white/80 truncate flex-1">{prog.label}</span>
          <span className="text-[11px] font-mono tabular-nums shrink-0" style={{ color: accent }}>
            {prog.current > 0 && hero.direction === "min" ? "+" : ""}{prog.current}{prog.unit}
            <span className="text-white/30 mx-1">/</span>
            <span className="text-white/55">{hero.direction === "min" ? "≥" : "≤"}{hero.target}{prog.unit}</span>
          </span>
          {extraCount > 0 && (
            <span className="text-[10.5px] text-white/35 shrink-0">+{extraCount}</span>
          )}
          <ChevronDown className={`w-3 h-3 text-white/30 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
        </div>
        {/* Progress bar */}
        <div className="h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${prog.pct}%`, backgroundColor: accent }}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-3">
          <GoalsPanel />
        </div>
      )}
    </div>
  );
}
