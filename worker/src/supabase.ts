import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import { getExchangeChannelName } from "./realtime-channel.js";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { params: { eventsPerSecond: 10 } },
});

export interface ExchangeConnection {
  id: string;
  discord_user_id: string;
  exchange: string;
  api_key_encrypted: string;
  api_secret_encrypted: string;
  iv: string;
  api_secret_iv: string | null;
  label: string | null;
  status: string;
  last_sync_at: string | null;
}

export async function loadActiveConnections(): Promise<ExchangeConnection[]> {
  const { data, error } = await supabase
    .from("exchange_connections")
    .select("id, discord_user_id, exchange, api_key_encrypted, api_secret_encrypted, iv, api_secret_iv, label, status, last_sync_at")
    .eq("status", "active")
    .eq("exchange", "bingx"); // so BingX por enquanto
  if (error) throw error;
  return (data || []) as ExchangeConnection[];
}

/** Push via canal Realtime. Nome é HMAC-SHA256 de (userId:exchange) com
 *  REALTIME_CHANNEL_SECRET — não-previsível sem o secret. Cliente busca
 *  esse nome em /api/exchange/realtime-channel. */
export async function broadcast(userId: string, exchange: string, event: string, payload: unknown) {
  const channel = supabase.channel(getExchangeChannelName(userId, exchange));
  await channel.send({ type: "broadcast", event, payload });
}
