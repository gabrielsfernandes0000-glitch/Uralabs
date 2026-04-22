/**
 * Fear & Greed Index — Alternative.me (crypto) + CNN (equities).
 *
 * Alternative.me é endpoint público, zero auth, zero rate limit documentado.
 * CNN tem API pública em rss-feed.cnn.com/fear-and-greed (JSON interno).
 */

export type FearGreedReading = {
  value: number;           // 0-100
  classification: string;  // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
  timestamp: string;
};

export type FearGreedSnapshot = {
  crypto: FearGreedReading | null;
  equities: FearGreedReading | null;
};

export function classifyFG(value: number): string {
  if (value < 25) return "Medo extremo";
  if (value < 45) return "Medo";
  if (value < 55) return "Neutro";
  if (value < 75) return "Ganância";
  return "Ganância extrema";
}

export function fgAccent(value: number): string {
  // Paleta restrita: só 3 cores funcionais (up/down/neutro).
  // Extremos usam a mesma família — não tem "super extreme fear" vs "extreme fear" em cor diferente.
  if (value < 45) return "#EF4444";   // medo/negativo
  if (value < 55) return "rgba(255,255,255,0.55)"; // neutro = branco muted
  return "#22C55E";                    // ganância/positivo
}

export async function fetchCryptoFG(): Promise<FearGreedReading | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data?.[0];
    if (!d) return null;
    const value = Number(d.value);
    return {
      value,
      classification: classifyFG(value),
      timestamp: new Date(Number(d.timestamp) * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function fetchEquitiesFG(): Promise<FearGreedReading | null> {
  try {
    const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
      headers: { "User-Agent": "Mozilla/5.0 (URA Labs)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const score = Math.round(Number(json?.fear_and_greed?.score));
    if (!Number.isFinite(score)) return null;
    return {
      value: score,
      classification: classifyFG(score),
      timestamp: json?.fear_and_greed?.timestamp ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function fetchFearGreedSnapshot(): Promise<FearGreedSnapshot> {
  const [crypto, equities] = await Promise.all([
    fetchCryptoFG(),
    fetchEquitiesFG(),
  ]);
  return { crypto, equities };
}
