import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/session";
import { callEdgeFunction, USER_STATE_TAG } from "@/lib/ura-coin";

export const runtime = "nodejs";

export interface OwnedCosmetic {
  cosmetic_id: string;
  cosmetic_type: string;
  prize_id: string;
  prize_slug: string;
  prize_name: string;
  prize_rarity: string;
  metadata: Record<string, unknown>;
  acquired_at: string;
  equipped: boolean;
}

interface ListResponse { cosmetics: OwnedCosmetic[] }

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const res = await callEdgeFunction<ListResponse>("cosmetics-manager", {
    op: "list",
    user_id: session.userId,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { cosmetic_id?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const cosmeticId = (body.cosmetic_id ?? "").trim();
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(cosmeticId)) return NextResponse.json({ error: "cosmetic_id inválido" }, { status: 400 });

  const res = await callEdgeFunction<{ status: string }>("cosmetics-manager", {
    op: "equip",
    user_id: session.userId,
    cosmetic_id: cosmeticId,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  // Cosmetic equipado entra no `state.cosmetics` (banner/frame/effect que
  // o layout aplica na sidebar) — invalida cache.
  revalidateTag(USER_STATE_TAG(session.userId), "max");
  return NextResponse.json(res.data);
}
