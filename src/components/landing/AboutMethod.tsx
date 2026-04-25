import { Target, Video, BrainCircuit, CandlestickChart, LineChart, Skull, Eye, Trophy } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top: URA + Method split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          {/* Photo */}
          <div className="relative flex justify-center lg:justify-end">
            <Reveal width="100%">
              <div className="w-full max-w-md aspect-[3/4] rounded-md overflow-hidden border border-white/[0.08] relative z-10 bg-dark-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.postimg.cc/xTmPTYqN/ura.png" alt="URA - Founder & Head Trader" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="surface-card backdrop-blur-md p-4 rounded-md border-l-2 border-l-brand-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-3.5 h-3.5 text-brand-500" strokeWidth={2} />
                      <span className="text-white text-[11px] font-medium">Head trader &amp; mentor</span>
                    </div>
                    <p className="text-white/80 italic text-[13px] leading-relaxed">&quot;O mercado é soberano, mas a técnica é o nosso escudo.&quot;</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Content: Bio + Method */}
          <div>
            <Reveal>
              <span className="text-[11px] font-medium text-brand-500 mb-3 block">Quem é o URA</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5 text-white leading-[1.15]">Já perdi dinheiro <br /><span className="text-brand-500">pra você não perder.</span></h2>
              <p className="text-white/60 text-[15px] mb-8 leading-relaxed">Tomei stop, perdi tempo com conteúdo raso, e quase desisti. Criei a <span className="text-white">URA Labs</span> pra filtrar o ruído e entregar só o que funciona — do <span className="text-white">zero ao avançado</span> em Cripto e Nasdaq.</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-3">
                {[
                  { icon: <BrainCircuit className="w-4 h-4" strokeWidth={2} />, title: "Leitura institucional (SMC)", desc: "Aprenda a ver o que os bancos e fundos fazem no gráfico — e pare de ser a liquidez deles." },
                  { icon: <CandlestickChart className="w-4 h-4" strokeWidth={2} />, title: "Entradas de precisão (CRT)", desc: "Uma técnica rara que identifica a intenção real por trás do preço. Menos trades, mais acerto." },
                  { icon: <LineChart className="w-4 h-4" strokeWidth={2} />, title: "Cripto & Nasdaq", desc: "Focamos onde o dinheiro está: futuros de criptomoedas e o índice americano mais líquido do mundo." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-md surface-panel hover:border-white/[0.12] transition-colors">
                    <div className="w-8 h-8 rounded-md surface-card flex items-center justify-center text-brand-500 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="text-white text-[14px] font-medium">{item.title}</h4>
                      <p className="text-white/55 text-[13px] mt-0.5 leading-relaxed">{item.desc}</p>
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
            <h3 className="text-[22px] md:text-[28px] font-semibold tracking-tight text-white">De amador a <span className="text-brand-500">profissional</span></h3>
            <p className="text-white/50 mt-1.5 text-[13px]">4 fases. Um caminho claro.</p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-[32px] left-[12%] right-[12%] h-px bg-white/[0.06]" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {JOURNEY.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className={`relative text-center ${step.dim ? "opacity-50" : ""}`}>
                    <div className={`w-16 h-16 mx-auto rounded-md flex items-center justify-center mb-4 relative bg-dark-950 ${
                      i === 3
                        ? "border border-brand-500/40"
                        : step.dim
                        ? "border border-white/[0.05]"
                        : "border border-white/[0.08]"
                    }`}>
                      <Icon className={`w-5 h-5 ${i === 3 ? "text-brand-500" : step.dim ? "text-white/30" : "text-white/65"}`} strokeWidth={2} />
                    </div>
                    <p className={`text-[10px] font-mono mb-1 tabular-nums ${step.dim ? "text-white/30" : "text-brand-500"}`}>Fase {step.phase}</p>
                    <h4 className="text-white text-[13px] font-medium">{step.title}</h4>
                    <p className="text-white/50 text-[12px] mt-1 max-w-[200px] mx-auto leading-relaxed">{step.desc}</p>
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
