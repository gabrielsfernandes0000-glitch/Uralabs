import type { TradeEntry } from "./progress";
import { computeRMultiple } from "./playbook";

/* ────────────────────────────────────────────
   CSV import — fallback pra corretoras sem API suportada.

   Parser resiliente: aceita ; e , como separador, aspas, BOM.
   Quando possível, auto-detecta colunas por fuzzy-match do header.
   Se não rolar, usuário escolhe manualmente no mapping step.

   Suporta 3 formatos de saída comuns:
     - TraderSync CSV export
     - Edgewonk CSV export
     - Export genérico da corretora (MT4/MT5, ninjatrader, etc)
   ──────────────────────────────────────────── */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export interface CsvMapping {
  date: number | null;           // coluna da data
  openTime: number | null;
  symbol: number | null;
  direction: number | null;      // long/short, buy/sell
  entry: number | null;
  stop: number | null;
  target: number | null;
  exit: number | null;
  size: number | null;
  result: number | null;         // win/loss/be — opcional (computado do pnl se não houver)
  pnl: number | null;            // USD — se não tem result, usa pnl pra inferir
  commission: number | null;
  setup: number | null;
  notes: number | null;
  externalId: number | null;
}

export const EMPTY_MAPPING: CsvMapping = {
  date: null, openTime: null, symbol: null, direction: null,
  entry: null, stop: null, target: null, exit: null,
  size: null, result: null, pnl: null, commission: null,
  setup: null, notes: null, externalId: null,
};

/** Parser CSV — aceita separadores mistos, aspas, BOM. */
export function parseCsv(text: string): ParsedCsv {
  // Remove BOM
  let clean = text.replace(/^﻿/, "").trim();
  if (!clean) return { headers: [], rows: [] };

  // Detecta separador — conta mais frequente na primeira linha
  const firstLine = clean.split(/\r?\n/)[0];
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  const sep = semis > commas ? ";" : ",";

  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  const parsed = lines.map((line) => parseLine(line, sep));
  const headers = parsed[0] ?? [];
  const rows = parsed.slice(1).filter((r) => r.some((c) => c.trim()));
  return { headers, rows };
}

function parseLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === sep && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/** Auto-detecta colunas via fuzzy match no header. */
export function autoDetectMapping(headers: string[]): CsvMapping {
  const m: CsvMapping = { ...EMPTY_MAPPING };
  const find = (patterns: RegExp[]): number | null => {
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      for (const p of patterns) if (p.test(h)) return i;
    }
    return null;
  };

  m.date       = find([/^date$/, /trade.?date/, /data/, /open.?date/]);
  m.openTime   = find([/open.?time/, /entry.?time/, /time$/, /hora/]);
  m.symbol     = find([/symbol/, /ticker/, /instrument/, /pair/, /ativo/]);
  m.direction  = find([/side/, /direction/, /type$/, /long.*short/, /lado/, /direção/, /buy.*sell/]);
  m.entry      = find([/entry.?price/, /open.?price/, /entry$/, /preço.?entrada/, /open$/]);
  m.stop       = find([/stop.?loss/, /sl$/, /stop$/, /^sl/]);
  m.target     = find([/take.?profit/, /target/, /tp$/, /^tp/, /alvo/]);
  m.exit       = find([/exit.?price/, /close.?price/, /exit$/, /close$/, /preço.?saída/]);
  m.size       = find([/size/, /qty/, /quantity/, /lot/, /contract/, /qtd/, /quantidade/]);
  m.result     = find([/result/, /win.*loss/, /resultado/]);
  m.pnl        = find([/pnl/, /p\/l/, /profit/, /net.?pnl/, /lucro/, /gain/]);
  m.commission = find([/commission/, /fee/, /taxa/, /comiss/]);
  m.setup      = find([/setup/, /strategy/, /estrateg/, /tag$/]);
  m.notes      = find([/notes?/, /comment/, /memo/, /observ/, /nota/]);
  m.externalId = find([/order.?id/, /trade.?id/, /^id$/, /ticket/]);

  return m;
}

const RESULT_KEYWORDS = {
  win: [/^w/, /^gain/, /^lucro/, /profit/, /ganho/, /positive/],
  loss: [/^l/, /^loss/, /^perda/, /^loser/, /negative/],
  be: [/^b/, /break.?even/, /^zero/, /empate/],
};

function parseResult(raw: string, pnl: number | null): "win" | "loss" | "be" {
  const s = raw.trim().toLowerCase();
  if (s) {
    for (const p of RESULT_KEYWORDS.win) if (p.test(s)) return "win";
    for (const p of RESULT_KEYWORDS.loss) if (p.test(s)) return "loss";
    for (const p of RESULT_KEYWORDS.be) if (p.test(s)) return "be";
  }
  if (pnl != null) {
    if (pnl > 0.001) return "win";
    if (pnl < -0.001) return "loss";
    return "be";
  }
  return "be";
}

function parseNumber(raw: string): number | null {
  if (!raw) return null;
  const clean = raw.replace(/[^\d.,-]/g, "");
  // Heurística BR: se tem . como milhar e , como decimal
  const hasBoth = clean.includes(",") && clean.includes(".");
  let normalized = clean;
  if (hasBoth) {
    const lastComma = clean.lastIndexOf(",");
    const lastDot = clean.lastIndexOf(".");
    if (lastComma > lastDot) {
      // BR format: 1.234,56
      normalized = clean.replace(/\./g, "").replace(",", ".");
    }
  } else if (clean.includes(",")) {
    normalized = clean.replace(",", ".");
  }
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseDirection(raw: string): "long" | "short" | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (/^l/.test(s) || /buy/.test(s) || /compra/.test(s) || /^b$/.test(s)) return "long";
  if (/^s/.test(s) || /sell/.test(s) || /venda/.test(s) || /short/.test(s)) return "short";
  return null;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // Tenta ISO direto
  const iso = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  // DD/MM/YYYY ou DD/MM/YY
  const br = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (br) {
    const y = br[3].length === 2 ? `20${br[3]}` : br[3];
    return `${y}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  }
  // MM/DD/YYYY US (ambíguo mas tenta)
  return null;
}

function parseTime(raw: string): string | null {
  if (!raw) return null;
  const m = raw.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

export interface CsvCandidate {
  rowIdx: number;
  date: string | null;
  openTime: string | null;
  symbol: string;
  direction: "long" | "short" | null;
  entryNum: number | null;
  stopNum: number | null;
  targetNum: number | null;
  exitNum: number | null;
  size: number | null;
  result: "win" | "loss" | "be";
  pnl: number | null;
  setup: string;
  notes: string;
  externalId: string;
  rMultiple: number | null;
  error: string | null;       // razão se candidate é inválido
}

/** Transforma rows + mapping em CsvCandidate[] — valida o mínimo. */
export function rowsToCandidates(
  rows: string[][],
  mapping: CsvMapping,
  sourceLabel: string,
): CsvCandidate[] {
  const pick = (row: string[], idx: number | null): string => {
    if (idx == null) return "";
    return row[idx] ?? "";
  };

  return rows.map((row, rowIdx) => {
    const dateRaw = pick(row, mapping.date);
    const date = parseDate(dateRaw);
    const openTime = parseTime(pick(row, mapping.openTime));
    const symbol = pick(row, mapping.symbol).toUpperCase();
    const direction = parseDirection(pick(row, mapping.direction));
    const entryNum = parseNumber(pick(row, mapping.entry));
    const stopNum = parseNumber(pick(row, mapping.stop));
    const targetNum = parseNumber(pick(row, mapping.target));
    const exitNum = parseNumber(pick(row, mapping.exit));
    const size = parseNumber(pick(row, mapping.size));
    const pnl = parseNumber(pick(row, mapping.pnl));
    const result = parseResult(pick(row, mapping.result), pnl);
    const setup = pick(row, mapping.setup);
    const notes = pick(row, mapping.notes);
    const externalIdRaw = pick(row, mapping.externalId);
    const externalId = externalIdRaw ? `csv:${sourceLabel}:${externalIdRaw}` : `csv:${sourceLabel}:row${rowIdx}`;

    let rMultiple: number | null = null;
    if (direction && entryNum != null && stopNum != null && exitNum != null) {
      rMultiple = computeRMultiple(direction, entryNum, stopNum, exitNum);
    }

    // Validação mínima: precisa date + symbol + direction + entry
    let error: string | null = null;
    if (!date) error = "data inválida ou ausente";
    else if (!symbol) error = "símbolo ausente";
    else if (!direction) error = "direção (long/short) ausente";
    else if (entryNum == null) error = "entry price ausente";

    return {
      rowIdx, date, openTime, symbol, direction,
      entryNum, stopNum, targetNum, exitNum, size,
      result, pnl, setup, notes, externalId, rMultiple, error,
    };
  });
}

/** Converte candidate válido em TradeEntry (sem id/date — useProgress.saveTrade preenche). */
export function candidateToTradeEntry(c: CsvCandidate): Omit<TradeEntry, "id" | "date"> & { date: string } {
  if (!c.date || !c.direction || c.entryNum == null) {
    throw new Error("Candidate inválido — chame após filtrar error === null");
  }
  return {
    date: c.date,
    direction: c.direction,
    entry: c.entryNum.toString(),
    sl: c.stopNum?.toString() ?? "",
    tp: c.targetNum?.toString() ?? "",
    entryNum: c.entryNum,
    stopNum: c.stopNum ?? undefined,
    targetNum: c.targetNum ?? undefined,
    exitNum: c.exitNum ?? undefined,
    size: c.size ?? undefined,
    result: c.result,
    rr: c.rMultiple != null ? c.rMultiple.toFixed(2) : "",
    rMultiple: c.rMultiple ?? undefined,
    symbol: c.symbol,
    openTime: c.openTime ?? undefined,
    setup: c.setup || undefined,
    followedPlan: false,
    emotionalAfter: 3,
    notes: c.notes,
    externalId: c.externalId,
    source: "broker_import",
    importedFrom: "CSV",
  };
}
