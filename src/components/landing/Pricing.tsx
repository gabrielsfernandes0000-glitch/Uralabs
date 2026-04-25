"use client";

import { useState } from "react";
import { Check, X, ShieldCheck, Crown, Zap, ArrowRight, QrCode, Bitcoin, ChevronDown, Play } from "lucide-react";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { trackEvent } from "@/lib/analytics";

/* ── Tier comparison data ── */
const FEATURES = [
  { name: "Comunidade Discord", free: true, vip: true, elite: true },
  { name: "Canal #educação-free", free: true, vip: true, elite: true },
  { name: "Resultados públicos", free: true, vip: true, elite: true },
  { name: "Calls diários (entrada/stop/alvo)", free: false, vip: true, elite: true },
  { name: "Chat VIP exclusivo", free: false, vip: true, elite: true },
  { name: "Análises exclusivas", free: false, vip: true, elite: true },
  { name: "Plataforma de aulas gravadas (14 aulas SMC)", free: false, vip: true, elite: true },
  { name: "Quiz por aula + PDFs + flashcards", free: false, vip: true, elite: true },
  { name: "Turma, ranking e conquistas (ver)", free: false, vip: true, elite: true },
  { name: "Calls ao vivo operando junto com o URA", free: false, vip: false, elite: true },
  { name: "Aulas de mesa prop (FundingPips, TopStep…)", free: false, vip: false, elite: true },
  { name: "Treinos interativos (121+ cenários)", free: false, vip: false, elite: true },
  { name: "Corretora conectada (PnL automático)", free: false, vip: false, elite: true },
  { name: "Mentoria ao vivo por turma", free: false, vip: false, elite: true },
  { name: "Revisão das suas operações", free: false, vip: false, elite: true },
  { name: "Publicar + submeter conquistas (mural)", free: false, vip: false, elite: true },
  { name: "WhatsApp exclusivo + sorteios", free: false, vip: false, elite: true },
];

function FeatureCheck({ v }: { v: boolean }) {
  return v
    ? <Check className="w-3.5 h-3.5 text-[var(--color-semantic-up)]" strokeWidth={2.5} />
    : <X className="w-3.5 h-3.5 text-white/15" strokeWidth={2} />;
}

/* ── Mini Elite Preview (embedded) ── */
function ElitePlatformPreview() {
  const lessons = [
    { num: "01", title: "Introdução ao Trade", dur: "20min", done: true },
    { num: "02", title: "Leitura de Candle", dur: "18min", done: true },
    { num: "03", title: "Order Blocks", dur: "25min", done: false },
    { num: "04", title: "FVG & Breaker", dur: "20min", done: false },
    { num: "05", title: "Premium & Discount", dur: "18min", done: false },
    { num: "06", title: "AMD", dur: "25min", done: false },
  ];

  return (
    <div className="mt-6 rounded-md surface-panel overflow-hidden">
      <div className="h-7 border-b border-white/[0.05] flex items-center px-3 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="flex-1 flex justify-center">
          <span className="text-[10px] text-white/30 font-mono">uralabs.com.br/elite/aulas</span>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[11px] font-medium text-white/60">5 módulos · 14 aulas · treinos</span>
        </div>
        {lessons.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.04]">
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-white/[0.04]">
              {l.done
                ? <Check className="w-3 h-3 text-[var(--color-semantic-up)]" strokeWidth={2.5} />
                : <Play className="w-2.5 h-2.5 text-white/40" strokeWidth={2} />}
            </div>
            <span className="text-[10px] font-mono text-white/35 shrink-0">{l.num}</span>
            <span className="text-[11px] text-white/70 flex-1 truncate">{l.title}</span>
            <span className="text-[10px] text-white/30 tabular-nums">{l.dur}</span>
          </div>
        ))}
        <div className="text-center pt-2">
          <span className="text-[10px] text-white/25">+ 8 aulas · 9 treinos · badges</span>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const [showPlatform, setShowPlatform] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <Reveal width="100%">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">Quanto custa</h2>
            <p className="text-[14px] text-white/55 max-w-xl mx-auto">Três caminhos. Escolha onde faz sentido agora — pode subir quando quiser.</p>
          </Reveal>
        </div>

        {/* ── 3 Tiers side by side ── */}
        <Reveal width="100%">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">

            {/* FREE */}
            <div className="rounded-lg border border-white/[0.05] bg-dark-950 p-6 flex flex-col">
              <div className="mb-5">
                <span className="text-[11px] font-medium text-white/45">Comunidade</span>
                <h3 className="text-[20px] font-semibold text-white mt-1">Grátis</h3>
                <p className="text-[13px] text-white/50 mt-1">Entra, conhece, decide depois.</p>
              </div>
              <div className="text-[28px] font-semibold text-white tabular-nums leading-none mb-6">R$ 0</div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {["Chat geral e dúvidas", "1 conceito educacional por semana", "Ver resultados dos membros", "Notícias do mercado"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span className="text-[13px] text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_discord_free", { location: "pricing_free" })}
                className="bg-white text-dark-950 hover:bg-white/90 border-none font-semibold text-[13px]"
              >
                Entrar no Discord
              </Button>
            </div>

            {/* VIP */}
            <div className="rounded-lg border border-white/[0.08] bg-dark-950 p-6 flex flex-col relative">
              <div className="mb-5">
                <span className="text-[11px] font-medium text-white/55">Sinais VIP + plataforma</span>
                <h3 className="text-[20px] font-semibold text-white mt-1">VIP</h3>
                <p className="text-[13px] text-white/50 mt-1">Calls diários + aulas gravadas pra aprender.</p>
              </div>
              <div className="mb-6">
                <span className="text-[28px] font-semibold text-white tabular-nums leading-none">R$ 120</span>
                <span className="text-[13px] text-white/45 ml-1">/mês</span>
                <div className="flex gap-3 mt-2 text-[11px] text-white/40 tabular-nums">
                  <span>R$ 480/sem</span>
                  <span>R$ 840/ano <span className="text-[var(--color-semantic-up)] font-medium">−42%</span></span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Tudo do Grátis",
                  "Calls diários com entrada, stop e alvo",
                  "Plataforma com 14 aulas gravadas (SMC completo)",
                  "Quiz por aula + PDFs + flashcards",
                  "Chat VIP exclusivo",
                  "Turma, ranking e conquistas (ver)",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Zap className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${i === 0 ? "text-white/30" : "text-brand-500"}`} strokeWidth={2} />
                    <span className="text-[13px] text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_vip", { location: "pricing_vip" })}
                variant="outline"
                className="border border-white/[0.12] text-white hover:border-brand-500 hover:text-brand-500 transition-colors font-semibold text-[13px]"
              >
                Assinar VIP
              </Button>
            </div>

            {/* ELITE */}
            <div className="rounded-lg border border-brand-500/35 bg-dark-950 p-6 flex flex-col relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-brand-500" />
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="bg-brand-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded">Mais completo</span>
              </div>
              <div className="mb-5 mt-1">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-brand-500" strokeWidth={2} />
                  <span className="text-[11px] font-medium text-brand-500">Mentoria Elite 4.0</span>
                </div>
                <h3 className="text-[20px] font-semibold text-white mt-1">Elite</h3>
                <p className="text-[13px] text-white/50 mt-1">Aprenda a operar sozinho. Pra sempre.</p>
              </div>
              <div className="mb-1">
                <span className="text-[12px] text-white/35 line-through tabular-nums">R$ 3.500</span>
              </div>
              <div className="mb-3">
                <span className="text-[28px] font-semibold text-white tabular-nums leading-none">R$ 2.500</span>
                <span className="text-[13px] text-white/45 ml-1">/6 meses</span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-2 py-1 rounded surface-card">
                  <QrCode className="w-3 h-3 text-white/55" strokeWidth={2} /><span className="text-[10px] text-white/70 font-medium">Pix</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded surface-card">
                  <Bitcoin className="w-3 h-3 text-white/55" strokeWidth={2} /><span className="text-[10px] text-white/70 font-medium">Cripto</span>
                </div>
                <span className="text-[10px] text-white/35 tabular-nums">ou 12× R$ 249</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {[
                  "Tudo do VIP (6 meses inclusos)",
                  "Calls ao vivo diárias operando junto com o URA",
                  "Aulas de mesa prop (FundingPips, TopStep, 5%ers)",
                  "Treinos interativos (121+ cenários)",
                  "Corretora conectada · PnL automático",
                  "Publicar + submeter conquistas no mural",
                  "Revisão das suas operações",
                  "WhatsApp exclusivo + sorteio de mesas",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${i === 0 ? "text-white/30" : "text-brand-500"}`} strokeWidth={2.5} />
                    <span className="text-[13px] text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_elite", { location: "pricing_elite" })}
                className="h-11 bg-brand-500 hover:bg-brand-400 text-white border-none text-[13px] font-semibold group transition-colors"
              >
                Quero ser Elite <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <p className="text-[10px] text-white/35 text-center mt-2">Abra um ticket no Discord</p>

              {/* Platform preview toggle */}
              <button
                onClick={() => setShowPlatform(!showPlatform)}
                className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/45 hover:text-white/75 transition-colors cursor-pointer"
              >
                {showPlatform ? "Esconder" : "Ver a plataforma por dentro"}
                <ChevronDown className={`w-3 h-3 transition-transform ${showPlatform ? "rotate-180" : ""}`} strokeWidth={2} />
              </button>
              {showPlatform && <ElitePlatformPreview />}
            </div>
          </div>
        </Reveal>

        {/* ── Feature comparison table ── */}
        <Reveal delay={0.2} width="100%">
          <div className="max-w-4xl mx-auto mb-16">
            <h4 className="text-center text-[14px] font-medium text-white/70 mb-5">Comparação detalhada</h4>
            <div className="surface-panel rounded-md overflow-hidden">
              <div className="grid grid-cols-[1fr_70px_70px_70px] gap-0 border-b border-white/[0.05] px-5 py-3">
                <div />
                <div className="text-center text-[11px] font-medium text-white/40">Grátis</div>
                <div className="text-center text-[11px] font-medium text-white/55">VIP</div>
                <div className="text-center text-[11px] font-medium text-brand-500">Elite</div>
              </div>
              {FEATURES.map((row, i) => (
                <div key={i} className={`grid grid-cols-[1fr_70px_70px_70px] gap-0 px-5 py-2.5 ${i !== FEATURES.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                  <span className="text-[12px] text-white/65">{row.name}</span>
                  <div className="flex justify-center"><FeatureCheck v={row.free} /></div>
                  <div className="flex justify-center"><FeatureCheck v={row.vip} /></div>
                  <div className="flex justify-center"><FeatureCheck v={row.elite} /></div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Guarantee */}
        <Reveal delay={0.3} width="100%">
          <div className="max-w-2xl mx-auto text-center surface-panel p-8 rounded-md">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-md surface-card mb-4">
              <ShieldCheck className="w-4 h-4 text-brand-500" strokeWidth={2} />
            </div>
            <h3 className="text-[20px] font-semibold text-white mb-2 tracking-tight">Garantia incondicional de 7 dias</h3>
            <p className="text-[13px] text-white/55">O risco é todo nosso. Se achar que não valeu, devolvemos 100%.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
