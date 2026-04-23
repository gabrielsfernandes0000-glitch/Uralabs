import { NextResponse } from "next/server";
import { getDiscordAuthUrl } from "@/lib/discord";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  // Rate limit: 30 starts/5min/IP. Anti OAuth bombing + state cookie spam.
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`auth-login:${ip}`, 30, 300);
  if (!allowed) {
    return NextResponse.redirect(new URL("/login?error=rate_limited", req.url));
  }

  // Generate a random state to prevent CSRF
  const state = crypto.randomUUID();

  const url = getDiscordAuthUrl(state);

  const res = NextResponse.redirect(url);
  // Store state in a short-lived cookie to verify on callback
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return res;
}
