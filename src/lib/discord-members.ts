/* ────────────────────────────────────────────
   Discord Members — fetches live Elite + VIP roster
   from Supabase edge function list-discord-members.
   Cached in memory per session. Fallback returns empty list.
   ──────────────────────────────────────────── */

const FN_URL = "https://nqozuxvhdzyawwdkwgvb.supabase.co/functions/v1/list-discord-members";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

export interface DiscordMember {
  id: string;
  username: string;
  globalName: string;
  nick: string | null;
  avatar: string | null;
  guildAvatar: string | null;
  tier: "elite" | "vip";
  joinedAt: string;
  avatarUrl: string;
}

export interface MembersResponse {
  total: number;
  elite: number;
  vip: number;
  members: DiscordMember[];
}

let cache: { data: MembersResponse; at: number } | null = null;

export async function fetchDiscordMembers(): Promise<MembersResponse> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  const res = await fetch(FN_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`list-discord-members ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "unknown error");
  const data: MembersResponse = {
    total: json.total,
    elite: json.elite,
    vip: json.vip,
    members: json.members,
  };
  cache = { data, at: Date.now() };
  return data;
}

/** Deterministic color from Discord user id (for fallback styling). */
export function memberColor(id: string): string {
  const palette = ["#3B82F6", "#10B981", "#A855F7", "#EC4899", "#F59E0B", "#06B6D4", "#EF4444", "#FF5500"];
  const n = Number(BigInt(id) % BigInt(palette.length));
  return palette[n];
}

/** Two-letter initials from a Discord name. */
export function memberInitials(name: string): string {
  return name
    .split(/\s|[_.]/g)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || name.slice(0, 2).toUpperCase();
}
