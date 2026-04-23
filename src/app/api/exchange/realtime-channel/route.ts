import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getExchangeChannelName } from "@/lib/exchange/realtime-channel";
import { EXCHANGES, type ExchangeId } from "@/lib/exchange";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_EXCHANGES = EXCHANGES.map((e) => e.id);

/**
 * Retorna o nome do canal Supabase Realtime pra esse (user, exchange).
 *
 * O nome é HMAC server-side — cliente não consegue computar sem o secret.
 * Sem esse endpoint, qualquer um com a anon key (pública) + Discord ID
 * alheio (visível em servidores públicos) poderia subscrever no canal
 * do outro user e receber ACCOUNT_UPDATE/ORDER_TRADE_UPDATE em tempo real.
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit defensivo: 60 calls/min/user. O cliente pede só 1x por sessão de
  // corretora; bursts maiores são anomalia (script, bug, ou reconexão infinita).
  const allowed = await checkRateLimit(`realtime-channel:${session.userId}`, 60, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const exchange = (url.searchParams.get("exchange") || "bingx") as ExchangeId;
  if (!VALID_EXCHANGES.includes(exchange)) {
    return NextResponse.json({ error: `Exchange invalida: ${exchange}` }, { status: 400 });
  }

  try {
    const channelName = getExchangeChannelName(session.userId, exchange);
    return NextResponse.json({ channelName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    console.error("[exchange/realtime-channel] failed:", msg);
    return NextResponse.json(
      { error: "Servidor sem REALTIME_CHANNEL_SECRET configurado." },
      { status: 500 }
    );
  }
}
