"use client";

interface SymbolRow { symbol: string; pnl: number; trades: number; wins: number }
interface HourRow { hour: number; pnl: number; trades: number }
interface DowRow { dow: number; name: string; pnl: number; trades: number }

function Bar({ value, max, pnl }: { value: number; max: number; pnl: number }) {
  const pct = max > 0 ? (Math.abs(value) / max) * 100 : 0;
  const color = pnl > 0 ? "bg-green-400/50" : pnl < 0 ? "bg-red-400/50" : "bg-white/10";
  return (
    <div className="flex-1 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function fmtUsd(n: number) {
  const prefix = n >= 0 ? "+$" : "-$";
  return `${prefix}${Math.abs(n).toFixed(2)}`;
}

export function SymbolBreakdown({ rows }: { rows: SymbolRow[] }) {
  if (!rows.length) {
    return <p className="text-[11px] text-white/25">Sem trades nos últimos 7 dias</p>;
  }
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.pnl)));
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const color = r.pnl > 0 ? "text-green-400" : r.pnl < 0 ? "text-red-400" : "text-white/40";
        return (
          <div key={r.symbol} className="flex items-center gap-3">
            <div className="w-14 text-[11px] font-semibold text-white/75 tabular-nums truncate">{r.symbol}</div>
            <Bar value={r.pnl} max={maxAbs} pnl={r.pnl} />
            <div className={`w-20 text-right text-[11px] font-mono tabular-nums ${color}`}>{fmtUsd(r.pnl)}</div>
            <div className="w-10 text-right text-[10px] text-white/25 tabular-nums">{r.trades}</div>
          </div>
        );
      })}
    </div>
  );
}

export function HourlyBreakdown({ rows }: { rows: HourRow[] }) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.pnl)), 1);
  const nonZero = rows.filter((r) => r.trades > 0);
  if (!nonZero.length) {
    return <p className="text-[11px] text-white/25">Sem trades nos últimos 7 dias</p>;
  }
  return (
    <div className="flex items-end gap-[3px] h-[90px]">
      {rows.map((r) => {
        const pct = maxAbs > 0 ? (Math.abs(r.pnl) / maxAbs) * 100 : 0;
        const color = r.pnl > 0 ? "bg-green-400/60" : r.pnl < 0 ? "bg-red-400/60" : "bg-white/[0.04]";
        const hasData = r.trades > 0;
        return (
          <div
            key={r.hour}
            className="flex-1 flex flex-col items-center justify-end group relative"
            style={{ minHeight: 4 }}
            title={`${String(r.hour).padStart(2, "0")}h · ${r.trades} trades · ${fmtUsd(r.pnl)}`}
          >
            <div
              className={`w-full rounded-sm transition-all ${color} ${hasData ? "" : "opacity-50"}`}
              style={{ height: hasData ? `${Math.max(pct, 4)}%` : "4px" }}
            />
            {r.hour % 6 === 0 && (
              <span className="text-[8px] text-white/25 mt-1 font-mono tabular-nums">{String(r.hour).padStart(2, "0")}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DowBreakdown({ rows }: { rows: DowRow[] }) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.pnl)), 1);
  const hasAny = rows.some((r) => r.trades > 0);
  if (!hasAny) {
    return <p className="text-[11px] text-white/25">Sem trades nos últimos 7 dias</p>;
  }
  return (
    <div className="space-y-1.5">
      {rows.map((r) => {
        const color = r.pnl > 0 ? "text-green-400" : r.pnl < 0 ? "text-red-400" : "text-white/25";
        return (
          <div key={r.dow} className="flex items-center gap-3">
            <div className="w-8 text-[10.5px] font-semibold text-white/50">{r.name}</div>
            <Bar value={r.pnl} max={maxAbs} pnl={r.pnl} />
            <div className={`w-20 text-right text-[10.5px] font-mono tabular-nums ${color}`}>{fmtUsd(r.pnl)}</div>
          </div>
        );
      })}
    </div>
  );
}
