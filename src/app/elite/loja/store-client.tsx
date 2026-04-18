"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, History } from "lucide-react";
import type { BoxWithPrizes, UserCoinBalance, RecentOpening, PrizeType, PrizeRarity } from "@/lib/ura-coin";
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
      <Header balance={balance} lifetimeEarned={lifetimeEarned} />

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
          Loot Boxes
        </h2>
        {boxes.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-14 text-center">
            <p className="text-white/50 text-sm">Nenhuma caixa disponível no momento.</p>
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
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
            <History className="w-3 h-3" />
            Últimas aberturas
          </h2>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {recentOpenings.map((op) => (
              <RecentRow key={op.id} op={op} onClaim={(r) => setPixClaim(r)} />
            ))}
          </div>
        </section>
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
              <Coins className="relative w-9 h-9 md:w-11 md:h-11 text-amber-400 fill-amber-500/30" />
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
          <Coins className="w-3 h-3 text-amber-500/60" />
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
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
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
