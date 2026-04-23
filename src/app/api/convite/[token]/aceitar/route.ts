import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAnon } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const BOT_TOKEN = (process.env.DISCORD_BOT_TOKEN ?? "").trim();
const NOTIFY_CHANNEL_ID = (process.env.DISCORD_URA_NOTIFY_CHANNEL_ID ?? "").trim();
const UA = "URALabsSite (https://uralabs.com.br, 1.0)";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  // Rate limit por IP: 20 tentativas/10min. Brute-force de token 14-char é
  // inviável matematicamente (36^14), mas rate limit reduz footprint e
  // dificulta enumeração de tokens vazados parcialmente.
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`convite-aceitar:${ip}`, 20, 600);
  if (!allowed) {
    return json(429, { ok: false, error: "Muitas tentativas. Aguarde alguns minutos." });
  }

  const { token } = await ctx.params;
  if (!token || token.length < 8 || token.length > 64) {
    return json(400, { ok: false, error: "Token inválido" });
  }

  let body: { email?: string; telefone?: string | null };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { ok: false, error: "Payload inválido" });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return json(400, { ok: false, error: "Email inválido" });
  }
  const telefone = body.telefone?.trim() || null;
  if (telefone && telefone.length > 40) {
    return json(400, { ok: false, error: "Telefone inválido" });
  }

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.rpc("accept_convite", {
    p_token: token,
    p_email: email,
    p_telefone: telefone,
  });
  if (error) {
    console.error("[convite aceitar] rpc:", error);
    return json(500, { ok: false, error: "Não foi possível salvar agora" });
  }
  const result = (data ?? { ok: false, error: "sem resposta" }) as {
    ok: boolean;
    error?: string;
  };
  if (!result.ok) {
    const status = result.error?.includes("expirado")
      ? 410
      : result.error?.includes("já foi") ? 409 : 400;
    return json(status, result);
  }

  // Busca dados pra notificar URA (best-effort)
  if (BOT_TOKEN && NOTIFY_CHANNEL_ID) {
    const { data: rpcData } = await supabase.rpc("get_convite_by_token", { p_token: token });
    const info = Array.isArray(rpcData) ? rpcData[0] : null;
    if (info) {
      notifyUra({
        nome: info.nome_exibicao,
        discordUserId: info.discord_user_id,
        turma: info.turma,
        email,
        telefone,
        valorCentavos: info.valor_centavos,
        token,
      }).catch((err) => console.error("[convite aceitar] notifyUra:", err));
    }
  }

  return json(200, { ok: true });
}

async function notifyUra(payload: {
  nome: string;
  discordUserId: string;
  turma: string;
  email: string;
  telefone: string | null;
  valorCentavos: number;
  token: string;
}) {
  const valor = (payload.valorCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const embed = {
    color: 0xc9a461,
    title: "🎓 Convite Elite — Aceito",
    description: `**${payload.nome}** (<@${payload.discordUserId}>) aceitou o convite da Turma ${payload.turma}.`,
    fields: [
      { name: "Email", value: payload.email, inline: true },
      { name: "WhatsApp", value: payload.telefone || "—", inline: true },
      { name: "Valor", value: valor, inline: true },
      { name: "Token", value: `\`${payload.token}\``, inline: false },
    ],
    footer: { text: "Mandar link de pagamento em até 24h" },
    timestamp: new Date().toISOString(),
  };
  await fetch(`https://discord.com/api/v10/channels/${NOTIFY_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": UA,
    },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
