import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { callEdgeFunction } from "@/lib/ura-coin";

export const runtime = "nodejs";

/**
 * Site API que repassa milestone cumprido pra edge function.
 * user_id vem SEMPRE da session (impossível de spoofar client-side).
 * achievement_id vem do body — mas a RPC rejeita se não for auto_distribute=true,
 * então manual-only (OG, trading) nunca passa.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { achievement_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const achId = body.achievement_id?.trim() ?? "";
  if (!/^[a-z0-9_-]{2,60}$/.test(achId)) {
    return NextResponse.json({ error: "achievement_id inválido" }, { status: 400 });
  }

  const res = await callEdgeFunction("achievement-auto-grant", {
    user_id: session.userId,
    achievement_id: achId,
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json(res.data);
}
