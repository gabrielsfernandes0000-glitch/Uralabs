import { createHmac } from "crypto";
import { env } from "./env.js";

/**
 * MESMO algoritmo de site/src/lib/exchange/realtime-channel.ts — lock-step.
 * Mudanças lá precisam ser replicadas aqui na mesma pass.
 */
export function getExchangeChannelName(userId: string, exchange: string): string {
  const secret = env.REALTIME_CHANNEL_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("REALTIME_CHANNEL_SECRET must be set (min 32 chars)");
  }
  const hmac = createHmac("sha256", secret).update(`${userId}:${exchange}`).digest("hex").slice(0, 32);
  return `exchange:${hmac}`;
}
