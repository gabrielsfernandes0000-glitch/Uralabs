"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseAnon } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeStatus = "connecting" | "live" | "polling" | "disabled";

interface ExchangeEvent {
  event: string;
  payload: Record<string, unknown>;
}

/**
 * Subscribe no canal Supabase Realtime `exchange:<userId>:<exchange>`.
 * O worker Railway (site/worker) broadcasta eventos ACCOUNT_UPDATE e
 * ORDER_TRADE_UPDATE conforme a BingX empurra pro WebSocket dele.
 *
 * Status retornado:
 *  - "connecting": tentando subscribe inicial
 *  - "live": canal OK, worker push fluindo
 *  - "polling": canal falhou (worker offline / Supabase Realtime down) — cliente deve usar polling
 *  - "disabled": feature desligada via env
 *
 * Chamador decide o que fazer com os eventos no callback `onEvent`.
 * Se status virar "polling" → caller deve re-ativar setInterval antigo.
 */
export function useExchangeRealtime(
  userId: string | null,
  exchange: string,
  onEvent: (evt: ExchangeEvent) => void,
) {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    // Feature flag — se NEXT_PUBLIC_EXCHANGE_REALTIME nao tiver "true", vira polling puro
    const enabled = process.env.NEXT_PUBLIC_EXCHANGE_REALTIME === "true";
    if (!enabled) {
      setStatus("disabled");
      return;
    }

    if (!userId) return;

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // O nome do canal é HMAC server-side (REALTIME_CHANNEL_SECRET). Cliente
    // NÃO pode computar — precisa pedir ao server. Impede que alguém subscreva
    // canal de outro user só conhecendo o Discord ID dele.
    (async () => {
      let channelName: string;
      try {
        const res = await fetch(`/api/exchange/realtime-channel?exchange=${encodeURIComponent(exchange)}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (!body.channelName) throw new Error("no channelName");
        channelName = body.channelName as string;
      } catch (err) {
        if (!cancelled) setStatus("polling");
        console.warn("[useExchangeRealtime] failed to get channel name:", err);
        return;
      }

      if (cancelled) return;

      const supabase = getSupabaseAnon();
      channel = supabase.channel(channelName, { config: { broadcast: { self: false } } });

      channel.on("broadcast", { event: "*" }, (msg) => {
        onEventRef.current({
          event: (msg.event as string) || "unknown",
          payload: (msg.payload as Record<string, unknown>) || {},
        });
      });

      channel.subscribe((subStatus) => {
        if (cancelled) return;
        if (subStatus === "SUBSCRIBED") setStatus("live");
        else if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT" || subStatus === "CLOSED") setStatus("polling");
      });

      channelRef.current = channel;

      timeoutId = setTimeout(() => {
        if (!cancelled) setStatus((s) => (s === "connecting" ? "polling" : s));
      }, 8000);
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [userId, exchange]);

  return status;
}
