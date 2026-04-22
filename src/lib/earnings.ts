/**
 * Earnings calendar via Finnhub.
 *
 * Endpoint: https://finnhub.io/api/v1/calendar/earnings?from=YYYY-MM-DD&to=YYYY-MM-DD&token=KEY
 * Plano free: 60 req/min, suficiente pro revalidate de 1h.
 *
 * Caso FINNHUB_API_KEY não esteja configurada, retorna [] e a UI mostra empty state.
 */

export type EarningsEntry = {
  symbol: string;
  date: string;         // YYYY-MM-DD
  hour: "bmo" | "amc" | "dmh" | "";  // before-market / after-market / during-market / unknown
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  quarter: number | null;
  year: number | null;
};

function parseHour(raw: unknown): EarningsEntry["hour"] {
  if (raw === "bmo" || raw === "amc" || raw === "dmh") return raw;
  return "";
}

export function hourLabel(hour: EarningsEntry["hour"]): string {
  switch (hour) {
    case "bmo": return "Antes do open";
    case "amc": return "After-hours";
    case "dmh": return "Intraday";
    default: return "Horário aberto";
  }
}

/** Curadoria de grandes caps que movem índice — prioriza esses no card. */
export const MAJOR_TICKERS = new Set([
  "AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "AMZN", "META", "TSLA", "AVGO", "AMD",
  "JPM", "BAC", "GS", "MS", "V", "MA", "NFLX", "DIS", "CRM", "ORCL",
  "WMT", "COST", "HD", "KO", "PEP", "MCD", "NKE", "XOM", "CVX", "UNH",
  "LLY", "JNJ", "PFE", "ABBV", "MRK", "BA", "CAT", "GE", "UBER", "SHOP",
  "PLTR", "COIN", "SQ", "SNOW", "DDOG", "PANW", "CRWD", "SMCI", "ARM", "MU",
]);

export async function fetchEarningsForRange(from: string, to: string): Promise<EarningsEntry[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return [];

  try {
    const url = `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const list: unknown[] = json?.earningsCalendar ?? [];
    return list.map((r: any) => ({
      symbol: String(r.symbol || "").toUpperCase(),
      date: String(r.date || ""),
      hour: parseHour(r.hour),
      epsEstimate: r.epsEstimate ?? null,
      epsActual: r.epsActual ?? null,
      revenueEstimate: r.revenueEstimate ?? null,
      revenueActual: r.revenueActual ?? null,
      quarter: r.quarter ?? null,
      year: r.year ?? null,
    })).filter((e) => e.symbol && e.date);
  } catch {
    return [];
  }
}

/** Retorna earnings dos próximos 7 dias, priorizando major caps. */
export async function fetchUpcomingEarnings(days = 7): Promise<EarningsEntry[]> {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const toDate = new Date(today.getTime() + days * 24 * 3600 * 1000);
  const to = toDate.toISOString().slice(0, 10);

  const all = await fetchEarningsForRange(from, to);
  // Major caps primeiro; resto depois. Dentro de cada, ordena por data.
  return all.sort((a, b) => {
    const aMajor = MAJOR_TICKERS.has(a.symbol) ? 0 : 1;
    const bMajor = MAJOR_TICKERS.has(b.symbol) ? 0 : 1;
    if (aMajor !== bMajor) return aMajor - bMajor;
    return a.date.localeCompare(b.date);
  });
}
