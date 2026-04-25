"use client";

import { useState, useEffect } from "react";
import { Menu, X, Flame } from "lucide-react";
import { Button } from "./Button";
import { AnalyticsBoot } from "./AnalyticsBoot";
import { trackEvent } from "@/lib/analytics";

const NAV_LINKS = [
  { name: "Resultados", href: "#results" },
  { name: "Sobre", href: "#about" },
  { name: "Planos", href: "#pricing" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <AnalyticsBoot />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled ? "bg-dark-950/90 backdrop-blur-md border-b border-white/[0.05] py-3" : "bg-transparent py-5"
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              URA <span className="text-brand-500">Labs</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="text-[13px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <Button
              href="https://discord.gg/SrxZSGN6"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("click_discord_free", { location: "navbar" })}
              variant="primary"
              className="!px-4 !py-2 !h-9 text-[13px] font-semibold bg-brand-500 hover:bg-brand-400 text-white border-none transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/90" />
                Entrar no Discord
              </span>
            </Button>
          </div>

          <button className="md:hidden text-white/70 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark-950 border-b border-white/[0.05] p-4">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNav(e, link.href)} className="text-[14px] font-medium text-white/70 hover:text-white cursor-pointer py-1">
                {link.name}
              </a>
            ))}
            <Button
              fullWidth
              href="https://discord.gg/SrxZSGN6"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setMenuOpen(false);
                trackEvent("click_discord_free", { location: "navbar_mobile" });
              }}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white border-none font-semibold"
            >
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/90" />
              Entrar no Discord
            </Button>
          </div>
        </div>
      )}
      </nav>
    </>
  );
}
