import { getSupabaseAnon } from "@/lib/supabase";
import type { EconomicEvent } from "@/lib/market-news";

/** Data "YYYY-MM-DD" no fuso America/Sao_Paulo (en-CA já entrega ISO). */
function brtDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}

/**
 * Busca eventos econômicos de HOJE (alto/médio impacto).
 * Reusado por dashboard, diário (prep autopopulate), calls, etc.
 *
 * Janela de 2 dias BRT (ontem → amanhã) porque o ingestor pode salvar
 * `event_date` em outro fuso (UTC/local do país) e ter drift de ±1 dia
 * em relação a BRT. O consumidor (NextHighImpactCard, etc) filtra pelo
 * timestamp absoluto usando `date` + `time`.
 *
 * Fallback silencioso: array vazio em caso de erro (nunca quebra a página).
 */
export async function loadTodayEvents(limit = 50): Promise<EconomicEvent[]> {
  try {
    const sb = getSupabaseAnon();
    const yesterday = brtDateStr(-1);
    const today = brtDateStr(0);
    const tomorrow = brtDateStr(1);
    const { data } = await sb
      .from("economic_events")
      .select("id, event_time, country, event, impact, previous, forecast, actual, event_date")
      .in("event_date", [yesterday, today, tomorrow])
      .in("impact", ["high", "medium"])
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(limit);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      time: r.event_time ?? "",
      country: r.country,
      event: r.event,
      impact: r.impact,
      previous: r.previous ?? undefined,
      forecast: r.forecast ?? undefined,
      actual: r.actual ?? undefined,
      date: r.event_date ?? undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Busca o evento mais recente já DIVULGADO (com actual != null) nas últimas 24h.
 * Usado no dashboard surprise card.
 */
export async function loadLastReleasedEvent(): Promise<EconomicEvent | null> {
  try {
    const sb = getSupabaseAnon();
    const since = new Date(Date.now() - 24 * 3600_000).toISOString().slice(0, 10);
    const { data } = await sb
      .from("economic_events")
      .select("id, event_time, country, event, impact, previous, forecast, actual, event_date")
      .gte("event_date", since)
      .not("actual", "is", null)
      .in("impact", ["high", "medium"])
      .order("event_date", { ascending: false })
      .order("event_time", { ascending: false })
      .limit(1);
    const r = (data ?? [])[0];
    if (!r) return null;
    return {
      id: r.id,
      time: r.event_time ?? "",
      country: r.country,
      event: r.event,
      impact: r.impact,
      previous: r.previous ?? undefined,
      forecast: r.forecast ?? undefined,
      actual: r.actual ?? undefined,
    };
  } catch {
    return null;
  }
}
