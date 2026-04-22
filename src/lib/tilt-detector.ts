import type { TradeEntry } from "./progress";
import { tradeR, mistakeById } from "./playbook";

/**
 * Tilt detector — sinais multi-fator severity-weighted.
 *
 * Score ≥ 5 → warning. Score ≥ 8 → critical.
 *
 *  1. Loss streak 2+ consecutivos no dia
 *  2. Mistake tags severity 3 recentes (revenge, move-stop, increase-size)
 *  3. Emotional pre-trade < 3
 *  4. Plano violado 2+ vezes nas últimas 3 entradas
 *  5. Drawdown > 3R no dia
 *  6. Size crescente após loss (martingale)
 */

export interface TiltSignal {
  label: string;
  weight: number;
  detail: string;
}

export interface TiltState {
  active: boolean;
  score: number;
  signals: TiltSignal[];
  level: "none" | "warning" | "critical";
}

function todayBR(): string {
  const now = new Date();
  const brDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brDate.toISOString().split("T")[0];
}

export function detectTilt(trades: TradeEntry[]): TiltState {
  const today = todayBR();
  const todayTrades = trades.filter((t) => t.date === today);
  if (todayTrades.length === 0) return { active: false, score: 0, signals: [], level: "none" };

  const signals: TiltSignal[] = [];

  let lossStreak = 0;
  for (let i = todayTrades.length - 1; i >= 0; i--) {
    if (todayTrades[i].result === "loss") lossStreak++;
    else break;
  }
  if (lossStreak >= 2) {
    signals.push({
      label: `${lossStreak} losses consecutivos`,
      weight: 2 * lossStreak,
      detail: "O mercado não está falando com você hoje",
    });
  }

  const recentMistakes = todayTrades
    .slice(-3)
    .flatMap((t) => (t.mistakes ?? []).map(mistakeById))
    .filter((m): m is NonNullable<typeof m> => !!m);
  const sev3 = recentMistakes.filter((m) => m.severity === 3);
  if (sev3.length > 0) {
    signals.push({
      label: `Erros críticos recentes: ${sev3.map((m) => m.name).join(", ")}`,
      weight: 3 * sev3.length,
      detail: "Reconheça antes de fazer de novo",
    });
  }

  const lastTrade = todayTrades[todayTrades.length - 1];
  if (lastTrade.emotionalBefore && lastTrade.emotionalBefore < 3) {
    signals.push({
      label: `Estado emocional pré-trade baixo (${lastTrade.emotionalBefore}/5)`,
      weight: 2,
      detail: "Emoção negativa antecede tilt",
    });
  }

  const notFollowed = todayTrades.slice(-3).filter((t) => !t.followedPlan).length;
  if (notFollowed >= 2) {
    signals.push({
      label: `${notFollowed} trades sem seguir o plano`,
      weight: notFollowed,
      detail: "Desvio de plano é primeiro sintoma de tilt",
    });
  }

  const dayR = todayTrades.reduce((s, t) => s + tradeR(t), 0);
  if (dayR < -3) {
    signals.push({
      label: `Drawdown diário ${dayR.toFixed(2)}R`,
      weight: Math.min(Math.ceil(Math.abs(dayR)), 5),
      detail: "Daily loss limit atingido — fique fora do mercado",
    });
  }

  if (todayTrades.length >= 2) {
    const a = todayTrades[todayTrades.length - 2];
    const b = todayTrades[todayTrades.length - 1];
    if (a.size && b.size && b.size > a.size * 1.3 && a.result === "loss") {
      signals.push({
        label: "Size aumentou após loss",
        weight: 2,
        detail: "Clássico martingale — probabilidade de ruína aumenta",
      });
    }
  }

  const score = signals.reduce((s, x) => s + x.weight, 0);
  const active = score >= 5;
  const level = score >= 8 ? "critical" : active ? "warning" : "none";
  return { active, score, signals, level };
}
