import type { TradeEntry } from "./progress";

/* ────────────────────────────────────────────
   Broker Import — transforma trades executados da corretora
   em candidatos importáveis pro diário.

   O endpoint /api/exchange/data retorna `trades` (orders da corretora).
   Cada order que fechou uma posição tem profit != 0. Essas são nossas candidatas.
   ──────────────────────────────────────────── */

/** Order vinda da corretora via /api/exchange/data. */
export interface ExchangeOrder {
  orderId: string;
  symbol: string;
  side: string;                    // "BUY" | "SELL" | "LONG" | "SHORT" (varia por exchange)
  type?: string;
  price: number;                   // preço médio ou preço da ordem
  quantity: number;
  profit: number;                  // P&L realizado em USD (0 se abertura, != 0 se fechamento)
  commission?: number;
  status?: string;
  time: number;                    // ms timestamp
}

/** Candidato de importação — pronto pra virar um TradeEntry com alguns campos pendentes. */
export interface ImportCandidate {
  externalId: string;              // "bingx:orderId"
  exchange: string;
  orderId: string;
  symbol: string;
  direction: "long" | "short";
  /** Entry price pareado da open correspondente (se conseguimos identificar). */
  entryPrice?: number;
  exitPrice: number;
  quantity: number;
  profitUsd: number;               // >0=win, <0=loss, 0=breakeven
  commission: number;
  time: number;                    // ms
  dateBR: string;                  // YYYY-MM-DD (BRT)
  result: "win" | "loss" | "be";
  /** True se esse candidato ainda não foi importado pelo user. */
  alreadyImported: boolean;
}

/**
 * Inverte side do order de fechamento pra descobrir direction original:
 *  - Se fechou com SELL → posição era LONG
 *  - Se fechou com BUY  → posição era SHORT
 */
function inferDirectionFromCloseSide(side: string): "long" | "short" {
  const s = side.toUpperCase();
  if (s.includes("SELL") || s.includes("SHORT")) return "long";
  return "short";
}

function toDateBR(ms: number): string {
  const d = new Date(ms);
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return br.toISOString().split("T")[0];
}

/**
 * Converte orders brutas em ImportCandidates + pareia open/close quando possível.
 *
 * Algoritmo de pareamento:
 *  - Ordena por tempo (mais antigo primeiro)
 *  - Agrupa por símbolo
 *  - Para cada close (profit != 0), procura a open anterior mais recente do mesmo símbolo
 *    com side oposto e qty compatível → usa entry price da open.
 *  - Se não encontrar, entryPrice fica undefined (user completa manualmente).
 */
export function transformOrders(
  exchange: string,
  orders: ExchangeOrder[],
  existingTrades: TradeEntry[],
): ImportCandidate[] {
  const existingIds = new Set(existingTrades.map((t) => t.externalId).filter(Boolean) as string[]);

  // Ordena por tempo crescente pra conseguir parear open → close
  const sorted = [...orders]
    .filter((o) => o.orderId)
    .sort((a, z) => a.time - z.time);

  // Mapa de opens pendentes por símbolo (stack — LIFO)
  const opensBySymbol = new Map<string, ExchangeOrder[]>();
  const seen = new Set<string>();
  const candidates: ImportCandidate[] = [];

  for (const o of sorted) {
    const isClose = Math.abs(o.profit) >= 0.001;

    if (!isClose) {
      // Acumula opens
      if (!opensBySymbol.has(o.symbol)) opensBySymbol.set(o.symbol, []);
      opensBySymbol.get(o.symbol)!.push(o);
      continue;
    }

    if (seen.has(o.orderId)) continue;
    seen.add(o.orderId);

    // Tenta parear com open anterior do mesmo símbolo (side oposto)
    const opens = opensBySymbol.get(o.symbol) ?? [];
    let entryPrice: number | undefined;
    // Pega a última open (LIFO) — mais comum trader fechar posição recém-aberta
    while (opens.length > 0) {
      const open = opens[opens.length - 1];
      const openSide = open.side.toUpperCase();
      const closeSide = o.side.toUpperCase();
      const opposite = (openSide.includes("BUY") || openSide.includes("LONG")) !== (closeSide.includes("BUY") || closeSide.includes("LONG"));
      if (opposite) {
        entryPrice = open.price;
        opens.pop();
        break;
      }
      // Se não for oposto, pula
      opens.pop();
    }

    const externalId = `${exchange}:${o.orderId}`;
    const direction = inferDirectionFromCloseSide(o.side);
    const result: "win" | "loss" | "be" =
      o.profit > 0.001 ? "win" : o.profit < -0.001 ? "loss" : "be";

    candidates.push({
      externalId,
      exchange,
      orderId: o.orderId,
      symbol: o.symbol,
      direction,
      entryPrice,
      exitPrice: o.price,
      quantity: o.quantity,
      profitUsd: o.profit,
      commission: o.commission ?? 0,
      time: o.time,
      dateBR: toDateBR(o.time),
      result,
      alreadyImported: existingIds.has(externalId),
    });
  }

  // Ordena mais recentes primeiro pra UI
  candidates.sort((a, z) => z.time - a.time);
  return candidates;
}

/**
 * Agrega candidates por dia — útil pra UI.
 */
export function groupCandidatesByDate(candidates: ImportCandidate[]): Map<string, ImportCandidate[]> {
  const map = new Map<string, ImportCandidate[]>();
  for (const c of candidates) {
    if (!map.has(c.dateBR)) map.set(c.dateBR, []);
    map.get(c.dateBR)!.push(c);
  }
  return map;
}

/**
 * Calcula R-multiple a partir de entry/stop/exit (preços).
 * Wrapper simples — playbook.ts tem versão canônica.
 */
export function computeR(
  direction: "long" | "short",
  entry: number,
  stop: number,
  exit: number,
): number | null {
  const risk = Math.abs(entry - stop);
  if (risk === 0) return null;
  const pnl = direction === "long" ? exit - entry : entry - exit;
  return pnl / risk;
}

/**
 * Partial TradeEntry com campos pré-preenchidos do broker.
 * User precisa completar entry + stop (SL) + setup/mistakes/notes.
 */
export function candidateToPartial(c: ImportCandidate): Partial<TradeEntry> {
  // Hora BRT do open (ou do close se open não for pareado)
  const ms = c.time;
  const brt = new Date(ms - 3 * 60 * 60 * 1000);
  const hh = String(brt.getUTCHours()).padStart(2, "0");
  const mm = String(brt.getUTCMinutes()).padStart(2, "0");
  const openTime = `${hh}:${mm}`;

  return {
    direction: c.direction,
    symbol: c.symbol,
    exitNum: c.exitPrice,
    size: c.quantity,
    result: c.result,
    externalId: c.externalId,
    source: "broker_import",
    importedFrom: c.exchange,
    openTime,
    followedPlan: false,
    emotionalAfter: 3,
    rr: "",
    entry: "",
    sl: "",
    tp: "",
    notes: "",
  };
}
