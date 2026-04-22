"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download, RefreshCw, X, Check, ArrowUp, ArrowDown, AlertTriangle,
  Plug,
} from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import {
  transformOrders, groupCandidatesByDate, candidateToPartial, computeR,
  type ExchangeOrder, type ImportCandidate,
} from "@/lib/broker-import";
import { URA_SETUPS, MISTAKE_TAGS, symbolById, type Setup } from "@/lib/playbook";
import type { TradeEntry, Timeframe } from "@/lib/progress";

/**
 * Broker Import — puxa trades da corretora e sugere importação pro diário.
 *
 * Melhorias vs v1:
 *  - Open/close pairing: quando detectamos o par, entry já vem preenchido.
 *  - Batch import: selecione múltiplos e aplique default (timeframe + setup) em todos.
 *  - Visual discreto: sem gradients coloridos, cor só em acento.
 */

const TIMEFRAMES: Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];

interface ExchangeConnection {
  exchange: string;
  label: string | null;
  status: string;
}

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "no-connection" }
  | { status: "error"; message: string }
  | { status: "ready"; candidates: ImportCandidate[]; exchange: string };

export function BrokerImportPanel() {
  const { progress, saveTrade } = useProgress();
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const [selectedCandidate, setSelectedCandidate] = useState<ImportCandidate | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [selectedBatch, setSelectedBatch] = useState<Set<string>>(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const trades = progress?.trades ?? [];

  const fetchCandidates = async () => {
    setState({ status: "loading" });
    try {
      const r = await fetch("/api/exchange/connections");
      if (!r.ok) throw new Error(String(r.status));
      const { connections } = (await r.json()) as { connections: ExchangeConnection[] };
      if (!connections || connections.length === 0) {
        setState({ status: "no-connection" });
        return;
      }
      const primary = connections.find((c) => c.status === "active") ?? connections[0];
      const dataRes = await fetch(`/api/exchange/data?exchange=${primary.exchange}`);
      if (!dataRes.ok && dataRes.status !== 502) throw new Error(String(dataRes.status));
      const data = (await dataRes.json()) as { trades?: ExchangeOrder[]; error?: string };
      if (data.error) {
        setState({ status: "error", message: data.error });
        return;
      }
      const orders = data.trades ?? [];
      const candidates = transformOrders(primary.exchange, orders, trades);
      setState({ status: "ready", candidates, exchange: primary.exchange });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Erro" });
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status === "ready") {
      const updated = state.candidates.map((c) => ({
        ...c,
        alreadyImported: trades.some((t) => t.externalId === c.externalId),
      }));
      setState({ ...state, candidates: updated });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades.length]);

  const pendingCandidates = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.candidates.filter((c) => !c.alreadyImported && !dismissedIds.has(c.externalId));
  }, [state, dismissedIds]);

  const groupedByDate = useMemo(() => groupCandidatesByDate(pendingCandidates), [pendingCandidates]);

  const handleSingleImport = async (c: ImportCandidate, extra: CompleteImportExtra) => {
    await saveTradeFromCandidate(c, extra, saveTrade);
    setSelectedCandidate(null);
  };

  const handleBatchImport = async (extra: BatchImportExtra) => {
    const selected = pendingCandidates.filter((c) => selectedBatch.has(c.externalId) && c.entryPrice != null);
    for (const c of selected) {
      await saveTradeFromCandidate(c, {
        entryNum: c.entryPrice!,
        stopNum: extra.stopPct != null ? c.entryPrice! * (1 + (c.direction === "long" ? -extra.stopPct : extra.stopPct) / 100) : c.entryPrice! * (c.direction === "long" ? 0.98 : 1.02),
        timeframe: extra.timeframe,
        setupId: extra.setupId,
        mistakes: [],
        emotionalBefore: null,
        emotionalAfter: 3,
        followedPlan: true,
        notes: "",
      }, saveTrade);
    }
    setSelectedBatch(new Set());
    setBatchModalOpen(false);
  };

  const toggleBatchSelection = (id: string) => {
    setSelectedBatch((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPaired = () => {
    const pairedIds = pendingCandidates.filter((c) => c.entryPrice != null).map((c) => c.externalId);
    setSelectedBatch(new Set(pairedIds));
  };

  // ───── States ─────

  if (state.status === "loading") {
    return (
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-3 flex items-center gap-3">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-white/55 animate-spin" />
        <p className="text-[12px] text-white/55">Buscando trades da corretora…</p>
      </div>
    );
  }

  if (state.status === "no-connection") {
    return (
      <Link
        href="/elite/corretora"
        className="flex items-center gap-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] px-4 py-3 transition-colors"
      >
        <Plug className="w-3.5 h-3.5 text-white/40" />
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold text-white/75">Conecte sua corretora</p>
          <p className="text-[11px] text-white/40">Importe trades automaticamente em vez de digitar tudo</p>
        </div>
        <span className="text-[11px] text-brand-500 font-semibold">Conectar →</span>
      </Link>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-white/75">Erro ao buscar trades</p>
          <p className="text-[11px] text-white/40 font-mono truncate">{state.message}</p>
        </div>
        <button
          onClick={fetchCandidates}
          className="text-[11px] text-white/55 hover:text-white font-semibold inline-flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Tentar de novo
        </button>
      </div>
    );
  }

  if (state.status === "idle") return null;

  // ───── Ready ─────

  if (pendingCandidates.length === 0) {
    return (
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-3 flex items-center gap-3">
        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2.2} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-white/75">Corretora sincronizada</p>
          <p className="text-[11px] text-white/40">{state.exchange} · todos os trades recentes já estão no diário</p>
        </div>
        <button
          onClick={fetchCandidates}
          title="Atualizar"
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const pairedCount = pendingCandidates.filter((c) => c.entryPrice != null).length;
  const batchSelectedCount = selectedBatch.size;

  return (
    <>
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.04] flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Download className="w-3.5 h-3.5 text-white/55" />
            <p className="text-[12.5px] font-semibold text-white">
              {pendingCandidates.length} {pendingCandidates.length === 1 ? "trade importável" : "trades importáveis"}
            </p>
            <span className="text-[11px] text-white/35">· {state.exchange}</span>
            {pairedCount > 0 && (
              <span className="text-[11px] text-emerald-400/80">· {pairedCount} com entry automática</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {batchSelectedCount > 0 && (
              <button
                onClick={() => setBatchModalOpen(true)}
                className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Importar {batchSelectedCount} selecionad{batchSelectedCount > 1 ? "os" : "o"}
              </button>
            )}
            {pairedCount > 0 && batchSelectedCount === 0 && (
              <button
                onClick={selectAllPaired}
                className="text-[11px] text-white/55 hover:text-white transition-colors"
              >
                Selecionar pareados
              </button>
            )}
            <button
              onClick={fetchCandidates}
              title="Atualizar lista"
              className="text-white/40 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {Array.from(groupedByDate.entries())
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 3)
            .map(([date, candidates]) => (
              <div key={date}>
                <p className="px-4 pt-2 pb-1 text-[10.5px] text-white/40">
                  {formatDateLabel(date)}
                </p>
                {candidates.map((c) => (
                  <CandidateRow
                    key={c.externalId}
                    candidate={c}
                    selected={selectedBatch.has(c.externalId)}
                    onToggleSelect={() => toggleBatchSelection(c.externalId)}
                    onImport={() => setSelectedCandidate(c)}
                    onDismiss={() => setDismissedIds((s) => new Set([...s, c.externalId]))}
                  />
                ))}
              </div>
            ))}
        </div>

        {groupedByDate.size > 3 && (
          <p className="px-4 py-2 text-[11px] text-white/35">
            + {Array.from(groupedByDate.entries()).slice(3).reduce((s, [, cs]) => s + cs.length, 0)} em dias anteriores
          </p>
        )}
      </div>

      {selectedCandidate && (
        <CompleteImportModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onImport={handleSingleImport}
        />
      )}

      {batchModalOpen && (
        <BatchImportModal
          count={batchSelectedCount}
          onClose={() => setBatchModalOpen(false)}
          onImport={handleBatchImport}
        />
      )}
    </>
  );
}

/* ──────────── Helpers ──────────── */

function formatDateLabel(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayKey = today.toISOString().split("T")[0];
  const yesterdayKey = yesterday.toISOString().split("T")[0];
  if (date === todayKey) return "Hoje";
  if (date === yesterdayKey) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

interface CompleteImportExtra {
  entryNum: number;
  stopNum: number;
  timeframe: Timeframe;
  setupId: string;
  mistakes: string[];
  emotionalBefore: number | null;
  emotionalAfter: number;
  followedPlan: boolean;
  notes: string;
}

interface BatchImportExtra {
  timeframe: Timeframe;
  setupId: string;
  stopPct: number | null; // % de distância do entry (auto stop)
}

async function saveTradeFromCandidate(
  c: ImportCandidate,
  extra: CompleteImportExtra,
  saveTrade: (data: Omit<TradeEntry, "id" | "date">) => Promise<void>,
) {
  const rMultiple = computeR(c.direction, extra.entryNum, extra.stopNum, c.exitPrice) ?? 0;
  const data: Omit<TradeEntry, "id" | "date"> = {
    ...candidateToPartial(c),
    entry: extra.entryNum.toString(),
    sl: extra.stopNum.toString(),
    tp: "",
    entryNum: extra.entryNum,
    stopNum: extra.stopNum,
    exitNum: c.exitPrice,
    size: c.quantity,
    result: c.result,
    rr: rMultiple.toFixed(2),
    rMultiple,
    setup: extra.setupId || undefined,
    symbol: c.symbol,
    timeframe: extra.timeframe,
    mistakes: extra.mistakes.length > 0 ? extra.mistakes : undefined,
    emotionalBefore: extra.emotionalBefore ?? undefined,
    followedPlan: extra.followedPlan,
    emotionalAfter: extra.emotionalAfter,
    notes: extra.notes,
    direction: c.direction,
  } as Omit<TradeEntry, "id" | "date">;
  await saveTrade(data);
}

/* ──────────── Row ──────────── */

function CandidateRow({
  candidate: c, selected, onToggleSelect, onImport, onDismiss,
}: {
  candidate: ImportCandidate;
  selected: boolean;
  onToggleSelect: () => void;
  onImport: () => void;
  onDismiss: () => void;
}) {
  const isLong = c.direction === "long";
  const DirIcon = isLong ? ArrowUp : ArrowDown;
  const dirColor = isLong ? "text-emerald-400/80" : "text-red-400/80";
  const profitColor = c.profitUsd > 0 ? "text-emerald-400" : c.profitUsd < 0 ? "text-red-400" : "text-white/50";
  const symbol = symbolById(c.symbol);
  const hour = new Date(c.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  const hasPair = c.entryPrice != null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.015] transition-colors">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        disabled={!hasPair}
        title={hasPair ? "Selecionar pra import em lote" : "Sem entry pareada — importe individualmente"}
        className="w-3 h-3 shrink-0 rounded accent-brand-500 disabled:opacity-30"
      />

      <span className="text-[10.5px] font-mono tabular-nums text-white/40 w-9 shrink-0">{hour}</span>

      <DirIcon className={`w-3 h-3 shrink-0 ${dirColor}`} strokeWidth={2.5} />

      {symbol ? (
        <span
          className="shrink-0 inline-flex items-center px-1.5 py-[1px] rounded text-[10px] font-semibold font-mono leading-none"
          style={{ color: symbol.color, backgroundColor: symbol.color + "12" }}
        >{symbol.label}</span>
      ) : (
        <span className="shrink-0 text-[11px] font-mono text-white/60">{c.symbol}</span>
      )}

      <span className="text-[11px] text-white/55 font-mono tabular-nums truncate">
        {hasPair ? `${c.entryPrice!.toFixed(2)} → ${c.exitPrice.toFixed(2)}` : `exit ${c.exitPrice.toFixed(2)}`}
        <span className="text-white/25"> · {c.quantity.toFixed(4)}</span>
      </span>

      <span className={`text-[11.5px] font-semibold font-mono tabular-nums ml-auto shrink-0 ${profitColor}`}>
        {c.profitUsd > 0 ? "+" : ""}${c.profitUsd.toFixed(2)}
      </span>

      <button
        onClick={onImport}
        className="shrink-0 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
      >
        Importar
      </button>
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded text-white/25 hover:text-white/70 transition-colors"
        title="Dispensar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ──────────── Single Import Modal ──────────── */

function CompleteImportModal({
  candidate: c,
  onClose,
  onImport,
}: {
  candidate: ImportCandidate;
  onClose: () => void;
  onImport: (c: ImportCandidate, extra: CompleteImportExtra) => Promise<void>;
}) {
  const [entry, setEntry] = useState(c.entryPrice != null ? String(c.entryPrice) : "");
  const [stop, setStop] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("M15");
  const [setupId, setSetupId] = useState("");
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [emotionalBefore, setEmotionalBefore] = useState<number | null>(null);
  const [emotionalAfter, setEmotionalAfter] = useState<number>(3);
  const [followedPlan, setFollowedPlan] = useState<boolean>(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const entryN = parseFloat(entry.replace(",", "."));
  const stopN = parseFloat(stop.replace(",", "."));
  const validEntry = Number.isFinite(entryN) && entryN > 0;
  const validStop = Number.isFinite(stopN) && stopN > 0;

  const computedR = validEntry && validStop ? computeR(c.direction, entryN, stopN, c.exitPrice) : null;
  const canSubmit = validEntry && validStop;

  const byCategory = useMemo(() => {
    const m = new Map<Setup["category"], Setup[]>();
    for (const s of URA_SETUPS) {
      if (!m.has(s.category)) m.set(s.category, []);
      m.get(s.category)!.push(s);
    }
    return m;
  }, []);
  const catLabel: Record<Setup["category"], string> = {
    estrutura: "Estrutura", liquidez: "Liquidez", timing: "Timing", contexto: "Contexto",
  };

  const toggleMistake = (id: string) => {
    setMistakes((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const symbol = symbolById(c.symbol);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#141417] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#141417] border-b border-white/[0.05] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-white">Completar importação</h2>
              <p className="text-[11px] text-white/45 mt-0.5">
                Complete entry + stop — o resto veio da corretora
              </p>
            </div>
            <button onClick={onClose} className="shrink-0 text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[11px] flex-wrap">
            {symbol && (
              <span className="inline-flex items-center gap-1.5 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: symbol.color }} />
                {symbol.label}
              </span>
            )}
            <span className="text-white/55">{c.direction === "long" ? "Long" : "Short"}</span>
            <span className="text-white/25">·</span>
            <span className="text-white/55 font-mono">exit {c.exitPrice.toFixed(2)}</span>
            <span className="text-white/25">·</span>
            <span className="text-white/55 font-mono">qty {c.quantity.toFixed(4)}</span>
            <span className="text-white/25">·</span>
            <span
              className="font-semibold font-mono"
              style={{ color: c.result === "win" ? "#10B981" : c.result === "loss" ? "#EF4444" : "rgba(255,255,255,0.55)" }}
            >
              {c.profitUsd > 0 ? "+" : ""}${c.profitUsd.toFixed(2)}
            </span>
            {computedR != null && (
              <>
                <span className="text-white/25">·</span>
                <span
                  className="font-semibold font-mono"
                  style={{ color: computedR > 0 ? "#10B981" : computedR < 0 ? "#EF4444" : "rgba(255,255,255,0.6)" }}
                >
                  {computedR > 0 ? "+" : ""}{computedR.toFixed(2)}R
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-[11.5px] text-white/70 mb-2">Preços</p>
            <div className="grid grid-cols-2 gap-2">
              <PriceField label="Entry" value={entry} onChange={setEntry} placeholder="18.100" autoFilled={c.entryPrice != null && entry === String(c.entryPrice)} />
              <PriceField label="Stop" value={stop} onChange={setStop} placeholder="18.050" accent="#EF4444" />
            </div>
            {c.entryPrice != null && (
              <p className="text-[10.5px] text-emerald-400/75 mt-1.5">Entry preenchida automaticamente da corretora.</p>
            )}
          </div>

          <div>
            <p className="text-[11.5px] text-white/70 mb-2">Timeframe</p>
            <div className="grid grid-cols-7 gap-1.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`py-1.5 rounded border text-[11px] font-semibold font-mono transition-colors ${
                    timeframe === tf
                      ? "border-white/[0.22] bg-white/[0.05] text-white"
                      : "border-white/[0.05] text-white/45 hover:text-white/80 hover:border-white/[0.15]"
                  }`}
                >{tf}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11.5px] text-white/70">Setup</p>
              {setupId && <button onClick={() => setSetupId("")} className="text-[10.5px] text-white/40 hover:text-white/80">Limpar</button>}
            </div>
            <div className="space-y-2">
              {Array.from(byCategory.entries()).map(([cat, setups]) => (
                <div key={cat}>
                  <p className="text-[10px] text-white/35 mb-1">{catLabel[cat]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {setups.map((s) => {
                      const active = setupId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSetupId(s.id)}
                          title={s.description}
                          className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                            active
                              ? "border-brand-500/55 text-brand-400 bg-brand-500/[0.08]"
                              : "border-white/[0.06] text-white/55 hover:text-white/90 hover:border-white/[0.16]"
                          }`}
                        >{s.name}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11.5px] text-white/70 mb-2">
              Erros cometidos
              {mistakes.length > 0 && <span className="ml-1.5 text-white/40">· {mistakes.length}</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MISTAKE_TAGS.map((m) => {
                const active = mistakes.includes(m.id);
                const severityColor = m.severity === 3 ? "#EF4444" : m.severity === 2 ? "#F59E0B" : "#94A3B8";
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMistake(m.id)}
                    title={m.description}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10.5px] font-medium transition-colors ${
                      active
                        ? "border-white/[0.2] bg-white/[0.05] text-white"
                        : "border-white/[0.06] text-white/50 hover:text-white/80 hover:border-white/[0.15]"
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: severityColor }} />
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11.5px] text-white/70 mb-2">Seguiu plano?</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setFollowedPlan(true)}
                  className={`py-1.5 rounded border text-[11px] font-semibold ${
                    followedPlan ? "border-white/[0.2] bg-white/[0.05] text-white" : "border-white/[0.06] text-white/45 hover:text-white/80"
                  }`}
                >Sim</button>
                <button
                  onClick={() => setFollowedPlan(false)}
                  className={`py-1.5 rounded border text-[11px] font-semibold ${
                    !followedPlan ? "border-white/[0.2] bg-white/[0.05] text-white" : "border-white/[0.06] text-white/45 hover:text-white/80"
                  }`}
                >Não</button>
              </div>
            </div>
            <div>
              <p className="text-[11.5px] text-white/70 mb-2">Emoção depois</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setEmotionalAfter(v)}
                    className={`flex-1 py-1.5 rounded border text-[11px] font-semibold transition-colors ${
                      emotionalAfter === v
                        ? "border-white/[0.22] bg-white/[0.05] text-white"
                        : "border-white/[0.06] text-white/45 hover:text-white/80"
                    }`}
                  >{v}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11.5px] text-white/70 mb-2">Aprendizado</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="O que deu certo, o que errou..."
              className="w-full h-16 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.06] text-[12px] text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-white/[0.18]"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#141417] border-t border-white/[0.05] px-5 py-3.5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] text-white/50 hover:text-white/85 font-medium">
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (!canSubmit) return;
              setSubmitting(true);
              await onImport(c, {
                entryNum: entryN, stopNum: stopN, timeframe, setupId, mistakes,
                emotionalBefore, emotionalAfter, followedPlan, notes,
              });
              setSubmitting(false);
            }}
            disabled={!canSubmit || submitting}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-md border text-[12px] font-semibold transition-colors ${
              canSubmit
                ? "border-brand-500 text-brand-500 hover:bg-brand-500/[0.06]"
                : "border-white/[0.06] text-white/25 cursor-not-allowed"
            }`}
          >
            Importar trade
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Batch Import Modal ──────────── */

function BatchImportModal({
  count, onClose, onImport,
}: {
  count: number;
  onClose: () => void;
  onImport: (extra: BatchImportExtra) => Promise<void>;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("M15");
  const [setupId, setSetupId] = useState("");
  const [stopPct, setStopPct] = useState<string>("0.5");
  const [submitting, setSubmitting] = useState(false);

  const stopN = parseFloat(stopPct.replace(",", "."));
  const validStop = Number.isFinite(stopN) && stopN > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#141417] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-white">Importar {count} trades em lote</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Aplica defaults em todos — editar depois trade a trade.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-[11.5px] text-white/70 mb-2">Timeframe padrão</p>
            <div className="grid grid-cols-7 gap-1.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`py-1.5 rounded border text-[11px] font-semibold font-mono transition-colors ${
                    timeframe === tf
                      ? "border-white/[0.22] bg-white/[0.05] text-white"
                      : "border-white/[0.05] text-white/45 hover:text-white/80 hover:border-white/[0.15]"
                  }`}
                >{tf}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11.5px] text-white/70 mb-2">Setup padrão (opcional)</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSetupId("")}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  !setupId ? "border-white/[0.22] bg-white/[0.05] text-white" : "border-white/[0.06] text-white/55 hover:text-white/90"
                }`}
              >Sem setup</button>
              {URA_SETUPS.map((s) => {
                const active = setupId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSetupId(s.id)}
                    title={s.description}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                      active
                        ? "border-brand-500/55 text-brand-400 bg-brand-500/[0.08]"
                        : "border-white/[0.06] text-white/55 hover:text-white/90 hover:border-white/[0.16]"
                    }`}
                  >{s.name}</button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11.5px] text-white/70 mb-2">Stop automático</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={stopPct}
                onChange={(e) => setStopPct(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.06] text-[12px] font-mono text-white focus:outline-none focus:border-white/[0.18]"
              />
              <span className="text-[11px] text-white/55">% do entry</span>
            </div>
            <p className="text-[10.5px] text-white/35 mt-1.5">
              Calcula stop fictício a X% do entry — necessário pra computar R. Ajuste trade a trade se precisar ser preciso.
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-white/[0.05] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] text-white/50 hover:text-white/85 font-medium">
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (!validStop) return;
              setSubmitting(true);
              await onImport({ timeframe, setupId, stopPct: stopN });
              setSubmitting(false);
            }}
            disabled={!validStop || submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md border border-brand-500 text-brand-500 text-[12px] font-semibold hover:bg-brand-500/[0.06] disabled:opacity-50 transition-colors"
          >
            Importar {count} trades
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceField({
  label, value, onChange, placeholder, accent, autoFilled,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; accent?: string; autoFilled?: boolean }) {
  return (
    <div className={`rounded-md border px-3 py-2 transition-colors ${
      autoFilled ? "border-emerald-500/25 bg-emerald-500/[0.03]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14]"
    }`}>
      <span className="text-[10px] font-semibold" style={{ color: (accent ?? "#94A3B8") + "AA" }}>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13.5px] font-mono tabular-nums text-white focus:outline-none placeholder-white/15"
      />
    </div>
  );
}
