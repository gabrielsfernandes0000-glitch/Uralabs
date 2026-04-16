"use client";

import { CheckCircle2, XCircle, ArrowUpRight, Lock, ArrowRight, Star, Quote } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { Reveal } from "./Reveal";

/* ── Trade data — March 2026 ── */

const TRADES = [
  { date: "03/03", side: "LONG", asset: "SUI", target: "TP2", result: "+95%", win: true },
  { date: "03/03", side: "LONG", asset: "ADA", target: "Stop", result: "-15%", win: false },
  { date: "03/03", side: "LONG", asset: "HYPE", target: "Stop", result: "-10%", win: false },
  { date: "05/03", side: "LONG", asset: "AGLD", target: "TP3", result: "+223%", win: true },
  { date: "06/03", side: "LONG", asset: "HYPE", target: "TP3", result: "+216%", win: true },
  { date: "06/03", side: "LONG", asset: "PEPE", target: "TP4", result: "+204%", win: true },
  { date: "09/03", side: "LONG", asset: "XAU", target: "TP3", result: "+279%", win: true },
  { date: "11/03", side: "LONG", asset: "XAU", target: "Stop", result: "-100%", win: false },
  { date: "12/03", side: "SHORT", asset: "SUI", target: "Stop", result: "-100%", win: false },
  { date: "13/03", side: "LONG", asset: "ASTER", target: "TP3", result: "+267%", win: true },
  { date: "16/03", side: "LONG", asset: "TON", target: "Stop", result: "-100%", win: false },
  { date: "17/03", side: "SHORT", asset: "SOL", target: "TP3", result: "+133%", win: true },
  { date: "19/03", side: "LONG", asset: "PEPE", target: "TP1", result: "+70%", win: true },
  { date: "19/03", side: "LONG", asset: "SUI", target: "TP2", result: "+92%", win: true },
  { date: "23/03", side: "LONG", asset: "HYPE", target: "TP4", result: "+194%", win: true },
  { date: "24/03", side: "LONG", asset: "BTC", target: "TP3", result: "+102%", win: true },
  { date: "26/03", side: "LONG", asset: "SUI", target: "TP2", result: "+78%", win: true },
  { date: "26/03", side: "LONG", asset: "ETH", target: "Stop", result: "-45%", win: false },
  { date: "30/03", side: "LONG", asset: "SOL", target: "TP1", result: "+130%", win: true },
  { date: "31/03", side: "LONG", asset: "SUI", target: "TP1", result: "+62%", win: true },
];

/* ── Testimonials data ── */

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
  avatarBg: string;
  highlight?: string;
}

const ROW_1: Testimonial[] = [
  { name: "Lucas M.", role: "Elite há 4 meses", text: "Já tentei 3 mentorias diferentes. URA Labs foi a única que me ensinou a LER o gráfico de verdade.", avatar: "L", avatarBg: "bg-blue-600", highlight: "+85% em 45 dias" },
  { name: "Ana R.", role: "VIP há 6 meses", text: "Ver o URA operando em tempo real me deu a confiança que eu precisava pra parar de ter medo de entrar.", avatar: "A", avatarBg: "bg-purple-600" },
  { name: "Pedro K.", role: "Elite Turma 3.0", text: "O CRT é absurdo. Nunca vi ninguém ensinar isso no Brasil. Aprovei na FTMO na segunda tentativa.", avatar: "P", avatarBg: "bg-green-600", highlight: "Aprovado FTMO" },
  { name: "Marcos D.", role: "VIP há 3 meses", text: "Eles mostram os loss também, não só os gains. Isso me passou uma confiança absurda.", avatar: "M", avatarBg: "bg-red-600" },
  { name: "Julia S.", role: "Elite há 5 meses", text: "Entrei sem saber nada. Hoje entendo Order Blocks, FVG e opero NASDAQ. Melhor investimento que já fiz.", avatar: "J", avatarBg: "bg-pink-600", highlight: "Do zero ao NASDAQ" },
  { name: "Rafael T.", role: "VIP há 8 meses", text: "Os calls do URA me mantiveram vivo enquanto eu aprendia. Hoje tô no verde 3 meses seguidos.", avatar: "R", avatarBg: "bg-teal-600" },
];

const ROW_2: Testimonial[] = [
  { name: "Carla N.", role: "Elite Turma 3.0", text: "O URA simplifica o que parece impossível. Já consigo identificar setups sozinha.", avatar: "C", avatarBg: "bg-indigo-600" },
  { name: "Diego F.", role: "VIP há 4 meses", text: "Ambiente sem ego, todo mundo se ajuda. Diferente de qualquer grupo de trade que já participei.", avatar: "D", avatarBg: "bg-amber-600" },
  { name: "Thiago B.", role: "Elite há 6 meses", text: "O retorno nos primeiros 2 meses já pagou a mentoria 3x. E o conhecimento fica pra vida.", avatar: "T", avatarBg: "bg-cyan-600", highlight: "ROI 3x em 2 meses" },
  { name: "Fernanda L.", role: "VIP há 2 meses", text: "Em 2 semanas já estava no verde. Agora tô estudando SMC pra não depender de ninguém.", avatar: "F", avatarBg: "bg-rose-600" },
  { name: "Gabriel O.", role: "Elite Turma 2.0", text: "Tô na URA Labs desde a turma 2.0. A evolução do conteúdo e da comunidade é impressionante.", avatar: "G", avatarBg: "bg-emerald-600", highlight: "Membro desde Turma 2.0" },
  { name: "Isabela M.", role: "VIP há 5 meses", text: "Mulher no trade é raro, mas aqui me senti acolhida desde o dia 1. Zero machismo, zero ego.", avatar: "I", avatarBg: "bg-violet-600" },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="w-[320px] shrink-0 mx-2">
      <div className="bg-dark-900 border border-white/5 rounded-xl p-5 h-full hover:border-brand-500/20 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-full ${t.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{t.avatar}</div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{t.name}</p>
            <p className="text-gray-500 text-[10px] truncate">{t.role}</p>
          </div>
          {t.highlight && (
            <span className="ml-auto text-[9px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded shrink-0">{t.highlight}</span>
          )}
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{t.text}</p>
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, reverse = false }: { testimonials: Testimonial[]; reverse?: boolean }) {
  const doubled = [...testimonials, ...testimonials];
  return (
    <div className="relative overflow-hidden py-1 group/marquee">
      <div className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} group-hover/marquee:[animation-play-state:paused]`}>
        {doubled.map((t, i) => <TestimonialCard key={i} t={t} />)}
      </div>
    </div>
  );
}

/* ── Main Component ── */

export function Results() {
  const wins = TRADES.filter((t) => t.win).length;
  const losses = TRADES.length - wins;

  return (
    <section id="results" className="py-24 bg-dark-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-400 tracking-wide uppercase">Relatório de Performance</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Transparência Total</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Não precisa entender a tabela ainda. O que importa: em março, nossos membros tiveram acesso a 20 operações com 70% de acerto. Mostramos tudo — inclusive os que deram errado.
            </p>
          </Reveal>
        </div>

        {/* Stats */}
        <Reveal width="100%">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5 text-center hover:border-white/10 transition-colors">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider block mb-2">Operações</span>
              <AnimatedCounter value={20} className="text-4xl font-bold text-white" />
            </div>
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5 text-center hover:border-white/10 transition-colors">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider block mb-2">Assertividade</span>
              <AnimatedCounter value={70} suffix="%" className="text-4xl font-bold text-green-500" />
              <div className="flex justify-center gap-3 mt-1.5 text-xs">
                <span className="text-green-400">{wins}W</span>
                <span className="text-red-400">{losses}L</span>
              </div>
            </div>
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5 text-center hover:border-white/10 transition-colors">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider block mb-2">Gains Brutos</span>
              <AnimatedCounter value={2145} prefix="+" suffix="%" className="text-4xl font-bold text-green-500" />
            </div>
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5 text-center relative overflow-hidden hover:border-brand-500/20 transition-colors group">
              <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider block mb-2 relative z-10">Resultado Líquido</span>
              <span className="relative z-10 flex items-center justify-center gap-1">
                <AnimatedCounter value={1775} prefix="+" suffix="%" className="text-4xl font-bold text-brand-500" />
                <ArrowUpRight className="w-5 h-5 text-brand-500/50" />
              </span>
            </div>
          </div>
        </Reveal>

        {/* Trade table */}
        <Reveal delay={0.1} width="100%">
          <div className="bg-dark-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
            <div className="hidden md:grid grid-cols-[80px_70px_1fr_80px_100px] gap-4 p-4 bg-white/[0.03] border-b border-white/5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div>Data</div><div>Lado</div><div>Ativo</div><div className="text-center">Alvo</div><div className="text-right">Retorno</div>
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[420px] overflow-y-auto no-scrollbar">
              {TRADES.map((t, i) => (
                <div key={i} className="grid grid-cols-[80px_70px_1fr_80px_100px] gap-4 items-center p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="text-xs text-gray-600 font-mono">{t.date}</div>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      t.side === "LONG" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                    }`}>{t.side}</span>
                  </div>
                  <div className="text-white font-bold text-sm">{t.asset}</div>
                  <div className="text-center">
                    <span className={`text-xs font-mono ${t.target === "Stop" ? "text-red-500" : "text-gray-400"}`}>{t.target}</span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <span className={`font-mono font-bold text-sm ${t.win ? "text-green-400" : "text-red-400"}`}>{t.result}</span>
                    {t.win ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500/50" /> : <XCircle className="w-3.5 h-3.5 text-red-500/50" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white/[0.03] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />+2.145% gains</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />-370% losses</span>
              </div>
              <div className="text-brand-500 font-bold text-lg font-mono">= +1.775% líquido</div>
            </div>
          </div>
        </Reveal>

        <div className="flex items-center justify-center gap-4 mt-6 mb-16">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Lock className="w-4 h-4" /><span>Histórico completo no Discord</span></div>
          <a href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors">
            Entrar <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── Testimonials marquee — full width ── */}
      <div className="mt-8">
        <div className="text-center mb-8">
          <Reveal width="100%">
            <h3 className="text-2xl md:text-3xl font-bold">A Voz da Comunidade</h3>
          </Reveal>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-950 to-transparent z-10 pointer-events-none" />
            <MarqueeRow testimonials={ROW_1} />
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-950 to-transparent z-10 pointer-events-none" />
            <MarqueeRow testimonials={ROW_2} reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
