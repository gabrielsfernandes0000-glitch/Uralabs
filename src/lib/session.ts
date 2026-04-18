// Lightweight cookie-based session using signed JWT
// No external auth libraries — keeps it simple and fast

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "ura-labs-elite-session-secret-change-me");
const COOKIE_NAME = "ura_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  roles: string[];
  isElite: boolean;
  isVip: boolean;
}

/** Create a signed session token and set it as a cookie */
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

/** Read and verify the session from cookies. Returns null if invalid/expired. */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Destroy the session cookie */
export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** Access tier helpers — VIP unlocks aulas, Elite unlocks everything. */
export function canAccessPlatform(session: SessionPayload | null): boolean {
  if (!session) return false;
  return session.isElite || session.isVip;
}

export function canAccessEliteOnly(session: SessionPayload | null): boolean {
  return !!session?.isElite;
}

/** Tier label ("Elite 4.0" / "VIP") for UI chips. */
export function tierLabel(session: SessionPayload): string {
  if (session.isElite) return "Elite 4.0";
  if (session.isVip) return "VIP";
  return "";
}
