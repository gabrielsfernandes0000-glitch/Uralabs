import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserState } from "@/lib/ura-coin";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const state = await getUserState(session.userId, 0);

  // Retorna unlocks com metadata completa (unlocked_at, coins_granted, source).
  // Usado em 2 views na página de conquistas: Badges (Set de ids) + Timeline (ordenado).
  return NextResponse.json({
    unlocks: state.achievements,
    streak_days: state.streak.days,
  });
}
