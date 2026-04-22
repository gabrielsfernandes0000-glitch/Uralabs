"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowRight, Check, Wallet, Link2, Target, X, AlertCircle,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import type { Goal } from "@/lib/progress";

type Step = 1 | 2 | 3;

const METRICS: { id: Goal["metric"]; label: string; unit: string; defaultTarget: number; hint: string }[] = [
  { id: "totalR",         label: "Total R na semana",      unit: "R",  defaultTarget: 5,  hint: "Soma de R acumulada" },
  { id: "winRate",        label: "Win rate mínimo",        unit: "%",  defaultTarget: 55, hint: "Win sobre total" },
  { id: "disciplineRate", label: "Disciplina (seguir plano)", unit: "%", defaultTarget: 80, hint: "Trades no plano, zero erro" },
  { id: "trades",         label: "Trades registrados",     unit: "",   defaultTarget: 5,  hint: "Engajamento de registro" },
];

/**
 * Wizard de 3 passos exibido em /elite/diario quando o usuário ainda não
 * passou pelo onboarding.
 *
 * Regras de robustez:
 *  - Portal pro body escapa stacking context da sidebar.
 *  - Sem trava de scroll no body (modal já é scrollable internamente).
 *  - "X" no canto + click no backdrop fecham sem await (escape imediato).
 *  - Buttons finais têm loading state e try/catch com mensagem de erro.
 *  - Marca local-first no `dismissed` state pra garantir que o modal fecha
 *    mesmo se o server falhar.
 */
export function OnboardingWizard() {
  const { progress, saveAccountBalance, saveGoal, completeOnboarding } = useProgress();
  const [step, setStep] = useState<Step>(1);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [balance, setBalance] = useState<string>(progress?.accountBalance ? String(progress.accountBalance) : "");

  // Step 3
  const [metric, setMetric] = useState<Goal["metric"]>("totalR");
  const activeMetric = METRICS.find((m) => m.id === metric)!;
  const [target, setTarget] = useState<number>(activeMetric.defaultTarget);

  // Portal só monta no client — evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Não renderiza se já completou OU se o user dismissou nesta sessão
  if (!progress || progress.onboardingCompletedAt || dismissed) return null;
  if (!mounted) return null;

  const parseBalance = (): number | null => {
    const clean = balance.trim().replace(/[^\d.,-]/g, "").replace(",", ".");
    const n = parseFloat(clean);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  /** Close imediato: seta dismissed local + tenta persistir em paralelo.
   *  Não aguarda network — user nunca fica preso por causa de server lento. */
  const closeNow = () => {
    setDismissed(true);
    // fire-and-forget — se falhar, o dismissed local já fechou o modal
    completeOnboarding().catch(() => {});
  };

  const handleFinish = async (withMeta: boolean) => {
    setError(null);
    setSaving(true);
    try {
      const parsed = parseBalance();
      if (parsed != null) await saveAccountBalance(parsed);

      if (withMeta) {
        const monday = (() => {
          const d = new Date();
          const dow = d.getDay();
          const diff = dow === 0 ? -6 : 1 - dow;
          d.setDate(d.getDate() + diff);
          return d.toISOString().split("T")[0];
        })();
        const goal: Goal = {
          id: `goal_${Date.now()}`,
          createdAt: new Date().toISOString(),
          period: "weekly",
          startDate: monday,
          metric,
          target,
          direction: metric === "maxMistakes" ? "max" : "min",
        };
        await saveGoal(goal);
      }
      await completeOnboarding();
      setDismissed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleMetricChange = (id: Goal["metric"]) => {
    setMetric(id);
    const m = METRICS.find((x) => x.id === id);
    if (m) setTarget(m.defaultTarget);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        // Click no backdrop (não em filho) → fecha
        if (e.target === e.currentTarget) closeNow();
      }}
    >
      <div className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0e0e10] border border-white/[0.08] shadow-2xl">
        {/* X close no canto — sempre funcional */}
        <button
          onClick={closeNow}
          className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors z-10"
          title="Fechar"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header com progresso */}
        <div className="px-5 py-4 border-b border-white/[0.04] pr-12">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14.5px] font-semibold text-white tracking-tight">Vamos deixar o diário pronto</h3>
            <span className="text-[10.5px] text-white/35 font-mono tabular-nums">{step}/3</span>
          </div>
          <p className="text-[11.5px] text-white/45 mt-0.5">
            3 passos rápidos — pode pular qualquer um ou fechar no X.
          </p>
        </div>

        {/* Progress bar — 1 linha única com fill proporcional */}
        <div className="h-[2px] bg-white/[0.04]">
          <div
            className="h-full bg-brand-500/75 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-md bg-red-500/[0.06] border border-red-500/25 px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-red-200 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Steps */}
        <div className="p-5">
          {step === 1 && (
            <StepBalance
              balance={balance}
              onChange={setBalance}
              onNext={() => setStep(2)}
              onSkip={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepBroker
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepGoal
              metric={metric}
              activeMetric={activeMetric}
              target={target}
              saving={saving}
              onMetricChange={handleMetricChange}
              onTargetChange={setTarget}
              onFinish={() => handleFinish(true)}
              onSkip={() => handleFinish(false)}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ────────────── Steps ────────────── */

function StepBalance({
  balance, onChange, onNext, onSkip,
}: {
  balance: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const valid = (() => {
    const clean = balance.trim().replace(",", ".");
    const n = parseFloat(clean);
    return Number.isFinite(n) && n > 0;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Wallet className="w-4 h-4 text-white/40 mt-0.5 shrink-0" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13.5px] font-semibold text-white">Saldo da conta</h4>
          <p className="text-[11.5px] text-white/45 mt-0.5 leading-relaxed">
            Usamos pra calcular tamanho de posição por risco. Fica local, nunca é enviado pra terceiros.
          </p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-white/55 mb-2">
          Saldo <span className="text-white/30">· USD ou moeda equivalente</span>
        </p>
        <input
          type="text"
          inputMode="decimal"
          value={balance}
          onChange={(e) => onChange(e.target.value)}
          placeholder="10000"
          className="w-full px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] focus:border-white/[0.2] text-[14px] font-mono tabular-nums text-white placeholder-white/20 outline-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={onSkip}
          type="button"
          className="text-[11.5px] text-white/40 hover:text-white/75 transition-colors"
        >
          Pular esse passo
        </button>
        <button
          onClick={onNext}
          type="button"
          disabled={!valid}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-[12.5px] font-semibold transition-colors ${
            valid
              ? "border-brand-500 text-brand-500 hover:bg-brand-500/[0.06]"
              : "border-white/[0.06] text-white/25 cursor-not-allowed"
          }`}
        >
          Próximo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepBroker({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Link2 className="w-4 h-4 text-white/40 mt-0.5 shrink-0" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13.5px] font-semibold text-white">Corretora (opcional)</h4>
          <p className="text-[11.5px] text-white/45 mt-0.5 leading-relaxed">
            Conecte uma API read-only pra importar trades automaticamente, ou siga registrando no manual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Link
          href="/elite/corretora"
          target="_blank"
          className="rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.14] p-4 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Link2 className="w-3.5 h-3.5 text-brand-500" />
            <p className="text-[12.5px] font-semibold text-white">Conectar corretora</p>
          </div>
          <p className="text-[11px] text-white/45 leading-relaxed">
            BingX, Binance, Bybit, OKX ou Bitget. Abre em nova aba.
          </p>
          <p className="text-[10px] text-white/30 mt-2 inline-flex items-center gap-1 group-hover:text-white/55 transition-colors">
            Abrir configuração <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.14] p-4 text-left transition-colors"
        >
          <p className="text-[12.5px] font-semibold text-white mb-1.5">Vou registrar manual</p>
          <p className="text-[11px] text-white/45 leading-relaxed">
            Sem API. Você preenche cada trade no form do diário.
          </p>
          <p className="text-[10px] text-white/30 mt-2 inline-flex items-center gap-1">
            Continuar <ArrowRight className="w-3 h-3" />
          </p>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="text-[11.5px] text-white/40 hover:text-white/75 transition-colors"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-white/[0.12] text-[12.5px] font-semibold text-white/70 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          Próximo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepGoal({
  metric, activeMetric, target, saving, onMetricChange, onTargetChange, onFinish, onSkip, onBack,
}: {
  metric: Goal["metric"];
  activeMetric: typeof METRICS[number];
  target: number;
  saving: boolean;
  onMetricChange: (m: Goal["metric"]) => void;
  onTargetChange: (n: number) => void;
  onFinish: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Target className="w-4 h-4 text-white/40 mt-0.5 shrink-0" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13.5px] font-semibold text-white">Primeira meta semanal</h4>
          <p className="text-[11.5px] text-white/45 mt-0.5 leading-relaxed">
            Uma meta pequena e realista. Dá pra editar ou trocar depois em Performance.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-white/55">Métrica</p>
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m) => {
            const active = metric === m.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => onMetricChange(m.id)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "border-brand-500/55 bg-brand-500/[0.06]"
                    : "border-white/[0.05] hover:border-white/[0.15]"
                }`}
              >
                <p className={`text-[12px] font-semibold ${active ? "text-brand-400" : "text-white/75"}`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{m.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-white/55 mb-2">
          Alvo {activeMetric.unit && <span className="text-white/30">· {activeMetric.unit}</span>}
        </p>
        <div className="flex items-stretch gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={target}
            onChange={(e) => {
              const clean = e.target.value.replace(/[^\d.,-]/g, "").replace(",", ".");
              const n = parseFloat(clean);
              onTargetChange(Number.isFinite(n) && n >= 0 ? n : 0);
            }}
            className="flex-1 min-w-0 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] focus:border-white/[0.2] text-[14px] font-mono tabular-nums text-white outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => onTargetChange(Math.max(0, target - (activeMetric.unit === "%" ? 5 : 1)))}
            className="px-3 rounded-md border border-white/[0.06] hover:border-white/[0.18] text-[13px] font-mono text-white/50 hover:text-white transition-colors"
            aria-label="Diminuir"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => onTargetChange(target + (activeMetric.unit === "%" ? 5 : 1))}
            className="px-3 rounded-md border border-white/[0.06] hover:border-white/[0.18] text-[13px] font-mono text-white/50 hover:text-white transition-colors"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="text-[11.5px] text-white/40 hover:text-white/75 transition-colors disabled:opacity-50"
        >
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="text-[11.5px] text-white/40 hover:text-white/75 transition-colors disabled:opacity-50"
          >
            Pular meta
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-[12.5px] font-semibold transition-colors ${
              saving
                ? "border-white/[0.06] text-white/30 cursor-wait"
                : "border-brand-500 text-brand-500 hover:bg-brand-500/[0.06]"
            }`}
          >
            {saving ? (
              <>
                <span className="w-3 h-3 border-[1.5px] border-white/20 border-t-white/60 rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Salvar e começar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
