"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SCENARIOS, TREINO_CATEGORIES } from "@/lib/treino-scenarios";
import { ThemeCard } from "@/components/elite/ThemeCard";

export default function PraticaTemasPage() {
  const total = SCENARIOS.length;

  return (
    <div className="space-y-6">
      <div className="animate-in-up">
        <Link
          href="/elite/pratica"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar pra Prática</span>
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[28px] lg:text-[34px] font-bold text-white tracking-tight leading-[1.05]">
              Treinar por Tema
            </h1>
            <p className="text-[13px] text-white/45 mt-2 max-w-xl leading-relaxed">
              Escolha um conceito e pratique só ele. Cada tema tem seus próprios cenários filtrados —
              ideal pra reforçar um ponto fraco.
            </p>
          </div>
          <div className="flex items-end gap-5 shrink-0">
            <div className="text-right">
              <p className="text-[30px] font-bold text-white leading-none font-mono">{total}</p>
              <p className="text-[10px] text-white/30 mt-1">cenários</p>
            </div>
            <div className="h-10 w-px bg-white/[0.08]" />
            <div className="text-right">
              <p className="text-[30px] font-bold text-white leading-none font-mono">
                {TREINO_CATEGORIES.length}
              </p>
              <p className="text-[10px] text-white/30 mt-1">temas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-in-up delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TREINO_CATEGORIES.map((cat) => (
          <ThemeCard key={cat.key} category={cat} />
        ))}
      </div>
    </div>
  );
}
