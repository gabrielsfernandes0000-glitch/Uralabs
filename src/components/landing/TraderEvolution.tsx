import { Skull, Eye, Target, Trophy, ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "./Button";

const STEPS = [
  { phase: "Fase 01", title: "A Armadilha da Liquidez", icon: <Skull className="w-6 h-6 text-gray-400" />, description: "Onde 95% dos traders estão. Operando notícias, usando RSI/MACD, excesso de ansiedade e devolvendo lucro para o mercado.", status: "current", color: "gray" },
  { phase: "Fase 02", title: "O Despertar Institucional", icon: <Eye className="w-6 h-6 text-white" />, description: "Você entende que o gráfico é manipulado. Aprende a ler Order Blocks, FVG e a Estrutura de Mercado real (SMC).", status: "next", color: "brand" },
  { phase: "Fase 03", title: "Alinhamento Técnico", icon: <Target className="w-6 h-6 text-white" />, description: "Acesso à Sala Ao Vivo. Você vê a teoria aplicada na prática. Ajusta o timing com CRT e refina a gestão de risco.", status: "future", color: "brand" },
  { phase: "Fase 04", title: "Trader de Elite", icon: <Trophy className="w-6 h-6 text-white" />, description: "Consistência matemática. Você não busca 'o trade do mês', mas a execução perfeita. Aprovação em mesas proprietárias.", status: "goal", color: "yellow" },
];

export function TraderEvolution() {
  return (
    <section id="evolution" className="py-24 bg-dark-900 border-t border-white/5 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-20 left-4 text-[200px] font-bold text-white/[0.02] leading-none select-none pointer-events-none hidden xl:block">01</div>
      <div className="absolute bottom-20 right-4 text-[200px] font-bold text-white/[0.02] leading-none select-none pointer-events-none hidden xl:block">04</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
            <span className="text-xs font-bold text-brand-500 tracking-wide uppercase">Plano de Carreira</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Não vendemos sonhos.<br />Vendemos uma <span className="text-brand-500">Profissão.</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">O trading profissional não é uma corrida de 100 metros, é uma escalada. Veja como o Ecossistema URA transforma amadores em operadores institucionais.</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-[56px] left-0 right-0 h-0.5 bg-gradient-to-r from-gray-800 via-brand-900 to-yellow-900/50 -z-10 opacity-50" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative group">
                {i !== STEPS.length - 1 && <div className="md:hidden absolute left-[56px] top-[56px] bottom-[-32px] w-0.5 bg-gradient-to-b from-gray-800 to-gray-800/0 -z-10" />}
                <div className={`bg-dark-950 border rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-2 relative z-10 ${step.status === "current" ? "border-gray-700 opacity-70 hover:opacity-100" : ""} ${step.status === "next" || step.status === "future" ? "border-brand-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:border-brand-500/60" : ""} ${step.status === "goal" ? "border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:border-yellow-500/60" : ""}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${step.status === "current" ? "bg-gray-800 text-gray-400" : ""} ${step.status === "next" || step.status === "future" ? "bg-gradient-to-br from-brand-600 to-red-600 text-white shadow-lg shadow-brand-500/20" : ""} ${step.status === "goal" ? "bg-gradient-to-br from-yellow-500 to-yellow-700 text-white shadow-lg shadow-yellow-500/20" : ""}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-widest ${step.color === "gray" ? "text-gray-500" : step.color === "yellow" ? "text-yellow-500" : "text-brand-500"}`}>{step.phase}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-3">{step.description}</p>
                </div>
                {i !== STEPS.length - 1 && (
                  <>
                    <div className="md:hidden absolute left-[56px] -bottom-[32px] transform -translate-x-1/2 z-20">
                      <div className="w-8 h-8 rounded-full bg-dark-950 border border-gray-800 flex items-center justify-center text-gray-500 shadow-lg"><ChevronDown className="w-4 h-4" /></div>
                    </div>
                    <div className="hidden md:block absolute -right-[32px] top-[56px] transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 rounded-full bg-dark-950 border border-gray-800 flex items-center justify-center text-gray-500 shadow-lg group-hover:border-brand-500/50 group-hover:text-brand-500 transition-colors"><ChevronRight className="w-4 h-4" /></div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-6">Você está a um passo da Fase 02.</p>
          <Button href="#pricing" variant="secondary" className="px-8 py-4 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2">
            Começar Minha Evolução <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
