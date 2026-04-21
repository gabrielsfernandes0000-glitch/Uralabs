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
      className="interactive group relative overflow-hidden rounded-2xl bg-white/[0.02] min-h-[180px] flex flex-col transition-colors"
    >
      {/* Wash da cor da categoria só no hover — reveal subtle de identidade como feedback da inten\u00e7\u00e3o */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${a}14, ${a}05 60%, transparent)` }}
      />

      <div className="relative z-10 p-5 flex-1 flex flex-col">
        <p className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-white/35 mb-3">
          {category.tagline}
        </p>

        <div className="mb-3">
          <h3 className="text-[22px] font-bold text-white tracking-tight leading-[1.05] mb-1.5">
            {category.key}
          </h3>
          <span className="block h-[2px] w-8 rounded-full transition-all group-hover:w-12" style={{ backgroundColor: a }} />
        </div>

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
            <span className="text-[20px] font-bold font-mono text-white">{count}</span>
            <span className="text-[11px] text-white/35">cenários</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
