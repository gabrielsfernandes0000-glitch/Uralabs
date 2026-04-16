import { Check, X, Minus } from "lucide-react";
import { Reveal } from "./Reveal";

type Feature = {
  name: string;
  ura: "yes" | "no" | "partial";
  signals: "yes" | "no" | "partial";
  course: "yes" | "no" | "partial";
  free: "yes" | "no" | "partial";
};

const FEATURES: Feature[] = [
  { name: "Sinais diários com R:R definido", ura: "yes", signals: "yes", course: "no", free: "no" },
  { name: "Sala operacional ao vivo", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Mentor operando junto (não só falando)", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Formação SMC/ICT/CRT estruturada", ura: "yes", signals: "no", course: "yes", free: "partial" },
  { name: "Aulas gravadas + ao vivo na plataforma", ura: "yes", signals: "no", course: "yes", free: "partial" },
  { name: "Comunidade ativa com resultados reais", ura: "yes", signals: "partial", course: "partial", free: "no" },
  { name: "Mostra os LOSS (transparência total)", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Mentoria individual por turma", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Aprovação de mesas funded ao vivo", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Custo real vs valor entregue", ura: "yes", signals: "partial", course: "partial", free: "yes" },
];

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  if (status === "yes") return <Check className="w-4 h-4 text-green-500" />;
  if (status === "partial") return <Minus className="w-4 h-4 text-yellow-500" />;
  return <X className="w-4 h-4 text-gray-600" />;
}

export function Comparison() {
  return (
    <section className="py-24 bg-dark-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Comparativo Honesto</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">URA Labs vs O Resto</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Não somos o mais barato. Somos o mais completo. Compare você mesmo.</p>
          </Reveal>
        </div>

        <Reveal delay={0.2} width="100%">
          <div className="bg-dark-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="grid grid-cols-5 gap-0 border-b border-white/5">
              <div className="p-4 col-span-1" />
              <div className="p-4 text-center border-l border-white/5 bg-brand-500/5">
                <span className="text-sm font-bold text-brand-500">URA Labs</span>
              </div>
              <div className="p-4 text-center border-l border-white/5">
                <span className="text-xs font-medium text-gray-500">Grupo de Sinais</span>
              </div>
              <div className="p-4 text-center border-l border-white/5">
                <span className="text-xs font-medium text-gray-500">Curso Gravado</span>
              </div>
              <div className="p-4 text-center border-l border-white/5">
                <span className="text-xs font-medium text-gray-500">YouTube Free</span>
              </div>
            </div>

            {/* Rows */}
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className={`grid grid-cols-5 gap-0 ${
                  i !== FEATURES.length - 1 ? "border-b border-white/5" : ""
                } hover:bg-white/[0.02] transition-colors`}
              >
                <div className="p-4 flex items-center">
                  <span className="text-sm text-gray-300">{feat.name}</span>
                </div>
                <div className="p-4 flex items-center justify-center border-l border-white/5 bg-brand-500/[0.03]">
                  <StatusIcon status={feat.ura} />
                </div>
                <div className="p-4 flex items-center justify-center border-l border-white/5">
                  <StatusIcon status={feat.signals} />
                </div>
                <div className="p-4 flex items-center justify-center border-l border-white/5">
                  <StatusIcon status={feat.course} />
                </div>
                <div className="p-4 flex items-center justify-center border-l border-white/5">
                  <StatusIcon status={feat.free} />
                </div>
              </div>
            ))}

            {/* Price row */}
            <div className="grid grid-cols-5 gap-0 border-t border-white/10 bg-white/[0.02]">
              <div className="p-4 flex items-center">
                <span className="text-sm font-bold text-white">Investimento</span>
              </div>
              <div className="p-4 text-center border-l border-white/5 bg-brand-500/[0.03]">
                <span className="text-sm font-bold text-brand-500">R$ 120/mês</span>
              </div>
              <div className="p-4 text-center border-l border-white/5">
                <span className="text-xs text-gray-500">R$ 50-200/mês</span>
              </div>
              <div className="p-4 text-center border-l border-white/5">
                <span className="text-xs text-gray-500">R$ 500-3.000</span>
              </div>
              <div className="p-4 text-center border-l border-white/5">
                <span className="text-xs text-gray-500">Grátis</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
