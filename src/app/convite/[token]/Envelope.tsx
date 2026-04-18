"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Envelope selado — tela inicial do convite.
 * Minimalista: card preto com carimbo de cera em gold. Click abre o convite.
 */
export function Envelope({ nome, onOpen }: { nome: string; onOpen: () => void }) {
  const reduce = useReducedMotion();
  const firstName = nome.split(/\s+/)[0];

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onClick={onOpen}
        whileHover={reduce ? undefined : { y: -4 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
        className="group relative w-full aspect-[1.45] rounded-[2px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#C9A461]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#06060a]"
        style={{
          backgroundColor: "#0e0e10",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04) inset, 0 40px 80px -20px rgba(0,0,0,0.8), 0 20px 40px -10px rgba(255,85,0,0.08)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        aria-label="Abrir convite"
      >
        {/* Ficha do envelope — dobras diagonais */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 49.5%, rgba(255,255,255,0.02) 50%, transparent 50.5%), linear-gradient(-135deg, transparent 49.5%, rgba(255,255,255,0.02) 50%, transparent 50.5%)",
          }}
        />

        {/* Letterhead topo */}
        <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-1.5">
          <div
            className="text-[10px] uppercase tracking-[0.35em] font-medium"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            URA Labs · Mentoria
          </div>
          <div
            className="h-px w-8"
            style={{ backgroundColor: "rgba(201,164,97,0.4)" }}
          />
        </div>

        {/* Selo de cera central — flame em gold */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Halo dourado sutil */}
            <div
              aria-hidden
              className="absolute inset-0 -m-8 rounded-full opacity-50 blur-xl"
              style={{ background: "radial-gradient(circle, rgba(201,164,97,0.3), transparent 60%)" }}
            />
            {/* Selo circular */}
            <div
              className="relative size-24 md:size-28 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #d4b170 0%, #C9A461 40%, #8a6e3c 80%, #6b5228 100%)",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {/* Flame icon — simplificado, gravado */}
              <svg
                width="36"
                height="44"
                viewBox="0 0 36 44"
                fill="none"
                style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
              >
                <path
                  d="M18 2 C14 10, 6 14, 6 24 C6 34, 12 42, 18 42 C24 42, 30 34, 30 24 C30 18, 26 16, 24 12 C22 16, 20 18, 20 14 C20 8, 22 6, 18 2 Z"
                  fill="#3a2c13"
                  fillOpacity="0.7"
                />
              </svg>
              {/* Borda gravada */}
              <div
                className="absolute inset-1.5 rounded-full"
                style={{ border: "1px solid rgba(58,44,19,0.3)" }}
              />
            </div>
          </motion.div>
        </div>

        {/* "Para:" footer */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1">
          <div
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Para
          </div>
          <div
            className="font-serif text-xl italic"
            style={{
              color: "rgba(250,250,250,0.92)",
              fontFamily: "var(--font-serif), Georgia, serif",
            }}
          >
            {firstName}
          </div>
        </div>
      </motion.button>

      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          Toque no envelope
        </div>
        {!reduce && (
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "rgba(201,164,97,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  );
}
