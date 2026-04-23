"use client";

interface Metrics {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  profitFactor: number;
  expectancy: number;
}
interface MetricsSplit { all: Metrics; followingUra: Metrics; solo: Metrics }
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

const fmtUsd = (n: number) => {
  const p = n >= 0 ? "$" : "-$";
  return `${p}${Math.abs(n).toFixed(2)}`;
};

/** Banner superior: compara sua performance seguindo URA vs por conta própria. */
export function UraCallSplit({ split }: { split: MetricsSplit }) {
  const following = split.followingUra;
  const solo = split.solo;
  const hasFollowing = following.totalTrades > 0;
  const hasSolo = solo.totalTrades > 0;

  if (!hasFollowing && !hasSolo) {
    return (
      <div className="rounded-xl surface-card px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <p className="text-[12px] text-white/50">
            Sem histórico suficiente pra separar trades seguindo URA vs solo.
            <span className="text-white/30 ml-1">Marque trades manualmente no detalhe pra forçar o match.</span>
          </p>
        </div>
      </div>
    );
  }

  if (!hasFollowing) {
    return (
      <div className="rounded-xl surface-card px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5" />
          <div>
            <p className="text-[12.5px] font-semibold text-white/80">Nenhum trade matcheado com calls do URA nos últimos 7 dias</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Match automático por dia + asset. Se entrou em uma call mas não apareceu, marque no detalhe do trade.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pnlColor = (n: number) => n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "text-white/40";
  const hint = (() => {
    if (!hasSolo) return null;
    const fR = following.expectancy;
    const sR = solo.expectancy;
    if (fR > 0 && sR <= 0) return { text: "Você lucra seguindo URA. Sozinho, perde. Disciplina tá valendo.", tone: "good" };
    if (fR > sR && fR > 0) return { text: "Edge maior seguindo URA. Solo também lucra, mas menor.", tone: "good" };
    if (fR < sR && sR > 0) return { text: "Você performa melhor sozinho do que seguindo as calls. Revisitar execução nos sinais.", tone: "warn" };
    if (fR < 0 && sR < 0) return { text: "Os dois setups estão negativos. Revisar gestão antes de ajustar estratégia.", tone: "bad" };
    return null;
  })();

  return (
    <div className="rounded-xl surface-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <h2 className="text-[12px] font-semibold text-white/85">Seu edge seguindo URA</h2>
        </div>
        <p className="text-[10px] text-white/30">match por dia + asset, últimos 7 dias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-brand-500/25 bg-brand-500/[0.03] p-4">
          <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider mb-2">Seguindo URA</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9.5px] text-white/40">PnL</p>
              <p className={`text-[15px] font-bold font-mono tabular-nums ${pnlColor(following.totalPnL)}`}>{fmtUsd(following.totalPnL)}</p>
            </div>
            <div>
              <p className="text-[9.5px] text-white/40">Win rate</p>
              <p className={`text-[15px] font-bold font-mono tabular-nums ${following.winRate >= 50 ? "text-green-400" : "text-red-400"}`}>{following.winRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-[9.5px] text-white/40">Trades</p>
              <p className="text-[15px] font-bold font-mono tabular-nums text-white/85">{following.totalTrades}</p>
            </div>
          </div>
          <p className="text-[10.5px] text-white/30 mt-2 font-mono tabular-nums">
            PF {following.profitFactor >= 999 ? "∞" : following.profitFactor.toFixed(2)} · expectancy {fmtUsd(following.expectancy)}
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.06] p-4">
          <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider mb-2">Sozinho</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9.5px] text-white/40">PnL</p>
              <p className={`text-[15px] font-bold font-mono tabular-nums ${pnlColor(solo.totalPnL)}`}>{fmtUsd(solo.totalPnL)}</p>
            </div>
            <div>
              <p className="text-[9.5px] text-white/40">Win rate</p>
              <p className={`text-[15px] font-bold font-mono tabular-nums ${hasSolo ? (solo.winRate >= 50 ? "text-green-400" : "text-red-400") : "text-white/30"}`}>
                {hasSolo ? `${solo.winRate.toFixed(0)}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[9.5px] text-white/40">Trades</p>
              <p className="text-[15px] font-bold font-mono tabular-nums text-white/85">{solo.totalTrades}</p>
            </div>
          </div>
          <p className="text-[10.5px] text-white/30 mt-2 font-mono tabular-nums">
            {hasSolo
              ? `PF ${solo.profitFactor >= 999 ? "∞" : solo.profitFactor.toFixed(2)} · expectancy ${fmtUsd(solo.expectancy)}`
              : "—"}
          </p>
        </div>
      </div>

      {hint && (
        <p className={`text-[11.5px] leading-relaxed ${hint.tone === "good" ? "text-green-300" : hint.tone === "warn" ? "text-amber-300" : "text-red-300"}`}>
          {hint.text}
        </p>
      )}
    </div>
  );
}

/** Cruza trades × eventos econômicos high-impact ±30min */
export function EventExposureCard({ exposure }: { exposure: EventExposure }) {
  if (exposure.totalTrades === 0) return null;
  if (exposure.exposedClosed === 0) {
    return (
      <div className="rounded-xl surface-card p-5">
        <h2 className="text-[12px] font-semibold text-white/80 mb-1.5">Eventos econômicos</h2>
        <p className="text-[11px] text-white/40">
          Nenhum trade perto de high-impact nos últimos 7 dias. Você evitou os picos de volatilidade.
        </p>
      </div>
    );
  }
  const color = exposure.exposedWinRate >= 50 ? "text-green-400" : "text-red-400";
  return (
    <div className="rounded-xl surface-card p-5">
      <h2 className="text-[12px] font-semibold text-white/80 mb-3">Eventos econômicos</h2>
      <div className="space-y-2">
        <p className="text-[11.5px] text-white/60 leading-relaxed">
          <span className="font-semibold text-white/85">{exposure.exposedClosed}</span> dos seus {exposure.totalTrades} trades foram dentro de ±30min de evento <span className="text-amber-300">high-impact</span>.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div>
            <p className="text-[9.5px] text-white/40 uppercase tracking-wider">Win rate</p>
            <p className={`text-[14px] font-bold font-mono tabular-nums ${color}`}>{exposure.exposedWinRate.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-[9.5px] text-white/40 uppercase tracking-wider">PnL</p>
            <p className={`text-[14px] font-bold font-mono tabular-nums ${exposure.exposedPnL > 0 ? "text-green-400" : exposure.exposedPnL < 0 ? "text-red-400" : "text-white/40"}`}>
              {fmtUsd(exposure.exposedPnL)}
            </p>
          </div>
          <div>
            <p className="text-[9.5px] text-white/40 uppercase tracking-wider">% do total</p>
            <p className="text-[14px] font-bold font-mono tabular-nums text-white/75">{exposure.exposedPctOfAll.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Breakdown por tag de setup */
export function TagBreakdown({ tags }: { tags: TagStat[] }) {
  if (!tags.length) {
    return (
      <div className="rounded-xl surface-card p-5">
        <h2 className="text-[12px] font-semibold text-white/80 mb-2">Por setup</h2>
        <p className="text-[11px] text-white/35 leading-relaxed">
          Clique em qualquer trade do journal pra marcar tags (FVG, BOS, OTE, etc). Depois de 10+ trades tagueados, o breakdown por setup aparece aqui.
        </p>
      </div>
    );
  }
  const maxAbs = Math.max(...tags.map((t) => Math.abs(t.pnl)));
  return (
    <div className="rounded-xl surface-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold text-white/80">Por setup</h2>
        <p className="text-[10px] text-white/25">{tags.length} tags</p>
      </div>
      <div className="space-y-2">
        {tags.slice(0, 10).map((t) => {
          const pnlColor = t.pnl > 0 ? "text-green-400" : t.pnl < 0 ? "text-red-400" : "text-white/40";
          const wrColor = t.winRate >= 50 ? "text-green-400" : "text-red-400";
          const barColor = t.pnl > 0 ? "bg-green-400/50" : t.pnl < 0 ? "bg-red-400/50" : "bg-white/10";
          const pct = maxAbs > 0 ? (Math.abs(t.pnl) / maxAbs) * 100 : 0;
          return (
            <div key={t.tag} className="flex items-center gap-3">
              <div className="w-24 text-[11px] font-semibold text-white/75 truncate">{t.tag}</div>
              <div className="flex-1 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <div className={`w-14 text-right text-[10.5px] font-mono tabular-nums ${wrColor}`}>{t.winRate.toFixed(0)}%</div>
              <div className={`w-20 text-right text-[11px] font-mono tabular-nums ${pnlColor}`}>{fmtUsd(t.pnl)}</div>
              <div className="w-8 text-right text-[10px] text-white/25 tabular-nums">{t.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** R-multiples card */
export function RMultiplesCard({ r }: { r: RMultiples }) {
  if (r.count === 0) {
    return (
      <div className="rounded-xl surface-card p-5">
        <h2 className="text-[12px] font-semibold text-white/80 mb-2">R-multiples</h2>
        <p className="text-[11px] text-white/35 leading-relaxed">
          Informe o stop loss de cada trade no detalhe pra ver seu retorno em R (risco unitário). R positivo = lucrou mais que arriscou.
        </p>
      </div>
    );
  }
  const color = (n: number) => n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "text-white/40";
  return (
    <div className="rounded-xl surface-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold text-white/80">R-multiples</h2>
        <p className="text-[10px] text-white/25">{r.count} trades com stop</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9.5px] text-white/40 uppercase tracking-wider">Total R</p>
          <p className={`text-[18px] font-bold font-mono tabular-nums ${color(r.totalR)}`}>
            {r.totalR > 0 ? "+" : ""}{r.totalR.toFixed(2)}R
          </p>
        </div>
        <div>
          <p className="text-[9.5px] text-white/40 uppercase tracking-wider">Média por trade</p>
          <p className={`text-[18px] font-bold font-mono tabular-nums ${color(r.avgR)}`}>
            {r.avgR > 0 ? "+" : ""}{r.avgR.toFixed(2)}R
          </p>
        </div>
        <div>
          <p className="text-[9.5px] text-white/40 uppercase tracking-wider">Melhor</p>
          <p className="text-[13px] font-bold font-mono tabular-nums text-green-400">+{r.bestR.toFixed(2)}R</p>
        </div>
        <div>
          <p className="text-[9.5px] text-white/40 uppercase tracking-wider">Pior</p>
          <p className="text-[13px] font-bold font-mono tabular-nums text-red-400">{r.worstR.toFixed(2)}R</p>
        </div>
      </div>
    </div>
  );
}

/** Banner de prop firm rules enforcement. Monitora daily loss, max loss, profit target. */
export function PropRulesBanner({ status, onConfigure }: { status: PropStatus | null; onConfigure: () => void }) {
  if (!status) {
    return (
      <button
        type="button"
        onClick={onConfigure}
        className="interactive-tap w-full flex items-center justify-between px-5 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/45">
            Tem mesa prop (FTMO, MFF, Apex…)? Configure limites pra ver alertas de daily loss, DD e target.
          </span>
        </div>
        <span className="text-[10.5px] text-brand-500 font-semibold">Configurar →</span>
      </button>
    );
  }

  const segment = (used: number, limit: number | null, pct: number, targetIsProfit = false) => {
    if (limit === null) return null;
    const danger = pct >= 80;
    const warn = pct >= 60 && pct < 80;
    const color = targetIsProfit
      ? pct >= 100
        ? "bg-green-400"
        : "bg-green-400/60"
      : danger
        ? "bg-red-400"
        : warn
          ? "bg-amber-400"
          : "bg-white/30";
    return { color, pct: Math.min(100, pct), danger, warn };
  };

  const dailySeg = segment(status.dailyLoss.used, status.dailyLoss.limit, status.dailyLoss.pct);
  const maxSeg = segment(status.maxLoss.used, status.maxLoss.limit, status.maxLoss.pct);
  const profitSeg = segment(status.profitTarget.progress, status.profitTarget.target, status.profitTarget.pct, true);

  const anyDanger = dailySeg?.danger || maxSeg?.danger;

  return (
    <div className={`rounded-xl surface-card p-5 ${anyDanger ? "border border-red-400/40 bg-red-500/[0.02]" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[12px] font-semibold text-white/85">
            Mesa prop{status.firmName ? ` · ${status.firmName}` : ""}
          </h2>
          {anyDanger && (
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">perto do limite</span>
          )}
        </div>
        <button type="button" onClick={onConfigure} className="interactive-tap text-[10.5px] text-white/35 hover:text-white/70 transition-colors">
          editar limites
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dailySeg && status.dailyLoss.limit !== null && (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">Daily loss</p>
              <p className="text-[10.5px] font-mono tabular-nums text-white/55">
                {fmtUsd(status.dailyLoss.used)} / {fmtUsd(status.dailyLoss.limit)}
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className={`h-full ${dailySeg.color} transition-all`} style={{ width: `${dailySeg.pct}%` }} />
            </div>
            <p className={`text-[10px] font-mono tabular-nums mt-1 ${dailySeg.danger ? "text-red-400" : dailySeg.warn ? "text-amber-400" : "text-white/30"}`}>
              {status.dailyLoss.remaining !== null && status.dailyLoss.remaining > 0
                ? `${fmtUsd(status.dailyLoss.remaining)} restante`
                : "limite estourado"}
            </p>
          </div>
        )}
        {maxSeg && status.maxLoss.limit !== null && (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">Max drawdown</p>
              <p className="text-[10.5px] font-mono tabular-nums text-white/55">
                {fmtUsd(status.maxLoss.used)} / {fmtUsd(status.maxLoss.limit)}
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className={`h-full ${maxSeg.color} transition-all`} style={{ width: `${maxSeg.pct}%` }} />
            </div>
            <p className={`text-[10px] font-mono tabular-nums mt-1 ${maxSeg.danger ? "text-red-400" : maxSeg.warn ? "text-amber-400" : "text-white/30"}`}>
              {status.maxLoss.remaining !== null && status.maxLoss.remaining > 0
                ? `${fmtUsd(status.maxLoss.remaining)} restante`
                : "limite estourado"}
            </p>
          </div>
        )}
        {profitSeg && status.profitTarget.target !== null && (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">Profit target</p>
              <p className="text-[10.5px] font-mono tabular-nums text-white/55">
                {fmtUsd(status.profitTarget.progress)} / {fmtUsd(status.profitTarget.target)}
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className={`h-full ${profitSeg.color} transition-all`} style={{ width: `${profitSeg.pct}%` }} />
            </div>
            <p className="text-[10px] font-mono tabular-nums mt-1 text-white/30">
              {status.profitTarget.remaining !== null && status.profitTarget.remaining > 0
                ? `${fmtUsd(status.profitTarget.remaining)} pra bater`
                : "target batido ✓"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
