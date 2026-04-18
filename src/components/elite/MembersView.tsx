"use client";

import { useEffect, useState } from "react";
import { Users, Zap, Flame, Search } from "lucide-react";
import { fetchDiscordMembers, type DiscordMember } from "@/lib/discord-members";
import { MemberProfileModal } from "./MemberProfileModal";

/* ────────────────────────────────────────────
   MembersView — grid completo com busca, filtro por tier e perfil clicável.
   Standalone pra reuso em /elite/membros e onde for preciso.
   ──────────────────────────────────────────── */

export function MembersView() {
  const [members, setMembers] = useState<DiscordMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "elite" | "vip">("all");
  const [profileMember, setProfileMember] = useState<DiscordMember | null>(null);

  useEffect(() => {
    fetchDiscordMembers()
      .then((data) => setMembers(data.members))
      .catch((err) => console.warn("[membros] discord fallback:", err))
      .finally(() => setLoading(false));
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

  const sorted = [...filtered].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === "elite" ? -1 : 1;
    return a.globalName.localeCompare(b.globalName);
  });

  return (
    <div className="space-y-4">
      <MemberProfileModal member={profileMember} onClose={() => setProfileMember(null)} />

      {/* Stats + filters */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTierFilter("all")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
              tierFilter === "all" ? "border-white/[0.20] bg-white/[0.05] text-white" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Users className="w-3.5 h-3.5" />
            Todos <span className="text-white/30 font-mono text-[11px]">{members.length}</span>
          </button>
          <button onClick={() => setTierFilter("elite")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
              tierFilter === "elite" ? "border-brand-500/40 bg-brand-500/[0.08] text-brand-500" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Flame className="w-3.5 h-3.5 fill-current" />
            Elite <span className={`font-mono text-[11px] ${tierFilter === "elite" ? "text-brand-500/60" : "text-white/30"}`}>{eliteCount}</span>
          </button>
          <button onClick={() => setTierFilter("vip")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
              tierFilter === "vip" ? "border-blue-500/40 bg-blue-500/[0.08] text-blue-400" : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}>
            <Zap className="w-3.5 h-3.5" />
            VIP <span className={`font-mono text-[11px] ${tierFilter === "vip" ? "text-blue-400/60" : "text-white/30"}`}>{vipCount}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar membro..."
            className="w-full md:w-64 pl-9 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/85 placeholder-white/25 focus:outline-none focus:border-white/[0.18] transition-colors" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.05] bg-[#0e0e10] p-4 animate-pulse">
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
          {sorted.map((m) => {
            const accent = m.tier === "elite" ? "#FF5500" : "#3B82F6";
            return (
              <button key={m.id} onClick={() => setProfileMember(m)}
                className="group text-left relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4 hover:border-white/[0.18] hover:-translate-y-0.5 transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                  background: `linear-gradient(90deg, transparent, ${accent}50, transparent)`,
                }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accent}12, transparent 65%)`,
                }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatarUrl} alt={m.globalName}
                      className="w-12 h-12 rounded-full object-cover"
                      style={{ border: `1.5px solid ${accent}30` }} />
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: accent + "15", color: accent }}>
                      {m.tier === "elite" ? <Flame className="w-2.5 h-2.5 fill-current" /> : <Zap className="w-2.5 h-2.5" />}
                      {m.tier === "elite" ? "Elite" : "VIP"}
                    </span>
                  </div>
                  <p className="text-[12.5px] font-bold text-white/90 tracking-tight leading-tight truncate">{m.globalName}</p>
                  <p className="text-[10.5px] text-white/35 truncate mt-0.5">@{m.username}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <p className="text-center text-[10.5px] text-white/30 font-mono">
          {sorted.length} de {members.length} membros
        </p>
      )}
    </div>
  );
}
