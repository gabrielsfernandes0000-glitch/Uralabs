/* ────────────────────────────────────────────
   Playbook + Mistake Tags — metodologia URA canonicalizada.

   Inspirado em Edgewonk (playbook de setups) + TraderSync (mistake tracking).
   Essência: trader classifica cada trade por setup e por erros cometidos →
   estatística acionável ("qual setup tá drenando conta", "quanto R perdi por
   FOMO esse mês").
   ──────────────────────────────────────────── */

export interface Setup {
  id: string;
  name: string;
  description: string;
  /** Categoria macro: "estrutura", "liquidez", "timing", "contexto". */
  category: "estrutura" | "liquidez" | "timing" | "contexto";
}

/**
 * Setups canônicos da metodologia URA (SMC/ICT adaptado).
 * Trader pode adicionar próprios via UI futura — por ora, fixo.
 */
export const URA_SETUPS: Setup[] = [
  {
    id: "sweep-ob",
    name: "Sweep + OB",
    description: "Varredura de liquidez (BSL/SSL) seguida de reação em Order Block mitigado.",
    category: "liquidez",
  },
  {
    id: "judas-swing",
    name: "Judas Swing",
    description: "Spike falso na abertura NY varrendo BSL/SSL antes da intenção real.",
    category: "timing",
  },
  {
    id: "fvg-mitigado",
    name: "FVG mitigado",
    description: "Retorno do preço em Fair Value Gap não preenchido — entrada em CE.",
    category: "estrutura",
  },
  {
    id: "bos-retest",
    name: "BoS + retest",
    description: "Break of Structure HTF seguido de retest do nível rompido (ex-resistência vira suporte).",
    category: "estrutura",
  },
  {
    id: "amd",
    name: "AMD",
    description: "Accumulation → Manipulation → Distribution na sessão NY.",
    category: "timing",
  },
  {
    id: "smt-divergence",
    name: "SMT Divergence",
    description: "Divergência entre pares correlatos (NQ vs ES, BTC vs ETH) sinalizando exaustão.",
    category: "contexto",
  },
  {
    id: "liquidity-grab",
    name: "Liquidity Grab",
    description: "Captura agressiva de stops clusters sem follow-through — reversão esperada.",
    category: "liquidez",
  },
  {
    id: "breaker-block",
    name: "Breaker Block",
    description: "OB oposto que foi rompido e retestado — inverte bias daquela zona.",
    category: "estrutura",
  },
  {
    id: "equal-highs-lows",
    name: "Equal Highs/Lows",
    description: "Topos/fundos iguais como alvo de liquidez — entrada após sweep confirmado.",
    category: "liquidez",
  },
  {
    id: "contratendência",
    name: "Contra-tendência",
    description: "Trade contra o viés HTF — só justificável com confluência extraordinária.",
    category: "contexto",
  },
];

export function setupById(id: string | undefined): Setup | null {
  if (!id) return null;
  return URA_SETUPS.find((s) => s.id === id) ?? null;
}

/**
 * Mistake tags — categorização de erros recorrentes pra identificar padrões.
 * Trader marca até N no trade; dashboard agrega "R perdido por tag".
 */
export interface MistakeTag {
  id: string;
  name: string;
  description: string;
  /** Grau de gravidade (1=leve, 3=crítico) — pondera no scoring de disciplina. */
  severity: 1 | 2 | 3;
}

export const MISTAKE_TAGS: MistakeTag[] = [
  {
    id: "fomo",
    name: "FOMO",
    description: "Entrou com medo de perder o movimento, sem confluência.",
    severity: 3,
  },
  {
    id: "revenge",
    name: "Revenge trade",
    description: "Tentou recuperar loss imediato aumentando size ou forçando entrada.",
    severity: 3,
  },
  {
    id: "move-stop",
    name: "Moveu stop",
    description: "Arrastou o stop pra longe da invalidação — virou trade maior que o planejado.",
    severity: 3,
  },
  {
    id: "increase-size",
    name: "Aumentou size",
    description: "Adicionou contratos fora do plano (martingale, average down).",
    severity: 3,
  },
  {
    id: "no-plan",
    name: "Sem plano",
    description: "Não tinha prep sheet ou viés definido no HTF antes de entrar.",
    severity: 2,
  },
  {
    id: "overtrade",
    name: "Overtrade",
    description: "Excedeu o limite diário de trades planejado.",
    severity: 2,
  },
  {
    id: "countertrend",
    name: "Contra-tendência sem confluência",
    description: "Operou contra HTF sem sinal técnico forte.",
    severity: 2,
  },
  {
    id: "lunch-trade",
    name: "Tradou em lunch/low volume",
    description: "Entrou em horário de baixa liquidez (12h-13h30 BRT).",
    severity: 1,
  },
  {
    id: "early-exit",
    name: "Saiu cedo",
    description: "Fechou antes do alvo por ansiedade — TP não atingido.",
    severity: 1,
  },
  {
    id: "late-entry",
    name: "Entrada atrasada",
    description: "Perdeu o ponto ideal e entrou com RR pior.",
    severity: 2,
  },
  {
    id: "ignored-news",
    name: "Ignorou notícia",
    description: "Operou sem checar agenda econômica — pegou evento alto impacto.",
    severity: 2,
  },
  {
    id: "hesitation",
    name: "Hesitou na entrada",
    description: "Viu setup válido mas não puxou o gatilho — perdeu o trade.",
    severity: 1,
  },
];

export function mistakeById(id: string): MistakeTag | null {
  return MISTAKE_TAGS.find((m) => m.id === id) ?? null;
}

/* ────────────────────────────────────────────
   Symbol helpers
   ──────────────────────────────────────────── */

export interface SymbolMeta {
  id: string;
  label: string;          // "NQ", "BTC"
  fullName: string;       // "Nasdaq 100 Futures"
  category: "futures" | "crypto" | "forex" | "commodities";
  color: string;          // cor de display
}

export const SYMBOLS: SymbolMeta[] = [
  { id: "NQ",     label: "NQ",     fullName: "Nasdaq 100 Futures",  category: "futures", color: "#60A5FA" },
  { id: "ES",     label: "ES",     fullName: "S&P 500 Futures",     category: "futures", color: "#3B82F6" },
  { id: "YM",     label: "YM",     fullName: "Dow Jones Futures",   category: "futures", color: "#6366F1" },
  { id: "RTY",    label: "RTY",    fullName: "Russell 2000",        category: "futures", color: "#8B5CF6" },
  { id: "GC",     label: "GC",     fullName: "Gold Futures",        category: "commodities", color: "#EAB308" },
  { id: "CL",     label: "CL",     fullName: "Crude Oil",           category: "commodities", color: "#EF4444" },
  { id: "BTCUSDT",label: "BTC",    fullName: "Bitcoin",             category: "crypto",  color: "#F97316" },
  { id: "ETHUSDT",label: "ETH",    fullName: "Ethereum",            category: "crypto",  color: "#A78BFA" },
  { id: "SOLUSDT",label: "SOL",    fullName: "Solana",              category: "crypto",  color: "#10B981" },
  { id: "EURUSD", label: "EUR/USD",fullName: "Euro Dollar",         category: "forex",   color: "#22D3EE" },
  { id: "GBPUSD", label: "GBP/USD",fullName: "Pound Dollar",        category: "forex",   color: "#14B8A6" },
  { id: "USDJPY", label: "USD/JPY",fullName: "Dollar Yen",          category: "forex",   color: "#F59E0B" },
];

export function symbolById(id: string | undefined): SymbolMeta | null {
  if (!id) return null;
  return SYMBOLS.find((s) => s.id === id) ?? null;
}

/* ────────────────────────────────────────────
   R-multiple calculator
   ──────────────────────────────────────────── */

/**
 * Calcula R-multiple real a partir de entry/stop/exit (preços reais).
 *
 * R = (exit - entry) / |entry - stop|   (long)
 * R = (entry - exit) / |entry - stop|   (short)
 */
export function computeRMultiple(
  direction: "long" | "short",
  entry: number,
  stop: number,
  exit: number,
): number {
  const risk = Math.abs(entry - stop);
  if (risk === 0) return 0;
  const pnl = direction === "long" ? exit - entry : entry - exit;
  return pnl / risk;
}

/**
 * Calcula R-multiple esperado (TP hit) — útil pra mostrar no form antes de fechar.
 */
export function computePlannedRR(
  direction: "long" | "short",
  entry: number,
  stop: number,
  target: number,
): number {
  const risk = Math.abs(entry - stop);
  if (risk === 0) return 0;
  const reward = direction === "long" ? target - entry : entry - target;
  return reward / risk;
}

/**
 * Parse RR legado (string) pra display em trades antigos.
 * Aceita "1:3", "1:2.5", "3", "2,5".
 */
export function parseLegacyRR(rr: string, result: "win" | "loss" | "be"): number {
  if (result === "loss") return -1;
  if (result === "be") return 0;
  const raw = rr.trim().replace(",", ".");
  if (!raw) return 0;
  const colon = raw.split(":");
  const target = colon.length > 1 ? colon[colon.length - 1] : colon[0];
  const n = parseFloat(target);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Extrai R de um trade — prefere `rMultiple` salvo, fallback pro legado.
 */
export function tradeR(t: {
  rMultiple?: number;
  rr: string;
  result: "win" | "loss" | "be";
}): number {
  if (typeof t.rMultiple === "number" && Number.isFinite(t.rMultiple)) {
    return t.rMultiple;
  }
  return parseLegacyRR(t.rr, t.result);
}
