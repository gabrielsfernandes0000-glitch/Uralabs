import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/session";
import { callEdgeFunction, USER_STATE_TAG } from "@/lib/ura-coin";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return json(401, { error: "unauthorized" });

  let body: { box_id?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const boxId = body.box_id?.trim() ?? "";
  if (!UUID_RE.test(boxId)) return json(400, { error: "box_id inválido" });

  // Chama edge function com CRON_SECRET. A function faz o roll server-side
  // (anti-fraude: user_id vem do backend, nunca do client).
  const res = await callEdgeFunction("loot-box-open", {
    user_id: session.userId,
    box_id: boxId,
  });

  if (!res.ok) {
    return json(res.status, { error: res.error });
  }
  // Invalida o cache do user state (TTL 30s no unstable_cache) — saldo de
  // coins e recent openings precisam atualizar imediatamente após open.
  // Next 16 exige segundo argumento "max" pra expirar na hora.
  revalidateTag(USER_STATE_TAG(session.userId), "max");
  return json(200, res.data);
}
