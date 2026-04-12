import { CandlestickChart, BrainCircuit, LineChart, Bell, CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";

export function Methodology() {
  return (
    <section id="methodology" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute top-20 -left-20 w-64 h-64 border border-white/5 rounded-full opacity-20 hidden lg:block animate-pulse-slow" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 border border-brand-500/10 rounded-full opacity-20 hidden lg:block" />
      <div className="absolute top-1/2 right-0 w-px h-32 bg-gradient-to-b from-transparent via-brand-500/50 to-transparent hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Ciência do URA LABS</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Não utilizamos indicadores atrasados. Unimos conceitos avançados para te colocar na frente da manada.</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative">
            <div className="absolute left-9 top-10 bottom-10 w-px bg-gradient-to-b from-brand-500/0 via-brand-500/20 to-brand-500/0 hidden md:block" />
            {[
              { icon: <BrainCircuit className="w-6 h-6" />, color: "orange", title: "SMC & ICT Mastery", desc: <>Utilizamos a base do <strong>Inner Circle Trader (ICT)</strong> aliada ao <strong>Smart Money Concepts</strong>. Você vai aprender a ler order blocks, FVG (Fair Value Gaps) e liquidez institucional.</> },
              { icon: <CandlestickChart className="w-6 h-6" />, color: "red", title: "Candle Range Theory (CRT)", desc: "Uma das metodologias mais raras e assertivas. O CRT permite identificar a verdadeira intenção dentro da formação de um único candle, validando entradas sniper." },
              { icon: <LineChart className="w-6 h-6" />, color: "brand", title: "Foco: Crypto & NASDAQ", desc: "Não somos generalistas. Somos especialistas nos mercados mais voláteis e lucrativos do mundo. Aplicamos nossos setups onde a liquidez é abundante." },
            ].map((item, i) => (
              <Reveal key={i} delay={(i + 1) * 0.1}>
                <div className="group p-6 rounded-2xl bg-dark-950 border border-white/5 hover:border-brand-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${item.color}-500/10 text-${item.color}-400 mt-1 group-hover:bg-${item.color}-500/20 transition-colors`}>{item.icon}</div>
                    <div>
                      <h3 className={`text-xl font-bold text-white mb-2 group-hover:text-${item.color}-400 transition-colors`}>{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trade card visual */}
          <div className="relative h-full min-h-[400px] flex items-center justify-center">
            <Reveal delay={0.4} width="100%">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-purple-500/10 rounded-3xl blur-3xl opacity-20" />
              <div className="relative w-full max-w-sm bg-dark-950 rounded-xl border border-white/10 shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.02] duration-500 mx-auto">
                <div className="bg-dark-900 p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-500/20 rounded-lg"><Bell className="w-5 h-5 text-brand-500 animate-pulse" /></div>
                    <div>
                      <p className="text-xs text-gray-400 font-mono">VIP SIGNAL #842</p>
                      <p className="text-white font-bold text-sm">BTC/USDT <span className="text-green-500 ml-1">LONG</span></p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Agora</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex h-48 w-full gap-2">
                    <div className="flex-1 flex flex-col justify-end relative bg-gray-900/50 rounded-lg overflow-hidden border border-white/5">
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_19px,rgba(255,255,255,0.05)_20px)] bg-[size:100%_20px]" />
                      <div className="absolute bottom-10 left-4 w-4 h-12 bg-red-500/80 rounded-sm" />
                      <div className="absolute bottom-20 left-10 w-4 h-20 bg-green-500/80 rounded-sm shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                      <div className="absolute bottom-36 left-16 w-4 h-8 bg-green-500/80 rounded-sm" />
                      <div className="absolute bottom-22 w-full border-t border-dashed border-white/40 left-0">
                        <span className="absolute -top-3 right-1 text-[10px] text-gray-400 font-mono">ENTRY</span>
                      </div>
                    </div>
                    <div className="w-16 flex flex-col gap-1">
                      <div className="flex-1 bg-green-500/20 border border-green-500/40 rounded-lg relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-green-500/10 animate-pulse-slow" />
                        <div className="text-center z-10">
                          <span className="text-[10px] text-green-400 font-bold block">TARGET</span>
                          <span className="text-xs text-white font-mono">+12.5%</span>
                        </div>
                      </div>
                      <div className="h-12 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] text-red-400 font-bold">STOP</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t border-white/5 pt-4">
                    <div><p className="text-gray-500 mb-1">Entry Zone</p><p className="text-white font-bold bg-dark-900 p-1.5 rounded border border-white/5">64,250 - 64,300</p></div>
                    <div><p className="text-gray-500 mb-1">Risk / Reward</p><p className="text-brand-400 font-bold bg-brand-500/10 p-1.5 rounded border border-brand-500/20">1 : 5.5</p></div>
                  </div>
                </div>
                <div className="bg-green-500/10 p-3 border-t border-green-500/20 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Setup Validado • Lucro Realizado</span>
                </div>
              </div>
              <div className="absolute -right-12 top-20 bg-dark-900 border border-white/10 p-3 rounded-lg shadow-xl hidden xl:block">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-500" /><span className="text-xs text-gray-300 font-medium">Order Block M15</span></div>
              </div>
              <div className="absolute -left-10 bottom-32 bg-dark-900 border border-white/10 p-3 rounded-lg shadow-xl hidden xl:block">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-gray-300 font-medium">Liquidez Capturada</span></div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
