"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { diarioNewTradeUrl } from "@/lib/trade-prefill";

export function LogTradeFromEventButton({
  eventId,
  eventLabel,
  instruments,
  context,
  variant = "default",
}: {
  eventId: string;
  eventLabel: string;
  instruments?: string[];
  context?: string;
  variant?: "default" | "ghost";
}) {
  const href = diarioNewTradeUrl({
    instruments,
    context: context ?? `Relacionado a ${eventLabel}`,
    sourceKind: "event",
    sourceId: eventId,
    sourceLabel: eventLabel,
  });

  const cls = variant === "ghost"
    ? "text-white/50 hover:text-white/90 border border-transparent hover:border-white/[0.08]"
    : "bg-white/[0.03] border border-white/[0.08] text-white/75 hover:border-white/[0.18] hover:text-white";

  return (
    <Link
      href={href}
      className={`interactive-tap inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${cls}`}
    >
      <PenLine className="w-3 h-3" strokeWidth={2} />
      Registrar trade
    </Link>
  );
}

export function LogTradeFromNewsButton({
  newsId,
  headline,
  className = "",
}: {
  newsId: string;
  headline: string;
  className?: string;
}) {
  const href = diarioNewTradeUrl({
    context: `Baseado em: ${headline}`,
    sourceKind: "news",
    sourceId: newsId,
    sourceLabel: headline,
  });

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      title="Registrar trade baseado nessa notícia"
      className={`interactive-tap inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-colors ${className}`}
    >
      <PenLine className="w-3.5 h-3.5" strokeWidth={2} />
    </Link>
  );
}
