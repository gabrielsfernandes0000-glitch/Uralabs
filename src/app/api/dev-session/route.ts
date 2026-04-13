// DEV ONLY — creates a fake session for local testing
// DELETE this file before deploying to production

import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  await createSession({
    userId: "123456789",
    username: "uranickk",
    globalName: "URA",
    avatar: null,
    roles: ["elite"],
    isElite: true,
    isVip: true,
  });

  return NextResponse.redirect(new URL("/elite", "http://localhost:3001"));
}
