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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/95 to-transparent pointer-events-none" />
      <div className="relative">
        <Button
          fullWidth
          href="#pricing"
          onClick={scrollTo}
          className="h-12 bg-brand-500 hover:bg-brand-400 text-white text-[14px] font-semibold flex items-center justify-between px-5 border-none rounded-md transition-colors"
        >
          <span className="flex items-center gap-2">
            <Crown className="w-4 h-4" strokeWidth={2} />
            <span>Ver planos</span>
          </span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
