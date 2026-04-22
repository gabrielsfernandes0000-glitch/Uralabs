import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAnon } from "@/lib/supabase";

/**
 * Salva push subscription do usuário.
 *
 * Schema esperado (migration a aplicar quando VAPID for gerado):
 *   create table push_subscriptions (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id text not null,
 *     endpoint text not null unique,
 *     keys jsonb not null,       -- { p256dh, auth }
 *     created_at timestamptz default now(),
 *     last_used_at timestamptz,
 *     enabled boolean default true
 *   );
 *   create index push_subscriptions_user on push_subscriptions(user_id);
 */

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid-body" }, { status: 400 }); }
  if (!body?.endpoint || !body?.keys) {
    return NextResponse.json({ error: "missing-fields" }, { status: 400 });
  }

  try {
    const sb = getSupabaseAnon();
    const { error } = await sb
      .from("push_subscriptions")
      .upsert({
        user_id: session.userId,
        endpoint: body.endpoint,
        keys: body.keys,
        enabled: true,
      }, { onConflict: "endpoint" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
