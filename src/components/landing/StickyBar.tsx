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
      <div className="bg-dark-950/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {memberCount > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-bold text-white">{memberCount.toLocaleString("pt-BR")} traders no Discord</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-500 font-medium">{onlineCount} online agora</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-bold text-white">Comunidade ao vivo no Discord</span>
              </div>
            )}
          </div>
          <a
            href="https://discord.gg/SrxZSGN6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-1.5 bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Entrar Grátis <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
