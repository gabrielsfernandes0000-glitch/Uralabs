"use client";

import { useEffect, useState } from "react";
import { Users, Zap, Flame, Search, MessageCircle, Trophy, Coins } from "lucide-react";
import { fetchDiscordMembers, type DiscordMember } from "@/lib/discord-members";
import { MemberProfileModal } from "./MemberProfileModal";

type SortBy = "default" | "messages" | "achievements" | "coins";

const PAGE_SIZE = 24;

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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold ${
              tierFilter === "all" ? "border-white/[0.22] text-white" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Users className="w-3.5 h-3.5" />
            Todos <span className="text-white/30 font-mono text-[11px]">{members.length}</span>
          </button>
          <button onClick={() => setTierFilter("elite")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold ${
              tierFilter === "elite" ? "border-brand-500/50 text-brand-500" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Flame className="w-3.5 h-3.5 fill-current" />
            Elite <span className={`font-mono text-[11px] ${tierFilter === "elite" ? "text-brand-500/60" : "text-white/30"}`}>{eliteCount}</span>
          </button>
          <button onClick={() => setTierFilter("vip")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold ${
              tierFilter === "vip" ? "border-blue-500/50 text-blue-400" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Zap className="w-3.5 h-3.5" />
            VIP <span className={`font-mono text-[11px] ${tierFilter === "vip" ? "text-blue-400/60" : "text-white/30"}`}>{vipCount}</span>
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
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mr-1">Ordenar</span>
        {(["default", "messages", "achievements", "coins"] as SortBy[]).map((opt) => {
          const active = sortBy === opt;
          const Icon = opt === "messages" ? MessageCircle : opt === "achievements" ? Trophy : opt === "coins" ? Coins : Users;
          return (
            <button key={opt} onClick={() => setSortBy(opt)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold ${
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.05] bg-[#0e0e10] p-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] mb-3" />
              <div className="h-3 bg-white/[0.04] rounded w-20 mb-2" />
              <div className="h-2.5 bg-white/[0.04] rounded w-16" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] py-16 text-center">
          <Users className="w-6 h-6 text-white/20 mx-auto mb-3" />
          <p className="text-[12px] text-white/40">Nenhum membro encontrado com &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleMembers.map((m) => {
            const accent = m.tier === "elite" ? "#FF5500" : "#3B82F6";
            const isMe = myId != null && m.id === myId;
            const rank = showRank ? rankOf.get(m.id) ?? null : null;
            const scoreValue =
              sortBy === "messages" ? m.messageCount ?? 0
              : sortBy === "achievements" ? m.achievementCount ?? 0
              : sortBy === "coins" ? m.coinLifetime ?? 0
              : null;
            const medalColor = rank === 1 ? "#F59E0B" : rank === 2 ? "#D1D5DB" : rank === 3 ? "#CD7F32" : null;
            return (
              <button
                key={m.id}
                onClick={() => setProfileMember(m)}
                className={`text-left relative overflow-hidden rounded-xl border bg-[#0e0e10] min-h-[160px] flex flex-col ${
                  isMe
                    ? "border-brand-500/40 ring-1 ring-brand-500/20 hover:border-brand-500/60"
                    : "border-white/[0.06] hover:border-white/[0.20]"
                }`}
              >
                {/* "Você" badge no próprio card */}
                {isMe && (
                  <span className="absolute top-2.5 left-2.5 z-20 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-500">
                    Você
                  </span>
                )}

                {/* Rank badge — top 3 tem medalha (gold/silver/bronze), resto mostra #N */}
                {rank != null && !isMe && (
                  <span
                    className="absolute top-2.5 left-2.5 z-20 min-w-[22px] h-5 px-1.5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono"
                    style={medalColor
                      ? { backgroundColor: medalColor + "25", color: medalColor, border: `1px solid ${medalColor}55` }
                      : { backgroundColor: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    #{rank}
                  </span>
                )}
                {rank != null && isMe && (
                  <span className="absolute top-2.5 right-2.5 z-20 min-w-[22px] h-5 px-1.5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono bg-black/55 text-white/75 border border-white/[0.12]">
                    #{rank}
                  </span>
                )}

                {/* Banner simples por tier (sem cosméticos) */}
                <div className="relative h-[55px] overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${accent}20 0%, transparent 70%)` }}
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(to bottom, transparent 0%, rgba(14,14,16,0.4) 70%, #0e0e10 100%)",
                  }} />
                </div>

                <div className="relative z-10 px-4 pb-4 -mt-8 flex-1 flex flex-col">
                  <div className="flex items-end justify-between mb-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatarUrl} alt={m.globalName}
                      loading="lazy" decoding="async"
                      className="w-12 h-12 rounded-full object-cover relative"
                      style={{ border: `2px solid #0e0e10`, boxShadow: `0 0 0 1.5px ${accent}50` }} />
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: accent }}>
                      {m.tier === "elite" ? <Flame className="w-2.5 h-2.5" strokeWidth={2} /> : <Zap className="w-2.5 h-2.5" strokeWidth={2} />}
                      {m.tier === "elite" ? "Elite" : "VIP"}
                    </span>
                  </div>
                  <p className="text-[12.5px] font-bold text-white/90 tracking-tight leading-tight truncate">{m.globalName}</p>
                  <p className="text-[10.5px] text-white/35 truncate mt-0.5">@{m.username}</p>

                  {/* Score visível quando sort ativo */}
                  {scoreValue != null && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-mono">
                      {sortBy === "messages" && <MessageCircle className="w-3 h-3 text-cyan-400/70" />}
                      {sortBy === "achievements" && <Trophy className="w-3 h-3 text-amber-400/70" />}
                      {sortBy === "coins" && <Coins className="w-3 h-3 text-amber-400/70" />}
                      <span className="font-bold text-white/75">{scoreValue.toLocaleString("pt-BR")}</span>
                      <span className="text-white/30">{sortBy === "messages" ? "msgs" : sortBy === "achievements" ? "badges" : "coin"}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[12px] font-semibold text-white/70 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.04]"
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
