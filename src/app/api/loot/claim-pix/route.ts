import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { callEdgeFunction } from "@/lib/ura-coin";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TYPES = ["cpf", "email", "phone", "random"];

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return json(401, { error: "unauthorized" });

  let body: {
    redemption_id?: string;
    pix_key?: string;
    pix_key_type?: string;
    pix_recipient_name?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const redemptionId = body.redemption_id?.trim() ?? "";
  const pixKey = body.pix_key?.trim() ?? "";
  const pixType = body.pix_key_type?.trim() ?? "";
  const recipient = body.pix_recipient_name?.trim() ?? "";

  if (!UUID_RE.test(redemptionId)) return json(400, { error: "redemption_id inválido" });
  if (!pixKey || pixKey.length > 256) return json(400, { error: "Chave PIX inválida" });
  if (!VALID_TYPES.includes(pixType)) return json(400, { error: "Tipo de chave PIX inválido" });
  if (recipient.length < 3 || recipient.length > 120) {
    return json(400, { error: "Nome do destinatário inválido" });
  }

  const res = await callEdgeFunction("prize-claim-pix", {
    user_id: session.userId,
    redemption_id: redemptionId,
    pix_key: pixKey,
    pix_key_type: pixType,
    pix_recipient_name: recipient,
  });

  if (!res.ok) {
    return json(res.status, { error: res.error });
  }
  return json(200, res.data);
}
