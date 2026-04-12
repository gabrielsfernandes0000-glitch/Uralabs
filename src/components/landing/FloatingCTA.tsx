"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Crown } from "lucide-react";
import { Button } from "./Button";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    const el = document.getElementById("pricing");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/95 to-transparent pointer-events-none" />
      <div className="relative">
        <Button
          fullWidth
          href="#pricing"
          onClick={scrollTo}
          className="h-16 shadow-[0_0_30px_rgba(234,179,8,0.2)] bg-gradient-to-r from-brand-600 via-yellow-600 to-brand-600 text-white text-lg font-bold flex items-center justify-between px-6 border border-white/10 rounded-xl"
        >
          <span className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm"><Crown className="w-5 h-5 text-white fill-white" /></div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-medium text-yellow-100/80">Oportunidade</span>
              <span className="text-lg">Ver Planos &amp; Preços</span>
            </div>
          </span>
          <ArrowRight className="w-6 h-6 animate-pulse" />
        </Button>
      </div>
    </div>
  );
}
