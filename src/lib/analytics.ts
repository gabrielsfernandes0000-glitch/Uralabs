"use client";

/**
 * Helpers de tracking de eventos — compatível com GA4 (gtag) e Meta Pixel (fbq).
 * Todo CTA importante deve chamar trackEvent com um nome consistente pra gerar
 * relatórios de conversão no GA e permitir otimização por evento no Meta Ads.
 *
 * Convenção de nomes de evento (todos lowercase com underscore):
 *   - click_discord_free       → clique em "Entrar na Comunidade Grátis"
 *   - click_vip                → clique em CTA do plano VIP
 *   - click_elite              → clique em CTA do plano Elite
 *   - view_pricing             → scroll ou vista da seção pricing
 *   - scroll_50                → scroll 50% da página
 *   - scroll_90                → scroll 90% da página
 */

type EventPayload = Record<string, string | number | boolean | undefined>;

// Declare window extensions sem conflitar com outros typings
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Dispara um evento em todas as plataformas de tracking ativas.
 * No-op silencioso se nenhuma delas tá carregada (dev local, adblock).
 */
export function trackEvent(name: string, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  // Meta Pixel — mapeia eventos padrão pra Meta convention (track) e
  // eventos custom pra trackCustom. Eventos que são sinais fortes de
  // conversão viram Meta "Lead" ou "CompleteRegistration".
  if (typeof window.fbq === "function") {
    const metaStandard: Record<string, string> = {
      click_discord_free: "Lead",
      click_vip: "InitiateCheckout",
      click_elite: "InitiateCheckout",
      view_pricing: "ViewContent",
    };
    const mappedName = metaStandard[name];
    if (mappedName) {
      window.fbq("track", mappedName, payload);
    } else {
      window.fbq("trackCustom", name, payload);
    }
  }
}

/**
 * Pega UTMs da URL e salva no sessionStorage pra poder referenciar depois
 * (ex: no momento que o user entra no Discord ou converte VIP). Chame uma
 * vez no mount da LP.
 */
export function captureUTMs(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = params.get(k);
    if (v) utm[k] = v;
  }
  if (Object.keys(utm).length > 0) {
    try {
      sessionStorage.setItem("ura_utms", JSON.stringify(utm));
    } catch {
      // ignore private mode etc
    }
  }
}

/** Recupera UTMs salvos na sessão, pra mandar junto com eventos de conversão. */
export function getUTMs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem("ura_utms");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
