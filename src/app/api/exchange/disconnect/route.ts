import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EXCHANGES, type ExchangeId } from "@/lib/exchange";

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exchange = (url.searchParams.get("exchange") || "bingx") as ExchangeId;

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("exchange_connections")
    .delete()
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange);

  if (error) {
    console.error("Supabase delete error:", error);
    return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 });
  }

  await supabase
    .from("exchange_snapshots")
    .delete()
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange);

  const meta = EXCHANGES.find((e) => e.id === exchange);
  return NextResponse.json({ ok: true, message: `${meta?.name || exchange} desconectada` });
}
