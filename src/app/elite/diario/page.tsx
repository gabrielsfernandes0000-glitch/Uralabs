"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Sparkles, HelpCircle } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { TickerTape } from "@/components/elite/TickerTape";
import { PositionCalculator } from "@/components/elite/PositionCalculator";
import { PreTradeChecklist } from "@/components/elite/PreTradeChecklist";
import { TradeJournalForm } from "@/components/elite/TradeJournalForm";
import { BrokerImportPanel } from "@/components/elite/BrokerImportPanel";
import { CsvImportPanel } from "@/components/elite/CsvImportPanel";
import { TradesList } from "@/components/elite/TradesList";
import { TradeMetricsPanel } from "@/components/elite/TradeMetricsPanel";
import { OnboardingWizard } from "@/components/elite/OnboardingWizard";
import { JourneyStatusBar } from "@/components/elite/JourneyStatusBar";
import { PrepSheet } from "@/components/elite/PrepSheet";
import { TodayTradesSummary } from "@/components/elite/TodayTradesSummary";
import { DiarioTour } from "@/components/elite/DiarioTour";
import { detectJourney, JOURNEY_META, type Journey } from "@/lib/journey";

/* ────────────────────────────────────────────
   Diário — jornada-based + tour guiado.
   ──────────────────────────────────────────── */

export default function DiarioPage() {
  const { progress } = useProgress();

  const [autoJourney, setAutoJourney] = useState<Journey>(() => detectJourney());
  const [manualJourney, setManualJourney] = useState<Journey | null>(null);
  const journey = manualJourney ?? autoJourney;

  const [tourActive, setTourActive] = useState(false);
  const [tourAutoDismissed, setTourAutoDismissed] = useState(false);

  // Re-detecta jornada a cada 5min
  useEffect(() => {
    const id = setInterval(() => setAutoJourney(detectJourney()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-abre o tour UMA ÚNICA VEZ por sessão, pós-onboarding.
  // Usa flag local `tourAutoDismissed` pra não reabrir mesmo se o server
  // strippar `tourCompletedAt` (edge function whitelist).
  useEffect(() => {
    if (!progress) return;
    if (tourAutoDismissed) return;
    if (progress.tourCompletedAt) return;
    if (!progress.onboardingCompletedAt) return;
    const t = setTimeout(() => setTourActive(true), 600);
    return () => clearTimeout(t);
    // Deps mínimas — só dispara na primeira vez que as condições são verdadeiras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.onboardingCompletedAt, progress?.tourCompletedAt, tourAutoDismissed]);

  const handleTourDone = () => {
    setTourActive(false);
    setTourAutoDismissed(true); // trava qualquer re-abertura nesta sessão
  };

  const showOnboarding = progress && !progress.onboardingCompletedAt;

  return (
    <div className="space-y-5">
      {/* Onboarding modal (bloqueante na primeira visita) */}
      {showOnboarding && <OnboardingWizard />}

      {/* Tour guiado (spotlight + balões explicativos) */}
      <DiarioTour
        active={tourActive}
        onDone={handleTourDone}
        onJourneyChange={(j) => setManualJourney(j)}
      />

      {/* Header com CTA de tour */}
      <div className="animate-in-up flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-1 h-7 rounded-full bg-brand-500/60" />
          <div className="min-w-0">
            <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">Diário</h1>
            <p className="text-[12px] text-white/40 mt-0.5">Planeje antes, registre durante, revise depois.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTourActive(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/[0.08] hover:border-white/[0.2] text-[11.5px] font-semibold text-white/55 hover:text-white transition-colors shrink-0"
          title="Abrir o tour guiado da página"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Tour guiado
        </button>
      </div>

      {/* Ticker tape */}
      <div className="animate-in-up delay-1">
        <TickerTape />
      </div>

      {/* Status bar unificada */}
      <div className="animate-in-up delay-1" data-tour="journey-status-bar">
        <JourneyStatusBar />
      </div>

      {/* Jornadas — underline tabs */}
      <div
        className="animate-in-up delay-2 flex items-center gap-5 sm:gap-6 border-b border-white/[0.05]"
        data-tour="journey-tabs"
      >
        {(["antes", "durante", "depois"] as Journey[]).map((j) => {
          const meta = JOURNEY_META[j];
          const active = journey === j;
          return (
            <button
              key={j}
              type="button"
              onClick={() => setManualJourney(manualJourney === j ? null : j)}
              className="relative flex flex-col items-start py-2.5 sm:py-3 group"
            >
              <span className={`text-[13.5px] font-semibold transition-colors ${active ? "text-white" : "text-white/45 group-hover:text-white/75"}`}>
                {meta.label}
              </span>
              <span className={`hidden sm:inline text-[10.5px] transition-colors ${active ? "text-white/45" : "text-white/25"}`}>
                {meta.hint}
              </span>
              {active && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-brand-500" />
              )}
            </button>
          );
        })}
        {manualJourney && (
          <button
            type="button"
            onClick={() => setManualJourney(null)}
            className="ml-auto pb-2.5 sm:pb-3 text-[10.5px] text-white/30 hover:text-white/70 transition-colors"
            title="Voltar pra jornada automática pelo horário"
          >
            seguir horário
          </button>
        )}
      </div>

      {/* Conteúdo por jornada */}
      {journey === "antes" && <JourneyAntes />}
      {journey === "durante" && <JourneyDurante />}
      {journey === "depois" && <JourneyDepois />}
    </div>
  );
}

/* ────────── Jornada: ANTES ────────── */
function JourneyAntes() {
  const { savePrep, progress } = useProgress();
  const todayBR = useMemo(() => {
    const d = new Date();
    const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return br.toISOString().split("T")[0];
  }, []);
  const prepToday = progress?.preps?.[todayBR];

  return (
    <div className="animate-in-up delay-3 space-y-4">
      <section data-tour="prep-sheet">
        <div className="flex items-center gap-2 mb-3 px-1">
          <FileText className="w-3.5 h-3.5 text-white/40" />
          <h2 className="text-[14px] font-semibold text-white tracking-tight">Plano pré-mercado</h2>
          {prepToday && (
            <span className="text-[10.5px] text-emerald-400/70">· salvo</span>
          )}
        </div>
        <PrepSheet onSave={savePrep} existing={prepToday} />
      </section>

      <section data-tour="pre-trade-tools">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="w-3.5 h-3.5 text-white/40" />
          <h2 className="text-[14px] font-semibold text-white tracking-tight">Ferramentas pré-trade</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <PositionCalculator />
          <PreTradeChecklist />
        </div>
      </section>
    </div>
  );
}

/* ────────── Jornada: DURANTE ────────── */
function JourneyDurante() {
  const [importMode, setImportMode] = useState<"broker" | "csv" | null>(null);

  return (
    <div className="animate-in-up delay-3 space-y-4">
      <div
        className="flex items-center gap-2 text-[11.5px] text-white/50 flex-wrap"
        data-tour="import-toggle"
      >
        <span>Importar trades:</span>
        <button
          type="button"
          onClick={() => setImportMode(importMode === "broker" ? null : "broker")}
          className={`px-2.5 py-1 rounded-md border transition-colors ${
            importMode === "broker"
              ? "border-brand-500/55 text-brand-400 bg-brand-500/[0.06]"
              : "border-white/[0.08] hover:border-white/[0.18] text-white/65 hover:text-white"
          }`}
        >
          Conectar corretora
        </button>
        <button
          type="button"
          onClick={() => setImportMode(importMode === "csv" ? null : "csv")}
          className={`px-2.5 py-1 rounded-md border transition-colors ${
            importMode === "csv"
              ? "border-brand-500/55 text-brand-400 bg-brand-500/[0.06]"
              : "border-white/[0.08] hover:border-white/[0.18] text-white/65 hover:text-white"
          }`}
        >
          Arquivo CSV
        </button>
      </div>

      {importMode === "broker" && <BrokerImportPanel />}
      {importMode === "csv" && <CsvImportPanel />}

      <div data-tour="trade-journal-form">
        <TradeJournalForm />
      </div>

      <section data-tour="today-trades">
        <div className="flex items-center gap-2 mb-3 px-1">
          <h2 className="text-[14px] font-semibold text-white tracking-tight">Trades de hoje</h2>
        </div>
        <TodayTradesSummary />
      </section>
    </div>
  );
}

/* ────────── Jornada: DEPOIS ────────── */
function JourneyDepois() {
  return (
    <div className="animate-in-up delay-3 space-y-5">
      <TradeMetricsPanel />

      <section data-tour="trades-history">
        <div className="flex items-center gap-2 mb-3 px-1">
          <h2 className="text-[14px] font-semibold text-white tracking-tight">Histórico</h2>
          <span className="text-[10.5px] text-white/35">— todos os trades registrados</span>
        </div>
        <TradesList />
      </section>
    </div>
  );
}
