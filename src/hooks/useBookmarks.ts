"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ura:bookmarks:v1";

export type Bookmark = {
  id: string;
  headline: string;
  url: string;
  source: string;
  publishedAt: string;
  savedAt: string;
  note?: string;
};

function load(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: Bookmark[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useBookmarks() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
  }, []);

  const add = useCallback((b: Omit<Bookmark, "savedAt">) => {
    setItems((prev) => {
      if (prev.some((x) => x.id === b.id)) return prev;
      const next = [{ ...b, savedAt: new Date().toISOString() }, ...prev].slice(0, 200);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((b) => b.id !== id);
      save(next);
      return next;
    });
  }, []);

  const toggle = useCallback((b: Omit<Bookmark, "savedAt">) => {
    setItems((prev) => {
      const exists = prev.some((x) => x.id === b.id);
      const next = exists
        ? prev.filter((x) => x.id !== b.id)
        : [{ ...b, savedAt: new Date().toISOString() }, ...prev].slice(0, 200);
      save(next);
      return next;
    });
  }, []);

  const annotate = useCallback((id: string, note: string) => {
    setItems((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, note } : b));
      save(next);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => items.some((b) => b.id === id), [items]);

  return { items, ready, add, remove, toggle, annotate, has };
}
