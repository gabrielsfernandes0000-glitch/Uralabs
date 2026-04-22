"use client";

import { useState } from "react";
import { X, DollarSign, Loader2, CheckCircle2 } from "lucide-react";

type PixKeyType = "cpf" | "email" | "phone" | "random";

export function PixDialog({
  redemptionId,
  prizeName,
  amountBrl,
  onClose,
}: {
  redemptionId: string;
  prizeName: string;
  amountBrl: number | null;
  onClose: (submitted: boolean) => void;
}) {
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedKey = pixKey.trim();
    const trimmedName = recipient.trim();
    if (!trimmedKey) {
      setError("Chave PIX obrigatória");
      return;
    }
    if (trimmedName.length < 3) {
      setError("Nome do destinatário obrigatório (mín 3 caracteres)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/loot/claim-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemption_id: redemptionId,
          pix_key: trimmedKey,
          pix_key_type: pixKeyType,
          pix_recipient_name: trimmedName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro desconhecido");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => onClose(true), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de rede");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-200">
      <button
        onClick={() => !loading && !success && onClose(false)}
        className="absolute top-5 right-5 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        disabled={loading || success}
      >
        <X className="w-5 h-5" />
      </button>

      {success ? (
        <div className="rounded-xl surface-card border-l-2 border-l-[#22C55E] p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-14 h-14 text-[#22C55E] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">PIX enviado!</h3>
          <p className="text-sm text-white/55">
            O URA processa manualmente. Vai chegar no seu banco nas próximas horas.
          </p>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="rounded-xl border border-white/[0.08] bg-[#0a0a0c] p-6 max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md border border-white/15">
              <DollarSign className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{prizeName}</h3>
              {amountBrl != null && (
                <p className="text-sm text-white/50 tabular-nums">R$ {amountBrl.toFixed(2)}</p>
              )}
            </div>
          </div>
          <p className="text-[12px] text-white/50 mb-5 leading-relaxed">
            Preencha seus dados de PIX. Chave é criptografada em trânsito e no banco —
            só o URA consegue ver pra pagar manualmente.
          </p>

          <div className="space-y-3">
            <label className="block">
              <span className="text-[11px] text-white/55">
                Tipo da chave
              </span>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                className="mt-1 w-full h-11 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm focus:border-brand-500 outline-none"
                disabled={loading}
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave aleatória</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] text-white/55">
                Chave PIX
              </span>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={placeholderFor(pixKeyType)}
                className="mt-1 w-full h-11 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm focus:border-brand-500 outline-none"
                disabled={loading}
                maxLength={256}
              />
            </label>

            <label className="block">
              <span className="text-[11px] text-white/55">
                Nome do titular
              </span>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nome completo"
                className="mt-1 w-full h-11 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm focus:border-brand-500 outline-none"
                disabled={loading}
                maxLength={120}
              />
            </label>
          </div>

          {error && (
            <div className="mt-3 rounded-md surface-card border-l-2 border-l-red-500 text-white/80 text-xs px-3 py-2">
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-white/[0.08] text-white/70 hover:bg-white/[0.04] text-sm font-medium transition-colors"
            >
              Depois
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando…
                </>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function placeholderFor(type: PixKeyType): string {
  switch (type) {
    case "cpf":
      return "00000000000 (só números)";
    case "email":
      return "voce@exemplo.com";
    case "phone":
      return "+5511999999999";
    case "random":
      return "chave aleatória (UUID)";
  }
}
