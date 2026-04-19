"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import type { BoxWithPrizes, Prize, PrizeType, PrizeRarity } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";
import { PrizeTile, RARITY_STYLES } from "./prize-tile";

export type OpenResult = {
  opening_id: string;
  redemption_id: string;
  prize: {
    id: string;
    slug: string;
    name: string;
    type: PrizeType;
    rarity: PrizeRarity;
    value_brl: number | null;
    image_url: string | null;
    metadata: Record<string, unknown>;
  };
  redemption_status: "pending_claim" | "pending_fulfillment" | "fulfilled";
  coins_spent: number;
  rng_roll: number;
};

const ITEM_W = 140;   // px — largura de cada tile na strip
const ITEM_GAP = 8;   // px
const STEP = ITEM_W + ITEM_GAP;
const STRIP_LEN = 60; // itens visíveis no total
const LANDING_INDEX = 52; // índice do vencedor na strip (pra dar bastante scroll antes)
const ANIMATION_MS = 4200;

export function OpenOverlay({
  box,
  result,
  error,
  onClose,
}: {
  box: BoxWithPrizes;
  result: OpenResult | null;
  error: string | null;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"spinning" | "landing" | "revealed" | "error">("spinning");
  const stripRef = useRef<HTMLDivElement>(null);
  const [animatedToX, setAnimatedToX] = useState<number>(0);

  // Strip items: majority é random weighted do pool da caixa;
  // o item em LANDING_INDEX vira o vencedor quando result chega.
  const pool = useMemo(() => box.prizes.filter((p) => !p.exhausted_today), [box]);
  const [strip, setStrip] = useState<Array<PrizeLike>>(() => buildRandomStrip(pool, STRIP_LEN));

  // Quando o resultado chega, substitui o item na posição de landing pelo prêmio real
  useEffect(() => {
    if (!result) return;
    const winner: PrizeLike = {
      id: result.prize.id,
      name: result.prize.name,
      type: result.prize.type,
      rarity: result.prize.rarity,
      value_brl: result.prize.value_brl,
    };
    setStrip((prev) => {
      const next = [...prev];
      next[LANDING_INDEX] = winner;
      return next;
    });
    // Aguarda uma leve pausa pra sensação de suspense, depois dispara landing
    const t = setTimeout(() => setPhase("landing"), 350);
    return () => clearTimeout(t);
  }, [result]);

  // Quando entra em fase "landing", aplica transform com transition cubic-bezier
  useEffect(() => {
    if (phase !== "landing") return;
    const el = stripRef.current;
    if (!el) return;
    // pequena aleatoriedade na posição final pro landing não cair cravado no centro
    const jitter = (Math.random() - 0.5) * (ITEM_W * 0.6);
    const targetX = -(LANDING_INDEX * STEP - STEP / 2) + jitter;
    setAnimatedToX(targetX);
    const t = setTimeout(() => setPhase("revealed"), ANIMATION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Error handling
  useEffect(() => {
    if (error) setPhase("error");
  }, [error]);

  // Phase "spinning" — strip anima pra direita em loop sutil
  const [spinX, setSpinX] = useState(0);
  useEffect(() => {
    if (phase !== "spinning") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setSpinX((x) => x - dt * 0.9); // velocidade constante
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const translateX = phase === "spinning" ? spinX : animatedToX;
  const withTransition = phase === "landing";

  if (phase === "error") {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Não foi possível abrir a caixa</h3>
          <p className="text-sm text-white/60 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Fechar
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={phase === "revealed" ? onClose : undefined}>
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">
            {phase === "revealed" ? "Parabéns" : "Abrindo"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {phase === "revealed" ? result?.prize.name : box.name}
          </h2>
        </div>

        {/* Strip container */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-black/40 py-6">
          {/* Center marker */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-brand-500 z-10 shadow-[0_0_16px_rgba(255,85,0,0.6)] pointer-events-none" />
          {/* Gradient masks on edges */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0c] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0c] to-transparent z-10 pointer-events-none" />

          <div
            ref={stripRef}
            className="flex gap-2 will-change-transform"
            style={{
              transform: `translateX(calc(50% + ${translateX}px))`,
              transition: withTransition
                ? `transform ${ANIMATION_MS}ms cubic-bezier(0.12, 0.68, 0.2, 1)`
                : undefined,
            }}
          >
            {strip.map((item, i) => (
              <StripCard
                key={`${i}-${item.id}`}
                item={item}
                highlighted={phase === "revealed" && i === LANDING_INDEX}
              />
            ))}
          </div>
        </div>

        {/* Reveal card */}
        {phase === "revealed" && result && (
          <RevealCard result={result} onClose={onClose} />
        )}

        {phase === "spinning" && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sorteando…
          </div>
        )}
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-200">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {children}
    </div>
  );
}

type PrizeLike = Pick<Prize, "id" | "name" | "type" | "rarity" | "value_brl">;

function buildRandomStrip(pool: Array<PrizeLike & { weight: number }>, n: number): PrizeLike[] {
  if (pool.length === 0) {
    // Fallback: placeholder shims se piscina vazia (shouldn't happen — gate in parent)
    return Array.from({ length: n }, (_, i) => ({
      id: `placeholder-${i}`,
      name: "…",
      type: "ura_coin_bonus" as PrizeType,
      rarity: "common" as PrizeRarity,
      value_brl: null,
    }));
  }
  const totalW = pool.reduce((s, p) => s + p.weight, 0);
  const out: PrizeLike[] = [];
  for (let i = 0; i < n; i++) {
    let roll = Math.random() * totalW;
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) {
        out.push({ id: p.id, name: p.name, type: p.type, rarity: p.rarity, value_brl: p.value_brl });
        break;
      }
    }
    if (out.length <= i) out.push(pool[0]);
  }
  return out;
}

function StripCard({ item, highlighted }: { item: PrizeLike; highlighted: boolean }) {
  const s = RARITY_STYLES[item.rarity];
  return (
    <div
      className={`shrink-0 transition-all duration-500 ${highlighted ? "scale-110" : ""}`}
      style={{ width: ITEM_W }}
    >
      <div
        className={`relative rounded-xl border ${s.bg} ${s.border} ${
          highlighted ? `shadow-[0_0_24px_rgba(255,255,255,0.15)] ring-2 ring-white/30` : ""
        } overflow-hidden`}
      >
        <PrizeTileFull item={item} />
      </div>
    </div>
  );
}

function PrizeTileFull({ item }: { item: PrizeLike }) {
  return (
    <PrizeTile
      name={item.name}
      type={item.type}
      rarity={item.rarity}
      valueBrl={item.value_brl}
    />
  );
}

function RevealCard({ result, onClose }: { result: OpenResult; onClose: () => void }) {
  const s = RARITY_STYLES[result.prize.rarity];
  const isCash = result.prize.type === "cash_brl";
  const isCoinBonus = result.prize.type === "ura_coin_bonus";
  const coinAmount = isCoinBonus ? Number(result.prize.metadata?.coin_amount ?? 0) : 0;

  return (
    <div
      className={`rounded-2xl border ${s.border} ${s.bg} backdrop-blur-sm p-6 max-w-md w-full text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500`}
    >
      <div className={`text-xs uppercase tracking-[0.24em] ${s.text} mb-3 font-semibold`}>
        {s.label}
      </div>
      <h3 className="text-2xl font-bold mb-2">{result.prize.name}</h3>
      {result.prize.value_brl != null && result.prize.value_brl > 0 && (
        <p className="text-sm text-white/60 mb-2">
          Valor: R${result.prize.value_brl.toFixed(2)}
        </p>
      )}
      {isCoinBonus && (
        <p className="text-sm text-white/60 mb-2 inline-flex items-center gap-1">
          <UraCoinIcon className="w-3.5 h-3.5" />
          +{coinAmount.toLocaleString("pt-BR")} URA Coin · creditado automático
        </p>
      )}
      <p className="text-xs text-white/40 mt-3">
        {isCash
          ? "Envie os dados de PIX na próxima tela pra receber."
          : isCoinBonus
            ? "Já tá no seu saldo."
            : "O URA entrega manualmente (aguarde DM ou notificação)."}
      </p>
      <button
        onClick={onClose}
        className="mt-5 w-full px-5 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
      >
        {isCash ? "Enviar PIX agora" : "Continuar"}
      </button>
    </div>
  );
}
