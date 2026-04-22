// AES-256-GCM encryption for exchange API keys
// Keys are encrypted server-side before storing in Supabase

import { randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/** Deriva key de 32 bytes via SHA-256 da env var (trimmed).
 *  Vantagens vs. `Buffer.from(env.slice(0,32), "utf-8")`:
 *   - Imune a whitespace/newlines ou encoding surpresa da env no Vercel
 *   - Qualquer mudança sutil na env var muda a key derivada consistentemente
 *     (encrypt e decrypt batem enquanto env permanecer a mesma) */
function getEncryptionKey(): Buffer {
  const raw = process.env.EXCHANGE_ENCRYPTION_KEY;
  if (!raw || raw.trim().length < 32) {
    throw new Error("EXCHANGE_ENCRYPTION_KEY must be set (min 32 chars)");
  }
  return createHash("sha256").update(raw.trim()).digest();
}

export function encrypt(plaintext: string): { encrypted: string; iv: string } {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  // Append auth tag to encrypted data
  return {
    encrypted: encrypted + "." + authTag.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decrypt(encryptedData: string, ivBase64: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, "base64");

  const [encrypted, authTagB64] = encryptedData.split(".");
  if (!encrypted || !authTagB64) throw new Error("Invalid encrypted data format");

  const authTag = Buffer.from(authTagB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
