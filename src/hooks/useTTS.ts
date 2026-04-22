"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * TTS (Text-to-Speech) com voz feminina pt-BR suave.
 *
 * Ordem de preferência (vozes que costumam estar disponíveis no Chrome/Edge/Safari):
 *   1. "Luciana" (pt-BR, macOS)
 *   2. "Maria" (pt-BR, Microsoft)
 *   3. "Francisca" (pt-BR, Microsoft Neural)
 *   4. "Google português do Brasil"
 *   5. qualquer voz pt-BR
 *   6. fallback pt-PT
 */
const PREFERRED_FEMALE_VOICES = [
  "Francisca",       // Microsoft Edge Neural, voz natural e feminina
  "Luciana",         // macOS/Safari, voz nítida
  "Maria",           // Microsoft
  "Helena",          // Microsoft pt-PT (fallback)
  "Camila",          // Amazon Polly (se exposto)
  "Google português do Brasil",
];

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  for (const preferred of PREFERRED_FEMALE_VOICES) {
    const match = voices.find((v) =>
      v.name.toLowerCase().includes(preferred.toLowerCase()) && /pt(-|_)/i.test(v.lang)
    );
    if (match) return match;
  }

  const ptFemale = voices.find((v) =>
    /pt(-|_)BR/i.test(v.lang) && /female|mulher|feminina/i.test(v.name)
  );
  if (ptFemale) return ptFemale;

  const ptBR = voices.find((v) => /pt(-|_)BR/i.test(v.lang));
  if (ptBR) return ptBR;

  const ptAny = voices.find((v) => /^pt/i.test(v.lang));
  return ptAny ?? null;
}

export function useTTS() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      setVoice(pickVoice(list));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setCurrentId(null);
    utteranceRef.current = null;
  }, []);

  /**
   * Fala o texto. `id` opcional pra UI saber qual botão está ativo.
   * Parâmetros ajustados pra voz suave: pitch levemente alto, rate levemente devagar.
   */
  const speak = useCallback((text: string, opts?: { id?: string; rate?: number; pitch?: number }) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang || "pt-BR";
    utter.rate = opts?.rate ?? 0.95;   // 5% mais devagar = mais natural
    utter.pitch = opts?.pitch ?? 1.08; // pitch levemente alto, mais feminino/suave
    utter.volume = 1;

    utter.onstart = () => {
      setSpeaking(true);
      setCurrentId(opts?.id ?? null);
    };
    utter.onend = () => {
      setSpeaking(false);
      setCurrentId(null);
      utteranceRef.current = null;
    };
    utter.onerror = () => {
      setSpeaking(false);
      setCurrentId(null);
      utteranceRef.current = null;
    };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [voice]);

  const toggle = useCallback((text: string, id?: string) => {
    if (speaking && currentId === id) {
      stop();
    } else {
      speak(text, { id });
    }
  }, [speaking, currentId, speak, stop]);

  return { supported, voices, voice, setVoice, speaking, currentId, speak, stop, toggle };
}
