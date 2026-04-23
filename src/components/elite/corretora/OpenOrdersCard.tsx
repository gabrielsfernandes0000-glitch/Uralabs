"use client";

import { Clock } from "lucide-react";

export interface OpenOrder {
  orderId: string;
  symbol: string;
  side: string;
  positionSide: string;
  type: string;
  price: number;
  stopPrice: number;
  quantity: number;
  leverage: string;
  time: number;
}

export function OpenOrdersCard({ orders }: { orders: OpenOrder[] }) {
  if (!orders.length) return null;

  return (
    <div className="rounded-xl surface-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400/80" />
          <h2 className="text-[12px] font-semibold text-white/85">Ordens pendentes</h2>
        </div>
        <span className="text-[10px] text-white/30 tabular-nums">{orders.length} aguardando</span>
      </div>
      <div className="space-y-1">
        {orders.map((o) => {
          const sideColor = o.side === "BUY" ? "text-green-400" : "text-red-400";
          const typeLabel = o.type.replace("_MARKET", "").replace("_LIMIT", "");
          return (
            <div key={o.orderId} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-3 py-2 rounded-md hover:bg-white/[0.02] transition-colors">
              <span className={`text-[10px] font-semibold ${sideColor} w-8`}>{o.side}</span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-mono font-semibold text-white/85 truncate">{o.symbol.replace(/-?USDT/, "")}</p>
                <p className="text-[9.5px] text-white/35 font-mono">{typeLabel} · {o.leverage}</p>
              </div>
              <span className="text-[10.5px] font-mono tabular-nums text-white/55">{o.quantity.toFixed(4)}</span>
              <span className="text-[11px] font-mono tabular-nums text-white/80">
                {o.price > 0 ? (o.price < 1 ? o.price.toFixed(6) : o.price.toFixed(2)) : "—"}
              </span>
              <span className="text-[10px] text-white/30 font-mono tabular-nums">
                {o.stopPrice > 0 ? `stop ${o.stopPrice < 1 ? o.stopPrice.toFixed(6) : o.stopPrice.toFixed(2)}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
