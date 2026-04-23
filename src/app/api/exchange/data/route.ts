import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/exchange/crypto";
import { getBalance, getPositions, getTradeHistory, getIncome, computeMetrics, getForceOrders, getOpenOrders, getKlines, type ExchangeId } from "@/lib/exchange";

export const dynamic = "force-dynamic";

type IncomeItem = Awaited<ReturnType<typeof getIncome>>[number];
type TradeItem = Awaited<ReturnType<typeof getTradeHistory>>[number];

interface CallRow {
  id: number;
  data: string;
  side: string | null;
  asset: string | null;
  target: string | null;
  return_pct: string | null;
}

interface TradeMetaRow {
  order_id: string;
  tags: string[] | null;
  notes: string | null;
  stop_loss: string | null;
  marked_as_ura_call: boolean | null;
}

interface EventRow {
  event_time: string;
  title: string;
  impact: string;
  currency: string | null;
}

function aggregateDailyPnL(income: IncomeItem[], days: number): { date: string; pnl: number }[] {
  const REALIZED_TYPES = new Set(["REALIZED_PNL", "REALIZEDPNL", "REALIZED"]);
  const byDay = new Map<string, number>();
  for (const i of income) {
    if (!i.time) continue;
    if (i.incomeType && !REALIZED_TYPES.has(i.incomeType.toUpperCase())) continue;
    const d = new Date(i.time);
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

function reconstructEquityCurve(currentEquity: number, dailyPnL: { date: string; pnl: number }[]): { date: string; equity: number }[] {
  const out: { date: string; equity: number }[] = [];
  let equity = currentEquity;
  for (let i = dailyPnL.length - 1; i >= 0; i--) {
    out.unshift({ date: dailyPnL[i].date, equity });
    equity -= dailyPnL[i].pnl;
  }
  return out;
}

/** Drawdown curve: para cada ponto, quanto abaixo do pico o equity está. */
function computeDrawdown(curve: { date: string; equity: number }[]): { date: string; dd: number; ddPct: number }[] {
  let peak = curve.length ? curve[0].equity : 0;
  return curve.map((p) => {
    if (p.equity > peak) peak = p.equity;
    const dd = p.equity - peak; // <= 0
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    return { date: p.date, dd, ddPct };
  });
}

/** Cruza calls_history com trades: match por data (dia) + asset (normalizado) + side opcional.
 *  Para cada trade, retorna se estava "seguindo URA" (dia da call + asset bate).
 *  Janela é dia inteiro porque calls_history só tem date, não timestamp exato. */
function matchUraCalls(trades: TradeItem[], calls: CallRow[], manualOverrides: Map<string, boolean>) {
  // Index calls por dia+asset
  const callsByKey = new Map<string, CallRow[]>();
  for (const c of calls) {
    if (!c.asset) continue;
    const assetNorm = c.asset.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const key = `${c.data}_${assetNorm}`;
    const arr = callsByKey.get(key) || [];
    arr.push(c);
    callsByKey.set(key, arr);
  }

  const enriched = trades.map((t) => {
    const override = manualOverrides.get(t.orderId);
    if (override !== undefined) return { ...t, uraCall: override, uraCallData: null as CallRow | null };
    if (!t.time) return { ...t, uraCall: false, uraCallData: null as CallRow | null };
    const d = new Date(t.time);
    d.setHours(d.getHours() - 3);
    const day = d.toISOString().slice(0, 10);
    const symbolNorm = t.symbol.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/USDT$/, "");
    // Tenta com e sem USDT
    const candidates = [
      callsByKey.get(`${day}_${symbolNorm}`),
      callsByKey.get(`${day}_${symbolNorm}USDT`),
    ].flat().filter(Boolean) as CallRow[];
    // Tb aceita call do dia anterior (trader pode entrar no dia seguinte)
    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const candY = callsByKey.get(`${yKey}_${symbolNorm}`) || [];
    const all = [...candidates, ...candY];
    // Opcional: filtrar por side se ambos tiverem
    const matched = all.find((c) => {
      if (!c.side || !t.side) return true;
      const cSide = c.side.toUpperCase();
      const tSide = t.side.toUpperCase();
      // LONG/BUY ↔ SHORT/SELL
      if (cSide.includes("LONG") || cSide.includes("COMPRA")) return tSide === "BUY";
      if (cSide.includes("SHORT") || cSide.includes("VENDA")) return tSide === "SELL";
      return true;
    });
    return { ...t, uraCall: !!matched, uraCallData: matched || null };
  });

  return enriched;
}

/** Compute metrics split: geral vs seguindo URA. */
function splitMetrics(trades: (TradeItem & { uraCall: boolean })[]) {
  const all = computeMetrics(trades);
  const following = computeMetrics(trades.filter((t) => t.uraCall));
  const solo = computeMetrics(trades.filter((t) => !t.uraCall));
  return { all, followingUra: following, solo };
}

/** Trade × evento econômico: trade dentro de janela ±30min de evento high-impact */
function crossEventExposure(trades: TradeItem[], events: EventRow[]) {
  const highImpact = events.filter((e) => e.impact?.toLowerCase() === "high");
  const windowMs = 30 * 60 * 1000;
  const exposed = trades.filter((t) => {
    if (!t.time) return false;
    return highImpact.some((e) => {
      const evtTime = new Date(e.event_time).getTime();
      return Math.abs(t.time - evtTime) <= windowMs;
    });
  });
  const exposedClosed = exposed.filter((t) => t.profit !== 0);
  const exposedWins = exposedClosed.filter((t) => t.profit > 0);
  const exposedPnL = exposedClosed.reduce((s, t) => s + t.profit, 0);
  const totalClosed = trades.filter((t) => t.profit !== 0);
  return {
    totalTrades: trades.length,
    exposedTrades: exposed.length,
    exposedClosed: exposedClosed.length,
    exposedWinRate: exposedClosed.length ? (exposedWins.length / exposedClosed.length) * 100 : 0,
    exposedPnL,
    exposedPctOfAll: totalClosed.length ? (exposedClosed.length / totalClosed.length) * 100 : 0,
  };
}

/** Breakdown por tag: agrupa trades com metadata.tags preenchidos */
function tagBreakdown(trades: (TradeItem & { meta?: TradeMetaRow })[]) {
  const byTag = new Map<string, { tag: string; count: number; wins: number; pnl: number }>();
  for (const t of trades) {
    if (t.profit === 0) continue;
    const tags = t.meta?.tags || [];
    for (const tag of tags) {
      const cur = byTag.get(tag) || { tag, count: 0, wins: 0, pnl: 0 };
      cur.count += 1;
      cur.pnl += t.profit;
      if (t.profit > 0) cur.wins += 1;
      byTag.set(tag, cur);
    }
  }
  return [...byTag.values()]
    .map((t) => ({ ...t, winRate: t.count ? (t.wins / t.count) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

/** R-multiples: quando user informou stop, cada trade vira R = profit / risk */
function computeRMultiples(trades: (TradeItem & { meta?: TradeMetaRow })[]) {
  const withR = trades.filter((t) => t.meta?.stop_loss && t.price > 0 && t.profit !== 0);
  if (!withR.length) return { count: 0, totalR: 0, avgR: 0, bestR: 0, worstR: 0 };
  const rs: number[] = [];
  for (const t of withR) {
    const stop = parseFloat(t.meta!.stop_loss!);
    const riskPerUnit = Math.abs(t.price - stop);
    if (riskPerUnit === 0) continue;
    const risk$ = riskPerUnit * Math.abs(t.quantity);
    if (risk$ === 0) continue;
    rs.push(t.profit / risk$);
  }
  if (!rs.length) return { count: 0, totalR: 0, avgR: 0, bestR: 0, worstR: 0 };
  return {
    count: rs.length,
    totalR: rs.reduce((s, r) => s + r, 0),
    avgR: rs.reduce((s, r) => s + r, 0) / rs.length,
    bestR: Math.max(...rs),
    worstR: Math.min(...rs),
  };
}

/** Prop rules enforcement status */
function computePropStatus(
  rules: { firm_name: string | null; daily_loss_limit_usd: number | null; max_loss_limit_usd: number | null; profit_target_usd: number | null; account_size_usd: number | null } | null,
  todayPnL: number,
  currentEquity: number,
  equityCurve: { date: string; equity: number }[]
) {
  if (!rules) return null;
  const startEquity = rules.account_size_usd || equityCurve[0]?.equity || currentEquity;
  const totalPnLSinceStart = currentEquity - startEquity;
  const dailyUsed = todayPnL < 0 ? Math.abs(todayPnL) : 0;
  const totalLossUsed = totalPnLSinceStart < 0 ? Math.abs(totalPnLSinceStart) : 0;
  const profitProgress = totalPnLSinceStart > 0 ? totalPnLSinceStart : 0;

  return {
    firmName: rules.firm_name,
    accountSize: startEquity,
    dailyLoss: {
      used: dailyUsed,
      limit: rules.daily_loss_limit_usd,
      pct: rules.daily_loss_limit_usd ? (dailyUsed / rules.daily_loss_limit_usd) * 100 : 0,
      remaining: rules.daily_loss_limit_usd ? rules.daily_loss_limit_usd - dailyUsed : null,
    },
    maxLoss: {
      used: totalLossUsed,
      limit: rules.max_loss_limit_usd,
      pct: rules.max_loss_limit_usd ? (totalLossUsed / rules.max_loss_limit_usd) * 100 : 0,
      remaining: rules.max_loss_limit_usd ? rules.max_loss_limit_usd - totalLossUsed : null,
    },
    profitTarget: {
      progress: profitProgress,
      target: rules.profit_target_usd,
      pct: rules.profit_target_usd ? (profitProgress / rules.profit_target_usd) * 100 : 0,
      remaining: rules.profit_target_usd ? rules.profit_target_usd - profitProgress : null,
    },
  };
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

  const CACHE_TTL = 30 * 1000; // 30s — client faz auto-refresh visivel
  const HARD_RATE_LIMIT = 15 * 1000; // 15s — mesmo com refresh=1, nao hita BingX se fetched_at é mais novo

  // Lê cache uma vez — serve pra 3 decisões: hit normal, guard 15s, fallback em rate limit da BingX
  const { data: cached } = await supabase
    .from("exchange_snapshots")
    .select("data, fetched_at")
    .eq("discord_user_id", session.userId)
    .eq("exchange", exchange)
    .eq("snapshot_type", "full")
    .single();

  const ageMs = cached ? Date.now() - new Date(cached.fetched_at).getTime() : Infinity;

  // Cache hit normal
  if (!forceRefresh && cached && ageMs < CACHE_TTL) {
    return NextResponse.json({ connected: true, exchange, cached: true, ...cached.data });
  }

  // Rate limit hard: refresh=1 spammado? serve cache (mesmo expirado) se < 15s
  if (forceRefresh && cached && ageMs < HARD_RATE_LIMIT) {
    return NextResponse.json({
      connected: true,
      exchange,
      cached: true,
      rateLimited: true,
      ...cached.data,
    });
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
    // BingX tem endpoints extras (forceOrders, openOrders). Outros exchanges retornam []
    const isBingx = exchange === "bingx";
    const [balance, positions, trades, income, forceOrders, openOrders] = await Promise.all([
      getBalance(exchange, creds),
      getPositions(exchange, creds),
      getTradeHistory(exchange, creds, { lastDays: 7, limit: 200 }),
      getIncome(exchange, creds, { lastDays: 30, limit: 200 }),
      isBingx ? getForceOrders(creds, { lastDays: 7 }).catch(() => []) : Promise.resolve([]),
      isBingx ? getOpenOrders(creds).catch(() => []) : Promise.resolve([]),
    ]);

    // Paralelo: dados auxiliares do DB
    const sinceMs = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const sinceDate = new Date(sinceMs).toISOString().slice(0, 10);
    const sinceIso = new Date(sinceMs).toISOString();
    const [
      { data: callsRaw },
      { data: tradeMetaRaw },
      { data: eventsRaw },
      { data: propRulesRaw },
    ] = await Promise.all([
      supabase.from("calls_history").select("id, data, side, asset, target, return_pct").gte("data", sinceDate).order("data", { ascending: false }),
      supabase.from("exchange_trade_metadata").select("order_id, tags, notes, stop_loss, marked_as_ura_call").eq("discord_user_id", session.userId).eq("exchange", exchange),
      supabase.from("economic_events").select("event_time, title, impact, currency").gte("event_time", sinceIso).in("impact", ["high", "High", "HIGH"]),
      supabase.from("exchange_prop_rules").select("firm_name, account_size_usd, daily_loss_limit_usd, max_loss_limit_usd, profit_target_usd, trailing_dd").eq("discord_user_id", session.userId).eq("exchange", exchange).eq("active", true).maybeSingle(),
    ]);

    const calls = (callsRaw || []) as CallRow[];
    const tradeMeta = (tradeMetaRaw || []) as TradeMetaRow[];
    const events = (eventsRaw || []) as EventRow[];
    const propRules = propRulesRaw as unknown as Parameters<typeof computePropStatus>[0];

    // Index metadata por order_id e manual overrides de ura_call
    const metaByOrder = new Map<string, TradeMetaRow>();
    const manualUraOverrides = new Map<string, boolean>();
    for (const m of tradeMeta) {
      metaByOrder.set(m.order_id, m);
      if (m.marked_as_ura_call !== null && m.marked_as_ura_call !== undefined) {
        manualUraOverrides.set(m.order_id, m.marked_as_ura_call);
      }
    }

    // Enriquece trades com meta + ura match
    const matched = matchUraCalls(trades, calls, manualUraOverrides);
    const enrichedTrades = matched.map((t) => ({ ...t, meta: metaByOrder.get(t.orderId) }));

    const metrics = computeMetrics(trades);
    const metricsSplit = splitMetrics(matched);
    const dailyPnL = aggregateDailyPnL(income, 30);
    const equityCurve = reconstructEquityCurve(balance.totalEquity, dailyPnL);
    const drawdownCurve = computeDrawdown(equityCurve);
    const maxDrawdown = drawdownCurve.reduce((min, p) => (p.dd < min.dd ? p : min), drawdownCurve[0] || { date: "", dd: 0, ddPct: 0 });

    // Breakdowns já existentes
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

    const hourly = new Array(24).fill(null).map((_, h) => ({ hour: h, pnl: 0, trades: 0 }));
    for (const t of trades) {
      if (t.profit === 0 || !t.time) continue;
      const d = new Date(t.time);
      d.setHours(d.getHours() - 3);
      const h = d.getHours();
      hourly[h].pnl += t.profit;
      hourly[h].trades += 1;
    }

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

    // Novas analytics
    const tagStats = tagBreakdown(enrichedTrades);
    const rMultiples = computeRMultiples(enrichedTrades);
    const eventExposure = crossEventExposure(trades, events);

    // Agregados de commission (já vem no trade)
    const totalCommission = trades.reduce((s, t) => s + (t.commission || 0), 0);
    // Agregado de funding fee por símbolo
    const fundingBySymbol = new Map<string, number>();
    for (const i of income) {
      if (i.incomeType?.toUpperCase() === "FUNDING_FEE" && i.symbol) {
        fundingBySymbol.set(i.symbol, (fundingBySymbol.get(i.symbol) || 0) + i.income);
      }
    }

    // Marcar trades que cruzam com forceOrders — liquidação
    const liqKeys = new Set<string>();
    for (const f of forceOrders) {
      liqKeys.add(`${f.symbol}_${Math.floor(f.time / 60000)}`); // minuto-level
    }

    // MFE/MAE via klines — PASSADO É IMUTÁVEL, cache eterno por orderId em DB.
    // 1. Le todos os mfe/mae já computados pros trades deste snapshot.
    // 2. Pros que não tem, calcula via klines (so trades com profit != 0).
    // 3. Persiste os novos.
    // Resultado: primeiro load de trader ativo = ~10 chamadas klines.
    //            loads subsequentes = 0 chamadas klines pro mesmo trade.
    const closedTradesSorted = [...enrichedTrades].filter((t) => t.profit !== 0 && t.time > 0).sort((a, b) => b.time - a.time).slice(0, 30);
    const orderIds = closedTradesSorted.map((t) => t.orderId);
    const mfeMae = new Map<string, { mfe: number; mae: number; mfeR: number | null; maeR: number | null }>();

    if (isBingx && orderIds.length > 0) {
      const { data: cachedMfe } = await supabase
        .from("exchange_trade_mfemae")
        .select("order_id, mfe_usd, mae_usd")
        .in("order_id", orderIds);

      const cachedMap = new Map<string, { mfe: number; mae: number }>();
      for (const row of cachedMfe || []) {
        cachedMap.set(row.order_id, {
          mfe: parseFloat(row.mfe_usd || "0"),
          mae: parseFloat(row.mae_usd || "0"),
        });
      }

      // Pros cached, computa R multiple (risk muda com stop atualizado)
      const toFetch: typeof closedTradesSorted = [];
      for (const t of closedTradesSorted) {
        const entry = t.price;
        if (!entry) continue;
        const qty = Math.abs(t.quantity || 0);
        const stop = t.meta?.stop_loss ? parseFloat(t.meta.stop_loss) : null;
        const risk = stop && qty > 0 ? Math.abs(entry - stop) * qty : null;

        const cachedVal = cachedMap.get(t.orderId);
        if (cachedVal) {
          mfeMae.set(t.orderId, {
            mfe: cachedVal.mfe,
            mae: cachedVal.mae,
            mfeR: risk && risk > 0 ? cachedVal.mfe / risk : null,
            maeR: risk && risk > 0 ? cachedVal.mae / risk : null,
          });
        } else {
          toFetch.push(t);
        }
      }

      // Fetch paralelo apenas pros não-cacheados (limitado a 10 concorrentes)
      const toFetchLimited = toFetch.slice(0, 10);
      const newRows: Array<{ order_id: string; symbol: string; side: string; entry_price: number; trade_time: number; mfe_usd: number; mae_usd: number; mfe_price: number; mae_price: number }> = [];

      await Promise.all(
        toFetchLimited.map(async (t) => {
          try {
            const windowMs = 30 * 60 * 1000;
            const start = Math.max(0, t.time - windowMs);
            const end = t.time + windowMs;
            const klines = await getKlines(t.symbol, "1m", start, end, 100);
            if (!klines.length) return;
            const entry = t.price;
            const qty = Math.abs(t.quantity || 0);
            const isLong = (t.side || "").toUpperCase() === "BUY";
            let mfePrice = entry;
            let maePrice = entry;
            for (const k of klines) {
              if (isLong) {
                if (k.high > mfePrice) mfePrice = k.high;
                if (k.low < maePrice) maePrice = k.low;
              } else {
                if (k.low < mfePrice) mfePrice = k.low; // pro short, MFE é preço caindo
                if (k.high > maePrice) maePrice = k.high;
              }
            }
            const mfe = isLong ? (mfePrice - entry) * qty : (entry - mfePrice) * qty;
            const mae = isLong ? (maePrice - entry) * qty : (entry - maePrice) * qty;
            const stop = t.meta?.stop_loss ? parseFloat(t.meta.stop_loss) : null;
            const risk = stop && qty > 0 ? Math.abs(entry - stop) * qty : null;

            mfeMae.set(t.orderId, {
              mfe, mae,
              mfeR: risk && risk > 0 ? mfe / risk : null,
              maeR: risk && risk > 0 ? mae / risk : null,
            });

            newRows.push({
              order_id: t.orderId,
              symbol: t.symbol,
              side: t.side,
              entry_price: entry,
              trade_time: t.time,
              mfe_usd: mfe,
              mae_usd: mae,
              mfe_price: mfePrice,
              mae_price: maePrice,
            });
          } catch {
            // Silently ignore — klines pode falhar sem comprometer a response
          }
        })
      );

      // Persiste pros proximos fetches (passado imutável, nunca precisa refazer)
      if (newRows.length > 0) {
        await supabase.from("exchange_trade_mfemae").upsert(newRows, { onConflict: "order_id" });
      }
    }

    const todayKey = (() => {
      const n = new Date();
      n.setHours(n.getHours() - 3);
      return n.toISOString().slice(0, 10);
    })();
    const todayPnL = dailyPnL.find((d) => d.date === todayKey)?.pnl || 0;
    const propStatus = computePropStatus(propRules, todayPnL, balance.totalEquity, equityCurve);

    // Trades enriquecidos na resposta (com meta + uraCall flag + liq flag + MFE/MAE)
    const tradesForClient = enrichedTrades.slice(0, 100).map((t) => {
      const liqKey = `${t.symbol}_${Math.floor(t.time / 60000)}`;
      const mm = mfeMae.get(t.orderId);
      return {
        orderId: t.orderId,
        symbol: t.symbol,
        side: t.side,
        type: t.type,
        price: t.price,
        quantity: t.quantity,
        profit: t.profit,
        commission: t.commission,
        status: t.status,
        time: t.time,
        uraCall: t.uraCall,
        tags: t.meta?.tags || [],
        notes: t.meta?.notes || null,
        stopLoss: t.meta?.stop_loss ? parseFloat(t.meta.stop_loss) : null,
        liquidated: liqKeys.has(liqKey),
        mfe: mm?.mfe ?? null,
        mae: mm?.mae ?? null,
        mfeR: mm?.mfeR ?? null,
        maeR: mm?.maeR ?? null,
      };
    });

    const snapshot = {
      balance,
      positions,
      trades: tradesForClient,
      income: income.slice(0, 100),
      metrics,
      metricsSplit,
      equityCurve,
      drawdownCurve,
      maxDrawdown,
      dailyPnL,
      symbolBreakdown,
      hourlyBreakdown: hourly,
      dowBreakdown,
      tagStats,
      rMultiples,
      eventExposure,
      propStatus,
      forceOrders,
      openOrders,
      totalCommission,
      fundingBySymbol: Object.fromEntries(fundingBySymbol),
      label: conn.label,
    };

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

    const today = new Date();
    today.setHours(today.getHours() - 3);
    const todayDateKey = today.toISOString().slice(0, 10);
    await supabase.from("exchange_equity_daily").upsert(
      {
        discord_user_id: session.userId,
        exchange,
        date: todayDateKey,
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
