"use client";

import { useNoticiasRealtime } from "@/hooks/useNoticiasRealtime";

/**
 * Componente invisível — só monta o hook de realtime. Coloca uma vez
 * dentro de /elite/noticias/page.tsx pra novas manchetes/eventos
 * trigger automatic refresh do server component.
 */
export function NoticiasRealtimeListener() {
  useNoticiasRealtime();
  return null;
}
