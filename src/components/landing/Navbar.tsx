"use client";

import { useState, useEffect } from "react";
import { Menu, X, Flame } from "lucide-react";
import { Button } from "./Button";

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-dark-950/90 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="p-2 bg-gradient-to-br from-brand-500 to-red-600 rounded-lg shadow-lg shadow-brand-500/20">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              URA <span className="text-brand-500">LABS</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="text-sm font-medium text-gray-300 hover:text-brand-400 transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <Button
              href="https://discord.gg/SrxZSGN6"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="!px-4 !py-2 text-sm bg-gradient-to-r from-brand-600 to-red-600 border-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <span className="relative z-10 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                Entrar no Discord
              </span>
            </Button>
          </div>

          <button className="md:hidden text-gray-300 hover:text-brand-500 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark-950 border-b border-gray-800 p-4 shadow-xl">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNav(e, link.href)} className="text-base font-medium text-gray-300 hover:text-white cursor-pointer">
                {link.name}
              </a>
            ))}
            <Button fullWidth href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Entrar no Discord
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
