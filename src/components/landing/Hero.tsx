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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] -z-10 opacity-30 animate-pulse-slow" />

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10 pt-10">
          <Reveal>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-dark-950/80 border border-brand-500/20 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(249,115,22,0.15)] animate-fade-in-up hover:border-brand-500/40 transition-colors cursor-default">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_#22c55e]" />
                </div>
                <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1">
                  Sala Operacional <span className="text-green-500">Ativa</span>
                </span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Radio className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-mono">
                  {showStats ? `${online.toLocaleString("pt-BR")} conectados` : "Discord ao vivo"}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] drop-shadow-lg">
              Cansado de Ser
              <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"> Liquidez do </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-600">Mercado?</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10 leading-relaxed font-light">
              Enquanto você segue indicador atrasado, os bancos estão operando contra você. Aqui você aprende a ler o que eles fazem — e lucrar junto. <strong>Cripto e NASDAQ</strong>, do zero.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col items-center gap-4 mb-8">
              <Button
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_discord_free", { location: "hero" })}
                className="group gap-2 h-14 px-10 text-lg bg-gradient-to-r from-brand-600 via-yellow-600 to-brand-600 border-none shadow-[0_10px_40px_-10px_rgba(234,179,8,0.4)] hover:shadow-[0_20px_60px_-10px_rgba(234,179,8,0.5)] cursor-pointer"
              >
                Entrar na Comunidade Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500/70" />
                <span>Planos pagos com garantia incondicional de 7 dias</span>
                <span className="text-gray-600">·</span>
                <a
                  href="#pricing"
                  className="text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Ver preços
                </a>
              </div>
            </div>
          </Reveal>

          {/* Impact stats */}
          <Reveal delay={0.4}>
            <div className="flex items-center gap-6 md:gap-10 mb-12">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-brand-500">+1.775%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Calls em Março/2026</p>
                <p className="text-[9px] text-gray-600 mt-0.5">20 operações · referência</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-green-500">70%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">De acerto</p>
                <p className="text-[9px] text-gray-600 mt-0.5">14 wins, 6 loss</p>
              </div>
              {showStats && (
                <>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-white">{members.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">No Discord</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">entrada gratuita</p>
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="flex flex-col items-center gap-4 opacity-50 hover:opacity-90 transition-opacity duration-500">
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em]">Operamos e analisamos via</span>
              <div className="flex items-center gap-8 md:gap-12 grayscale">
                <span className="text-xl md:text-2xl font-bold text-white/30 hover:text-white/50 transition-colors">BINANCE</span>
                <span className="text-xl md:text-2xl font-bold text-white/30 hover:text-white/50 transition-colors">BYBIT</span>
                <span className="text-xl md:text-2xl font-bold text-white/30 hover:text-white/50 transition-colors">TradingView</span>
                <span className="text-xl md:text-2xl font-bold text-white/30 hidden sm:block hover:text-white/50 transition-colors">NASDAQ</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
