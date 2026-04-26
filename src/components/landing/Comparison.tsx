import { Check, X, Minus } from "lucide-react";
import { Reveal } from "./Reveal";

type Status = "yes" | "no" | "partial";
type Feature = {
  name: string;
  ura: Status;
  signals: Status;
  course: Status;
  free: Status;
};

const FEATURES: Feature[] = [
  { name: "Calls com entrada, stop e alvo definidos", ura: "yes", signals: "yes", course: "no", free: "no" },
  { name: "Sala operacional ao vivo", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "URA opera junto, na call (não só fala)", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Mostra os loss (transparência total)", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Formação SMC/CRT estruturada", ura: "yes", signals: "no", course: "yes", free: "partial" },
  { name: "Plataforma com aulas + treinos", ura: "yes", signals: "no", course: "yes", free: "partial" },
  { name: "Mentoria por turma com revisão", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Aprovação em mesa proprietária real", ura: "yes", signals: "no", course: "no", free: "no" },
  { name: "Comunidade ativa com track record verificável", ura: "yes", signals: "partial", course: "partial", free: "no" },
  { name: "Garantia incondicional de 7 dias", ura: "yes", signals: "no", course: "no", free: "yes" },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === "yes") return <Check className="w-3.5 h-3.5 text-[var(--color-semantic-up)]" strokeWidth={2.5} />;
  if (status === "partial") return <Minus className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />;
  return <X className="w-3.5 h-3.5 text-white/15" strokeWidth={2} />;
}

export function Comparison() {
  return (
    <section className="py-24 bg-dark-950 border-t border-white/[0.05]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Reveal width="100%">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">URA Labs vs o resto</h2>
            <p className="text-[14px] text-white/55 max-w-xl mx-auto">
              Não somos o mais barato. Somos o mais completo. Compare você mesmo.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} width="100%">
          <div className="surface-panel rounded-md overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_70px_70px_70px_70px] md:grid-cols-[1.6fr_90px_90px_90px_90px] gap-0 border-b border-white/[0.05]">
              <div className="p-3 md:p-4" />
              <div className="p-3 md:p-4 text-center border-l border-white/[0.05]">
                <span className="text-[11px] font-medium text-brand-500">URA Labs</span>
              </div>
              <div className="p-3 md:p-4 text-center border-l border-white/[0.05]">
                <span className="text-[11px] font-medium text-white/40">Sinais</span>
              </div>
              <div className="p-3 md:p-4 text-center border-l border-white/[0.05]">
                <span className="text-[11px] font-medium text-white/40">Curso</span>
              </div>
              <div className="p-3 md:p-4 text-center border-l border-white/[0.05]">
                <span className="text-[11px] font-medium text-white/40">YouTube</span>
              </div>
            </div>

            {/* Rows */}
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_70px_70px_70px_70px] md:grid-cols-[1.6fr_90px_90px_90px_90px] gap-0 ${
                  i !== FEATURES.length - 1 ? "border-b border-white/[0.03]" : ""
                } hover:bg-white/[0.02] transition-colors`}
              >
                <div className="p-3 md:p-4 flex items-center">
                  <span className="text-[12px] md:text-[13px] text-white/65">{feat.name}</span>
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center border-l border-white/[0.05]">
                  <StatusIcon status={feat.ura} />
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center border-l border-white/[0.05]">
                  <StatusIcon status={feat.signals} />
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center border-l border-white/[0.05]">
                  <StatusIcon status={feat.course} />
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center border-l border-white/[0.05]">
                  <StatusIcon status={feat.free} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-white/35 mt-4">
            Comparação genérica de mercado · não nomeia concorrentes específicos
          </p>
        </Reveal>
      </div>
    </section>
  );
}
