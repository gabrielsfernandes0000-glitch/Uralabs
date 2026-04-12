"use client";

import { Check, ShieldCheck, Crown, Zap, ArrowRight, Trophy, MonitorPlay, GraduationCap, Users, Gift, QrCode, Bitcoin } from "lucide-react";
import { Button } from "./Button";
import { Reveal } from "./Reveal";

export function Pricing() {
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("pricing");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-0 -translate-x-1/3 hidden 2xl:block pointer-events-none select-none">
        <span className="text-[150px] font-black text-transparent opacity-10 rotate-90 block" style={{ WebkitTextStroke: "2px #FF5500" }}>ELITE</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-brand-500 font-bold tracking-widest uppercase text-sm">Próxima Turma &amp; Assinaturas</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Escolha seu Nível de Jogo</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">De sinais assertivos à formação completa de um trader profissional.</p>
          </Reveal>
        </div>

        {/* Elite card */}
        <Reveal width="100%">
          <div className="relative w-full max-w-5xl mx-auto mb-20">
            <div className="absolute -inset-[2px] bg-gradient-to-r from-brand-600 via-yellow-500 to-brand-600 rounded-3xl opacity-75 blur-sm animate-pulse-slow" />
            <div className="relative bg-dark-950 rounded-[22px] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">
              <div className="p-8 md:p-12 md:w-2/3 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-brand-500 to-yellow-600 rounded-lg shadow-lg"><Crown className="w-6 h-6 text-white" /></div>
                  <span className="text-yellow-500 font-bold tracking-widest uppercase text-sm">Turma 4.0 Abrindo</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Mentoria ELITE 4.0</h3>
                <p className="text-gray-400 text-lg mb-8">A formação definitiva. Não operamos sorte, operamos institucional.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                  {[
                    { icon: <MonitorPlay className="w-5 h-5 text-brand-500 mt-1 shrink-0" />, title: "3 Meses de Sala Ao Vivo", sub: "Diariamente com o Mentor" },
                    { icon: <Zap className="w-5 h-5 text-brand-500 mt-1 shrink-0" />, title: "6 Meses de Sinais VIP", sub: "Acesso total ao Discord VIP" },
                    { icon: <GraduationCap className="w-5 h-5 text-brand-500 mt-1 shrink-0" />, title: "Imersão Teórica (30 Dias)", sub: "Do Zero ao Avançado" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      {item.icon}
                      <div><span className="text-white font-bold block">{item.title}</span><span className="text-gray-400 text-xs">{item.sub}</span></div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 p-2"><Check className="w-5 h-5 text-gray-500 mt-1 shrink-0" /><span className="text-gray-300 text-sm mt-1">Aulas Avançadas: <strong className="text-white">PO3, AMD, Liquidez</strong></span></div>
                  <div className="flex items-start gap-3 p-2"><Users className="w-5 h-5 text-gray-500 mt-1 shrink-0" /><span className="text-gray-300 text-sm mt-1">Suporte Diário e Networking</span></div>
                  <div className="flex items-start gap-3 p-2"><Gift className="w-5 h-5 text-yellow-500 mt-1 shrink-0" /><span className="text-yellow-500 text-sm font-bold mt-1">Sorteio de Mesas e Gift Cards</span></div>
                </div>
                <div className="mt-auto pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center text-sm text-gray-500">
                  <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-brand-500" /><span>+800k BRL financiados ao vivo</span></div>
                  <div className="hidden md:block w-1 h-1 bg-gray-700 rounded-full" />
                  <div>Conteúdo validado na prática</div>
                </div>
              </div>

              {/* Price side */}
              <div className="bg-dark-900/50 p-8 md:p-12 md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 relative">
                <div className="absolute inset-0 bg-brand-500/5 mix-blend-overlay pointer-events-none" />
                <div className="text-center relative z-10">
                  <div className="flex flex-col items-center justify-center mb-2">
                    <span className="text-gray-500 text-base line-through font-medium">De R$ 3.500,00</span>
                    <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mt-1">Economize R$ 1.000</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <span className="text-sm text-gray-400 mt-1">R$</span>
                    <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">2.500</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"><QrCode className="w-4 h-4 text-brand-500" /><span className="text-xs font-bold text-gray-300">PIX</span></div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"><Bitcoin className="w-4 h-4 text-brand-500" /><span className="text-xs font-bold text-gray-300">CRYPTO</span></div>
                  </div>
                  <div className="text-xs text-gray-500 mb-6 pb-6 border-b border-white/5">Ou parcelado em até 12x de R$ 249,90<br />(Valor total a prazo: R$ 2.998,80)</div>
                  <Button fullWidth href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="h-14 bg-gradient-to-r from-brand-600 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] border-none text-lg group">
                    Quero ser ELITE <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-[10px] text-gray-500 mt-3">Abra um ticket no Discord para solicitar o link.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* VIP plans */}
        <div className="max-w-6xl mx-auto mt-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px bg-white/10 flex-1" />
            <h3 className="text-2xl font-bold text-gray-300 uppercase tracking-widest text-center">Ou acesse apenas os <span className="text-white">Sinais VIP</span></h3>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Mensal", price: "R$ 120", period: "/mês", badge: "bg-white/5 text-white", savings: null, highlight: false },
              { label: "Semestral", price: "R$ 480", period: "/6 meses", badge: "bg-brand-500/10 text-brand-500", savings: "Economize R$ 240", highlight: false },
              { label: "Anual", price: "R$ 840", period: "/ano", badge: "bg-brand-500 text-white", savings: "Economize R$ 600", highlight: true },
            ].map((plan, i) => (
              <Reveal key={i} delay={(i + 1) * 0.1} width="100%">
                <div className={`${plan.highlight ? "bg-gradient-to-b from-dark-800 to-dark-950 border-brand-500/30 hover:border-brand-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "bg-dark-950 border-white/5 hover:border-white/20"} rounded-2xl p-6 border transition-all group h-full flex flex-col relative overflow-hidden`}>
                  {plan.highlight && <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-lg">MELHOR VALOR</div>}
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`${plan.badge} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>{plan.label}</span>
                    {plan.savings && <span className="text-[10px] text-green-400 font-bold border border-green-500/30 px-2 py-0.5 rounded uppercase">{plan.savings}</span>}
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm"> {plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {["Calls Semanais Crypto", "Análises Exclusivas", "Operações AO VIVO (Viewer)"].map((feat, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Zap className={`w-5 h-5 ${plan.highlight ? "text-brand-500" : "text-gray-400 group-hover:text-brand-500"} transition-colors`} />
                        <span className="text-gray-300 text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.highlight ? "primary" : "outline"} fullWidth href="https://discord.gg/SrxZSGN6" target="_blank" className={plan.highlight ? "bg-brand-600 hover:bg-brand-500" : "border-gray-700 hover:bg-white hover:text-black hover:border-white"}>
                    Assinar {plan.label}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <Reveal delay={0.4} width="100%">
          <div className="mt-20 max-w-3xl mx-auto text-center bg-dark-900/80 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
            <div className="inline-flex p-3 bg-brand-500/10 rounded-full mb-4 border border-brand-500/20"><ShieldCheck className="w-8 h-8 text-brand-500" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Garantia Incondicional de 7 Dias</h3>
            <p className="text-gray-400">O risco é todo nosso. Entre, consuma o conteúdo, assista às lives. Se achar que não valeu o investimento, devolvemos 100% do valor.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
