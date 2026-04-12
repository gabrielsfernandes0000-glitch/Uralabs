import { Mic, Video, Clock, BarChart2, BookOpen, MessageCircle } from "lucide-react";
import { Reveal } from "./Reveal";

const ROUTINE = [
  { time: "08:00 - 09:00", label: "Pré-Market & Contexto", desc: "Análise macroeconômica e marcação de zonas de liquidez antes da abertura.", icon: <Clock className="w-5 h-5" /> },
  { time: "09:00 - 11:30", label: "Sala Operacional Ao Vivo", desc: "Execução em tempo real. Acompanhe a tomada de decisão profissional no NASDAQ e Crypto.", icon: <Video className="w-5 h-5" /> },
  { time: "14:00 - 18:00", label: "Deep Work & Backtest", desc: "Estudo dirigido e validação de setups no gráfico parado. Hora de afiar a técnica.", icon: <BookOpen className="w-5 h-5" /> },
  { time: "19:00 - 20:30", label: "Market Review", desc: "O fechamento do dia. Correção de trades e alinhamento técnico para o dia seguinte.", icon: <BarChart2 className="w-5 h-5" /> },
];

const CARDS = [
  { title: "Sala Ao Vivo", icon: <Video className="w-6 h-6" />, desc: "Operamos juntos, todos os dias. Sem delay, sem filtro. Veja a execução acontecendo na sua frente." },
  { title: "Mentoria Técnica", icon: <Mic className="w-6 h-6" />, desc: "Aulas aprofundadas sobre SMC, ICT e comportamento institucional. Teoria aplicada diretamente ao gráfico." },
  { title: "Comunidade Elite", icon: <MessageCircle className="w-6 h-6" />, desc: "Network com traders que realmente vivem do mercado. Troca de experiência 24/7 no Discord." },
];

export function CourseModules() {
  return (
    <section id="mentorship" className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-brand-500/5 blur-[150px] rounded-full -z-10 pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Imersão Total</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Você não vai vencer <span className="text-brand-500">sozinho.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed font-light">
              O trading é solitário e brutal para quem caminha só. No URA LABS, você entra para um ecossistema de alta performance.
            </p>
          </Reveal>
        </div>

        {/* Ecosystem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {CARDS.map((card, i) => (
            <Reveal key={i} delay={i * 0.1} width="100%">
              <div className="group h-full p-8 rounded-3xl bg-dark-900 border border-white/5 hover:border-brand-500/30 transition-all duration-300 flex flex-col relative overflow-hidden shadow-lg hover:shadow-brand-500/5">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 text-gray-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 relative z-10 border border-white/5 group-hover:border-brand-500/20">{card.icon}</div>
                <div className="relative z-10 flex flex-col flex-grow items-start text-left">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-brand-500 transition-colors">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{card.desc}</p>
                </div>
                <div className="h-0.5 w-8 bg-white/10 group-hover:w-full group-hover:bg-brand-500/30 transition-all duration-500 relative z-10 mt-auto" />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Routine */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <span className="text-brand-500 font-bold tracking-widest uppercase text-xs mb-2">Estrutura Profissional</span>
            <h3 className="text-3xl font-bold text-white">Rotina Operacional</h3>
          </div>
          <div className="space-y-4 relative">
            <div className="hidden md:block absolute left-[12.5rem] top-8 bottom-8 w-px bg-white/5 z-0" />
            {ROUTINE.map((item, i) => (
              <Reveal key={i} delay={i * 0.1} width="100%">
                <div className="group flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-dark-900 border border-white/10 hover:border-brand-500/40 hover:bg-dark-800 transition-all duration-300 relative z-10 shadow-lg hover:shadow-[0_0_20px_rgba(255,85,0,0.1)]">
                  <div className="shrink-0 w-full md:w-48 flex items-center gap-3 md:justify-end">
                    <div className="p-2 bg-dark-950 border border-white/10 rounded-lg text-brand-500 group-hover:text-white group-hover:bg-brand-500 group-hover:border-brand-500 transition-all shadow-md">{item.icon}</div>
                    <span className="font-mono text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.time}</span>
                  </div>
                  <div className="flex-1 border-l-2 border-white/5 pl-6 md:border-none md:pl-0">
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-brand-500 transition-colors">{item.label}</h4>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
