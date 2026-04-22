/**
 * Determina a "jornada" atual do trader baseado no horário BRT + dia da semana.
 *
 *  - "antes"    (pré-open NY) → prep, readiness, eventos do dia. Default 00:00–10:30 BRT.
 *  - "durante"  (mercado aberto) → registrar trades. Default 10:30–17:00 BRT.
 *  - "depois"   (pós-close) → review, stats, calendar, goals. Default 17:00–00:00 BRT + fim de semana.
 *
 * Horários ancorados à sessão NY — 9:30 EST (11:30 BRT em horário padrão, 10:30 em horário de verão).
 * Convenção simples: usa janela 10:30–17:00 que cobre ambos os cenários (DST + EST) dentro da sessão regular.
 *
 * Em fim de semana (sáb/dom) → default "depois".
 */

export type Journey = "antes" | "durante" | "depois";

export function detectJourney(now: Date = new Date()): Journey {
  // BRT = UTC-3. ISO date em BRT:
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const dow = brt.getUTCDay();
  const hour = brt.getUTCHours();
  const min = brt.getUTCMinutes();
  const hm = hour * 60 + min;

  // Fim de semana → "depois" (review/stats)
  if (dow === 0 || dow === 6) return "depois";

  // Dias úteis:
  //  < 10:30  → antes
  //  10:30 – 17:00  → durante
  //  >= 17:00 → depois
  if (hm < 10 * 60 + 30) return "antes";
  if (hm < 17 * 60) return "durante";
  return "depois";
}

export const JOURNEY_META: Record<Journey, { label: string; hint: string }> = {
  antes:   { label: "Antes",   hint: "Pré-mercado · planejar e preparar" },
  durante: { label: "Durante", hint: "Mercado aberto · registrar trades" },
  depois:  { label: "Depois",  hint: "Pós-close · revisar e aprender" },
};
