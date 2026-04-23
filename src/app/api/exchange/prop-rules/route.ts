import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exchange = url.searchParams.get("exchange") || "bingx";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("exchange_prop_rules")
    .select("*")
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .eq("active", true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rules: data });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const { exchange, firmName, accountSize, dailyLossLimit, maxLossLimit, profitTarget, trailingDd } = body;
  if (!exchange) return NextResponse.json({ error: "exchange obrigatório" }, { status: 400 });

  const num = (v: unknown) => (typeof v === "number" && isFinite(v) && v >= 0 ? v : null);

  const row = {
    discord_user_id: session.userId,
    exchange,
    firm_name: typeof firmName === "string" ? firmName.slice(0, 100) : null,
    account_size_usd: num(accountSize),
    daily_loss_limit_usd: num(dailyLossLimit),
    max_loss_limit_usd: num(maxLossLimit),
    profit_target_usd: num(profitTarget),
    trailing_dd: !!trailingDd,
    active: true,
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("exchange_prop_rules")
    .upsert(row, { onConflict: "discord_user_id,exchange" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("exchange_snapshots")
    .delete()
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .eq("snapshot_type", "full");

  return NextResponse.json({ rules: data });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exchange = url.searchParams.get("exchange") || "bingx";

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("exchange_prop_rules")
    .update({ active: false })
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("exchange_snapshots")
    .delete()
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .eq("snapshot_type", "full");

  return NextResponse.json({ ok: true });
}
