"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModalShell } from "./ModalShell";

function formatBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

type AcceptResponse = { ok: true } | { ok: false; error: string };

export function AcceptModal({
  token,
  valorCentavos,
  onClose,
  onSuccess,
}: {
  token: string;
  valorCentavos: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailTrim = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Email parece inválido");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/convite/${token}/aceitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim, telefone: telefone.trim() || null }),
      });
      const data = (await res.json()) as AcceptResponse;
      if (!data.ok) {
        setError(data.error);
        setSubmitting(false);
        return;
      }
      setDone(true);
      setTimeout(onSuccess, 2000);
    } catch {
      setError("Não foi possível enviar. Tenta de novo.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <ModalShell onClose={onClose} lock>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="flex flex-col items-center text-center py-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
            className="size-16 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, #d4b170 0%, #C9A461 50%, #8a6e3c 100%)",
              boxShadow: "0 0 40px rgba(201,164,97,0.4)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M7 14l5 5 9-10"
                stroke="#09090b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <div
            className="font-serif text-3xl mb-3"
            style={{ color: "#fafafa", fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Vaga reservada
          </div>
          <p className="text-sm max-w-[340px]" style={{ color: "rgba(250,250,250,0.65)" }}>
            URA vai te mandar DM no Discord em até 24h com o link de pagamento
            de {formatBRL(valorCentavos)} e os próximos passos.
          </p>
        </motion.div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={submitting ? undefined : onClose}>
      <div className="mb-6">
        <div
          className="text-[10px] uppercase tracking-[0.3em] mb-2"
          style={{ color: "rgba(201,164,97,0.8)" }}
        >
          Aceitar vaga
        </div>
        <div
          className="font-serif text-2xl md:text-3xl leading-tight"
          style={{ color: "#fafafa", fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Pra fechar, preciso de um contato
        </div>
        <p className="text-xs mt-3" style={{ color: "rgba(250,250,250,0.5)" }}>
          É por onde o URA vai te mandar o link de pagamento e entrar em contato
          pra alinhar os próximos passos. Nada de spam.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[10px] uppercase tracking-[0.25em] mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            placeholder="voce@email.com"
            className="w-full h-12 px-4 rounded-[3px] text-sm outline-none transition-colors"
            style={{
              backgroundColor: "#0a0a0d",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(201,164,97,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
        </div>

        <div>
          <label
            htmlFor="telefone"
            className="block text-[10px] uppercase tracking-[0.25em] mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            WhatsApp <span className="lowercase tracking-normal" style={{ color: "rgba(255,255,255,0.3)" }}>(opcional)</span>
          </label>
          <input
            id="telefone"
            type="tel"
            autoComplete="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            disabled={submitting}
            placeholder="(11) 99999-9999"
            className="w-full h-12 px-4 rounded-[3px] text-sm outline-none transition-colors"
            style={{
              backgroundColor: "#0a0a0d",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(201,164,97,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
        </div>

        {error && (
          <div
            className="text-xs px-3 py-2 rounded-[3px]"
            style={{
              color: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 h-12 rounded-[3px] text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
            style={{
              color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 h-12 rounded-[3px] text-xs uppercase tracking-[0.2em] font-medium transition-opacity disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #FF6a15 0%, #FF5500 50%, #d94500 100%)",
              color: "#09090b",
              boxShadow: "0 8px 20px -6px rgba(255,85,0,0.45)",
            }}
          >
            {submitting ? "Enviando…" : "Confirmar"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
