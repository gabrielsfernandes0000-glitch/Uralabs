"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Countdown } from "./Countdown";
import { AcceptModal } from "./AcceptModal";
import { DeclineModal } from "./DeclineModal";
import type { InviteData, InviteStatus } from "./InviteClient";

function formatBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function ordinal(n: number): string {
  return `${n}º`;
}

const INCLUSOES = [
  { titulo: "Calls diárias operando junto", detalhe: "Todo dia 10:30–12:30 você opera com URA na mesma tela. Não é viewer — é trade ao vivo." },
  { titulo: "Aulas ao vivo da turma", detalhe: "Revisão de trades, leitura de gráfico e dúvidas na semana. Só da sua turma." },
  { titulo: "Aprovação em mesas prop", detalhe: "URA acompanha suas fases, valida entrada e libera saque quando for hora." },
  { titulo: "WhatsApp exclusivo", detalhe: "Grupo fechado só da sua turma. Acesso direto ao URA, sem fila." },
  { titulo: "Acesso VIP incluso", detalhe: "6 meses de Calls VIP grátis durante a mentoria." },
  { titulo: "Plataforma de apoio", detalhe: "Aulas gravadas, PDFs e treinos pra revisar conceito. Complemento — o core é ao vivo." },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const sectionAnim = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE_OUT, delay },
});

export function InvitationCard({
  invite,
  onDecided,
}: {
  invite: InviteData;
  onDecided: (status: InviteStatus) => void;
}) {
  const [modal, setModal] = useState<"accept" | "decline" | null>(null);
  const firstName = invite.nomeExibicao.split(/\s+/)[0];

  return (
    <>
      <div
        className="relative rounded-[4px] overflow-hidden"
        style={{
          backgroundColor: "#0c0c0f",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04) inset, 0 50px 100px -20px rgba(0,0,0,0.9), 0 30px 60px -30px rgba(255,85,0,0.08)",
        }}
      >
        {/* Fita superior dourada — detalhe premium */}
        <div
          aria-hidden
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,164,97,0.4) 20%, #C9A461 50%, rgba(201,164,97,0.4) 80%, transparent 100%)",
          }}
        />

        <div className="px-6 md:px-12 py-10 md:py-14">
          {/* Letterhead */}
          <motion.div
            {...sectionAnim(0.1)}
            className="flex flex-col items-center gap-2 mb-10 md:mb-12"
          >
            <div
              className="text-[10px] uppercase tracking-[0.4em] font-medium"
              style={{ color: "rgba(201,164,97,0.8)" }}
            >
              URA Labs · Convite
            </div>
            <div className="h-px w-12" style={{ backgroundColor: "rgba(201,164,97,0.3)" }} />
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Turma Elite {invite.turma}
            </div>
          </motion.div>

          {/* Greeting serif grande */}
          <motion.div {...sectionAnim(0.3)} className="text-center mb-8">
            <div
              className="font-serif text-4xl md:text-5xl leading-tight"
              style={{
                color: "#fafafa",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              E aí,{" "}
              <span
                className="italic"
                style={{
                  background: "linear-gradient(135deg, #d4b170 0%, #C9A461 50%, #8a6e3c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {firstName}
              </span>
            </div>
          </motion.div>

          {/* Parágrafo humano do URA */}
          <motion.div
            {...sectionAnim(0.5)}
            className="text-center max-w-[460px] mx-auto mb-10 space-y-3"
          >
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "rgba(250,250,250,0.75)" }}>
              Você entrou na lista de espera da mentoria faz um tempo.
              Agora a Turma {invite.turma} tá abrindo e eu queria te avisar
              antes de abrir pro público.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "rgba(250,250,250,0.65)" }}>
              Dá uma lida com calma. Se não fizer sentido agora, tá tudo bem —
              é só clicar em <em>agora não</em> ali embaixo.
            </p>
          </motion.div>

          {/* Stats bar — timer + posição */}
          <motion.div
            {...sectionAnim(0.7)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 pb-8 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="text-[9px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Fecha em
              </div>
              <Countdown expiresAt={invite.expiresAt} />
            </div>
            <div className="hidden sm:block h-6 w-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col items-center gap-1">
              <div
                className="text-[9px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Você é
              </div>
              <div className="text-sm" style={{ color: "rgba(250,250,250,0.9)" }}>
                o{" "}
                <span
                  className="font-mono font-medium"
                  style={{ color: "#C9A461" }}
                >
                  {ordinal(invite.numeroConvite)}
                </span>{" "}
                convidado
              </div>
            </div>
            <div className="hidden sm:block h-6 w-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
              <div
                className="text-[9px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Vagas abertas
              </div>
              {(() => {
                const ocupadas = invite.vagasTotais - invite.vagasRestantes;
                const pctFilled = invite.vagasTotais > 0 ? (ocupadas / invite.vagasTotais) * 100 : 0;
                const cor =
                  invite.vagasRestantes <= 3
                    ? "#FF5500"
                    : invite.vagasRestantes <= invite.vagasTotais * 0.2
                      ? "#FF8800"
                      : "#C9A461";
                return (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-mono text-base font-medium"
                        style={{ color: cor }}
                      >
                        {invite.vagasRestantes}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        de {invite.vagasTotais}
                      </span>
                    </div>
                    {/* Progress bar — mostra ocupação visual */}
                    <div
                      className="relative h-0.5 w-full rounded-full overflow-hidden"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      aria-hidden
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pctFilled}%` }}
                        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.9 }}
                        className="absolute left-0 top-0 h-full"
                        style={{
                          background: `linear-gradient(90deg, ${cor}, ${cor}cc)`,
                        }}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>

          {/* O que tá incluso */}
          <motion.div {...sectionAnim(0.9)} className="mb-10">
            <div
              className="text-center mb-6"
            >
              <div
                className="text-[10px] uppercase tracking-[0.3em] mb-1.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Dentro da mentoria
              </div>
              <div className="text-xs italic max-w-[360px] mx-auto" style={{ color: "rgba(250,250,250,0.5)" }}>
                É mentoria ao vivo, não curso gravado. Você opera junto, pergunta ao vivo, toma feedback na hora.
              </div>
            </div>
            <ul className="space-y-3 max-w-[440px] mx-auto">
              {INCLUSOES.map((item, i) => (
                <motion.li
                  key={item.titulo}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE_OUT,
                    delay: 1.0 + i * 0.07,
                  }}
                  className="flex items-start gap-3"
                >
                  <div
                    aria-hidden
                    className="mt-1.5 size-1 rounded-full flex-none"
                    style={{ backgroundColor: "#C9A461" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "rgba(250,250,250,0.92)" }}>
                      {item.titulo}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(250,250,250,0.5)" }}>
                      {item.detalhe}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Preço */}
          <motion.div
            {...sectionAnim(1.5)}
            className="flex flex-col items-center gap-2 mb-10 py-6 border-y"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Investimento
            </div>
            <div
              className="font-serif text-4xl md:text-5xl"
              style={{
                color: "#fafafa",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              {formatBRL(invite.valorCentavos)}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Pagamento único · {invite.duracaoMeses} meses de acesso
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            {...sectionAnim(1.7)}
            className="flex flex-col gap-3 max-w-[440px] mx-auto"
          >
            <button
              type="button"
              onClick={() => setModal("accept")}
              className="group relative w-full h-14 rounded-[3px] overflow-hidden font-medium text-sm tracking-wide transition-transform active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #FF6a15 0%, #FF5500 50%, #d94500 100%)",
                color: "#09090b",
                boxShadow:
                  "0 10px 30px -8px rgba(255,85,0,0.5), 0 1px 0 rgba(255,255,255,0.2) inset",
              }}
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[12px]">
                Aceitar vaga
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8m0 0L7.5 3.5M11 7L7.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {/* Shimmer */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
                  transform: "translateX(-100%)",
                  animation: "shimmer 1.2s ease-in-out",
                }}
              />
            </button>

            <button
              type="button"
              onClick={() => setModal("decline")}
              className="w-full h-12 rounded-[3px] text-xs uppercase tracking-[0.2em] transition-colors"
              style={{
                color: "rgba(255,255,255,0.45)",
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              Agora não
            </button>
          </motion.div>

          {/* Disclaimer anti-guru */}
          <motion.div {...sectionAnim(1.9)} className="text-center mt-10">
            <p
              className="text-[11px] leading-relaxed max-w-[400px] mx-auto"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Zero pressão. Este convite é pessoal — não compartilhe o link.
              Trade tem risco. Não prometo retorno, prometo método e acompanhamento.
            </p>
            <p
              className="font-serif italic text-base mt-4"
              style={{
                color: "rgba(250,250,250,0.7)",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              — URA
            </p>
          </motion.div>
        </div>

        {/* Fita inferior */}
        <div
          aria-hidden
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,164,97,0.2) 20%, rgba(201,164,97,0.6) 50%, rgba(201,164,97,0.2) 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Modals */}
      {modal === "accept" && (
        <AcceptModal
          token={invite.token}
          valorCentavos={invite.valorCentavos}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            onDecided("accepted");
          }}
        />
      )}
      {modal === "decline" && (
        <DeclineModal
          token={invite.token}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            onDecided("declined");
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
