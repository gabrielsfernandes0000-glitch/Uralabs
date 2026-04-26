"use client";

import { CheckCircle2, XCircle, ArrowUpRight, Lock, ArrowRight } from "lucide-react";
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
  text: string;
  avatar: string;
  avatarUrl: string | null;
  avatarBg: string;
}

// Testimonials REAIS coletados via Discord API do canal #feedbacks
// (channel ID 1376390755752349716). Avatares também reais via CDN Discord.
// Pra atualizar: rodar fetch do canal de novo, transcrever, limpar mentions.
const ROW_1: Testimonial[] = [
  {
    name: "Cadu",
    text: "Em 3 dias peguei minha primeira conta em mesa proprietária. Hoje passei pra conta funded.",
    avatar: "C",
    avatarUrl: "https://cdn.discordapp.com/avatars/317172462221787146/b32ceb3862a21d4786a7f480d9906446.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Dolan",
    text: "Se estivesse sozinho, levaria 3 anos pra aprender o que aprendi em 6 meses.",
    avatar: "D",
    avatarUrl: "https://cdn.discordapp.com/avatars/366663531107713046/f789bc45637a2c150599bd1713872c7d.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "R.S.",
    text: "Entrei sem saber nada. 1 mês depois, conta financiada. Em 2 meses pago a Elite só com os trades.",
    avatar: "R",
    avatarUrl: "https://cdn.discordapp.com/avatars/852325743199256637/a797305608beeb3f91f758e511fa7979.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Vitu",
    text: "Não sabia nem o que era bid e ask direito. Hoje mando calls e ganhei sorteio de mesa de 25k.",
    avatar: "V",
    avatarUrl: "https://cdn.discordapp.com/avatars/847989746381750293/c1fb0c44dc9219e9c0383deacd215977.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Xing xing",
    text: "Em uma única operação, comprei um kit de rodas novo. Logo mais quero estar na Elite.",
    avatar: "X",
    avatarUrl: "https://cdn.discordapp.com/avatars/272926390154690571/a1f7f9b910b62f9e5a9f9187347090c3.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "VNS",
    text: "Entrei sem saber de futuros, com medo. Hoje tô na Elite sem medo nenhum.",
    avatar: "V",
    avatarUrl: "https://cdn.discordapp.com/avatars/506562979609968640/809cfe783e9b3c0a0c2610ff458d4dae.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Tchelao",
    text: "URA é honesto e com conhecimento absurdo. Quem não tá profitando é maluco.",
    avatar: "T",
    avatarUrl: "https://cdn.discordapp.com/avatars/240974837281980419/2dccb6e5a5fbd6126e731b489320dcc8.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
];

const ROW_2: Testimonial[] = [
  {
    name: "Gorilaone",
    text: "Tô escrevendo isso depois de fazer dinheiro operando na beira da praia pela primeira vez.",
    avatar: "G",
    avatarUrl: "https://cdn.discordapp.com/avatars/1469701084783055078/f7f2e9361e8a54ce6e72580ac7b967af.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "LM",
    text: "Ganhei uma nova visão sobre maneiras de lucrar com cripto. Networking maneiro.",
    avatar: "L",
    avatarUrl: "https://cdn.discordapp.com/avatars/1098027827472896111/dddb6d16ea383586deb59df870ff9549.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Casali",
    text: "Em menos de um mês já aprendi muita coisa. O pessoal aqui é parceria.",
    avatar: "C",
    avatarUrl: "https://cdn.discordapp.com/avatars/394903563735662593/49900209621b4d3bec7dcf7b0b9fe32c.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Thiagym",
    text: "Ainda iniciante, mas convicto do caminho. Evolução constante desde o dia 1.",
    avatar: "T",
    avatarUrl: "https://cdn.discordapp.com/avatars/1455623933956194378/a94521e1c3775603d2c713267b12f3b2.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "giolos",
    text: "Não participo muito no servidor, mas as calls me ajudaram muito. Logo tô na Elite.",
    avatar: "G",
    avatarUrl: "https://cdn.discordapp.com/avatars/559544926443012097/710dbc6dcf6c0de4e2b22aa0727b3d23.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "ez1o",
    text: "Deu pra ver que o trampo é sério. Chama forra.",
    avatar: "E",
    avatarUrl: "https://cdn.discordapp.com/avatars/689484663059775607/916618aca6ef91c6305a5fc4fbb2e0f4.png?size=128",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "vieira",
    text: "Tô bem positivo nas calls. Bora pra cima.",
    avatar: "V",
    avatarUrl: null,
    avatarBg: "bg-white/[0.08]",
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="w-[320px] shrink-0 mx-2">
      <div className="bg-dark-900 border border-white/[0.05] rounded-md p-5 h-full hover:border-white/[0.12] transition-colors">
        <div className="flex items-center gap-3 mb-3">
          {t.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.avatarUrl}
              alt={t.name}
              loading="lazy"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className={`w-9 h-9 rounded-full ${t.avatarBg} flex items-center justify-center text-white font-medium text-[12px] shrink-0`}>{t.avatar}</div>
          )}
          <p className="text-white font-medium text-[13px] truncate min-w-0">{t.name}</p>
        </div>
        <p className="text-white/60 text-[13px] leading-relaxed">{t.text}</p>
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
    <section id="results" className="py-24 bg-dark-950 border-y border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Reveal width="100%">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">Transparência total</h2>
            <p className="text-[14px] text-white/55 max-w-xl mx-auto">
              Em março, 20 operações compartilhadas com a comunidade — 70% de acerto. Mostramos tudo, inclusive as que deram errado.
            </p>
          </Reveal>
        </div>

        {/* Stats */}
        <Reveal width="100%">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <div className="surface-panel rounded-md p-5 text-center">
              <span className="text-[11px] text-white/45 block mb-2">Operações</span>
              <AnimatedCounter value={20} className="text-[28px] font-semibold text-white tabular-nums leading-none" />
            </div>
            <div className="surface-panel rounded-md p-5 text-center">
              <span className="text-[11px] text-white/45 block mb-2">Assertividade</span>
              <AnimatedCounter value={70} suffix="%" className="text-[28px] font-semibold text-white tabular-nums leading-none" />
              <div className="flex justify-center gap-3 mt-1.5 text-[11px] tabular-nums">
                <span className="text-[var(--color-semantic-up)]">{wins}W</span>
                <span className="text-[var(--color-semantic-down)]">{losses}L</span>
              </div>
            </div>
            <div className="surface-panel rounded-md p-5 text-center">
              <span className="text-[11px] text-white/45 block mb-2">Gains brutos</span>
              <AnimatedCounter value={2145} prefix="+" suffix="%" className="text-[28px] font-semibold text-[var(--color-semantic-up)] tabular-nums leading-none" />
            </div>
            <div className="surface-panel rounded-md p-5 text-center">
              <span className="text-[11px] text-white/45 block mb-2">Resultado líquido</span>
              <span className="flex items-center justify-center gap-1">
                <AnimatedCounter value={1775} prefix="+" suffix="%" className="text-[28px] font-semibold text-brand-500 tabular-nums leading-none" />
                <ArrowUpRight className="w-4 h-4 text-brand-500/55" strokeWidth={2} />
              </span>
            </div>
          </div>
        </Reveal>

        {/* Trade table */}
        <Reveal delay={0.1} width="100%">
          <div className="surface-panel rounded-md overflow-hidden">
            <div className="hidden md:grid grid-cols-[80px_70px_1fr_80px_100px] gap-4 p-4 border-b border-white/[0.05] text-[11px] font-medium text-white/45">
              <div>Data</div><div>Lado</div><div>Ativo</div><div className="text-center">Alvo</div><div className="text-right">Retorno</div>
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[420px] overflow-y-auto no-scrollbar">
              {TRADES.map((t, i) => (
                <div key={i} className="grid grid-cols-[52px_48px_1fr_44px_70px] md:grid-cols-[80px_70px_1fr_80px_100px] gap-2 md:gap-4 items-center p-3 md:p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="text-[12px] text-white/40 font-mono tabular-nums">{t.date}</div>
                  <div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      t.side === "LONG"
                        ? "bg-[color:var(--color-semantic-up)]/[0.08] text-[var(--color-semantic-up)]"
                        : "bg-[color:var(--color-semantic-down)]/[0.08] text-[var(--color-semantic-down)]"
                    }`}>{t.side}</span>
                  </div>
                  <div className="text-white text-[13px] font-medium">{t.asset}</div>
                  <div className="text-center">
                    <span className={`text-[12px] font-mono ${t.target === "Stop" ? "text-[var(--color-semantic-down)]" : "text-white/55"}`}>{t.target}</span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <span className={`font-mono text-[13px] font-medium tabular-nums ${t.win ? "text-[var(--color-semantic-up)]" : "text-[var(--color-semantic-down)]"}`}>{t.result}</span>
                    {t.win
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-semantic-up)]/55" strokeWidth={2} />
                      : <XCircle className="w-3.5 h-3.5 text-[var(--color-semantic-down)]/55" strokeWidth={2} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-[12px] text-white/50 tabular-nums">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-semantic-up)]" />+2.145% gains</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-semantic-down)]" />−370% losses</span>
              </div>
              <div className="text-brand-500 font-medium text-[15px] font-mono tabular-nums">= +1.775% líquido</div>
            </div>
          </div>
        </Reveal>

        <div className="flex items-center justify-center gap-3 mt-6 mb-16">
          <div className="flex items-center gap-2 text-[12px] text-white/45"><Lock className="w-3.5 h-3.5" strokeWidth={2} /><span>Histórico completo no Discord</span></div>
          <a href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/70 hover:text-white text-[12px] font-medium transition-colors">
            Entrar <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* ── Histórias destacadas: do zero à conta funded ── */}
      {/* ── Testimonials marquee — full width ── */}
      <div className="mt-16">
        <div className="text-center mb-10">
          <Reveal width="100%">
            <h3 className="text-[22px] md:text-[28px] font-semibold tracking-tight text-white">A voz da comunidade</h3>
            <p className="text-white/55 text-[13px] mt-2 max-w-xl mx-auto">
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
