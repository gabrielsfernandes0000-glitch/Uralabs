import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserState } from "@/lib/ura-coin";

export const runtime = "nodejs";

/**
 * Retorna o perfil público de um membro: achievements unlocked, saldo URA Coin,
 * posts no Discord. Requer sessão (qualquer membro logado pode ver qualquer outro).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ user_id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { user_id } = await ctx.params;
  if (!/^[0-9]{5,25}$/.test(user_id)) {
    return NextResponse.json({ error: "user_id inválido" }, { status: 400 });
  }

  const state = await getUserState(user_id, 0); // não precisa dos recent_openings aqui

  return NextResponse.json({
    user_id,
    balance: state.balance,
    achievements: state.achievements,
    posts_count: state.discord_activity?.posts_count ?? 0,
    first_message_at: state.discord_activity?.first_message_at ?? null,
    last_message_at: state.discord_activity?.last_message_at ?? null,
  });
}
