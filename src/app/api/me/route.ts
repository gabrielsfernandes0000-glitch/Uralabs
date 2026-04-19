import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ tier: null }, { status: 200 });

  return NextResponse.json({
    userId: session.userId,
    tier: session.isElite ? "elite" : session.isVip ? "vip" : null,
    isElite: session.isElite,
    isVip: session.isVip,
    username: session.username,
    globalName: session.globalName,
  });
}
