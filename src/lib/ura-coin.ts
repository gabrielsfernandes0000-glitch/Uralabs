import { getSupabaseAnon } from "@/lib/supabase";

/**
 * URA Coin queries para a plataforma Elite.
 *
 * Arquitetura:
 *   - Leituras de catálogo (caixas, prêmios, budget) via getSupabaseAnon() com
 *     RLS `anon_read_*` (catálogo é público, sem PII)
 *   - Leituras user-specific (balance, openings, achievements) via edge function
 *     `ura-coin-user-state` autenticada por CRON_SECRET
 *   - Mutações (open/claim) via edge functions `loot-box-open`/`prize-claim-pix`
 *
 * Isso evita a necessidade de SUPABASE_SERVICE_ROLE_KEY no site e centraliza
 * tudo via CRON_SECRET (mesmo secret compartilhado com bot e outras integrações).
 */

export type LootBox = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cost_coins: number;
  tier: "basic" | "premium" | "legendary";
  image_url: string | null;
  color_hex: string | null;
  active: boolean;
  sort_order: number;
};

export type PrizeType =
  | "nitro_basic" | "nitro_boost" | "cash_brl" | "sub_vip" | "sub_elite"
  | "elite_discount" | "banner" | "profile_design" | "cupom_custom" | "ura_coin_bonus";

export type PrizeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type Prize = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: PrizeType;
  value_brl: number | null;
  rarity: PrizeRarity;
  budget_category: string;
  metadata: Record<string, unknown>;
  image_url: string | null;
};

export type BoxWithPrizes = LootBox & {
  prizes: Array<Prize & { weight: number; chance: number; exhausted_today: boolean }>;
  total_weight: number;
  any_available: boolean;
};

export type UserCoinBalance = {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
};

export type RecentOpening = {
  id: string;
  opened_at: string;
  coins_spent: number;
  prize: {
    name: string;
    type: PrizeType;
    rarity: PrizeRarity;
    value_brl: number | null;
  };
  redemption: {
    id: string;
    status: "pending_claim" | "pending_fulfillment" | "fulfilled" | "cancelled";
    has_pix: boolean;
  } | null;
};

export type UserAchievementUnlock = {
  achievement_id: string;
  unlocked_at: string;
  coins_granted: number;
  source: "admin" | "system" | "self";
};

/** Estado completo do user — 1 chamada pra edge function retorna tudo. */
export type UserState = {
  balance: UserCoinBalance;
  recent_openings: RecentOpening[];
  achievements: UserAchievementUnlock[];
  discord_activity: {
    posts_count: number;
    first_message_at: string | null;
    last_message_at: string | null;
    global_name: string | null;
    username: string | null;
  } | null;
  streak: {
    days: number;
    claims_today: number;
  };
};

// ─── Helpers de edge function ────────────────────────────────────────────

const EDGE_BASE_URL = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nqozuxvhdzyawwdkwgvb.supabase.co";
  return url.replace(/\/$/, "") + "/functions/v1";
};

function getCronSecret(): string | null {
  const s = process.env.CRON_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

export async function callEdgeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const secret = getCronSecret();
  if (!secret) {
    return { ok: false, status: 503, error: "CRON_SECRET não configurado" };
  }

  try {
    const res = await fetch(`${EDGE_BASE_URL()}/${name}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errMsg =
        (data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : null) ?? `Edge function ${name} falhou (${res.status})`;
      return { ok: false, status: res.status, error: errMsg };
    }

    return { ok: true, data: data as T };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? err.message : "network_error",
    };
  }
}

// ─── User state (edge function) ──────────────────────────────────────────

/** Puxa balance, recent openings e achievements numa chamada só. */
export async function getUserState(userId: string, recentLimit = 10): Promise<UserState> {
  const empty: UserState = {
    balance: { balance: 0, lifetime_earned: 0, lifetime_spent: 0 },
    recent_openings: [],
    achievements: [],
    discord_activity: null,
    streak: { days: 0, claims_today: 0 },
  };
  const res = await callEdgeFunction<UserState>("ura-coin-user-state", {
    user_id: userId,
    recent_limit: recentLimit,
  });
  if (!res.ok) {
    console.warn("[ura-coin] getUserState:", res.error);
    return empty;
  }
  return res.data;
}

/** Só o saldo — usado no sidebar. Compat mantido; internamente chama getUserState. */
export async function getUserBalance(userId: string): Promise<UserCoinBalance> {
  const state = await getUserState(userId, 1);
  return state.balance;
}

export async function getRecentOpenings(userId: string, limit = 10): Promise<RecentOpening[]> {
  const state = await getUserState(userId, limit);
  return state.recent_openings;
}

export async function getUserAchievementUnlocks(userId: string): Promise<UserAchievementUnlock[]> {
  const state = await getUserState(userId, 1);
  return state.achievements;
}

// ─── Catalog (anon client + RLS anon_read) ───────────────────────────────

/** Caixas ativas + seus prêmios com chances calculadas. Marca exhausted hoje. */
export async function getActiveBoxesWithPrizes(): Promise<BoxWithPrizes[]> {
  const sb = getSupabaseAnon();
  const today = todayInSaoPaulo();

  const [boxesRes, prizesRes, weightsRes, budgetRes] = await Promise.all([
    sb.from("loot_boxes").select("*").eq("active", true).order("sort_order").order("cost_coins"),
    sb.from("prizes").select("*").eq("active", true),
    sb.from("loot_box_prizes").select("*"),
    sb.from("daily_budget").select("category, exhausted").eq("date", today),
  ]);

  const exhaustedCats = new Set(
    (budgetRes.data ?? []).filter((b: { exhausted: boolean }) => b.exhausted).map((b: { category: string }) => b.category),
  );

  const prizesById = new Map(
    (prizesRes.data ?? []).map((p) => [
      p.id,
      {
        ...p,
        value_brl: p.value_brl !== null ? Number(p.value_brl) : null,
        metadata: (p.metadata ?? {}) as Record<string, unknown>,
      } as Prize,
    ]),
  );

  type WeightRow = { box_id: string; prize_id: string; weight: number };
  const weightsByBox = new Map<string, WeightRow[]>();
  for (const w of (weightsRes.data ?? []) as WeightRow[]) {
    const arr = weightsByBox.get(w.box_id) ?? [];
    arr.push(w);
    weightsByBox.set(w.box_id, arr);
  }

  return ((boxesRes.data ?? []) as LootBox[]).map((b) => {
    const ws = weightsByBox.get(b.id) ?? [];
    const enriched = ws
      .map((w) => {
        const prize = prizesById.get(w.prize_id);
        if (!prize) return null;
        return {
          ...prize,
          weight: w.weight,
          chance: 0,
          exhausted_today: exhaustedCats.has(prize.budget_category),
        };
      })
      .filter(Boolean) as BoxWithPrizes["prizes"];

    const availableWeight = enriched
      .filter((p) => !p.exhausted_today)
      .reduce((s, p) => s + p.weight, 0);
    const totalWeight = enriched.reduce((s, p) => s + p.weight, 0);

    for (const p of enriched) {
      p.chance = totalWeight > 0 ? (p.weight / totalWeight) * 100 : 0;
    }

    return {
      ...b,
      prizes: enriched.sort((a, z) => z.weight - a.weight),
      total_weight: totalWeight,
      any_available: availableWeight > 0,
    };
  });
}

function todayInSaoPaulo(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
