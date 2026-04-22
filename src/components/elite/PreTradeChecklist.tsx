"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Square, Plus, X } from "lucide-react";

/**
 * Checklist pré-trade — items configuráveis, gatekeeper emocional.
 * Salva items custom em localStorage. Default cobre fundamentos de SMC.
 */

const DEFAULT_ITEMS = [
  "HTF bias alinhado",
  "Liquidez varrida",
  "FVG/OB mitigado no LTF",
  "Entry com confirmação",
  "Stop loss definido",
  "R:R mínimo 1:2",
  "Sem eventos high-impact nos próximos 30min",
  "Não estou operando emoção (revenge/FOMO)",
];

const ITEMS_KEY = "elite_checklist_items_v1";

function loadItems(): string[] {
  if (typeof window === "undefined") return DEFAULT_ITEMS;
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) return DEFAULT_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
}

function saveItems(items: string[]) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function PreTradeChecklist({
  onChange,
  compact,
}: {
  onChange?: (checked: string[], allPassed: boolean) => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    setItems(loadItems());
  }, []);

  useEffect(() => {
    if (!onChange) return;
    const checkedArr = Array.from(checked);
    const allPassed = items.length > 0 && items.every((i) => checked.has(i));
    onChange(checkedArr, allPassed);
  }, [checked, items, onChange]);

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    const next = [...items, trimmed];
    setItems(next);
    saveItems(next);
    setNewItem("");
  };

  const removeItem = (item: string) => {
    const next = items.filter((i) => i !== item);
    setItems(next);
    saveItems(next);
    setChecked((prev) => {
      const n = new Set(prev);
      n.delete(item);
      return n;
    });
  };

  const resetChecks = () => setChecked(new Set());

  const progress = items.length > 0 ? checked.size / items.length : 0;
  const allPassed = items.length > 0 && checked.size === items.length;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-brand-500" strokeWidth={1.8} />
          <h3 className="text-[13px] font-bold text-white/90">Checklist pré-trade</h3>
          <span className="text-[10.5px] font-mono tabular-nums text-white/40">
            {checked.size}/{items.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetChecks}
            className="text-[10px] text-white/35 hover:text-white/70 transition-colors"
          >
            Limpar
          </button>
          <span className="text-white/15">·</span>
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-[10px] text-white/35 hover:text-white/70 transition-colors"
          >
            {editing ? "Fechar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-300 ${allPassed ? "bg-emerald-400" : "bg-brand-500"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        {items.map((item) => {
          const isChecked = checked.has(item);
          return (
            <div key={item} className="group flex items-center gap-2.5">
              <button
                onClick={() => toggle(item)}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors border ${
                  isChecked
                    ? "border-[#22C55E]/30 bg-white/[0.02]"
                    : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2} />
                ) : (
                  <Square className="w-3.5 h-3.5 text-white/30 shrink-0" strokeWidth={2} />
                )}
                <span className={`text-[12px] ${isChecked ? "text-emerald-200/90 line-through decoration-emerald-400/40" : "text-white/75"}`}>
                  {item}
                </span>
              </button>
              {editing && (
                <button
                  onClick={() => removeItem(item)}
                  className="shrink-0 p-1 text-white/25 hover:text-red-400 transition-colors"
                  title="Remover item"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Novo item…"
            className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0c] border border-white/[0.06] text-[12px] text-white outline-none focus:border-white/[0.16] placeholder:text-white/25"
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className="px-3 py-2 rounded-lg bg-brand-500/20 text-brand-300 text-[12px] font-bold hover:bg-brand-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      )}

      {allPassed && !editing && (
        <div className="mt-3 rounded-lg surface-card border-l-2 border-l-emerald-500 px-3 py-2 flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
          <p className="text-[11px] text-emerald-200/90 font-medium">
            Setup validado. Execute com disciplina.
          </p>
        </div>
      )}
    </div>
  );
}
