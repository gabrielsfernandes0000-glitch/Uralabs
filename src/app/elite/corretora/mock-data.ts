// Mock data dev-only pro dashboard /elite/corretora.
// Ativado via `?mock=1` na URL — gated em runtime por NODE_ENV !== "production".
// Permite explorar/iterar layout do dashboard sem precisar conectar API real
// da corretora.

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function dateKey(offsetDays: number): string {
  const d = new Date(NOW - offsetDays * DAY);
  d.setHours(d.getHours() - 3); // BRT
  return d.toISOString().slice(0, 10);
}

// 30 dias de PnL realizado simulando trader em ramp-up: maioria dias positivos,
// alguns drawdowns realistas. Inclui weekend gaps onde mercado é mais quieto.
const DAILY_PNL = [
  { date: dateKey(29), pnl: 142.50 },  { date: dateKey(28), pnl: -38.20 },
  { date: dateKey(27), pnl: 215.80 },  { date: dateKey(26), pnl: 91.40 },
  { date: dateKey(25), pnl: -125.60 }, { date: dateKey(24), pnl: 0 },
  { date: dateKey(23), pnl: 0 },       { date: dateKey(22), pnl: 67.30 },
  { date: dateKey(21), pnl: 188.70 },  { date: dateKey(20), pnl: -52.10 },
  { date: dateKey(19), pnl: 312.80 },  { date: dateKey(18), pnl: 145.20 },
  { date: dateKey(17), pnl: -89.50 },  { date: dateKey(16), pnl: 0 },
  { date: dateKey(15), pnl: 0 },       { date: dateKey(14), pnl: 230.40 },
  { date: dateKey(13), pnl: -67.80 },  { date: dateKey(12), pnl: 178.90 },
  { date: dateKey(11), pnl: 95.60 },   { date: dateKey(10), pnl: -210.30 },
  { date: dateKey(9),  pnl: 156.40 },  { date: dateKey(8),  pnl: 88.20 },
  { date: dateKey(7),  pnl: 0 },       { date: dateKey(6),  pnl: 0 },
  { date: dateKey(5),  pnl: 412.60 },  { date: dateKey(4),  pnl: 198.30 },
  { date: dateKey(3),  pnl: -78.40 },  { date: dateKey(2),  pnl: 285.70 },
  { date: dateKey(1),  pnl: 124.80 },  { date: dateKey(0),  pnl: 92.30 },
];

// Equity curve reconstruída — começa em ~$8.500 e vai pra ~$11.200 com vol
// realista (drawdowns visíveis).
const START_EQUITY = 8500;
const EQUITY_CURVE = (() => {
  let eq = START_EQUITY;
  return DAILY_PNL.map((d) => {
    eq += d.pnl;
    return { date: d.date, equity: parseFloat(eq.toFixed(2)) };
  });
})();

// Drawdown curve derivado do equity curve
const DRAWDOWN_CURVE = (() => {
  let peak = START_EQUITY;
  return EQUITY_CURVE.map((p) => {
    peak = Math.max(peak, p.equity);
    const dd = p.equity - peak;
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    return { date: p.date, dd: parseFloat(dd.toFixed(2)), ddPct: parseFloat(ddPct.toFixed(2)) };
  });
})();

const FINAL_EQUITY = EQUITY_CURVE[EQUITY_CURVE.length - 1].equity;

// Trades últimos 7 dias — mistura de wins/losses/sizes
const TRADES = [
  { orderId: "1842931", symbol: "BTC-USDT", side: "BUY",  price: 81450.20, quantity: 0.012, profit: 142.30, commission: -0.85, status: "FILLED", time: NOW - 2 * 3600 * 1000,  uraCall: true,  tags: ["killzone", "FVG"], notes: "Entrou no retest do FVG do open NY", stopLoss: 81120, mfe: 220, mae: -45, mfeR: 6.7, maeR: -1.4, liquidated: false },
  { orderId: "1842805", symbol: "ETH-USDT", side: "SELL", price: 2398.45, quantity: 0.85,  profit: -78.40, commission: -0.42, status: "FILLED", time: NOW - 5 * 3600 * 1000,  uraCall: false, tags: ["fora-de-plano"], notes: "FOMO. Não respeitei o trigger.", stopLoss: 2410, mfe: 12, mae: -95, mfeR: 0.4, maeR: -3.2, liquidated: false },
  { orderId: "1842617", symbol: "SOL-USDT", side: "BUY",  price: 178.20, quantity: 5.2, profit: 215.80, commission: -1.10, status: "FILLED", time: NOW - 8 * 3600 * 1000,  uraCall: true,  tags: ["killzone", "OB"], notes: "Order block do D1 + reação no LTF", stopLoss: 175.80, mfe: 290, mae: -32, mfeR: 9.0, maeR: -1.0, liquidated: false },
  { orderId: "1842401", symbol: "BTC-USDT", side: "SELL", price: 82100.50, quantity: 0.008, profit: 67.30, commission: -0.55, status: "FILLED", time: NOW - 26 * 3600 * 1000, uraCall: false, tags: ["scalp"], notes: null, stopLoss: 82280, mfe: 110, mae: -38, mfeR: 4.6, maeR: -1.6, liquidated: false },
  { orderId: "1842315", symbol: "BTC-USDT", side: "BUY",  price: 80920.80, quantity: 0.015, profit: -125.60, commission: -0.95, status: "FILLED", time: NOW - 30 * 3600 * 1000, uraCall: false, tags: ["fora-de-plano"], notes: "Entrou contra-tendência sem confirmação", stopLoss: 80700, mfe: 25, mae: -180, mfeR: 0.3, maeR: -2.0, liquidated: false },
  { orderId: "1842102", symbol: "ETH-USDT", side: "BUY",  price: 2356.80, quantity: 1.20,  profit: 188.70, commission: -0.62, status: "FILLED", time: NOW - 50 * 3600 * 1000, uraCall: true,  tags: ["killzone", "judas"], notes: "Judas swing clássico no open de NY", stopLoss: 2342, mfe: 245, mae: -28, mfeR: 8.7, maeR: -1.0, liquidated: false },
  { orderId: "1841892", symbol: "SOL-USDT", side: "SELL", price: 182.40, quantity: 4.5, profit: 91.40, commission: -0.78, status: "FILLED", time: NOW - 75 * 3600 * 1000, uraCall: true,  tags: ["FVG"], notes: null, stopLoss: 184.20, mfe: 145, mae: -42, mfeR: 4.4, maeR: -1.3, liquidated: false },
  { orderId: "1841654", symbol: "BTC-USDT", side: "BUY",  price: 79850.30, quantity: 0.01, profit: 285.70, commission: -0.72, status: "FILLED", time: NOW - 110 * 3600 * 1000, uraCall: true,  tags: ["killzone", "OB"], notes: "Recuperou na semana", stopLoss: 79580, mfe: 380, mae: -25, mfeR: 11.2, maeR: -0.7, liquidated: false },
  { orderId: "1841488", symbol: "ETH-USDT", side: "SELL", price: 2412.10, quantity: 0.95, profit: 124.80, commission: -0.48, status: "FILLED", time: NOW - 130 * 3600 * 1000, uraCall: false, tags: ["scalp"], notes: null, stopLoss: 2424, mfe: 175, mae: -52, mfeR: 5.0, maeR: -1.5, liquidated: false },
  { orderId: "1841321", symbol: "BNB-USDT", side: "BUY",  price: 615.40, quantity: 1.20, profit: -52.10, commission: -0.36, status: "FILLED", time: NOW - 155 * 3600 * 1000, uraCall: false, tags: ["fora-de-plano"], notes: "Sem setup definido", stopLoss: 612, mfe: 18, mae: -85, mfeR: 0.5, maeR: -2.5, liquidated: false },
];

const WINS = TRADES.filter((t) => t.profit > 0);
const LOSSES = TRADES.filter((t) => t.profit < 0);
const TOTAL_PNL = TRADES.reduce((s, t) => s + t.profit, 0);
const AVG_WIN = WINS.length ? WINS.reduce((s, t) => s + t.profit, 0) / WINS.length : 0;
const AVG_LOSS = LOSSES.length ? LOSSES.reduce((s, t) => s + t.profit, 0) / LOSSES.length : 0;
const PROFIT_FACTOR = LOSSES.length ? Math.abs(WINS.reduce((s, t) => s + t.profit, 0) / LOSSES.reduce((s, t) => s + t.profit, 0)) : 999;

const METRICS = {
  totalTrades: TRADES.length,
  wins: WINS.length,
  losses: LOSSES.length,
  winRate: (WINS.length / TRADES.length) * 100,
  totalPnL: TOTAL_PNL,
  avgPnL: TOTAL_PNL / TRADES.length,
  bestTrade: Math.max(...TRADES.map((t) => t.profit)),
  worstTrade: Math.min(...TRADES.map((t) => t.profit)),
  avgWin: AVG_WIN,
  avgLoss: AVG_LOSS,
  profitFactor: PROFIT_FACTOR,
  expectancy: ((WINS.length / TRADES.length) * AVG_WIN) + ((LOSSES.length / TRADES.length) * AVG_LOSS),
  currentStreak: 2,
  currentStreakType: "win" as const,
  maxWinStreak: 4,
  maxLossStreak: 2,
};

// URA call vs solo split
const URA_TRADES = TRADES.filter((t) => t.uraCall);
const SOLO_TRADES = TRADES.filter((t) => !t.uraCall);
const splitOf = (list: typeof TRADES) => {
  const w = list.filter((t) => t.profit > 0);
  const l = list.filter((t) => t.profit < 0);
  const total = list.reduce((s, t) => s + t.profit, 0);
  const avgW = w.length ? w.reduce((s, t) => s + t.profit, 0) / w.length : 0;
  const avgL = l.length ? l.reduce((s, t) => s + t.profit, 0) / l.length : 0;
  return {
    totalTrades: list.length,
    wins: w.length,
    losses: l.length,
    winRate: list.length ? (w.length / list.length) * 100 : 0,
    totalPnL: total,
    avgPnL: list.length ? total / list.length : 0,
    bestTrade: list.length ? Math.max(...list.map((t) => t.profit)) : 0,
    worstTrade: list.length ? Math.min(...list.map((t) => t.profit)) : 0,
    avgWin: avgW,
    avgLoss: avgL,
    profitFactor: l.length ? Math.abs(w.reduce((s, t) => s + t.profit, 0) / l.reduce((s, t) => s + t.profit, 0)) : 999,
    expectancy: list.length ? ((w.length / list.length) * avgW) + ((l.length / list.length) * avgL) : 0,
    currentStreak: 0,
    currentStreakType: "none" as const,
    maxWinStreak: 0,
    maxLossStreak: 0,
  };
};

// Posições abertas (2 ativas)
const POSITIONS = [
  { symbol: "BTC-USDT", side: "LONG",  size: 0.025, entryPrice: 81200.50, markPrice: 81545.80, unrealizedPnL: 86.33, leverage: "10", marginType: "isolated", liquidationPrice: 73080.45 },
  { symbol: "ETH-USDT", side: "SHORT", size: 1.50, entryPrice: 2412.30, markPrice: 2398.45, unrealizedPnL: 20.78, leverage: "5", marginType: "isolated", liquidationPrice: 2664.05 },
];

// Open orders pendentes
const OPEN_ORDERS = [
  { orderId: "1843001", symbol: "SOL-USDT", side: "BUY",  type: "LIMIT", price: 175.50, quantity: 5.0,  stopPrice: null,  triggerType: null, time: NOW - 2 * 3600 * 1000,  status: "NEW" },
  { orderId: "1843002", symbol: "BTC-USDT", side: "SELL", type: "STOP_MARKET", price: null, quantity: 0.01, stopPrice: 80800, triggerType: "stop", time: NOW - 1 * 3600 * 1000, status: "NEW" },
];

// Symbol breakdown
const SYMBOL_BREAKDOWN = [
  { symbol: "BTC", pnl: 369.70, trades: 4, wins: 3 },
  { symbol: "ETH", pnl: 235.10, trades: 3, wins: 2 },
  { symbol: "SOL", pnl: 307.20, trades: 2, wins: 2 },
  { symbol: "BNB", pnl: -52.10, trades: 1, wins: 0 },
];

// Hourly breakdown — picos de PnL na sessão NY (BRT 10:30-12:30)
const HOURLY_BREAKDOWN = Array.from({ length: 24 }, (_, h) => {
  const ny = h >= 10 && h <= 12;
  const lunch = h >= 13 && h <= 14;
  return {
    hour: h,
    pnl: ny ? 180 + Math.random() * 200 : lunch ? -40 - Math.random() * 60 : (h >= 9 && h <= 17 ? 30 + Math.random() * 80 - 40 : 0),
    trades: ny ? 3 + Math.floor(Math.random() * 2) : lunch ? 1 : (h >= 9 && h <= 17 ? Math.floor(Math.random() * 2) : 0),
  };
}).map((r) => ({ ...r, pnl: parseFloat(r.pnl.toFixed(2)) }));

// Day of week breakdown — segunda/terça melhores, sexta pior
const DOW_BREAKDOWN = [
  { dow: 0, name: "Dom", pnl: 0, trades: 0 },
  { dow: 1, name: "Seg", pnl: 412.30, trades: 8, wins: 6 },
  { dow: 2, name: "Ter", pnl: 285.40, trades: 7, wins: 5 },
  { dow: 3, name: "Qua", pnl: 156.80, trades: 6, wins: 4 },
  { dow: 4, name: "Qui", pnl: 89.20, trades: 5, wins: 3 },
  { dow: 5, name: "Sex", pnl: -68.40, trades: 4, wins: 1 },
  { dow: 6, name: "Sáb", pnl: 0, trades: 0 },
];

// Tag stats
const TAG_STATS = [
  { tag: "killzone", count: 4, wins: 4, pnl: 832.50, winRate: 100 },
  { tag: "FVG", count: 2, wins: 2, pnl: 233.70, winRate: 100 },
  { tag: "OB", count: 2, wins: 2, pnl: 501.50, winRate: 100 },
  { tag: "fora-de-plano", count: 3, wins: 0, pnl: -256.10, winRate: 0 },
  { tag: "scalp", count: 2, wins: 2, pnl: 192.10, winRate: 100 },
  { tag: "judas", count: 1, wins: 1, pnl: 188.70, winRate: 100 },
];

// R-multiples
const R_MULTIPLES = {
  count: 10,
  totalR: 18.4,
  avgR: 1.84,
  bestR: 11.2,
  worstR: -3.2,
};

// Event exposure
const EVENT_EXPOSURE = {
  totalTrades: 10,
  exposedClosed: 3,
  exposedWinRate: 66.7,
  exposedPnL: 245.40,
  exposedPctOfAll: 30,
};

// Funding fees por símbolo
const FUNDING_BY_SYMBOL: Record<string, number> = {
  "BTC-USDT": -2.45,
  "ETH-USDT": -1.20,
  "SOL-USDT": 0.85,
};

const TOTAL_COMMISSION = TRADES.reduce((s, t) => s + (t.commission || 0), 0);

export const MOCK_CONNECTIONS = [
  {
    exchange: "bingx" as const,
    label: "Conta principal",
    status: "active",
    error_message: null,
    connected_at: new Date(NOW - 14 * DAY).toISOString(),
    last_sync_at: new Date(NOW - 30_000).toISOString(),
  },
];

export const MOCK_DATA = {
  connected: true,
  exchange: "bingx",
  userId: "dev-mock",
  cached: false,
  label: "Conta principal",
  balance: {
    totalEquity: FINAL_EQUITY + 107.11, // soma com unrealized pra simular conta real
    availableMargin: 9842.50,
    usedMargin: 1364.61,
    unrealizedPnL: 107.11,
    realisedPnL: TOTAL_PNL,
  },
  positions: POSITIONS,
  trades: TRADES,
  openOrders: OPEN_ORDERS,
  forceOrders: [],
  metrics: METRICS,
  metricsSplit: {
    all: METRICS,
    followingUra: splitOf(URA_TRADES),
    solo: splitOf(SOLO_TRADES),
  },
  equityCurve: EQUITY_CURVE,
  realEquityCurve: EQUITY_CURVE,
  drawdownCurve: DRAWDOWN_CURVE,
  maxDrawdown: DRAWDOWN_CURVE.reduce((min, p) => (p.dd < min.dd ? p : min), DRAWDOWN_CURVE[0]),
  dailyPnL: DAILY_PNL,
  symbolBreakdown: SYMBOL_BREAKDOWN,
  hourlyBreakdown: HOURLY_BREAKDOWN,
  dowBreakdown: DOW_BREAKDOWN,
  tagStats: TAG_STATS,
  rMultiples: R_MULTIPLES,
  eventExposure: EVENT_EXPOSURE,
  propStatus: null,
  fundingBySymbol: FUNDING_BY_SYMBOL,
  totalCommission: TOTAL_COMMISSION,
};
