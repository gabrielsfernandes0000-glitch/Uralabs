"use client";

/**
 * Loja direta — catálogo de produtos de preço fixo, sem RNG.
 *
 * Enquanto backend não sobe, CTA de cada produto vira "Avise quando abrir".
 * Salva em localStorage um set de IDs interessados — quando endpoint ficar
 * pronto, pode disparar notificação pros users da lista.
 */

import { useEffect, useState } from "react";
import { Ticket, Zap, Clock, Package2, Check, BellRing } from "lucide-react";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";

export type DirectKind = "coupon" | "nitro" | "booster" | "bundle";

export type DirectProduct = {
  id: string;
  name: string;
  description: string;
  price_coins: number;
  kind: DirectKind;
  badge?: string;
  original_price_coins?: number;
  limit_per_user?: number;
  available_now: boolean;
  image_url: string;
};

export const DIRECT_CATALOG: DirectProduct[] = [
  { id: "coupon-elite-10",       name: "Cupom Elite · -10%",   description: "10% off na próxima mensalidade Elite.",    price_coins: 1200, kind: "coupon",  available_now: false, limit_per_user: 1,                                        image_url: "/loja/direct-cupom-elite-10.svg" },
  { id: "coupon-elite-20",       name: "Cupom Elite · -20%",   description: "20% off na próxima mensalidade Elite.",    price_coins: 2800, kind: "coupon",  available_now: false, limit_per_user: 1, badge: "Popular",                      image_url: "/loja/direct-cupom-elite-20.svg" },
  { id: "coupon-elite-30",       name: "Cupom Elite · -30%",   description: "30% off na próxima mensalidade Elite.",    price_coins: 5500, kind: "coupon",  available_now: false, limit_per_user: 1,                                        image_url: "/loja/direct-cupom-elite-30.svg" },
  { id: "nitro-basic",           name: "Discord Nitro Basic",  description: "1 mês de Nitro Basic entregue em até 24h.", price_coins: 1800, kind: "nitro",   available_now: false,                                                           image_url: "/loja/direct-nitro-basic.svg" },
  { id: "nitro-boost",           name: "Discord Nitro Boost",  description: "1 mês de Nitro completo com 2 boosts.",     price_coins: 4900, kind: "nitro",   available_now: false, badge: "+2 Boosts",                                       image_url: "/loja/direct-nitro-boost.svg" },
  { id: "booster-xp-2x-24h",     name: "Booster XP 2x · 24h",  description: "Dobra o ganho de URA Coin por 24 horas.",   price_coins: 400,  kind: "booster", available_now: false,                                                           image_url: "/loja/direct-booster-xp.svg" },
  { id: "booster-streak-saver",  name: "Streak Saver",         description: "Salva sua sequência se você perder 1 dia.", price_coins: 250,  kind: "booster", available_now: false,                                                           image_url: "/loja/direct-streak-saver.svg" },
  { id: "bundle-starter",        name: "Bundle Iniciante",     description: "3 caixas Básicas + 1 Booster XP 24h.",      price_coins: 1200, kind: "bundle",  available_now: false, original_price_coins: 1500, badge: "-20%",              image_url: "/loja/direct-bundle-starter.svg" },
  { id: "bundle-premium",        name: "Bundle Premium",       description: "5 caixas Premium + 1 Cupom Elite -10%.",    price_coins: 6800, kind: "bundle",  available_now: false, original_price_coins: 8500, badge: "-20%",              image_url: "/loja/direct-bundle-premium.svg" },
];

const KIND_ICON: Record<DirectKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  coupon: Ticket,
  nitro: Zap,
  booster: Clock,
  bundle: Package2,
};

const KIND_LABEL: Record<DirectKind, string> = {
  coupon: "Cupom",
  nitro: "Discord",
  booster: "Booster",
  bundle: "Bundle",
};

type Filter = "all" | DirectKind;

const WAITLIST_KEY = "ura-shop-waitlist-v1";

function readWaitlist(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(WAITLIST_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeWaitlist(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WAITLIST_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage cheio — silencia
  }
}

export function DirectShop({
  balance,
  onBuy,
  onWaitlistChange,
}: {
  balance: number;
  onBuy: (product: DirectProduct) => void;
  onWaitlistChange?: (msg: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [waitlist, setWaitlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Hydration-safe localStorage read — só lê client-side após mount pra
    // evitar mismatch server/client. Lint warn é by design nesse padrão.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaitlist(readWaitlist());
  }, []);

  function toggleWaitlist(product: DirectProduct) {
    const wasIn = waitlist.has(product.id);
    setWaitlist((prev) => {
      const next = new Set(prev);
      if (wasIn) next.delete(product.id);
      else next.add(product.id);
      writeWaitlist(next);
      return next;
    });
    // Notifica o pai fora do updater pra não disparar setState de outro
    // componente durante o render.
    onWaitlistChange?.(
      wasIn
        ? `${product.name} removido da sua lista`
        : `${product.name} · te avisamos quando abrir`,
    );
  }

  const filtered = DIRECT_CATALOG.filter((p) => filter === "all" || p.kind === filter);

  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: "all",     label: "Tudo",     count: DIRECT_CATALOG.length },
    { id: "coupon",  label: "Cupons",   count: DIRECT_CATALOG.filter(p => p.kind === "coupon").length },
    { id: "nitro",   label: "Nitro",    count: DIRECT_CATALOG.filter(p => p.kind === "nitro").length },
    { id: "booster", label: "Boosters", count: DIRECT_CATALOG.filter(p => p.kind === "booster").length },
    { id: "bundle",  label: "Bundles",  count: DIRECT_CATALOG.filter(p => p.kind === "bundle").length },
  ];

  return (
    <div>
      {/* Status banner — 1 vez, claro e grande */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-5 py-4 mb-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-white/70" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white leading-tight">Loja direta em configuração</p>
          <p className="text-[11.5px] text-white/45 mt-1 leading-relaxed">
            URA tá finalizando os primeiros produtos. Entre na lista de espera — você será avisado antes de todos quando abrir.
          </p>
        </div>
        {waitlist.size > 0 && (
          <span className="text-[10.5px] text-white/50 font-mono tabular-nums px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] shrink-0">
            {waitlist.size} na sua lista
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-[12px] text-white/40">
          Preço fixo · sem sorteio · entrega manual
        </p>
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`interactive-tap px-3 h-7 rounded-full text-[11.5px] font-medium transition-colors flex items-center gap-1.5 ${
                  active ? "bg-white text-black" : "text-white/45 hover:text-white/75"
                }`}
              >
                {f.label}
                <span className={`text-[10px] tabular-nums ${active ? "text-black/45" : "text-white/30"}`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-14 text-center">
          <p className="text-[13px] text-white/50">Nenhum produto nesse filtro.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-3 text-[11.5px] text-white/70 hover:text-white underline underline-offset-4 decoration-white/20"
          >
            Ver tudo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              balance={balance}
              onBuy={onBuy}
              isWaitlisted={waitlist.has(p.id)}
              onToggleWaitlist={() => toggleWaitlist(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  balance,
  onBuy,
  isWaitlisted,
  onToggleWaitlist,
}: {
  product: DirectProduct;
  balance: number;
  onBuy: (p: DirectProduct) => void;
  isWaitlisted: boolean;
  onToggleWaitlist: () => void;
}) {
  const Icon = KIND_ICON[product.kind];
  const canAfford = balance >= product.price_coins;
  const canBuyNow = product.available_now && canAfford;

  return (
    <div className="group relative rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden transition-colors hover:border-white/[0.1]">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {product.badge && (
          <span className="absolute top-4 right-4 text-[11px] font-semibold text-white px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/15">
            {product.badge}
          </span>
        )}
        <span className="absolute top-4 left-4 flex items-center gap-1.5 text-[11px] text-white/75 tracking-[0.06em] px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <Icon className="w-3 h-3" strokeWidth={2} />
          {KIND_LABEL[product.kind]}
        </span>
      </div>

      <div className="p-5 pt-4">
        <h3 className="text-[16px] font-semibold text-white leading-tight tracking-tight">
          {product.name}
        </h3>
        <p className="text-[12px] text-white/45 mt-1.5 line-clamp-1 leading-snug">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <UraCoinIcon className="w-4 h-4" />
            <span className="text-[18px] font-semibold tabular-nums tracking-tight">
              {product.price_coins.toLocaleString("pt-BR")}
            </span>
            {product.original_price_coins && (
              <span className="text-[11px] text-white/30 line-through tabular-nums ml-1">
                {product.original_price_coins.toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {canBuyNow ? (
            <button
              onClick={() => onBuy(product)}
              className="interactive-tap h-9 px-4 rounded-full bg-white text-black text-[12.5px] font-semibold hover:bg-white/90 transition-colors"
            >
              {!canAfford
                ? `Faltam ${(product.price_coins - balance).toLocaleString("pt-BR")}`
                : "Comprar"}
            </button>
          ) : (
            <button
              onClick={onToggleWaitlist}
              className={`interactive-tap h-9 px-4 rounded-full text-[12.5px] font-semibold transition-colors flex items-center gap-1.5 ${
                isWaitlisted
                  ? "bg-white/[0.08] text-white border border-white/15"
                  : "bg-white text-black hover:bg-white/90"
              }`}
            >
              {isWaitlisted ? (
                <>
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Na lista
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5" strokeWidth={2} />
                  Avise-me
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
