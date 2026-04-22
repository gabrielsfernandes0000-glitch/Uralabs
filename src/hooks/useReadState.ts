"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ura:news-read:v1";
const MAX_ENTRIES = 500;

type ReadMap = Record<string, number>; // id → epochMs

function load(): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as ReadMap;
  } catch {
    return {};
  }
}

function save(map: ReadMap) {
  try {
    // Limita histórico — mantém os mais recentes
    const entries = Object.entries(map);
    if (entries.length > MAX_ENTRIES) {
      entries.sort((a, b) => b[1] - a[1]);
      const trimmed = Object.fromEntries(entries.slice(0, MAX_ENTRIES));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}

/**
 * Marca manchetes lidas (clicadas). Estado persiste no localStorage.
 * Outras tabs/componentes recebem update via custom event.
 */
export function useReadState() {
  const [map, setMap] = useState<ReadMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMap(load());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMap(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const markRead = useCallback((id: string) => {
    setMap((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: Date.now() };
      save(next);
      return next;
    });
  }, []);

  const isRead = useCallback((id: string): boolean => Boolean(map[id]), [map]);

  const clear = useCallback(() => {
    setMap({});
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { isRead, markRead, ready, clear, count: Object.keys(map).length };
}
