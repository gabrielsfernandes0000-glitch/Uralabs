import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserAchievementUnlocks } from "@/lib/ura-coin";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const unlocks = await getUserAchievementUnlocks(session.userId);
  return NextResponse.json({ unlocks });
}
