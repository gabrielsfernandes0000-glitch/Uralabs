import { Video, MonitorPlay, Zap, BookOpen, GraduationCap, Crosshair } from "lucide-react";
import { Reveal } from "./Reveal";

export function Services() {
  return (
    <section id="ecosystem" className="py-24 relative overflow-hidden bg-dark-900">
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">O Método Híbrido</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Duas Frentes, Um Objetivo</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Por que pagar duas assinaturas diferentes? No URA LABS, unificamos a <strong className="text-white">execução imediata</strong> com a <strong className="text-white">educação profissional</strong>.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0">
          {/* Pilar 1: Execução */}
          <div className="lg:pr-12 relative group">
            <Reveal delay={0.1} width="100%">
              <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
                <div className="p-4 bg-brand-500/10 rounded-2xl mb-6 inline-flex border border-brand-500/20"><Crosshair className="w-10 h-10 text-brand-500" /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Pilar 01: Execução</h3>
                <p className="text-brand-400 font-bold text-sm tracking-wide uppercase mb-6">&quot;Lucrar enquanto Aprende&quot;</p>
                <p className="text-gray-400 leading-relaxed mb-8 max-w-md">Não espere terminar o curso para ver resultado. Acesse nossa sala de operações e copie o racional de traders profissionais em tempo real.</p>
                <ul className="space-y-4 w-full max-w-md">
                  <li className="flex items-center justify-end gap-3 p-4 rounded-xl bg-dark-950 border border-white/5 hover:border-brand-500/30 transition-all">
                    <div className="text-right"><span className="block text-white font-bold">Sala Ao Vivo Diária</span><span className="text-xs text-gray-500">Operamos Crypto e NASDAQ juntos</span></div>
                    <MonitorPlay className="w-6 h-6 text-brand-500 shrink-0" />
                  </li>
                  <li className="flex items-center justify-end gap-3 p-4 rounded-xl bg-dark-950 border border-white/5 hover:border-brand-500/30 transition-all">
                    <div className="text-right"><span className="block text-white font-bold">Calls &amp; Sinais VIP</span><span className="text-xs text-gray-500">Entradas, Stops e Alvos definidos</span></div>
                    <Zap className="w-6 h-6 text-brand-500 shrink-0" />
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Pilar 2: Formação */}
          <div className="lg:pl-12 relative group">
            <Reveal delay={0.3} width="100%">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="p-4 bg-blue-500/10 rounded-2xl mb-6 inline-flex border border-blue-500/20"><GraduationCap className="w-10 h-10 text-blue-500" /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Pilar 02: Formação</h3>
                <p className="text-blue-400 font-bold text-sm tracking-wide uppercase mb-6">&quot;Dominar para não depender&quot;</p>
                <p className="text-gray-400 leading-relaxed mb-8 max-w-md">Sinais colocam dinheiro no bolso, mas só o conhecimento te dá liberdade. Formação completa do básico ao avançado em SMC e CRT.</p>
                <ul className="space-y-4 w-full max-w-md">
                  <li className="flex items-center gap-3 p-4 rounded-xl bg-dark-950 border border-white/5 hover:border-blue-500/30 transition-all">
                    <BookOpen className="w-6 h-6 text-blue-500 shrink-0" />
                    <div className="text-left"><span className="block text-white font-bold">URA Academy (Plataforma)</span><span className="text-xs text-gray-500">Cursos on-demand gravados</span></div>
                  </li>
                  <li className="flex items-center gap-3 p-4 rounded-xl bg-dark-950 border border-white/5 hover:border-blue-500/30 transition-all">
                    <Video className="w-6 h-6 text-blue-500 shrink-0" />
                    <div className="text-left"><span className="block text-white font-bold">Aulas de Mentoria</span><span className="text-xs text-gray-500">Tira-dúvidas e estudos semanais</span></div>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.5} width="100%">
          <div className="flex justify-center mt-20 relative z-20">
            <div className="bg-dark-950 border border-white/10 px-6 py-2 rounded-full shadow-xl flex items-center gap-2 transform hover:scale-105 transition-transform duration-300">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Tudo incluso na mesma assinatura</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
