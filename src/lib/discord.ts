// Discord OAuth2 + API helpers for the Elite platform

const DISCORD_API = "https://discord.com/api/v10";

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

function getRedirectUri(): string {
  return env("VERCEL_URL")
    ? "https://www.uralabs.com.br/api/auth/callback"
    : "http://localhost:3001/api/auth/callback";
}

/** Build the Discord OAuth2 authorize URL */
export function getDiscordAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: env("DISCORD_CLIENT_ID"),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "identify guilds.members.read",
    state,
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

/** Exchange an auth code for tokens */
export async function exchangeCode(code: string) {
  const clientId = env("DISCORD_CLIENT_ID");
  const clientSecret = env("DISCORD_CLIENT_SECRET");
  const redirectUri = getRedirectUri();

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("EXCHANGE_FAIL:" + res.status + "|" + body.slice(0, 80));
    console.error("REDIRECT:" + redirectUri + "|ID:" + clientId + "|SECRET_LEN:" + clientSecret.length);
    throw new Error(`exchange:${res.status}`);
  }

  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }>;
}

/** Fetch the authenticated user's profile */
export async function getDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to get user: ${res.status}`);
  return res.json() as Promise<{
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    discriminator: string;
  }>;
}

/** Fetch the user's guild member data (roles, nick, etc.) using the Bot token */
export async function getGuildMember(userId: string) {
  const res = await fetch(`${DISCORD_API}/guilds/${env("DISCORD_GUILD_ID")}/members/${userId}`, {
    headers: {
      Authorization: `Bot ${env("DISCORD_BOT_TOKEN")}`,
      "User-Agent": "URALabsElite/1.0",
    },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to get guild member: ${res.status}`);
  }
  return res.json() as Promise<{
    user: { id: string; username: string; avatar: string | null; global_name: string | null };
    nick: string | null;
    roles: string[];
    joined_at: string;
  }>;
}

/** Check if a user has Elite role */
export function hasEliteRole(roles: string[]): boolean {
  return roles.includes(env("DISCORD_ROLE_ELITE"));
}

/** Check if a user has VIP role */
export function hasVipRole(roles: string[]): boolean {
  return roles.includes(env("DISCORD_ROLE_VIP"));
}

/** Get avatar URL */
export function avatarUrl(userId: string, avatarHash: string | null, size = 128) {
  if (!avatarHash) {
    const idx = Number(userId.slice(-1)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}
