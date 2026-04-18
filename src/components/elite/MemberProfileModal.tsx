"use client";

import { useEffect, useState } from "react";
import { X, Flame, Zap, Calendar, ExternalLink, Trophy, Coins, Loader2 } from "lucide-react";
import type { DiscordMember } from "@/lib/discord-members";
import {
  resolveAchievements,
  RARITY_META,
  CATEGORY_META,
  type Achievement,
} from "@/lib/achievements";
import { AchievementBadge } from "./AchievementBadge";

/**
 * MemberProfileModal — puxa estado real via /api/members/[id]/profile:
 *   - achievements unlockados do DB (user_achievements, filtrados não-revogados)
 *   - saldo URA Coin (lifetime earned, usado como medidor de engajamento)
 *   - posts count do Discord (discord_activity.total_messages)
 */

type ProfileResponse = {
  user_id: string;
  balance: { balance: number; lifetime_earned: number; lifetime_spent: number };
  achievements: Array<{ achievement_id: string; unlocked_at: string; coins_granted: number; source: string }>;
  posts_count: number;
  first_message_at: string | null;
  last_message_at: string | null;
};

function formatJoined(iso: string): string {
  try {
    const d = new Date(iso);
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${months[d.getMonth()]}/${d.getFullYear()}`;
  } catch {
    return "—";
  }
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function ProfileAchievement({ achievement }: { achievement: Achievement }) {
  const rarity = RARITY_META[achievement.rarity];
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.015] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03] transition-colors">
      <AchievementBadge achievement={achievement} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] font-bold text-white/90 leading-tight truncate">{achievement.label}</p>
        <p className="text-[10px] text-white/35 truncate mt-0.5">{achievement.detail}</p>
        <span className={`inline-block mt-1 text-[8.5px] font-bold tracking-[0.15em] uppercase ${rarity.className} opacity-70`}>
          {rarity.label}
        </span>
      </div>
    </div>
  );
}

export function MemberProfileModal({ member, onClose }: { member: DiscordMember | null; onClose: () => void }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!member) return;
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [member, onClose]);

  useEffect(() => {
    if (!member) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/members/${member.id}/profile`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ProfileResponse;
        if (!cancelled) setProfile(data);
      } catch (err) {
        console.warn("[profile] failed:", err);
        // Degrada graceful — modal ainda abre com 0 achievements
        if (!cancelled)
          setProfile({
            user_id: member.id,
            balance: { balance: 0, lifetime_earned: 0, lifetime_spent: 0 },
            achievements: [],
            posts_count: 0,
            first_message_at: null,
            last_message_at: null,
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member]);

  if (!member) return null;

  const tierAccent = member.tier === "elite" ? "#FF5500" : "#3B82F6";
  const tierLabel = member.tier === "elite" ? "Elite 4.0" : "VIP";

  const achievementsIds = profile?.achievements.map((a) => a.achievement_id) ?? [];
  const achievements = resolveAchievements(achievementsIds);
  const ogBadges = achievements.filter((a) => a.category === "og");
  const restBadges = achievements.filter((a) => a.category !== "og");

  const lifetimeCoin = profile?.balance.lifetime_earned ?? 0;
  const postsCount = profile?.posts_count ?? 0;
  const daysSinceLastMsg = daysSince(profile?.last_message_at ?? null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#141417] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 80% at 75% 30%, ${tierAccent}18, transparent 65%)`,
          }} />
          <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none" style={{
            background: `linear-gradient(90deg, transparent, ${tierAccent}80, transparent)`,
          }} />

          <div className="relative z-10 p-6 pr-14 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.avatarUrl}
              alt={member.globalName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
              style={{
                border: `2px solid ${tierAccent}40`,
                boxShadow: `0 8px 32px ${tierAccent}25`,
              }}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight truncate">
                {member.globalName || member.username}
              </h2>
              <p className="text-[12px] text-white/40 truncate">@{member.username}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: tierAccent + "18",
                    color: tierAccent,
                    border: `1px solid ${tierAccent}35`,
                  }}>
                  {member.tier === "elite" ? <Flame className="w-3 h-3 fill-current" /> : <Zap className="w-3 h-3" />}
                  {tierLabel}
                </span>
                <span className="flex items-center gap-1 text-[10.5px] text-white/35">
                  <Calendar className="w-3 h-3" />
                  Desde {formatJoined(member.joinedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-b border-white/[0.05]">
          <div className="p-4 text-center">
            <p className="text-[20px] font-bold text-white font-mono leading-none">
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline text-white/30" /> : achievements.length}
            </p>
            <p className="text-[10px] text-white/40 mt-1.5 uppercase tracking-wider">Conquistas</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[20px] font-bold text-white font-mono leading-none">
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline text-white/30" /> : postsCount.toLocaleString("pt-BR")}
            </p>
            <p className="text-[10px] text-white/40 mt-1.5 uppercase tracking-wider">Posts</p>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400/70" />
              <p className="text-[20px] font-bold font-mono leading-none" style={{ color: lifetimeCoin > 0 ? tierAccent : "rgba(255,255,255,0.85)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline text-white/30" /> : lifetimeCoin.toLocaleString("pt-BR")}
              </p>
            </div>
            <p className="text-[10px] text-white/40 mt-1.5 uppercase tracking-wider">URA Coin</p>
          </div>
        </div>

        {/* Última atividade sutil */}
        {daysSinceLastMsg != null && (
          <div className="px-5 py-2 border-b border-white/[0.04] bg-white/[0.01]">
            <p className="text-[10px] text-white/30 text-center">
              Última mensagem {daysSinceLastMsg === 0 ? "hoje" : daysSinceLastMsg === 1 ? "ontem" : `há ${daysSinceLastMsg} dias`}
            </p>
          </div>
        )}

        {/* OG shelf */}
        {ogBadges.length > 0 && (
          <div className="px-5 py-5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-brand-500/60" />
              <h3 className="text-[11px] font-bold text-white/85 uppercase tracking-wider">{CATEGORY_META.og.label}</h3>
              <span className="ml-auto text-[10px] text-white/30 font-mono">{ogBadges.length}</span>
            </div>
            <div className="flex items-center justify-center gap-5 py-2 flex-wrap">
              {ogBadges.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1.5" title={`${a.label} · ${a.detail}`}>
                  <AchievementBadge achievement={a} size={64} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outras conquistas */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-3.5 h-3.5 text-yellow-500/70" />
            <h3 className="text-[11px] font-bold text-white/85 uppercase tracking-wider">Conquistas</h3>
            <span className="ml-auto text-[10px] text-white/30 font-mono">{restBadges.length}</span>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-5 h-5 text-white/30 mx-auto animate-spin" />
              <p className="text-[11px] text-white/30 mt-2">Carregando…</p>
            </div>
          ) : restBadges.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-3 opacity-40">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 mx-auto flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white/20" />
                </div>
              </div>
              <p className="text-[11px] text-white/30">Nenhuma conquista desbloqueada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {restBadges.map((a) => <ProfileAchievement key={a.id} achievement={a} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/[0.05] bg-[#0e0e10] flex items-center justify-between">
          <p className="text-[10.5px] text-white/30">
            ID <span className="font-mono text-white/50">{member.id.slice(0, 10)}…</span>
          </p>
          <a
            href={`https://discord.com/users/${member.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11.5px] font-bold text-white/60 hover:text-white transition-colors"
          >
            Abrir no Discord
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
