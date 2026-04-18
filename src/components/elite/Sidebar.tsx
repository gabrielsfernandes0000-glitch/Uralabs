"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame, Menu, X, LogOut, Lock, Radio,
  LayoutDashboard, BookOpen, Crosshair, Trophy, Users, BarChart3, Newspaper, Gift, Coins,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Avatar } from "@/components/elite/Avatar";
import { CosmeticBanner, isBannerSlug } from "@/components/elite/CosmeticBanner";
import { AvatarWithCosmetics } from "@/components/elite/AvatarCosmetics";

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; exact?: boolean; eliteOnly?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/elite",            icon: LayoutDashboard, label: "Dashboard",  exact: true },
  { href: "/elite/aulas",      icon: BookOpen,        label: "Aulas" },
  { href: "/elite/turma",      icon: Newspaper,       label: "Mural" },
  { href: "/elite/membros",    icon: Users,           label: "Membros" },
  { href: "/elite/conquistas", icon: Trophy,          label: "Conquistas" },
  { href: "/elite/loja",       icon: Gift,            label: "Loja" },
  { href: "/elite/calls",      icon: Radio,           label: "Calls",      eliteOnly: true },
  { href: "/elite/pratica",    icon: Crosshair,       label: "Prática",    eliteOnly: true },
  { href: "/elite/corretora",  icon: BarChart3,       label: "Corretora",  eliteOnly: true },
];

export function EliteSidebar({
  session,
  coinBalance,
  bannerSlug,
  frameSlug,
  effectSlug,
}: {
  session: SessionPayload;
  coinBalance?: number;
  bannerSlug?: string | null;
  frameSlug?: string | null;
  effectSlug?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatar = avatarUrl(session.userId, session.avatar, 64);
  const displayName = session.globalName || session.username;
  const hasBanner = isBannerSlug(bannerSlug);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/[0.06] rounded-xl text-white/40 hover:text-white transition-all shadow-2xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[272px] z-50 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Background */}
        <div className="absolute inset-0 bg-[#0a0a0c] border-r border-white/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/[0.03] via-transparent to-transparent" />
        {hasBanner && (
          <div
            className="absolute top-0 left-0 right-0 h-[220px] pointer-events-none opacity-50"
            style={{ maskImage: "linear-gradient(to bottom, black 30%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent)" }}
          >
            <CosmeticBanner slug={bannerSlug} variant="sidebar" interactive={false} />
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="px-7 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-brand-500/20 rounded-xl blur-lg" />
                  <div className="relative p-2.5 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl shadow-lg shadow-brand-500/20">
                    <Flame className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div>
                  <span className="text-[18px] font-bold text-white tracking-tight">URA <span className="text-brand-500">LABS</span></span>
                  <span className="block text-[8px] text-white/25 font-semibold tracking-[0.3em] uppercase mt-0.5">Elite Platform</span>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Navigation */}
          <nav className="flex-1 py-5 px-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const locked = Boolean(item.eliteOnly && !session.isElite);
              const href = locked ? "/elite/desbloquear" : item.href;

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
                    isActive ? "text-white" : locked ? "text-white/25 hover:text-white/50 hover:bg-white/[0.02]" : "text-white/35 hover:text-white/70 hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Active background — slides between items */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/[0.08]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Active indicator — slides between items */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-500 rounded-r-full shadow-[0_0_12px_rgba(255,85,0,0.5)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon className={`relative w-[18px] h-[18px] transition-all ${
                    isActive
                      ? "text-brand-500"
                      : "text-white/25 group-hover:text-white/50"
                  }`} />

                  <span className="relative font-medium flex-1">{item.label}</span>

                  {/* Lock badge for VIPs on Elite-only items */}
                  {locked && (
                    <Lock className="relative w-3 h-3 text-white/20" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          {/* Coin balance pill */}
          {typeof coinBalance === "number" && (
            <Link
              href="/elite/loja"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mb-2 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 hover:bg-amber-500/[0.08] hover:border-amber-500/30 transition-all"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-[12px] font-semibold tabular-nums text-amber-200">
                {coinBalance.toLocaleString("pt-BR")}
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30 ml-auto">
                URA Coin
              </span>
            </Link>
          )}

          {/* User */}
          <div className="p-4">
            <div className="flex items-center gap-3 px-3.5 py-3.5 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.05] hover:border-white/[0.08] transition-all">
              <div className="relative">
                {frameSlug || effectSlug ? (
                  <AvatarWithCosmetics
                    src={avatar} name={displayName} size={36}
                    frameSlug={frameSlug} auraSlug={effectSlug}
                  />
                ) : (
                  <Avatar src={avatar} name={displayName} size={36} className="rounded-lg" />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a0c] z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/80 truncate">{displayName}</p>
                <p className={`text-[9px] font-bold tracking-[0.15em] uppercase ${session.isElite ? "text-brand-500/60" : "text-blue-500/60"}`}>
                  {session.isElite ? "Elite 4.0" : "VIP"}
                </p>
              </div>
              <a href="/api/auth/logout" className="p-2 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/[0.06] transition-all" title="Sair">
                <LogOut className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
