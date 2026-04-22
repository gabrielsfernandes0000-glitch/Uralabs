"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp, ArrowDown, Check, Target as TargetIcon, Shield,
  AlertTriangle, TrendingUp, Minus, BookOpen, Brain, Zap, ImagePlus,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import {
  URA_SETUPS, MISTAKE_TAGS, SYMBOLS, computeRMultiple, computePlannedRR,
  type Setup,
} from "@/lib/playbook";
import type { TradeEntry, Timeframe } from "@/lib/progress";
import { ScreenshotUploader } from "./ScreenshotUploader";
import { detectTilt } from "@/lib/tilt-detector";

const TIMEFRAMES: Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];
const EMOTIONAL_LEVELS = [
  { v: 1, label: "Péssimo",   color: "#EF4444" },
  { v: 2, label: "Ruim",      color: "#F59E0B" },
  { v: 3, label: "Neutro",    color: "#6B7280" },
  { v: 4, label: "Bom",       color: "#10B981" },
  { v: 5, label: "Excelente", color: "#3B82F6" },
] as const;

interface Props {
  /** Callback opcional após salvar (ex: reset de um parent). */
  onSaved?: () => void;
}

/**
 * Form canônico de registro de trade — inspirado em TraderSync + Edgewonk.
 *
 * Campos:
 *  - Symbol (obrig) — ticker operado
 *  - Timeframe (obrig) — janela da entrada
 *  - Direction (obrig) — long/short
 *  - Entry / Stop / Target (numeric) — R planejado calcula vivo
 *  - Exit — preenchido ao fechar → R real calculado
 *  - Size (opcional, contratos/lot)
 *  - Setup — de URA_SETUPS
 *  - Result — win/loss/be (auto-sugerido a partir de exit vs entry)
 *  - Mistake tags — multi-select
 *  - Emotional before + after (1-5)
 *  - Followed plan
 *  - Notes
 *  - Screenshot (futuro — placeholder por ora)
 */
export function TradeJournalForm({ onSaved }: Props) {
  const { saveTrade, progress } = useProgress();
  const tiltState = progress ? detectTilt(progress.trades) : { level: "none" as const };
  const tiltCritical = tiltState.level === "critical";
  const [acceptedTiltWarning, setAcceptedTiltWarning] = useState(false);

  const [symbol, setSymbol] = useState<string>("");
  const [customSymbol, setCustomSymbol] = useState<string>("");
  const [timeframe, setTimeframe] = useState<Timeframe | null>(null);
  const [direction, setDirection] = useState<"long" | "short" | null>(null);
  const [openTime, setOpenTime] = useState<string>(() => {
    // default = hora atual BRT
    const d = new Date();
    const brt = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    const hh = String(brt.getUTCHours()).padStart(2, "0");
    const mm = String(brt.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });

  const [entry, setEntry] = useState<string>("");
  const [stop, setStop] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [exit, setExit] = useState<string>("");
  const [size, setSize] = useState<string>("");

  const [setupId, setSetupId] = useState<string>("");
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [emotionalBefore, setEmotionalBefore] = useState<number | null>(null);
  const [emotionalAfter, setEmotionalAfter] = useState<number | null>(null);
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [result, setResult] = useState<"win" | "loss" | "be" | null>(null);
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);

  const [saved, setSaved] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  // Parse numérico seguro (aceita vírgula decimal BR)
  const num = (s: string): number | null => {
    const clean = s.trim().replace(",", ".");
    if (!clean) return null;
    const n = parseFloat(clean);
    return Number.isFinite(n) ? n : null;
  };

  const entryN = num(entry);
  const stopN = num(stop);
  const targetN = num(target);
  const exitN = num(exit);
  const sizeN = num(size);

  // Auto-sugere resultado quando exit preenchido
  const suggestedResult = useMemo((): "win" | "loss" | "be" | null => {
    if (entryN == null || exitN == null || direction == null) return null;
    const pnl = direction === "long" ? exitN - entryN : entryN - exitN;
    if (Math.abs(pnl) < 0.0001) return "be";
    return pnl > 0 ? "win" : "loss";
  }, [entryN, exitN, direction]);

  // R planejado (antes do fechamento) — útil como sanity check
  const plannedRR = useMemo(() => {
    if (direction == null || entryN == null || stopN == null || targetN == null) return null;
    return computePlannedRR(direction, entryN, stopN, targetN);
  }, [direction, entryN, stopN, targetN]);

  // R real (quando exit preenchido)
  const realR = useMemo(() => {
    if (direction == null || entryN == null || stopN == null || exitN == null) return null;
    return computeRMultiple(direction, entryN, stopN, exitN);
  }, [direction, entryN, stopN, exitN]);

  const finalResult = result ?? suggestedResult;
  const effectiveSymbol = symbol === "__custom__" ? customSymbol.trim() : symbol;

  const toggleMistake = (id: string) => {
    setMistakes((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const baseFieldsValid = !!(
    effectiveSymbol &&
    timeframe &&
    direction &&
    entryN != null &&
    stopN != null &&
    finalResult
  );
  const blockedByTilt = tiltCritical && !acceptedTiltWarning;
  const canSubmit = baseFieldsValid && !blockedByTilt;

  const handleSubmit = async () => {
    if (!canSubmit || !direction || !timeframe || !finalResult) return;

    const rMultiple = realR ?? (finalResult === "loss" ? -1 : finalResult === "be" ? 0 : plannedRR ?? 0);

    const data: Omit<TradeEntry, "id" | "date"> = {
      direction,
      entry: entry.trim(),
      sl: stop.trim(),
      tp: target.trim(),
      entryNum: entryN ?? undefined,
      stopNum: stopN ?? undefined,
      targetNum: targetN ?? undefined,
      exitNum: exitN ?? undefined,
      size: sizeN ?? undefined,
      result: finalResult,
      rr: realR != null ? realR.toFixed(2) : plannedRR != null ? plannedRR.toFixed(2) : "",
      rMultiple,
      setup: setupId || undefined,
      symbol: effectiveSymbol,
      timeframe,
      openTime: openTime || undefined,
      mistakes: mistakes.length > 0 ? mistakes : undefined,
      emotionalBefore: emotionalBefore ?? undefined,
      followedPlan: followedPlan ?? false,
      emotionalAfter: emotionalAfter ?? 3,
      notes: notes.trim(),
      screenshotUrl: screenshot,
    };

    await saveTrade(data);
    setSaved(true);
    onSaved?.();
  };

  const resetForm = () => {
    setSymbol(""); setCustomSymbol(""); setTimeframe(null); setDirection(null);
    setEntry(""); setStop(""); setTarget(""); setExit(""); setSize("");
    setSetupId(""); setMistakes([]); setEmotionalBefore(null); setEmotionalAfter(null);
    setFollowedPlan(null); setNotes(""); setResult(null); setShowMistakes(false);
    setScreenshot(undefined);
    setSaved(false);
  };

  if (saved) {
    return (
      <div className="rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/25 p-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
          <Check className="w-6 h-6 text-emerald-400" strokeWidth={2} />
        </div>
        <h3 className="text-[17px] font-bold text-white mb-1">Trade registrado</h3>
        <p className="text-[12px] text-white/50 max-w-md">
          Alimentou seu P&L do dia, estatísticas por setup e detector de padrões.
        </p>
        <button
          onClick={resetForm}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-500/30 text-[12px] font-bold text-emerald-300 hover:bg-emerald-500/[0.08] transition-colors"
        >
          Registrar outro trade
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ───── Header ───── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#151518] to-[#111114] p-4 sm:p-5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        <div className="relative z-10 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-brand-500" strokeWidth={1.8} />
          <div>
            <h3 className="text-[15.5px] sm:text-[17px] font-bold text-white tracking-tight">Registrar trade</h3>
            <p className="text-[11.5px] text-white/45 mt-0.5">Documente setup, erros e emoção. Com volume, vira edge.</p>
          </div>
        </div>
      </div>

      {/* ───── Row 1: Symbol + Timeframe + Direction ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-3">
        <SymbolPicker value={symbol} onChange={setSymbol} custom={customSymbol} onCustomChange={setCustomSymbol} />
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5 space-y-4">
          <TimeframeInline value={timeframe} onChange={setTimeframe} />
          <OpenTimeField value={openTime} onChange={setOpenTime} />
        </div>
        <DirectionPicker value={direction} onChange={setDirection} />
      </div>

      {/* ───── Row 2: Preços (entry / stop / target / exit) ───── */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TargetIcon className="w-3.5 h-3.5 text-white/40" />
            <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Preços</h4>
          </div>
          <div className="flex items-center gap-3 text-[10.5px] font-mono tabular-nums">
            {plannedRR != null && plannedRR > 0 && (
              <span className="text-white/40">
                R planejado: <span className="text-white font-semibold">{plannedRR.toFixed(2)}R</span>
              </span>
            )}
            {realR != null && (
              <span className="text-white/40">
                R real: <span
                  className="font-bold"
                  style={{ color: realR > 0 ? "#10B981" : realR < 0 ? "#EF4444" : "#94A3B8" }}
                >{realR > 0 ? "+" : ""}{realR.toFixed(2)}R</span>
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <PriceField label="Entry"  value={entry}  onChange={setEntry}  accent="#94A3B8" placeholder="18.100" />
          <PriceField label="Stop"   value={stop}   onChange={setStop}   accent="#EF4444" placeholder="18.050" icon={<Shield className="w-3 h-3" />} />
          <PriceField label="Target" value={target} onChange={setTarget} accent="#10B981" placeholder="18.250" icon={<TargetIcon className="w-3 h-3" />} />
          <PriceField label="Exit"   value={exit}   onChange={setExit}   accent="#60A5FA" placeholder="18.235" hint="saída real" />
        </div>
        <div className="mt-2.5">
          <PriceField label="Size / Contratos (opcional)" value={size} onChange={setSize} placeholder="1" compact />
        </div>
      </div>

      {/* ───── Row 3: Setup picker ───── */}
      <SetupPicker value={setupId} onChange={setSetupId} />

      {/* ───── Row 4: Result (auto-suggested) ───── */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/40" />
            <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Resultado</h4>
          </div>
          {suggestedResult && !result && (
            <span className="text-[10px] text-white/40">
              Sugerido automaticamente: <span className="text-white/70 font-semibold uppercase">{suggestedResult === "win" ? "Win" : suggestedResult === "loss" ? "Loss" : "BE"}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "win" as const,  label: "Win",       icon: ArrowUp,   color: "#10B981" },
            { id: "loss" as const, label: "Loss",      icon: ArrowDown, color: "#EF4444" },
            { id: "be" as const,   label: "Breakeven", icon: Minus,     color: "#94A3B8" },
          ]).map((r) => {
            const isActive = finalResult === r.id;
            const isUserSelected = result === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setResult(r.id)}
                className={`interactive-tap flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold transition-colors ${
                  isActive ? "" : "border-white/[0.04] text-white/40 hover:border-white/[0.14] hover:text-white/70"
                }`}
                style={isActive ? {
                  borderColor: r.color + (isUserSelected ? "66" : "33"),
                  color: r.color,
                  backgroundColor: r.color + (isUserSelected ? "10" : "05"),
                } : undefined}
              >
                <r.icon className="w-4 h-4" strokeWidth={2} />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───── Row 5: Mistakes (expandable) ───── */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
        <button
          onClick={() => setShowMistakes(!showMistakes)}
          className="w-full flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80" />
            <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Erros cometidos</h4>
            {mistakes.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold bg-amber-500/[0.15] text-amber-300">
                {mistakes.length}
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/35">
            {showMistakes ? "fechar" : mistakes.length > 0 ? "editar" : "adicionar"}
          </span>
        </button>

        {showMistakes && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MISTAKE_TAGS.map((m) => {
              const active = mistakes.includes(m.id);
              const severityColor = m.severity === 3 ? "#EF4444" : m.severity === 2 ? "#F59E0B" : "#94A3B8";
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMistake(m.id)}
                  title={m.description}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.15]"
                  }`}
                  style={active ? {
                    borderColor: severityColor + "55",
                    backgroundColor: severityColor + "12",
                    color: severityColor,
                  } : undefined}
                >
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: severityColor }} />
                  {m.name}
                </button>
              );
            })}
          </div>
        )}
        {!showMistakes && mistakes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mistakes.map((id) => {
              const tag = MISTAKE_TAGS.find((t) => t.id === id);
              if (!tag) return null;
              const severityColor = tag.severity === 3 ? "#EF4444" : tag.severity === 2 ? "#F59E0B" : "#94A3B8";
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ backgroundColor: severityColor + "12", color: severityColor }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: severityColor }} />
                  {tag.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ───── Row 6: Emoção antes/depois + followed plan ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <EmotionalPicker label="Antes da entrada" icon={Brain} value={emotionalBefore} onChange={setEmotionalBefore} />
        <EmotionalPicker label="Depois do trade" icon={Brain} value={emotionalAfter} onChange={setEmotionalAfter} />
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-white/40" />
            <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Seguiu o plano?</h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFollowedPlan(true)}
              className={`flex-1 py-2.5 rounded-lg border text-[13px] font-bold transition-colors ${
                followedPlan === true
                  ? "border-emerald-400/50 text-emerald-400 bg-emerald-500/[0.06]"
                  : "border-white/[0.04] text-white/40 hover:border-white/[0.14] hover:text-white/70"
              }`}
            >Sim</button>
            <button
              onClick={() => setFollowedPlan(false)}
              className={`flex-1 py-2.5 rounded-lg border text-[13px] font-bold transition-colors ${
                followedPlan === false
                  ? "border-red-400/50 text-red-400 bg-red-500/[0.06]"
                  : "border-white/[0.04] text-white/40 hover:border-white/[0.14] hover:text-white/70"
              }`}
            >Não</button>
          </div>
        </div>
      </div>

      {/* ───── Row 7: Notas ───── */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-4 rounded-full bg-white/[0.25]" />
          <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Aprendizado</h4>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="O que deu certo, o que errou, o que faria diferente…"
          className="w-full h-24 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
        />
      </div>

      {/* ───── Row 8: Screenshot do chart ───── */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <ImagePlus className="w-3.5 h-3.5 text-white/40" />
          <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Screenshot do chart</h4>
          <span className="text-[10px] text-white/30">opcional · aceita Ctrl+V direto do clipboard</span>
        </div>
        <ScreenshotUploader value={screenshot} onChange={setScreenshot} />
      </div>

      {/* ───── Tilt gate ───── */}
      {tiltCritical && !acceptedTiltWarning && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/[0.05] px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-red-300">Tilt crítico detectado</p>
            <p className="text-[11px] text-white/55 mt-0.5 leading-relaxed">
              O sistema detectou múltiplos sinais de tilt. Registrar mais um trade agora pode piorar o drawdown.
              Se estiver revisando um trade passado, confirme abaixo.
            </p>
            <button
              onClick={() => setAcceptedTiltWarning(true)}
              className="mt-2 text-[11px] font-semibold text-white/80 hover:text-white inline-flex items-center gap-1"
            >
              Estou ciente, registrar mesmo assim →
            </button>
          </div>
        </div>
      )}

      {/* ───── Submit ───── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-md border text-[13px] font-semibold transition-colors ${
          canSubmit
            ? "border-brand-500 text-brand-500 hover:bg-brand-500/[0.06]"
            : "border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}
      >
        {canSubmit ? (
          <>
            <Check className="w-3.5 h-3.5" /> Registrar trade
          </>
        ) : blockedByTilt ? (
          "Aceite o aviso de tilt acima pra continuar"
        ) : (
          "Preencha símbolo, timeframe, direção, entry, stop e resultado"
        )}
      </button>
    </div>
  );
}

/* ──────────────────────── Subcomponents ──────────────────────── */

function SymbolPicker({
  value, onChange, custom, onCustomChange,
}: { value: string; onChange: (v: string) => void; custom: string; onCustomChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em] mb-3">Símbolo</h4>
      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
        {SYMBOLS.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              title={s.fullName}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-bold transition-colors ${
                active ? "text-white" : "border-white/[0.06] text-white/55 hover:text-white hover:border-white/[0.15]"
              }`}
              style={active ? { borderColor: s.color + "55", backgroundColor: s.color + "15", color: s.color } : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.label}
            </button>
          );
        })}
        <button
          onClick={() => onChange("__custom__")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-semibold transition-colors ${
            value === "__custom__"
              ? "border-white/[0.25] text-white bg-white/[0.05]"
              : "border-white/[0.06] text-white/35 hover:text-white/65 border-dashed hover:border-white/[0.15]"
          }`}
        >
          + Outro
        </button>
      </div>
      {value === "__custom__" && (
        <input
          type="text"
          value={custom}
          onChange={(e) => onCustomChange(e.target.value.toUpperCase())}
          placeholder="Digite o ticker (ex: USDJPY, XAUUSD)"
          className="mt-2 w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12.5px] font-mono text-white/85 placeholder-white/25 focus:outline-none focus:border-white/[0.15]"
          autoFocus
        />
      )}
    </div>
  );
}

function TimeframeInline({ value, onChange }: { value: Timeframe | null; onChange: (v: Timeframe) => void }) {
  return (
    <div>
      <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em] mb-2">Timeframe</h4>
      <div className="grid grid-cols-4 gap-1.5">
        {TIMEFRAMES.map((tf) => {
          const active = value === tf;
          return (
            <button
              key={tf}
              onClick={() => onChange(tf)}
              className={`py-2 rounded-lg border text-[11.5px] font-bold font-mono transition-colors ${
                active
                  ? "border-white/[0.22] text-white bg-white/[0.05]"
                  : "border-white/[0.06] text-white/40 hover:text-white/75 hover:border-white/[0.15]"
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OpenTimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handleNow = () => {
    const d = new Date();
    const brt = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    const hh = String(brt.getUTCHours()).padStart(2, "0");
    const mm = String(brt.getUTCMinutes()).padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Hora (BRT)</h4>
        <button
          onClick={handleNow}
          className="text-[10px] text-white/40 hover:text-white/75 transition-colors"
        >
          agora
        </button>
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[13px] font-mono tabular-nums text-white/85 focus:outline-none focus:border-white/[0.15]"
      />
    </div>
  );
}

function DirectionPicker({ value, onChange }: { value: "long" | "short" | null; onChange: (v: "long" | "short") => void }) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em] mb-3">Direção</h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange("long")}
          className={`py-3 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
            value === "long"
              ? "border-emerald-400/50 text-emerald-400 bg-emerald-500/[0.06]"
              : "border-white/[0.06] text-white/40 hover:text-white/75 hover:border-white/[0.15]"
          }`}
        >
          <ArrowUp className="w-4 h-4" /> Long
        </button>
        <button
          onClick={() => onChange("short")}
          className={`py-3 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
            value === "short"
              ? "border-red-400/50 text-red-400 bg-red-500/[0.06]"
              : "border-white/[0.06] text-white/40 hover:text-white/75 hover:border-white/[0.15]"
          }`}
        >
          <ArrowDown className="w-4 h-4" /> Short
        </button>
      </div>
    </div>
  );
}

function PriceField({
  label, value, onChange, accent = "#94A3B8", placeholder, icon, hint, compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-[#0a0a0c] border border-white/[0.05] hover:border-white/[0.10] transition-colors ${compact ? "px-3 py-2" : "px-3 py-2.5"}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] flex items-center gap-1" style={{ color: accent + "AA" }}>
          {icon}
          {label}
        </span>
        {hint && <span className="text-[8.5px] text-white/30">{hint}</span>}
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] font-mono tabular-nums text-white focus:outline-none placeholder-white/15"
      />
    </div>
  );
}

function SetupPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const byCategory = useMemo(() => {
    const cats = new Map<Setup["category"], Setup[]>();
    for (const s of URA_SETUPS) {
      if (!cats.has(s.category)) cats.set(s.category, []);
      cats.get(s.category)!.push(s);
    }
    return cats;
  }, []);

  const categoryLabel: Record<Setup["category"], string> = {
    estrutura: "Estrutura",
    liquidez: "Liquidez",
    timing: "Timing",
    contexto: "Contexto",
  };

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-white/40" />
          <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">Setup operado</h4>
        </div>
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-[10px] text-white/35 hover:text-white/70 transition-colors"
          >Limpar</button>
        )}
      </div>
      <div className="space-y-2.5">
        {Array.from(byCategory.entries()).map(([cat, setups]) => (
          <div key={cat}>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30 mb-1.5 px-0.5">
              {categoryLabel[cat]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {setups.map((s) => {
                const active = value === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onChange(s.id)}
                    title={s.description}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-semibold transition-colors ${
                      active
                        ? "border-brand-500/55 text-brand-400 bg-brand-500/[0.08]"
                        : "border-white/[0.06] text-white/50 hover:text-white/80 hover:border-white/[0.15]"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmotionalPicker({
  label, icon: Icon, value, onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-white/40" />
        <h4 className="text-[12px] font-bold text-white/75 uppercase tracking-[0.15em]">{label}</h4>
      </div>
      <div className="flex gap-1">
        {EMOTIONAL_LEVELS.map((e) => {
          const active = value === e.v;
          return (
            <button
              key={e.v}
              onClick={() => onChange(e.v)}
              title={e.label}
              className={`flex-1 h-8 rounded-md transition-colors border ${
                active ? "" : "border-white/[0.04] hover:border-white/[0.14]"
              }`}
              style={active ? {
                borderColor: e.color + "60",
                backgroundColor: e.color + "20",
              } : { backgroundColor: e.color + "08" }}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between px-0.5">
        <span className="text-[9px] text-white/25 uppercase tracking-wider">Péssimo</span>
        <span className="text-[9px] text-white/25 uppercase tracking-wider">Excelente</span>
      </div>
      {value != null && (
        <p className="text-[11px] text-center mt-1.5 font-semibold" style={{ color: EMOTIONAL_LEVELS[value - 1].color }}>
          {EMOTIONAL_LEVELS[value - 1].label}
        </p>
      )}
    </div>
  );
}
