"use client";

import { motion } from "framer-motion";
import type { InviteData, InviteStatus } from "./InviteClient";

function formatBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type Copy = { eyebrow: string; title: string; body: string; bodyAux?: string; accent: string };

function copyFor(status: InviteStatus, invite: InviteData): Copy {
  const firstName = invite.nomeExibicao.split(/\s+/)[0];
  if (status === "accepted") {
    return {
      eyebrow: "Vaga reservada",
      title: `Tá fechado, ${firstName}`,
      body: `URA vai te mandar DM no Discord em até 24h com o link de pagamento de ${formatBRL(invite.valorCentavos)} e os próximos passos.`,
      bodyAux: "Se não chegar nesse prazo, abre ticket em #abrir-ticket que a gente destrava.",
      accent: "#C9A461",
    };
  }
  if (status === "declined") {
    return {
      eyebrow: "Convite recusado",
      title: "Anotado.",
      body: "Valeu pela sinceridade. Quando a próxima turma abrir, a gente avisa de novo — sem insistência.",
      bodyAux: "Enquanto isso, fica no Discord grátis. O canal #educação-free tem muito pra estudar.",
      accent: "rgba(255,255,255,0.5)",
    };
  }
  return {
    eyebrow: "Convite expirado",
    title: "Esse convite fechou",
    body: `O prazo era até ${formatDate(invite.expiresAt)}. A Turma ${invite.turma} já fechou as inscrições, ou tá fechando agora.`,
    bodyAux: "Se ainda quiser entrar, chama o URA no DM. Pra ficar na lista da próxima turma, reage 🔔 no canal #acesso-elite.",
    accent: "#ef4444",
  };
}

export function StatusScreen({ invite, status }: { invite: InviteData; status: InviteStatus }) {
  const copy = copyFor(status, invite);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full max-w-[520px] rounded-[4px] overflow-hidden"
        style={{
          backgroundColor: "#0c0c0f",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)",
        }}
      >
        <div
          aria-hidden
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${copy.accent} 50%, transparent 100%)`,
            opacity: 0.5,
          }}
        />
        <div className="px-6 py-12 md:px-12 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[10px] uppercase tracking-[0.35em] mb-5"
            style={{ color: copy.accent }}
          >
            {copy.eyebrow}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-serif text-3xl md:text-4xl leading-tight mb-5"
            style={{ color: "#fafafa", fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {copy.title}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-sm md:text-base leading-relaxed max-w-[400px] mx-auto"
            style={{ color: "rgba(250,250,250,0.72)" }}
          >
            {copy.body}
          </motion.p>
          {copy.bodyAux && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-xs md:text-sm leading-relaxed mt-4 max-w-[400px] mx-auto"
              style={{ color: "rgba(250,250,250,0.45)" }}
            >
              {copy.bodyAux}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-8 font-serif italic text-base"
            style={{
              color: "rgba(250,250,250,0.6)",
              fontFamily: "var(--font-serif), Georgia, serif",
            }}
          >
            — URA
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
