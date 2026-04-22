import { Star, Quote, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  avatarBg: string;
  highlight?: string;
}

const TESTIMONIALS_ROW_1: Testimonial[] = [
  {
    name: "Lucas M.",
    role: "Membro Elite ha 4 meses",
    text: "Ja tentei 3 mentorias diferentes. URA Labs foi a unica que me ensinou a LER o grafico de verdade. Parei de ficar dependendo de sinal e hoje opero sozinho com consistencia.",
    rating: 5,
    avatar: "L",
    avatarBg: "bg-white/[0.08]",
    highlight: "+85% na banca em 45 dias",
  },
  {
    name: "Ana R.",
    role: "VIP ha 6 meses",
    text: "A sala ao vivo mudou meu jogo. Ver o URA operando em tempo real e explicando cada decisao me deu a confianca que eu precisava pra parar de ter medo de entrar.",
    rating: 5,
    avatar: "A",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Pedro K.",
    role: "Membro Elite Turma 3.0",
    text: "O CRT e absurdo. Nunca vi ninguem ensinar isso no Brasil. Depois que entendi a logica por tras do candle, minha leitura de mercado ficou outra. Aprovei na FTMO na segunda tentativa.",
    rating: 5,
    avatar: "P",
    avatarBg: "bg-white/[0.08]",
    highlight: "Aprovado FTMO",
  },
  {
    name: "Marcos D.",
    role: "VIP ha 3 meses",
    text: "O que mais me surpreendeu foi a transparencia. Eles mostram os loss tambem, nao so os gains. Isso me passou uma confianca absurda. Comunidade seria de verdade.",
    rating: 5,
    avatar: "M",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Julia S.",
    role: "Membro Elite ha 5 meses",
    text: "Entrei sem saber nada de trade. Hoje entendo Order Blocks, FVG e opero NASDAQ com gestao de risco. A evolucao em 5 meses foi surreal. Melhor investimento que ja fiz.",
    rating: 5,
    avatar: "J",
    avatarBg: "bg-white/[0.08]",
    highlight: "Do zero ao NASDAQ",
  },
  {
    name: "Rafael T.",
    role: "VIP ha 8 meses",
    text: "Ja estava quase desistindo do trade. Os calls do URA me mantiveram vivo enquanto eu aprendia. Hoje to no verde 3 meses seguidos. Gratidao eterna.",
    rating: 5,
    avatar: "R",
    avatarBg: "bg-white/[0.08]",
  },
];

const TESTIMONIALS_ROW_2: Testimonial[] = [
  {
    name: "Carla N.",
    role: "Membro Elite Turma 3.0",
    text: "A metodologia SMC + CRT e de outro nivel. O URA simplifica o que parece impossivel. Estudo todo dia e ja consigo identificar setups sozinha. Comunidade top demais.",
    rating: 5,
    avatar: "C",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Diego F.",
    role: "VIP ha 4 meses",
    text: "A galera do Discord e muito fera. Ambiente sem ego, todo mundo se ajuda. Diferente de qualquer grupo de trade que ja participei. Aqui o foco e evolucao real.",
    rating: 5,
    avatar: "D",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Thiago B.",
    role: "Membro Elite ha 6 meses",
    text: "Fiz as contas: o retorno que tive nos primeiros 2 meses ja pagou a mentoria 3x. E o conhecimento fica pra vida. Nao tem preco melhor no mercado BR.",
    rating: 5,
    avatar: "T",
    avatarBg: "bg-white/[0.08]",
    highlight: "ROI 3x em 2 meses",
  },
  {
    name: "Fernanda L.",
    role: "VIP ha 2 meses",
    text: "Comecei pelos calls VIP e em 2 semanas ja estava no verde. A qualidade das analises e absurda. Agora to estudando SMC pra nao depender de ninguem.",
    rating: 5,
    avatar: "F",
    avatarBg: "bg-white/[0.08]",
  },
  {
    name: "Gabriel O.",
    role: "Membro Elite Turma 2.0",
    text: "To na URA Labs desde a turma 2.0. A evolucao do conteudo e da comunidade e impressionante. Cada turma nova fica melhor. O URA leva isso a serio demais.",
    rating: 5,
    avatar: "G",
    avatarBg: "bg-white/[0.08]",
    highlight: "Membro desde Turma 2.0",
  },
  {
    name: "Isabela M.",
    role: "VIP ha 5 meses",
    text: "Mulher no trade e raro, mas aqui me senti acolhida desde o dia 1. Zero machismo, zero ego. So foco em aprender e evoluir. Recomendo de olhos fechados.",
    rating: 4,
    avatar: "I",
    avatarBg: "bg-white/[0.08]",
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="w-[340px] sm:w-[380px] shrink-0 mx-3">
      <div className="bg-dark-900 border border-white/5 rounded-2xl p-6 h-full hover:border-brand-500/20 transition-all duration-300 group">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {t.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{t.name}</p>
            <p className="text-gray-500 text-xs truncate">{t.role}</p>
          </div>
          <div className="ml-auto flex gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`} />
            ))}
          </div>
        </div>

        {/* Highlight badge */}
        {t.highlight && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="text-[11px] font-bold text-brand-400">{t.highlight}</span>
          </div>
        )}

        {/* Quote */}
        <div className="relative">
          <Quote className="w-4 h-4 text-white/5 absolute -top-1 -left-1" />
          <p className="text-gray-400 text-sm leading-relaxed pl-2">{t.text}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, reverse = false }: { testimonials: Testimonial[]; reverse?: boolean }) {
  const doubled = [...testimonials, ...testimonials];
  return (
    <div className="relative overflow-hidden py-2 group/marquee">
      <div className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} group-hover/marquee:[animation-play-state:paused]`}>
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  const totalReviews = TESTIMONIALS_ROW_1.length + TESTIMONIALS_ROW_2.length;
  const avgRating = (
    [...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_2].reduce((acc, t) => acc + t.rating, 0) / totalReviews
  ).toFixed(1);

  return (
    <section className="py-24 bg-dark-900 border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-4">
          <Reveal width="100%">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-brand-500/10 rounded-full"><Quote className="w-8 h-8 text-brand-500 fill-brand-500/20" /></div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">A Voz da Comunidade</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">Resultados falam mais alto que promessas. Veja o que acontece quando voce aplica o metodo URA LABS com disciplina.</p>
          </Reveal>
        </div>

        {/* Rating aggregate */}
        <Reveal delay={0.1} width="100%">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold text-white">{avgRating}</span>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Baseado em +480 avaliacoes</p>
              </div>
            </div>
            <div className="hidden sm:block h-10 w-px bg-white/10" />
            <div className="flex -space-x-2">
              {["L","A","P","M","J"].map((letter, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/[0.08] border-2 border-dark-900 flex items-center justify-center text-white/80 text-[10px] font-bold">
                  {letter}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-dark-800 border-2 border-dark-900 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                +475
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Marquee rows - full width */}
      <div className="space-y-2 mb-12">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark-900 to-transparent z-10 pointer-events-none" />
          <MarqueeRow testimonials={TESTIMONIALS_ROW_1} />
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark-900 to-transparent z-10 pointer-events-none" />
          <MarqueeRow testimonials={TESTIMONIALS_ROW_2} reverse />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href="https://discord.gg/SrxZSGN6"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-semibold transition-colors"
        >
          Junte-se a +480 alunos no Discord <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
