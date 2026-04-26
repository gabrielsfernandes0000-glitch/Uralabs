import { Hash, Crown, TrendingUp, Target, Shield, Check } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Mockup elegante de uma call ao vivo no Discord.
 * Conteúdo é representativo (não é call específica vazada) — propósito é
 * mostrar visualmente como rola uma call: mensagens estruturadas com
 * entrada / stop / alvo + atualizações em tempo real.
 */
export function CallPreview() {
  return (
    <section className="py-24 bg-dark-950 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
          {/* Left: copy */}
          <div>
            <Reveal>
              <span className="text-[11px] font-medium text-brand-500 mb-3 block">Como rola uma call</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
                Entrada, stop e alvo. <br /><span className="text-brand-500">Sem mistério.</span>
              </h2>
              <p className="text-white/60 text-[15px] leading-relaxed mb-8">
                Cada call no canal VIP segue o mesmo formato: ativo, direção, entrada, stop, alvo e R:R. Atualizações em tempo real conforme a operação anda.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="space-y-3">
                {[
                  { icon: Target, text: "R:R definido antes da entrada" },
                  { icon: Shield, text: "Stop e gerenciamento explícitos" },
                  { icon: TrendingUp, text: "Atualização ao vivo da operação" },
                  { icon: Check, text: "Resultado registrado, vencedor ou perdedor" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-md surface-card flex items-center justify-center text-brand-500 shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="text-[14px] text-white/75">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          {/* Right: Discord call mockup */}
          <Reveal delay={0.2}>
            <div className="bg-[#313338] rounded-md border border-white/[0.08] overflow-hidden">
              {/* Channel header */}
              <div className="h-11 px-4 flex items-center gap-2.5 border-b border-black/30 bg-[#313338]">
                <Hash className="w-4 h-4 text-white/40 shrink-0" strokeWidth={2} />
                <span className="text-white text-[13px] font-medium">calls-vip</span>
                <span className="hidden sm:inline-block h-3 w-px bg-white/10 mx-1" />
                <span className="hidden sm:inline text-[11px] text-white/45">Operações ao vivo · só VIP</span>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-5">
                {/* Call principal */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium text-[12px] shrink-0">U</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand-500 font-medium text-[13px]">URA</span>
                      <Crown className="w-3 h-3 text-brand-500" />
                      <span className="text-[10px] text-white/35">hoje, 10:48</span>
                    </div>
                    <div className="bg-white/[0.03] border-l-2 border-l-brand-500 rounded p-3 mb-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[color:var(--color-semantic-up)]/[0.08] text-[var(--color-semantic-up)]">LONG</span>
                        <span className="text-white text-[14px] font-semibold">NQ</span>
                        <span className="text-white/30 text-[11px]">·</span>
                        <span className="text-white/55 text-[11px]">Nasdaq Futures</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-2.5">
                        <div>
                          <p className="text-[10px] text-white/40">Entrada</p>
                          <p className="text-white text-[13px] font-mono tabular-nums">18.450</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40">Stop</p>
                          <p className="text-[var(--color-semantic-down)] text-[13px] font-mono tabular-nums">18.420</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40">Alvo</p>
                          <p className="text-[var(--color-semantic-up)] text-[13px] font-mono tabular-nums">18.520</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 mt-2.5">R:R 2.3 · OB no 4H · liquidez Asia limpa</p>
                    </div>
                  </div>
                </div>

                {/* Update 1 */}
                <div className="flex gap-3 -mt-2">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium text-[12px] shrink-0">U</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand-500 font-medium text-[13px]">URA</span>
                      <span className="text-[10px] text-white/35">11:12</span>
                    </div>
                    <p className="text-white/70 text-[13px]">Stop pra breakeven em 18.480 ✅</p>
                  </div>
                </div>

                {/* Update 2 */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium text-[12px] shrink-0">U</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand-500 font-medium text-[13px]">URA</span>
                      <span className="text-[10px] text-white/35">11:34</span>
                    </div>
                    <p className="text-white/70 text-[13px]">TP1 batido <span className="text-[var(--color-semantic-up)] font-mono">+1R</span>. Deixando o resto correr.</p>
                  </div>
                </div>

                {/* Close */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium text-[12px] shrink-0">U</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand-500 font-medium text-[13px]">URA</span>
                      <span className="text-[10px] text-white/35">12:08</span>
                    </div>
                    <p className="text-white/70 text-[13px]">
                      Call fechada · resultado <span className="text-[var(--color-semantic-up)] font-mono font-medium">+2.1R</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/[0.04] bg-[#2b2d31]">
                <p className="text-[10px] text-white/35 text-center">
                  Mockup ilustrativo · formato real das calls no canal VIP
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
