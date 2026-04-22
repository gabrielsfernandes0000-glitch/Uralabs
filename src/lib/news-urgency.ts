import type { EconomicEvent, MarketNews } from "@/lib/market-news";

/**
 * Urgency scoring — ordena eventos/notícias pelo que o trader precisa ver primeiro.
 *
 * Score maior = mais urgente. Entra em jogo:
 *   - ETA pra release (menos tempo = mais urgente)
 *   - Impacto (high > medium > low)
 *   - Match com watchlist (+1.5x boost)
 *   - Recency pra notícias
 *
 * Uso: ordenar NowCard, TTS read order, feed priority.
 */

function parseMins(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function matchesWatchlist(text: string, watchlist: string[]): boolean {
  if (watchlist.length === 0) return false;
  const upper = text.toUpperCase();
  return watchlist.some((s) => upper.includes(s));
}

const IMPACT_SCORE: Record<string, number> = { high: 30, medium: 12, low: 4 };

export function scoreEvent(ev: EconomicEvent, nowMins: number, watchlist: string[] = []): number {
  const m = parseMins(ev.time);
  if (m === null) return 0;
  const eta = m - nowMins;

  let score = IMPACT_SCORE[ev.impact] ?? 0;

  // ETA boost: release iminente vale muito, passado perde valor rapidamente
  if (!ev.actual) {
    if (eta >= 0 && eta < 15)  score += 50;
    else if (eta >= 0 && eta < 60) score += 25;
    else if (eta >= 0 && eta < 180) score += 10;
    else if (eta < 0 && eta > -15) score += 15; // just-released tem prioridade
    else if (eta < -60) score -= 10;
  } else {
    // Released: prioridade média se foi há < 30min
    if (eta > -30) score += 12;
    else score -= 8;
  }

  // Watchlist match — instrumento do evento é relevante?
  const text = `${ev.event} ${ev.country}`;
  if (matchesWatchlist(text, watchlist)) score *= 1.5;

  return score;
}

export function scoreNews(n: MarketNews, nowMs: number, watchlist: string[] = []): number {
  const ageMs = nowMs - new Date(n.publishedAt).getTime();
  const ageMins = ageMs / 60000;

  let score = IMPACT_SCORE[n.importance] ?? 0;

  if (ageMins < 30)       score += 30;
  else if (ageMins < 120) score += 15;
  else if (ageMins < 360) score += 5;
  else if (ageMins > 720) score -= 10;

  const text = `${n.headline} ${n.summary ?? ""}`;
  if (matchesWatchlist(text, watchlist)) score *= 1.5;

  return score;
}

export function sortByUrgency<T>(
  items: T[],
  scorer: (item: T) => number
): T[] {
  return [...items].sort((a, z) => scorer(z) - scorer(a));
}

/**
 * Dedup de notícias por similaridade de headline.
 * Agrupa items cujo headline normalizado compartilha 4+ palavras significantes.
 * Retorna apenas o de maior score por grupo.
 *
 * DB já tem topic_hash via view `market_news_deduped`, mas esse hash é por dia/fonte;
 * tópicos que cross-source (mesma história em 3 sites) escapam. Esse dedup client-side pega.
 */
const STOP_WORDS = new Set([
  "a","o","as","os","de","da","do","das","dos","e","em","no","na","nos","nas","um","uma","uns","umas",
  "pra","para","por","com","sem","que","se","é","the","of","to","in","and","or","for","on","at","is",
  "it","as","by","be","an","are","was","were","this","that","from","have","has","had","will","would",
]);

function normalize(headline: string): Set<string> {
  return new Set(
    headline
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return intersection / union;
}

export type NewsCluster = {
  primary: MarketNews;
  duplicates: MarketNews[];
  sources: string[];
};

export function clusterNews(
  news: MarketNews[],
  scorer: (n: MarketNews) => number,
  threshold = 0.45
): NewsCluster[] {
  const tokens = news.map((n) => normalize(n.headline));
  const used = new Set<number>();
  const clusters: NewsCluster[] = [];

  // Ordena por score decrescente pra melhor primeiro
  const order = news.map((_, i) => i).sort((a, b) => scorer(news[b]) - scorer(news[a]));

  for (const i of order) {
    if (used.has(i)) continue;
    used.add(i);
    const primary = news[i];
    const duplicates: MarketNews[] = [];

    for (const j of order) {
      if (i === j || used.has(j)) continue;
      const sim = jaccard(tokens[i], tokens[j]);
      if (sim >= threshold) {
        duplicates.push(news[j]);
        used.add(j);
      }
    }

    const sources = [primary.source, ...duplicates.map((d) => d.source)]
      .filter((s, idx, arr) => arr.indexOf(s) === idx);

    clusters.push({ primary, duplicates, sources });
  }

  return clusters;
}

/** Gera texto otimizado pra TTS lendo em ordem de urgência. */
export function urgentTTSScript(
  events: EconomicEvent[],
  news: MarketNews[],
  nowMins: number,
  watchlist: string[] = []
): string {
  const nowMs = Date.now();
  const topEvents = sortByUrgency(events, (e) => scoreEvent(e, nowMins, watchlist)).slice(0, 2);
  const topNews = sortByUrgency(news, (n) => scoreNews(n, nowMs, watchlist)).slice(0, 1);

  const lines: string[] = ["Briefing por urgência."];

  for (const ev of topEvents) {
    const m = parseMins(ev.time);
    const eta = m !== null ? m - nowMins : null;
    if (ev.actual) {
      lines.push(
        `${ev.event}: real ${ev.actual}, consenso ${ev.forecast ?? "não informado"}.`
      );
    } else if (eta !== null && eta >= 0 && eta < 60) {
      lines.push(
        `Alto impacto em ${eta} minutos: ${ev.event}. Consenso ${ev.forecast ?? "não informado"}.`
      );
    } else {
      lines.push(`Próxima release: ${ev.event} às ${ev.time}.`);
    }
  }

  for (const n of topNews) {
    lines.push(`Manchete ${n.source}: ${n.headline}.`);
  }

  return lines.join(" ");
}
