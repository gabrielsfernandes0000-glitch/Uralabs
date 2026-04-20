"use client";

import { useState } from "react";
import {
  FileText, TrendingUp, Check,
  ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { TodayEventsBanner } from "@/components/elite/TodayEventsBanner";

/* ────────────────────────────────────────────
   Diário — Prep Sheet (pré-mercado) + Diário de Trade (pós-mercado).
   Antes estavam dentro de /elite/pratica junto com o Treino — separados pra
   dar semântica mais clara: Prática = fazer, Diário = registrar.
   ──────────────────────────────────────────── */

type Tab = "prep" | "diario";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { id: "prep",   label: "Prep Sheet",      icon: FileText,   hint: "Plano pré-mercado" },
  { id: "diario", label: "Diário de Trade", icon: TrendingUp, hint: "Review pós-trade" },
];

/* ────────────────────────────────────────────
   Prep Sheet
   ──────────────────────────────────────────── */

function PrepSheet({ onSave }: { onSave: (data: { bias: "bullish" | "bearish"; biasReason: string; keyLevels: string; plan: string; emotional: number }) => void }) {
  const [bias, setBias] = useState<"bullish" | "bearish" | null>(null);
  const [biasReason, setBiasReason] = useState("");
  const [keyLevels, setKeyLevels] = useState("");
  const [plan, setPlan] = useState("");
  const [emotional, setEmotional] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isComplete = bias && biasReason.trim() && plan.trim() && emotional;

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12">
        <Check className="w-10 h-10 text-green-400 mb-4" strokeWidth={1.5} />
        <h3 className="text-[20px] font-bold text-white mb-2">Prep Sheet salvo</h3>
        <p className="text-[13px] text-white/35 mb-6 text-center max-w-sm">
          Seu plano pra hoje está registrado. Depois do mercado fechar, volte pra revisar o que aconteceu.
        </p>
        <button onClick={() => setSubmitted(false)}
          className="text-[13px] text-white/30 hover:text-white/60 underline">
          Editar
        </button>
      </div>
    );
  }

  const moods = [
    { v: 1, label: "Péssimo",   color: "#EF4444" },
    { v: 2, label: "Ruim",      color: "#F59E0B" },
    { v: 3, label: "Normal",    color: "#6B7280" },
    { v: 4, label: "Bom",       color: "#10B981" },
    { v: 5, label: "Excelente", color: "#FF5500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
          <FileText className="w-4 h-4 text-white/50" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-white tracking-tight leading-tight">Plano Pré-Mercado</h3>
          <p className="text-[11.5px] text-white/40">Preencha antes do mercado abrir</p>
        </div>
      </div>

      <TodayEventsBanner
        title="Eventos econômicos hoje"
        subtitle="considere na hora de montar o plano"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-4">
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

        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-4">
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

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-4">
        <p className="text-[12px] text-white/70 font-semibold mb-2">Por que esse viés?</p>
        <textarea
          value={biasReason}
          onChange={(e) => setBiasReason(e.target.value)}
          placeholder="Semanal, diário, liquidez varrida, sessão anterior..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-4">
          <p className="text-[12px] text-white/70 font-semibold mb-2">Níveis-chave (OBs, FVGs, Liquidez)</p>
          <textarea
            value={keyLevels}
            onChange={(e) => setKeyLevels(e.target.value)}
            placeholder="Ex: OB bullish 4h em 18.050 · BSL acima de 18.200..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
          />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-4">
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
        onClick={() => {
          if (isComplete && bias && emotional) {
            onSave({ bias, biasReason, keyLevels, plan, emotional });
            setSubmitted(true);
          }
        }}
        disabled={!isComplete}
        className={`interactive w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold ${
          isComplete ? "bg-brand-500 text-white hover:brightness-110 shadow-lg shadow-brand-500/20" : "bg-white/[0.03] border border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}>
        <Check className="w-4 h-4" />
        Salvar Prep Sheet
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────
   Diário de Trade
   ──────────────────────────────────────────── */

function TradeJournal({ onSave }: { onSave: (data: { direction: "long" | "short"; entry: string; sl: string; tp: string; result: "win" | "loss" | "be"; rr: string; followedPlan: boolean; emotionalAfter: number; notes: string }) => void }) {
  const [direction, setDirection] = useState<"long" | "short" | null>(null);
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "be" | null>(null);
  const [rr, setRr] = useState("");
  const [notes, setNotes] = useState("");
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(null);
  const [emotionalAfter, setEmotionalAfter] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12">
        <Check className="w-10 h-10 text-blue-400 mb-4" strokeWidth={1.5} />
        <h3 className="text-[20px] font-bold text-white mb-2">Trade registrado</h3>
        <p className="text-[13px] text-white/35 mb-2">Seus dados são salvos e geram insights ao longo do tempo.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setSubmitted(false)}
            className="text-[13px] text-white/30 hover:text-white/60 underline">
            Registrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#151518] to-[#111114] p-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white/50" />
            </div>
            <h3 className="text-[20px] font-bold text-white tracking-tight">Registrar Trade</h3>
          </div>
          <p className="text-[13px] text-white/40 ml-11">Documente cada trade. Com o tempo, a plataforma identifica padrões no seu operacional.</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Direção</p>
        <div className="flex gap-3">
          <button onClick={() => setDirection("long")}
            className={`interactive-tap flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border transition-colors ${
              direction === "long"
                ? "border-green-400/40 text-green-400"
                : "border-white/[0.04] text-white/35 hover:border-white/[0.14] hover:text-white/60"
            }`}>
            <ArrowUp className="w-5 h-5" /> <span className="text-[15px] font-bold">Long</span>
          </button>
          <button onClick={() => setDirection("short")}
            className={`interactive-tap flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border transition-colors ${
              direction === "short"
                ? "border-red-400/40 text-red-400"
                : "border-white/[0.04] text-white/35 hover:border-white/[0.14] hover:text-white/60"
            }`}>
            <ArrowDown className="w-5 h-5" /> <span className="text-[15px] font-bold">Short</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12]">
          <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2">Entry</p>
          <input type="text" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="18.100"
            className="w-full bg-transparent text-[18px] text-white/80 font-mono focus:outline-none placeholder-white/15" />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12]">
          <p className="text-[11px] text-red-400/50 font-semibold uppercase tracking-wider mb-2">Stop Loss</p>
          <input type="text" value={sl} onChange={(e) => setSl(e.target.value)} placeholder="18.050"
            className="w-full bg-transparent text-[18px] text-white/80 font-mono focus:outline-none placeholder-white/15" />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12]">
          <p className="text-[11px] text-green-400/50 font-semibold uppercase tracking-wider mb-2">Take Profit</p>
          <input type="text" value={tp} onChange={(e) => setTp(e.target.value)} placeholder="18.250"
            className="w-full bg-transparent text-[18px] text-white/80 font-mono focus:outline-none placeholder-white/15" />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Resultado</p>
        <div className="flex gap-3">
          {([
            { id: "win" as const, label: "Gain", icon: ArrowUp, color: "#10B981" },
            { id: "loss" as const, label: "Loss", icon: ArrowDown, color: "#EF4444" },
            { id: "be" as const, label: "Breakeven", icon: Minus, color: "#F59E0B" },
          ]).map((r) => (
            <button key={r.id} onClick={() => setResult(r.id)}
              className={`interactive-tap flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 ${
                result === r.id ? "" : "border-white/[0.04] text-white/35 hover:border-white/[0.10]"
              }`}
              style={result === r.id ? { borderColor: r.color + "40", backgroundColor: r.color + "08", color: r.color } : undefined}>
              <r.icon className="w-5 h-5" />
              <span className="text-[14px] font-bold">{r.label}</span>
            </button>
          ))}
        </div>
        {result && (
          <div className="mt-4">
            <input type="text" value={rr} onChange={(e) => setRr(e.target.value)} placeholder="R:R (ex: 2.5)"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[14px] text-white/70 font-mono placeholder-white/20 focus:outline-none focus:border-white/[0.15]" />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Seguiu o plano do Prep Sheet?</p>
        <div className="flex gap-3">
          <button onClick={() => setFollowedPlan(true)}
            className={`interactive-tap flex-1 py-4 rounded-xl border text-[14px] font-bold transition-colors ${
              followedPlan === true ? "border-green-400/40 text-green-400" : "border-white/[0.04] text-white/35 hover:border-white/[0.14] hover:text-white/60"
            }`}>Sim</button>
          <button onClick={() => setFollowedPlan(false)}
            className={`interactive-tap flex-1 py-4 rounded-xl border text-[14px] font-bold transition-colors ${
              followedPlan === false ? "border-red-400/40 text-red-400" : "border-white/[0.04] text-white/35 hover:border-white/[0.14] hover:text-white/60"
            }`}>Não</button>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Como você está se sentindo depois do trade?</p>
        <div className="flex flex-col gap-1.5">
          {[
            { v: 1, label: "Péssimo",   color: "#EF4444" },
            { v: 2, label: "Ruim",      color: "#F59E0B" },
            { v: 3, label: "Normal",    color: "#6B7280" },
            { v: 4, label: "Bom",       color: "#10B981" },
            { v: 5, label: "Excelente", color: "#FF5500" },
          ].map((e) => (
            <button key={e.v} onClick={() => setEmotionalAfter(e.v)}
              className={`interactive-tap flex items-center gap-3 px-4 py-3 rounded-xl border ${
                emotionalAfter === e.v
                  ? "border-white/[0.12] bg-white/[0.05]"
                  : "border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02]"
              }`}>
              <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: emotionalAfter === e.v ? e.color : e.color + "40" }} />
              <span className={`text-[13px] font-medium ${emotionalAfter === e.v ? "text-white/80" : "text-white/35"}`}>{e.label}</span>
              <span className={`ml-auto text-[11px] font-mono ${emotionalAfter === e.v ? "text-white/40" : "text-white/15"}`}>{e.v}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 rounded-full bg-white/[0.25]" />
          <p className="text-[14px] text-white/70 font-semibold">O que você aprendeu com esse trade?</p>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="O que deu certo, o que errou, o que faria diferente..."
          className="w-full h-28 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[13px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]" />
      </div>

      <button onClick={() => {
          if (direction && result) {
            onSave({ direction, entry, sl, tp, result, rr, followedPlan: followedPlan ?? false, emotionalAfter: emotionalAfter ?? 3, notes });
            setSubmitted(true);
          }
        }}
        disabled={!direction || !result}
        className={`interactive w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-bold ${
          direction && result ? "bg-brand-500 text-white hover:brightness-110 shadow-lg shadow-brand-500/20" : "bg-white/[0.03] border border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}>
        <TrendingUp className="w-4 h-4" />
        Registrar Trade
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────
   Página
   ──────────────────────────────────────────── */

export default function DiarioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("prep");
  const { savePrep, saveTrade } = useProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in-up flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-brand-500/60" />
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">Diário</h1>
          <p className="text-[12px] text-white/40 mt-0.5">Planeje antes, registre depois · Disciplina vira edge com o tempo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="animate-in-up delay-1 flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`interactive-tap flex items-center gap-2.5 px-5 py-3 rounded-xl border text-[13.5px] font-semibold ${
                active
                  ? "border-white/[0.22] text-white"
                  : "border-white/[0.06] text-white/40 hover:text-white/65 hover:border-white/[0.12]"
              }`}>
              <tab.icon className={`w-4 h-4 ${active ? "text-brand-500" : ""}`} />
              <span>{tab.label}</span>
              <span className={`text-[10.5px] font-medium ${active ? "text-white/45" : "text-white/25"}`}>· {tab.hint}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "prep" && <div className="animate-in-up delay-2"><PrepSheet onSave={savePrep} /></div>}
      {activeTab === "diario" && <div className="animate-in-up delay-2"><TradeJournal onSave={saveTrade} /></div>}
    </div>
  );
}
