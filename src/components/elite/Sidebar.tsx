"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Lock, Radio, ChevronDown,
  LayoutDashboard, BookOpen, Crosshair, Trophy, Users, BarChart3, Gift, NotebookPen,
  Globe, LineChart, type LucideIcon,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Avatar } from "@/components/elite/Avatar";
import { AvatarWithCosmetics } from "@/components/elite/AvatarCosmetics";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";

type NavChild = { href: string; label: string; icon: LucideIcon; queryKey?: string; queryValue?: string };
type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
  eliteOnly?: boolean;
  /** Se true, esconde o item para não-admin. Usado pra ocultar áreas em construção
   *  durante demos pra founders (Loja/Conquistas/Diário). */
  adminOnly?: boolean;
  children?: NavChild[];
  /** Quando o item é identificado por query param (ex: /elite/turma?view=mural). */
  queryKey?: string;
  queryValue?: string;
  /** Se true, este item fica ativo também quando o queryKey está ausente da URL. */
  queryIsDefault?: boolean;
};
type NavSection = { label: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Dia a dia",
    items: [
      { href: "/elite",           icon: LayoutDashboard, label: "Dashboard",  exact: true },
      { href: "/elite/corretora", icon: BarChart3,       label: "Corretora",  eliteOnly: true },
      { href: "/elite/calls",     icon: Radio,           label: "Calls",      eliteOnly: true },
      { href: "/elite/graficos",  icon: LineChart,       label: "Gráficos" },
      { href: "/elite/aulas",     icon: BookOpen,        label: "Aulas" },
      { href: "/elite/pratica",   icon: Crosshair,       label: "Prática",    eliteOnly: true },
      { href: "/elite/diario",    icon: NotebookPen,     label: "Diário",     eliteOnly: true, adminOnly: true },
      { href: "/elite/noticias",  icon: Globe,           label: "Notícias" },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { href: "/elite/membros", icon: Users, label: "Membros" },
    ],
  },
  {
    label: "Conta",
    items: [
      { href: "/elite/conquistas", icon: Trophy, label: "Conquistas", adminOnly: true },
      { href: "/elite/loja",       icon: Gift,   label: "Loja",       adminOnly: true },
    ],
  },
];

/**
 * Resolve path base (sem query) pra comparar com pathname.
 * Ex: "/elite/turma?view=mural" → "/elite/turma"
 */
function pathOnly(href: string): string {
  const q = href.indexOf("?");
  return q >= 0 ? href.slice(0, q) : href;
}

/* ────────────────────────────────────────────
   NavMenu — nav completa, isolada em Suspense porque usa useSearchParams.
   Grupos (item.children) expandem automaticamente quando a rota atual bate.
   ──────────────────────────────────────────── */

function NavMenu({
  pathname,
  isElite,
  isAdmin,
  onNavigate,
}: {
  pathname: string;
  isElite: boolean;
  isAdmin: boolean;
  onNavigate: () => void;
}) {
  const searchParams = useSearchParams();
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => isAdmin || !item.adminOnly),
  })).filter((section) => section.items.length > 0);

  return (
    <nav className="flex-1 py-3 px-4 overflow-y-auto">
      {sections.map((section, idx) => (
        <div key={section.label} className={idx > 0 ? "mt-4 pt-3 border-t border-white/[0.04]" : ""}>
          <p className="px-4 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-white/35">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) =>
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
                  searchParams={searchParams}
                  isElite={isElite}
                  onNavigate={onNavigate}
                />
              )
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}

function NavRow({
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
  const router = useRouter();
  const basePath = pathOnly(item.href);
  const onBase = item.exact
    ? pathname === basePath
    : pathname === basePath || pathname.startsWith(basePath + "/");
  // Se o item tem queryKey/value, precisa bater com o searchParam atual (ou ser o default quando param ausente).
  let isActive = onBase;
  if (isActive && item.queryKey) {
    const current = searchParams.get(item.queryKey);
    if (current) {
      isActive = current === item.queryValue;
    } else {
      isActive = !!item.queryIsDefault;
    }
  }
  const Icon = item.icon;
  const locked = Boolean(item.eliteOnly && !isElite);
  const href = locked ? "/elite/desbloquear" : item.href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      onMouseEnter={() => router.prefetch(href)}
      // touchstart prefetch — mobile não tem hover, então prefetch dispara
      // no início do toque (uns 100-300ms antes do click). Ganho real na
      // sensação de "instantâneo" no celular.
      onTouchStart={() => router.prefetch(href)}
      className={`relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
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
  const router = useRouter();
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
          onMouseEnter={() => router.prefetch(href)}
          onTouchStart={() => router.prefetch(href)}
          className={`flex-1 relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
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
  isAdmin = false,
}: {
  session: SessionPayload;
  coinBalance?: number;
  bannerSlug?: string | null;
  frameSlug?: string | null;
  effectSlug?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatar = avatarUrl(session.userId, session.avatar, 64);
  const displayName = session.globalName || session.username;

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

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="px-7 pt-6 pb-4">
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

          {/* Busca: trigger visual removido pra liberar espaço vertical; Cmd/Ctrl+K
              segue funcional (listener global registrado pelo CommandPalette). */}

          {/* Navigation — `useSearchParams` exige Suspense boundary no Next 16 */}
          <Suspense fallback={<nav className="flex-1" />}>
            <NavMenu
              pathname={pathname}
              isElite={session.isElite}
              isAdmin={isAdmin}
              onNavigate={() => setMobileOpen(false)}
            />
          </Suspense>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          {/* Coin balance pill — escondido pra não-admin enquanto Loja está oculta */}
          {isAdmin && typeof coinBalance === "number" && (
            <Link
              href="/elite/loja"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mb-1.5 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] hover:border-white/[0.18] transition-colors"
            >
              <UraCoinIcon className="w-4 h-4" />
              <span className="text-[12px] font-semibold tabular-nums text-amber-300">
                {coinBalance.toLocaleString("pt-BR")}
              </span>
              <span className="text-[10px] text-white/30 ml-auto">
                URA Coin
              </span>
            </Link>
          )}

          {/* User — avatar + nome clicáveis → /elite/perfil (personalização) */}
          <div className="p-3">
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
                  <p className={`text-[11px] font-medium ${session.isElite ? "text-brand-500/70" : "text-white/45"}`}>
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
