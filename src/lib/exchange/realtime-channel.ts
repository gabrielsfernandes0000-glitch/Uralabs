import { createHmac } from "crypto";

/**
 * Computa o nome do canal Supabase Realtime pra broadcasts de corretora.
 *
 * Em vez de `exchange:<discordUserId>:<exchange>` (previsível), usamos
 * `exchange:<HMAC_SHA256(userId+exchange, SECRET).slice(0,32)>` — 128 bits
 * de entropia que só quem tem `REALTIME_CHANNEL_SECRET` consegue computar.
 *
 * Why: canais Supabase broadcast são efetivamente públicos (anon key
 * pública + sem RLS policies em `realtime.messages`). Um atacante que
 * conhece o Discord ID de outro user (Discord IDs são visíveis em
 * servidores públicos) poderia subscrever no canal dele e receber
 * eventos de conta/trade em tempo real. HMAC com secret server-side
 * impede enumeração — o atacante precisaria brute-force 128 bits.
 *
 * Shared state: o mesmo SECRET precisa estar no Railway worker pra
 * que o server que publica e o server que entrega o nome pro cliente
 * computem o mesmo canal. Ver `worker/src/realtime-channel.ts`.
 */
export function getExchangeChannelName(userId: string, exchange: string): string {
  const secret = process.env.REALTIME_CHANNEL_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("REALTIME_CHANNEL_SECRET must be set (min 32 chars)");
  }
  const hmac = createHmac("sha256", secret).update(`${userId}:${exchange}`).digest("hex").slice(0, 32);
  return `exchange:${hmac}`;
}
