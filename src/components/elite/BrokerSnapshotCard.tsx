"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Plug, TrendingUp, TrendingDown } from "lucide-react";

interface ExchangeConnection {
  exchange: string;
  label: string | null;
  status: string;
}

interface SnapshotPosition {
  symbol: string;
  side: string;
  size: number;
  unrealizedPnL: number;
  entryPrice: number;
  markPrice: number;
}

interface SnapshotData {
  connected: boolean;
  exchange?: string;
  balance?: { totalEquity: number; unrealizedPnL: number };
  positions?: SnapshotPosition[];
  error?: string;
}

export function BrokerSnapshotCard() {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "no-connection" }
    | { status: "error"; message: string }
    | { status: "ready"; data: SnapshotData }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/exchange/connections");
        if (!r.ok) throw new Error(String(r.status));
        const { connections } = (await r.json()) as { connections: ExchangeConnection[] };
        if (cancelled) return;

        if (!connections || connections.length === 0) {
          setState({ status: "no-connection" });
          return;
        }

        // Primeira conexão ativa (senão, primeira qualquer)
        const primary = connections.find((c) => c.status === "active") ?? connections[0];
        const dataRes = await fetch(`/api/exchange/data?exchange=${primary.exchange}`);
        if (!dataRes.ok && dataRes.status !== 502) throw new Error(String(dataRes.status));
        const data = (await dataRes.json()) as SnapshotData;
        if (cancelled) return;

        setState({ status: "ready", data });
      } catch (err) {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "erro" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white/[0.02] p-5 h-full flex flex-col">{children}</div>
  );

  if (state.status === "loading") {
    return (
      <Shell>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-white/30" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Corretora</h3>
        </div>
        <div className="flex-1 flex items-center justify-start">
          <div className="w-24 h-7 rounded bg-white/[0.03] animate-pulse" />
        </div>
      </Shell>
    );
  }

  if (state.status === "no-connection" || state.status === "error") {
    return (
      <Link href="/elite/corretora" className="interactive group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 h-full flex flex-col transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Plug className="w-3.5 h-3.5 text-white/40" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Corretora</h3>
        </div>
        <div className="flex-1 flex flex-col items-start justify-center">
          <p className="text-[15px] font-semibold text-white/65 leading-tight">Conecte sua corretora</p>
          <p className="text-[11px] text-white/35 mt-1 leading-relaxed">
            BingX, Binance, Bybit · trades ao vivo aqui
          </p>
        </div>
      </Link>
    );
  }

  const { data } = state;
  const positions = data.positions ?? [];
  const unrealized = data.balance?.unrealizedPnL ?? positions.reduce((s, p) => s + p.unrealizedPnL, 0);
  const hasOpen = positions.length > 0;
  const accent = unrealized > 0 ? "#10B981" : unrealized < 0 ? "#EF4444" : "rgba(255,255,255,0.6)";
  const PnLIcon = unrealized > 0 ? TrendingUp : unrealized < 0 ? TrendingDown : BarChart3;

  return (
    <Link href="/elite/corretora" className="interactive group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-5 h-full flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PnLIcon className="w-3.5 h-3.5" style={{ color: accent }} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Corretora</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
          {data.exchange}
        </span>
      </div>

      {!hasOpen ? (
        <div className="flex-1 flex flex-col items-start justify-center">
          <p className="text-[18px] font-semibold text-white/60 leading-tight">Sem posições</p>
          <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
            Equity ${data.balance?.totalEquity.toFixed(2) ?? "—"}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <p
            className="text-[24px] font-bold leading-none font-mono tabular-nums"
            style={{ color: accent }}
          >
            {unrealized > 0 ? "+" : ""}${unrealized.toFixed(2)}
          </p>
          <p className="text-[10px] text-white/35 mt-1.5 font-mono uppercase tracking-wider">
            Não realizado · {positions.length} {positions.length === 1 ? "posição" : "posições"}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {positions.slice(0, 3).map((p) => {
              const sideColor = p.side.toLowerCase().includes("long") ? "text-emerald-400/80" : "text-red-400/80";
              return (
                <span key={p.symbol + p.side} className="text-[9.5px] font-mono tabular-nums text-white/55 bg-white/[0.03] px-1.5 py-0.5 rounded">
                  <span className={sideColor}>{p.side.toLowerCase().includes("long") ? "L" : "S"}</span>
                  {" "}{p.symbol.replace(/-USDT$|USDT$/i, "")}
                </span>
              );
            })}
            {positions.length > 3 && (
              <span className="text-[9.5px] text-white/30 font-mono">+{positions.length - 3}</span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
