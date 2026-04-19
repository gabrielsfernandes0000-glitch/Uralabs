"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { SCENARIOS, type Scenario } from "@/lib/treino-scenarios";

interface ThemeCategory {
  key: string;
  accent: string;
  tagline: string;
  keyTerms: string[];
}

export function ThemeCard({ category }: { category: ThemeCategory }) {
  const count = useMemo(
    () => SCENARIOS.filter((s: Scenario) => s.category === category.key).length,
    [category.key]
  );
  const a = category.accent;

  return (
    <Link
      href={`/elite/treino/livre?category=${encodeURIComponent(category.key)}`}
      className="interactive group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.18] min-h-[180px] flex flex-col"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${a}80 50%, transparent)` }}
      />
      <div
        className="absolute top-[-30%] right-[-20%] w-[200px] h-[140px] pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
        style={{ background: `radial-gradient(ellipse, ${a}22, transparent 70%)` }}
      />
      <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
        <span
          className="font-black tracking-tighter whitespace-nowrap select-none pr-4"
          style={{ fontSize: "90px", color: a, opacity: 0.035, letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          {category.key.toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-0.5 h-5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: a }} />
          <p className="text-[9.5px] font-bold tracking-[0.25em] uppercase" style={{ color: a }}>
            {category.tagline}
          </p>
        </div>

        <h3 className="text-[22px] font-bold text-white tracking-tight leading-[1.05] mb-3">
          {category.key}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
          {category.keyTerms.slice(0, 3).map((term, i) => (
            <span key={term} className="text-[10.5px] text-white/40 font-mono">
              {term}
              {i < Math.min(category.keyTerms.length, 3) - 1 && (
                <span className="text-white/15 ml-2">·</span>
              )}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold font-mono" style={{ color: a }}>
              {count}
            </span>
            <span className="text-[11px] text-white/35">cenários</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
