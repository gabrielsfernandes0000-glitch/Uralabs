"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, AlertTriangle, Loader2, Gift, DollarSign, Coins, Sparkles, Zap, Ticket } from "lucide-react";
import Image from "next/image";
import type { BoxWithPrizes, Prize, PrizeType, PrizeRarity } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";
import { RARITY_STYLES } from "./prize-tile";

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

const ITEM_W = 160;
const ITEM_GAP = 12;       // MUST match tailwind class abaixo (gap-3 = 0.75rem = 12px)
const STEP = ITEM_W + ITEM_GAP;
const STRIP_LEN = 130;
const LANDING_INDEX = 118;
const ANIMATION_MS = 11000;

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
      image_url: result.prize.image_url,
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

  // Quando entra em fase "landing", mede DOM pra calcular translateX exato que
  // alinha o tile vencedor com o marker central. Evita drift por gap/padding CSS.
  useEffect(() => {
    if (phase !== "landing") return;
    const el = stripRef.current;
    if (!el) return;

    const container = el.parentElement;
    const landingEl = el.children[LANDING_INDEX] as HTMLElement | undefined;
    if (!container || !landingEl) return;

    // Rects no instante atual (durante spin, strip ja esta deslocado)
    const containerRect = container.getBoundingClientRect();
    const tileRect = landingEl.getBoundingClientRect();

    const containerCenter = containerRect.left + containerRect.width / 2;
    const tileCenter = tileRect.left + tileRect.width / 2;
    const delta = containerCenter - tileCenter; // deslocamento necessario

    // Pega o translateX atual do style inline (ou 0 se era driven pelo rAF) e soma delta
    // Durante spinning usamos `el.style.transform` direto, entao precisamos ler o matrix atual
    const currentMatrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    const currentX = currentMatrix.m41; // translateX efetivo atual

    // Jitter pequeno pra parecer organico sem sair do tile
    const jitter = (Math.random() - 0.5) * (ITEM_W * 0.2);
    const targetX = currentX + delta + jitter;

    // Remove o translateX direto (que foi setado pelo rAF) pra transition do React assumir
    el.style.transform = "";
    setAnimatedToX(targetX);

    const t = setTimeout(() => setPhase("revealed"), ANIMATION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Error handling
  useEffect(() => {
    if (error) setPhase("error");
  }, [error]);

  // Phase "spinning" — strip anima direto via transform no ref (sem setState por frame).
  // Comeca centralizando tile 0 no container e decrementa — passa varios tiles.
  useEffect(() => {
    if (phase !== "spinning") return;
    const el = stripRef.current;
    if (!el) return;
    const container = el.parentElement;
    if (!container) return;
    // Offset inicial: tile 0 centralizado no container
    const initialOffset = container.clientWidth / 2 - ITEM_W / 2;
    let raf = 0;
    let x = initialOffset;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      x -= dt * 1.2;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const withTransition = phase === "landing";

  if (phase === "error") {
    return (
      <Overlay onClose={onClose}>
        <div className="rounded-xl border border-red-400/30 bg-[#0e0e10] p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-bold mb-2">Não foi possível abrir a caixa</h3>
          <p className="text-sm text-white/60 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-white/[0.18] text-white font-semibold text-sm hover:border-white/[0.35] transition-colors"
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
          <p className="text-[10px] text-white/40 mb-1">
            {phase === "revealed" ? "Parabéns" : "Abrindo"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {phase === "revealed" ? result?.prize.name : box.name}
          </h2>
        </div>

        {/* Strip container */}
        <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-black/40 py-6">
          {/* Center marker */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-brand-500 z-10 shadow-[0_0_16px_rgba(255,85,0,0.6)] pointer-events-none" />
          {/* Gradient masks on edges */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0c] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0c] to-transparent z-10 pointer-events-none" />

          <div
            ref={stripRef}
            className="flex gap-3 will-change-transform"
            style={{
              // Spinning: rAF controla via ref. Landing/revealed: React aplica animatedToX absoluto.
              transform: phase !== "spinning" ? `translateX(${animatedToX}px)` : undefined,
              transition: withTransition
                ? `transform ${ANIMATION_MS}ms cubic-bezier(0.08, 0.82, 0.12, 1)`
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

type PrizeLike = Pick<Prize, "id" | "name" | "type" | "rarity" | "value_brl" | "image_url">;

function buildRandomStrip(pool: Array<PrizeLike & { weight: number }>, n: number): PrizeLike[] {
  if (pool.length === 0) {
    // Fallback: placeholder shims se piscina vazia (shouldn't happen — gate in parent)
    return Array.from({ length: n }, (_, i) => ({
      id: `placeholder-${i}`,
      name: "…",
      type: "ura_coin_bonus" as PrizeType,
      rarity: "common" as PrizeRarity,
      value_brl: null,
      image_url: null,
    }));
  }
  const totalW = pool.reduce((s, p) => s + p.weight, 0);
  const out: PrizeLike[] = [];
  for (let i = 0; i < n; i++) {
    let roll = Math.random() * totalW;
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) {
        out.push({ id: p.id, name: p.name, type: p.type, rarity: p.rarity, value_brl: p.value_brl, image_url: p.image_url });
        break;
      }
    }
    if (out.length <= i) out.push(pool[0]);
  }
  return out;
}

// Cor de borda por raridade — alinhada com CSGO (barra esquerda)
const RARITY_BAR: Record<PrizeRarity, string> = {
  common: "#a1a1aa",
  uncommon: "#34d399",
  rare: "#60a5fa",
  epic: "#c084fc",
  legendary: "#fcd34d",
};

function prizeIcon(type: PrizeType) {
  switch (type) {
    case "cash_brl": return DollarSign;
    case "nitro_basic":
    case "nitro_boost": return Zap;
    case "ura_coin_bonus": return Coins;
    case "elite_discount":
    case "cupom_custom": return Ticket;
    case "sub_vip":
    case "sub_elite": return Sparkles;
    default: return Gift;
  }
}

function StripCard({ item, highlighted }: { item: PrizeLike; highlighted: boolean }) {
  const s = RARITY_STYLES[item.rarity];
  const barColor = RARITY_BAR[item.rarity];
  const Icon = prizeIcon(item.type);
  return (
    <div
      className={`shrink-0 py-3 transition-transform duration-500 ${highlighted ? "scale-110 z-20 relative" : ""}`}
      style={{ width: ITEM_W }}
    >
      <div
        className={`relative rounded-lg overflow-hidden bg-[#0e0e10] border border-white/[0.06] ${
          highlighted ? "shadow-[0_0_40px_rgba(255,255,255,0.35)]" : ""
        }`}
        style={{
          height: ITEM_W * 1.1,
          boxShadow: highlighted
            ? `0 0 40px ${barColor}88, 0 0 80px ${barColor}44, inset 0 0 0 1.5px ${barColor}`
            : undefined,
        }}
      >
        {/* Barra de raridade à esquerda (estilo CSGO) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: barColor, boxShadow: `0 0 8px ${barColor}88` }}
        />

        {/* Imagem ou ícone */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-5">
          {item.image_url ? (
            <div className="relative w-full h-full">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                sizes="160px"
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <Icon className="w-12 h-12" style={{ color: barColor }} strokeWidth={1.5} />
          )}
        </div>

        {/* Rarity label top-right */}
        <div
          className="absolute top-2 right-2 text-[8.5px] font-bold"
          style={{ color: barColor }}
        >
          {s.label}
        </div>

        {/* Footer: nome + valor */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-3 pt-6 pb-2">
          <div className="text-[11px] font-semibold text-white truncate leading-tight">
            {item.name}
          </div>
          {item.value_brl != null && item.value_brl > 0 && (
            <div className="text-[10px] text-white/50 tabular-nums mt-0.5">
              R${item.value_brl.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RevealCard({ result, onClose }: { result: OpenResult; onClose: () => void }) {
  const s = RARITY_STYLES[result.prize.rarity];
  const isCash = result.prize.type === "cash_brl";
  const isCoinBonus = result.prize.type === "ura_coin_bonus";
  const coinAmount = isCoinBonus ? Number(result.prize.metadata?.coin_amount ?? 0) : 0;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm p-7 max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
      {/* Rarity — label sutil com dot, monocromático salvo ponto de cor mínimo */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-1.5 h-1.5 rounded-full ${RARITY_DOT[result.prize.rarity]}`} />
        <span className="text-[11px] text-white/50 tracking-[0.08em]">{s.label}</span>
      </div>

      <h3 className="text-[22px] font-semibold text-white tracking-tight leading-tight mb-1.5">
        {result.prize.name}
      </h3>

      {result.prize.value_brl != null && result.prize.value_brl > 0 && !isCoinBonus && (
        <p className="text-[13px] text-white/45 tabular-nums">
          R${result.prize.value_brl.toFixed(2)}
        </p>
      )}

      {isCoinBonus && (
        <p className="text-[13px] text-white/55 flex items-center gap-1.5 tabular-nums">
          <UraCoinIcon className="w-3.5 h-3.5" />
          +{coinAmount.toLocaleString("pt-BR")} no saldo
        </p>
      )}

      <p className="text-[12px] text-white/35 mt-5 leading-relaxed">
        {isCash
          ? "Envie os dados de PIX na próxima tela pra receber."
          : isCoinBonus
            ? "Crédito automático concluído."
            : "URA entrega manualmente — aguarde DM ou notificação."}
      </p>

      <button
        onClick={onClose}
        className="interactive-tap mt-6 w-full h-11 rounded-full bg-white text-black font-semibold text-[13px] hover:bg-white/90 transition-colors"
      >
        {isCash ? "Enviar PIX agora" : "Continuar"}
      </button>
    </div>
  );
}

const RARITY_DOT: Record<PrizeRarity, string> = {
  common: "bg-zinc-400",
  uncommon: "bg-emerald-400",
  rare: "bg-blue-400",
  epic: "bg-purple-400",
  legendary: "bg-amber-400",
};
