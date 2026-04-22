"use client";

import { useMemo, useState } from "react";
import { FileUp, AlertCircle, Check, X, FileText } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import {
  parseCsv, autoDetectMapping, rowsToCandidates, candidateToTradeEntry,
  EMPTY_MAPPING, type CsvMapping, type CsvCandidate,
} from "@/lib/csv-import";

/**
 * CSV import wizard — fallback pra corretoras sem API suportada.
 *
 * Fluxo:
 *  1. Upload arquivo .csv
 *  2. Parser detecta separador, colunas, amostra
 *  3. Auto-detect mapping (header fuzzy)
 *  4. User ajusta mapping manualmente se necessário
 *  5. Preview candidates válidos vs inválidos
 *  6. Confirma → importTrades com dedupe por externalId
 */

type Step = "idle" | "mapping" | "preview" | "done";

const FIELD_LABELS: { key: keyof CsvMapping; label: string; required?: boolean }[] = [
  { key: "date",       label: "Data do trade",       required: true },
  { key: "symbol",     label: "Símbolo / ticker",    required: true },
  { key: "direction",  label: "Direção (long/short)", required: true },
  { key: "entry",      label: "Entry price",         required: true },
  { key: "exit",       label: "Exit price" },
  { key: "stop",       label: "Stop loss" },
  { key: "target",     label: "Target" },
  { key: "size",       label: "Size / quantidade" },
  { key: "openTime",   label: "Hora de abertura" },
  { key: "result",     label: "Resultado (win/loss)" },
  { key: "pnl",        label: "P&L em $" },
  { key: "setup",      label: "Setup / estratégia" },
  { key: "notes",      label: "Notas" },
  { key: "externalId", label: "ID único (order/ticket)" },
];

export function CsvImportPanel() {
  const { importTrades } = useProgress();
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvMapping>(EMPTY_MAPPING);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const { headers: h, rows: r } = parseCsv(text);
      if (h.length === 0) {
        setError("CSV vazio ou não pôde ser lido.");
        return;
      }
      setFileName(file.name);
      setSourceLabel(file.name.replace(/\.[^/.]+$/, "").slice(0, 40));
      setHeaders(h);
      setRows(r);
      setMapping(autoDetectMapping(h));
      setStep("mapping");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao ler arquivo");
    }
  };

  const reset = () => {
    setStep("idle");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping(EMPTY_MAPPING);
    setSourceLabel("");
    setImportResult(null);
    setError(null);
  };

  const candidates: CsvCandidate[] = useMemo(() => {
    if (step !== "preview" && step !== "mapping") return [];
    return rowsToCandidates(rows, mapping, sourceLabel || "csv");
  }, [step, rows, mapping, sourceLabel]);

  const valid = candidates.filter((c) => !c.error);
  const invalid = candidates.filter((c) => c.error);

  const requiredOk = mapping.date != null && mapping.symbol != null && mapping.direction != null && mapping.entry != null;

  const handleConfirm = async () => {
    if (valid.length === 0) return;
    const entries = valid.map(candidateToTradeEntry);
    const result = await importTrades(entries);
    setImportResult(result);
    setStep("done");
  };

  /* ───── UI ───── */

  if (step === "idle") {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <FileUp className="w-4 h-4 text-white/45 mt-0.5 shrink-0" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-semibold text-white">Importar CSV da corretora</h4>
            <p className="text-[11.5px] text-white/45 mt-0.5 leading-relaxed">
              Funciona quando a API da corretora não está suportada. Aceita exports do TraderSync, Edgewonk, MT4/5,
              NinjaTrader ou qualquer CSV com colunas de data, símbolo, direção, entry e exit.
            </p>

            <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/[0.1] hover:border-white/[0.22] text-[12px] font-semibold text-white/75 hover:text-white cursor-pointer transition-colors">
              <FileUp className="w-3.5 h-3.5" />
              Selecionar arquivo .csv
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>

            {error && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-red-400">
                <AlertCircle className="w-3 h-3" /> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "done" && importResult) {
    return (
      <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/25 p-5 flex items-start gap-3">
        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" strokeWidth={2.5} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-emerald-300">
            {importResult.imported} trade{importResult.imported !== 1 ? "s" : ""} importado{importResult.imported !== 1 ? "s" : ""}
          </p>
          <p className="text-[11.5px] text-white/50 mt-0.5">
            {importResult.skipped > 0
              ? `${importResult.skipped} ignorado${importResult.skipped > 1 ? "s" : ""} por já existirem no diário (dedupe por ID).`
              : "Nenhum duplicado detectado."}
          </p>
          <button
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-white/55 hover:text-white transition-colors"
          >
            Importar outro CSV
          </button>
        </div>
      </div>
    );
  }

  // mapping + preview (mesmo componente, com toggle)
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-white/45 shrink-0" />
          <p className="text-[12.5px] font-semibold text-white truncate">{fileName}</p>
          <span className="text-[10.5px] font-mono text-white/35 shrink-0">{rows.length} linhas</span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-3 h-3" /> Cancelar
        </button>
      </div>

      {/* Mapping — grid */}
      <div>
        <p className="text-[12px] font-semibold text-white/75 mb-2">Mapear colunas</p>
        <p className="text-[11px] text-white/40 mb-3">
          A gente tentou detectar automaticamente pelo header. Confira e ajuste os campos obrigatórios (marcados com *).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FIELD_LABELS.map(({ key, label, required }) => {
            const missing = required && mapping[key] == null;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-[11px] shrink-0 w-36 ${missing ? "text-red-400/80" : "text-white/55"}`}>
                  {label}{required && " *"}
                </span>
                <select
                  value={mapping[key] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMapping({ ...mapping, [key]: v === "" ? null : parseInt(v, 10) });
                  }}
                  className={`flex-1 min-w-0 px-2.5 py-1 rounded-md bg-white/[0.03] border text-[11px] text-white/80 outline-none cursor-pointer ${
                    missing ? "border-red-500/30" : "border-white/[0.08] hover:border-white/[0.18]"
                  }`}
                >
                  <option value="" className="bg-[#141417]">— não usar —</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i} className="bg-[#141417]">
                      {h || `coluna ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="text-[12px] font-semibold text-white/75 mb-2">Preview</p>
        <div className="flex items-center gap-3 text-[11.5px] mb-2 flex-wrap">
          <span className="text-emerald-400/85">{valid.length} válidos</span>
          {invalid.length > 0 && (
            <span className="text-amber-400/85">{invalid.length} com erro</span>
          )}
        </div>
        <div className="rounded-lg bg-white/[0.015] border border-white/[0.04] max-h-56 overflow-y-auto">
          {candidates.slice(0, 40).map((c) => (
            <div
              key={c.rowIdx}
              className={`flex items-center gap-2 px-3 py-1.5 text-[11px] border-b border-white/[0.03] last:border-0 ${
                c.error ? "opacity-60" : ""
              }`}
            >
              <span className="w-6 font-mono tabular-nums text-white/30 shrink-0">{c.rowIdx + 1}</span>
              {c.error ? (
                <AlertCircle className="w-3 h-3 text-amber-400/70 shrink-0" />
              ) : (
                <Check className="w-3 h-3 text-emerald-400/80 shrink-0" />
              )}
              <span className="w-20 font-mono text-white/55 shrink-0 truncate">{c.date ?? "—"}</span>
              <span className="w-16 font-semibold text-white/80 shrink-0 truncate">{c.symbol || "—"}</span>
              <span className={`w-12 text-[10.5px] shrink-0 ${c.direction === "long" ? "text-emerald-400/80" : c.direction === "short" ? "text-red-400/80" : "text-white/40"}`}>
                {c.direction?.toUpperCase() ?? "—"}
              </span>
              <span className="flex-1 min-w-0 truncate">
                {c.error ? (
                  <span className="text-amber-400/70">{c.error}</span>
                ) : c.rMultiple != null ? (
                  <span className={`font-mono tabular-nums ${c.rMultiple > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {c.rMultiple > 0 ? "+" : ""}{c.rMultiple.toFixed(2)}R
                  </span>
                ) : (
                  <span className="text-white/40">R: —</span>
                )}
              </span>
            </div>
          ))}
          {candidates.length > 40 && (
            <div className="px-3 py-1.5 text-[10.5px] text-white/35 text-center">
              + {candidates.length - 40} trades não mostrados no preview
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="text-[11px] text-white/40">
          {requiredOk
            ? `Pronto pra importar ${valid.length} trade${valid.length !== 1 ? "s" : ""}${invalid.length > 0 ? ` (${invalid.length} ignorado${invalid.length !== 1 ? "s" : ""})` : ""}`
            : "Complete os campos obrigatórios (*)"}
        </p>
        <button
          onClick={handleConfirm}
          disabled={!requiredOk || valid.length === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-[12px] font-semibold transition-colors ${
            requiredOk && valid.length > 0
              ? "border-brand-500 text-brand-500 hover:bg-brand-500/[0.06]"
              : "border-white/[0.06] text-white/25 cursor-not-allowed"
          }`}
        >
          <Check className="w-3.5 h-3.5" /> Confirmar importação
        </button>
      </div>
    </div>
  );
}
