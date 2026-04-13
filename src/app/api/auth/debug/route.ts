import { NextResponse } from "next/server";

export async function GET() {
  const clientId = (process.env.DISCORD_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.DISCORD_CLIENT_SECRET ?? "").trim();
  const botToken = (process.env.DISCORD_BOT_TOKEN ?? "").trim();
  const guildId = (process.env.DISCORD_GUILD_ID ?? "").trim();
  const vercelUrl = process.env.VERCEL_URL ?? "";
  const nodeEnv = process.env.NODE_ENV ?? "";

  const redirectUri = vercelUrl
    ? "https://www.uralabs.com.br/api/auth/callback"
    : "http://localhost:3001/api/auth/callback";

  // Test token exchange with a fake code to see the exact error
  const res = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: "fake_test_code",
      redirect_uri: redirectUri,
    }),
  });

  const discordResponse = await res.text();

  return NextResponse.json({
    env: {
      CLIENT_ID: clientId ? `${clientId.slice(0, 6)}...${clientId.slice(-4)} (len:${clientId.length})` : "EMPTY",
      CLIENT_SECRET: clientSecret ? `${clientSecret.slice(0, 4)}...${clientSecret.slice(-4)} (len:${clientSecret.length})` : "EMPTY",
      BOT_TOKEN: botToken ? `${botToken.slice(0, 6)}... (len:${botToken.length})` : "EMPTY",
      GUILD_ID: guildId || "EMPTY",
      VERCEL_URL: vercelUrl || "EMPTY",
      NODE_ENV: nodeEnv,
    },
    redirectUri,
    discordTest: {
      status: res.status,
      response: discordResponse.slice(0, 200),
    },
  });
}
