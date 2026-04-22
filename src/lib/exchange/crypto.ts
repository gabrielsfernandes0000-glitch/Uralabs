// AES-256-GCM encryption for exchange API keys
// Keys are encrypted server-side before storing in Supabase

import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.EXCHANGE_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error("EXCHANGE_ENCRYPTION_KEY must be set (min 32 chars)");
  }
  // Temp debug — loga fingerprint da key pra validar que encrypt e decrypt
  // estão usando o mesmo valor em runtime. Remove depois de diagnosticar.
  if (typeof console !== "undefined") {
    const fp = key.slice(0, 6) + "…" + key.slice(-6) + ` (len=${key.length})`;
    console.log("[exchange/crypto] key fingerprint:", fp);
  }
  // Use first 32 bytes as key
  return Buffer.from(key.slice(0, KEY_LENGTH), "utf-8");
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
