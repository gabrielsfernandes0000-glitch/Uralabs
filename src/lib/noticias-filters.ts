/* ────────────────────────────────────────────
   Filtros — estado sincronizado com searchParams (?cat=, ?score=, etc).
   Página (server component) lê os params; componente client atualiza via router.
   ──────────────────────────────────────────── */

export type NewsCategoryFilter = "all" | "general" | "forex" | "crypto" | "stocks";
export type ScoreFilter = "all" | "good" | "premium";
export type PeriodFilter = "1h" | "6h" | "12h" | "24h";

export type CalendarPeriod = "today" | "tomorrow" | "week";
export type ImpactFilter = "high" | "medium_plus";
export type CountryFilter = "all" | "US" | "EU" | "BR" | "UK" | "CN" | "JP" | "other";

export interface NewsFilters {
  cat: NewsCategoryFilter;
  score: ScoreFilter;
  period: PeriodFilter;
  q: string; // search text
}

export interface CalendarFilters {
  period: CalendarPeriod;
  impact: ImpactFilter;
  country: CountryFilter;
}

export const DEFAULT_NEWS_FILTERS: NewsFilters = {
  cat: "all",
  score: "good",
  period: "12h",
  q: "",
};

export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  period: "today",
  impact: "medium_plus",
  country: "all",
};

/** Parse dos searchParams (vindos do server component) pra objeto tipado. */
export function parseNewsFilters(sp: Record<string, string | string[] | undefined>): NewsFilters {
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) ?? "";
  const cat = get("cat") as NewsCategoryFilter;
  const score = get("score") as ScoreFilter;
  const period = get("period") as PeriodFilter;
  const q = get("q");
  return {
    cat: (["all", "general", "forex", "crypto", "stocks"].includes(cat) ? cat : "all"),
    score: (["all", "good", "premium"].includes(score) ? score : "good"),
    period: (["1h", "6h", "12h", "24h"].includes(period) ? period : "12h"),
    q: typeof q === "string" ? q.slice(0, 60) : "",
  };
}

export function parseCalendarFilters(sp: Record<string, string | string[] | undefined>): CalendarFilters {
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) ?? "";
  const period = get("cal_period") as CalendarPeriod;
  const impact = get("cal_impact") as ImpactFilter;
  const country = get("cal_country") as CountryFilter;
  return {
    period: (["today", "tomorrow", "week"].includes(period) ? period : "today"),
    impact: (["high", "medium_plus"].includes(impact) ? impact : "medium_plus"),
    country: (["all", "US", "EU", "BR", "UK", "CN", "JP", "other"].includes(country) ? country : "all"),
  };
}

export function scoreThreshold(score: ScoreFilter): number {
  if (score === "premium") return 60;
  if (score === "good") return 40;
  return 0;
}

export function periodHours(period: PeriodFilter): number {
  return { "1h": 1, "6h": 6, "12h": 12, "24h": 24 }[period];
}

/** True quando qualquer filtro difere do default — usado pra exibir "Limpar". */
export function hasActiveNewsFilters(f: NewsFilters): boolean {
  return (
    f.cat !== DEFAULT_NEWS_FILTERS.cat ||
    f.score !== DEFAULT_NEWS_FILTERS.score ||
    f.period !== DEFAULT_NEWS_FILTERS.period ||
    f.q.trim().length > 0
  );
}

export function calendarDateRange(period: CalendarPeriod): { from: string; to: string } {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today.getTime() + 86400_000);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const weekEnd = new Date(today.getTime() + 7 * 86400_000);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  switch (period) {
    case "tomorrow": return { from: tomorrowStr, to: tomorrowStr };
    case "week":     return { from: todayStr, to: weekEndStr };
    default:         return { from: todayStr, to: todayStr };
  }
}
