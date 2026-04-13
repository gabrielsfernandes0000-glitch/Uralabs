import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/exchange/crypto";
import { getBalance, getPositions, getTradeHistory, getIncome, computeMetrics, EXCHANGES, type ExchangeId } from "@/lib/exchange";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exchange = (url.searchParams.get("exchange") || "bingx") as ExchangeId;
  const forceRefresh = url.searchParams.get("refresh") === "1";

  const supabase = getSupabaseAdmin();

  // 1. Get connection
  const { data: conn, error: connErr } = await supabase
    .from("exchange_connections")
    .select("*")
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .single();

  if (connErr || !conn) {
    return NextResponse.json({ connected: false, exchange });
  }

  // 2. Check cache (5 min TTL)
  const CACHE_TTL = 5 * 60 * 1000;

  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from("exchange_snapshots")
      .select("data, fetched_at")
      .eq("discord_user_id", session.userId)
      .eq("exchange", exchange)
      .eq("snapshot_type", "full")
      .single();

    if (cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL) {
      return NextResponse.json({ connected: true, exchange, cached: true, ...cached.data });
    }
  }

  // 3. Decrypt keys
  let apiKey: string;
  let apiSecret: string;
  let passphrase: string | undefined;

  try {
    apiKey = decrypt(conn.api_key_encrypted, conn.iv);
    const rawSecret = decrypt(conn.api_secret_encrypted, conn.iv);

    // Passphrase stored as "secret|||passphrase"
    if (rawSecret.includes("|||")) {
      const parts = rawSecret.split("|||");
      apiSecret = parts[0];
      passphrase = parts[1];
    } else {
      apiSecret = rawSecret;
    }
  } catch {
    await supabase
      .from("exchange_connections")
      .update({ status: "error", error_message: "Falha ao descriptografar keys" })
      .eq("id", conn.id);
    return NextResponse.json({ connected: true, exchange, error: "Erro de criptografia — reconecte sua conta" }, { status: 500 });
  }

  // 4. Fetch all data
  const creds = { apiKey, apiSecret, passphrase };

  try {
    const [balance, positions, trades, income] = await Promise.all([
      getBalance(exchange, creds),
      getPositions(exchange, creds),
      getTradeHistory(exchange, creds, { lastDays: 30, limit: 100 }),
      getIncome(exchange, creds, { lastDays: 30, limit: 100 }),
    ]);

    const metrics = computeMetrics(trades);

    const snapshot = {
      balance,
      positions,
      trades: trades.slice(0, 50),
      income: income.slice(0, 50),
      metrics,
      label: conn.label,
    };

    // 5. Cache snapshot
    await supabase.from("exchange_snapshots").upsert(
      {
        discord_user_id: session.userId,
        exchange,
        snapshot_type: "full",
        data: snapshot,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "discord_user_id,exchange,snapshot_type" }
    );

    await supabase
      .from("exchange_connections")
      .update({ last_sync_at: new Date().toISOString(), status: "active", error_message: null })
      .eq("id", conn.id);

    return NextResponse.json({ connected: true, exchange, cached: false, ...snapshot });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";

    await supabase
      .from("exchange_connections")
      .update({ status: "error", error_message: msg })
      .eq("id", conn.id);

    return NextResponse.json({ connected: true, exchange, error: msg }, { status: 502 });
  }
}
