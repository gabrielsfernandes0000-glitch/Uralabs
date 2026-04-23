import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAnon } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const BOT_TOKEN = (process.env.DISCORD_BOT_TOKEN ?? "").trim();
const NOTIFY_CHANNEL_ID = (process.env.DISCORD_URA_NOTIFY_CHANNEL_ID ?? "").trim();
const UA = "URALabsSite (https://uralabs.com.br, 1.0)";

const RAZOES_VALIDAS = new Set([
  "preco",
  "tempo",
  "prioridade",
  "nao_era_hora",
  "outro",
]);

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  // Rate limit por IP: 20/10min (mesma defesa do /aceitar).
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`convite-recusar:${ip}`, 20, 600);
  if (!allowed) {
    return json(429, { ok: false, error: "Muitas tentativas. Aguarde alguns minutos." });
  }

  const { token } = await ctx.params;
  if (!token || token.length < 8 || token.length > 64) {
    return json(400, { ok: false, error: "Token inválido" });
  }

  let body: { razao?: string; detalhe?: string | null };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { ok: false, error: "Payload inválido" });
  }

  const razao = (body.razao ?? "").trim();
  if (!RAZOES_VALIDAS.has(razao)) {
    return json(400, { ok: false, error: "Razão inválida" });
  }
  const detalhe = (body.detalhe ?? "").trim().slice(0, 500) || null;

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.rpc("decline_convite", {
    p_token: token,
    p_razao: razao,
    p_detalhe: detalhe,
  });
  if (error) {
    console.error("[convite recusar] rpc:", error);
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

  if (BOT_TOKEN && NOTIFY_CHANNEL_ID) {
    const { data: rpcData } = await supabase.rpc("get_convite_by_token", { p_token: token });
    const info = Array.isArray(rpcData) ? rpcData[0] : null;
    if (info) {
      notifyUra({
        nome: info.nome_exibicao,
        discordUserId: info.discord_user_id,
        turma: info.turma,
        razao,
        detalhe,
      }).catch((err) => console.error("[convite recusar] notifyUra:", err));
    }
  }

  return json(200, { ok: true });
}

const RAZOES_LABEL: Record<string, string> = {
  preco: "Preço",
  tempo: "Sem tempo pra estudar",
  prioridade: "Outra prioridade",
  nao_era_hora: "Só explorando",
  outro: "Outro motivo",
};

async function notifyUra(payload: {
  nome: string;
  discordUserId: string;
  turma: string;
  razao: string;
  detalhe: string | null;
}) {
  const fields = [{ name: "Motivo", value: RAZOES_LABEL[payload.razao] ?? payload.razao, inline: true }];
  if (payload.detalhe) fields.push({ name: "Detalhe", value: payload.detalhe, inline: false });
  const embed = {
    color: 0x6b6b6b,
    title: "Convite Elite — Recusado",
    description: `**${payload.nome}** (<@${payload.discordUserId}>) recusou o convite da Turma ${payload.turma}.`,
    fields,
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
