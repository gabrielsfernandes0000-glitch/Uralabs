import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { encrypt } from "@/lib/exchange/crypto";
import { validateCredentials, EXCHANGES, type ExchangeId } from "@/lib/exchange";

const VALID_EXCHANGES = EXCHANGES.map((e) => e.id);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.apiKey || !body?.apiSecret) {
    return NextResponse.json({ error: "apiKey and apiSecret are required" }, { status: 400 });
  }

  const exchange = (body.exchange || "bingx") as ExchangeId;
  if (!VALID_EXCHANGES.includes(exchange)) {
    return NextResponse.json({ error: `Exchange invalida: ${exchange}` }, { status: 400 });
  }

  const { apiKey, apiSecret, passphrase, label } = body as {
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
    label?: string;
  };

  // 1. Validate credentials
  try {
    const valid = await validateCredentials(exchange, {
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      passphrase: passphrase?.trim(),
    });
    if (!valid) {
      return NextResponse.json({ error: "API key invalida ou sem permissao de leitura" }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao validar: ${msg}` }, { status: 400 });
  }

  // 2. Encrypt keys
  const { encrypted: apiKeyEnc, iv } = encrypt(apiKey.trim());
  const { encrypted: apiSecretEnc } = encrypt(apiSecret.trim());
  // Store passphrase appended to apiSecret if present (same IV)
  const secretToStore = passphrase ? `${apiSecret.trim()}|||${passphrase.trim()}` : apiSecret.trim();
  const { encrypted: secretEnc } = encrypt(secretToStore);

  // 3. Upsert connection
  const supabase = getSupabaseAdmin();
  const meta = EXCHANGES.find((e) => e.id === exchange)!;

  const { error } = await supabase
    .from("exchange_connections")
    .upsert(
      {
        discord_user_id: session.userId,
        exchange,
        api_key_encrypted: apiKeyEnc,
        api_secret_encrypted: secretEnc,
        iv,
        label: label || null,
        status: "active",
        error_message: null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "discord_user_id,exchange" }
    );

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: "Erro ao salvar conexao" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: `${meta.name} conectada com sucesso` });
}
