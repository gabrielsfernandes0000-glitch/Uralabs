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

  // 2. Encrypt keys — lança se EXCHANGE_ENCRYPTION_KEY faltar.
  // Protege pra nunca propagar uncaught (que viraria HTML 500 sem JSON e
  // cairia no fallback genérico "exchange fora do ar" no client).
  let apiKeyEnc: string, iv: string, secretEnc: string;
  try {
    const a = encrypt(apiKey.trim());
    apiKeyEnc = a.encrypted; iv = a.iv;
    const secretToStore = passphrase ? `${apiSecret.trim()}|||${passphrase.trim()}` : apiSecret.trim();
    // CRÍTICO: reusa o MESMO iv — só 1 iv é salvo no DB, os 2 encrypts precisam
    // usar o mesmo. Antes estava gerando IV novo no 2º encrypt (default), o
    // que fazia decrypt do api_secret falhar com "Unsupported state" (authTag
    // mismatch). Bug silencioso porque decrypt do api_key vinha antes e passava.
    secretEnc = encrypt(secretToStore, iv).encrypted;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erro de encryption";
    console.error("[exchange/connect] encrypt failed:", msg);
    return NextResponse.json(
      { error: "Servidor sem chave de encryption. Avise o suporte (EXCHANGE_ENCRYPTION_KEY ausente)." },
      { status: 500 }
    );
  }

  // 3. Upsert connection
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    // getSupabaseAdmin() lança quando SUPABASE_SERVICE_ROLE_KEY não está no env
    // (cenário típico em localhost). Retorna msg explícita pro front, não genérico.
    const msg = err instanceof Error ? err.message : "config do servidor";
    console.error("[exchange/connect] admin client failed:", msg);
    return NextResponse.json(
      { error: "Servidor sem permissão pra salvar conexões. Avise o suporte (SERVICE_ROLE_KEY ausente)." },
      { status: 500 }
    );
  }

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
    console.error("[exchange/connect] supabase upsert error:", error);
    return NextResponse.json(
      { error: `Erro ao salvar: ${error.message || "falha no banco"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: `${meta.name} conectada com sucesso` });
}
