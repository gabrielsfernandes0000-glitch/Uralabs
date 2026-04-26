// Discord API helpers for the Landing Page widget (server-side only)
// Fetches real guild data: channels, member counts, messages from #sucesso

const DISCORD_API = "https://discord.com/api/v10";

// URA's exact Discord user ID — never match by nickname (too many "Ura" variants)
const URA_USER_ID = "580162059078074420";

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

async function discordFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${DISCORD_API}${path}`, {
      headers: {
        Authorization: `Bot ${env("DISCORD_BOT_TOKEN")}`,
        "User-Agent": "URALabsLP/1.0",
      },
      signal: controller.signal,
      cache: "force-cache",
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error(`Discord ${path} → ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Types ──

export type LPGuildData = {
  memberCount: number;
  onlineCount: number;
  vipCount: number;
  eliteCount: number;
  channels: LPChannel[];
  onlineMembers: LPMember[];
  messages: LPMessage[];
  /** ISO timestamp da última atualização (snapshot). UI mostra "atualizado há Xmin". */
  snapshotAt: string;
  /** true se o fetch real falhou e estamos usando dados fallback. */
  fallback: boolean;
};

export type LPChannel = {
  name: string;
  type: "text" | "voice";
  category: string;
  unread: boolean;
  active?: boolean;
};

export type LPMember = {
  name: string;
  role: "Mentor" | "Elite" | "VIP" | "Membro";
  status: "online" | "idle" | "dnd";
  avatarUrl: string | null;
};

export type LPMessage = {
  user: string;
  avatarUrl: string | null;
  role: "Mentor" | "Elite" | "VIP" | "Membro";
  content: string;
  timestamp: string;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  reactions: { emoji: string; count: number }[];
};

type RawChannel = {
  id: string;
  type: number;
  name: string;
  parent_id: string | null;
  position: number;
};

type RawMember = {
  user: {
    id: string;
    username: string;
    global_name: string | null;
    bot?: boolean;
    avatar: string | null;
  };
  nick: string | null;
  roles: string[];
};

type RawMessage = {
  id: string;
  author: {
    id: string;
    username: string;
    global_name: string | null;
    bot?: boolean;
    avatar: string | null;
  };
  content: string;
  timestamp: string;
  attachments: {
    url: string;
    proxy_url?: string;
    content_type?: string;
    width?: number;
    height?: number;
  }[];
  reactions?: { emoji: { name: string }; count: number }[];
  member?: { roles: string[]; nick: string | null };
};

// ── Fetch ──

// Known channel ID for #sucesso — avoids waiting for channel list
const SUCESSO_CHANNEL_ID = "1376382435742453824";

export async function getLPGuildData(): Promise<LPGuildData> {
  const GUILD_ID = env("DISCORD_GUILD_ID");
  const ROLE_VIP = env("DISCORD_ROLE_VIP");
  const ROLE_ELITE = env("DISCORD_ROLE_ELITE");

  try {
    // All 4 fetches in parallel — no sequential waits
    const [guild, rawChannels, allMembers, rawSucessoMsgs] = await Promise.all([
      discordFetch<{
        approximate_member_count: number;
        approximate_presence_count: number;
      }>(`/guilds/${GUILD_ID}?with_counts=true`),
      discordFetch<RawChannel[]>(`/guilds/${GUILD_ID}/channels`),
      fetchAllMembers(GUILD_ID),
      discordFetch<RawMessage[]>(`/channels/${SUCESSO_CHANNEL_ID}/messages?limit=30`),
    ]);

    // Count VIP/Elite
    const humans = allMembers.filter((m) => !m.user.bot);
    const vipMembers = humans.filter((m) => m.roles.includes(ROLE_VIP));
    const eliteMembers = humans.filter((m) => m.roles.includes(ROLE_ELITE));

    // Build role lookup by user ID
    const roleByUserId = new Map<string, string[]>();
    for (const m of allMembers) {
      roleByUserId.set(m.user.id, m.roles);
    }

    // Build category name map
    const catNames: Record<string, string> = {};
    for (const c of rawChannels) {
      if (c.type === 4) catNames[c.id] = c.name;
    }

    // Categories to show on LP (whitelist)
    // Whitelist explícita: só canais que geram gatilho mental na LP.
    // Cada um aqui tem um propósito de venda:
    // - sucesso: prova social (resultados reais dos membros)
    // - análises-crypto: conteúdo técnico
    // - chat-geral: comunidade ativa
    // - feedbacks: prova social (depoimentos)
    // - chat-vip / calls-vip: tier pago visível (FOMO)
    // - chat-elite / aulas-elite: produto premium tangível
    const SHOW_CHANNELS = new Set([
      "sucesso",
      "análises-crypto",
      "chat-geral",
      "feedbacks",
      "chat-vip",
      "calls-vip",
      "chat-elite",
      "aulas-elite",
    ]);

    // Build channel list
    const channels: LPChannel[] = rawChannels
      .filter((c) => c.type === 0 || c.type === 2)
      .map((c) => {
        const cat = catNames[c.parent_id ?? ""] ?? "GERAL";
        const cleanName = c.name.replace(/^[^\w│]*│/, "").trim() || c.name;
        return {
          name: cleanName,
          type: c.type === 2 ? "voice" as const : "text" as const,
          category: cat,
          unread: false,
          active: cleanName === "sucesso",
          position: c.position,
        };
      })
      .filter((c) => SHOW_CHANNELS.has(c.name))
      .sort((a, b) => a.position - b.position)
      .map(({ position: _p, ...rest }) => rest);

    // Mark some channels as "unread"
    const unreadNames = new Set(["calls-vip", "anúncios", "sucesso", "calls-free"]);
    for (const ch of channels) {
      if (unreadNames.has(ch.name)) ch.unread = true;
    }

    // Process messages (already fetched in parallel)
    const messages = processSucessoMessages(
      rawSucessoMsgs,
      ROLE_VIP,
      ROLE_ELITE,
      roleByUserId,
    );

    // ── Build online members (sidebar) ──
    // Sem randomização: seleção estável por user ID (primeiros N ordenados).
    // Status também determinístico por hash do user ID — mesmo membro sempre
    // com o mesmo indicador entre renders. Se quisermos presença real, precisa
    // de conexão Gateway, que não rola em edge function.
    const onlineMembers: LPMember[] = [];

    const ura = allMembers.find((m) => m.user.id === URA_USER_ID);
    if (ura) {
      onlineMembers.push({
        name: ura.nick || "URA",
        role: "Mentor",
        status: "online",
        avatarUrl: avatarUrl(ura.user.id, ura.user.avatar),
      });
    }

    const topElite = eliteMembers
      .filter((m) => m.user.id !== URA_USER_ID)
      .sort((a, b) => a.user.id.localeCompare(b.user.id))
      .slice(0, 3);
    for (const m of topElite) {
      onlineMembers.push({
        name: m.nick || m.user.global_name || m.user.username,
        role: "Elite",
        status: deterministicStatus(m.user.id),
        avatarUrl: avatarUrl(m.user.id, m.user.avatar),
      });
    }

    const eliteIds = new Set(eliteMembers.map((m) => m.user.id));
    const topVip = vipMembers
      .filter((m) => !eliteIds.has(m.user.id) && m.user.id !== URA_USER_ID)
      .sort((a, b) => a.user.id.localeCompare(b.user.id))
      .slice(0, 8);
    for (const m of topVip) {
      onlineMembers.push({
        name: m.nick || m.user.global_name || m.user.username,
        role: "VIP",
        status: deterministicStatus(m.user.id),
        avatarUrl: avatarUrl(m.user.id, m.user.avatar),
      });
    }

    return {
      memberCount: guild.approximate_member_count,
      onlineCount: guild.approximate_presence_count,
      vipCount: vipMembers.length,
      eliteCount: eliteMembers.length,
      channels,
      onlineMembers,
      messages,
      snapshotAt: new Date().toISOString(),
      fallback: false,
    };
  } catch (err) {
    console.error("[getLPGuildData] failed:", err);
    return getFallbackData();
  }
}

// ── Fetch messages from #sucesso ──

function processSucessoMessages(
  raw: RawMessage[],
  roleVip: string,
  roleElite: string,
  roleByUserId: Map<string, string[]>,
): LPMessage[] {
  try {
    // Filter: human messages that have an image OR meaningful text
    const good = raw.filter((m) => {
      if (m.author.bot) return false;
      const hasImage = m.attachments.some((a) =>
        a.content_type?.startsWith("image/"),
      );
      const text = m.content
        .replace(/<a?:\w+:\d+>/g, "")
        .replace(/<@&?\d+>/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .trim();
      // Accept if has image (the main attraction) or decent text
      return hasImage || text.length >= 15;
    });

    // Select up to 20 messages, max 3 per author, diverse
    const selected: RawMessage[] = [];
    for (const msg of good) {
      if (selected.length >= 20) break;
      const authorCount = selected.filter(
        (s) => s.author.id === msg.author.id,
      ).length;
      if (authorCount >= 3) continue;
      selected.push(msg);
    }

    // Reverse to chronological order (oldest first)
    selected.reverse();

    return selected.map((msg) => {
      const memberRoles = msg.member?.roles ?? roleByUserId.get(msg.author.id) ?? [];
      const role = msg.author.id === URA_USER_ID
        ? "Mentor" as const
        : memberRoles.includes(roleElite)
          ? "Elite" as const
          : memberRoles.includes(roleVip)
            ? "VIP" as const
            : "Membro" as const;

      // Clean content: remove custom emoji codes, role mentions
      let content = msg.content
        .replace(/<a?:\w+:\d+>/g, "") // custom emojis
        .replace(/<@&?\d+>/g, "")     // user/role mentions
        .replace(/https?:\/\/\S+/g, "") // URLs
        .trim();

      // Relative timestamp — no dates
      const date = new Date(msg.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffH = Math.floor(diffMs / 3600000);
      const diffD = Math.floor(diffMs / 86400000);
      const timestamp = diffH < 1
        ? "Agora há pouco"
        : diffH < 24
          ? `${diffH}h atrás`
          : `${diffD}d atrás`;

      // Get first image attachment (signed URL — works in browser with normal UA)
      const img = msg.attachments.find((a) =>
        a.content_type?.startsWith("image/"),
      );

      return {
        user: msg.author.id === URA_USER_ID
          ? "URA"
          : msg.author.global_name || msg.author.username,
        avatarUrl: avatarUrl(msg.author.id, msg.author.avatar),
        role,
        content: content || "🔥",
        timestamp,
        imageUrl: img?.url ?? null,
        imageWidth: img?.width ?? null,
        imageHeight: img?.height ?? null,
        reactions: (msg.reactions ?? [])
          .filter((r) => r.count > 0)
          .map((r) => ({ emoji: r.emoji.name, count: r.count })),
      };
    });
  } catch (err) {
    console.error("[fetchSucessoMessages] failed:", err);
    return [];
  }
}

// ── Helpers ──

async function fetchAllMembers(guildId: string): Promise<RawMember[]> {
  const all: RawMember[] = [];
  let after: string | undefined;
  for (let i = 0; i < 10; i++) {
    const url = `/guilds/${guildId}/members?limit=1000${after ? `&after=${after}` : ""}`;
    const batch = await discordFetch<RawMember[]>(url);
    all.push(...batch);
    if (batch.length < 1000) break;
    after = batch[batch.length - 1].user.id;
  }
  return all;
}

function avatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null;
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`;
}

/**
 * Status determinístico pelo user ID — mesmo membro sempre vê o mesmo
 * indicador entre renders. Se um dia tivermos Gateway + presence real,
 * trocamos por dados verdadeiros. Por ora: 70% online / 20% idle / 10% dnd,
 * mas consistente por membro.
 */
function deterministicStatus(userId: string): "online" | "idle" | "dnd" {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const r = hash % 100;
  if (r < 70) return "online";
  if (r < 90) return "idle";
  return "dnd";
}

/**
 * Fallback conservador quando a Discord API falha. Zera valores numéricos pra
 * não mostrar dados antigos como se fossem ao vivo — a UI usa a flag `fallback`
 * pra mostrar um aviso "Dados indisponíveis no momento" em vez de números falsos.
 */
function getFallbackData(): LPGuildData {
  return {
    memberCount: 0,
    onlineCount: 0,
    vipCount: 0,
    eliteCount: 0,
    channels: [
      { name: "regras", type: "text", category: "COMECE AQUI", unread: false },
      { name: "anúncios", type: "text", category: "COMECE AQUI", unread: true },
      { name: "calls-vip", type: "text", category: "URA", unread: true, active: true },
      { name: "calls-free", type: "text", category: "URA", unread: true },
      { name: "chat-geral", type: "text", category: "CHATS", unread: false },
      { name: "chat-vip", type: "text", category: "CHATS", unread: false },
      { name: "sucesso", type: "text", category: "CHATS", unread: true },
      { name: "chat-elite", type: "text", category: "ELITE", unread: false },
    ],
    onlineMembers: [],
    messages: [],
    snapshotAt: new Date().toISOString(),
    fallback: true,
  };
}
