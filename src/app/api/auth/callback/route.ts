import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getDiscordUser, getGuildMember, hasEliteRole, hasVipRole } from "@/lib/discord";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  console.log("[OAuth] code:", !!code, "state:", !!state, "storedState:", !!storedState);

  if (!code || !state || state !== storedState) {
    console.error("[OAuth] State mismatch", { state, storedState });
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  try {
    console.log("[OAuth] Exchanging code...");
    const tokens = await exchangeCode(code);
    console.log("[OAuth] Got tokens, getting user...");

    const user = await getDiscordUser(tokens.access_token);
    console.log("[OAuth] User:", user.username, user.id);

    const member = await getGuildMember(user.id);
    console.log("[OAuth] Member roles:", member?.roles?.length ?? "not in guild");

    if (!member) {
      return NextResponse.redirect(new URL("/login?error=not_in_server", request.url));
    }

    const isElite = hasEliteRole(member.roles);
    const isVip = hasVipRole(member.roles);
    console.log("[OAuth] isElite:", isElite, "isVip:", isVip);

    await createSession({
      userId: user.id,
      username: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
      roles: member.roles,
      isElite,
      isVip,
    });

    const res = NextResponse.redirect(
      new URL(isElite ? "/elite" : "/login?error=not_elite", request.url),
    );
    res.cookies.delete("oauth_state");
    return res;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[OAuth callback] FULL ERROR:", msg);
    console.error("[OAuth callback] ENV CHECK - CLIENT_ID:", !!process.env.DISCORD_CLIENT_ID, "CLIENT_SECRET:", !!process.env.DISCORD_CLIENT_SECRET, "BOT_TOKEN:", !!process.env.DISCORD_BOT_TOKEN);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
