import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("exchange_connections")
    .select("exchange, label, status, error_message, connected_at, last_sync_at")
    .eq("discord_user_id", session.userId);

  if (error) {
    return NextResponse.json({ connections: [] });
  }

  return NextResponse.json({ connections: data || [] });
}
