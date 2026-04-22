"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import { calcPositionSize, calcRRRatio } from "@/lib/trading-journal";

/**
 * Calculadora de posição + R:R visualizer — 2-em-1.
 * Inputs: balance, risco %, entry, stop, target.
 * Saídas: tamanho da posição, unidades, risco em USD, R:R, payoff esperado.
 *
 * Persiste balance + risk% em localStorage pra o user não digitar toda vez.
 */

const PREFS_KEY = "elite_calc_prefs_v1";

type Prefs = { balanceUsd: number; riskPercent: number };

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return { balanceUsd: 10000, riskPercent: 1 };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : { balanceUsd: 10000, riskPercent: 1 };
  } catch {
    return { balanceUsd: 10000, riskPercent: 1 };
  }
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function PositionCalculator({
  onApply,
}: {
  onApply?: (result: { sizeUsd: number; riskUsd: number; entry: number; stop: number; target: number | null }) => void;
}) {
  const [balanceUsd, setBalanceUsd] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState(0);
  const [stop, setStop] = useState(0);
  const [target, setTarget] = useState<number | "">("");

  useEffect(() => {
    const p = loadPrefs();
    setBalanceUsd(p.balanceUsd);
    setRiskPercent(p.riskPercent);
  }, []);

  useEffect(() => {
    savePrefs({ balanceUsd, riskPercent });
  }, [balanceUsd, riskPercent]);

  const targetNum = target === "" ? null : Number(target);
  const position = useMemo(
    () => calcPositionSize({ balanceUsd, riskPercent, entry, stop }),
    [balanceUsd, riskPercent, entry, stop],
  );
  const rr = useMemo(() => calcRRRatio(entry, stop, targetNum), [entry, stop, targetNum]);
  const payoffUsd = useMemo(() => {
    if (targetNum == null || entry === 0) return 0;
    const gainPerUnit = Math.abs(targetNum - entry);
    return gainPerUnit * position.units;
  }, [targetNum, entry, position.units]);

  // Validações
  const isValid = entry > 0 && stop > 0 && entry !== stop;
  const directionMatches =
    (direction === "long" && stop < entry) ||
    (direction === "short" && stop > entry);
  const targetMatches =
    targetNum == null ||
    (direction === "long" && targetNum > entry) ||
    (direction === "short" && targetNum < entry);

  const canApply = isValid && directionMatches && targetMatches && position.sizeUsd > 0;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-brand-500" strokeWidth={1.8} />
          <h3 className="text-[13px] font-bold text-white/90">Calculadora de posição</h3>
        </div>
        <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
          {(["long", "short"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-colors ${
                direction === d
                  ? d === "long"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {d === "long" ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Prefs: balance + risk% */}
      <div className="grid grid-cols-2 gap-2.5">
        <LabeledInput
          label="Saldo (USD)"
          value={balanceUsd || ""}
          onChange={(v) => setBalanceUsd(Number(v) || 0)}
          placeholder="10000"
          suffix="$"
        />
        <LabeledInput
          label="Risco por trade"
          value={riskPercent || ""}
          onChange={(v) => setRiskPercent(Number(v) || 0)}
          placeholder="1"
          suffix="%"
          max={10}
        />
      </div>

      {/* Trade setup */}
      <div className="grid grid-cols-3 gap-2.5">
        <LabeledInput
          label="Entry"
          value={entry || ""}
          onChange={(v) => setEntry(Number(v) || 0)}
          placeholder="0.00"
        />
        <LabeledInput
          label="Stop"
          value={stop || ""}
          onChange={(v) => setStop(Number(v) || 0)}
          placeholder="0.00"
        />
        <LabeledInput
          label="Target"
          value={target}
          onChange={(v) => setTarget(v === "" ? "" : Number(v))}
          placeholder="opcional"
        />
      </div>

      {/* Validation warnings */}
      {isValid && !directionMatches && (
        <div className="flex items-start gap-2 rounded-lg surface-card border-l-2 border-l-amber-500 px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Stop inconsistente com direção <span className="font-bold">{direction}</span>.
            {direction === "long" ? " Stop deve ficar abaixo da entry." : " Stop deve ficar acima da entry."}
          </p>
        </div>
      )}
      {targetNum != null && !targetMatches && (
        <div className="flex items-start gap-2 rounded-lg surface-card border-l-2 border-l-amber-500 px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Target do lado errado pra <span className="font-bold">{direction}</span>.
          </p>
        </div>
      )}

      {/* Resultados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <ResultCell label="Tamanho" value={position.sizeUsd > 0 ? `$${position.sizeUsd.toFixed(2)}` : "—"} />
        <ResultCell label="Unidades" value={position.units > 0 ? position.units.toFixed(4) : "—"} />
        <ResultCell label="Risco" value={position.riskUsd > 0 ? `$${position.riskUsd.toFixed(2)}` : "—"} accent="#EF4444" />
        <ResultCell
          label="R:R"
          value={rr != null ? `1:${rr.toFixed(2)}` : "—"}
          accent={rr != null && rr >= 2 ? "#10B981" : rr != null && rr >= 1 ? "#F59E0B" : "#EF4444"}
        />
      </div>

      {targetNum != null && payoffUsd > 0 && (
        <div className="rounded-lg surface-card border-l-2 border-l-emerald-500 px-3 py-2.5">
          <p className="text-[10.5px] text-emerald-400/80 mb-0.5">Payoff potencial</p>
          <p className="text-[15px] font-bold font-mono tabular-nums text-emerald-300">
            +${payoffUsd.toFixed(2)}
            <span className="text-[11px] text-white/40 ml-2">se bater target</span>
          </p>
        </div>
      )}

      {onApply && (
        <button
          onClick={() => canApply && onApply({ sizeUsd: position.sizeUsd, riskUsd: position.riskUsd, entry, stop, target: targetNum })}
          disabled={!canApply}
          className="w-full py-2.5 rounded-lg bg-brand-500 text-white text-[12px] font-bold hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Aplicar no diário
        </button>
      )}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  max,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-[9.5px] text-white/40 mb-1">{label}</label>
      <div className="relative flex items-center rounded-lg bg-[#0a0a0c] border border-white/[0.06] focus-within:border-white/[0.16] transition-colors">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (max != null && Number(v) > max) return;
            onChange(v);
          }}
          placeholder={placeholder}
          step="any"
          className="w-full bg-transparent px-3 py-2 text-[13px] font-mono tabular-nums text-white outline-none placeholder:text-white/20"
        />
        {suffix && (
          <span className="px-2 text-[10.5px] text-white/40 font-mono">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ResultCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-[#0a0a0c] border border-white/[0.05] px-3 py-2.5">
      <p className="text-[9.5px] text-white/35 mb-0.5">{label}</p>
      <p className="text-[14px] font-bold font-mono tabular-nums" style={{ color: accent ?? "#ffffff" }}>
        {value}
      </p>
    </div>
  );
}
