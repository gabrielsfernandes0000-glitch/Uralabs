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

// Testimonials REAIS da comunidade — coletados do canal #feedbacks no Discord
// em abril de 2026. Não invente quotes nem nomes — se precisar mais, puxe
// do canal novamente.
const ROW_1: Testimonial[] = [
  {
    name: "Cadu",
    role: "Elite há 8 dias",
    text: "3 dias depois de entrar peguei minha primeira conta em mesa proprietária. Hoje passei pra conta funded.",
    avatar: "C",
    avatarBg: "bg-white/[0.08]",
    highlight: "Funded em 8 dias",
  },
  {
    name: "Dolan",
    role: "Elite há 6 meses",
    text: "Se estivesse sozinho, levaria uns 3 anos pra aprender o que aprendi em 6 meses. O valor que paguei pra Elite, eu pagaria 3x.",
    avatar: "D",
    avatarBg: "bg-white/[0.08]",
    highlight: "Pagaria 3x",
  },
  {
    name: "R.S.",
    role: "Elite há 1 mês",
    text: "Entrei sem saber praticamente nada sobre trade. Já estou com uma conta financiada. Em menos de 2 meses terei o retorno do Elite só com os trades.",
    avatar: "R",
    avatarBg: "bg-white/[0.08]",
    highlight: "ROI em 2 meses",
  },
  {
    name: "Vitu",
    role: "Elite 1.0",
    text: "Não sabia nem o que era bid e ask direito. Hoje mando calls. Ganhei sorteio de mesa de 25k, profits de cripto absurdos, e o conhecimento da galera da Elite.",
    avatar: "V",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Xing xing",
    role: "VIP há menos de 1 mês",
    text: "Vim pro VIP com menos de um mês. Em tão pouco tempo, resultados que me surpreenderam — comprado um kit rodas novo graças a uma única operação.",
    avatar: "X",
    avatarBg: "bg-white/[0.08]",
    highlight: "Rodas novas em 1 trade",
  },
  {
    name: "VNS",
    role: "Elite",
    text: "Entrei sem saber de futuros, via post de milhões sendo liquidado. URA deu atenção pras dúvidas. Peguei 1 mês no VIP pra aprender na prática e entrei na Elite sem medo.",
    avatar: "V",
    avatarBg: "bg-white/[0.08]",
  },
];

const ROW_2: Testimonial[] = [
  {
    name: "LM",
    role: "Elite",
    text: "As calls têm me ajudado muito e me motivado a continuar me aprofundando. Ganhei uma nova visão sobre diferentes maneiras de lucrar com cripto. Networking muito maneiro.",
    avatar: "L",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Casali",
    role: "Há menos de 1 mês",
    text: "A comunidade vem crescendo e sempre trazendo uma quantidade incrível de informações. Em menos de um mês já aprendi muita coisa. O pessoal daqui é tri parceria.",
    avatar: "C",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Thiagym",
    role: "Elite desde fev/2026",
    text: "Desde que entrei, minha evolução tem sido constante. Ainda me considero iniciante, mas convicto de que estou no caminho das melhores operações.",
    avatar: "T",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "giolos",
    role: "Prestes a entrar na Elite",
    text: "Não participo muito no servidor, mas as calls me ajudaram muito. Logo menos estarei na Elite aí com vocês.",
    avatar: "G",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "ez1o",
    role: "Comunidade recente",
    text: "Entrei na comunidade faz pouco tempo, mas deu pra ver que o trampo é sério. Chama forra.",
    avatar: "E",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "vieira",
    role: "VIP",
    text: "Tô bem positivo nas calls. Bora pra cima.",
    avatar: "V",
    avatarBg: "bg-white/[0.08]",
  },
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

      {/* ── Histórias destacadas: do zero à conta funded ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <Reveal width="100%">
          <div className="bg-gradient-to-br from-brand-500/[0.06] via-dark-900 to-dark-900 border border-brand-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Star className="w-3 h-3 fill-brand-400" />
                Do zero à conta funded
              </span>
              <h3 className="text-xl md:text-2xl font-bold mt-3 text-white">
                Membros reais passando em mesas proprietárias
              </h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto">
                Depois de entrar no Elite, esses membros conseguiram contas financiadas em poucas semanas.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-dark-950/60 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">C</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold truncate">Cadu</p>
                    <p className="text-gray-500 text-[10px]">Elite há 8 dias</p>
                  </div>
                  <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded shrink-0">Funded</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  &quot;3 dias depois de entrar peguei minha primeira conta em mesa proprietária. Hoje passei pra conta funded.&quot;
                </p>
              </div>
              <div className="bg-dark-950/60 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">R</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold truncate">R.S.</p>
                    <p className="text-gray-500 text-[10px]">Elite há 1 mês</p>
                  </div>
                  <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded shrink-0">Funded</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  &quot;Entrei sem saber praticamente nada. Já estou com uma conta financiada. Em menos de 2 meses terei o retorno do Elite.&quot;
                </p>
              </div>
              <div className="bg-dark-950/60 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs">V</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold truncate">Vitu</p>
                    <p className="text-gray-500 text-[10px]">Elite 1.0</p>
                  </div>
                  <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded shrink-0">Mesa 25k</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  &quot;Não sabia nem o que era bid e ask. Ganhei sorteio de mesa de 25k, profits de cripto absurdos, e hoje mando calls.&quot;
                </p>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-5">
              Histórias reais coletadas do canal #feedbacks · resultados individuais variam conforme dedicação e disciplina
            </p>
          </div>
        </Reveal>
      </div>

      {/* ── Testimonials marquee — full width ── */}
      <div className="mt-8">
        <div className="text-center mb-8">
          <Reveal width="100%">
            <h3 className="text-2xl md:text-3xl font-bold">A Voz da Comunidade</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
              Feedbacks reais coletados direto do Discord. Membros reais, nomes reais.
            </p>
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
