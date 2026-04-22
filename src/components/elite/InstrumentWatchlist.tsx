"use client";

import { useEffect, useState, useRef } from "react";
import { Target, Check, ChevronDown } from "lucide-react";

/* ────────────────────────────────────────────
   Instrument Watchlist — preferência do usuário por tickers.
   localStorage por enquanto (key: "elite_watchlist_v1").
   Futuramente pode subir pra user_preferences no Supabase.
   ──────────────────────────────────────────── */

export const AVAILABLE_INSTRUMENTS = [
  { code: "NQ",   label: "Nasdaq (NQ)",     group: "Índices EUA" },
  { code: "ES",   label: "S&P 500 (ES)",    group: "Índices EUA" },
  { code: "DXY",  label: "Dólar Index",      group: "Moedas" },
  { code: "EUR",  label: "Euro / EUR",       group: "Moedas" },
  { code: "GBP",  label: "Libra / GBP",      group: "Moedas" },
  { code: "JPY",  label: "Iene / JPY",       group: "Moedas" },
  { code: "BRL",  label: "Real / BRL",       group: "Moedas" },
  { code: "BTC",  label: "Bitcoin",          group: "Crypto" },
  { code: "ETH",  label: "Ethereum",         group: "Crypto" },
  { code: "GOLD", label: "Ouro",             group: "Commodities" },
  { code: "IBOV", label: "Ibovespa",         group: "Índices BR" },
  { code: "CN50", label: "China 50",         group: "Índices Ásia" },
] as const;

const STORAGE_KEY = "elite_watchlist_v1";
const DEFAULT_WATCHLIST = ["NQ", "BTC", "DXY"];

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string") ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

function setWatchlistStorage(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("watchlist:changed"));
  } catch {
    /* ignore */
  }
}

export function useWatchlist(): [string[], (list: string[]) => void] {
  const [list, setList] = useState<string[]>(DEFAULT_WATCHLIST);
  useEffect(() => {
    setList(getWatchlist());
    const onChange = () => setList(getWatchlist());
    window.addEventListener("watchlist:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("watchlist:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = (next: string[]) => {
    setList(next);
    setWatchlistStorage(next);
  };
  return [list, update];
}

/**
 * Dropdown pra editar a watchlist. Compacto, cabe em filter bars.
 */
export function WatchlistPicker() {
  const [list, setList] = useWatchlist();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const toggle = (code: string) => {
    if (list.includes(code)) {
      setList(list.filter((c) => c !== code));
    } else {
      setList([...list, code]);
    }
  };

  // Agrupa por categoria pra exibir no dropdown
  const groups = AVAILABLE_INSTRUMENTS.reduce<Record<string, typeof AVAILABLE_INSTRUMENTS[number][]>>((acc, inst) => {
    (acc[inst.group] = acc[inst.group] ?? []).push(inst);
    return acc;
  }, {});

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`interactive-tap rounded-md border px-2 py-1 text-[10.5px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
          list.length > 0
            ? "border-white/[0.22] text-white bg-white/[0.04]"
            : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.12]"
        }`}
      >
        <Target className="w-2.5 h-2.5" strokeWidth={2} />
        <span>Meus ativos</span>
        <span className="text-[9.5px] font-mono tabular-nums opacity-70">{list.length}</span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 z-30 w-[220px] max-h-[360px] overflow-y-auto rounded-lg border border-white/[0.08] bg-[#121214] shadow-2xl"
        >
          <div className="sticky top-0 z-10 px-3 py-2 border-b border-white/[0.06] bg-[#121214] flex items-center justify-between">
            <p className="text-[11px] text-white/55 text-white/45">Watchlist</p>
            <button
              type="button"
              onClick={() => setList([])}
              className="text-[9.5px] text-white/35 hover:text-white/70 transition-colors"
              aria-label="Limpar watchlist"
            >
              Limpar
            </button>
          </div>
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="py-1">
              <p className="px-3 py-1 text-[11px] text-white/55 text-white/25">{groupName}</p>
              {items.map((inst) => {
                const active = list.includes(inst.code);
                return (
                  <button
                    key={inst.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => toggle(inst.code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] transition-colors ${
                      active ? "text-white bg-white/[0.03]" : "text-white/55 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="font-medium">{inst.label}</span>
                    <span className={`shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center border ${
                      active ? "border-white/40 bg-white/10" : "border-white/[0.10]"
                    }`}>
                      {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
