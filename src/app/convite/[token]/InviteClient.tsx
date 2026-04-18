"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Envelope } from "./Envelope";
import { InvitationCard } from "./InvitationCard";
import { StatusScreen } from "./StatusScreen";

export type InviteStatus = "pending" | "opened" | "accepted" | "declined" | "expired";

export type InviteData = {
  token: string;
  nomeExibicao: string;
  turma: string;
  valorCentavos: number;
  duracaoMeses: number;
  vagasTotais: number;
  vagasRestantes: number;
  numeroConvite: number;
  totalConvites: number;
  aceitos: number;
  expiresAt: string;
  status: InviteStatus;
  emailContato: string | null;
};

export function InviteClient({ invite }: { invite: InviteData }) {
  const [currentStatus, setCurrentStatus] = useState<InviteStatus>(invite.status);
  const [opened, setOpened] = useState(false);
  const reduce = useReducedMotion();

  // Se já foi decidido ou expirou, vai direto pro status screen
  const decided = currentStatus === "accepted" || currentStatus === "declined" || currentStatus === "expired";

  // Se é primeira visita (status "opened" da gente ter setado no server) ou "pending",
  // começa com envelope; senão pula direto pra card
  useEffect(() => {
    if (reduce && !decided) setOpened(true);
  }, [reduce, decided]);

  if (decided) {
    return <StatusScreen invite={invite} status={currentStatus} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.95, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full max-w-[560px]"
          >
            <Envelope nome={invite.nomeExibicao} onOpen={() => setOpened(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
            className="w-full max-w-[640px]"
          >
            <InvitationCard
              invite={invite}
              onDecided={(newStatus) => setCurrentStatus(newStatus)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
