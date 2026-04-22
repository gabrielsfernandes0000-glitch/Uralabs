import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAnon } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid-body" }, { status: 400 }); }
  if (!body?.endpoint) return NextResponse.json({ error: "missing-endpoint" }, { status: 400 });

  try {
    const sb = getSupabaseAnon();
    await sb
      .from("push_subscriptions")
      .update({ enabled: false })
      .eq("endpoint", body.endpoint)
      .eq("user_id", session.userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
