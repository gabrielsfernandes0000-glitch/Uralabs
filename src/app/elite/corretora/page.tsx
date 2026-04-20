"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Link2, Unlink, RefreshCw, TrendingUp, TrendingDown,
  Wallet, Target, BarChart3, ArrowUp, ArrowDown,
  Shield, Eye, EyeOff, AlertCircle,
  ChevronRight, ChevronLeft, Clock, Zap, Trophy, Minus,
  Plus, Check,
} from "lucide-react";

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
  status: string;
  time: number;
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

    try {
      const res = await fetch("/api/exchange/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchange: selected.id,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          passphrase: passphrase.trim() || undefined,
          label: label.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao conectar"); return; }
      resetForm();
      setSelected(null);
      onConnected();
    } catch {
      setError("Erro de rede — tente novamente");
    } finally {
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

        <div className="relative overflow-hidden rounded-2xl border p-7" style={{ borderColor: selected.color + "20", background: `linear-gradient(to bottom, ${selected.bg}, #0e0e10)` }}>
          {/* Accent glow */}
          <div className="absolute top-0 left-0 right-0 h-24 opacity-30 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${selected.color}20, transparent 70%)` }} />

          <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {selected.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selected.logo} alt={selected.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-[18px] font-black italic" style={{ color: selected.textColor }}>{selected.shortLabel}</span>
              )}
            </div>
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: selected.textColor }}>Conectar {selected.name}</h2>
              <p className="text-[11px] text-white/30">API Key somente leitura</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-white/80 mb-1.5">API Key</label>
              <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cole sua API Key aqui"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/15 text-[13px] text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors font-mono" />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-white/80 mb-1.5">Secret Key</label>
              <div className="relative">
                <input type={showSecret ? "text" : "password"} value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Cole sua Secret Key aqui"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/20 border border-white/15 text-[13px] text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors font-mono" />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="interactive-tap absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {selected.needsPassphrase && (
              <div>
                <label className="block text-[12px] font-medium text-white/80 mb-1.5">Passphrase</label>
                <input type={showSecret ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Passphrase definida na criacao da API"
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/15 text-[13px] text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors font-mono" />
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-white/80 mb-1.5">Apelido <span className="text-white/50">(opcional)</span></label>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Conta principal"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/15 text-[13px] text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors" />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-400/25">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={2} />
                <p className="text-[12px] text-red-400">{error}</p>
              </div>
            )}

            <button onClick={handleConnect} disabled={loading}
              className="interactive w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: selected.color, color: selected.id === "binance" || selected.id === "bybit" ? "#000" : "#fff", boxShadow: `0 8px 24px ${selected.color}25` }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Validando...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Link2 className="w-4 h-4" /> Conectar {selected.name}</span>
              )}
            </button>
          </div>
        </div>

        {/* Tutorial */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6">
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

        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <Shield className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-white/30 leading-relaxed">
            Suas keys sao encriptadas com AES-256-GCM antes de serem salvas. Nunca temos acesso a trades ou saques na sua conta.
          </p>
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
              className={`interactive w-full relative overflow-hidden rounded-2xl transition-all duration-300 p-[1px] text-left group ${
                isConnected ? "opacity-50 cursor-default" : "hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `linear-gradient(135deg, ${ex.color}40, transparent 60%)` }} />

              {/* Button body */}
              <div className="relative rounded-2xl px-4 py-4 transition-colors" style={{ backgroundColor: isConnected ? "#111" : ex.bg }}>
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
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 uppercase tracking-[0.22em] shrink-0">
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
    </div>
  );
}

/* ────────────────────────────────────────────
   Dashboard (connected state)
   ──────────────────────────────────────────── */

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

  const balance = data.balance;
  const positions = data.positions || [];
  const trades = data.trades || [];
  const metrics = data.metrics;

  const fmtUsd = (n: number) => {
    if (hideBalance) return "$••••";
    const prefix = n >= 0 ? "$" : "-$";
    return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fmt = (n: number, decimals = 2) => {
    if (hideBalance) return "••••";
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const pnlColor = (n: number) => n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "text-white/40";
  const pnlBg = (n: number) => n > 0 ? "border-green-400/25" : n < 0 ? "border-red-400/25" : "border-white/[0.06]";
  const PnlIcon = (n: number) => n > 0 ? ArrowUp : n < 0 ? ArrowDown : Minus;

  if (data.error) {
    return (
      <div className="max-w-lg mx-auto pt-12">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" strokeWidth={1.5} />
          <h2 className="text-[20px] font-bold text-white mb-2">Erro na conexao com {exchange.name}</h2>
          <p className="text-[13px] text-white/40 mb-6 max-w-sm">{data.error}</p>
          <div className="flex gap-3">
            <button onClick={onRefresh} className="interactive-tap px-5 py-2.5 rounded-xl border border-white/[0.08] text-[13px] text-white/60 hover:text-white hover:border-white/[0.18] transition-colors">Tentar novamente</button>
            <button onClick={onDisconnect} className="interactive-tap px-5 py-2.5 rounded-xl border border-red-400/25 text-[13px] text-red-400 hover:border-red-400/50 transition-colors">Reconectar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in-up flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {exchange.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={exchange.logo} alt={exchange.name} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-[18px] font-black italic" style={{ color: exchange.textColor }}>{exchange.shortLabel}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white tracking-tight">{exchange.name}</h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-green-400 uppercase tracking-[0.22em]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Conectada
              </span>
            </div>
            {data.label && <p className="text-[11px] text-white/30">{data.label}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAddMore} className="interactive-tap p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-brand-500 transition-all" title="Adicionar corretora">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setHideBalance(!hideBalance)} className="interactive-tap p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 transition-all" title={hideBalance ? "Mostrar valores" : "Ocultar valores"}>
            {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={onRefresh} disabled={refreshing} className="interactive-tap p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 transition-all disabled:opacity-50" title="Atualizar">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowDisconnect(!showDisconnect)} className="interactive-tap p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-red-400 transition-all" title="Desconectar">
            <Unlink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDisconnect && (
        <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-red-400/20">
          <p className="text-[13px] text-white/50">Desconectar {exchange.name}? Seus dados serao removidos.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDisconnect(false)} className="interactive-tap px-4 py-2 rounded-lg text-[12px] text-white/40 hover:text-white transition-colors">Cancelar</button>
            <button onClick={onDisconnect} className="interactive-tap px-4 py-2 rounded-lg border border-red-400/30 text-[12px] text-red-400 font-medium hover:border-red-400/60 transition-colors">Desconectar</button>
          </div>
        </div>
      )}


      {/* Balance cards */}
      {balance && (
        <div className="animate-in-up delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Wallet, label: "Patrimonio", value: fmtUsd(balance.totalEquity), color: "#ffffff" },
            { icon: Target, label: "Margem Disponivel", value: fmtUsd(balance.availableMargin), color: "#ffffff" },
            { icon: TrendingUp, label: "PnL Nao Realizado", value: fmtUsd(balance.unrealizedPnL), color: balance.unrealizedPnL >= 0 ? "#4ade80" : "#f87171" },
            { icon: BarChart3, label: "PnL Realizado", value: fmtUsd(balance.realisedPnL), color: balance.realisedPnL >= 0 ? "#4ade80" : "#f87171" },
          ].map((card, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] p-4 hover:border-white/[0.10] transition-all duration-200">
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${card.color}20, transparent)` }} />
              <card.icon className="w-4 h-4 mb-2.5" style={{ color: card.color + "60" }} />
              <p className="text-[18px] font-bold text-white leading-none">{card.value}</p>
              <p className="text-[11px] text-white/30 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      {metrics && metrics.totalTrades > 0 && (
        <div className="animate-in-up delay-2 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] hover:border-white/[0.12] transition-all duration-300">
          <div className="relative z-10 p-7">
            <div className="flex items-center gap-3 mb-5">
              <Trophy className="w-4 h-4 text-yellow-500/50" />
              <h2 className="text-[14px] font-semibold text-white/80">Performance (30 dias)</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] text-white/30 mb-1">Win Rate</p>
                <p className={`text-[22px] font-bold ${metrics.winRate >= 50 ? "text-green-400" : "text-red-400"}`}>{hideBalance ? "••" : metrics.winRate.toFixed(1)}%</p>
                <p className="text-[11px] text-white/20 mt-0.5">{hideBalance ? "••" : `${metrics.wins}W / ${metrics.losses}L`}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/30 mb-1">PnL Total</p>
                <p className={`text-[22px] font-bold ${pnlColor(metrics.totalPnL)}`}>{fmtUsd(metrics.totalPnL)}</p>
                <p className="text-[11px] text-white/20 mt-0.5">{hideBalance ? "••" : metrics.totalTrades} trades</p>
              </div>
              <div>
                <p className="text-[11px] text-white/30 mb-1">Melhor Trade</p>
                <p className="text-[22px] font-bold text-green-400">{fmtUsd(metrics.bestTrade)}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/30 mb-1">Pior Trade</p>
                <p className="text-[22px] font-bold text-red-400">{fmtUsd(metrics.worstTrade)}</p>
              </div>
            </div>
          </div>
        </div>
        )}

      {/* Open positions */}
      <div className="animate-in-up delay-3 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] hover:border-white/[0.12] transition-all duration-300">
        <div className="relative z-10 p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-brand-500/50" />
              <h2 className="text-[14px] font-semibold text-white/80">Posicoes Abertas</h2>
            </div>
            <span className="text-[11px] text-white/20">{positions.length} ativas</span>
          </div>

          {positions.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-white/15" />
              </div>
              <p className="text-[12px] text-white/30">Nenhuma posicao aberta</p>
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map((pos, i) => {
                const Icon = PnlIcon(pos.unrealizedPnL);
                return (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl ${pnlBg(pos.unrealizedPnL)} border transition-all`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${pos.side === "LONG" ? "text-green-400" : "text-red-400"}`}>
                        {pos.side}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{pos.symbol.replace(/-?USDT/, "")}</p>
                        <p className="text-[10px] text-white/25">{pos.leverage}x {pos.marginType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Icon className={`w-3 h-3 ${pnlColor(pos.unrealizedPnL)}`} />
                        <p className={`text-[14px] font-bold ${pnlColor(pos.unrealizedPnL)}`}>{fmtUsd(pos.unrealizedPnL)}</p>
                      </div>
                      <p className="text-[10px] text-white/25">Entry: {fmt(pos.entryPrice, 4)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent trades */}
      <div className="animate-in-up delay-4 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] hover:border-white/[0.12] transition-all duration-300">
        <div className="relative z-10 p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500/50" />
              <h2 className="text-[14px] font-semibold text-white/80">Trades Recentes</h2>
            </div>
            <span className="text-[11px] text-white/20">Ultimos 30 dias</span>
          </div>

          {trades.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-white/15" />
              </div>
              <p className="text-[12px] text-white/30">Nenhum trade nos ultimos 30 dias</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {trades.slice(0, 20).map((trade, i) => {
                const Icon = PnlIcon(trade.profit);
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${trade.side === "BUY" || trade.side === "Buy" ? "bg-green-400" : "bg-red-400"}`} />
                      <div>
                        <p className="text-[12px] font-medium text-white/70">{trade.symbol.replace(/-?USDT/, "")}</p>
                        <p className="text-[10px] text-white/20">
                          {trade.time ? new Date(trade.time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon className={`w-3 h-3 ${pnlColor(trade.profit)}`} />
                      <p className={`text-[13px] font-semibold ${pnlColor(trade.profit)}`}>{fmtUsd(trade.profit)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {data.cached && (
        <p className="text-[10px] text-white/15 text-center">Dados em cache — clique em atualizar para dados em tempo real</p>
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
