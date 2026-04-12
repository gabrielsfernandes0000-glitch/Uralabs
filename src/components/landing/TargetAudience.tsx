import { XCircle, CheckCircle2, AlertTriangle, Briefcase, Skull } from "lucide-react";
import { Reveal } from "./Reveal";

export function TargetAudience() {
  return (
    <section className="py-32 bg-dark-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <Reveal width="100%">
            <span className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Alinhamento de Expectativa</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 text-white">Este ambiente é para você?</h2>
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg font-light leading-relaxed">O URA LABS não é uma sala de sinais comum. Filtramos nossa comunidade para manter o nível alto. Veja se você se encaixa.</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Don't join */}
          <Reveal width="100%" delay={0.1}>
            <div className="relative h-full p-8 md:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/5 overflow-hidden group transition-all duration-500 hover:bg-white/[0.04]">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-all duration-700 pointer-events-none" />
              <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"><Skull className="w-20 h-20 text-red-500 rotate-12" /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-red-500 shadow-inner"><AlertTriangle className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold text-gray-200 group-hover:text-red-400 transition-colors">NÃO entre se você:</h3>
                </div>
                <ul className="space-y-6">
                  {["Procura dinheiro fácil, rápido ou \"ficar rico semana que vem\".", "Acha que o mercado é sorte, jogo ou aposta (Gambling).", "Não tem estômago para assumir riscos ou stops controlados."].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 group/item">
                      <div className="mt-1 p-1 rounded-full bg-red-500/10 text-red-500 group-hover/item:bg-red-500 group-hover/item:text-white transition-all"><XCircle className="w-4 h-4" /></div>
                      <p className="text-gray-400 text-sm leading-relaxed group-hover/item:text-gray-300 transition-colors">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* Join */}
          <Reveal width="100%" delay={0.2}>
            <div className="relative h-full p-8 md:p-10 rounded-3xl bg-blue-500/5 backdrop-blur-md border border-blue-500/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.2)] group transition-all duration-500 hover:bg-blue-500/10 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)]">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-all duration-700 pointer-events-none" />
              <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"><Briefcase className="w-20 h-20 text-blue-500 -rotate-12" /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"><CheckCircle2 className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold text-white">O URA LABS é para quem:</h3>
                </div>
                <ul className="space-y-6">
                  {[
                    <>Encara o trading como uma <strong className="text-white">profissão</strong> e um negócio sério.</>,
                    "Já opera mas está estagnado, ou é iniciante com sede de aprender certo.",
                    "Entende que perdas fazem parte do custo operacional (Gestão de Risco).",
                    <>Quer dominar <strong className="text-white">SMC, ICT e NASDAQ</strong> para não depender de ninguém.</>,
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 group/item">
                      <div className="mt-1 p-1 rounded-full bg-blue-500/20 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"><CheckCircle2 className="w-4 h-4" /></div>
                      <p className="text-gray-300 text-sm leading-relaxed font-medium group-hover/item:text-white transition-colors">{text}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 pt-6 border-t border-blue-500/10">
                  <p className="text-xs text-blue-400/80 italic text-center">&quot;Se você se identificou com este card, você já está na frente de 90% do mercado.&quot;</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
