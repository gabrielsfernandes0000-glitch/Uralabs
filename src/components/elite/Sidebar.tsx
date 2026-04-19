"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Lock, Radio, Search, ChevronDown,
  LayoutDashboard, BookOpen, Crosshair, Trophy, Users, BarChart3, Newspaper, Gift, NotebookPen,
  MessageCircle, Activity, Globe, type LucideIcon,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Avatar } from "@/components/elite/Avatar";
import { CosmeticBanner, isBannerSlug } from "@/components/elite/CosmeticBanner";
import { AvatarWithCosmetics } from "@/components/elite/AvatarCosmetics";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";

type NavChild = { href: string; label: string; icon: LucideIcon; queryKey?: string; queryValue?: string };
type NavItem = { href: string; icon: LucideIcon; label: string; exact?: boolean; eliteOnly?: boolean; children?: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  { href: "/elite",            icon: LayoutDashboard, label: "Dashboard",  exact: true },
  { href: "/elite/membros",    icon: Users,           label: "Membros" },
  { href: "/elite/calls",      icon: Radio,           label: "Calls",      eliteOnly: true },
  { href: "/elite/aulas",      icon: BookOpen,        label: "Aulas" },
  { href: "/elite/pratica",    icon: Crosshair,       label: "Prática",    eliteOnly: true },
  { href: "/elite/diario",     icon: NotebookPen,     label: "Diário",     eliteOnly: true },
  { href: "/elite/noticias",   icon: Globe,           label: "Notícias" },
  {
    href: "/elite/turma",
    icon: Newspaper,
    label: "Mural",
    children: [
      { href: "/elite/turma?view=mural",   label: "Feed",        icon: Newspaper,      queryKey: "view", queryValue: "mural"   },
      { href: "/elite/turma?view=review",  label: "Peer Review", icon: MessageCircle,  queryKey: "view", queryValue: "review"  },
      { href: "/elite/turma?view=ranking", label: "Ranking",     icon: Activity,       queryKey: "view", queryValue: "ranking" },
    ],
  },
  { href: "/elite/conquistas", icon: Trophy,          label: "Conquistas" },
  { href: "/elite/loja",       icon: Gift,            label: "Loja" },
  { href: "/elite/corretora",  icon: BarChart3,       label: "Corretora",  eliteOnly: true },
];

/* ────────────────────────────────────────────
   NavMenu — nav completa, isolada em Suspense porque usa useSearchParams.
   Grupos (item.children) expandem automaticamente quando a rota atual bate.
   ──────────────────────────────────────────── */

function NavMenu({
  pathname,
  isElite,
  onNavigate,
}: {
  pathname: string;
  isElite: boolean;
  onNavigate: () => void;
}) {
  const searchParams = useSearchParams();
  return (
    <nav className="flex-1 py-5 px-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) =>
        item.children ? (
          <NavGroup
            key={item.href}
            item={item}
            pathname={pathname}
            searchParams={searchParams}
            isElite={isElite}
            onNavigate={onNavigate}
          />
        ) : (
          <NavRow
            key={item.href}
            item={item}
            pathname={pathname}
            isElite={isElite}
            onNavigate={onNavigate}
          />
        )
      )}
    </nav>
  );
}

function NavRow({
  item,
  pathname,
  isElite,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  isElite: boolean;
  onNavigate: () => void;
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  const locked = Boolean(item.eliteOnly && !isElite);
  const href = locked ? "/elite/desbloquear" : item.href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
        isActive ? "text-white" : locked ? "text-white/25 hover:text-white/50 hover:bg-white/[0.02]" : "text-white/35 hover:text-white/70 hover:bg-white/[0.02]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/[0.08]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-500 rounded-r-full shadow-[0_0_12px_rgba(255,85,0,0.5)]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <Icon className={`relative w-[18px] h-[18px] transition-all ${
        isActive ? "text-brand-500" : "text-white/25 group-hover:text-white/50"
      }`} />
      <span className="relative font-medium flex-1">{item.label}</span>
      {locked && <Lock className="relative w-3 h-3 text-white/20" />}
    </Link>
  );
}

function NavGroup({
  item,
  pathname,
  searchParams,
  isElite,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  searchParams: URLSearchParams;
  isElite: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const locked = Boolean(item.eliteOnly && !isElite);
  const href = locked ? "/elite/desbloquear" : item.href;
  const onParent = pathname === item.href || pathname.startsWith(item.href + "/");
  const isActive = onParent;

  // Auto-expande ao entrar no grupo; clicar no parent (ou na seta) alterna.
  const [expanded, setExpanded] = useState(onParent);
  useEffect(() => {
    if (onParent) setExpanded(true);
  }, [onParent]);
  const toggle = () => setExpanded((v) => !v);

  return (
    <div>
      <div className="relative flex items-center">
        <Link
          href={href}
          onClick={() => { toggle(); onNavigate(); }}
          className={`flex-1 relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
            isActive ? "text-white" : locked ? "text-white/25 hover:text-white/50 hover:bg-white/[0.02]" : "text-white/35 hover:text-white/70 hover:bg-white/[0.02]"
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/[0.08]"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-500 rounded-r-full shadow-[0_0_12px_rgba(255,85,0,0.5)]"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <Icon className={`relative w-[18px] h-[18px] transition-all ${
            isActive ? "text-brand-500" : "text-white/25 group-hover:text-white/50"
          }`} />
          <span className="relative font-medium flex-1">{item.label}</span>
          {locked && <Lock className="relative w-3 h-3 text-white/20" />}
        </Link>
        <button
          type="button"
          aria-label={expanded ? "Recolher" : "Expandir"}
          onClick={toggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-colors z-10"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="ml-[30px] pl-3 py-1 border-l border-white/[0.06] space-y-0.5">
              {item.children!.map((child) => {
                const currentValue = child.queryKey ? (searchParams.get(child.queryKey) ?? child.queryValue) : null;
                // Para o Mural: view=mural é default mesmo sem query
                const isDefault = child.queryValue === "mural" && !searchParams.get(child.queryKey || "");
                const childActive =
                  pathname === item.href &&
                  (isDefault || currentValue === child.queryValue);
                const ChildIcon = child.icon;
                return (
                  <li key={child.href}>
                    <Link
                      href={locked ? "/elite/desbloquear" : child.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors ${
                        childActive
                          ? "text-white bg-white/[0.04]"
                          : "text-white/35 hover:text-white/75 hover:bg-white/[0.02]"
                      }`}
                    >
                      <ChildIcon className={`w-3.5 h-3.5 ${childActive ? "text-brand-500" : "text-white/25"}`} />
                      <span>{child.label}</span>
                    </Link>
                  </li>
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

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
            <CosmeticBanner slug={bannerSlug} variant="sidebar" animated="always" />
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="px-7 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 bg-brand-500/20 rounded-full blur-lg" />
                  <Image
                    src="/brand/ura-labs-logo.png"
                    alt="URA Labs"
                    width={44}
                    height={44}
                    priority
                    className="relative w-11 h-11 drop-shadow-[0_4px_12px_rgba(255,85,0,0.3)]"
                  />
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

          {/* Quick search trigger — dispara Cmd+K programaticamente */}
          <div className="px-4 pt-4">
            <button
              onClick={() => {
                const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);
                window.dispatchEvent(new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: isMac,
                  ctrlKey: !isMac,
                  bubbles: true,
                }));
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all text-white/40 hover:text-white/70 group"
              title="Buscar aulas, treinos e páginas"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[12px] flex-1 text-left">Buscar…</span>
              <kbd className="text-[9px] font-mono text-white/35 border border-white/[0.10] rounded px-1 py-0.5">⌘K</kbd>
            </button>
          </div>

          {/* Navigation — `useSearchParams` exige Suspense boundary no Next 16 */}
          <Suspense fallback={<nav className="flex-1" />}>
            <NavMenu
              pathname={pathname}
              isElite={session.isElite}
              onNavigate={() => setMobileOpen(false)}
            />
          </Suspense>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          {/* Coin balance pill */}
          {typeof coinBalance === "number" && (
            <Link
              href="/elite/loja"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mb-2 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 hover:bg-amber-500/[0.08] hover:border-amber-500/30 transition-all"
            >
              <UraCoinIcon className="w-4 h-4" />
              <span className="text-[12px] font-semibold tabular-nums text-amber-200">
                {coinBalance.toLocaleString("pt-BR")}
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30 ml-auto">
                URA Coin
              </span>
            </Link>
          )}

          {/* User — avatar + nome clicáveis → /elite/perfil (personalização) */}
          <div className="p-4">
            <div className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.05] hover:border-white/[0.08] transition-all">
              <Link
                href="/elite/perfil"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 flex-1 min-w-0 px-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                title="Editar perfil e cosméticos"
              >
                <div className="relative">
                  {frameSlug || effectSlug ? (
                    <AvatarWithCosmetics
                      src={avatar} name={displayName} size={36}
                      frameSlug={frameSlug} auraSlug={effectSlug}
                      animated="always"
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
              </Link>
              <a href="/api/auth/logout" className="p-2 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/[0.06] transition-all shrink-0" title="Sair">
                <LogOut className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
