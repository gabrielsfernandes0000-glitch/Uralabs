"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, AlertCircle, RefreshCw, Save } from "lucide-react";

export interface TradeForModal {
  orderId: string;
  symbol: string;
  side: string;
  price: number;
  quantity: number;
  profit: number;
  time: number;
  tags: string[];
  notes: string | null;
  stopLoss: number | null;
  uraCall: boolean;
}

interface Props {
  trade: TradeForModal;
  exchange: string;
  allowedTags: string[];
  onClose: () => void;
  onSaved: () => void;
}

export function TradeDetailModal({ trade, exchange, allowedTags, onClose, onSaved }: Props) {
  const [mounted, setMounted] = useState(false);
  const [tags, setTags] = useState<string[]>(trade.tags);
  const [notes, setNotes] = useState(trade.notes || "");
  const [stop, setStop] = useState(trade.stopLoss ? String(trade.stopLoss) : "");
  const [markedUra, setMarkedUra] = useState(trade.uraCall);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted) return null;

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 8) return prev;
      return [...prev, tag];
    });
  };

  const parseStop = (): number | null => {
    const clean = stop.trim().replace(",", ".");
    if (!clean) return null;
    const n = parseFloat(clean);
    return isFinite(n) && n > 0 ? n : null;
  };

  const computedR = (() => {
    const s = parseStop();
    if (!s || !trade.price || !trade.profit || !trade.quantity) return null;
    const riskPerUnit = Math.abs(trade.price - s);
    if (riskPerUnit === 0) return null;
    const risk$ = riskPerUnit * Math.abs(trade.quantity);
    if (risk$ === 0) return null;
    return trade.profit / risk$;
  })();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const stopVal = parseStop();
      const res = await fetch("/api/exchange/trade-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchange,
          orderId: trade.orderId,
          tags,
          notes: notes.trim(),
          stopLoss: stopVal,
          markedAsUraCall: markedUra,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const dt = new Date(trade.time);
  dt.setHours(dt.getHours() - 3);
  const dateLabel = dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const timeLabel = dt.toTimeString().slice(0, 5);
  const pnlColor = trade.profit > 0 ? "text-green-400" : trade.profit < 0 ? "text-red-400" : "text-white/40";
  const pnlPrefix = trade.profit >= 0 ? "+$" : "-$";

  const modal = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0e0e10] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-10 rounded-full shrink-0 ${trade.profit > 0 ? "bg-green-400" : trade.profit < 0 ? "bg-red-400" : "bg-white/30"}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-bold text-white font-mono">{trade.symbol.replace(/-?USDT/, "")}</h2>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${trade.side === "BUY" || trade.side === "Buy" ? "text-green-400 bg-green-400/[0.08]" : "text-red-400 bg-red-400/[0.08]"}`}>
                  {trade.side === "BUY" || trade.side === "Buy" ? "BUY" : "SELL"}
                </span>
                {trade.uraCall && (
                  <span className="text-[9.5px] font-semibold text-brand-500 bg-brand-500/[0.08] px-1.5 py-0.5 rounded">
                    CALL URA
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/40 mt-0.5 capitalize">{dateLabel} · {timeLabel}</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="interactive-tap p-1.5 rounded-md text-white/35 hover:text-white hover:bg-white/[0.04]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
          <div className="bg-[#0e0e10] px-4 py-3">
            <p className="text-[9.5px] font-semibold text-white/35 uppercase tracking-wider mb-0.5">PnL</p>
            <p className={`text-[15px] font-bold font-mono tabular-nums ${pnlColor}`}>
              {pnlPrefix}{Math.abs(trade.profit).toFixed(2)}
            </p>
          </div>
          <div className="bg-[#0e0e10] px-4 py-3">
            <p className="text-[9.5px] font-semibold text-white/35 uppercase tracking-wider mb-0.5">Entry</p>
            <p className="text-[15px] font-bold text-white/85 font-mono tabular-nums">
              {trade.price < 1 ? trade.price.toFixed(6) : trade.price.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#0e0e10] px-4 py-3">
            <p className="text-[9.5px] font-semibold text-white/35 uppercase tracking-wider mb-0.5">Qty</p>
            <p className="text-[15px] font-bold text-white/85 font-mono tabular-nums">
              {trade.quantity.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Stop + R */}
          <div>
            <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Stop loss <span className="text-white/25 font-normal normal-case lowercase">(opcional — pra calcular R)</span></span>
              {computedR !== null && (
                <span className={`text-[11px] font-mono tabular-nums ${computedR > 0 ? "text-green-400" : "text-red-400"}`}>
                  {computedR > 0 ? "+" : ""}{computedR.toFixed(2)}R
                </span>
              )}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={stop}
              onChange={(e) => setStop(e.target.value)}
              placeholder={trade.price < 1 ? "0.000000" : "0.00"}
              className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-colors font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tags</span>
              <span className="text-white/25 font-normal normal-case">{tags.length}/8</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allowedTags.map((tag) => {
                const active = tags.includes(tag);
                const isBad = ["Revenge Trade", "FOMO", "Tilt", "Rule Break", "Overleverage", "Stop Hit", "Early Exit"].includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`interactive-tap text-[10.5px] font-medium px-2 py-1 rounded border transition-all ${
                      active
                        ? isBad
                          ? "border-red-400/60 text-red-300 bg-red-500/[0.08]"
                          : "border-white/30 text-white bg-white/[0.06]"
                        : "border-white/[0.06] text-white/35 hover:text-white/70 hover:border-white/[0.15]"
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5 inline mr-1" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Notas</span>
              <span className="text-white/25 font-normal normal-case">{notes.length}/2000</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
              placeholder="O que viu? Por que entrou? Seguiu o plano? O que repetir / evitar?"
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* URA call override */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={markedUra}
              onChange={(e) => setMarkedUra(e.target.checked)}
              className="w-3.5 h-3.5 accent-brand-500"
            />
            <span className="text-[11.5px] text-white/55">
              Esse trade seguiu uma call do URA
              <span className="text-white/25 ml-1">(sobrescreve match automático)</span>
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-md border-l-2 border-red-400 bg-red-500/[0.06]">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.04]">
          <button onClick={onClose} type="button" className="interactive-tap px-4 py-2 rounded-md text-[12px] text-white/50 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            type="button"
            disabled={saving}
            className="interactive-tap flex items-center gap-2 px-4 py-2 rounded-md border border-brand-500/60 text-[12px] font-semibold text-brand-500 hover:bg-brand-500/[0.06] transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
