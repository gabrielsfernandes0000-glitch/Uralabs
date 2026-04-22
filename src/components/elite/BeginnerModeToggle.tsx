"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

const STORAGE_KEY = "ura:beginner-mode:v1";

export function useBeginnerMode() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setOn(raw === "1");
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setOn(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    // Broadcast pra outras abas/componentes
    window.dispatchEvent(new StorageEvent("storage", {
      key: STORAGE_KEY,
      newValue: next ? "1" : "0",
    }));
  };

  return { on, ready, toggle };
}

export function BeginnerModeToggle({ className = "" }: { className?: string }) {
  const { on, ready, toggle } = useBeginnerMode();
  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={on ? "Modo iniciante ativo — explicações simplificadas" : "Ativar modo iniciante — explicações mais simples"}
      className={`interactive-tap inline-flex items-center justify-center gap-1.5 h-8 px-2 rounded-md text-[11px] font-semibold transition-colors border ${
        on
          ? "border-white/25 text-white bg-white/[0.06]"
          : "border-white/[0.06] text-white/55 hover:border-white/[0.18] hover:text-white/85 hover:bg-white/[0.02]"
      } ${className}`}
    >
      <Lightbulb className="w-3 h-3" strokeWidth={2} />
      <span className="truncate">{on ? "Modo iniciante" : "Explicar simples"}</span>
    </button>
  );
}
