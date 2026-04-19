"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import type { BoxWithPrizes, UserCoinBalance, RecentOpening, PrizeType, PrizeRarity } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";
import { BoxCard } from "./box-card";
import { OpenOverlay, type OpenResult } from "./open-overlay";
import { PixDialog } from "./pix-dialog";
import { PrizeTile } from "./prize-tile";

export function StoreClient({
  initialBalance,
  boxes,
  recentOpenings,
}: {
  initialBalance: UserCoinBalance;
  boxes: BoxWithPrizes[];
  recentOpenings: RecentOpening[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance.balance);
  const [lifetimeEarned] = useState(initialBalance.lifetime_earned);
  const [opening, setOpening] = useState<{
    box: BoxWithPrizes;
    result: OpenResult | null;
    error: string | null;
  } | null>(null);
  const [pixClaim, setPixClaim] = useState<{
    redemptionId: string;
    prizeName: string;
    amountBrl: number | null;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleOpen(box: BoxWithPrizes) {
    if (opening) return;
    if (balance < box.cost_coins) {
      showToast("Saldo insuficiente");
      return;
    }
    if (!box.any_available) {
      showToast("Todos os prêmios desta caixa estão esgotados hoje");
      return;
    }

    setOpening({ box, result: null, error: null });

    try {
      const res = await fetch("/api/loot/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box_id: box.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOpening((prev) => (prev ? { ...prev, error: data.error ?? "Erro desconhecido" } : null));
        return;
      }

      const result = data as OpenResult;
      setOpening((prev) => (prev ? { ...prev, result } : null));

      // Atualiza saldo (débito da caixa + crédito se foi bônus de coin)
      setBalance((b) => {
        let next = b - box.cost_coins;
        if (result.prize.type === "ura_coin_bonus") {
          const bonus = Number(result.prize.metadata?.coin_amount ?? 0);
          next += bonus;
        }
        return next;
      });
    } catch (err) {
      setOpening((prev) =>
        prev ? { ...prev, error: err instanceof Error ? err.message : "Falha na rede" } : null,
      );
    }
  }

  function handleOverlayClose() {
    const result = opening?.result;
    const error = opening?.error;
    setOpening(null);
    if (error) {
      showToast(error);
      return;
    }
    if (result?.prize.type === "cash_brl") {
      setPixClaim({
        redemptionId: result.redemption_id,
        prizeName: result.prize.name,
        amountBrl: result.prize.value_brl,
      });
    } else {
      router.refresh();
    }
  }

  function handlePixClose(submitted: boolean) {
    setPixClaim(null);
    if (submitted) {
      showToast("PIX enviado! Admin vai processar em breve.");
      router.refresh();
    }
  }

  return (
    <>
      <div className="animate-in-up"><Header balance={balance} lifetimeEarned={lifetimeEarned} /></div>

      <section className="animate-in-up delay-1 mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
          Loot Boxes
        </h2>
        {boxes.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-8 md:p-10 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
              <span className="font-black tracking-tighter whitespace-nowrap select-none opacity-[0.025] text-amber-400 pr-12"
                style={{ fontSize: "200px", letterSpacing: "-0.06em", lineHeight: 1 }}>
                LOJA
              </span>
            </div>
            <div className="absolute top-[-30%] right-[10%] w-[300px] h-[180px] bg-amber-500/[0.04] blur-[120px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 items-start">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400 mb-3">· Próximas caixas em breve</p>
                <h3 className="text-[22px] font-bold text-white tracking-tight mb-3 leading-tight">
                  Acumule URA Coin e abra caixas com cosméticos, prêmios em cash e drops especiais
                </h3>
                <p className="text-[12.5px] text-white/45 leading-relaxed mb-6 max-w-lg">
                  Ainda não há caixas disponíveis nesta temporada. Enquanto isso, concentre-se em acumular coin — quanto mais você tiver quando elas forem abertas, mais chances de prêmios raros.
                </p>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">Como ganhar coin</p>
                  <div className="space-y-2 text-[12.5px] text-white/60">
                    <div className="flex items-baseline gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 translate-y-[6px]" />
                      <span><span className="font-bold text-white/80">Missão do dia</span> · 3 cenários de prática · streak mantida</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 translate-y-[6px]" />
                      <span><span className="font-bold text-white/80">Calls ao vivo</span> · coin por presença e engajamento</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 translate-y-[6px]" />
                      <span><span className="font-bold text-white/80">Drops aleatórios</span> · mensagens surpresa no Discord</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 translate-y-[6px]" />
                      <span><span className="font-bold text-white/80">Conquistas desbloqueadas</span> · bonus proporcional à raridade</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:border-l md:border-white/[0.06] md:pl-8">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-3">O que esperar</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">· Cosméticos</p>
                      <p className="text-[11px] text-white/35 mt-0.5">Banner, frame de avatar, aura</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">· Cash drops</p>
                      <p className="text-[11px] text-white/35 mt-0.5">PIX direto pra conta</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">· Edições raras</p>
                      <p className="text-[11px] text-white/35 mt-0.5">Limited · nunca reemitidas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boxes.map((box) => (
              <BoxCard
                key={box.id}
                box={box}
                balance={balance}
                onOpen={() => handleOpen(box)}
                disabled={!!opening}
              />
            ))}
          </div>
        )}
      </section>

      {recentOpenings.length > 0 && (
        <HistorySection
          openings={recentOpenings}
          onClaim={(r) => setPixClaim(r)}
        />
      )}

      {opening && (
        <OpenOverlay
          box={opening.box}
          result={opening.result}
          error={opening.error}
          onClose={handleOverlayClose}
        />
      )}

      {pixClaim && <PixDialog {...pixClaim} onClose={handlePixClose} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium shadow-2xl animate-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </>
  );
}

function Header({ balance, lifetimeEarned }: { balance: number; lifetimeEarned: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] via-transparent to-brand-500/[0.04] p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/40 mb-2">Seu saldo</div>
          <div className="flex items-baseline gap-2">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-amber-500/30" />
              <UraCoinIcon className="relative w-9 h-9 md:w-11 md:h-11" />
            </div>
            <span className="text-5xl md:text-6xl font-bold tabular-nums tracking-tight">
              {balance.toLocaleString("pt-BR")}
            </span>
            <span className="text-sm text-white/40 ml-1">URA Coin</span>
          </div>
          <p className="text-[11px] text-white/30 mt-2 tabular-nums">
            Total ganho: {lifetimeEarned.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="text-right md:max-w-sm">
          <p className="text-sm text-white/50 leading-relaxed">
            Ganhe URA Coin participando das <span className="text-white">calls</span>,
            {" "}desbloqueando <span className="text-white">conquistas</span> e mantendo
            {" "}<span className="text-white">streak</span> diária. Troque por recompensas nas caixas.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Histórico de premiações — filtro por tipo + expansão ──
     Backend já manda até 80 aberturas no primeiro load. Mostramos 8 até o
     user pedir pra ver tudo, pra não pesar o viewport. ── */
type HistoryFilter = "all" | "cash" | "cosmetic" | "coin" | "other";

function HistorySection({
  openings,
  onClaim,
}: {
  openings: RecentOpening[];
  onClaim: (r: { redemptionId: string; prizeName: string; amountBrl: number | null }) => void;
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const matchFilter = (op: RecentOpening): boolean => {
    if (filter === "all") return true;
    if (filter === "cash") return op.prize.type === "cash_brl";
    if (filter === "coin") return op.prize.type === "ura_coin_bonus";
    if (filter === "cosmetic") return ["banner", "avatar_frame", "avatar_effect", "profile_design"].includes(op.prize.type);
    return !["cash_brl", "ura_coin_bonus", "banner", "avatar_frame", "avatar_effect", "profile_design"].includes(op.prize.type);
  };

  const filtered = openings.filter(matchFilter);
  const visible = expanded ? filtered : filtered.slice(0, 8);
  const hiddenCount = filtered.length - visible.length;

  const totalCoinsSpent = openings.reduce((sum, o) => sum + Number(o.coins_spent || 0), 0);

  const FILTERS: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "Tudo" },
    { id: "cash", label: "Cash" },
    { id: "cosmetic", label: "Cosméticos" },
    { id: "coin", label: "Coin Bonus" },
    { id: "other", label: "Outros" },
  ];

  return (
    <section className="animate-in-up delay-2 mt-12">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <History className="w-3 h-3 text-white/40" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Histórico de aberturas
          </h2>
          <span className="text-[11px] text-white/30 font-mono">
            {openings.length} · {totalCoinsSpent.toLocaleString("pt-BR")} coin gastos
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setExpanded(false); }}
                className={`interactive-tap px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
                  active
                    ? "border-white/[0.22] text-white"
                    : "border-white/[0.05] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] py-10 text-center">
          <p className="text-[12px] text-white/35">Nenhuma abertura nesse filtro.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {visible.map((op) => (
              <RecentRow key={op.id} op={op} onClaim={onClaim} />
            ))}
          </div>

          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="interactive-tap mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-[12px] font-semibold text-white/60 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Ver mais {hiddenCount}
            </button>
          )}
          {expanded && filtered.length > 8 && (
            <button
              onClick={() => setExpanded(false)}
              className="interactive-tap mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/[0.06] bg-transparent text-[12px] font-semibold text-white/40 hover:text-white/70 hover:border-white/[0.12] transition-all"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Recolher
            </button>
          )}
        </>
      )}
    </section>
  );
}

function RecentRow({
  op,
  onClaim,
}: {
  op: RecentOpening;
  onClaim: (r: { redemptionId: string; prizeName: string; amountBrl: number | null }) => void;
}) {
  const needsPix = op.prize.type === "cash_brl" && op.redemption?.status === "pending_claim";
  const statusLabel = getStatusLabel(op.prize.type, op.redemption?.status);

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0">
      <PrizeTile
        name={op.prize.name}
        type={op.prize.type}
        rarity={op.prize.rarity}
        valueBrl={op.prize.value_brl}
        compact
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{op.prize.name}</div>
        <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
          <UraCoinIcon className="w-3 h-3" />
          <span className="tabular-nums">{op.coins_spent.toLocaleString("pt-BR")}</span>
          <span>·</span>
          <time>{formatTimeAgo(op.opened_at)}</time>
        </div>
      </div>
      {needsPix && op.redemption ? (
        <button
          onClick={() =>
            onClaim({
              redemptionId: op.redemption!.id,
              prizeName: op.prize.name,
              amountBrl: op.prize.value_brl,
            })
          }
          className="interactive-tap text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
        >
          Enviar PIX
        </button>
      ) : (
        <span className="text-[11px] text-white/40">{statusLabel}</span>
      )}
    </div>
  );
}

function getStatusLabel(type: PrizeType, status?: string): string {
  if (type === "ura_coin_bonus") return "auto-creditado";
  if (status === "fulfilled") return "entregue";
  if (status === "pending_claim") return "aguardando PIX";
  if (status === "pending_fulfillment") return "em entrega";
  if (status === "cancelled") return "cancelado";
  return "—";
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.round(hrs / 24);
  return `${days}d atrás`;
}

/* Re-export rarity/type for external usage in this dir */
export type { PrizeType, PrizeRarity };
