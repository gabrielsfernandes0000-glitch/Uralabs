// Mesma logica do site/src/lib/exchange/crypto.ts — AES-256-GCM com iv compartilhado
// entre api_key e api_secret (reuso intencional por row, ver memory feedback_aes_gcm_iv_reuse).

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "./env.js";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  // SHA-256 da env imune a whitespace — mesma derivacao do site
  return createHash("sha256").update(env.EXCHANGE_ENCRYPTION_KEY.trim()).digest();
}

export function decrypt(ciphertextB64: string, ivB64: string): string {
  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const buf = Buffer.from(ciphertextB64, "base64");
  // Últimos 16 bytes = authTag
  const authTag = buf.subarray(buf.length - 16);
  const ct = buf.subarray(0, buf.length - 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf-8");
}

// Export pra testes/futuro; nao usado no worker (worker so decrypta)
export function encrypt(plaintext: string, ivB64?: string): { encrypted: string; iv: string } {
  const key = getKey();
  const iv = ivB64 ? Buffer.from(ivB64, "base64") : randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([ct, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}
