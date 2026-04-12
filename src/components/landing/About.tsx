import { Target, TrendingUp, Zap, Video } from "lucide-react";

export function About() {
  return (
    <section className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1 flex justify-center lg:justify-end">
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
                  <p className="text-gray-200 italic text-sm leading-relaxed font-medium">&quot;O mercado é soberano, mas a técnica é o nosso escudo. Aqui, a gente não aposta, a gente executa.&quot;</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 lg:right-12 w-full max-w-md h-full border-2 border-brand-500/20 rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <span className="text-xs font-bold text-brand-500 tracking-wide uppercase">O Manifesto URA</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Conteúdo Direto, <br /><span className="text-brand-500">Sem Enrolação.</span></h2>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">Criei o <strong>URA LABS</strong> com um objetivo claro: te ajudar a se desenvolver de verdade. Sei que você tem sede de aprender, mas esbarra em conteúdo raso ou vendido como milagre.</p>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed font-medium">Aqui o papo é outro: ensino do <strong>zero ao avançado</strong>, focado exclusivamente em <strong>Futuros de Cripto e NASDAQ</strong>.</p>
            <div className="space-y-6">
              {[
                { icon: <Target className="w-6 h-6" />, title: "Anti-Guru", desc: "Já tomei muito stop e perdi tempo com conteúdo inútil. Minha missão é filtrar o ruído e te entregar apenas o que funciona." },
                { icon: <TrendingUp className="w-6 h-6" />, title: "Especialista em Futuros", desc: "Foco total onde a volatilidade e o lucro real estão: Futuros de Cripto e NASDAQ, aplicando ICT e SMC na prática." },
                { icon: <Zap className="w-6 h-6" />, title: "Evolução Real", desc: "Chega de ver só a ponta do iceberg. Aqui você vai entender a estrutura real do mercado para parar de ser liquidez." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500 shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
