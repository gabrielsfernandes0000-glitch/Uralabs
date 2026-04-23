"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, RefreshCw, Trash2 } from "lucide-react";

interface ExistingRules {
  firm_name: string | null;
  account_size_usd: number | null;
  daily_loss_limit_usd: number | null;
  max_loss_limit_usd: number | null;
  profit_target_usd: number | null;
}

interface Props {
  exchange: string;
  existing: ExistingRules | null;
  onClose: () => void;
  onSaved: () => void;
}

const PRESETS = [
  { name: "FTMO 10k", size: 10000, daily: 500, max: 1000, target: 1000 },
  { name: "FTMO 25k", size: 25000, daily: 1250, max: 2500, target: 2500 },
  { name: "FTMO 100k", size: 100000, daily: 5000, max: 10000, target: 10000 },
  { name: "MFF 10k", size: 10000, daily: 500, max: 600, target: 800 },
  { name: "Apex 25k", size: 25000, daily: 1250, max: 1500, target: 1500 },
  { name: "Apex 100k", size: 100000, daily: 2500, max: 3000, target: 6000 },
];

export function PropRulesModal({ exchange, existing, onClose, onSaved }: Props) {
  const [mounted, setMounted] = useState(false);
  const [firmName, setFirmName] = useState(existing?.firm_name || "");
  const [accountSize, setAccountSize] = useState(existing?.account_size_usd ? String(existing.account_size_usd) : "");
  const [dailyLoss, setDailyLoss] = useState(existing?.daily_loss_limit_usd ? String(existing.daily_loss_limit_usd) : "");
  const [maxLoss, setMaxLoss] = useState(existing?.max_loss_limit_usd ? String(existing.max_loss_limit_usd) : "");
  const [profitTarget, setProfitTarget] = useState(existing?.profit_target_usd ? String(existing.profit_target_usd) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!mounted) return null;

  const applyPreset = (p: typeof PRESETS[number]) => {
    setFirmName(p.name);
    setAccountSize(String(p.size));
    setDailyLoss(String(p.daily));
    setMaxLoss(String(p.max));
    setProfitTarget(String(p.target));
  };

  const parseNum = (s: string): number | null => {
    const clean = s.trim().replace(/,/g, ".").replace(/[^\d.]/g, "");
    const n = parseFloat(clean);
    return isFinite(n) && n >= 0 ? n : null;
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/exchange/prop-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchange,
          firmName: firmName.trim() || null,
          accountSize: parseNum(accountSize),
          dailyLossLimit: parseNum(dailyLoss),
          maxLossLimit: parseNum(maxLoss),
          profitTarget: parseNum(profitTarget),
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

  const remove = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchange/prop-rules?exchange=${exchange}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao remover");
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0e0e10] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
          <div>
            <h2 className="text-[15px] font-bold text-white">Regras da mesa prop</h2>
            <p className="text-[11px] text-white/35 mt-0.5">Alertas visuais apenas. Nada bloqueia ordens.</p>
          </div>
          <button onClick={onClose} type="button" className="interactive-tap p-1.5 rounded-md text-white/35 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-2">Preset rápido</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="interactive-tap text-[10.5px] font-medium px-2 py-1 rounded border border-white/[0.06] text-white/55 hover:text-white hover:border-white/[0.15] transition-all"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-1.5 block">Mesa / rótulo</label>
              <input
                type="text" value={firmName} onChange={(e) => setFirmName(e.target.value.slice(0, 50))}
                placeholder="ex: FTMO 10k challenge"
                className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-1.5 block">Account size ($)</label>
                <input type="text" inputMode="decimal" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} placeholder="10000"
                  className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 font-mono tabular-nums" />
              </div>
              <div>
                <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-1.5 block">Daily loss ($)</label>
                <input type="text" inputMode="decimal" value={dailyLoss} onChange={(e) => setDailyLoss(e.target.value)} placeholder="500"
                  className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 font-mono tabular-nums" />
              </div>
              <div>
                <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-1.5 block">Max DD ($)</label>
                <input type="text" inputMode="decimal" value={maxLoss} onChange={(e) => setMaxLoss(e.target.value)} placeholder="1000"
                  className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 font-mono tabular-nums" />
              </div>
              <div>
                <label className="text-[10.5px] font-semibold text-white/45 uppercase tracking-wider mb-1.5 block">Target ($)</label>
                <input type="text" inputMode="decimal" value={profitTarget} onChange={(e) => setProfitTarget(e.target.value)} placeholder="1000"
                  className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 font-mono tabular-nums" />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-red-300 px-2.5 py-1.5 border-l-2 border-red-400 bg-red-500/[0.06]">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-white/[0.04]">
          {existing ? (
            <button onClick={remove} type="button" disabled={saving}
              className="interactive-tap flex items-center gap-1.5 px-3 py-2 rounded-md text-[11.5px] text-red-400 hover:bg-red-500/[0.06] transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} type="button" className="interactive-tap px-4 py-2 rounded-md text-[12px] text-white/50 hover:text-white transition-colors">Cancelar</button>
            <button onClick={save} type="button" disabled={saving}
              className="interactive-tap flex items-center gap-2 px-4 py-2 rounded-md border border-brand-500/60 text-[12px] font-semibold text-brand-500 hover:bg-brand-500/[0.06] transition-colors disabled:opacity-50">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
