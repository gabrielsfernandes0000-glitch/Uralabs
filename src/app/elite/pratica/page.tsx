"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText, TrendingUp, Zap, Check, ChevronRight,
  Clock, Target, Brain, ArrowUp, ArrowDown, Minus,
  Play, Pause, SkipForward, RotateCcw,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

/* ────────────────────────────────────────────
   Tab Navigation
   ──────────────────────────────────────────── */

type Tab = "prep" | "diario" | "treino";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string }[] = [
  { id: "prep", label: "Prep Sheet", icon: FileText, accent: "#FF5500" },
  { id: "diario", label: "Diário de Trade", icon: TrendingUp, accent: "#FF5500" },
  { id: "treino", label: "Treino", icon: Target, accent: "#FF5500" },
];

/* ────────────────────────────────────────────
   Prep Sheet
   ──────────────────────────────────────────── */

function PrepSheet({ onSave }: { onSave: (data: { bias: "bullish" | "bearish"; biasReason: string; keyLevels: string; plan: string; emotional: number }) => void }) {
  const [bias, setBias] = useState<"bullish" | "bearish" | null>(null);
  const [biasReason, setBiasReason] = useState("");
  const [liquidity, setLiquidity] = useState("");
  const [keyLevels, setKeyLevels] = useState("");
  const [plan, setPlan] = useState("");
  const [emotional, setEmotional] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isComplete = bias && biasReason.trim() && plan.trim() && emotional;

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
          <Check className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-[20px] font-bold text-white mb-2">Prep Sheet salvo</h3>
        <p className="text-[13px] text-white/35 mb-6 text-center max-w-sm">
          Seu plano pra hoje está registrado. Depois do mercado fechar, volte pra revisar o que aconteceu.
        </p>
        <button onClick={() => setSubmitted(false)}
          className="text-[13px] text-white/30 hover:text-white/60 transition-colors underline">
          Editar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with accent */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#151518] to-[#111114] p-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-white/[0.02] blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white/50" />
            </div>
            <h3 className="text-[20px] font-bold text-white tracking-tight">Plano Pré-Mercado</h3>
          </div>
          <p className="text-[13px] text-white/40 ml-11">Preencha antes do mercado abrir. Monte sua análise e defina o plano.</p>
        </div>
      </div>

      {/* Emotional state */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Como voc&ecirc; est&aacute; se sentindo agora?</p>
        <div className="flex flex-col gap-1.5">
          {[
            { v: 1, label: "P\u00e9ssimo", color: "#EF4444" },
            { v: 2, label: "Ruim", color: "#F59E0B" },
            { v: 3, label: "Normal", color: "#6B7280" },
            { v: 4, label: "Bom", color: "#10B981" },
            { v: 5, label: "Excelente", color: "#FF5500" },
          ].map((e) => (
            <button key={e.v} onClick={() => setEmotional(e.v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                emotional === e.v
                  ? "border-white/[0.12] bg-white/[0.05]"
                  : "border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02]"
              }`}>
              <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: emotional === e.v ? e.color : e.color + "40" }} />
              <span className={`text-[13px] font-medium ${emotional === e.v ? "text-white/80" : "text-white/35"}`}>{e.label}</span>
              <span className={`ml-auto text-[11px] font-mono ${emotional === e.v ? "text-white/40" : "text-white/15"}`}>{e.v}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily bias */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Viés do dia</p>
        <div className="flex gap-3 mb-4">
          <button onClick={() => setBias("bullish")}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all duration-200 ${
              bias === "bullish"
                ? "border-green-500/40 bg-green-500/[0.08] text-green-400 shadow-lg shadow-green-500/10 scale-[1.01]"
                : "border-white/[0.04] text-white/35 hover:border-green-500/15 hover:text-green-400/60"
            }`}>
            <ArrowUp className="w-5 h-5" />
            <span className="text-[15px] font-bold">Bullish</span>
          </button>
          <button onClick={() => setBias("bearish")}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all duration-200 ${
              bias === "bearish"
                ? "border-red-500/40 bg-red-500/[0.08] text-red-400 shadow-lg shadow-red-500/10 scale-[1.01]"
                : "border-white/[0.04] text-white/35 hover:border-red-500/15 hover:text-red-400/60"
            }`}>
            <ArrowDown className="w-5 h-5" />
            <span className="text-[15px] font-bold">Bearish</span>
          </button>
        </div>
        <textarea
          value={biasReason}
          onChange={(e) => setBiasReason(e.target.value)}
          placeholder="Por que esse viés? (semanal, diário, liquidez varrida, sessão anterior...)"
          className="w-full h-28 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[13px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all"
        />
      </div>

      {/* Key levels */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 rounded-full bg-white/[0.25]" />
          <p className="text-[14px] text-white/70 font-semibold">Níveis-chave (OBs, FVGs, Liquidez)</p>
        </div>
        <textarea
          value={keyLevels}
          onChange={(e) => setKeyLevels(e.target.value)}
          placeholder="Ex: OB bullish 4h em 18.050 · BSL acima de 18.200 · FVG em 18.100-18.120"
          className="w-full h-24 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[13px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all"
        />
      </div>

      {/* Plan */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 rounded-full bg-white/[0.25]" />
          <p className="text-[14px] text-white/70 font-semibold">Plano de ação</p>
        </div>
        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="Se o preço varrer a SSL e reagir no OB 4h, busco long com alvo em BSL. Se não varrer, fico de fora."
          className="w-full h-28 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[13px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all"
        />
      </div>

      {/* Submit */}
      <button
        onClick={() => {
          if (isComplete && bias && emotional) {
            onSave({ bias, biasReason, keyLevels, plan, emotional });
            setSubmitted(true);
          }
        }}
        disabled={!isComplete}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-bold transition-all duration-200 ${
          isComplete ? "bg-brand-500 text-white hover:brightness-110 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:scale-[1.01]" : "bg-white/[0.03] border border-white/[0.06] text-white/25 cursor-not-allowed"
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
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
          <Check className="w-7 h-7 text-blue-400" />
        </div>
        <h3 className="text-[20px] font-bold text-white mb-2">Trade registrado</h3>
        <p className="text-[13px] text-white/35 mb-2">Seus dados são salvos e geram insights ao longo do tempo.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setSubmitted(false)}
            className="text-[13px] text-white/30 hover:text-white/60 transition-colors underline">
            Registrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with accent */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#151518] to-[#111114] p-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-white/[0.02] blur-[100px] pointer-events-none" />
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

      {/* Direction */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Direção</p>
        <div className="flex gap-3">
          <button onClick={() => setDirection("long")}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all duration-200 ${
              direction === "long"
                ? "border-green-500/40 bg-green-500/[0.08] text-green-400 shadow-lg shadow-green-500/10 scale-[1.01]"
                : "border-white/[0.04] text-white/35 hover:border-green-500/15 hover:text-green-400/60"
            }`}>
            <ArrowUp className="w-5 h-5" /> <span className="text-[15px] font-bold">Long</span>
          </button>
          <button onClick={() => setDirection("short")}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all duration-200 ${
              direction === "short"
                ? "border-red-500/40 bg-red-500/[0.08] text-red-400 shadow-lg shadow-red-500/10 scale-[1.01]"
                : "border-white/[0.04] text-white/35 hover:border-red-500/15 hover:text-red-400/60"
            }`}>
            <ArrowDown className="w-5 h-5" /> <span className="text-[15px] font-bold">Short</span>
          </button>
        </div>
      </div>

      {/* Entry / SL / TP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2">Entry</p>
          <input type="text" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="18.100"
            className="w-full bg-transparent text-[18px] text-white/80 font-mono focus:outline-none placeholder-white/15" />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[11px] text-red-400/50 font-semibold uppercase tracking-wider mb-2">Stop Loss</p>
          <input type="text" value={sl} onChange={(e) => setSl(e.target.value)} placeholder="18.050"
            className="w-full bg-transparent text-[18px] text-white/80 font-mono focus:outline-none placeholder-white/15" />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-5 hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[11px] text-green-400/50 font-semibold uppercase tracking-wider mb-2">Take Profit</p>
          <input type="text" value={tp} onChange={(e) => setTp(e.target.value)} placeholder="18.250"
            className="w-full bg-transparent text-[18px] text-white/80 font-mono focus:outline-none placeholder-white/15" />
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Resultado</p>
        <div className="flex gap-3">
          {([
            { id: "win" as const, label: "Gain", icon: ArrowUp, color: "#10B981" },
            { id: "loss" as const, label: "Loss", icon: ArrowDown, color: "#EF4444" },
            { id: "be" as const, label: "Breakeven", icon: Minus, color: "#F59E0B" },
          ]).map((r) => (
            <button key={r.id} onClick={() => setResult(r.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all duration-200 ${
                result === r.id
                  ? "scale-[1.01] shadow-lg"
                  : "border-white/[0.04] text-white/35 hover:border-white/[0.10]"
              }`}
              style={result === r.id ? { borderColor: r.color + "40", backgroundColor: r.color + "08", color: r.color, boxShadow: `0 4px 20px ${r.color}15` } : undefined}>
              <r.icon className="w-5 h-5" />
              <span className="text-[14px] font-bold">{r.label}</span>
            </button>
          ))}
        </div>
        {result && (
          <div className="mt-4">
            <input type="text" value={rr} onChange={(e) => setRr(e.target.value)} placeholder="R:R (ex: 2.5)"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[14px] text-white/70 font-mono placeholder-white/20 focus:outline-none focus:border-white/[0.15] transition-all" />
          </div>
        )}
      </div>

      {/* Followed plan? */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Seguiu o plano do Prep Sheet?</p>
        <div className="flex gap-3">
          <button onClick={() => setFollowedPlan(true)}
            className={`flex-1 py-4 rounded-xl border-2 text-[14px] font-bold transition-all duration-200 ${
              followedPlan === true ? "border-green-500/40 bg-green-500/[0.08] text-green-400 shadow-lg shadow-green-500/10" : "border-white/[0.04] text-white/35 hover:border-green-500/15"
            }`}>Sim</button>
          <button onClick={() => setFollowedPlan(false)}
            className={`flex-1 py-4 rounded-xl border-2 text-[14px] font-bold transition-all duration-200 ${
              followedPlan === false ? "border-red-500/40 bg-red-500/[0.08] text-red-400 shadow-lg shadow-red-500/10" : "border-white/[0.04] text-white/35 hover:border-red-500/15"
            }`}>Não</button>
        </div>
      </div>

      {/* Emotional after */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <p className="text-[14px] text-white/70 font-semibold mb-4">Como voc&ecirc; est&aacute; se sentindo depois do trade?</p>
        <div className="flex flex-col gap-1.5">
          {[
            { v: 1, label: "P\u00e9ssimo", color: "#EF4444" },
            { v: 2, label: "Ruim", color: "#F59E0B" },
            { v: 3, label: "Normal", color: "#6B7280" },
            { v: 4, label: "Bom", color: "#10B981" },
            { v: 5, label: "Excelente", color: "#FF5500" },
          ].map((e) => (
            <button key={e.v} onClick={() => setEmotionalAfter(e.v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
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

      {/* Notes */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#111114] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 rounded-full bg-white/[0.25]" />
          <p className="text-[14px] text-white/70 font-semibold">O que você aprendeu com esse trade?</p>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="O que deu certo, o que errou, o que faria diferente..."
          className="w-full h-28 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[13px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all" />
      </div>

      <button onClick={() => {
          if (direction && result) {
            onSave({ direction, entry, sl, tp, result, rr, followedPlan: followedPlan ?? false, emotionalAfter: emotionalAfter ?? 3, notes });
            setSubmitted(true);
          }
        }}
        disabled={!direction || !result}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-bold transition-all duration-200 ${
          direction && result ? "bg-brand-500 text-white hover:brightness-110 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:scale-[1.01]" : "bg-white/[0.03] border border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}>
        <TrendingUp className="w-4 h-4" />
        Registrar Trade
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────
   Treino — Cenários vinculados ao currículo
   ──────────────────────────────────────────── */

interface Treino {
  id: string;
  title: string;
  desc: string;
  requiredLesson: string; // lesson id from curriculum
  requiredLessonTitle: string;
  module: string;
  moduleColor: string;
  difficulty: "iniciante" | "intermediário" | "avançado";
  type: "identificar" | "decisão" | "execução";
}

const TREINOS: Treino[] = [
  { id: "t-candles", title: "Leitura de Candle", desc: "Identifique o que cada candle está dizendo sobre compradores vs vendedores.", requiredLesson: "leitura-candle", requiredLessonTitle: "Leitura de Candle", module: "Base", moduleColor: "#FF5500", difficulty: "iniciante", type: "identificar" },
  { id: "t-risco", title: "Calcule o Risco", desc: "Posicione stop e alvo corretamente. Qual o tamanho do lote?", requiredLesson: "risco", requiredLessonTitle: "Gerenciamento de Risco", module: "Base", moduleColor: "#FF5500", difficulty: "iniciante", type: "decisão" },
  { id: "t-obs", title: "Marque os Order Blocks", desc: "Encontre as zonas onde os institucionais se posicionaram.", requiredLesson: "order-blocks", requiredLessonTitle: "Order Blocks", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar" },
  { id: "t-fvg", title: "Identifique FVGs", desc: "Marque os Fair Value Gaps e diga quais serão preenchidos.", requiredLesson: "fvg-breaker", requiredLessonTitle: "FVG & Breaker Blocks", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar" },
  { id: "t-premium", title: "Premium ou Discount?", desc: "Defina as zonas de desconto e premium usando Fibonacci 50%.", requiredLesson: "premium-discount", requiredLessonTitle: "Premium & Discount", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar" },
  { id: "t-liquidez", title: "Onde Está a Liquidez?", desc: "Mapeie os pools de liquidez que os big players vão buscar.", requiredLesson: "liquidez", requiredLessonTitle: "Liquidez", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar" },
  { id: "t-sessoes", title: "Qual Sessão Operar?", desc: "Identifique a sessão e o comportamento esperado do mercado.", requiredLesson: "sessoes", requiredLessonTitle: "Sessões de Mercado", module: "Estratégia", moduleColor: "#A855F7", difficulty: "avançado", type: "decisão" },
  { id: "t-amd", title: "Leitura AMD Completa", desc: "Identifique Acumulação, Manipulação e Distribuição em tempo real.", requiredLesson: "amd", requiredLessonTitle: "AMD", module: "Estratégia", moduleColor: "#A855F7", difficulty: "avançado", type: "decisão" },
  { id: "t-bias", title: "Monte o Viés do Dia", desc: "Com base na estrutura, defina se o dia é bullish ou bearish.", requiredLesson: "daily-bias", requiredLessonTitle: "Daily Bias & Judas Swing", module: "Estratégia", moduleColor: "#A855F7", difficulty: "avançado", type: "decisão" },
  { id: "t-entrada", title: "Execute o Trade", desc: "Cenário completo: identifique a zona, defina entrada, stop e alvo.", requiredLesson: "entrada-saida", requiredLessonTitle: "Entrada & Saída", module: "Execução", moduleColor: "#10B981", difficulty: "avançado", type: "execução" },
];

/* difficulty shown as subtle inline text — no colored pills */

function TreinoTab() {
  const { completedLessons } = useProgress();

  const isUnlocked = (lessonId: string) => completedLessons.includes(lessonId);

  // Group by module
  const grouped = TREINOS.reduce<Record<string, Treino[]>>((acc, t) => {
    (acc[t.module] ??= []).push(t);
    return acc;
  }, {});

  const totalUnlocked = TREINOS.filter(t => isUnlocked(t.requiredLesson)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111114] border border-white/[0.06]">
        <div className="absolute top-[-50%] left-[20%] w-[600px] h-[400px] bg-brand-500/[0.04] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[10%] w-[400px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none" />

        <div className="relative z-10 p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-[32px] lg:text-[40px] font-bold text-white tracking-tight leading-none">
                Treino
              </h1>
              <p className="text-[14px] text-white/40 mt-3 max-w-md">
                Cada treino &eacute; desbloqueado ao completar a aula correspondente. Pratique o que aprendeu com cen&aacute;rios reais.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-[36px] lg:text-[42px] font-bold text-white leading-none tracking-tight">{totalUnlocked}</p>
              <div>
                <p className="text-[12px] text-white/30">de {TREINOS.length}</p>
                <p className="text-[12px] text-white/30">desbloqueados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treinos por módulo */}
      {Object.entries(grouped).map(([moduleName, treinos]) => {
        const moduleColor = treinos[0].moduleColor;
        return (
          <div key={moduleName} className="space-y-3">
            {/* Module header */}
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: moduleColor + "60" }} />
              <h3 className="text-[14px] font-semibold text-white/70">{moduleName}</h3>
            </div>

            {/* Treino cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {treinos.map((treino) => {
                const unlocked = isUnlocked(treino.requiredLesson);

                return (
                  <div
                    key={treino.id}
                    className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                      unlocked
                        ? "border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] hover:border-white/[0.12] cursor-pointer hover:-translate-y-0.5"
                        : "border-white/[0.04] bg-[#0c0c0e] opacity-40 cursor-default"
                    }`}
                  >
                    {/* Top accent line */}
                    {unlocked && (
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${moduleColor}40, transparent)` }} />
                    )}

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {unlocked ? (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: moduleColor + "12" }}>
                            <Target className="w-4 h-4" style={{ color: moduleColor }} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/[0.08]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h4 className={`text-[15px] font-bold leading-tight ${unlocked ? "text-white/90" : "text-white/25"}`}>
                            {treino.title}
                          </h4>
                          <span className={`text-[11px] ${unlocked ? "text-white/30" : "text-white/15"}`}>
                            {treino.difficulty.charAt(0).toUpperCase() + treino.difficulty.slice(1)}
                          </span>
                        </div>
                      </div>
                      {unlocked && (
                        <ChevronRight className="w-4 h-4 text-white/15 mt-1" />
                      )}
                    </div>

                    <p className={`text-[12px] leading-relaxed ml-11 ${unlocked ? "text-white/40" : "text-white/15"}`}>
                      {unlocked ? treino.desc : `Complete "${treino.requiredLessonTitle}" para desbloquear.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────
   Simulador de Trade (Replay Mode) — usado dentro de treinos
   ──────────────────────────────────────────── */

function TradeSimulator() {
  const [started, setStarted] = useState(false);
  const [candleIndex, setCandleIndex] = useState(9);
  const [playing, setPlaying] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [answeredQ, setAnsweredQ] = useState<{ idx: number; correct: boolean; explanation: string } | null>(null);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]> | null>(null);

  // NQ 5-min candle data — realistic AMD scenario
  // Using Unix timestamps (seconds) — base date 2026-04-14
  const baseTime = 1744617000; // 2026-04-14 08:30 ET approx
  const candles = [
    // Pre-market context
    { o: 18120, c: 18108, h: 18128, l: 18102, phase: "C", time: baseTime },
    { o: 18108, c: 18115, h: 18122, l: 18100, phase: "C", time: baseTime + 300 },
    { o: 18115, c: 18098, h: 18118, l: 18092, phase: "C", time: baseTime + 600 },
    { o: 18098, c: 18105, h: 18112, l: 18090, phase: "C", time: baseTime + 900 },
    { o: 18105, c: 18095, h: 18110, l: 18088, phase: "C", time: baseTime + 1200 },
    { o: 18095, c: 18102, h: 18108, l: 18085, phase: "C", time: baseTime + 1500 },
    // Market open — accumulation
    { o: 18100, c: 18088, h: 18108, l: 18082, phase: "A", time: baseTime + 3600 },
    { o: 18088, c: 18095, h: 18102, l: 18080, phase: "A", time: baseTime + 3900 },
    { o: 18095, c: 18082, h: 18098, l: 18075, phase: "A", time: baseTime + 4200 },
    { o: 18082, c: 18092, h: 18100, l: 18078, phase: "A", time: baseTime + 4500 },
    { o: 18092, c: 18085, h: 18098, l: 18078, phase: "A", time: baseTime + 4800 },
    { o: 18085, c: 18090, h: 18095, l: 18072, phase: "A", time: baseTime + 5100 },
    { o: 18090, c: 18078, h: 18094, l: 18070, phase: "A", time: baseTime + 5400 },
    { o: 18078, c: 18088, h: 18095, l: 18072, phase: "A", time: baseTime + 5700 },
    { o: 18088, c: 18080, h: 18092, l: 18074, phase: "A", time: baseTime + 6000 },
    { o: 18080, c: 18085, h: 18090, l: 18068, phase: "A", time: baseTime + 6300 },
    // Manipulation — sweep
    { o: 18085, c: 18055, h: 18090, l: 18048, phase: "M", time: baseTime + 6600, decision: true },
    { o: 18055, c: 18035, h: 18060, l: 18028, phase: "M", time: baseTime + 6900 },
    { o: 18035, c: 18018, h: 18040, l: 18010, phase: "M", time: baseTime + 7200 },
    { o: 18018, c: 17995, h: 18025, l: 17988, phase: "M", time: baseTime + 7500, decision: true },
    // Reversal
    { o: 17995, c: 18042, h: 18048, l: 17982, phase: "D", time: baseTime + 7800 },
    { o: 18042, c: 18075, h: 18082, l: 18038, phase: "D", time: baseTime + 8100 },
    { o: 18075, c: 18105, h: 18112, l: 18070, phase: "D", time: baseTime + 8400, decision: true },
    // Distribution
    { o: 18105, c: 18135, h: 18142, l: 18100, phase: "D", time: baseTime + 8700 },
    { o: 18135, c: 18158, h: 18165, l: 18128, phase: "D", time: baseTime + 9000 },
    { o: 18158, c: 18178, h: 18185, l: 18150, phase: "D", time: baseTime + 9300 },
    { o: 18178, c: 18195, h: 18205, l: 18172, phase: "D", time: baseTime + 9600 },
    { o: 18195, c: 18215, h: 18228, l: 18190, phase: "D", time: baseTime + 9900 },
    { o: 18215, c: 18238, h: 18248, l: 18210, phase: "D", time: baseTime + 10200 },
    { o: 18238, c: 18255, h: 18265, l: 18232, phase: "D", time: baseTime + 10500 },
    { o: 18255, c: 18270, h: 18280, l: 18248, phase: "D", time: baseTime + 10800 },
    { o: 18270, c: 18282, h: 18295, l: 18265, phase: "D", time: baseTime + 11100 },
  ];

  // Initialize Lightweight Charts
  useEffect(() => {
    if (!started || !chartContainerRef.current) return;

    let disposed = false;

    const initChart = async () => {
      const { createChart, CandlestickSeries, ColorType } = await import("lightweight-charts");

      if (disposed || !chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { type: ColorType.Solid, color: "#131722" },
          textColor: "#787b86",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        },
        grid: {
          vertLines: { color: "#1e222d" },
          horzLines: { color: "#1e222d" },
        },
        crosshair: {
          vertLine: { color: "#758696", width: 1, style: 3, labelBackgroundColor: "#2962ff" },
          horzLine: { color: "#758696", width: 1, style: 3, labelBackgroundColor: "#2962ff" },
        },
        rightPriceScale: {
          borderColor: "#2a2e39",
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: "#2a2e39",
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 18,
          minBarSpacing: 8,
          fixLeftEdge: true,
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // Set initial candles
      const initialData = candles.slice(0, candleIndex + 1).map((c) => ({
        time: c.time as import("lightweight-charts").UTCTimestamp,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      }));
      series.setData(initialData);
      // Don't fitContent — keep barSpacing fixed for consistent zoom

      chartRef.current = chart;
      seriesRef.current = series;

      // Handle resize
      const ro = new ResizeObserver(() => {
        if (chartContainerRef.current && !disposed) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      });
      ro.observe(chartContainerRef.current);

      return () => { ro.disconnect(); };
    };

    initChart();

    return () => {
      disposed = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Update chart when candleIndex changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    const c = candles[candleIndex];
    if (!c) return;

    seriesRef.current.update({
      time: c.time as import("lightweight-charts").UTCTimestamp,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    });

    // Keep latest candle visible without changing zoom
    chartRef.current.timeScale().scrollToRealTime();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candleIndex]);

  const currentCandle = candles[candleIndex];
  const isDecisionPoint = currentCandle?.decision;

  const decisionQuestions: Record<number, { q: string; options: string[]; correct: number; explanation: string }> = {
    16: {
      q: "Observe o gráfico: o preço ficou 10 candles dentro de um range (linhas pontilhadas). Agora rompeu pra baixo com força. Veja a linha 'Range Low' — o preço acabou de passar. Baseado no padrão AMD, o que provavelmente está acontecendo?",
      options: [
        "Tendência de baixa confirmada — vender agora",
        "Fase de Manipulação (M) — institucionais varrendo stops abaixo do range antes do movimento real. Esperar confirmação",
        "Aleatório — ficar de fora",
        "Comprar — está em desconto",
      ],
      correct: 1,
      explanation: "A acumulação (A) foram os 10 candles laterais entre as linhas pontilhadas. O rompimento pra baixo é a manipulação (M) — não é uma tendência real, é uma armadilha pra pegar os stops de quem comprou nos suportes. Os institucionais precisam dessa liquidez. Não venda no pânico e não compre o fundo — espere o próximo sinal."
    },
    19: {
      q: "O preço caiu ~97 pontos abaixo do range (de 18.085 até 17.988). Veja no gráfico: está bem abaixo das linhas pontilhadas do range. O que você precisa ver agora pra confirmar que a manipulação acabou?",
      options: [
        "Mais queda — confirma tendência de baixa",
        "Um candle verde com corpo grande que feche acima de 18.040 (engulfing) — mostra que compradores tomaram o controle e o sweep terminou",
        "Não importa — dia perdido",
        "Qualquer candle verde, mesmo com corpo pequeno",
      ],
      correct: 1,
      explanation: "O sweep está completo (97 pontos de queda). Agora você precisa de CONFIRMAÇÃO: um candle bullish com corpo GRANDE que feche acima da zona do OB (~18.040). Corpo grande = força compradora institucional. Um candle verde com corpo pequeno (doji) NÃO confirma — pode ser só uma pausa antes de mais queda. Paciência: espere o sinal certo."
    },
    22: {
      q: "Dois candles verdes enormes no gráfico! O preço voltou de 17.995 pra 18.105 — está acima do range inteiro de acumulação. A reversão está confirmada. Onde exatamente você coloca Entry, Stop e Alvo?",
      options: [
        "Entry: 18.042 (OB do sweep) · Stop: 17.978 (abaixo do low) · Alvo: 18.250 (BSL) — R:R 3.25:1",
        "Espero mais 5 candles pra ter certeza total",
        "Compro no preço atual (18.105) com lote máximo",
        "Espero o preço voltar pra 17.988 pra comprar barato",
      ],
      correct: 0,
      explanation: "Setup confirmado: Acumulação (range) → Manipulação (sweep dos lows) → Distribuição (engulfing de reversão). Entry no OB do sweep (~18.042) — zona onde o preço pode retornar antes de subir. Stop abaixo do low do sweep (17.978) — se romper esse ponto, a tese morreu. Alvo na BSL acima (~18.250, +208 pts). R:R = 3.25:1. Use 1% de risco pra calcular o lote."
    },
  };

  // Add chart markers/lines at decision points — tracked to avoid duplicates
  const addedLinesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    const added = addedLinesRef.current;

    const addLine = (key: string, opts: { price: number; color: string; title: string; lineStyle?: number }) => {
      if (added.has(key)) return;
      seriesRef.current!.createPriceLine({
        price: opts.price,
        color: opts.color,
        lineWidth: 1,
        lineStyle: opts.lineStyle ?? 2,
        axisLabelVisible: true,
        title: opts.title,
      });
      added.add(key);
    };

    if (candleIndex >= 15) {
      addLine("range-high", { price: 18108, color: "#787b86", title: "Range High" });
      addLine("range-low", { price: 18068, color: "#787b86", title: "Range Low" });
    }

    if (candleIndex >= 19) {
      addLine("sweep-low", { price: 17982, color: "#ef5350", title: "Sweep Low" });
    }

    if (candleIndex >= 22 && decisions.length >= 3) {
      addLine("entry", { price: 18042, color: "#2962ff", title: "Entry (OB)" });
      addLine("sl", { price: 17978, color: "#ef5350", title: "Stop Loss" });
      addLine("tp", { price: 18250, color: "#26a69a", title: "Take Profit" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candleIndex, decisions.length]);

  // Advance one candle
  const advanceOne = useCallback(() => {
    setCandleIndex((prev) => {
      const next = prev + 1;
      if (next >= candles.length) {
        setPlaying(false);
        return prev;
      }
      if (candles[next]?.decision) {
        setPlaying(false);
        setShowDecision(true);
      }
      return next;
    });
  }, [candles]);

  // Auto-play: advance every 600ms until decision point or end
  useEffect(() => {
    if (playing && !showDecision && !answeredQ) {
      playTimer.current = setTimeout(advanceOne, 600);
    }
    return () => { if (playTimer.current) clearTimeout(playTimer.current); };
  }, [playing, candleIndex, showDecision, answeredQ, advanceOne]);

  const togglePlay = () => {
    if (candleIndex >= candles.length - 1) return;
    setPlaying((p) => !p);
  };

  const handleDecision = (optIdx: number) => {
    const dq = decisionQuestions[candleIndex];
    if (dq) {
      const correct = optIdx === dq.correct;
      setDecisions((prev) => [...prev, correct ? "correct" : "wrong"]);
      setAnsweredQ({ idx: optIdx, correct, explanation: dq.explanation });
    }
  };

  const dismissAnswer = () => {
    setAnsweredQ(null);
    setShowDecision(false);
  };

  const resetSim = () => {
    setCandleIndex(9);
    setDecisions([]);
    setShowDecision(false);
    setAnsweredQ(null);
    setPlaying(false);
    addedLinesRef.current.clear();
  };

  const finished = candleIndex >= candles.length - 1 && !showDecision && !answeredQ;

  if (!started) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-brand-500/10 rounded-3xl blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Zap className="w-9 h-9 text-brand-500" />
          </div>
        </div>
        <h3 className="text-[22px] font-bold text-white mb-2">Simulador de Trade</h3>
        <p className="text-[14px] text-white/35 text-center max-w-md mb-3">
          Aperte play e assista o mercado se desenrolar. Nos momentos-chave, a simulação pausa e pergunta: o que você faz?
        </p>
        <p className="text-[12px] text-white/30 text-center max-w-sm mb-8">
          Cenário: NQ 5min · Sessão NY · Padrão AMD com sweep de liquidez
        </p>
        <button onClick={() => { setStarted(true); setPlaying(true); }}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-brand-500 text-white text-[15px] font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-500/25">
          <Play className="w-5 h-5 fill-white" />
          Iniciar Simulação
        </button>
      </div>
    );
  }

  const dq = isDecisionPoint && showDecision ? decisionQuestions[candleIndex] : null;
  const lastCandle = candles[candleIndex];

  return (
    <div className="-mx-5 lg:-mx-10 overflow-x-hidden">
      {/* Header bar — TradingView style */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2e39]" style={{ background: "#1e222d" }}>
        <div className="flex items-center gap-4">
          <span className="text-[14px] text-[#d1d4dc] font-bold font-mono">NQ1!</span>
          <div className="h-4 w-px bg-[#2a2e39]" />
          <span className="text-[12px] text-[#787b86] font-mono">5</span>
          <div className="h-4 w-px bg-[#2a2e39]" />
          <span className="text-[11px] text-[#787b86]">NASDAQ 100 E-mini Futures</span>
          <div className="h-4 w-px bg-[#2a2e39]" />
          <span className="text-[11px] text-[#787b86]">Simulador</span>
        </div>
        {lastCandle && (
          <div className="flex items-center gap-5 text-[11px] font-mono">
            <span className="text-[#787b86]">O <span className="text-[#d1d4dc]">{lastCandle.o.toLocaleString()}</span></span>
            <span className="text-[#787b86]">H <span className="text-[#d1d4dc]">{lastCandle.h.toLocaleString()}</span></span>
            <span className="text-[#787b86]">L <span className="text-[#d1d4dc]">{lastCandle.l.toLocaleString()}</span></span>
            <span className="text-[#787b86]">C <span className={lastCandle.c >= lastCandle.o ? "text-[#26a69a]" : "text-[#ef5350]"}>{lastCandle.c.toLocaleString()}</span></span>
          </div>
        )}
      </div>

      {/* Chart container — Lightweight Charts renders here */}
      <div className="relative" style={{ background: "#131722" }}>
        <div ref={chartContainerRef} className="w-full" style={{ minHeight: "500px" }} />

        {/* Finished overlay — only this stays on chart */}
        {finished && (
          <div className="absolute inset-0 z-20 bg-[#131722]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-[22px] font-bold text-white mb-3">Simulação Completa</h3>
              <div className="flex gap-2 justify-center mb-4">
                {decisions.map((d, i) => (
                  <div key={i} className={`w-4 h-4 rounded ${d === "correct" ? "bg-[#26a69a]" : "bg-[#ef5350]"}`} />
                ))}
              </div>
              <p className="text-[14px] text-white/50 mb-6">
                {decisions.filter(d => d === "correct").length}/{decisions.length} decisões corretas
              </p>
              <button onClick={resetSim}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2962ff] text-white text-[14px] font-bold hover:bg-[#1e53e5] transition-all mx-auto">
                <RotateCcw className="w-4 h-4" />
                Refazer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decision panel — BELOW chart, full width, prominent */}
      {dq && !answeredQ && (
        <div className="border-x border-[#2a2e39]" style={{ background: "#1a1d2e" }}>
          <div className="px-6 py-5 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-brand-500 rounded-full animate-ping opacity-40" />
              </div>
              <p className="text-[11px] text-brand-500 uppercase tracking-wider font-bold">Ponto de Decisão — Analise o gráfico acima e responda</p>
            </div>
            <p className="text-[16px] text-white/90 font-medium mb-5 leading-relaxed">{dq.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dq.options.map((opt, i) => (
                <button key={i} onClick={() => handleDecision(i)}
                  className="text-left px-4 py-3.5 rounded-xl border border-white/[0.08] text-[13px] text-white/60 hover:border-brand-500/40 hover:text-white/90 hover:bg-white/[0.03] transition-all">
                  <span className="font-mono text-brand-500/50 mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Answer panel — BELOW chart */}
      {answeredQ && (
        <div className="border-x border-[#2a2e39]" style={{ background: answeredQ.correct ? "#121d1a" : "#1d1215" }}>
          <div className="px-6 py-5 max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[13px] font-bold uppercase tracking-wider ${answeredQ.correct ? "text-[#26a69a]" : "text-[#ef5350]"}`}>
                {answeredQ.correct ? "Correto!" : "Não exatamente"}
              </p>
              <button onClick={dismissAnswer}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2962ff] text-white text-[12px] font-bold hover:bg-[#1e53e5] transition-all">
                <SkipForward className="w-3.5 h-3.5" />
                Continuar
              </button>
            </div>
            <p className="text-[13px] text-white/55 leading-relaxed">{answeredQ.explanation}</p>
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2e39]" style={{ background: "#1e222d" }}>
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button onClick={togglePlay} disabled={showDecision || finished || !!answeredQ}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2962ff] text-white text-[12px] font-bold hover:bg-[#1e53e5] transition-all disabled:opacity-25 disabled:cursor-not-allowed">
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            {playing ? "Pausar" : "Play"}
          </button>
          {/* Step forward */}
          <button onClick={() => { setPlaying(false); advanceOne(); }} disabled={showDecision || finished || !!answeredQ}
            className="p-2 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] transition-all hover:bg-[#2a2e39]/50 disabled:opacity-25">
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          {/* Reset */}
          <button onClick={resetSim}
            className="p-2 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] transition-all hover:bg-[#2a2e39]/50">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="h-5 w-px bg-[#2a2e39] mx-1" />
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-[3px] bg-[#2a2e39] rounded-full overflow-hidden">
              <div className="h-full bg-[#2962ff] rounded-full transition-all" style={{ width: `${((candleIndex + 1) / candles.length) * 100}%` }} />
            </div>
            <span className="text-[10px] text-[#787b86] font-mono">{candleIndex + 1}/{candles.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {decisions.length > 0 && (
            <>
              <span className="text-[10px] text-[#787b86]">Decisões:</span>
              <div className="flex gap-1.5">
                {decisions.map((d, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${d === "correct" ? "bg-[#26a69a]" : "bg-[#ef5350]"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function PraticaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("prep");
  const { savePrep, saveTrade } = useProgress();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl border text-[14px] font-semibold transition-all ${
                active
                  ? "border-white/[0.20] bg-white/[0.05] text-white"
                  : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12] hover:bg-white/[0.02]"
              }`}>
              <tab.icon className="w-4 h-4" style={active ? { color: tab.accent } : undefined} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "prep" && <PrepSheet onSave={savePrep} />}
      {activeTab === "diario" && <TradeJournal onSave={saveTrade} />}
      {activeTab === "treino" && <TreinoTab />}
    </div>
  );
}
