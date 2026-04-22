"use client";

import { useMemo, useState } from "react";
import { BookMarked, Sparkles, Check, ChevronDown, X, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import {
  currentWeekKey, currentWeekRange, filterWeekRange, isoWeekKey,
  computeOverview, computeSetupBreakdown, computeMistakeImpact,
} from "@/lib/trade-metrics";
import type { WeeklyReview as WeeklyReviewType } from "@/lib/progress";
import { mistakeById } from "@/lib/playbook";

/**
 * Ritual semanal estruturado — aparece como card no Stats panel.
 *
 * Toda sexta/sábado/domingo pede reflexão escrita sobre a semana:
 *   1. O que funcionou (setup ganhador, disciplina consistente)
 *   2. O que drenou (mistake recorrente, setup tóxico)
 *   3. Padrão recorrente (AI-detectável no futuro — por ora manual)
 *   4. Commit pra próxima semana
 *   5. Rating 1-5
 *
 * Inspirado em Jack Schwager's Market Wizards framework e Edgewonk weekly review.
 *
 * O componente também mostra HISTÓRICO de reviews anteriores pra trader releer.
 */

const RATING_LABELS = [
  { v: 1, label: "Semana crítica", color: "#EF4444" },
  { v: 2, label: "Abaixo",         color: "#F59E0B" },
  { v: 3, label: "Neutra",         color: "#6B7280" },
  { v: 4, label: "Produtiva",      color: "#10B981" },
  { v: 5, label: "Excelente",      color: "#3B82F6" },
];

export function WeeklyReviewCard() {
  const { progress, saveReview } = useProgress();
  const [expanded, setExpanded] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const trades = progress?.trades ?? [];
  const reviews = progress?.reviews ?? {};
  const weekKey = currentWeekKey();
  const [weekStart, weekEnd] = currentWeekRange();

  // Auto-suggest: prompt aparece sexta (5) ou sábado (6) ou domingo (0)
  const dayOfWeek = new Date().getDay();
  const isWeekendPrompt = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

  const hasCurrentReview = !!reviews[weekKey];

  const weekTrades = useMemo(() => filterWeekRange(trades, weekStart, weekEnd), [trades, weekStart, weekEnd]);
  const weekOverview = useMemo(() => computeOverview(weekTrades), [weekTrades]);
  const weekSetups = useMemo(() => computeSetupBreakdown(weekTrades), [weekTrades]);
  const weekMistakes = useMemo(() => computeMistakeImpact(weekTrades), [weekTrades]);

  const pastReviews = useMemo(() => {
    return Object.values(reviews)
      .filter((r) => r.weekKey !== weekKey)
      .sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  }, [reviews, weekKey]);

  if (weekTrades.length === 0 && !hasCurrentReview && pastReviews.length === 0) {
    return null; // Nada a revisar ainda
  }

  // Suggestion strings auto-geradas
  const topSetup = weekSetups.find((s) => s.totalR > 0);
  const worstSetup = weekSetups.find((s) => s.totalR < 0);
  const topMistake = weekMistakes[0]; // mais negativo
  const suggestedWorked = topSetup ? `${topSetup.setupName} performou bem (+${topSetup.totalR.toFixed(2)}R em ${topSetup.trades} trades)` : "";
  const suggestedDrained = topMistake ? `Erros de ${topMistake.tagName} (${topMistake.count}x, ${topMistake.rLost.toFixed(2)}R)` : worstSetup ? `${worstSetup.setupName} drenou ${worstSetup.totalR.toFixed(2)}R` : "";

  if (hasCurrentReview && !expanded) {
    const r = reviews[weekKey];
    return (
      <button
        onClick={() => { setSelectedWeek(weekKey); setExpanded(true); }}
        className="w-full flex items-center gap-3 p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/25 hover:bg-emerald-500/[0.08] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white">Review da semana {weekKey} feito</p>
          <p className="text-[11px] text-white/50 line-clamp-1">{r.commitNext || "Ver detalhes"}</p>
        </div>
        {pastReviews.length > 0 && (
          <span className="text-[10px] text-white/35 shrink-0">+{pastReviews.length} prévias</span>
        )}
        <ChevronDown className="w-4 h-4 text-white/35 shrink-0" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-brand-500" />
          <h3 className="text-[15px] font-bold text-white tracking-tight">
            Review Semanal
            <span className="text-white/35 font-mono text-[11px] ml-2">{weekKey}</span>
          </h3>
          {isWeekendPrompt && !hasCurrentReview && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Hora do review
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-white/40 hover:text-white/80 transition-colors"
        >
          {expanded ? "Fechar" : hasCurrentReview ? "Ver review" : "Fazer review"}
        </button>
      </div>

      {!expanded && !hasCurrentReview && (
        <div>
          <p className="text-[11.5px] text-white/50 leading-relaxed mb-3">
            Pare 10min pra refletir sobre a semana. Escrever transforma sensação em padrão, padrão em edge.
          </p>
          <WeekStatsStrip ov={weekOverview} weekStart={weekStart} weekEnd={weekEnd} />
        </div>
      )}

      {expanded && (
        <>
          {selectedWeek && reviews[selectedWeek] && selectedWeek !== weekKey ? (
            <ReviewViewer review={reviews[selectedWeek]} onClose={() => { setSelectedWeek(null); setExpanded(false); }} />
          ) : (
            <ReviewForm
              weekKey={weekKey}
              weekStart={weekStart}
              weekEnd={weekEnd}
              overview={weekOverview}
              suggestedWorked={suggestedWorked}
              suggestedDrained={suggestedDrained}
              existing={reviews[weekKey] ?? null}
              onSave={async (r) => {
                await saveReview(r);
                setExpanded(false);
              }}
            />
          )}

          {pastReviews.length > 0 && (
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-2">Reviews anteriores</p>
              <div className="space-y-1">
                {pastReviews.slice(0, 6).map((r) => (
                  <button
                    key={r.weekKey}
                    onClick={() => setSelectedWeek(r.weekKey)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <Calendar className="w-3 h-3 text-white/35 shrink-0" />
                    <span className="text-[11px] font-mono text-white/60 shrink-0">{r.weekKey}</span>
                    <span className="text-[10.5px] text-white/45 truncate flex-1">
                      {r.commitNext.slice(0, 60) || r.whatWorked.slice(0, 60) || "Sem commit"}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: RATING_LABELS[r.rating - 1]?.color }}>
                      {r.rating}/5
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WeekStatsStrip({
  ov, weekStart, weekEnd,
}: {
  ov: ReturnType<typeof computeOverview>;
  weekStart: string;
  weekEnd: string;
}) {
  const rColor = ov.totalR > 0 ? "#10B981" : ov.totalR < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";
  return (
    <div className="flex items-center gap-4 flex-wrap text-[10.5px]">
      <span className="text-white/35 font-mono">{weekStart} → {weekEnd}</span>
      <span className="text-white/20">·</span>
      <span className="text-white/50">{ov.total} trades</span>
      {ov.total > 0 && (
        <>
          <span className="text-white/20">·</span>
          <span className="font-mono tabular-nums font-bold" style={{ color: rColor }}>
            {ov.totalR > 0 ? "+" : ""}{ov.totalR.toFixed(2)}R
          </span>
          <span className="text-white/20">·</span>
          <span className="text-white/50 font-mono">WR {ov.winRate.toFixed(0)}%</span>
          <span className="text-white/20">·</span>
          <span className="text-white/50 font-mono">
            Disciplina {ov.disciplineRate}%
          </span>
        </>
      )}
    </div>
  );
}

function ReviewForm({
  weekKey, weekStart, weekEnd, overview, suggestedWorked, suggestedDrained, existing, onSave,
}: {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  overview: ReturnType<typeof computeOverview>;
  suggestedWorked: string;
  suggestedDrained: string;
  existing: WeeklyReviewType | null;
  onSave: (r: WeeklyReviewType) => Promise<void> | void;
}) {
  const [whatWorked, setWhatWorked] = useState(existing?.whatWorked ?? "");
  const [whatDrained, setWhatDrained] = useState(existing?.whatDrained ?? "");
  const [recurringPattern, setRecurringPattern] = useState(existing?.recurringPattern ?? "");
  const [commitNext, setCommitNext] = useState(existing?.commitNext ?? "");
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating !== null && (whatWorked.trim().length > 3 || whatDrained.trim().length > 3);

  const submit = async () => {
    if (!canSubmit || rating == null) return;
    setSubmitting(true);
    const review: WeeklyReviewType = {
      weekKey,
      startDate: weekStart,
      endDate: weekEnd,
      whatWorked: whatWorked.trim(),
      whatDrained: whatDrained.trim(),
      recurringPattern: recurringPattern.trim(),
      commitNext: commitNext.trim(),
      rating,
      createdAt: new Date().toISOString(),
    };
    await onSave(review);
    setSubmitting(false);
  };

  const fillSuggested = (which: "worked" | "drained") => {
    if (which === "worked") setWhatWorked((v) => v || suggestedWorked);
    else setWhatDrained((v) => v || suggestedDrained);
  };

  return (
    <div className="space-y-4">
      <WeekStatsStrip ov={overview} weekStart={weekStart} weekEnd={weekEnd} />

      <ReflectionField
        label="1. O que funcionou essa semana?"
        icon={TrendingUp}
        accent="#10B981"
        value={whatWorked}
        onChange={setWhatWorked}
        placeholder="Setup que performou, disciplina consistente, decisão HTF acertada..."
        suggestion={suggestedWorked}
        onUseSuggestion={suggestedWorked ? () => fillSuggested("worked") : undefined}
      />

      <ReflectionField
        label="2. O que drenou conta ou R?"
        icon={AlertTriangle}
        accent="#EF4444"
        value={whatDrained}
        onChange={setWhatDrained}
        placeholder="Mistake recorrente, setup tóxico, hora de baixa performance..."
        suggestion={suggestedDrained}
        onUseSuggestion={suggestedDrained ? () => fillSuggested("drained") : undefined}
      />

      <ReflectionField
        label="3. Padrão recorrente detectado"
        icon={Sparkles}
        accent="#A78BFA"
        value={recurringPattern}
        onChange={setRecurringPattern}
        placeholder="Exemplo: 'Todas segundas foram verdes, sextas vermelhas' ou 'Losses quando emoção pré ≤ 2'"
      />

      <ReflectionField
        label="4. Commit pra próxima semana"
        icon={Check}
        accent="#FF5500"
        value={commitNext}
        onChange={setCommitNext}
        placeholder="Uma ação concreta. Ex: 'Não operar na primeira hora pós-loss' ou 'Só trade com bias HTF alinhado'"
      />

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 mb-2">5. Auto-avaliação</p>
        <div className="flex gap-1.5 flex-wrap">
          {RATING_LABELS.map((r) => {
            const active = rating === r.v;
            return (
              <button
                key={r.v}
                onClick={() => setRating(r.v)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-[11.5px] font-semibold transition-colors ${
                  active
                    ? "border-white/[0.2] bg-white/[0.05] text-white"
                    : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.15]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit || submitting}
        className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold transition-colors ${
          canSubmit
            ? "border-brand-500/60 text-brand-500 hover:bg-brand-500/[0.06] hover:border-brand-500"
            : "border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}
      >
        <Check className="w-3.5 h-3.5" />
        {existing ? "Atualizar review" : "Salvar review semanal"}
      </button>
    </div>
  );
}

function ReflectionField({
  label, icon: Icon, accent, value, onChange, placeholder, suggestion, onUseSuggestion,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suggestion?: string;
  onUseSuggestion?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" style={{ color: accent }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">{label}</span>
        </div>
        {onUseSuggestion && (
          <button
            onClick={onUseSuggestion}
            className="text-[10px] text-white/40 hover:text-white/75 transition-colors inline-flex items-center gap-1"
            title={suggestion}
          >
            <Sparkles className="w-2.5 h-2.5" /> usar sugestão
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-16 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[12.5px] text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04]"
      />
      {suggestion && !value && (
        <p className="text-[10px] text-white/30 mt-1 italic line-clamp-1">
          💡 {suggestion}
        </p>
      )}
    </div>
  );
}

function ReviewViewer({ review, onClose }: { review: WeeklyReviewType; onClose: () => void }) {
  const rating = RATING_LABELS[review.rating - 1];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono font-bold text-white">{review.weekKey}</span>
          <span className="text-[11px] text-white/40 font-mono">{review.startDate} → {review.endDate}</span>
          {rating && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rating.color }} />
              {rating.label}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <ViewerField label="O que funcionou" accent="#10B981" value={review.whatWorked} />
      <ViewerField label="O que drenou" accent="#EF4444" value={review.whatDrained} />
      <ViewerField label="Padrão recorrente" accent="#A78BFA" value={review.recurringPattern} />
      <ViewerField label="Commit" accent="#FF5500" value={review.commitNext} />
    </div>
  );
}

function ViewerField({ label, accent, value }: { label: string; accent: string; value: string }) {
  if (!value) return null;
  return (
    <div className="pl-3 border-l-2" style={{ borderColor: accent + "55" }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>{label}</p>
      <p className="text-[12.5px] text-white/80 leading-relaxed mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
