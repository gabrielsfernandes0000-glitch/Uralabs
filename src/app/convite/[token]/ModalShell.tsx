"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function ModalShell({
  children,
  onClose,
  lock = false,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  /** Se true, não fecha ao clicar no overlay ou pressionar Esc. */
  lock?: boolean;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (!lock && e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lock, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (!lock && onClose && e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative w-full max-w-[480px] rounded-[4px] overflow-hidden"
        style={{
          backgroundColor: "#0c0c0f",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px -10px rgba(0,0,0,0.8)",
          maxHeight: "calc(100vh - 4rem)",
          overflowY: "auto",
        }}
      >
        <div
          aria-hidden
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,164,97,0.4) 50%, transparent 100%)",
          }}
        />
        <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
      </motion.div>
    </motion.div>
  );
}
