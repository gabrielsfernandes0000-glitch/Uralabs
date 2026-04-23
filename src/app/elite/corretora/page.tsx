"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Link2, Unlink, RefreshCw, TrendingUp,
  Target, BarChart3, ArrowUp, ArrowDown,
  Shield, Eye, EyeOff, AlertCircle,
  ChevronRight, ChevronLeft, Zap, Minus,
  Plus, Check,
} from "lucide-react";
import { EquityCurve } from "@/components/elite/corretora/EquityCurve";
import { DrawdownCurve } from "@/components/elite/corretora/DrawdownCurve";
import { PnLHeatmap } from "@/components/elite/corretora/PnLHeatmap";
import { SymbolBreakdown, HourlyBreakdown, DowBreakdown } from "@/components/elite/corretora/Breakdowns";
import { TradeJournal, type JournalTrade } from "@/components/elite/corretora/TradeJournal";
import { TradeDetailModal, type TradeForModal } from "@/components/elite/corretora/TradeDetailModal";
import { UraCallSplit, EventExposureCard, TagBreakdown, RMultiplesCard, PropRulesBanner } from "@/components/elite/corretora/Insights";
import { PropRulesModal } from "@/components/elite/corretora/PropRulesModal";
import { OpenOrdersCard, type OpenOrder } from "@/components/elite/corretora/OpenOrdersCard";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type ExchangeId = "bingx" | "binance" | "bybit" | "okx" | "bitget";

interface ExchangeMeta {
  id: ExchangeId;
  name: string;
  color: string;       // accent / text color
  bg: string;          // button background
  bgHover: string;     // button hover background
  textColor: string;   // text on button
  shortLabel: string;
  logo: string;        // path to logo in /public/exchanges/
  needsPassphrase: boolean;
  desc: string;
  tutorial: string[];
}

const EXCHANGES: ExchangeMeta[] = [
  {
    id: "bingx", name: "BingX", color: "#2b6af5",
    bg: "#1a3a8a", bgHover: "#1e44a0", textColor: "#ffffff",
    shortLabel: "Bx", logo: "/exchanges/bingx.png", needsPassphrase: false,
    desc: "Futures Perpetuo • Spot",
    tutorial: [
      "Acesse bingx.com → Conta → Gerenciamento de API",
      "Clique em \"Criar API\" → defina um nome (ex: \"URA Labs\")",
      "Marque SOMENTE \"Leitura\" — nao ative trade nem saque",
      "Copie a API Key e a Secret Key",
      "Cole aqui no formulario",
    ],
  },
  {
    id: "binance", name: "Binance", color: "#F0B90B",
    bg: "#F0B90B", bgHover: "#d4a40a", textColor: "#000000",
    shortLabel: "Bn", logo: "/exchanges/binance.png", needsPassphrase: false,
    desc: "Futures USDT-M • Coin-M",
    tutorial: [
      "Acesse binance.com → Perfil → Gerenciamento de API",
      "Clique em \"Criar API\" → escolha \"System Generated\"",
      "Desmarque TUDO e marque somente \"Leitura\"",
      "Adicione restricao de IP se quiser (recomendado)",
      "Copie API Key e Secret Key → cole aqui",
    ],
  },
  {
    id: "bybit", name: "Bybit", color: "#FF5500",
    bg: "#FF5500", bgHover: "#e04d00", textColor: "#ffffff",
    shortLabel: "B", logo: "", needsPassphrase: false,
    desc: "Unified Trading Account",
    tutorial: [
      "Acesse bybit.com → Conta → API",
      "Clique em \"Criar Nova Chave\" → selecione \"Chave de API do sistema\"",
      "Marque somente \"Leitura\" nas permissoes",
      "Copie API Key e Secret Key",
      "Cole aqui no formulario",
    ],
  },
  {
    id: "okx", name: "OKX", color: "#ffffff",
    bg: "#222222", bgHover: "#2a2a2a", textColor: "#ffffff",
    shortLabel: "OK", logo: "/exchanges/okx.png", needsPassphrase: true,
    desc: "Unified Account • Requer Passphrase",
    tutorial: [
      "Acesse okx.com → Perfil → API",
      "Clique em \"Criar chave de API V5\"",
      "Defina um nome e uma Passphrase (voce vai precisar dela aqui)",
      "Marque somente \"Leitura\" nas permissoes",
      "Copie API Key, Secret Key e a Passphrase → cole aqui",
    ],
  },
  {
    id: "bitget", name: "Bitget", color: "#00f0ff",
    bg: "#00CED1", bgHover: "#00b8bb", textColor: "#000000",
    shortLabel: "Bg", logo: "/exchanges/bitget.png", needsPassphrase: true,
    desc: "USDT-M Futures • Requer Passphrase",
    tutorial: [
      "Acesse bitget.com → Perfil → Gerenciamento de API",
      "Clique em \"Criar API\"",
      "Defina um nome e uma Passphrase (voce vai precisar dela aqui)",
      "Marque somente \"Leitura\" nas permissoes",
      "Copie API Key, Secret Key e Passphrase → cole aqui",
    ],
  },
];

interface Balance {
  totalEquity: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnL: number;
  realisedPnL: number;
}

interface Position {
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnL: number;
  leverage: string;
  marginType: string;
  liquidationPrice: number;
}

interface Trade {
  orderId: string;
  symbol: string;
  side: string;
  price: number;
  quantity: number;
  profit: number;
  commission?: number;
  status: string;
  time: number;
  uraCall?: boolean;
  tags?: string[];
  notes?: string | null;
  stopLoss?: number | null;
  liquidated?: boolean;
  mfe?: number | null;
  mae?: number | null;
  mfeR?: number | null;
  maeR?: number | null;
}

interface Metrics {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  currentStreak: number;
  currentStreakType: "win" | "loss" | "none";
  maxWinStreak: number;
  maxLossStreak: number;
}

interface EquityPoint { date: string; equity: number }
interface DailyPnL { date: string; pnl: number }
interface SymbolRow { symbol: string; pnl: number; trades: number; wins: number }
interface HourRow { hour: number; pnl: number; trades: number }
interface DowRow { dow: number; name: string; pnl: number; trades: number }

interface MetricsSplit { all: Metrics; followingUra: Metrics; solo: Metrics }
interface DrawdownPoint { date: string; dd: number; ddPct: number }
interface EventExposure { totalTrades: number; exposedClosed: number; exposedWinRate: number; exposedPnL: number; exposedPctOfAll: number }
interface TagStat { tag: string; count: number; wins: number; pnl: number; winRate: number }
interface RMultiples { count: number; totalR: number; avgR: number; bestR: number; worstR: number }
interface PropStatus {
  firmName: string | null;
  accountSize: number;
  dailyLoss: { used: number; limit: number | null; pct: number; remaining: number | null };
  maxLoss: { used: number; limit: number | null; pct: number; remaining: number | null };
  profitTarget: { progress: number; target: number | null; pct: number; remaining: number | null };
}

interface ExchangeData {
  connected: boolean;
  exchange?: string;
  cached?: boolean;
  error?: string;
  balance?: Balance;
  positions?: Position[];
  trades?: Trade[];
  metrics?: Metrics;
  metricsSplit?: MetricsSplit;
  equityCurve?: EquityPoint[];
  realEquityCurve?: EquityPoint[];
  drawdownCurve?: DrawdownPoint[];
  maxDrawdown?: DrawdownPoint;
  dailyPnL?: DailyPnL[];
  symbolBreakdown?: SymbolRow[];
  hourlyBreakdown?: HourRow[];
  dowBreakdown?: DowRow[];
  tagStats?: TagStat[];
  rMultiples?: RMultiples;
  eventExposure?: EventExposure;
  propStatus?: PropStatus | null;
  forceOrders?: Array<{ orderId: string; symbol: string; side: string; price: number; quantity: number; time: number }>;
  openOrders?: OpenOrder[];
  totalCommission?: number;
  fundingBySymbol?: Record<string, number>;
  label?: string;
}

interface Connection {
  exchange: ExchangeId;
  label: string | null;
  status: string;
  error_message: string | null;
  connected_at: string;
  last_sync_at: string | null;
}

/* ────────────────────────────────────────────
   Connect Form
   ──────────────────────────────────────────── */

function ConnectForm({ onConnected, connectedExchanges }: { onConnected: () => void; connectedExchanges: ExchangeId[] }) {
  const [selected, setSelected] = useState<ExchangeMeta | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [label, setLabel] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setApiKey(""); setApiSecret(""); setPassphrase(""); setLabel("");
    setError(""); setShowSecret(false);
  };

  const handleConnect = async () => {
    if (!selected) return;
    if (!apiKey.trim() || !apiSecret.trim()) { setError("Preencha API Key e Secret Key"); return; }
    if (selected.needsPassphrase && !passphrase.trim()) { setError("Preencha a Passphrase"); return; }

    setLoading(true);
    setError("");

    // Abort controller pra timeout — backend leva ~5s validando key na corretora.
    // Se passar de 20s, provavelmente API da exchange está down/lenta.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch("/api/exchange/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          exchange: selected.id,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          passphrase: passphrase.trim() || undefined,
          label: label.trim() || undefined,
        }),
      });

      // Parse JSON de forma segura — 502/504 podem vir em HTML.
      let data: { error?: string; hint?: string } = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError(data.error || "API Key inválida — verifique se copiou certo e se tem permissão de leitura");
        } else if (res.status === 429) {
          setError("Muitas tentativas — espere 1 min antes de tentar de novo");
        } else if (res.status >= 500) {
          setError(data.error || `${selected.name} fora do ar no momento. Tente em alguns minutos.`);
        } else {
          setError(data.error || `Erro ao conectar (${res.status})`);
        }
        return;
      }
      resetForm();
      setSelected(null);
      onConnected();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(`${selected.name} demorou demais pra responder. Tente novamente.`);
      } else if (err instanceof TypeError) {
        // fetch lança TypeError em falha de rede/offline/CORS
        setError("Sem conexão com o servidor. Checa sua internet.");
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Form view
  if (selected) {
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-4">
        <button onClick={() => { setSelected(null); resetForm(); }} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>

        {/* Card surface neutro — partner brand vira apenas accent no logo + CTA,
            não invade o background inteiro. Evita o "azul gritando" do screenshot. */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] p-7">
          {/* Faixa superior com accent brand-parceiro — cue sutil de qual corretora é */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: selected.color }} />

          <div className="relative z-10 flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: selected.color + "15", border: `1px solid ${selected.color}33` }}
            >
              {selected.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selected.logo} alt={selected.name} className="w-7 h-7 object-contain" />
              ) : (
                <span className="text-[16px] font-black italic" style={{ color: selected.color }}>{selected.shortLabel}</span>
              )}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white">Conectar {selected.name}</h2>
              <p className="text-[11px] text-white/40">API Key somente leitura</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-white/70 mb-1.5">API Key</label>
              <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cole sua API Key aqui"
                className="w-full px-3.5 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.04] transition-colors font-mono" />
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-white/70 mb-1.5">Secret Key</label>
              <div className="relative">
                <input type={showSecret ? "text" : "password"} value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Cole sua Secret Key aqui"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-md bg-white/[0.02] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.04] transition-colors font-mono" />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="interactive-tap absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/75 transition-colors">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {selected.needsPassphrase && (
              <div>
                <label className="block text-[11.5px] font-semibold text-white/70 mb-1.5">Passphrase</label>
                <input type={showSecret ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Passphrase definida na criação da API"
                  className="w-full px-3.5 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.04] transition-colors font-mono" />
              </div>
            )}

            <div>
              <label className="block text-[11.5px] font-semibold text-white/70 mb-1.5">Apelido <span className="text-white/35 font-normal">(opcional)</span></label>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Conta principal"
                className="w-full px-3.5 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.04] transition-colors" />
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-md border-l-2 border-red-400 bg-red-500/[0.06]">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[12px] text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <button onClick={handleConnect} disabled={loading}
              className="interactive w-full py-3 rounded-md text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: selected.color, color: selected.id === "binance" || selected.id === "bybit" ? "#000" : "#fff" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Validando...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Link2 className="w-3.5 h-3.5" /> Conectar {selected.name}</span>
              )}
            </button>
          </div>
        </div>

        {/* Tutorial */}
        <div className="relative overflow-hidden rounded-xl bg-white/[0.02] p-6">
          <h3 className="text-[14px] font-semibold text-white/80 mb-4">Como gerar sua API Key na {selected.name}</h3>
          <ol className="space-y-3">
            {selected.tutorial.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[11px] font-bold text-white/40 mt-0.5">{i + 1}</span>
                <span className="text-[13px] text-white/40 leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Shield className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-white/30 leading-relaxed">
              Suas keys são encriptadas com AES-256-GCM antes de serem salvas. Nunca temos acesso a trades ou saques.
            </p>
          </div>

          <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.02]">
            <AlertCircle className="w-4 h-4 text-amber-400/70 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="text-[11.5px] text-amber-200/80 leading-relaxed font-semibold">
                Importante — risco de ban por copy trade
              </p>
              <p className="text-[10.5px] text-white/45 leading-relaxed">
                URA Labs <span className="text-white/70">só lê</span> sua conta — nunca roteia ordens. Mas mesa prop (FTMO, MFF, Apex) detecta same-IP e bane contas em batch quando vários traders executam a mesma call em segundos.
              </p>
              <p className="text-[10.5px] text-white/45 leading-relaxed">
                <span className="text-white/65">Use API key read-only sempre.</span> Nunca cole aqui chave com permissão de trade. Se opera mesa prop, execute as calls pelo terminal da mesa no seu próprio PC, <span className="text-white/65">nunca por script automatizado</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exchange selector view
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Compact header */}
      <div className="animate-in-up flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight">Conectar Corretora</h1>
          <p className="text-[13px] text-white/40 mt-1 max-w-xl">
            Conecte sua conta para ver performance, PnL e posições abertas — tudo em um lugar só.
          </p>
        </div>

        {/* Security badges — compact inline */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: Shield, title: "Somente leitura" },
            { icon: Eye,    title: "Dados privados" },
            { icon: Zap,    title: "AES-256" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
              <item.icon className="w-3 h-3 text-white/35" />
              <span className="text-[10.5px] text-white/50 font-medium">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange grid — 2 columns on md, 3 on lg */}
      <div className="animate-in-up delay-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXCHANGES.map((ex) => {
          const isConnected = connectedExchanges.includes(ex.id);
          return (
            <button
              key={ex.id}
              onClick={() => !isConnected && setSelected(ex)}
              disabled={isConnected}
              className={`interactive w-full relative overflow-hidden rounded-xl transition-all duration-300 p-[1px] text-left group ${
                isConnected ? "opacity-50 cursor-default" : "hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `linear-gradient(135deg, ${ex.color}40, transparent 60%)` }} />

              {/* Button body */}
              <div className="relative rounded-xl px-4 py-4 transition-colors" style={{ backgroundColor: isConnected ? "#111" : ex.bg }}>
                {/* Subtle glow */}
                <div className="absolute top-0 left-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 50%, ${ex.color}30, transparent 70%)` }} />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {ex.logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={ex.logo} alt={ex.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-[18px] font-black italic" style={{ color: ex.textColor }}>{ex.shortLabel}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold truncate" style={{ color: ex.textColor }}>{ex.name}</h3>
                      <p className="text-[10.5px] mt-0.5 truncate" style={{ color: ex.textColor + "55" }}>{ex.desc}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 shrink-0">
                      <Check className="w-2.5 h-2.5" strokeWidth={2.6} /> conectado
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 transition-all group-hover:translate-x-0.5" style={{ color: ex.textColor + "50" }} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Porque conectar + Segurança + Passo-a-passo — preenche o espaço abaixo dos cards com conteúdo útil */}
      <div className="animate-in-up delay-2 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-xl surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-white/55" strokeWidth={1.8} />
            <h3 className="text-[12px] font-bold text-white/85">Por que conectar</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              { title: "PnL automático no diário", desc: "Trades importados direto, sem preencher à mão." },
              { title: "Performance real em tempo real", desc: "Equity, drawdown e streak calculados do que rola na conta." },
              { title: "Posições abertas aqui na plataforma", desc: "Evita trocar de aba pra olhar a corretora." },
              { title: "Base pra ranking e conquistas", desc: "Trades reais validam badges Trading e ranking entre membros." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-white/85 leading-tight">{item.title}</p>
                  <p className="text-[11px] text-white/45 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-white/55" strokeWidth={1.8} />
            <h3 className="text-[12px] font-bold text-white/85">Segurança das chaves</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              { title: "Somente leitura — sempre", desc: "A permissão de trade deve ficar DESLIGADA na corretora. A gente nunca executa ordem." },
              { title: "Criptografia AES-256", desc: "Chaves guardadas encriptadas. Nem URA consegue ler em texto puro." },
              { title: "IP whitelist (quando suportado)", desc: "OKX, Bitget e Binance permitem restringir IPs — use." },
              { title: "Revogue a qualquer momento", desc: "Desconectar aqui remove as chaves. Revogar na corretora também funciona." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-white/85 leading-tight">{item.title}</p>
                  <p className="text-[11px] text-white/45 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-white/55" strokeWidth={1.8} />
            <h3 className="text-[12px] font-bold text-white/85">Como conectar em 3 passos</h3>
          </div>
          <ol className="space-y-2.5">
            {[
              { title: "Crie uma API key na corretora", desc: "Permissões: leitura apenas. Nunca ligue trade/saque." },
              { title: "Cole aqui chave e secret", desc: "A gente encripta AES-256 antes de salvar." },
              { title: "Pronto — trades aparecem sozinhos", desc: "Atualiza a cada 5min no dashboard e no diário." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-brand-500/15 text-brand-400 text-[10px] font-bold font-mono flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-white/85 leading-tight">{item.title}</p>
                  <p className="text-[11px] text-white/45 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-[10.5px] text-white/30 mt-3 pt-3 border-t border-white/[0.04]">
            Tutorial detalhado abre quando você escolhe a corretora acima.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Dashboard (connected state)
   ──────────────────────────────────────────── */

type Period = "7d" | "30d" | "all";

function Dashboard({ exchange, data, onRefresh, onDisconnect, refreshing, onAddMore }: {
  exchange: ExchangeMeta;
  data: ExchangeData;
  onRefresh: () => void;
  onDisconnect: () => void;
  refreshing: boolean;
  onAddMore: () => void;
}) {
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [period, setPeriod] = useState<Period>("7d");
  const [openTrade, setOpenTrade] = useState<TradeForModal | null>(null);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);
  const [showPropRules, setShowPropRules] = useState(false);
  const [propRulesExisting, setPropRulesExisting] = useState<{
    firm_name: string | null;
    account_size_usd: number | null;
    daily_loss_limit_usd: number | null;
    max_loss_limit_usd: number | null;
    profit_target_usd: number | null;
  } | null>(null);

  const balance = data.balance;
  const positions = data.positions || [];
  const trades = data.trades || [];
  const metrics = data.metrics;
  const metricsSplit = data.metricsSplit;
  const equityCurve = data.equityCurve || [];
  const realEquityCurve = data.realEquityCurve || [];
  const drawdownCurve = data.drawdownCurve || [];
  const dailyPnL = data.dailyPnL || [];
  const symbolBreakdown = data.symbolBreakdown || [];
  const hourlyBreakdown = data.hourlyBreakdown || [];
  const dowBreakdown = data.dowBreakdown || [];
  const tagStats = data.tagStats || [];
  const rMultiples = data.rMultiples;
  const eventExposure = data.eventExposure;
  const propStatus = data.propStatus || null;
  const openOrders = data.openOrders || [];
  const forceOrders = data.forceOrders || [];
  const totalCommission = data.totalCommission || 0;

  // Busca tags permitidas sob demanda (cache simples)
  useEffect(() => {
    if (allowedTags.length === 0) {
      fetch(`/api/exchange/trade-meta?exchange=${exchange.id}`)
        .then((r) => r.json())
        .then((d) => setAllowedTags(d.allowedTags || []))
        .catch(() => {});
    }
  }, [exchange.id, allowedTags.length]);

  const openPropRulesModal = async () => {
    try {
      const res = await fetch(`/api/exchange/prop-rules?exchange=${exchange.id}`);
      const d = await res.json();
      setPropRulesExisting(d.rules || null);
    } catch {
      setPropRulesExisting(null);
    }
    setShowPropRules(true);
  };

  const fmtUsd = (n: number) => {
    if (hideBalance) return "$••••";
    const prefix = n >= 0 ? "$" : "-$";
    return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const pnlColor = (n: number) => n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "text-white/40";

  const curve = useMemo(() => {
    // Preferir curva real (snapshots diários) se tiver ≥3 pontos; senão usa reconstruída
    const src = realEquityCurve.length >= 3 ? realEquityCurve : equityCurve;
    if (!src.length) return [];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : src.length;
    return src.slice(-days);
  }, [realEquityCurve, equityCurve, period]);

  const periodPnL = useMemo(() => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : dailyPnL.length;
    return dailyPnL.slice(-days).reduce((s, d) => s + d.pnl, 0);
  }, [dailyPnL, period]);

  const equityAtStart = curve.length ? curve[0].equity : 0;
  const periodPct = equityAtStart !== 0 ? (periodPnL / equityAtStart) * 100 : 0;

  if (data.error) {
    return (
      <div className="max-w-lg mx-auto pt-12">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" strokeWidth={1.5} />
          <h2 className="text-[20px] font-bold text-white mb-2">Erro na conexão com {exchange.name}</h2>
          <p className="text-[13px] text-white/40 mb-6 max-w-sm">{data.error}</p>
          <div className="flex gap-3">
            <button onClick={onRefresh} className="interactive-tap px-5 py-2.5 rounded-xl border border-white/[0.08] text-[13px] text-white/60 hover:text-white hover:border-white/[0.18] transition-colors">Tentar novamente</button>
            <button onClick={onDisconnect} className="interactive-tap px-5 py-2.5 rounded-xl border border-red-400/25 text-[13px] text-red-400 hover:border-red-400/50 transition-colors">Reconectar</button>
          </div>
        </div>
      </div>
    );
  }

  const openPositionsTotal = positions.reduce((s, p) => s + p.unrealizedPnL, 0);

  return (
    <div className="space-y-5">
      {/* Header — logo + status à esquerda, ações agrupadas à direita */}
      <div className="animate-in-up flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {exchange.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={exchange.logo} alt={exchange.name} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-[16px] font-black italic" style={{ color: exchange.textColor }}>{exchange.shortLabel}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-bold text-white tracking-tight">{exchange.name}</h1>
              <span className="inline-flex items-center gap-1.5 text-[9.5px] font-semibold text-green-400 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> conectada
              </span>
              <span className="text-[9.5px] text-white/25 font-mono flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-400/70 animate-pulse" />
                auto ·&nbsp;30s
              </span>
            </div>
            {data.label && <p className="text-[11px] text-white/30 truncate">{data.label}</p>}
          </div>
        </div>

        {/* Grupo ações: Conta (benignas) · destrutivas */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setHideBalance(!hideBalance)} className="interactive-tap p-2 rounded-lg text-white/35 hover:text-white/75 hover:bg-white/[0.03] transition-all" title={hideBalance ? "Mostrar valores" : "Ocultar valores"}>
            {hideBalance ? <EyeOff className="w-[15px] h-[15px]" /> : <Eye className="w-[15px] h-[15px]" />}
          </button>
          <button onClick={onRefresh} disabled={refreshing} className="interactive-tap p-2 rounded-lg text-white/35 hover:text-white/75 hover:bg-white/[0.03] transition-all disabled:opacity-40" title="Atualizar">
            <RefreshCw className={`w-[15px] h-[15px] ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onAddMore} className="interactive-tap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-[11.5px] text-white/55 hover:text-white hover:border-white/[0.18] transition-all" title="Conectar outra corretora">
            <Plus className="w-3.5 h-3.5" /> Nova
          </button>
          <div className="w-px h-5 bg-white/[0.08] mx-1" />
          <button onClick={() => setShowDisconnect(!showDisconnect)} className="interactive-tap p-2 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/[0.04] transition-all" title="Desconectar">
            <Unlink className="w-[15px] h-[15px]" />
          </button>
        </div>
      </div>

      {showDisconnect && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-red-400/20 bg-red-500/[0.03]">
          <p className="text-[12.5px] text-white/60">Desconectar {exchange.name}? As keys serão removidas — trades ficam no histórico.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDisconnect(false)} className="interactive-tap px-3 py-1.5 rounded-md text-[11.5px] text-white/45 hover:text-white/80 transition-colors">Cancelar</button>
            <button onClick={onDisconnect} className="interactive-tap px-3 py-1.5 rounded-md border border-red-400/30 text-[11.5px] text-red-400 font-medium hover:border-red-400/60 transition-colors">Confirmar</button>
          </div>
        </div>
      )}

      {/* Prop rules banner (opcional) */}
      <PropRulesBanner status={propStatus} onConfigure={openPropRulesModal} />

      {/* HERO — Equity curve (60%) + KPI stack (40%) */}
      <div className="animate-in-up delay-1 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        {/* Equity curve */}
        <div className="rounded-xl surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10.5px] font-semibold text-white/40 uppercase tracking-wider">Evolução do patrimônio</p>
              <p className="text-[11px] text-white/30 mt-0.5">
                {curve.length >= 3 && realEquityCurve.length >= 3 ? "Snapshots reais" : "Reconstruído via histórico"}
                {period === "7d" ? " · últimos 7 dias" : period === "30d" ? " · últimos 30 dias" : " · todo histórico"}
              </p>
            </div>
            <div className="flex gap-0.5 p-0.5 rounded-md bg-white/[0.03] border border-white/[0.04]">
              {(["7d", "30d", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`interactive-tap px-2.5 py-1 rounded text-[10.5px] font-mono font-medium tabular-nums transition-all ${
                    period === p ? "bg-white/[0.06] text-white" : "text-white/35 hover:text-white/65"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <EquityCurve data={curve} height={170} />
          {drawdownCurve.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <DrawdownCurve data={drawdownCurve.slice(-(period === "7d" ? 7 : period === "30d" ? 30 : drawdownCurve.length))} height={60} />
            </div>
          )}
        </div>

        {/* KPI stack: Patrimônio · PnL período · Posições */}
        <div className="space-y-3">
          {balance && (
            <div className="rounded-xl surface-card p-5">
              <p className="text-[10.5px] font-semibold text-white/40 uppercase tracking-wider mb-2">Patrimônio</p>
              <p className="text-[32px] font-bold text-white leading-none font-mono tabular-nums">
                {fmtUsd(balance.totalEquity)}
              </p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-white/45">
                <span className="flex items-center gap-1">
                  <span className="text-white/30">Disponível</span>
                  <span className="text-white/70 font-mono tabular-nums">{fmtUsd(balance.availableMargin)}</span>
                </span>
                {balance.unrealizedPnL !== 0 && (
                  <>
                    <span className="text-white/15">·</span>
                    <span className="flex items-center gap-1">
                      <span className="text-white/30">Não real.</span>
                      <span className={`font-mono tabular-nums ${pnlColor(balance.unrealizedPnL)}`}>
                        {fmtUsd(balance.unrealizedPnL)}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl surface-card p-5">
            <p className="text-[10.5px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              PnL {period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : "total"}
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-[28px] font-bold leading-none font-mono tabular-nums ${pnlColor(periodPnL)}`}>
                {hideBalance ? "$••••" : fmtUsd(periodPnL)}
              </p>
              {equityAtStart > 0 && !hideBalance && (
                <span className={`text-[13px] font-mono tabular-nums ${pnlColor(periodPnL)}`}>
                  {periodPnL >= 0 ? "+" : ""}{periodPct.toFixed(2)}%
                </span>
              )}
            </div>
            {metrics && metrics.totalTrades > 0 && (
              <p className="text-[11px] text-white/35 mt-2.5 font-mono tabular-nums">
                {metrics.totalTrades} trades · <span className={pnlColor(metrics.avgPnL)}>{fmtUsd(metrics.avgPnL)}</span> médio
                {totalCommission < 0 && (
                  <span className="text-white/25"> · taxa {fmtUsd(totalCommission)}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* URA call split — suas stats seguindo vs solo */}
      {metricsSplit && <UraCallSplit split={metricsSplit} />}

      {/* Stats strip — 7 métricas em linha */}
      {metrics && metrics.totalTrades > 0 && (
        <div className="animate-in-up delay-2 rounded-xl surface-card px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-0">
            {[
              { label: "Win rate", value: `${metrics.winRate.toFixed(1)}%`, sub: `${metrics.wins}W · ${metrics.losses}L`, color: metrics.winRate >= 50 ? "text-green-400" : "text-red-400" },
              { label: "Profit factor", value: metrics.profitFactor >= 999 ? "∞" : metrics.profitFactor.toFixed(2), sub: metrics.profitFactor >= 1 ? "lucrativo" : "perdedor", color: metrics.profitFactor >= 1 ? "text-green-400" : "text-red-400" },
              { label: "Expectancy", value: fmtUsd(metrics.expectancy), sub: "por trade", color: pnlColor(metrics.expectancy) },
              { label: "Média ganho", value: fmtUsd(metrics.avgWin), sub: hideBalance ? "•" : `${metrics.wins} wins`, color: "text-green-400" },
              { label: "Média perda", value: fmtUsd(metrics.avgLoss), sub: hideBalance ? "•" : `${metrics.losses} losses`, color: "text-red-400" },
              { label: "Melhor/pior", value: `${fmtUsd(metrics.bestTrade)}`, sub: fmtUsd(metrics.worstTrade), color: "text-white/75" },
              {
                label: "Streak",
                value: metrics.currentStreakType === "none" ? "—" : `${metrics.currentStreak}${metrics.currentStreakType === "win" ? "W" : "L"}`,
                sub: `máx ${metrics.maxWinStreak}W · ${metrics.maxLossStreak}L`,
                color: metrics.currentStreakType === "win" ? "text-green-400" : metrics.currentStreakType === "loss" ? "text-red-400" : "text-white/40",
              },
            ].map((s, i, arr) => (
              <div key={i} className={`${i < arr.length - 1 ? "lg:border-r lg:border-white/[0.04]" : ""} lg:px-4 first:lg:pl-0`}>
                <p className="text-[9.5px] font-semibold text-white/35 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-[16px] font-bold font-mono tabular-nums leading-tight ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/25 mt-0.5 font-mono tabular-nums truncate">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions — adaptativo: strip fino se 0, bloco se 1+ */}
      {positions.length === 0 ? (
        <div className="flex items-center justify-between px-5 py-3 rounded-xl surface-card">
          <div className="flex items-center gap-3">
            <Target className="w-3.5 h-3.5 text-white/30" />
            <p className="text-[12px] text-white/45">Nenhuma posição aberta agora</p>
          </div>
          <p className="text-[10.5px] text-white/25">Veja trades fechados abaixo ↓</p>
        </div>
      ) : (
        <div className="rounded-xl surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Target className="w-3.5 h-3.5 text-brand-500/60" />
              <h2 className="text-[12px] font-semibold text-white/80">Posições abertas</h2>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-white/30 tabular-nums">{positions.length} ativa{positions.length > 1 ? "s" : ""}</span>
              <span className={`font-mono tabular-nums font-semibold ${pnlColor(openPositionsTotal)}`}>
                {fmtUsd(openPositionsTotal)}
              </span>
            </div>
          </div>

          {/* Tabela compacta */}
          <div className="space-y-0.5">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-3 py-1.5 text-[9.5px] font-semibold text-white/30 uppercase tracking-wider">
              <div className="w-10">Lado</div>
              <div>Símbolo</div>
              <div className="text-right">Tam.</div>
              <div className="text-right">Entry</div>
              <div className="text-right">Mark</div>
              <div className="text-right w-24">PnL</div>
            </div>
            {positions.map((pos, i) => {
              const SideIcon = pos.side === "LONG" ? ArrowUp : ArrowDown;
              const sideColor = pos.side === "LONG" ? "text-green-400" : "text-red-400";
              return (
                <div key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors items-center">
                  <div className={`w-10 flex items-center gap-1 text-[10.5px] font-semibold ${sideColor}`}>
                    <SideIcon className="w-3 h-3" />
                    {pos.side}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-white font-mono truncate">{pos.symbol.replace(/-?USDT/, "")}</p>
                    <p className="text-[9.5px] text-white/30 font-mono">{pos.leverage}× {pos.marginType}</p>
                  </div>
                  <p className="text-[11px] text-white/55 font-mono tabular-nums text-right">{pos.size.toFixed(4)}</p>
                  <p className="text-[11px] text-white/55 font-mono tabular-nums text-right">{pos.entryPrice < 1 ? pos.entryPrice.toFixed(6) : pos.entryPrice.toFixed(2)}</p>
                  <p className="text-[11px] text-white/55 font-mono tabular-nums text-right">{pos.markPrice < 1 ? pos.markPrice.toFixed(6) : pos.markPrice.toFixed(2)}</p>
                  <p className={`text-[12.5px] font-semibold font-mono tabular-nums text-right w-24 ${pnlColor(pos.unrealizedPnL)}`}>
                    {fmtUsd(pos.unrealizedPnL)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ordens pendentes (limits/stops aguardando gatilho) */}
      {openOrders.length > 0 && <OpenOrdersCard orders={openOrders} />}

      {/* Liquidações alerta (se houve nos últimos 7d) */}
      {forceOrders.length > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-red-400/40 bg-red-500/[0.03]">
          <div>
            <p className="text-[12.5px] font-semibold text-red-300">
              {forceOrders.length} {forceOrders.length === 1 ? "posição foi liquidada" : "posições foram liquidadas"} nos últimos 7 dias
            </p>
            <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
              Stop não acionou a tempo ou margem insuficiente. Veja os trades marcados com badge <span className="font-semibold text-red-400">LIQ</span> no journal abaixo.
            </p>
          </div>
        </div>
      )}

      {/* Journal full-width — sem sidebar presa */}
      <div className="animate-in-up delay-3 rounded-xl surface-card p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-white/45" />
          <h2 className="text-[12px] font-semibold text-white/80">Journal</h2>
          <span className="text-[10px] text-white/25 ml-auto">últimos 7 dias</span>
        </div>
        <TradeJournal
          trades={trades as JournalTrade[]}
          hideBalance={hideBalance}
          onTradeClick={(t) => setOpenTrade({
            orderId: t.orderId,
            symbol: t.symbol,
            side: t.side,
            price: t.price,
            quantity: t.quantity,
            profit: t.profit,
            commission: t.commission,
            time: t.time,
            tags: t.tags || [],
            notes: t.notes || null,
            stopLoss: t.stopLoss || null,
            uraCall: !!t.uraCall,
            liquidated: !!t.liquidated,
            mfe: t.mfe ?? null,
            mae: t.mae ?? null,
            mfeR: t.mfeR ?? null,
            maeR: t.maeR ?? null,
          })}
        />
      </div>

      {/* Analytics row — Setup insights em 3 colunas */}
      {(rMultiples || eventExposure || tagStats.length > 0) && (
        <div className="animate-in-up delay-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {rMultiples && <RMultiplesCard r={rMultiples} />}
          {eventExposure && <EventExposureCard exposure={eventExposure} />}
          <TagBreakdown tags={tagStats} />
        </div>
      )}

      {/* Breakdowns row — Símbolo · Hora · Dia da semana em 3 colunas */}
      <div className="animate-in-up delay-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="rounded-xl surface-card p-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <TrendingUp className="w-3.5 h-3.5 text-white/45" />
            <h2 className="text-[12px] font-semibold text-white/80">Por símbolo</h2>
          </div>
          <SymbolBreakdown rows={symbolBreakdown} />
        </div>

        <div className="rounded-xl surface-card p-5">
          <h2 className="text-[12px] font-semibold text-white/80 mb-3.5">Por hora (BRT)</h2>
          <HourlyBreakdown rows={hourlyBreakdown} />
        </div>

        <div className="rounded-xl surface-card p-5">
          <h2 className="text-[12px] font-semibold text-white/80 mb-3.5">Por dia da semana</h2>
          <DowBreakdown rows={dowBreakdown} />
        </div>
      </div>

      {/* Calendar heatmap — rodapé */}
      <div className="animate-in-up delay-4 rounded-xl surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[12px] font-semibold text-white/80">Calendário PnL</h2>
            <p className="text-[10.5px] text-white/30 mt-0.5">Últimos 3 meses · hover pra detalhes</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" /> ganho
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/70" /> perda
            </span>
          </div>
        </div>
        <PnLHeatmap data={dailyPnL} />
      </div>

      <p className="text-[10px] text-white/15 text-center pt-2">
        Dados de 7 dias (limite da API BingX em trade history). Equity curve expande com o tempo conforme acumular snapshots diários.
      </p>

      {openTrade && (
        <TradeDetailModal
          trade={openTrade}
          exchange={exchange.id}
          allowedTags={allowedTags}
          onClose={() => setOpenTrade(null)}
          onSaved={() => { onRefresh(); setOpenTrade(null); }}
        />
      )}

      {showPropRules && (
        <PropRulesModal
          exchange={exchange.id}
          existing={propRulesExisting}
          onClose={() => setShowPropRules(false)}
          onSaved={() => { onRefresh(); setShowPropRules(false); }}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function CorretoraPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeExchange, setActiveExchange] = useState<ExchangeId | null>(null);
  const [data, setData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<"dashboard" | "add">("dashboard");

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/exchange/connections");
      const json = await res.json();
      setConnections(json.connections || []);
      return json.connections || [];
    } catch {
      return [];
    }
  }, []);

  const fetchData = useCallback(async (exchange: ExchangeId, refresh = false) => {
    try {
      const url = `/api/exchange/data?exchange=${exchange}${refresh ? "&refresh=1" : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ connected: false });
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchConnections().then((conns: Connection[]) => {
      if (conns.length > 0) {
        const first = conns[0].exchange as ExchangeId;
        setActiveExchange(first);
        setView("dashboard");
        fetchData(first).finally(() => setLoading(false));
      } else {
        setView("add");
        setLoading(false);
      }
    });
  }, [fetchConnections, fetchData]);

  const handleRefresh = async () => {
    if (!activeExchange) return;
    setRefreshing(true);
    await fetchData(activeExchange, true);
    setRefreshing(false);
  };

  // Polling inteligente: auto-refresh a cada 30s enquanto a aba esta visivel.
  // Pausa quando o user troca de aba (Page Visibility API) pra economizar
  // chamadas BingX e nao queimar o cache quando ninguem ta olhando.
  useEffect(() => {
    if (!activeExchange || view !== "dashboard") return;
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          // Nao usa refresh=1 aqui — deixa o cache servir se outra aba puxou recentemente.
          // Cache TTL de 30s no server garante freshness.
          fetchData(activeExchange);
        }
      }, 30_000);
    };
    const stop = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };

    start();
    const onVis = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activeExchange, view, fetchData]);

  const handleDisconnect = async () => {
    if (!activeExchange) return;
    await fetch(`/api/exchange/disconnect?exchange=${activeExchange}`, { method: "DELETE" });
    const conns = await fetchConnections();
    if (conns.length > 0) {
      const first = conns[0].exchange as ExchangeId;
      setActiveExchange(first);
      setView("dashboard");
      setLoading(true);
      fetchData(first).finally(() => setLoading(false));
    } else {
      setActiveExchange(null);
      setData(null);
      setView("add");
    }
  };

  const handleConnected = async () => {
    const conns = await fetchConnections();
    if (conns.length > 0) {
      const latest = conns[conns.length - 1].exchange as ExchangeId;
      setActiveExchange(latest);
      setView("dashboard");
      setLoading(true);
      fetchData(latest, true).finally(() => setLoading(false));
    }
  };

  const switchExchange = (id: ExchangeId) => {
    setActiveExchange(id);
    setView("dashboard");
    setLoading(true);
    fetchData(id).finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <RefreshCw className="w-6 h-6 text-white/20 animate-spin mb-4" />
        <p className="text-[13px] text-white/30">Carregando...</p>
      </div>
    );
  }

  // Show connect form
  if (view === "add" || connections.length === 0) {
    return (
      <div>
        {connections.length > 0 && (
          <button onClick={() => setView("dashboard")} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 mb-4">
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar ao dashboard
          </button>
        )}
        <ConnectForm onConnected={handleConnected} connectedExchanges={connections.map((c) => c.exchange)} />
      </div>
    );
  }

  // Dashboard with exchange tabs
  const exchangeMeta = EXCHANGES.find((e) => e.id === activeExchange) || EXCHANGES[0];

  return (
    <div>
      {/* Exchange tabs (if multiple connected) */}
      {connections.length > 1 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {connections.map((conn) => {
            const meta = EXCHANGES.find((e) => e.id === conn.exchange) || EXCHANGES[0];
            const isActive = conn.exchange === activeExchange;
            return (
              <button
                key={conn.exchange}
                onClick={() => switchExchange(conn.exchange)}
                className="interactive-tap flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? meta.bg : "transparent",
                  borderColor: isActive ? meta.color + "30" : "rgba(255,255,255,0.04)",
                  color: isActive ? meta.textColor : "rgba(255,255,255,0.3)",
                }}
              >
                {meta.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={meta.logo} alt={meta.name} className="w-5 h-5 object-contain" style={{ opacity: isActive ? 1 : 0.4 }} />
                ) : (
                  <span className="text-[11px] font-black italic" style={{ color: isActive ? meta.color : undefined, opacity: isActive ? 1 : 0.4 }}>{meta.shortLabel}</span>
                )}
                {meta.name}
                {conn.status === "error" && <AlertCircle className="w-3 h-3 text-red-400" />}
              </button>
            );
          })}
        </div>
      )}

      {data && (
        <Dashboard
          exchange={exchangeMeta}
          data={data}
          onRefresh={handleRefresh}
          onDisconnect={handleDisconnect}
          refreshing={refreshing}
          onAddMore={() => setView("add")}
        />
      )}
    </div>
  );
}
