"use client";

import { useRef, useState } from "react";
import { ImagePlus, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { addTrade, calcRMultiple, type Trade, type TradeStatus } from "@/lib/trading-journal";

/**
 * Form rápido de registro de trade (localStorage v1).
 * Inclui foto do gráfico (base64). Salva trade que alimenta TraderStats,
 * PerformanceHeatmap e RevengeTradeAlert.
 */

export function QuickTradeForm({
  preset,
  onSaved,
}: {
  preset?: { entry?: number; stop?: number; target?: number | null; sizeUsd?: number; direction?: "long" | "short" };
  onSaved?: (t: Trade) => void;
}) {
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<"long" | "short">(preset?.direction ?? "long");
  const [entry, setEntry] = useState<string>(preset?.entry ? String(preset.entry) : "");
  const [stop, setStop] = useState<string>(preset?.stop ? String(preset.stop) : "");
  const [target, setTarget] = useState<string>(preset?.target != null ? String(preset.target) : "");
  const [exit, setExit] = useState("");
  const [sizeUsd, setSizeUsd] = useState<string>(preset?.sizeUsd ? String(preset.sizeUsd) : "");
  const [status, setStatus] = useState<TradeStatus>("open");
  const [notes, setNotes] = useState("");
  const [emotional, setEmotional] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem muito grande (máx 2MB). Reduza e tente de novo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isValid = !!asset && Number(entry) > 0 && Number(stop) > 0 && Number(sizeUsd) > 0;

  const handleSave = () => {
    if (!isValid) return;
    const entryN = Number(entry);
    const stopN = Number(stop);
    const targetN = target ? Number(target) : null;
    const exitN = exit ? Number(exit) : null;
    const sizeN = Number(sizeUsd);

    let pnlUsd: number | null = null;
    if (status !== "open" && exitN != null) {
      const pricePnl = direction === "long" ? exitN - entryN : entryN - exitN;
      const units = sizeN / entryN;
      pnlUsd = pricePnl * units;
    } else if (status === "breakeven") {
      pnlUsd = 0;
    }

    const trade: Omit<Trade, "id" | "createdAt"> = {
      asset,
      direction,
      entry: entryN,
      stop: stopN,
      target: targetN,
      exit: exitN,
      sizeUsd: sizeN,
      pnlUsd,
      status,
      emotionalState: emotional,
      notes,
      photoBase64,
      checklistPassed: [],
      rMultiple: null,
    };
    const saved = addTrade(trade);
    saved.rMultiple = calcRMultiple(saved);
    setSaved(true);
    onSaved?.(saved);
    setTimeout(() => setSaved(false), 2200);
  };

  if (saved) {
    return (
      <div className="rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/25 p-6 flex items-center justify-center gap-3">
        <Check className="w-5 h-5 text-emerald-400" strokeWidth={2} />
        <p className="text-[13px] text-emerald-200 font-medium">Trade registrado. Suas estatísticas foram atualizadas.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-white/90">Registrar trade</h3>
        <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
          {(["long", "short"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
                direction === d
                  ? d === "long" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {d === "long" ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Field label="Ativo" value={asset} onChange={setAsset} placeholder="BTCUSDT, NQ, ES..." type="text" />
        <Field label="Tamanho (USD)" value={sizeUsd} onChange={setSizeUsd} placeholder="0" suffix="$" />
        <Field label="Entry" value={entry} onChange={setEntry} placeholder="0.00" />
        <Field label="Stop" value={stop} onChange={setStop} placeholder="0.00" />
        <Field label="Target (opcional)" value={target} onChange={setTarget} placeholder="0.00" />
        <Field label="Exit (se fechado)" value={exit} onChange={setExit} placeholder="0.00" />
      </div>

      <div>
        <label className="block text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1.5">Status</label>
        <div className="flex gap-1 flex-wrap">
          {([
            { v: "open", label: "Aberto", color: "#F59E0B" },
            { v: "win", label: "Win", color: "#10B981" },
            { v: "loss", label: "Loss", color: "#EF4444" },
            { v: "breakeven", label: "BE", color: "#94A3B8" },
          ] as { v: TradeStatus; label: string; color: string }[]).map((s) => (
            <button
              key={s.v}
              onClick={() => setStatus(s.v)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                status === s.v
                  ? "text-white"
                  : "text-white/45 hover:text-white/75 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
              style={status === s.v ? { backgroundColor: s.color + "22", border: `1px solid ${s.color}60` } : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1.5">Estado emocional</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setEmotional(n as 1 | 2 | 3 | 4 | 5)}
              className={`flex-1 py-2 rounded-lg text-[10.5px] font-bold transition-colors ${
                emotional === n
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                  : "bg-white/[0.02] text-white/35 hover:text-white/60 border border-transparent"
              }`}
            >
              {["Péssimo", "Ruim", "Normal", "Bom", "Excelente"][n - 1]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1.5">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Por que entrou, o que viu, aprendizado…"
          rows={3}
          className="w-full rounded-lg bg-[#0a0a0c] border border-white/[0.06] focus:border-white/[0.16] outline-none px-3 py-2 text-[12px] text-white placeholder:text-white/25 resize-none"
        />
      </div>

      {/* Foto do gráfico */}
      <div>
        <label className="block text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1.5">Screenshot do gráfico</label>
        {photoBase64 ? (
          <div className="relative rounded-lg overflow-hidden border border-white/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoBase64} alt="Screenshot do trade" className="w-full max-h-[360px] object-contain bg-black" />
            <button
              onClick={() => setPhotoBase64(null)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/70 hover:text-white hover:bg-black"
              title="Remover foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-white/[0.08] hover:border-white/[0.18] text-white/40 hover:text-white/70 transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            <span className="text-[12px]">Anexar print do chart (máx 2MB)</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid}
        className="w-full py-3 rounded-xl bg-brand-500 text-white text-[13px] font-bold hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Salvar trade
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "number",
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "number" | "text";
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1">{label}</label>
      <div className="relative flex items-center rounded-lg bg-[#0a0a0c] border border-white/[0.06] focus-within:border-white/[0.16] transition-colors">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={type === "number" ? "any" : undefined}
          className="w-full bg-transparent px-3 py-2 text-[13px] font-mono tabular-nums text-white outline-none placeholder:text-white/20"
        />
        {suffix && <span className="px-2 text-[10.5px] text-white/40 font-mono">{suffix}</span>}
      </div>
    </div>
  );
}
