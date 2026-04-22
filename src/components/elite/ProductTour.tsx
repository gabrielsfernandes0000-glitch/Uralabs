"use client";

import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";

/* ────────────────────────────────────────────
   Product Tour — guia interativo estilo Intercom/Userpilot.

   Cada passo:
    - Destaca um elemento (via `data-tour="id"` ou CSS selector)
    - Renderiza overlay com "buraco" no rect do elemento (SVG mask)
    - Posiciona balão ao lado/abaixo/acima do elemento com seta apontando
    - Navegação: anterior · próximo · pular · concluir

   Se o elemento não existe no DOM (ex: user está em jornada diferente),
   o passo é silenciosamente pulado — o tour segue pro próximo válido.

   Uso:
     <ProductTour steps={STEPS} onFinish={handleFinish} onSkip={handleSkip} />
   ──────────────────────────────────────────── */

export interface TourStep {
  /** ID único do passo (pra skip lógica). */
  id: string;
  /** CSS selector ou data-tour id (ambos funcionam). Ex: `#my-id` ou `trade-form`. */
  target: string;
  /** Título curto do balão. */
  title: string;
  /** Copy explicativo. */
  body: string;
  /** Posição preferida do balão. Default: bottom. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Ação opcional antes de mostrar esse passo (ex: scrollar ou trocar aba). */
  onBeforeShow?: () => void | Promise<void>;
  /** Se true, esse passo não recebe spotlight — renderiza só como modal flutuante central.
   *  Útil pra intro/outro. */
  floating?: boolean;
}

interface Props {
  steps: TourStep[];
  onFinish: () => void;
  onSkip: () => void;
}

const PADDING = 8;
const BALLOON_OFFSET = 14;
const BALLOON_WIDTH = 320;
const BALLOON_HEIGHT_EST = 220; // estimativa conservadora (título + body 3 linhas + footer)
const MARGIN = 16;              // espaço mínimo entre balão e borda do viewport

export function ProductTour({ steps, onFinish, onSkip }: Props) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setMounted(true);
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const step = steps[index];

  const resolveTarget = useCallback((target: string): Element | null => {
    // Primeiro tenta CSS selector direto
    try {
      const el = document.querySelector(target);
      if (el) return el;
    } catch {
      // selector inválido
    }
    // Depois tenta como data-tour id
    return document.querySelector(`[data-tour="${target}"]`);
  }, []);

  // Recalcula rect quando o passo muda ou janela redimensiona.
  // IMPORTANTE: `onBeforeShow` é chamado SEMPRE, mesmo em passos floating —
  // alguns passos usam esse hook pra trocar jornada/aba antes de highlightar.
  useLayoutEffect(() => {
    if (!step) return;

    let cancelled = false;
    let retries = 0;

    const run = async () => {
      if (cancelled) return;
      if (step.onBeforeShow) {
        try {
          await step.onBeforeShow();
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;

      if (step.floating) {
        setRect(null);
        return;
      }

      const el = resolveTarget(step.target);
      if (!el) {
        if (retries < 15) {
          retries++;
          setTimeout(run, 150);
          return;
        }
        setIndex((i) => Math.min(i + 1, steps.length - 1));
        return;
      }

      // Scroll inteligente: coloca o elemento numa posição que deixa espaço
      // pro balão acima OU abaixo sem cortar na borda.
      //
      // Estratégia: quer posicionar o topo do elemento a ~30% da altura do
      // viewport. Isso garante espaço abaixo pro balão (prefer bottom) e
      // margem no topo caso precise flipar.
      const vh = window.innerHeight;
      const targetY = vh * 0.3;
      const currentRect = el.getBoundingClientRect();
      const delta = currentRect.top - targetY;
      if (Math.abs(delta) > 10) {
        window.scrollBy({ top: delta, behavior: "smooth" });
      }

      // Aguarda fim do smooth-scroll pra medir final
      setTimeout(() => {
        if (cancelled) return;
        const r = el.getBoundingClientRect();
        setRect(r);
      }, 400);
    };

    run();
    return () => { cancelled = true; };
  }, [step, viewport, resolveTarget, steps.length]);

  // Atualiza rect em scroll/resize contínuo (user mexe na página durante o tour)
  useEffect(() => {
    if (!step || step.floating) return;
    const update = () => {
      const el = resolveTarget(step.target);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [step, resolveTarget]);

  // Teclado: setas nav + esc pula
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      else if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, steps.length]);

  if (!mounted || !step) return null;

  const goNext = () => {
    if (index >= steps.length - 1) onFinish();
    else setIndex(index + 1);
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const isLast = index === steps.length - 1;
  const isFirst = index === 0;

  const holePadding = PADDING;
  const hole = rect && !step.floating ? {
    x: Math.max(0, rect.left - holePadding),
    y: Math.max(0, rect.top - holePadding),
    w: rect.width + holePadding * 2,
    h: rect.height + holePadding * 2,
  } : null;

  // Posição do balão — garante que caiba no viewport sempre.
  // Estratégia: escolhe placement com base no espaço real disponível,
  // clampa coords pra nunca cortar no limite da tela.
  const balloon = (() => {
    if (step.floating || !rect || !hole) {
      return {
        top: viewport.h / 2 - BALLOON_HEIGHT_EST / 2,
        left: viewport.w / 2 - BALLOON_WIDTH / 2,
        arrow: null as null | "top" | "bottom" | "left" | "right",
      };
    }
    const ballW = Math.min(BALLOON_WIDTH, viewport.w - MARGIN * 2);
    const ballH = BALLOON_HEIGHT_EST;

    const spaceBelow = viewport.h - (hole.y + hole.h) - BALLOON_OFFSET;
    const spaceAbove = hole.y - BALLOON_OFFSET;
    const spaceRight = viewport.w - (hole.x + hole.w) - BALLOON_OFFSET;
    const spaceLeft = hole.x - BALLOON_OFFSET;

    // Placement real (validado, não só a preferência do step)
    let placement: "top" | "bottom" | "left" | "right";
    const preferred = step.placement ?? "bottom";

    if (preferred === "bottom" && spaceBelow >= ballH + MARGIN) placement = "bottom";
    else if (preferred === "top" && spaceAbove >= ballH + MARGIN) placement = "top";
    else if (preferred === "right" && spaceRight >= ballW + MARGIN) placement = "right";
    else if (preferred === "left" && spaceLeft >= ballW + MARGIN) placement = "left";
    // Preferência não cabe — escolhe maior espaço disponível
    else if (spaceBelow >= ballH + MARGIN) placement = "bottom";
    else if (spaceAbove >= ballH + MARGIN) placement = "top";
    else if (spaceRight >= ballW + MARGIN) placement = "right";
    else if (spaceLeft >= ballW + MARGIN) placement = "left";
    // Último recurso: maior espaço mesmo cortando um pouco
    else {
      const maxSpace = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
      if (maxSpace === spaceBelow) placement = "bottom";
      else if (maxSpace === spaceAbove) placement = "top";
      else if (maxSpace === spaceRight) placement = "right";
      else placement = "left";
    }

    let top: number;
    let left: number;
    let arrow: "top" | "bottom" | "left" | "right";

    if (placement === "bottom") {
      top = hole.y + hole.h + BALLOON_OFFSET;
      left = hole.x + hole.w / 2 - ballW / 2;
      arrow = "top";
    } else if (placement === "top") {
      top = hole.y - BALLOON_OFFSET - ballH;
      left = hole.x + hole.w / 2 - ballW / 2;
      arrow = "bottom";
    } else if (placement === "right") {
      top = hole.y + hole.h / 2 - ballH / 2;
      left = hole.x + hole.w + BALLOON_OFFSET;
      arrow = "left";
    } else {
      top = hole.y + hole.h / 2 - ballH / 2;
      left = hole.x - BALLOON_OFFSET - ballW;
      arrow = "right";
    }

    // Clamp final — nunca sai da viewport
    top = clamp(top, MARGIN, viewport.h - ballH - MARGIN);
    left = clamp(left, MARGIN, viewport.w - ballW - MARGIN);

    return { top, left, arrow };
  })();

  const content = (
    <div className="fixed inset-0 z-[1100] pointer-events-none">
      {/* Overlay com "buraco" no rect do elemento (SVG mask) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={(e) => {
          // Click no overlay (fora do balão) avança
          if (e.target === e.currentTarget) goNext();
        }}
      >
        <defs>
          <mask id="tour-hole-mask">
            <rect width="100%" height="100%" fill="white" />
            {hole && (
              <rect
                x={hole.x}
                y={hole.y}
                width={hole.w}
                height={hole.h}
                rx={10}
                ry={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.62)"
          mask="url(#tour-hole-mask)"
        />
        {/* Borda sutil no buraco */}
        {hole && (
          <rect
            x={hole.x}
            y={hole.y}
            width={hole.w}
            height={hole.h}
            rx={10}
            ry={10}
            fill="none"
            stroke="rgba(255,85,0,0.55)"
            strokeWidth={1.5}
          />
        )}
      </svg>

      {/* Balão */}
      <div
        className="absolute pointer-events-auto"
        style={{
          top: balloon.top,
          left: balloon.left,
          width: Math.min(BALLOON_WIDTH, viewport.w - 32),
        }}
      >
        {/* Seta */}
        {balloon.arrow && (
          <div
            className={`absolute w-3 h-3 rotate-45 bg-[#141417] border-white/[0.08] ${
              balloon.arrow === "top"
                ? "-top-1.5 left-1/2 -ml-1.5 border-t border-l"
                : balloon.arrow === "bottom"
                ? "-bottom-1.5 left-1/2 -ml-1.5 border-b border-r"
                : balloon.arrow === "left"
                ? "-left-1.5 top-1/2 -mt-1.5 border-l border-b"
                : "-right-1.5 top-1/2 -mt-1.5 border-r border-t"
            }`}
          />
        )}

        <div className="relative rounded-xl bg-[#141417] border border-white/[0.08] shadow-2xl overflow-hidden">
          {/* Progress bar top */}
          <div className="h-[2px] bg-white/[0.04]">
            <div
              className="h-full bg-brand-500 transition-all duration-300"
              style={{ width: `${((index + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-4">
            {/* Header com close */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono tabular-nums text-white/35 mb-0.5">
                  {index + 1} de {steps.length}
                </p>
                <h4 className="text-[14px] font-semibold text-white tracking-tight leading-tight">
                  {step.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={onSkip}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
                title="Pular tour (Esc)"
                aria-label="Pular tour"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            <p className="text-[12px] text-white/65 leading-relaxed mb-4 whitespace-pre-line">
              {step.body}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onSkip}
                className="text-[10.5px] text-white/35 hover:text-white/70 transition-colors"
              >
                Pular tour
              </button>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/[0.08] hover:border-white/[0.2] text-[11.5px] font-semibold text-white/60 hover:text-white transition-colors"
                    title="Anterior (←)"
                  >
                    <ArrowLeft className="w-3 h-3" /> Anterior
                  </button>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-500 text-[11.5px] font-semibold text-brand-500 hover:bg-brand-500/[0.06] transition-colors"
                  title={isLast ? "Concluir tour" : "Próximo (→ ou Enter)"}
                >
                  {isLast ? (
                    <>
                      <Check className="w-3 h-3" /> Concluir
                    </>
                  ) : (
                    <>
                      Próximo <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
