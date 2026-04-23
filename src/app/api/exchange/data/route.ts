import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/exchange/crypto";
import { getBalance, getPositions, getTradeHistory, getIncome, computeMetrics, type ExchangeId } from "@/lib/exchange";

export const dynamic = "force-dynamic";

type IncomeItem = Awaited<ReturnType<typeof getIncome>>[number];

/** Agrega PnL diário a partir de income history.
 *  Income já filtra só realized PnL (ignora fees em alguns endpoints, inclui em outros).
 *  Retornamos array de {date, pnl} ordenado ASC, zerando dias sem trade dentro da janela. */
function aggregateDailyPnL(income: IncomeItem[], days: number): { date: string; pnl: number }[] {
  const byDay = new Map<string, number>();
  for (const i of income) {
    if (!i.time) continue;
    const d = new Date(i.time);
    // BRT (UTC-3) pra alinhar com horário do trader
    d.setHours(d.getHours() - 3);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + i.income);
  }
  const out: { date: string; pnl: number }[] = [];
  const now = new Date();
  now.setHours(now.getHours() - 3);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, pnl: byDay.get(key) || 0 });
  }
  return out;
}

/** Reconstrói equity curve "para trás" a partir do equity atual e do daily PnL.
 *  equity_no_dia = equity_atual - soma(pnl_dos_dias_depois).
 *  Imperfeito (ignora transferências, funding, unrealized swings), mas direcional. */
function reconstructEquityCurve(currentEquity: number, dailyPnL: { date: string; pnl: number }[]): { date: string; equity: number }[] {
  const out: { date: string; equity: number }[] = [];
  let equity = currentEquity;
  // Do mais recente pro mais antigo: equity_hoje está aqui, subtrai pnl_hoje → equity_ontem
  for (let i = dailyPnL.length - 1; i >= 0; i--) {
    out.unshift({ date: dailyPnL[i].date, equity });
    equity -= dailyPnL[i].pnl;
  }
  return out;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exchange = (url.searchParams.get("exchange") || "bingx") as ExchangeId;
  const forceRefresh = url.searchParams.get("refresh") === "1";

  const supabase = getSupabaseAdmin();

  const { data: conn, error: connErr } = await supabase
    .from("exchange_connections")
    .select("*")
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .single();

  if (connErr || !conn) {
    return NextResponse.json({ connected: false, exchange });
  }

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

  let apiKey: string;
  let apiSecret: string;
  let passphrase: string | undefined;

  try {
    apiKey = decrypt(conn.api_key_encrypted, conn.iv);
    const rawSecret = decrypt(conn.api_secret_encrypted, conn.iv);
    if (rawSecret.includes("|||")) {
      const parts = rawSecret.split("|||");
      apiSecret = parts[0];
      passphrase = parts[1];
    } else {
      apiSecret = rawSecret;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[exchange/data] decrypt failed:", msg);
    await supabase
      .from("exchange_connections")
      .update({ status: "error", error_message: `Falha ao descriptografar: ${msg}` })
      .eq("id", conn.id);
    return NextResponse.json({ connected: true, exchange, error: `Erro de criptografia: ${msg}` }, { status: 500 });
  }

  const creds = { apiKey, apiSecret, passphrase };

  try {
    const [balance, positions, trades, income] = await Promise.all([
      getBalance(exchange, creds),
      getPositions(exchange, creds),
      getTradeHistory(exchange, creds, { lastDays: 7, limit: 200 }),
      getIncome(exchange, creds, { lastDays: 30, limit: 200 }),
    ]);

    const metrics = computeMetrics(trades);
    const dailyPnL = aggregateDailyPnL(income, 30);
    const equityCurve = reconstructEquityCurve(balance.totalEquity, dailyPnL);

    // Breakdown por símbolo (top por |PnL|)
    const bySymbol = new Map<string, { symbol: string; pnl: number; trades: number; wins: number }>();
    for (const t of trades) {
      if (t.profit === 0) continue;
      const s = t.symbol.replace(/-?USDT/, "") || t.symbol;
      const cur = bySymbol.get(s) || { symbol: s, pnl: 0, trades: 0, wins: 0 };
      cur.pnl += t.profit;
      cur.trades += 1;
      if (t.profit > 0) cur.wins += 1;
      bySymbol.set(s, cur);
    }
    const symbolBreakdown = [...bySymbol.values()].sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)).slice(0, 8);

    // Breakdown por hora do dia (BRT)
    const hourly = new Array(24).fill(null).map((_, h) => ({ hour: h, pnl: 0, trades: 0 }));
    for (const t of trades) {
      if (t.profit === 0 || !t.time) continue;
      const d = new Date(t.time);
      d.setHours(d.getHours() - 3); // BRT
      const h = d.getHours();
      hourly[h].pnl += t.profit;
      hourly[h].trades += 1;
    }

    // Breakdown por dia da semana
    const dows = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const dowBreakdown = dows.map((name, i) => ({ dow: i, name, pnl: 0, trades: 0 }));
    for (const t of trades) {
      if (t.profit === 0 || !t.time) continue;
      const d = new Date(t.time);
      d.setHours(d.getHours() - 3);
      const dow = d.getDay();
      dowBreakdown[dow].pnl += t.profit;
      dowBreakdown[dow].trades += 1;
    }

    const snapshot = {
      balance,
      positions,
      trades: trades.slice(0, 100),
      income: income.slice(0, 100),
      metrics,
      equityCurve,
      dailyPnL,
      symbolBreakdown,
      hourlyBreakdown: hourly,
      dowBreakdown,
      label: conn.label,
    };

    // Cache snapshot completo (5 min TTL via fetched_at)
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

    // Snapshot diário de equity — 1 row por dia acumulando histórico pra curva real no futuro
    const today = new Date();
    today.setHours(today.getHours() - 3);
    const todayKey = today.toISOString().slice(0, 10);
    await supabase.from("exchange_equity_daily").upsert(
      {
        discord_user_id: session.userId,
        exchange,
        date: todayKey,
        total_equity: balance.totalEquity,
        available_margin: balance.availableMargin,
        unrealized_pnl: balance.unrealizedPnL,
        realized_pnl: balance.realisedPnL,
        recorded_at: new Date().toISOString(),
      },
      { onConflict: "discord_user_id,exchange,date" }
    );

    await supabase
      .from("exchange_connections")
      .update({ last_sync_at: new Date().toISOString(), status: "active", error_message: null })
      .eq("id", conn.id);

    // Tenta enriquecer equity curve com snapshots reais (preferido sobre reconstrução)
    const { data: realEquity } = await supabase
      .from("exchange_equity_daily")
      .select("date, total_equity")
      .eq("discord_user_id", session.userId)
      .eq("exchange", exchange)
      .order("date", { ascending: true })
      .limit(90);

    const enrichedSnapshot = {
      ...snapshot,
      realEquityCurve: (realEquity || []).map((r: { date: string; total_equity: string }) => ({
        date: r.date,
        equity: parseFloat(r.total_equity),
      })),
    };

    return NextResponse.json({ connected: true, exchange, cached: false, ...enrichedSnapshot });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    await supabase
      .from("exchange_connections")
      .update({ status: "error", error_message: msg })
      .eq("id", conn.id);
    return NextResponse.json({ connected: true, exchange, error: msg }, { status: 502 });
  }
}

