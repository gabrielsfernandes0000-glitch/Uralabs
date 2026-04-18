"use client";

import { useEffect, useState } from "react";

export type Tier = "elite" | "vip" | null;

export function useTier(): { tier: Tier; isElite: boolean; isVip: boolean; loading: boolean } {
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setTier(data.tier ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return {
    tier,
    isElite: tier === "elite",
    isVip: tier === "vip" || tier === "elite",
    loading,
  };
}
