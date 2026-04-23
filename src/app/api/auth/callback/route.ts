import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getDiscordUser, getGuildMember, hasEliteRole, hasVipRole } from "@/lib/discord";
import { createSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  // Rate limit por IP: 20 callbacks/5min. OAuth bombing / credential stuffing
  // múltiplos codes válidos roubados exigiria flood a esse endpoint.
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`auth-callback:${ip}`, 20, 300);
  if (!allowed) {
    return NextResponse.redirect(new URL("/login?error=rate_limited", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const user = await getDiscordUser(tokens.access_token);
    const member = await getGuildMember(user.id);

    if (!member) {
      return NextResponse.redirect(new URL("/login?error=not_in_server", request.url));
    }

    const isElite = hasEliteRole(member.roles);
    const isVip = hasVipRole(member.roles);

    await createSession({
      userId: user.id,
      username: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
      roles: member.roles,
      isElite,
      isVip,
    });

    return NextResponse.redirect(
      new URL(isElite ? "/elite" : "/login?error=not_elite", request.url),
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[OAuth] FAIL:", msg);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
