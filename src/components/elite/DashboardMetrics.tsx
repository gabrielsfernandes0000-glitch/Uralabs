"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine, Plug, Target, ArrowRight } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { activeGoals } from "@/lib/trade-metrics";
import { DayPnLCard } from "./DayPnLCard";
import { BrokerSnapshotCard } from "./BrokerSnapshotCard";
import { ActiveGoalsWidget } from "./ActiveGoalsWidget";

function todayKey(): string {
  const now = new Date();
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

/**
 * Quando broker + pnl + metas estão todos vazios, fundimos em um único
 * "Primeiros passos" strip em vez de 2 cards empty com 80% vazio cada.
 * Evita o desbalanço visual do dashboard em 1920.
 */
function FirstStepsStrip({ hasGoals }: { hasGoals: boolean }) {
  const steps: Array<{ href: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = [
    { href: "/elite/diario",    icon: PenLine, title: "Registrar primeiro trade",  desc: "Começa o diário agora" },
    { href: "/elite/corretora", icon: Plug,    title: "Conectar corretora",         desc: "BingX, Binance, Bybit" },
  ];
  if (!hasGoals) {
    steps.push({ href: "/elite/diario", icon: Target, title: "Definir primeira meta", desc: "Win rate, R semanal" });
  }

  return (
    <div className="rounded-xl bg-white/[0.02] p-4 animate-in-up delay-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-1 rounded-full bg-brand-500" />
        <h3 className="text-[12px] font-semibold text-white/85">Primeiros passos</h3>
        <span className="text-[10.5px] text-white/35 ml-auto">0 de {steps.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={i}
              href={s.href}
              className="interactive group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.12] transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-white/45 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/85 truncate">{s.title}</p>
                <p className="text-[10.5px] text-white/40 truncate">{s.desc}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardMetrics() {
  const { progress } = useProgress();
  const [hasBroker, setHasBroker] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange/connections")
      .then((r) => r.ok ? r.json() : { connections: [] })
      .then((d) => { if (!cancelled) setHasBroker((d.connections ?? []).length > 0); })
      .catch(() => { if (!cancelled) setHasBroker(false); });
    return () => { cancelled = true; };
  }, []);

  const hasGoals = !!progress && activeGoals(progress.goals ?? []).length > 0;
  const today = todayKey();
  const hasTradesToday = !!progress && progress.trades.some((t) => t.date === today);

  // Se tudo vazio, mostra strip compacto ao invés de 2 cards empty de 170px cada.
  const allEmpty = hasBroker === false && !hasTradesToday && !hasGoals;
  if (allEmpty) {
    return <FirstStepsStrip hasGoals={hasGoals} />;
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 ${hasGoals ? "lg:grid-cols-3" : ""} gap-3 items-start animate-in-up delay-4`}
    >
      <DayPnLCard />
      <BrokerSnapshotCard />
      {hasGoals && <ActiveGoalsWidget />}
    </div>
  );
}
