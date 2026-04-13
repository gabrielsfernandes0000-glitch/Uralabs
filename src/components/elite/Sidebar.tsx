"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, X, LogOut } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";

const NAV_ITEMS = [
  { href: "/elite", letter: "D", label: "Dashboard", exact: true },
  { href: "/elite/aulas", letter: "A", label: "Aulas", exact: false },
  { href: "/elite/pratica", letter: "P", label: "Prática", exact: false },
  { href: "/elite/conquistas", letter: "C", label: "Conquistas", exact: false },
  { href: "/elite/turma", letter: "T", label: "Turma", exact: false },
];

export function EliteSidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatar = avatarUrl(session.userId, session.avatar, 64);
  const displayName = session.globalName || session.username;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#060810]/90 backdrop-blur-xl border border-white/[0.06] rounded-xl text-white/40 hover:text-white transition-all shadow-2xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[272px] z-50 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Layered background */}
        <div className="absolute inset-0 bg-[#060810] border-r border-white/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/[0.02] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="px-7 pt-8 pb-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-brand-500/20 rounded-xl blur-lg" />
                  <div className="relative p-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl">
                    <Flame className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div>
                  <span className="text-[17px] font-bold text-white tracking-tight">URA <span className="text-brand-500">LABS</span></span>
                  <span className="block text-[8px] text-white/20 font-semibold tracking-[0.3em] uppercase">Elite Platform</span>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Navigation — monogram style */}
          <nav className="flex-1 py-6 px-5 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 group overflow-hidden ${
                    isActive ? "text-white" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {/* Active state */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-white/[0.04] rounded-xl" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full shadow-[0_0_12px_rgba(255,85,0,0.4)]" />
                    </>
                  )}

                  {/* Monogram */}
                  <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold tracking-wider transition-all ${
                    isActive
                      ? "bg-brand-500/15 text-brand-500 shadow-[0_0_16px_rgba(255,85,0,0.15)]"
                      : "bg-white/[0.03] text-white/20 group-hover:bg-white/[0.05] group-hover:text-white/40"
                  }`}>
                    {item.letter}
                  </div>

                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          {/* User */}
          <div className="p-5">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={displayName} className="w-8 h-8 rounded-lg object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#060810]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/70 truncate">{displayName}</p>
                <p className="text-[9px] text-brand-500/50 font-semibold tracking-wider uppercase">Turma 4.0</p>
              </div>
              <a href="/api/auth/logout" className="p-1.5 rounded-lg text-white/15 hover:text-red-400 transition-all" title="Sair">
                <LogOut className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
