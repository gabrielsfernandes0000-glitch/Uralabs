"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Check, Circle, AlertTriangle } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { tradeR, mistakeById } from "@/lib/playbook";
import { detectTilt } from "@/lib/tilt-detector";

/**
 * Status bar unificada — substitui Readiness + Tilt + Prep collapsible.
 *
 * 1 linha com 3 dots semânticos:
 *  - prep       (verde/âmbar)
 *  - readiness  (verde/âmbar/vermelho)
 *  - tilt       (invisível/âmbar/vermelho — domina a barra quando crítico)
 *
 * Regras:
 *  - Se tilt crítico → barra vermelha dominante com CTA "Entender por quê".
 *  - Senão → barra neutra com 3 dots + headline contextual + expand.
 *
 * Expand mostra todos os detalhes: status do prep, cada check de readiness,
 * cada sinal de tilt.
 */

function todayBR(): string {
  const now = new Date();
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

function brtNowMins(): number {
  const s = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

interface ReadinessCheck {
  id: string;
  label: string;
  short: string;
  ok: boolean;
  hint: string;
}

export function JourneyStatusBar() {
  const { progress } = useProgress();
  const [nowMins, setNowMins] = useState(() => brtNowMins());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setNowMins(brtNowMins()), 30_000);
    return () => clearInterval(iv);
  }, []);

  if (!progress) return null;

  const today = todayBR();
  const prepToday = progress.preps?.[today];
  const hasPrep = !!prepToday;

  const inSession = (nowMins >= 10 * 60 + 30 && nowMins < 12 * 60) || (nowMins >= 13 * 60 + 30 && nowMins < 16 * 60 + 30);
  const inLunch = nowMins >= 12 * 60 && nowMins < 13 * 60 + 30;

  const todayTrades = progress.trades.filter((t) => t.date === today);
  const lastEmotional = prepToday?.emotional ?? todayTrades.slice(-1)[0]?.emotionalBefore;
  const emotionOk = !lastEmotional || lastEmotional >= 3;

  let lossStreak = 0;
  for (let i = todayTrades.length - 1; i >= 0; i--) {
    if (todayTrades[i].result === "loss") lossStreak++;
    else break;
  }
  const hasGraveMistake = todayTrades
    .slice(-3)
    .flatMap((t) => t.mistakes ?? [])
    .some((id) => mistakeById(id)?.severity === 3);
  const tiltLocal = lossStreak < 2 && !hasGraveMistake;

  const dayR = todayTrades.reduce((s, t) => s + tradeR(t), 0);
  const ddOk = dayR > -3;

  const readinessChecks: ReadinessCheck[] = [
    { id: "prep", label: "Prep sheet preenchido", short: "Prep", ok: hasPrep, hint: hasPrep ? "pronto" : "preencha antes do open" },
    { id: "session", label: "Sessão ativa", short: "Sessão", ok: inSession, hint: inSession ? "janela de edge" : inLunch ? "lunch chop" : "fora do horário" },
    { id: "emotion", label: "Estado emocional", short: "Emoção", ok: emotionOk, hint: emotionOk ? "OK" : "baixa — risco de tilt" },
    { id: "tilt", label: "Zero sinal de tilt intraday", short: "Tilt", ok: tiltLocal, hint: tiltLocal ? "limpo" : lossStreak >= 2 ? `${lossStreak} losses` : "mistake grave recente" },
    { id: "dd", label: "Drawdown diário OK", short: "Drawdown", ok: ddOk, hint: ddOk ? "dentro do limite" : "daily loss atingido" },
  ];

  const okCount = readinessChecks.filter((c) => c.ok).length;
  const total = readinessChecks.length;
  const readinessLevel: "ready" | "warn" | "danger" = okCount === total ? "ready" : okCount >= 3 ? "warn" : "danger";

  // Tilt global (signals severity-weighted vindos do detector)
  const tilt = detectTilt(progress.trades);
  const tiltCritical = tilt.level === "critical";
  const tiltWarning = tilt.level === "warning";

  // Dominância: tilt crítico toma toda a barra.
  if (tiltCritical) {
    return (
      <div className="rounded-lg border border-red-500/35 bg-red-500/[0.08]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" strokeWidth={2.2} />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-red-300">
              Tilt crítico — considere parar de operar hoje
            </p>
            <p className="text-[11px] text-white/55 mt-0.5 truncate">
              {tilt.signals.length} sinal{tilt.signals.length > 1 ? "is" : ""} ativo{tilt.signals.length > 1 ? "s" : ""} · score {tilt.score}
            </p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-red-400/60 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-red-500/20 px-4 py-3 space-y-1.5">
              {tilt.signals.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/85">{s.label}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado neutro/warn — 3 dots
  const prepDot = hasPrep ? "#10B981" : "#F59E0B";
  const readinessDot = readinessLevel === "ready" ? "#10B981" : readinessLevel === "warn" ? "#F59E0B" : "#EF4444";
  const tiltDot = tilt.level === "none" ? "#10B981" : tiltWarning ? "#F59E0B" : "#EF4444";

  const headline = (() => {
    if (tiltWarning) return `${tilt.signals.length} sinal de tilt · atenção`;
    if (readinessLevel === "danger") return `${total - okCount} pendências críticas pré-trade`;
    if (readinessLevel === "warn") {
      const pending = readinessChecks.filter((c) => !c.ok);
      return pending.length === 1
        ? `1 pendência · ${pending[0].short}`
        : `${pending.length} pendências · ${pending.map((p) => p.short).join(" · ")}`;
    }
    if (!hasPrep) return "Prep sheet pendente";
    return "Tudo pronto pra operar";
  })();

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] px-4 py-2.5 transition-colors"
      >
        {/* 3 dots semânticos */}
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusDot color={prepDot} label="Prep" />
          <StatusDot color={readinessDot} label="Readiness" />
          <StatusDot color={tiltDot} label="Tilt" />
        </div>

        <span className="text-[12.5px] font-semibold text-white/85 flex-1 text-left truncate">{headline}</span>

        <span className="text-[10px] font-mono text-white/40 tabular-nums shrink-0">{okCount}/{total}</span>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-2 rounded-lg bg-white/[0.015] border border-white/[0.04] divide-y divide-white/[0.03]">
            {/* Prep status */}
            <div className="px-4 py-3">
              <p className="text-[11.5px] font-semibold text-white/70 mb-2">Prep sheet</p>
              <div className="flex items-center gap-2">
                {hasPrep ? (
                  <Check className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-3 h-3 text-white/25" strokeWidth={2.5} />
                )}
                <span className="text-[12px] text-white/75">
                  {hasPrep ? "Plano do dia salvo" : "Plano do dia ainda não foi registrado"}
                </span>
              </div>
            </div>

            {/* Readiness checks */}
            <div className="px-4 py-3">
              <p className="text-[11.5px] font-semibold text-white/70 mb-2">Readiness</p>
              <div className="space-y-1.5">
                {readinessChecks.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    {c.ok ? (
                      <Check className="w-3 h-3 shrink-0 text-emerald-400" strokeWidth={2.5} />
                    ) : (
                      <Circle className="w-3 h-3 shrink-0 text-white/25" strokeWidth={2.5} />
                    )}
                    <span className={`text-[12px] flex-1 ${c.ok ? "text-white/70" : "text-white/55"}`}>{c.label}</span>
                    <span className="text-[11px] text-white/35">{c.hint}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tilt signals (se houver) */}
            {tilt.signals.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-[11.5px] font-semibold text-amber-400/85 mb-2">Sinais de tilt</p>
                <div className="space-y-1.5">
                  {tilt.signals.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/80">{s.label}</p>
                        <p className="text-[11px] text-white/45 mt-0.5">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      title={label}
    />
  );
}
