"use client";

import { useMemo } from "react";
import type { RecentOpening } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";

/**
 * Header compacto da loja — saldo + stats inline em uma única linha.
 *
 * Decisão: não usar "hero" gigante. O saldo importa mas não precisa ocupar
 * meia tela. Layout horizontal denso — saldo à esquerda, progress bar fina
 * no meio, stats secundários à direita. ~100px de altura vs ~400px antes.
 */

const OPENING_MILESTONES = [5, 10, 25, 50, 100, 200, 500];

export function StatsRow({
  balance,
  lifetimeEarned,
  openings,
}: {
  balance: number;
  lifetimeEarned: number;
  openings: RecentOpening[];
}) {
  const stats = useMemo(() => {
    const totalSpent = openings.reduce((s, o) => s + Number(o.coins_spent || 0), 0);
    const bestDrop = openings.reduce<RecentOpening | null>((best, o) => {
      const v = o.prize.value_brl ?? 0;
      if (!best || v > (best.prize.value_brl ?? 0)) return o;
      return best;
    }, null);

    const hasBestDrop = bestDrop && (bestDrop.prize.value_brl ?? 0) > 0;
    const totalOpenings = openings.length;
    const nextMilestone =
      OPENING_MILESTONES.find((m) => m > totalOpenings) ??
      OPENING_MILESTONES[OPENING_MILESTONES.length - 1];
    const prevMilestone =
      [...OPENING_MILESTONES].reverse().find((m) => m <= totalOpenings) ?? 0;
    const milestoneProgress =
      nextMilestone > prevMilestone
        ? (totalOpenings - prevMilestone) / (nextMilestone - prevMilestone)
        : 1;

    return {
      totalSpent,
      totalOpenings,
      bestDropName: hasBestDrop ? bestDrop!.prize.name : null,
      bestDropValue: hasBestDrop ? bestDrop!.prize.value_brl! : 0,
      nextMilestone,
      milestoneProgress,
      milestoneRemaining: Math.max(0, nextMilestone - totalOpenings),
    };
  }, [openings]);

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-5 py-4 md:px-6 md:py-5">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Saldo — destaque moderado, não hero */}
        <div className="flex items-center gap-2.5 min-w-0">
          <UraCoinIcon className="w-6 h-6 md:w-7 md:h-7 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] md:text-[30px] font-semibold tabular-nums tracking-tight leading-none">
                {balance.toLocaleString("pt-BR")}
              </span>
              <span className="text-[10.5px] text-white/35 tracking-[0.1em]">URA COIN</span>
            </div>
            <p className="text-[10.5px] text-white/30 tabular-nums mt-1">
              {lifetimeEarned.toLocaleString("pt-BR")} ganhos no total
            </p>
          </div>
        </div>

        {/* Divider vertical */}
        <div className="hidden md:block w-px h-10 bg-white/[0.06]" />

        {/* Progress — ocupa espaço flex, barra fina */}
        {stats.totalOpenings > 0 && (
          <div className="flex-1 min-w-[160px]">
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[10.5px] text-white/40">
                Próximo marco · <span className="text-white/70 font-medium tabular-nums">{stats.nextMilestone}</span>
              </p>
              <p className="text-[10.5px] text-white/35 tabular-nums">
                {stats.milestoneRemaining > 0 ? `faltam ${stats.milestoneRemaining}` : "alcançado"}
              </p>
            </div>
            <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full bg-white/70 transition-all duration-500"
                style={{ width: `${Math.min(100, stats.milestoneProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Divider + Stats cells — lado direito, compactos */}
        <div className="hidden lg:block w-px h-10 bg-white/[0.06]" />

        <div className="flex items-center gap-5 lg:gap-6">
          <Stat label="Aberturas" value={stats.totalOpenings.toLocaleString("pt-BR")} />
          <Stat
            label="Melhor"
            value={stats.bestDropValue > 0 ? `R$${stats.bestDropValue.toFixed(0)}` : "—"}
          />
          <Stat
            label="Investido"
            value={stats.totalSpent.toLocaleString("pt-BR")}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-white/35 tracking-[0.08em] mb-0.5">{label}</p>
      <p className="text-[14px] font-semibold tabular-nums tracking-tight text-white truncate">
        {value}
      </p>
    </div>
  );
}
