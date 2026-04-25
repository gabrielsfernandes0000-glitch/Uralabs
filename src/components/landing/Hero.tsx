"use client";

import { Radio, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { trackEvent } from "@/lib/analytics";

type Props = {
  onlineCount?: number;
  memberCount?: number;
};

export function Hero({ onlineCount, memberCount }: Props) {
  const online = onlineCount ?? 0;
  const members = memberCount ?? 0;
  const showStats = members > 0;

  return (
    <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/[0.04] rounded-full blur-[120px] -z-10" />

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10 pt-10">
          <Reveal>
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full surface-card mb-8">
              <div className="flex items-center gap-2">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-semantic-up)]" />
                <span className="text-[11px] font-medium text-white/75">
                  Sala operacional ativa
                </span>
              </div>
              <div className="h-3 w-px bg-white/[0.08]" />
              <div className="flex items-center gap-1.5 text-[11px] text-white/45">
                <Radio className="w-3 h-3" strokeWidth={2} />
                <span className="font-mono tabular-nums">
                  {showStats ? `${online.toLocaleString("pt-BR")} conectados` : "Discord ao vivo"}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-[1.1] text-white">
              Cansado de ser
              <br className="hidden md:block" />
              {" "}liquidez do <span className="text-brand-500">mercado?</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mb-10 leading-relaxed">
              Enquanto você segue indicador atrasado, os bancos operam contra você. Aqui você aprende a ler o que eles fazem — e lucrar junto. <span className="text-white/85">Cripto e Nasdaq, do zero.</span>
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col items-center gap-3 mb-12">
              <Button
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_discord_free", { location: "hero" })}
                className="group gap-2 h-12 px-8 text-[14px] font-semibold bg-brand-500 hover:bg-brand-400 text-white border-none cursor-pointer transition-colors"
              >
                Entrar na comunidade grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                <ShieldCheck className="w-3 h-3" strokeWidth={2} />
                <span>Planos pagos com garantia de 7 dias</span>
                <span className="text-white/20">·</span>
                <a
                  href="#pricing"
                  className="text-white/55 hover:text-white transition-colors"
                >
                  ver preços
                </a>
              </div>
            </div>
          </Reveal>

          {/* Impact stats */}
          <Reveal delay={0.4}>
            <div className="flex items-center gap-8 md:gap-12 mb-12">
              <div className="text-center">
                <p className="text-[28px] font-semibold text-white tabular-nums leading-none">+1.775%</p>
                <p className="text-[11px] text-white/50 mt-1.5">Calls em março/2026</p>
                <p className="text-[10px] text-white/30 mt-0.5">20 operações · referência</p>
              </div>
              <div className="h-10 w-px bg-white/[0.08]" />
              <div className="text-center">
                <p className="text-[28px] font-semibold text-white tabular-nums leading-none">70%</p>
                <p className="text-[11px] text-white/50 mt-1.5">De acerto</p>
                <p className="text-[10px] text-white/30 mt-0.5">14 wins · 6 loss</p>
              </div>
              {showStats && (
                <>
                  <div className="h-10 w-px bg-white/[0.08]" />
                  <div className="text-center">
                    <p className="text-[28px] font-semibold text-white tabular-nums leading-none">{members.toLocaleString("pt-BR")}</p>
                    <p className="text-[11px] text-white/50 mt-1.5">No Discord</p>
                    <p className="text-[10px] text-white/30 mt-0.5">entrada gratuita</p>
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="flex items-center gap-2 text-[11px] text-white/35">
              <span>Operamos via</span>
              <span className="text-white/55">Binance</span>
              <span className="text-white/15">·</span>
              <span className="text-white/55">Bybit</span>
              <span className="text-white/15">·</span>
              <span className="text-white/55">TradingView</span>
              <span className="text-white/15 hidden sm:inline">·</span>
              <span className="text-white/55 hidden sm:inline">Nasdaq</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
