"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "@/lib/supabase";

/**
 * Realtime subscribe na tabela `market_news` (e `economic_events`). Quando
 * a cron de notícias insere novas linhas, chamamos `router.refresh()` pra
 * revalidar o server component da página — manchetes novas aparecem sem
 * o user precisar dar F5 ou esperar o revalidate de 60s.
 *
 * Debounce de 3s: cron costuma inserir em batch (10-30 linhas seguidas),
 * não vale refresh por cada — espera silenciar e refresh 1 vez só.
 *
 * Falha silenciosa: se Supabase Realtime não tiver permission na tabela
 * (precisa habilitar em Database > Replication), o subscribe retorna erro
 * e a página continua funcionando via revalidate 60s normal.
 */
export function useNoticiasRealtime() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = getSupabaseAnon();

    const triggerRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        router.refresh();
      }, 3000);
    };

    const channel = supabase
      .channel("noticias-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "market_news" },
        triggerRefresh,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "economic_events" },
        triggerRefresh,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [router]);
}
