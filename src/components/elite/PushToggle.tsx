"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Botão pra ativar/desativar alertas push.
 * Recebe VAPID public key via env (NEXT_PUBLIC_VAPID_PUBLIC_KEY).
 * Se não configurado, botão fica em estado "disabled — configurar".
 */
export function PushToggle() {
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const { state, subscribe, unsubscribe } = usePushNotifications(vapid);

  if (state.status === "unsupported") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-white/35 border border-white/[0.06]">
        <BellOff className="w-3 h-3" strokeWidth={2} />
        Push indisponível neste browser
      </div>
    );
  }

  if (!vapid) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-white/35 border border-white/[0.06]" title="NEXT_PUBLIC_VAPID_PUBLIC_KEY ausente em env">
        <BellOff className="w-3 h-3" strokeWidth={2} />
        Alertas não configurados
      </div>
    );
  }

  if (state.status === "denied") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-amber-400/70 border border-amber-400/20">
        <BellOff className="w-3 h-3" strokeWidth={2} />
        Permissão bloqueada
      </div>
    );
  }

  if (state.status === "subscribed") {
    return (
      <button
        type="button"
        onClick={() => unsubscribe()}
        className="interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium border border-white/25 text-white bg-white/[0.04]"
      >
        <BellRing className="w-3 h-3" strokeWidth={2} />
        Alertas ativos
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => subscribe()}
      disabled={state.status === "loading"}
      className="interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium border border-white/[0.10] text-white/65 hover:border-white/25 hover:text-white"
    >
      <Bell className="w-3 h-3" strokeWidth={2} />
      Ativar alertas
    </button>
  );
}
