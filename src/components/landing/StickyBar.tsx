"use client";

import { useState, useEffect } from "react";
import { Users, ArrowRight } from "lucide-react";

type Props = {
  memberCount: number;
  onlineCount: number;
};

export function StickyBar({ memberCount, onlineCount }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] hidden md:block transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-dark-950/95 backdrop-blur-md border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {memberCount > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-white/55" strokeWidth={2} />
                  <span className="text-[12px] font-medium text-white tabular-nums">{memberCount.toLocaleString("pt-BR")} traders no Discord</span>
                </div>
                <div className="h-3 w-px bg-white/[0.08]" />
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5 rounded-full bg-[var(--color-semantic-up)] live-pulse text-[var(--color-semantic-up)] live-ring" />
                  <span className="text-[11px] text-white/55 tabular-nums">{onlineCount} online</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-white/55" strokeWidth={2} />
                <span className="text-[12px] font-medium text-white">Comunidade ao vivo no Discord</span>
              </div>
            )}
          </div>
          <a
            href="https://discord.gg/SrxZSGN6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-400 text-white text-[12px] font-semibold rounded-md transition-colors"
          >
            Entrar grátis <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
