// DEV ONLY — creates a fake session for local testing
// DELETE this file before deploying to production

import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  // ?role=vip → VIP only · ?role=elite (default) → Elite
  const role = req.nextUrl.searchParams.get("role") === "vip" ? "vip" : "elite";

  await createSession({
    userId: "123456789",
    username: role === "vip" ? "vip.tester" : "uranickk",
    globalName: role === "vip" ? "VIP Tester" : "URA",
    avatar: null,
    roles: [role],
    isElite: role === "elite",
    isVip: true, // Elite users also have VIP access; VIP-only has isElite=false
  });

  return NextResponse.redirect(new URL("/elite", req.url));
}
