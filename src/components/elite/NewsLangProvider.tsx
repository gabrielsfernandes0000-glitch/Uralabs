"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Lang = "en" | "pt";
type Translation = { h: string; s: string | null };

type InItem = { id: string; headline: string; summary?: string | null };

interface NewsLangContextType {
  lang: Lang;
  toggle: () => void;
  translations: Record<string, Translation>;
  loading: boolean;
  pending: number;
  total: number;
  ensureTranslated: (items: InItem[]) => void;
}

const NewsLangContext = createContext<NewsLangContextType | null>(null);
const LS_KEY = "ura.news.lang";
const SS_KEY = "ura.news.translations";

export function NewsLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [translations, setTranslations] = useState<Record<string, Translation>>({});
  const [loading, setLoading] = useState(false);

  // Universo de itens "conhecidos" — quem já foi visto por ensureTranslated
  // fica aqui, pra poder retraduzir em massa no toggle mesmo se o chamador
  // sumir ou não refaça a lista (ex: filtro mudou e feed antigo ficou sem ref).
  const knownItems = useRef<Map<string, InItem>>(new Map());
  const [known, setKnown] = useState(0); // trigger re-render só pra UI count

  const inFlight = useRef<Set<string>>(new Set());
  const pendingBatch = useRef<InItem[]>([]);
  const flushTimer = useRef<number | null>(null);

  // Hidrata do storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === "pt" || saved === "en") setLang(saved);
      const cached = sessionStorage.getItem(SS_KEY);
      if (cached) setTranslations(JSON.parse(cached));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {}
  }, [lang]);
  useEffect(() => {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(translations));
    } catch {}
  }, [translations]);

  const flush = useCallback(async () => {
    const batch = pendingBatch.current;
    pendingBatch.current = [];
    flushTimer.current = null;

    const toFetch = batch.filter((it) => !inFlight.current.has(it.id));
    if (!toFetch.length) {
      if (!inFlight.current.size) setLoading(false);
      return;
    }
    toFetch.forEach((it) => inFlight.current.add(it.id));

    setLoading(true);
    try {
      const r = await fetch("/api/news/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: toFetch }),
      });
      if (r.ok) {
        const data = (await r.json()) as { translations?: Record<string, Translation> };
        if (data.translations && Object.keys(data.translations).length) {
          setTranslations((prev) => ({ ...prev, ...data.translations }));
        }
      }
    } catch {
      // engole — UI mostra EN enquanto PT não chega
    } finally {
      toFetch.forEach((it) => inFlight.current.delete(it.id));
      if (!pendingBatch.current.length && !inFlight.current.size) setLoading(false);
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current == null) {
      flushTimer.current = window.setTimeout(flush, 100);
    }
  }, [flush]);

  const ensureTranslated = useCallback(
    (items: InItem[]) => {
      // Sempre registra no conjunto de conhecidos, mesmo quando lang=en.
      // Assim o toggle pra PT consegue puxar tudo em massa.
      let added = 0;
      for (const it of items) {
        if (!it?.id) continue;
        if (!knownItems.current.has(it.id)) {
          knownItems.current.set(it.id, it);
          added++;
        }
      }
      if (added) setKnown((n) => n + added);

      if (lang !== "pt") return;
      const fresh = items.filter(
        (it) => it?.id && !translations[it.id] && !inFlight.current.has(it.id),
      );
      if (!fresh.length) return;
      pendingBatch.current.push(...fresh);
      scheduleFlush();
    },
    [lang, translations, scheduleFlush],
  );

  // Quando liga PT (ou monta com lang=pt no storage), puxa tradução de TODOS
  // itens conhecidos que ainda não estão traduzidos. Garante que novas
  // notícias que apareceram depois do 1º toggle entrem na fila também.
  useEffect(() => {
    if (lang !== "pt") return;
    const missing: InItem[] = [];
    for (const it of knownItems.current.values()) {
      if (!translations[it.id] && !inFlight.current.has(it.id)) {
        missing.push(it);
      }
    }
    if (missing.length) {
      pendingBatch.current.push(...missing);
      scheduleFlush();
    }
  }, [lang, known, translations, scheduleFlush]);

  const toggle = useCallback(() => {
    setLang((v) => (v === "pt" ? "en" : "pt"));
  }, []);

  // Contagem pra UI
  const total = known; // n de itens conhecidos
  const translatedCount = useMemo(() => {
    let c = 0;
    for (const id of knownItems.current.keys()) {
      if (translations[id]) c++;
    }
    return c;
  }, [translations, known]);
  const pending = Math.max(0, total - translatedCount);

  const value = useMemo<NewsLangContextType>(
    () => ({ lang, toggle, translations, loading, pending, total, ensureTranslated }),
    [lang, toggle, translations, loading, pending, total, ensureTranslated],
  );

  return <NewsLangContext.Provider value={value}>{children}</NewsLangContext.Provider>;
}

export function useNewsLang() {
  const ctx = useContext(NewsLangContext);
  if (!ctx) throw new Error("useNewsLang: missing NewsLangProvider");
  return ctx;
}

/** Helper pra aplicar tradução num item sem hooks (puro). */
export function applyT(
  item: { id: string; headline: string; summary?: string | null },
  lang: Lang,
  translations: Record<string, Translation>,
) {
  if (lang !== "pt") return { headline: item.headline, summary: item.summary ?? null };
  const t = translations[item.id];
  return t ? { headline: t.h, summary: t.s } : { headline: item.headline, summary: item.summary ?? null };
}
