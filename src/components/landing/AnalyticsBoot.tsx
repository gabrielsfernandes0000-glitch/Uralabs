"use client";

import { useEffect } from "react";
import { captureUTMs, trackEvent } from "@/lib/analytics";

/**
 * Client-side boot: captura UTMs no load, dispara eventos de scroll-depth
 * (50% e 90%) pra GA/Meta saberem se o user leu o conteúdo antes de sair.
 * Montado uma vez no <Navbar /> da LP.
 */
export function AnalyticsBoot() {
  useEffect(() => {
    captureUTMs();

    const fired = new Set<string>();
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const height = document.documentElement.scrollHeight;
      if (height === 0) return;
      const pct = (scrolled / height) * 100;
      if (pct >= 50 && !fired.has("scroll_50")) {
        fired.add("scroll_50");
        trackEvent("scroll_50");
      }
      if (pct >= 90 && !fired.has("scroll_90")) {
        fired.add("scroll_90");
        trackEvent("scroll_90");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
