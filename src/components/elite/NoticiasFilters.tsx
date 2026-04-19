"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import { Search, X, Eraser, ChevronDown, Globe } from "lucide-react";
import type { NewsFilters, CalendarFilters, CountryFilter } from "@/lib/noticias-filters";
import type { NewsCategory } from "@/lib/market-news";
import { WatchlistFilterControls } from "./WatchlistFilter";

type CategoryCounts = Record<"all" | NewsCategory, number>;

/* ────────────────────────────────────────────
   Filtros de News — chips de categoria/score/período + search
   Atualizam URL, server re-renderiza com os filtros aplicados.
   ──────────────────────────────────────────── */

export function NewsFiltersBar({ current, counts, resultLabel }: { current: NewsFilters; counts?: CategoryCounts; resultLabel?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(current.q);
  const searchRef = useRef<HTMLInputElement | null>(null);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "" && !isDefault(key, value)) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["cat", "score", "period", "q"].forEach((k) => params.delete(k));
    setSearchText("");
    startTransition(() => {
      router.replace(params.toString() ? `?${params.toString()}` : "?", { scroll: false });
    });
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchText !== current.q) setParam("q", searchText);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Atalho "/" pra focar busca (padrão GitHub/YouTube). Ignora se já está em input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      const editable = (e.target as HTMLElement | null)?.isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || editable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const anyActive = current.cat !== "all" || current.score !== "good" || current.period !== "12h" || current.q.length > 0;

  return (
    <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
      {/* Tema (categoria) */}
      <div className="flex items-center gap-2">
        <GroupLabel>tema</GroupLabel>
        <ChipGroup>
          <Chip active={current.cat === "all"} onClick={() => setParam("cat", "all")} count={counts?.all}>Todas</Chip>
          <Chip active={current.cat === "crypto"} onClick={() => setParam("cat", "crypto")} accent="#A855F7" count={counts?.crypto}>Crypto</Chip>
          <Chip active={current.cat === "forex"} onClick={() => setParam("cat", "forex")} accent="#3B82F6" count={counts?.forex}>Forex</Chip>
          <Chip active={current.cat === "stocks"} onClick={() => setParam("cat", "stocks")} accent="#10B981" count={counts?.stocks}>Ações</Chip>
          <Chip active={current.cat === "general"} onClick={() => setParam("cat", "general")} accent="#C9A461" count={counts?.general}>Macro</Chip>
        </ChipGroup>
      </div>

      {/* Janela (período) */}
      <div className="flex items-center gap-2">
        <GroupLabel>janela</GroupLabel>
        <ChipGroup>
          <Chip active={current.period === "1h"} onClick={() => setParam("period", "1h")}>1h</Chip>
          <Chip active={current.period === "6h"} onClick={() => setParam("period", "6h")}>6h</Chip>
          <Chip active={current.period === "12h"} onClick={() => setParam("period", "12h")}>12h</Chip>
          <Chip active={current.period === "24h"} onClick={() => setParam("period", "24h")}>24h</Chip>
        </ChipGroup>
      </div>

      {/* Qualidade (score) */}
      <div className="flex items-center gap-2">
        <GroupLabel>qualidade</GroupLabel>
        <ChipGroup>
          <Chip active={current.score === "all"} onClick={() => setParam("score", "all")}>Tudo</Chip>
          <Chip active={current.score === "good"} onClick={() => setParam("score", "good")}>Relevantes</Chip>
          <Chip active={current.score === "premium"} onClick={() => setParam("score", "premium")} accent="#F87171">Top</Chip>
        </ChipGroup>
      </div>

      {/* Limpar filtros — só quando algo mudou do default */}
      {anyActive && (
        <button
          type="button"
          onClick={clearAll}
          className="interactive-tap inline-flex items-center gap-1 px-2 py-1 rounded-md border border-white/[0.06] text-[10.5px] font-semibold text-white/45 hover:text-white/85 hover:border-white/[0.14]"
          aria-label="Limpar filtros"
        >
          <Eraser className="w-2.5 h-2.5" strokeWidth={2.2} />
          Limpar
        </button>
      )}

      {/* Search + contador agrupados */}
      <div className="ml-auto flex items-center gap-2">
        {resultLabel && (
          <span className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-white/30 tabular-nums hidden sm:inline">
            {resultLabel}
          </span>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" strokeWidth={2} />
          <input
            ref={searchRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar…"
            className="w-[170px] pl-7 pr-11 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[11.5px] text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/[0.18]"
          />
          {searchText ? (
            <button type="button" onClick={() => setSearchText("")} className="interactive-tap absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded flex items-center justify-center text-white/40 hover:text-white">
              <X className="w-2.5 h-2.5" strokeWidth={2.2} />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] text-[9px] font-mono text-white/35">/</kbd>
          )}
        </div>

        {pending && <span className="text-[10px] text-white/35 animate-pulse">…</span>}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Filtros de Calendar
   ──────────────────────────────────────────── */

const COUNTRIES: { code: CountryFilter; label: string }[] = [
  { code: "all", label: "Todos países" },
  { code: "US", label: "Estados Unidos" },
  { code: "EU", label: "Zona Euro" },
  { code: "BR", label: "Brasil" },
  { code: "UK", label: "Reino Unido" },
  { code: "CN", label: "China" },
  { code: "JP", label: "Japão" },
  { code: "other", label: "Outros" },
];

export function CalendarFiltersBar({ current }: { current: CalendarFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement | null>(null);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && !isDefault(key, value)) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!countryOpen) return;
    const onClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setCountryOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [countryOpen]);

  const currentCountry = COUNTRIES.find((c) => c.code === current.country) ?? COUNTRIES[0];
  const highOnly = current.impact === "high";

  return (
    <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
      {/* Período — 3 chips */}
      <ChipGroup>
        <Chip active={current.period === "today"} onClick={() => setParam("cal_period", "today")} small>Hoje</Chip>
        <Chip active={current.period === "tomorrow"} onClick={() => setParam("cal_period", "tomorrow")} small>Amanhã</Chip>
        <Chip active={current.period === "week"} onClick={() => setParam("cal_period", "week")} small>Semana</Chip>
      </ChipGroup>

      <div className="ml-auto flex items-center gap-1.5 flex-wrap">
        {/* Watchlist — filtro por instrumento (localStorage) */}
        <WatchlistFilterControls />

        {/* Impact — toggle "só alto" */}
        <button
          type="button"
          onClick={() => setParam("cal_impact", highOnly ? "medium_plus" : "high")}
          aria-pressed={highOnly}
          className={`interactive-tap rounded-md border px-2 py-0.5 text-[10px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
            highOnly
              ? "border-red-400/40 text-red-400"
              : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.12]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Só alto
        </button>

        {/* Country — dropdown */}
        <div ref={countryRef} className="relative">
          <button
            type="button"
            onClick={() => setCountryOpen((v) => !v)}
            aria-expanded={countryOpen}
            aria-haspopup="listbox"
            className={`interactive-tap rounded-md border px-2 py-0.5 text-[10px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
              current.country !== "all"
                ? "border-white/[0.22] text-white bg-white/[0.04]"
                : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.12]"
            }`}
          >
            <Globe className="w-2.5 h-2.5" strokeWidth={2} />
            <span>{current.country === "all" ? "País" : currentCountry.label.split(" ")[0]}</span>
            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${countryOpen ? "rotate-180" : ""}`} strokeWidth={2} />
          </button>

          {countryOpen && (
            <div
              role="listbox"
              className="absolute right-0 top-full mt-1 z-30 w-[160px] rounded-lg border border-white/[0.08] bg-[#121214] shadow-2xl overflow-hidden"
            >
              {COUNTRIES.map((c) => {
                const active = current.country === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setParam("cal_country", c.code);
                      setCountryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      active ? "text-white bg-white/[0.05]" : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {pending && <span className="text-[9px] text-white/35 animate-pulse">…</span>}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   UI primitives
   ──────────────────────────────────────────── */

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/30 select-none">
      {children}
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
  accent,
  small,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: string;
  small?: boolean;
  count?: number;
}) {
  const showCount = typeof count === "number";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`interactive-tap rounded-md border transition-colors inline-flex items-center gap-1.5 ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } font-semibold ${
        active
          ? "border-white/[0.22] text-white bg-white/[0.04]"
          : "border-white/[0.06] text-white/45 hover:text-white/75 hover:border-white/[0.12]"
      }`}
      style={active && accent ? { borderColor: `${accent}55`, color: accent } : undefined}
    >
      <span>{children}</span>
      {showCount && count > 0 && (
        <span className={`text-[9.5px] font-mono tabular-nums ${active ? "opacity-70" : "text-white/30"}`}>{count}</span>
      )}
    </button>
  );
}

function isDefault(key: string, value: string): boolean {
  const defaults: Record<string, string> = {
    cat: "all",
    score: "good",
    period: "12h",
    q: "",
    cal_period: "today",
    cal_impact: "medium_plus",
    cal_country: "all",
  };
  return defaults[key] === value;
}
