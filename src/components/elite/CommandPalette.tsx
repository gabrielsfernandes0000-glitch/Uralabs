"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, Users, Radio, BookOpen, Crosshair,
  Trophy, Gift, BarChart3, Target, NotebookPen, Globe, LineChart, type LucideIcon,
} from "lucide-react";
import { CURRICULUM } from "@/lib/curriculum";
import { MODULE_TREINOS } from "@/lib/module-treinos";
import { TREINO_CATEGORIES, countByCategory } from "@/lib/treino-scenarios";

/* ────────────────────────────────────────────
   Command Palette — atalho global Cmd+K / Ctrl+K.
   Busca fuzzy em rotas + aulas + treinos. Resolve o problema de
   "subcategorias ocultas" sem precisar poluir a sidebar.
   ──────────────────────────────────────────── */

type Item = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Páginas" | "Aulas" | "Treinos";
  icon: LucideIcon;
  keywords: string;
  /** Mantém em paridade com `Sidebar.tsx` — esconde para não-admin durante demo. */
  adminOnly?: boolean;
};

const PAGES: Item[] = [
  { id: "page-dashboard",  label: "Dashboard",  hint: "Visão geral",         href: "/elite",            group: "Páginas", icon: LayoutDashboard, keywords: "home inicio" },
  { id: "page-corretora",  label: "Corretora",  hint: "Sua conta + análise", href: "/elite/corretora",  group: "Páginas", icon: BarChart3,       keywords: "exchange binance bingx patrimonio pnl trades" },
  { id: "page-calls",      label: "Calls",      hint: "Ao vivo",             href: "/elite/calls",      group: "Páginas", icon: Radio,           keywords: "live ao vivo transmissao" },
  { id: "page-graficos",   label: "Gráficos",   hint: "TradingView real-time",href: "/elite/graficos",   group: "Páginas", icon: LineChart,       keywords: "chart grafico btc nasdaq ibov ouro forex" },
  { id: "page-aulas",      label: "Aulas",      hint: "Currículo Elite",     href: "/elite/aulas",      group: "Páginas", icon: BookOpen,        keywords: "curso curriculo" },
  { id: "page-pratica",    label: "Prática",    hint: "Treinos e cenários",  href: "/elite/pratica",    group: "Páginas", icon: Crosshair,       keywords: "treino cenario scenarios" },
  { id: "page-diario",     label: "Diário",     hint: "Prep Sheet + review", href: "/elite/diario",     group: "Páginas", icon: NotebookPen,     keywords: "prep sheet diario trade journal plano", adminOnly: true },
  { id: "page-noticias",   label: "Notícias",   hint: "Agenda + manchetes",  href: "/elite/noticias",   group: "Páginas", icon: Globe,           keywords: "news calendario cpi fomc nfp fed economia agenda" },
  { id: "page-membros",    label: "Membros",    hint: "Todos membros",       href: "/elite/membros",    group: "Páginas", icon: Users,           keywords: "turma community comunidade" },
  { id: "page-conquistas", label: "Conquistas", hint: "Badges e timeline",   href: "/elite/conquistas", group: "Páginas", icon: Trophy,          keywords: "achievements badges", adminOnly: true },
  { id: "page-loja",       label: "Loja",       hint: "URA Coin + caixas",   href: "/elite/loja",       group: "Páginas", icon: Gift,            keywords: "coin loot box", adminOnly: true },
  { id: "page-perfil",     label: "Perfil",     hint: "Cosméticos",          href: "/elite/perfil",     group: "Páginas", icon: Users,           keywords: "banner frame aura" },
];

function buildIndex(isAdmin: boolean): Item[] {
  const items: Item[] = PAGES.filter((p) => isAdmin || !p.adminOnly);

  // Aulas
  for (const mod of CURRICULUM) {
    for (const lesson of mod.lessons) {
      items.push({
        id: `lesson-${lesson.id}`,
        label: lesson.title,
        hint: `${mod.title} · aula`,
        href: `/elite/aulas/${lesson.id}`,
        group: "Aulas",
        icon: BookOpen,
        keywords: `${mod.title} ${lesson.subtitle ?? ""} ${lesson.id}`.toLowerCase(),
      });
    }
  }

  // Treinos
  for (const [modKey, treinos] of Object.entries(MODULE_TREINOS)) {
    for (const t of treinos) {
      items.push({
        id: `treino-${t.id}`,
        label: t.title,
        hint: `Treino · ${t.difficulty}`,
        href: `/elite/treino/${t.id}`,
        group: "Treinos",
        icon: Target,
        keywords: `${modKey} ${t.desc}`.toLowerCase(),
      });
    }
  }

  items.push({
    id: "treino-livre",
    label: "Treino Livre",
    hint: "Modo infinito · todos os temas",
    href: "/elite/treino/livre",
    group: "Treinos",
    icon: Target,
    keywords: "livre infinito aleatorio random",
  });

  // Temas — cada categoria como entrada filtrável do Treino Livre
  const counts = countByCategory();
  for (const cat of TREINO_CATEGORIES) {
    const n = counts[cat.key] ?? 0;
    if (n === 0) continue;
    items.push({
      id: `tema-${cat.key}`,
      label: `Treino ${cat.key}`,
      hint: `Tema · ${n} ${n === 1 ? "cenário" : "cenários"}`,
      href: `/elite/treino/livre?category=${encodeURIComponent(cat.key)}`,
      group: "Treinos",
      icon: Target,
      keywords: `tema ${cat.tagline} ${cat.key}`.toLowerCase(),
    });
  }

  return items;
}

function score(item: Item, q: string): number {
  if (!q) return 1;
  const qLower = q.toLowerCase();
  const label = item.label.toLowerCase();
  const hint = item.hint.toLowerCase();
  const kw = item.keywords;

  if (label === qLower) return 100;
  if (label.startsWith(qLower)) return 80;
  if (label.includes(qLower)) return 60;
  if (hint.includes(qLower)) return 40;
  if (kw.includes(qLower)) return 30;

  // Fuzzy — todas as letras da query aparecem em ordem no label
  let idx = 0;
  for (const ch of qLower) {
    const found = label.indexOf(ch, idx);
    if (found === -1) return 0;
    idx = found + 1;
  }
  return 10;
}

export function CommandPalette({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => buildIndex(isAdmin), [isAdmin]);

  const results = useMemo(() => {
    const scored = items
      .map((i) => ({ i, s: score(i, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);
    return scored.slice(0, 30).map((r) => r.i);
  }, [items, q]);

  const groups = useMemo(() => {
    const g = new Map<Item["group"], Item[]>();
    for (const r of results) {
      const arr = g.get(r.group) ?? [];
      arr.push(r);
      g.set(r.group, arr);
    }
    return g;
  }, [results]);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setActiveIdx(0);
  }, []);

  const navigate = useCallback((item: Item) => {
    router.push(item.href);
    close();
  }, [router, close]);

  // Atalho Cmd+K / Ctrl+K pra abrir
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Foco no input quando abrir + reset scroll
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setActiveIdx(0);
    }
  }, [open]);

  // Keyboard nav dentro do modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIdx];
        if (target) navigate(target);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, activeIdx, navigate, close]);

  // Mantém item ativo visível ao rolar com teclado
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={close}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#141417] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-3 px-5 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActiveIdx(0); }}
            placeholder="Buscar aula, treino ou página…"
            className="flex-1 py-4 bg-transparent text-[14px] text-white placeholder-white/30 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-white/30 border border-white/[0.08] rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="text-[12px] text-white/30 text-center py-8">Nada encontrado.</p>
          ) : (
            Array.from(groups.entries()).map(([group, list]) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="px-5 pt-2 pb-1 text-[9.5px] font-bold tracking-[0.2em] uppercase text-white/30">
                  {group}
                </div>
                {list.map((item) => {
                  flatIdx += 1;
                  const idx = flatIdx;
                  const active = idx === activeIdx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.05] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-white/50" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold truncate ${active ? "text-white" : "text-white/85"}`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-white/35 truncate">{item.hint}</p>
                      </div>
                      {active && (
                        <kbd className="text-[9px] font-mono text-white/40 border border-white/[0.08] rounded px-1.5 py-0.5 shrink-0">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer com shortcut hint */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.05] bg-[#0e0e10]">
          <p className="text-[10.5px] text-white/30">
            <kbd className="font-mono text-white/45 border border-white/[0.08] rounded px-1 py-0.5">↑</kbd>{" "}
            <kbd className="font-mono text-white/45 border border-white/[0.08] rounded px-1 py-0.5">↓</kbd> navegar ·{" "}
            <kbd className="font-mono text-white/45 border border-white/[0.08] rounded px-1 py-0.5">↵</kbd> abrir
          </p>
          <p className="text-[10.5px] text-white/30">
            <kbd className="font-mono text-white/45 border border-white/[0.08] rounded px-1 py-0.5">⌘K</kbd> pra fechar
          </p>
        </div>
      </div>
    </div>
  );
}
