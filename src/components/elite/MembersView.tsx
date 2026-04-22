"use client";

import { useEffect, useState } from "react";
import { Users, Zap, Flame, Search, MessageCircle, Trophy, Coins } from "lucide-react";
import { fetchDiscordMembers, type DiscordMember } from "@/lib/discord-members";
import { MemberProfileModal } from "./MemberProfileModal";

type SortBy = "default" | "messages" | "achievements" | "coins";

// Comunidade pequena (<100): carregamos tudo de cara. Paginar 48 em 48 numa
// lista de 89 só força scroll pra clicar "Mostrar mais" — user perde o fluxo.
const PAGE_SIZE = 120;

const SORT_META: Record<SortBy, { label: string; short: string }> = {
  default:      { label: "Padrão",      short: "Elite primeiro · mais antigos no topo" },
  messages:     { label: "Mensagens",   short: "Quem mais fala no Discord" },
  achievements: { label: "Conquistas",  short: "Quem mais desbloqueou badges" },
  coins:        { label: "URA Coin",    short: "Quem mais ganhou coin" },
};

/* ────────────────────────────────────────────
   MembersView — grid completo com busca, filtro por tier e perfil clicável.
   Standalone pra reuso em /elite/membros e onde for preciso.
   ──────────────────────────────────────────── */

export function MembersView() {
  const [members, setMembers] = useState<DiscordMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "elite" | "vip">("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [profileMember, setProfileMember] = useState<DiscordMember | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reseta reveal quando muda filtro/busca/sort — senão "Mostrar mais" fica incoerente.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, tierFilter, sortBy]);

  useEffect(() => {
    fetchDiscordMembers()
      .then((data) => setMembers(data.members))
      .catch((err) => console.warn("[membros] discord fallback:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.userId) setMyId(String(d.userId)); })
      .catch(() => {});
  }, []);

  const eliteCount = members.filter((m) => m.tier === "elite").length;
  const vipCount = members.filter((m) => m.tier === "vip").length;

  const filtered = members.filter((m) => {
    if (tierFilter !== "all" && m.tier !== tierFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      m.globalName.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q) ||
      (m.nick || "").toLowerCase().includes(q)
    );
  });

  // Comparador puro pelo critério — sem sticky do próprio user.
  // Usado pra calcular o rank real de cada membro.
  const comparator = (a: DiscordMember, b: DiscordMember) => {
    if (sortBy === "messages") {
      const diff = (b.messageCount ?? 0) - (a.messageCount ?? 0);
      if (diff !== 0) return diff;
    } else if (sortBy === "achievements") {
      const diff = (b.achievementCount ?? 0) - (a.achievementCount ?? 0);
      if (diff !== 0) return diff;
    } else if (sortBy === "coins") {
      const diff = (b.coinLifetime ?? 0) - (a.coinLifetime ?? 0);
      if (diff !== 0) return diff;
    } else {
      if (a.tier !== b.tier) return a.tier === "elite" ? -1 : 1;
      return a.joinedAt.localeCompare(b.joinedAt);
    }
    return a.globalName.localeCompare(b.globalName);
  };

  // Rank real (posição natural) — ignora sticky do próprio user.
  const rankedByScore = [...filtered].sort(comparator);
  const rankOf = new Map<string, number>();
  rankedByScore.forEach((m, i) => rankOf.set(m.id, i + 1));

  // Ordem de display: próprio user sempre no topo, resto pelo critério.
  const sorted = [...filtered].sort((a, b) => {
    if (myId) {
      if (a.id === myId) return -1;
      if (b.id === myId) return 1;
    }
    return comparator(a, b);
  });

  const showRank = sortBy !== "default";
  const visibleMembers = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visibleCount;

  return (
    <div className="space-y-4">
      <MemberProfileModal member={profileMember} onClose={() => setProfileMember(null)} />

      {/* Stats + filters */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTierFilter("all")}
            className={`interactive-tap flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold ${
              tierFilter === "all" ? "border-white/[0.22] text-white" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Users className="w-3.5 h-3.5" />
            Todos <span className="text-white/30 font-mono text-[11px]">{members.length}</span>
          </button>
          <button onClick={() => setTierFilter("elite")}
            className={`interactive-tap flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold ${
              tierFilter === "elite" ? "border-brand-500/50 text-brand-500" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Flame className="w-3.5 h-3.5 fill-current" />
            Elite <span className={`font-mono text-[11px] ${tierFilter === "elite" ? "text-brand-500/60" : "text-white/30"}`}>{eliteCount}</span>
          </button>
          <button onClick={() => setTierFilter("vip")}
            className={`interactive-tap flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold ${
              tierFilter === "vip" ? "border-white/[0.22] text-white" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Zap className="w-3.5 h-3.5" />
            VIP <span className={`font-mono text-[11px] ${tierFilter === "vip" ? "text-white/55" : "text-white/30"}`}>{vipCount}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar membro..."
            className="w-full md:w-64 pl-9 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/85 placeholder-white/25 focus:outline-none focus:border-white/[0.18]" />
        </div>
      </div>

      {/* Sort chips — ranking */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-white/30 mr-1">Ordenar</span>
        {(["default", "messages", "achievements", "coins"] as SortBy[]).map((opt) => {
          const active = sortBy === opt;
          const Icon = opt === "messages" ? MessageCircle : opt === "achievements" ? Trophy : opt === "coins" ? Coins : Users;
          return (
            <button key={opt} onClick={() => setSortBy(opt)}
              className={`interactive-tap flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold ${
                active
                  ? "border-white/[0.22] text-white"
                  : "border-white/[0.05] text-white/35 hover:text-white/65 hover:border-white/[0.12]"
              }`}
              title={SORT_META[opt].short}>
              <Icon className="w-3 h-3" />
              {SORT_META[opt].label}
            </button>
          );
        })}
      </div>

      {/* Grid compacto — cards horizontais, densidade alta em 1920+ */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 min-[1800px]:grid-cols-8 min-[2100px]:grid-cols-9 min-[2400px]:grid-cols-10 min-[2800px]:grid-cols-12 gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.05] bg-[#0e0e10] p-3 flex items-center gap-3 h-[72px]">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3 bg-white/[0.04] rounded w-20" />
                <div className="h-2 bg-white/[0.04] rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] py-16 text-center">
          <Users className="w-6 h-6 text-white/20 mx-auto mb-3" />
          <p className="text-[12px] text-white/40">Nenhum membro encontrado com &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 min-[1800px]:grid-cols-8 min-[2100px]:grid-cols-9 min-[2400px]:grid-cols-10 min-[2800px]:grid-cols-12 gap-2">
          {visibleMembers.map((m) => {
            const isElite = m.tier === "elite";
            const tierDot = isElite ? "bg-brand-500" : "bg-blue-400";
            const isMe = myId != null && m.id === myId;
            const rank = showRank ? rankOf.get(m.id) ?? null : null;
            const scoreValue =
              sortBy === "messages" ? m.messageCount ?? 0
              : sortBy === "achievements" ? m.achievementCount ?? 0
              : sortBy === "coins" ? m.coinLifetime ?? 0
              : null;
            const isMedalist = rank === 1 || rank === 2 || rank === 3;
            return (
              <button
                key={m.id}
                onClick={() => setProfileMember(m)}
                className={`interactive text-left relative rounded-xl border bg-[#0e0e10] h-[72px] px-3 flex items-center gap-3 ${
                  isMe
                    ? "border-brand-500/40 hover:border-brand-500/60"
                    : "border-white/[0.06] hover:border-white/[0.18]"
                }`}
                title={`${m.globalName} · @${m.username}${isElite ? " · Elite" : " · VIP"}`}
              >
                {/* Avatar — tier como ring 1px em vez de pill colorida */}
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.avatarUrl} alt={m.globalName}
                    loading="lazy" decoding="async"
                    className="w-10 h-10 rounded-full object-cover" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0e0e10] ${tierDot}`}
                    aria-label={isElite ? "Elite" : "VIP"}
                  />
                </div>

                {/* Nome + @ + score opcional */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold text-white/90 truncate">{m.globalName}</p>
                    {isMe && (
                      <span className="text-[9px] font-semibold text-brand-500 shrink-0">· você</span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-white/35 truncate">@{m.username}</p>
                  {scoreValue != null && (
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] font-mono">
                      {sortBy === "messages" && <MessageCircle className="w-2.5 h-2.5 text-white/45" />}
                      {sortBy === "achievements" && <Trophy className="w-2.5 h-2.5 text-white/45" />}
                      {sortBy === "coins" && <Coins className="w-2.5 h-2.5 text-amber-300/80" />}
                      <span className="font-semibold text-white/70">{scoreValue.toLocaleString("pt-BR")}</span>
                      <span className="text-white/30 text-[9.5px]">{sortBy === "messages" ? "msgs" : sortBy === "achievements" ? "badges" : "coin"}</span>
                    </div>
                  )}
                </div>

                {/* Rank — só quando sort ativo. Top 3 em brand; resto em cinza */}
                {rank != null && (
                  <span
                    className={`shrink-0 text-[10.5px] font-mono font-semibold tabular-nums ${
                      isMedalist ? "text-brand-400" : "text-white/35"
                    }`}
                  >
                    #{rank}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="interactive-tap px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[12px] font-semibold text-white/70 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.04]"
          >
            Mostrar mais <span className="text-white/35 font-mono text-[11px] ml-1">+{Math.min(PAGE_SIZE, sorted.length - visibleCount)}</span>
          </button>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <p className="text-center text-[10.5px] text-white/30 font-mono">
          {visibleMembers.length} de {sorted.length}
          {sorted.length !== members.length && <span className="text-white/20"> · {members.length} total</span>}
        </p>
      )}
    </div>
  );
}
