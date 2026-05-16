"use client";

import { motion, useReducedMotion } from "framer-motion";

/* Template re-monta a cada navegação pra esta rota — perfeito pra entry animation.
   Apple-style: subtle slide-up + fade com spring suave. Respeita reduced-motion. */
export default function LessonTemplate({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 26,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
}
