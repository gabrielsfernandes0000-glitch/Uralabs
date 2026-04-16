import { Target, TrendingUp, Zap, Video, BrainCircuit, CandlestickChart, LineChart, Skull, Eye, Trophy } from "lucide-react";
import { Reveal } from "./Reveal";

const JOURNEY = [
  { phase: "01", title: "A Armadilha", desc: "Seguindo indicador, notícia e \"guru\". Perdendo dinheiro sem entender por quê.", icon: Skull, dim: true },
  { phase: "02", title: "O Despertar", desc: "Entende que o gráfico é manipulado. Começa a ler o que os grandes fazem.", icon: Eye, dim: false },
  { phase: "03", title: "A Prática", desc: "Opera junto com mentor ao vivo. Aprende gestão de risco real.", icon: Target, dim: false },
  { phase: "04", title: "Profissional", desc: "Consistência. Aprovação em mesas financiadas. Trading como profissão.", icon: Trophy, dim: false },
];

export function AboutMethod() {
  return (
    <section id="about" className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top: URA + Method split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Photo */}
          <div className="relative flex justify-center lg:justify-end">
            <Reveal width="100%">
              <div className="w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 relative z-10 bg-dark-900 group shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.postimg.cc/xTmPTYqN/ura.png" alt="URA - Founder & Head Trader" className="w-full h-full object-cover object-center scale-110 group-hover:scale-115 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl border-l-4 border-l-brand-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 bg-brand-500 rounded-lg"><Video className="w-4 h-4 text-white" /></div>
                      <span className="text-white font-bold text-sm uppercase tracking-wider">Head Trader &amp; Mentor</span>
                    </div>
                    <p className="text-gray-200 italic text-sm leading-relaxed font-medium">&quot;O mercado é soberano, mas a técnica é o nosso escudo.&quot;</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 lg:right-12 w-full max-w-md h-full border-2 border-brand-500/20 rounded-2xl -z-10" />
            </Reveal>
          </div>

          {/* Content: Bio + Method */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                <span className="text-xs font-bold text-brand-500 tracking-wide uppercase">Quem é o URA</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Já Perdi Dinheiro <br /><span className="text-brand-500">Pra Você Não Perder.</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">Tomei stop, perdi tempo com conteúdo raso, e quase desisti. Criei o <strong>URA LABS</strong> pra filtrar o ruído e entregar só o que funciona — do <strong>zero ao avançado</strong> em Cripto e NASDAQ.</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-5">
                {[
                  { icon: <BrainCircuit className="w-5 h-5" />, title: "Leitura Institucional (SMC)", desc: "Aprenda a ver o que os bancos e fundos fazem no gráfico — e pare de ser a liquidez deles." },
                  { icon: <CandlestickChart className="w-5 h-5" />, title: "Entradas de Precisão (CRT)", desc: "Uma técnica rara que identifica a intenção real por trás do preço. Menos trades, mais acerto." },
                  { icon: <LineChart className="w-5 h-5" />, title: "Cripto & NASDAQ", desc: "Focamos onde o dinheiro está: futuros de criptomoedas e o índice americano mais líquido do mundo." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-dark-900 border border-white/5 hover:border-brand-500/20 transition-colors">
                    <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-500 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Bottom: Journey timeline — compact horizontal ── */}
        <Reveal delay={0.2} width="100%">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold">De Amador a <span className="text-brand-500">Profissional</span></h3>
            <p className="text-gray-500 mt-2 text-sm">4 fases. Um caminho claro.</p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-[40px] left-0 right-0 h-px bg-gradient-to-r from-gray-800 via-brand-500/30 to-brand-500/20" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {JOURNEY.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className={`relative text-center ${step.dim ? "opacity-50" : ""}`}>
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      i === 3
                        ? "bg-gradient-to-br from-brand-500 to-yellow-600 shadow-lg shadow-brand-500/20"
                        : step.dim
                        ? "bg-dark-900 border border-white/5"
                        : "bg-dark-900 border border-brand-500/20"
                    }`}>
                      <Icon className={`w-7 h-7 ${i === 3 ? "text-white" : step.dim ? "text-gray-600" : "text-brand-500"}`} />
                    </div>
                    <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${step.dim ? "text-gray-600" : "text-brand-500"}`}>Fase {step.phase}</p>
                    <h4 className="text-white font-bold text-sm">{step.title}</h4>
                    <p className="text-gray-500 text-xs mt-1 max-w-[200px] mx-auto">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
