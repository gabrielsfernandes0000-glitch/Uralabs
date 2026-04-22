/**
 * Crypto Pulse — market stats agregados estilo CoinMarketCap.
 * Tudo via CoinGecko free tier (sem key, 10-30 req/min).
 *
 * Endpoints:
 *   - /global           → market cap, volume, BTC dominance
 *   - /search/trending  → top 7 trending
 *   - /coins/markets    → pra calcular Altcoin Season Index
 */

const CG = "https://api.coingecko.com/api/v3";
const UA = { "User-Agent": "URA-Labs-Elite/1.0" };

export type GlobalStats = {
  totalMarketCapUsd: number;
  totalVolume24hUsd: number;
  marketCapChangePct24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
};

export type TrendingCoin = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  marketCapRank: number | null;
  score: number;
};

export type AltSeasonIndex = {
  score: number;       // 0-100 — % dos top-50 alts que bateram BTC em 90d
  regime: "bitcoin" | "neutral" | "altcoin";
  label: string;
};

export async function fetchGlobalStats(): Promise<GlobalStats | null> {
  try {
    const res = await fetch(`${CG}/global`, {
      headers: UA,
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;
    return {
      totalMarketCapUsd: Number(d.total_market_cap?.usd ?? 0),
      totalVolume24hUsd: Number(d.total_volume?.usd ?? 0),
      marketCapChangePct24h: Number(d.market_cap_change_percentage_24h_usd ?? 0),
      btcDominance: Number(d.market_cap_percentage?.btc ?? 0),
      ethDominance: Number(d.market_cap_percentage?.eth ?? 0),
      activeCryptocurrencies: Number(d.active_cryptocurrencies ?? 0),
    };
  } catch {
    return null;
  }
}

export async function fetchTrending(): Promise<TrendingCoin[]> {
  try {
    const res = await fetch(`${CG}/search/trending`, {
      headers: UA,
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: unknown[] = json?.coins ?? [];
    return list.slice(0, 5).map((c: any) => ({
      id: String(c.item?.id),
      name: String(c.item?.name),
      symbol: String(c.item?.symbol).toUpperCase(),
      thumb: String(c.item?.thumb ?? ""),
      marketCapRank: c.item?.market_cap_rank ?? null,
      score: Number(c.item?.score ?? 0),
    }));
  } catch {
    return [];
  }
}

/**
 * Altcoin Season Index (nossa versão do blockchaincenter.net).
 *
 * Metodologia:
 *   1. Pega top 50 moedas por market cap (exceto stablecoins)
 *   2. Compara performance 90d vs. BTC
 *   3. Score = % que superou BTC
 *
 * Regime: <25 Bitcoin season, 25-75 Neutro, >75 Altcoin season.
 */
const STABLE_SYMBOLS = new Set(["USDT", "USDC", "DAI", "TUSD", "USDE", "FDUSD", "USDS", "PYUSD", "BUSD"]);

export async function fetchAltSeasonIndex(): Promise<AltSeasonIndex | null> {
  try {
    const res = await fetch(
      `${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=60&page=1&price_change_percentage=90d`,
      { headers: UA, next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const coins: any[] = await res.json();
    const btc = coins.find((c) => c.symbol?.toUpperCase() === "BTC");
    if (!btc) return null;
    const btc90d = Number(btc.price_change_percentage_90d_in_currency ?? 0);

    const alts = coins
      .filter((c) => {
        const sym = String(c.symbol).toUpperCase();
        if (sym === "BTC") return false;
        if (STABLE_SYMBOLS.has(sym)) return false;
        if (typeof c.price_change_percentage_90d_in_currency !== "number") return false;
        return true;
      })
      .slice(0, 50);

    if (alts.length === 0) return null;
    const beat = alts.filter((c) => Number(c.price_change_percentage_90d_in_currency) > btc90d).length;
    const score = Math.round((beat / alts.length) * 100);

    const regime: AltSeasonIndex["regime"] = score < 25 ? "bitcoin" : score > 75 ? "altcoin" : "neutral";
    const label =
      regime === "bitcoin" ? "Bitcoin Season" :
      regime === "altcoin" ? "Altcoin Season" :
      "Neutro";

    return { score, regime, label };
  } catch {
    return null;
  }
}

export function formatCompactUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export type CryptoPulse = {
  stats: GlobalStats | null;
  trending: TrendingCoin[];
  altSeason: AltSeasonIndex | null;
};

export async function fetchCryptoPulse(): Promise<CryptoPulse> {
  const [stats, trending, altSeason] = await Promise.all([
    fetchGlobalStats(),
    fetchTrending(),
    fetchAltSeasonIndex(),
  ]);
  return { stats, trending, altSeason };
}
