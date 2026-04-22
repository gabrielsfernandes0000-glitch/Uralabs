"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp, ArrowDown, Minus, AlertTriangle, Filter, X, Trash2, ChevronDown, Download,
  Pencil, Check,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import {
  tradeR, setupById, symbolById, mistakeById, URA_SETUPS, MISTAKE_TAGS, SYMBOLS,
  computeRMultiple,
} from "@/lib/playbook";
import type { TradeEntry } from "@/lib/progress";
import { ScreenshotUploader } from "./ScreenshotUploader";
import { TradeIntradayChart } from "./TradeIntradayChart";

/**
 * Lista de trades registrados — agrupada por data.
 * Permite filtrar por setup, symbol, result, mistake.
 * Edit inline + paginação por grupos de datas (evita render de 500+ trades ao mesmo tempo).
 */

type ResultFilter = "all" | "win" | "loss" | "be";

const INITIAL_GROUPS = 10;
const GROUPS_PER_PAGE = 10;

export function TradesList() {
  const { progress, deleteTrade } = useProgress();
  const [setupFilter, setSetupFilter] = useState<string>("all");
  const [symbolFilter, setSymbolFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [mistakeFilter, setMistakeFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visibleGroups, setVisibleGroups] = useState(INITIAL_GROUPS);

  const allTrades = progress?.trades ?? [];

  const filtered = useMemo(() => {
    return allTrades.filter((t) => {
      if (setupFilter !== "all" && t.setup !== setupFilter) return false;
      if (symbolFilter !== "all" && t.symbol !== symbolFilter) return false;
      if (resultFilter !== "all" && t.result !== resultFilter) return false;
      if (mistakeFilter !== "all" && !(t.mistakes ?? []).includes(mistakeFilter)) return false;
      return true;
    });
  }, [allTrades, setupFilter, symbolFilter, resultFilter, mistakeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, TradeEntry[]>();
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const visibleGrouped = grouped.slice(0, visibleGroups);
  const hiddenGroupCount = grouped.length - visibleGrouped.length;
  const hiddenTradeCount = grouped
    .slice(visibleGroups)
    .reduce((sum, [, ts]) => sum + ts.length, 0);

  const hasFilters =
    setupFilter !== "all" || symbolFilter !== "all" || resultFilter !== "all" || mistakeFilter !== "all";

  const clearFilters = () => {
    setSetupFilter("all"); setSymbolFilter("all"); setResultFilter("all"); setMistakeFilter("all");
  };

  if (allTrades.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-8 text-center">
        <p className="text-[13px] text-white/60 font-semibold mb-1">Nenhum trade registrado</p>
        <p className="text-[11px] text-white/35 max-w-sm mx-auto">
          Depois de fechar um trade, registre acima — o histórico aparece aqui com setup, R, erros e emoção.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-white/45">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">Filtros</span>
        </div>
        <FilterSelect label="Setup" value={setupFilter} onChange={setSetupFilter} options={[
          { id: "all", label: "Todos" },
          ...URA_SETUPS.map((s) => ({ id: s.id, label: s.name })),
        ]} />
        <FilterSelect label="Símbolo" value={symbolFilter} onChange={setSymbolFilter} options={[
          { id: "all", label: "Todos" },
          ...SYMBOLS.map((s) => ({ id: s.id, label: s.label })),
        ]} />
        <FilterSelect label="Resultado" value={resultFilter} onChange={(v) => setResultFilter(v as ResultFilter)} options={[
          { id: "all", label: "Todos" },
          { id: "win", label: "Win" },
          { id: "loss", label: "Loss" },
          { id: "be", label: "Breakeven" },
        ]} />
        <FilterSelect label="Erro" value={mistakeFilter} onChange={setMistakeFilter} options={[
          { id: "all", label: "Todos" },
          ...MISTAKE_TAGS.map((m) => ({ id: m.id, label: m.name })),
        ]} />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-[11px] text-white/45 hover:text-white/80 transition-colors"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
        <span className="ml-auto text-[11px] text-white/35 font-mono tabular-nums">
          {filtered.length} {filtered.length === 1 ? "trade" : "trades"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-8 text-center">
          <p className="text-[12px] text-white/40">Nenhum trade com esses filtros.</p>
        </div>
      ) : (
        <>
          {visibleGrouped.map(([date, trades]) => (
            <DateGroup
              key={date}
              date={date}
              trades={trades}
              expandedId={expandedId}
              editingId={editingId}
              onExpand={(id) => {
                setExpandedId(id);
                if (editingId && id !== editingId) setEditingId(null);
              }}
              onStartEdit={(id) => setEditingId(id)}
              onCancelEdit={() => setEditingId(null)}
              onFinishEdit={() => setEditingId(null)}
              onDelete={(id) => {
                if (confirm("Remover esse trade do diário?")) {
                  deleteTrade(id);
                  if (editingId === id) setEditingId(null);
                }
              }}
            />
          ))}

          {hiddenGroupCount > 0 && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <button
                onClick={() => setVisibleGroups(visibleGroups + GROUPS_PER_PAGE)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-white/[0.08] text-[12px] text-white/60 hover:text-white hover:border-white/[0.18] transition-colors"
              >
                Mostrar mais
                <span className="text-white/35 font-mono tabular-nums">
                  ({hiddenGroupCount} {hiddenGroupCount === 1 ? "dia" : "dias"} · {hiddenTradeCount} trades)
                </span>
              </button>
              {grouped.length > INITIAL_GROUPS * 2 && (
                <button
                  onClick={() => setVisibleGroups(grouped.length)}
                  className="text-[11px] text-white/35 hover:text-white/65 transition-colors"
                >
                  Mostrar todos
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DateGroup({
  date, trades, expandedId, editingId, onExpand, onStartEdit, onCancelEdit, onFinishEdit, onDelete,
}: {
  date: string;
  trades: TradeEntry[];
  expandedId: string | null;
  editingId: string | null;
  onExpand: (id: string | null) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onFinishEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const dayR = trades.reduce((s, t) => s + tradeR(t), 0);
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const dayAccent = dayR > 0 ? "#10B981" : dayR < 0 ? "#EF4444" : "rgba(255,255,255,0.5)";

  const d = new Date(`${date}T12:00:00`);
  const label = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
      <div className="px-3 sm:px-5 py-3 border-b border-white/[0.04] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: dayAccent + "80" }} />
          <h4 className="text-[12.5px] font-bold text-white capitalize">{label}</h4>
          <span className="text-[10px] text-white/35 font-mono">{date}</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] font-mono tabular-nums">
          {wins > 0 && <span className="text-emerald-400/85">{wins}W</span>}
          {losses > 0 && <span className="text-red-400/85">{losses}L</span>}
          <span className="text-white/25">·</span>
          <span
            className="font-bold"
            style={{ color: dayAccent }}
          >{dayR > 0 ? "+" : ""}{dayR.toFixed(2)}R</span>
        </div>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {trades.slice().reverse().map((t) => (
          <TradeRowDetailed
            key={t.id}
            trade={t}
            expanded={expandedId === t.id}
            isEditing={editingId === t.id}
            onToggle={() => onExpand(expandedId === t.id ? null : t.id)}
            onStartEdit={() => onStartEdit(t.id)}
            onCancelEdit={onCancelEdit}
            onFinishEdit={onFinishEdit}
            onDelete={() => onDelete(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TradeRowDetailed({
  trade, expanded, isEditing, onToggle, onStartEdit, onCancelEdit, onFinishEdit, onDelete,
}: {
  trade: TradeEntry;
  expanded: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFinishEdit: () => void;
  onDelete: () => void;
}) {
  const r = tradeR(trade);
  const isLong = trade.direction === "long";
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const rColor = r > 0 ? "text-emerald-400" : r < 0 ? "text-red-400" : "text-white/45";
  const DirIcon = isLong ? ArrowUp : ArrowDown;
  const dirColor = isLong ? "text-emerald-400/80" : "text-red-400/80";
  const ResultIcon = isWin ? ArrowUp : isLoss ? ArrowDown : Minus;
  const resultColor = isWin ? "#10B981" : isLoss ? "#EF4444" : "#94A3B8";

  const setup = setupById(trade.setup);
  const symbol = symbolById(trade.symbol);
  const mistakes = (trade.mistakes ?? []).map((id) => mistakeById(id)).filter(Boolean);

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <DirIcon className={`w-3.5 h-3.5 ${dirColor}`} strokeWidth={2.5} />
          <ResultIcon className="w-3 h-3 shrink-0" style={{ color: resultColor }} strokeWidth={2} />
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          {symbol && (
            <span
              className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
              style={{ color: symbol.color, backgroundColor: symbol.color + "15" }}
            >
              {symbol.label}
            </span>
          )}
          {trade.timeframe && (
            <span className="shrink-0 text-[9.5px] font-mono text-white/35 uppercase">{trade.timeframe}</span>
          )}
          {setup && (
            <span className="shrink-0 text-[11px] text-white/70 font-medium truncate">{setup.name}</span>
          )}
          {!setup && !symbol && (
            <span className="shrink-0 text-[11px] text-white/50 italic">sem setup</span>
          )}
          {mistakes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[9.5px] text-amber-400/75 shrink-0">
              <AlertTriangle className="w-2.5 h-2.5" />
              {mistakes.length}
            </span>
          )}
          {trade.source === "broker_import" && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] text-blue-400/70 shrink-0"
              title={`Importado de ${trade.importedFrom ?? "corretora"}`}
            >
              <Download className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        <span className={`text-[12.5px] font-bold font-mono tabular-nums shrink-0 ${rColor}`}>
          {r > 0 ? "+" : ""}{r.toFixed(2)}R
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-white/30 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && !isEditing && (
        <div className="px-3 sm:px-5 pb-4 space-y-3 border-t border-white/[0.03] bg-white/[0.01]">
          {/* Prices */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-3">
            <KV label="Entry" value={trade.entryNum?.toString() ?? trade.entry ?? "—"} />
            <KV label="Stop" value={trade.stopNum?.toString() ?? trade.sl ?? "—"} accent="#EF4444" />
            <KV label="Target" value={trade.targetNum?.toString() ?? trade.tp ?? "—"} accent="#10B981" />
            <KV label="Exit" value={trade.exitNum?.toString() ?? "—"} />
            <KV label="Size" value={trade.size?.toString() ?? "—"} />
          </div>

          {/* Mistakes */}
          {mistakes.length > 0 && (
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-amber-400/75 mb-1.5">Erros</p>
              <div className="flex flex-wrap gap-1.5">
                {mistakes.map((m) => {
                  if (!m) return null;
                  const severityColor = m.severity === 3 ? "#EF4444" : m.severity === 2 ? "#F59E0B" : "#94A3B8";
                  return (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{ backgroundColor: severityColor + "15", color: severityColor }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: severityColor }} />
                      {m.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Emotional + discipline */}
          <div className="flex items-center gap-4 flex-wrap text-[10.5px] text-white/50">
            {trade.emotionalBefore && (
              <span>Antes: <span className="text-white/75 font-semibold">{trade.emotionalBefore}/5</span></span>
            )}
            {trade.emotionalAfter && (
              <span>Depois: <span className="text-white/75 font-semibold">{trade.emotionalAfter}/5</span></span>
            )}
            <span>
              Plano: <span className={trade.followedPlan ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                {trade.followedPlan ? "seguido" : "não seguido"}
              </span>
            </span>
          </div>

          {/* Intraday chart — só quando trade tem symbol (busca lazy) */}
          {trade.symbol && (
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Candles do dia</p>
              <TradeIntradayChart trade={trade} />
            </div>
          )}

          {/* Screenshot */}
          {trade.screenshotUrl && (
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Screenshot do chart</p>
              <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={trade.screenshotUrl} alt="Screenshot do trade" className="w-full max-h-[420px] object-contain" />
              </div>
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1">Aprendizado</p>
              <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <button
              onClick={onStartEdit}
              className="inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-white transition-colors"
            >
              <Pencil className="w-3 h-3" /> Editar
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-[11px] text-white/35 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Apagar trade
            </button>
          </div>
        </div>
      )}

      {expanded && isEditing && (
        <EditTradeInline
          trade={trade}
          onCancel={onCancelEdit}
          onSaved={onFinishEdit}
        />
      )}
    </div>
  );
}

/* ───────── Edit inline form ───────── */

function EditTradeInline({
  trade, onCancel, onSaved,
}: {
  trade: TradeEntry;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { updateTrade } = useProgress();

  const num = (s: string): number | null => {
    const clean = s.trim().replace(",", ".");
    if (!clean) return null;
    const n = parseFloat(clean);
    return Number.isFinite(n) ? n : null;
  };

  const [entry, setEntry] = useState<string>(trade.entryNum?.toString() ?? trade.entry ?? "");
  const [stop, setStop] = useState<string>(trade.stopNum?.toString() ?? trade.sl ?? "");
  const [target, setTarget] = useState<string>(trade.targetNum?.toString() ?? trade.tp ?? "");
  const [exit, setExit] = useState<string>(trade.exitNum?.toString() ?? "");
  const [size, setSize] = useState<string>(trade.size?.toString() ?? "");
  const [setupId, setSetupId] = useState<string>(trade.setup ?? "");
  const [mistakes, setMistakes] = useState<string[]>(trade.mistakes ?? []);
  const [result, setResult] = useState<"win" | "loss" | "be">(trade.result);
  const [followedPlan, setFollowedPlan] = useState<boolean>(trade.followedPlan);
  const [emotionalAfter, setEmotionalAfter] = useState<number>(trade.emotionalAfter ?? 3);
  const [notes, setNotes] = useState<string>(trade.notes ?? "");
  const [screenshot, setScreenshot] = useState<string | undefined>(trade.screenshotUrl);
  const [saving, setSaving] = useState(false);

  const toggleMistake = (id: string) => {
    setMistakes((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setSaving(true);
    const entryN = num(entry);
    const stopN = num(stop);
    const targetN = num(target);
    const exitN = num(exit);
    const sizeN = num(size);

    const rMultiple = (() => {
      if (trade.direction && entryN != null && stopN != null && exitN != null) {
        return computeRMultiple(trade.direction, entryN, stopN, exitN);
      }
      return trade.rMultiple;
    })();

    await updateTrade(trade.id, {
      entry: entry.trim(),
      sl: stop.trim(),
      tp: target.trim(),
      entryNum: entryN ?? undefined,
      stopNum: stopN ?? undefined,
      targetNum: targetN ?? undefined,
      exitNum: exitN ?? undefined,
      size: sizeN ?? undefined,
      result,
      rMultiple,
      setup: setupId || undefined,
      mistakes: mistakes.length > 0 ? mistakes : undefined,
      followedPlan,
      emotionalAfter,
      notes: notes.trim(),
      screenshotUrl: screenshot,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="px-3 sm:px-5 pb-4 pt-3 space-y-3 border-t border-white/[0.03] bg-white/[0.015]">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
        <Pencil className="w-3 h-3" /> Editando
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <MiniField label="Entry" value={entry} onChange={setEntry} />
        <MiniField label="Stop" value={stop} onChange={setStop} accent="#EF4444" />
        <MiniField label="Target" value={target} onChange={setTarget} accent="#10B981" />
        <MiniField label="Exit" value={exit} onChange={setExit} accent="#60A5FA" />
        <MiniField label="Size" value={size} onChange={setSize} />
      </div>

      {/* Result */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Resultado</p>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { id: "win" as const,  label: "Win",  color: "#10B981" },
            { id: "loss" as const, label: "Loss", color: "#EF4444" },
            { id: "be" as const,   label: "BE",   color: "#94A3B8" },
          ]).map((r) => {
            const active = result === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setResult(r.id)}
                className={`py-1.5 rounded-md border text-[11.5px] font-semibold transition-colors ${
                  active ? "" : "border-white/[0.05] text-white/40 hover:border-white/[0.14] hover:text-white/70"
                }`}
                style={active ? {
                  borderColor: r.color + "55",
                  color: r.color,
                  backgroundColor: r.color + "10",
                } : undefined}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Setup picker — compact */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Setup</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSetupId("")}
            className={`px-2.5 py-1 rounded-md border text-[10.5px] font-semibold transition-colors ${
              setupId === ""
                ? "border-white/[0.2] text-white bg-white/[0.05]"
                : "border-white/[0.05] text-white/35 hover:border-white/[0.14] hover:text-white/70"
            }`}
          >
            Sem setup
          </button>
          {URA_SETUPS.map((s) => {
            const active = setupId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSetupId(s.id)}
                className={`px-2.5 py-1 rounded-md border text-[10.5px] font-semibold transition-colors ${
                  active
                    ? "border-brand-500/55 text-brand-400 bg-brand-500/[0.08]"
                    : "border-white/[0.05] text-white/50 hover:border-white/[0.14] hover:text-white/75"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mistakes */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Erros</p>
        <div className="flex flex-wrap gap-1.5">
          {MISTAKE_TAGS.map((m) => {
            const active = mistakes.includes(m.id);
            const severityColor = m.severity === 3 ? "#EF4444" : m.severity === 2 ? "#F59E0B" : "#94A3B8";
            return (
              <button
                key={m.id}
                onClick={() => toggleMistake(m.id)}
                title={m.description}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium border transition-colors ${
                  active ? "" : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.15]"
                }`}
                style={active ? {
                  borderColor: severityColor + "55",
                  backgroundColor: severityColor + "15",
                  color: severityColor,
                } : undefined}
              >
                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: severityColor }} />
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan + emotional */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Seguiu o plano?</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setFollowedPlan(true)}
              className={`flex-1 py-1.5 rounded-md border text-[11px] font-semibold transition-colors ${
                followedPlan
                  ? "border-emerald-400/50 text-emerald-400 bg-emerald-500/[0.06]"
                  : "border-white/[0.05] text-white/40 hover:border-white/[0.14] hover:text-white/70"
              }`}
            >Sim</button>
            <button
              onClick={() => setFollowedPlan(false)}
              className={`flex-1 py-1.5 rounded-md border text-[11px] font-semibold transition-colors ${
                !followedPlan
                  ? "border-red-400/50 text-red-400 bg-red-500/[0.06]"
                  : "border-white/[0.05] text-white/40 hover:border-white/[0.14] hover:text-white/70"
              }`}
            >Não</button>
          </div>
        </div>
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Emoção depois</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => {
              const colors = ["#EF4444", "#F59E0B", "#6B7280", "#10B981", "#3B82F6"];
              const active = emotionalAfter === v;
              const color = colors[v - 1];
              return (
                <button
                  key={v}
                  onClick={() => setEmotionalAfter(v)}
                  className="flex-1 h-7 rounded-md border transition-colors"
                  style={active
                    ? { borderColor: color + "60", backgroundColor: color + "20" }
                    : { borderColor: "rgba(255,255,255,0.05)", backgroundColor: color + "08" }}
                  title={String(v)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Aprendizado</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-20 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12px] text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-white/[0.15]"
        />
      </div>

      {/* Screenshot */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 mb-1.5">Screenshot</p>
        <ScreenshotUploader value={screenshot} onChange={setScreenshot} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={saving}
          className="text-[11.5px] text-white/45 hover:text-white/80 transition-colors px-2 py-1"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11.5px] font-semibold transition-colors ${
            saving
              ? "border-white/[0.06] text-white/25 cursor-wait"
              : "border-brand-500 text-brand-500 hover:bg-brand-500/[0.06]"
          }`}
        >
          <Check className="w-3.5 h-3.5" /> {saving ? "Salvando..." : "Salvar edição"}
        </button>
      </div>
    </div>
  );
}

function MiniField({
  label, value, onChange, accent = "rgba(255,255,255,0.5)",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent?: string;
}) {
  return (
    <div className="rounded-lg bg-[#0a0a0c] border border-white/[0.05] hover:border-white/[0.10] transition-colors px-2.5 py-1.5">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: accent + (accent.startsWith("#") ? "AA" : "") }}>{label}</p>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-[11.5px] font-mono tabular-nums text-white focus:outline-none placeholder-white/20"
      />
    </div>
  );
}

function KV({ label, value, accent = "rgba(255,255,255,0.5)" }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: accent + (accent.startsWith("#") ? "AA" : "") }}>{label}</p>
      <p className="text-[11.5px] font-mono tabular-nums text-white/80 truncate">{value}</p>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="relative inline-flex items-center rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
      <span className="pl-2.5 pr-1.5 text-[10px] font-bold uppercase tracking-wider text-white/35">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent pr-7 pl-0 py-1.5 text-[11px] font-semibold text-white/75 outline-none appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-[#141417] text-white">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 w-3 h-3 text-white/35" />
    </div>
  );
}
