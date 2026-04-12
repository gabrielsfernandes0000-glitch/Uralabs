// Discord OAuth2 + API helpers for the Elite platform

const DISCORD_API = "https://discord.com/api/v10";

// These will come from env vars
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const ROLE_ELITE = process.env.DISCORD_ROLE_ELITE!;
const ROLE_VIP = process.env.DISCORD_ROLE_VIP!;

const REDIRECT_URI =
  process.env.NODE_ENV === "production"
    ? "https://www.uralabs.com.br/api/auth/callback"
    : "http://localhost:3001/api/auth/callback";

/** Build the Discord OAuth2 authorize URL */
export function getDiscordAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds.members.read",
    state,
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

/** Exchange an auth code for tokens */
export async function exchangeCode(code: string) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
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
  const res = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${userId}`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "User-Agent": "URALabsElite/1.0",
    },
  });
  if (!res.ok) {
    if (res.status === 404) return null; // not in guild
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
  return roles.includes(ROLE_ELITE);
}

/** Check if a user has VIP role */
export function hasVipRole(roles: string[]): boolean {
  return roles.includes(ROLE_VIP);
}

/** Get avatar URL */
export function avatarUrl(userId: string, avatarHash: string | null, size = 128) {
  if (!avatarHash) {
    // Default avatar index based on user ID (simple modulo without BigInt)
    const idx = Number(userId.slice(-1)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}
