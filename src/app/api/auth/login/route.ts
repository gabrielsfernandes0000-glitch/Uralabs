import { NextResponse } from "next/server";
import { getDiscordAuthUrl } from "@/lib/discord";

export async function GET() {
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
