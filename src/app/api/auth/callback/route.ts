import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getDiscordUser, getGuildMember, hasEliteRole, hasVipRole } from "@/lib/discord";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  // Validate state
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    // Get user profile
    const user = await getDiscordUser(tokens.access_token);

    // Get guild member data (roles) using bot token
    const member = await getGuildMember(user.id);

    if (!member) {
      // User is not in the Discord server
      return NextResponse.redirect(new URL("/login?error=not_in_server", request.url));
    }

    const isElite = hasEliteRole(member.roles);
    const isVip = hasVipRole(member.roles);

    // Create session
    await createSession({
      userId: user.id,
      username: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
      roles: member.roles,
      isElite,
      isVip,
    });

    // Clear the oauth state cookie
    const res = NextResponse.redirect(
      new URL(isElite ? "/elite" : "/login?error=not_elite", request.url),
    );
    res.cookies.delete("oauth_state");

    return res;
  } catch (error) {
    console.error("[OAuth callback] Error:", error);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
