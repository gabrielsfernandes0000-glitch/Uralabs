"use client";

import { useEffect, useState } from "react";
import { Check, ArrowUp, ArrowDown } from "lucide-react";
import { TodayEventsBanner } from "./TodayEventsBanner";
import type { PrepData } from "@/lib/progress";

interface Props {
  onSave: (data: { bias: "bullish" | "bearish"; biasReason: string; keyLevels: string; plan: string; emotional: number }) => void;
  existing?: PrepData;
}

export function PrepSheet({ onSave, existing }: Props) {
  const [bias, setBias] = useState<"bullish" | "bearish" | null>(null);
  const [biasReason, setBiasReason] = useState("");
  const [keyLevels, setKeyLevels] = useState("");
  const [plan, setPlan] = useState("");
  const [emotional, setEmotional] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Hidrata com prep existente se houver
  useEffect(() => {
    if (existing) {
      setBias(existing.bias);
      setBiasReason(existing.biasReason);
      setKeyLevels(existing.keyLevels);
      setPlan(existing.plan);
      setEmotional(existing.emotional);
    }
  }, [existing]);

  const isComplete = bias && biasReason.trim() && plan.trim() && emotional;

  const moods = [
    { v: 1, label: "Péssimo",   color: "#EF4444" },
    { v: 2, label: "Ruim",      color: "#F59E0B" },
    { v: 3, label: "Normal",    color: "#6B7280" },
    { v: 4, label: "Bom",       color: "#10B981" },
    { v: 5, label: "Excelente", color: "#FF5500" },
  ];

  const handleSubmit = () => {
    if (!isComplete || !bias || !emotional) return;
    onSave({ bias, biasReason, keyLevels, plan, emotional });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <TodayEventsBanner
        title="Eventos econômicos hoje"
        subtitle="considere na hora de montar o plano"
      />

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.02] p-3 sm:p-4">
          <p className="text-[12px] text-white/70 font-semibold mb-2.5">Como você está?</p>
          <div className="grid grid-cols-5 gap-1.5">
            {moods.map((e) => (
              <button key={e.v} onClick={() => setEmotional(e.v)}
                className={`interactive-tap flex flex-col items-center gap-1 px-1 py-2 rounded-lg border ${
                  emotional === e.v
                    ? "border-white/[0.14] bg-white/[0.05]"
                    : "border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02]"
                }`}
                style={emotional === e.v ? { borderColor: e.color + "55", backgroundColor: e.color + "10" } : undefined}>
                <div className="w-6 h-1 rounded-full" style={{ backgroundColor: emotional === e.v ? e.color : e.color + "40" }} />
                <span className={`text-[10px] font-medium ${emotional === e.v ? "text-white/85" : "text-white/40"}`}>{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] p-3 sm:p-4">
          <p className="text-[12px] text-white/70 font-semibold mb-2.5">Viés do dia</p>
          <div className="flex gap-2">
            <button onClick={() => setBias("bullish")}
              className={`interactive-tap flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${
                bias === "bullish"
                  ? "border-green-400/40 text-green-400"
                  : "border-white/[0.05] text-white/35 hover:border-white/[0.14] hover:text-white/60"
              }`}>
              <ArrowUp className="w-4 h-4" />
              <span className="text-[13px] font-bold">Bullish</span>
            </button>
            <button onClick={() => setBias("bearish")}
              className={`interactive-tap flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${
                bias === "bearish"
                  ? "border-red-400/40 text-red-400"
                  : "border-white/[0.05] text-white/35 hover:border-white/[0.14] hover:text-white/60"
              }`}>
              <ArrowDown className="w-4 h-4" />
              <span className="text-[13px] font-bold">Bearish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.02] p-3 sm:p-4">
        <p className="text-[12px] text-white/70 font-semibold mb-2">Por que esse viés?</p>
        <textarea
          value={biasReason}
          onChange={(e) => setBiasReason(e.target.value)}
          placeholder="Semanal, diário, liquidez varrida, sessão anterior..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.02] p-3 sm:p-4">
          <p className="text-[12px] text-white/70 font-semibold mb-2">Níveis-chave (OBs, FVGs, Liquidez)</p>
          <textarea
            value={keyLevels}
            onChange={(e) => setKeyLevels(e.target.value)}
            placeholder="Ex: OB bullish 4h em 18.050 · BSL acima de 18.200..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
          />
        </div>
        <div className="rounded-xl bg-white/[0.02] p-3 sm:p-4">
          <p className="text-[12px] text-white/70 font-semibold mb-2">Plano de ação</p>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Se o preço varrer a SSL e reagir no OB, busco long com alvo em BSL..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isComplete}
        className={`interactive w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold ${
          isComplete
            ? "border border-brand-500/60 text-brand-500 hover:bg-brand-500/[0.04] hover:border-brand-500"
            : "border border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}>
        <Check className="w-4 h-4" />
        {justSaved ? "Plano salvo" : existing ? "Atualizar plano" : "Salvar plano do dia"}
      </button>
    </div>
  );
}
