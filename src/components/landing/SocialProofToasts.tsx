"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, ImageIcon } from "lucide-react";
import type { LPMessage } from "@/lib/discord-lp";

type Props = {
  messages: LPMessage[];
};

export function SocialProofToasts({ messages }: Props) {
  const [current, setCurrent] = useState<LPMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const showNext = useCallback(() => {
    if (messages.length === 0) return;
    const msg = messages[index % messages.length];
    setCurrent(msg);
    setVisible(true);

    // Hide after 5s
    const hideTimer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(hideTimer);
  }, [messages, index]);

  useEffect(() => {
    // Don't show toasts until user has scrolled a bit
    const onScroll = () => {
      if (window.scrollY > 400) {
        window.removeEventListener("scroll", onScroll);
        // Start showing after 3s
        setTimeout(() => showNext(), 3000);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [showNext]);

  useEffect(() => {
    if (!visible && index > 0) {
      // Queue next toast after 8s gap
      const timer = setTimeout(() => {
        setIndex((i) => i + 1);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [visible, index]);

  useEffect(() => {
    if (index > 0) {
      showNext();
    }
  }, [index, showNext]);

  if (!current) return null;

  // Clean content for display
  const displayText = current.content.length > 60
    ? current.content.slice(0, 60) + "..."
    : current.content;

  return (
    <div
      className={`fixed bottom-24 left-4 z-40 max-w-[340px] transition-all duration-500 ${
        visible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-dark-900/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {current.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                {current.user[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span className="text-xs font-bold text-green-500">Resultado Postado</span>
            </div>
            <p className="text-sm text-white font-medium truncate">{current.user}</p>
            {displayText && displayText !== "🔥" ? (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{displayText}</p>
            ) : current.imageUrl ? (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Compartilhou um resultado
              </p>
            ) : null}
            <p className="text-[10px] text-gray-600 mt-1">#sucesso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
