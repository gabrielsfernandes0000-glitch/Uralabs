"use client";

import { Volume2, Square } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";

/**
 * Botão de TTS com voz feminina suave pt-BR.
 * Fallback gracioso se browser não suporta speechSynthesis.
 */
export function NewsTTSButton({
  id,
  text,
  size = "sm",
  className = "",
}: {
  id: string;
  text: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const tts = useTTS();

  if (!tts.supported) return null;

  const active = tts.speaking && tts.currentId === id;
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        tts.toggle(text, id);
      }}
      title={active ? "Parar leitura" : "Ouvir (voz feminina pt-BR)"}
      aria-label={active ? "Parar leitura" : "Ouvir"}
      className={`interactive-tap inline-flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors border ${
        active
          ? "border-white/25 text-white bg-white/[0.06]"
          : "text-white/40 hover:text-white/80 hover:bg-white/[0.04] border-transparent"
      } ${className}`}
    >
      {active ? <Square className={dim} strokeWidth={2.2} /> : <Volume2 className={dim} strokeWidth={2} />}
    </button>
  );
}
