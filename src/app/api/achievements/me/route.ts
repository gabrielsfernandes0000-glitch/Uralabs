import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserState } from "@/lib/ura-coin";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const state = await getUserState(session.userId, 0);

  return NextResponse.json({
    unlocks: state.achievements,
    voice_streak: state.voice.streak_days,
  });
}
