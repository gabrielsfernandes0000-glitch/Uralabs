"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModalShell } from "./ModalShell";

const RAZOES: { value: string; label: string; detail: string }[] = [
  { value: "preco", label: "Tá caro demais pra mim agora", detail: "Entendo. VIP (R$120/mês) é o caminho pra começar." },
  { value: "tempo", label: "Não tenho tempo agora pra estudar", detail: "Faz sentido. A próxima turma abre em uns meses." },
  { value: "prioridade", label: "Tenho outra prioridade esse semestre", detail: "Anotado. Volto a falar na próxima abertura." },
  { value: "nao_era_hora", label: "Ainda tô explorando, não era pra hoje", detail: "Sem pressa. Fica no Discord grátis e quando fizer sentido, avisa." },
  { value: "outro", label: "Outro motivo", detail: "" },
];

type DeclineResponse = { ok: true } | { ok: false; error: string };

export function DeclineModal({
  token,
  onClose,
  onSuccess,
}: {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [razao, setRazao] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!razao) {
      setError("Escolhe uma opção");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/convite/${token}/recusar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razao, detalhe: detalhe.trim() || null }),
      });
      const data = (await res.json()) as DeclineResponse;
      if (!data.ok) {
        setError(data.error);
        setSubmitting(false);
        return;
      }
      setDone(true);
      setTimeout(onSuccess, 1800);
    } catch {
      setError("Não foi possível enviar. Tenta de novo.");
      setSubmitting(false);
    }
  }

  if (done) {
    const razaoInfo = RAZOES.find((r) => r.value === razao);
    return (
      <ModalShell onClose={onClose} lock>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-4"
        >
          <div
            className="font-serif text-2xl md:text-3xl leading-tight mb-3"
            style={{ color: "#fafafa", fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Tranquilo.
          </div>
          <p className="text-sm max-w-[340px] mx-auto" style={{ color: "rgba(250,250,250,0.65)" }}>
            {razaoInfo?.detail || "Valeu pelo retorno. Se mudar de ideia, chama no DM do Discord."}
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
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Recusar convite
        </div>
        <div
          className="font-serif text-2xl md:text-3xl leading-tight"
          style={{ color: "#fafafa", fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Me conta rapidinho o motivo
        </div>
        <p className="text-xs mt-3" style={{ color: "rgba(250,250,250,0.5)" }}>
          Não pra te convencer de nada — só pra saber como ajustar as próximas
          aberturas. Leva 5 segundos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          {RAZOES.map((r) => (
            <label
              key={r.value}
              className="flex items-start gap-3 p-3.5 rounded-[3px] cursor-pointer transition-colors"
              style={{
                backgroundColor: razao === r.value ? "rgba(201,164,97,0.06)" : "#0a0a0d",
                border:
                  razao === r.value
                    ? "1px solid rgba(201,164,97,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <input
                type="radio"
                name="razao"
                value={r.value}
                checked={razao === r.value}
                onChange={() => setRazao(r.value)}
                disabled={submitting}
                className="mt-0.5 accent-[#C9A461]"
              />
              <span className="text-sm" style={{ color: "rgba(250,250,250,0.85)" }}>
                {r.label}
              </span>
            </label>
          ))}
        </div>

        {razao === "outro" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={500}
              placeholder="Fica à vontade pra escrever o que quiser"
              className="w-full px-4 py-3 rounded-[3px] text-sm outline-none resize-none"
              style={{
                backgroundColor: "#0a0a0d",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fafafa",
              }}
            />
          </motion.div>
        )}

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
            disabled={submitting || !razao}
            className="flex-1 h-12 rounded-[3px] text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
            style={{
              color: "rgba(250,250,250,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            {submitting ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
