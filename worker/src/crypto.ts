// AES-256-GCM — EXATAMENTE mesmo formato do site (site/src/lib/exchange/crypto.ts).
// IV 16 bytes, authTag separado do encrypted por ".", derivação SHA-256 da env (trimmed).

import { createDecipheriv, createHash } from "crypto";
import { env } from "./env.js";

const ALGORITHM = "aes-256-gcm";
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const raw = env.EXCHANGE_ENCRYPTION_KEY;
  if (!raw || raw.trim().length < 32) {
    throw new Error("EXCHANGE_ENCRYPTION_KEY must be set (min 32 chars)");
  }
  return createHash("sha256").update(raw.trim()).digest();
}

export function decrypt(encryptedData: string, ivBase64: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, "base64");

  const [encrypted, authTagB64] = encryptedData.split(".");
  if (!encrypted || !authTagB64) throw new Error("Invalid encrypted data format (expected encrypted.authTag)");

  const authTag = Buffer.from(authTagB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
