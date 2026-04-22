"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Web Push notifications hook.
 *
 * Fluxo:
 *   1. User clica "Ativar alertas" → request permission + register SW
 *   2. Browser gera subscription com endpoint + p256dh + auth keys
 *   3. Post pra /api/push/subscribe com a subscription (salva no Supabase)
 *   4. Server-side, quando evento importante, envia push via web-push lib
 *
 * Atualmente: UI + subscription + endpoint prontos. Trigger server (envio) é
 * etapa seguinte — precisa edge function puxando de economic_events com impact=high
 * e ETA<30min, fazendo POST pra cada subscription ativa.
 */

type PushState =
  | { status: "unsupported" }
  | { status: "denied" }
  | { status: "subscribed"; subscription: PushSubscription }
  | { status: "unsubscribed" }
  | { status: "loading" };

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) bytes[i] = rawData.charCodeAt(i);
  return buffer;
}

export function usePushNotifications(vapidPublicKey?: string) {
  const [state, setState] = useState<PushState>({ status: "loading" });

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState({ status: "unsupported" });
      return;
    }
    if (Notification.permission === "denied") {
      setState({ status: "denied" });
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (!reg) {
        setState({ status: "unsubscribed" });
        return;
      }
      const sub = await reg.pushManager.getSubscription();
      if (sub) setState({ status: "subscribed", subscription: sub });
      else setState({ status: "unsubscribed" });
    } catch {
      setState({ status: "unsubscribed" });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    if (!vapidPublicKey) return { ok: false, error: "no-vapid-key" };
    if (typeof window === "undefined") return { ok: false };
    try {
      const reg = await navigator.serviceWorker.register("/sw-push.js");
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState({ status: "denied" });
        return { ok: false, error: "permission-denied" };
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setState({ status: "subscribed", subscription: sub });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "unknown" };
    }
  }, [vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    if (state.status !== "subscribed") return;
    try {
      await state.subscription.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: state.subscription.endpoint }),
      });
      setState({ status: "unsubscribed" });
    } catch {}
  }, [state]);

  return { state, subscribe, unsubscribe, refresh };
}
