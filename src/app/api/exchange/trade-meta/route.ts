import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ALLOWED_TAGS = [
  "FVG", "BOS", "CHoCH", "OTE", "Liquidity Grab", "Breakout",
  "Range", "Pullback", "News Play", "Breakeven", "Partial", "Full TP",
  "Stop Hit", "Early Exit", "Reentry", "Scalp", "Swing",
  "Revenge Trade", "FOMO", "Tilt", "Rule Break", "Overleverage",
];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exchange = url.searchParams.get("exchange") || "bingx";
  const orderId = url.searchParams.get("orderId");

  const supabase = getSupabaseAdmin();
  const query = supabase
    .from("exchange_trade_metadata")
    .select("*")
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange);

  if (orderId) {
    const { data, error } = await query.eq("order_id", orderId).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ meta: data, allowedTags: ALLOWED_TAGS });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meta: data || [], allowedTags: ALLOWED_TAGS });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const { exchange, orderId, tags, notes, stopLoss, markedAsUraCall } = body;
  if (!exchange || !orderId) {
    return NextResponse.json({ error: "exchange e orderId são obrigatórios" }, { status: 400 });
  }

  const cleanedTags = Array.isArray(tags)
    ? tags.filter((t) => typeof t === "string" && ALLOWED_TAGS.includes(t)).slice(0, 8)
    : undefined;

  const row: Record<string, unknown> = {
    discord_user_id: session.userId,
    exchange,
    order_id: orderId,
    updated_at: new Date().toISOString(),
  };
  if (cleanedTags !== undefined) row.tags = cleanedTags;
  if (notes !== undefined) row.notes = typeof notes === "string" ? notes.slice(0, 2000) : null;
  if (stopLoss !== undefined) row.stop_loss = typeof stopLoss === "number" && isFinite(stopLoss) ? stopLoss : null;
  if (markedAsUraCall !== undefined) row.marked_as_ura_call = !!markedAsUraCall;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("exchange_trade_metadata")
    .upsert(row, { onConflict: "discord_user_id,exchange,order_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalida cache do snapshot pra refletir imediatamente
  await supabase
    .from("exchange_snapshots")
    .delete()
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .eq("snapshot_type", "full");

  return NextResponse.json({ meta: data });
}
