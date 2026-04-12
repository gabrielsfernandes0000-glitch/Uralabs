"use client";

import { TrendingUp, TrendingDown, Activity, Radio, Crown, ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { Reveal } from "./Reveal";

function TickerItem({ symbol, price, change, isPositive }: { symbol: string; price: string; change: string; isPositive: boolean }) {
  return (
    <div className="flex items-center gap-3 px-6 py-2 border-r border-white/5 bg-dark-900/30 backdrop-blur-sm min-w-[200px]">
      <span className="font-bold text-white">{symbol}</span>
      <span className="text-gray-300 text-sm">{price}</span>
      <span className={`text-xs font-mono flex items-center ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {change}
      </span>
    </div>
  );
}

export function Hero() {
  const tickerData = [
    { symbol: "BTC/USD", price: "64,230.50", change: "+2.4%", isPositive: true },
    { symbol: "ETH/USD", price: "3,450.20", change: "+1.8%", isPositive: true },
    { symbol: "NQ1!", price: "18,450.00", change: "-0.5%", isPositive: false },
    { symbol: "ES1!", price: "5,210.75", change: "-0.2%", isPositive: false },
    { symbol: "SOL/USD", price: "145.20", change: "+5.1%", isPositive: true },
  ];

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("pricing");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] -z-10 opacity-30 animate-pulse-slow" />

      {/* Floating chart decoration */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
        <div className="absolute top-[20%] left-[5%] w-64 bg-white/[0.02] backdrop-blur-[1px] border border-white/[0.02] rounded-2xl p-4 -rotate-6 opacity-20 hover:opacity-40 transition-opacity duration-1000">
          <div className="flex items-center gap-2 mb-4 border-b border-white/[0.02] pb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-20 h-1.5 rounded-full bg-white/[0.05]" />
          </div>
          <div className="flex items-end justify-between gap-2 h-24 px-2">
            <div className="w-full bg-white/5 h-[40%] rounded-sm" />
            <div className="w-full bg-white/10 h-[60%] rounded-sm" />
            <div className="w-full bg-white/5 h-[30%] rounded-sm" />
            <div className="w-full bg-white/15 h-[80%] rounded-sm" />
            <div className="w-full bg-white/5 h-[50%] rounded-sm" />
          </div>
        </div>
      </div>

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
                <span className="font-mono">482 Conectados</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] drop-shadow-lg">
              Aprenda a Técnica.
              <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"> Lucre no </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-600"> Processo.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10 leading-relaxed font-light">
              O único ecossistema que une <strong>Sala de Sinais Ao Vivo</strong> com{" "}
              <strong>Mentoria Profissional (SMC)</strong>. Copie nossa leitura institucional enquanto se forma como trader de elite.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 justify-center">
              <Button
                href="#pricing"
                onClick={scrollTo}
                className="group gap-2 h-14 px-8 text-lg bg-gradient-to-r from-brand-600 via-yellow-600 to-brand-600 border-none w-full sm:w-auto shadow-[0_10px_40px_-10px_rgba(234,179,8,0.4)] hover:shadow-[0_20px_60px_-10px_rgba(234,179,8,0.5)] cursor-pointer"
              >
                Ver Planos &amp; Preços
                <Crown className="w-5 h-5 text-white fill-white" />
              </Button>
              <Button
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="h-14 px-8 text-lg w-full sm:w-auto bg-white/[0.03] backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20 transition-all gap-2"
              >
                Comunidade Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-col items-center gap-4 opacity-50 hover:opacity-90 transition-opacity duration-500">
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em]">Operamos e analisamos via</span>
              <div className="flex items-center gap-8 md:gap-12 grayscale">
                <span className="text-xl md:text-2xl font-bold text-white/30 hover:text-white/50 transition-colors">BINANCE</span>
                <span className="text-xl md:text-2xl font-bold text-white/30 hover:text-white/50 transition-colors">BYBIT</span>
                <span className="text-xl md:text-2xl font-bold text-white/30 hover:text-white/50 transition-colors flex items-center gap-1">
                  <Activity className="w-5 h-5" /> TradingView
                </span>
                <span className="text-xl md:text-2xl font-bold text-white/30 hidden sm:block hover:text-white/50 transition-colors">NASDAQ</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Ticker */}
      <div className="w-full border-t border-white/5 bg-dark-950/50 backdrop-blur-xl relative z-20 mt-auto">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tickerData, ...tickerData, ...tickerData, ...tickerData].map((item, idx) => (
            <TickerItem key={idx} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
