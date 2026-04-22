/**
 * Fed Funds rate probabilities.
 *
 * CME FedWatch tool não tem API pública documentada. Alternativa:
 *   - Polygon.io (plano free tem Fed Funds futures quotes — derivar probs)
 *   - Calcular manualmente a partir de ZQ (30-day Fed Funds futures) prices
 *
 * Por enquanto: lê de `fed_funds_probabilities` no Supabase (abastecida por edge func
 * separada quando tivermos fonte). Se tabela vazia ou sem fonte, UI mostra stub.
 *
 * Schema esperado (se ativado):
 *   create table fed_funds_probabilities (
 *     meeting_date date primary key,
 *     cuts_50bp numeric,
 *     cuts_25bp numeric,
 *     hold numeric,
 *     hikes_25bp numeric,
 *     hikes_50bp numeric,
 *     updated_at timestamptz
 *   );
 */

import { getSupabaseAnon } from "@/lib/supabase";

export type FedProbability = {
  meetingDate: string;
  cuts50: number;
  cuts25: number;
  hold: number;
  hikes25: number;
  hikes50: number;
  updatedAt: string;
  /** Cenário dominante com label PT-BR. */
  dominant: { label: string; pct: number; direction: "cut" | "hold" | "hike" };
};

function pickDominant(p: Omit<FedProbability, "dominant" | "meetingDate" | "updatedAt">): FedProbability["dominant"] {
  const entries: Array<[string, number, "cut" | "hold" | "hike"]> = [
    ["Corte 50bps", p.cuts50, "cut"],
    ["Corte 25bps", p.cuts25, "cut"],
    ["Manter", p.hold, "hold"],
    ["Alta 25bps", p.hikes25, "hike"],
    ["Alta 50bps", p.hikes50, "hike"],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const [label, pct, direction] = entries[0];
  return { label, pct, direction };
}

export async function fetchNextFedMeetingProb(): Promise<FedProbability | null> {
  try {
    const sb = getSupabaseAnon();
    const { data } = await sb
      .from("fed_funds_probabilities")
      .select("*")
      .gte("meeting_date", new Date().toISOString().slice(0, 10))
      .order("meeting_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const core = {
      cuts50: Number(data.cuts_50bp ?? 0),
      cuts25: Number(data.cuts_25bp ?? 0),
      hold: Number(data.hold ?? 0),
      hikes25: Number(data.hikes_25bp ?? 0),
      hikes50: Number(data.hikes_50bp ?? 0),
    };
    return {
      meetingDate: data.meeting_date,
      updatedAt: data.updated_at,
      ...core,
      dominant: pickDominant(core),
    };
  } catch {
    return null;
  }
}
