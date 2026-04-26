"use client";

import { TrendingUp, Target, Shield, Check, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { Reveal } from "./Reveal";

export function CallPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    if (!videoRef.current) return;
    const next = !muted;
    videoRef.current.muted = next;
    if (!next) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
    setMuted(next);
  };

  return (
    <section className="py-24 bg-dark-950 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12 items-center">
          {/* Left: copy */}
          <div>
            <Reveal>
              <span className="text-[11px] font-medium text-brand-500 mb-3 block">Como rola uma call</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
                Entrada, stop e alvo. <br /><span className="text-brand-500">Sem mistério.</span>
              </h2>
              <p className="text-white/60 text-[15px] leading-relaxed mb-8">
                Cada call segue o mesmo formato: entrada, stop e alvo definidos antes da execução. Você acompanha a operação rodando ao vivo até o resultado fechar.
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

          {/* Right: motion graphic — Trade Ladder Reveal */}
          <Reveal delay={0.2}>
            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] surface-card">
              <video
                ref={videoRef}
                src="/motion/trade-ladder.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="hidden md:block w-full h-auto"
                aria-label="Animação demonstrando uma call de trade do canal VIP"
              />
              <video
                src="/motion/trade-ladder-vertical.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="md:hidden w-full h-auto block"
                aria-label="Animação demonstrando uma call de trade do canal VIP (versão vertical)"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/55 border border-white/10 backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-semantic-up)] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-semantic-up)]" />
                </span>
                <span className="text-[10px] text-white/70 font-medium tracking-wide">Exemplo</span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                aria-label={muted ? "Ativar som" : "Desativar som"}
                className="hidden md:flex absolute bottom-3 right-3 items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm hover:bg-black/80 transition-colors text-white/80 hover:text-white"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-medium tracking-wide">{muted ? "Som" : "Mudo"}</span>
              </button>
            </div>
            <p className="text-[11px] text-white/35 text-center mt-3">
              Animação ilustrativa · formato real das calls no canal VIP
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
