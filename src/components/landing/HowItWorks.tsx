import { MessageSquare, Eye, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Entra no Discord grátis",
    desc: "Calls free, chat ao vivo, conheça a comunidade. Sem cadastro complicado, sem cartão.",
  },
  {
    n: "02",
    icon: Eye,
    title: "Acompanha os resultados reais",
    desc: "Operações públicas — wins e loss. Sem cherry picking, sem print fora de contexto.",
  },
  {
    n: "03",
    icon: ArrowUpRight,
    title: "Quando fizer sentido, assina",
    desc: "VIP pra calls diários e plataforma de aulas. Elite pra mentoria ao vivo e mesa proprietária.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Reveal width="100%">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">Como funciona</h2>
            <p className="text-[14px] text-white/55 max-w-xl mx-auto">
              Sem ladeira, sem upsell agressivo. Você decide o ritmo.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} width="100%">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="surface-panel rounded-md p-6 hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-md surface-card flex items-center justify-center text-brand-500">
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-mono text-white/35 tabular-nums">{step.n}</span>
                  </div>
                  <h3 className="text-white text-[15px] font-medium mb-2">{step.title}</h3>
                  <p className="text-white/55 text-[13px] leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
