"use client";

import { useState } from "react";
import { Check, X, ShieldCheck, Crown, Zap, ArrowRight, MonitorPlay, GraduationCap, Users, Gift, QrCode, Bitcoin, ChevronDown, Play, Clock, BookOpen, Lock, Target } from "lucide-react";
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
    ? <Check className="w-4 h-4 text-green-500" />
    : <X className="w-4 h-4 text-gray-700" />;
}

/* ── Mini Elite Preview (embedded) ── */
function ElitePlatformPreview() {
  const lessons = [
    { num: "01", title: "Introdução ao Trade", dur: "20min", done: true, accent: "#FF5500" },
    { num: "02", title: "Leitura de Candle", dur: "18min", done: true, accent: "#FF5500" },
    { num: "03", title: "Order Blocks", dur: "25min", done: false, accent: "#3B82F6" },
    { num: "04", title: "FVG & Breaker", dur: "20min", done: false, accent: "#3B82F6" },
    { num: "05", title: "Premium & Discount", dur: "18min", done: false, accent: "#3B82F6" },
    { num: "06", title: "AMD", dur: "25min", done: false, accent: "#A855F7" },
  ];

  return (
    <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0a0a0c] overflow-hidden">
      <div className="h-7 bg-[#1a1a1e] border-b border-white/5 flex items-center px-3 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-white/10" />
        <div className="w-2 h-2 rounded-full bg-white/10" />
        <div className="w-2 h-2 rounded-full bg-white/10" />
        <div className="flex-1 flex justify-center">
          <span className="text-[8px] text-white/25 font-mono">uralabs.com.br/elite/aulas</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-brand-500/60" />
          <span className="text-[11px] font-bold text-white/60">5 módulos · 14 aulas · treinos</span>
        </div>
        {lessons.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
              l.done ? "bg-green-500/15" : "bg-white/[0.04]"
            }`}>
              {l.done ? <Check className="w-3 h-3 text-green-400" /> : <Play className="w-3 h-3" style={{ color: l.accent + "70" }} />}
            </div>
            <span className="text-[10px] font-mono shrink-0" style={{ color: l.accent + "60" }}>{l.num}</span>
            <span className="text-[11px] text-white/70 font-medium flex-1 truncate">{l.title}</span>
            <span className="text-[9px] text-white/25">{l.dur}</span>
          </div>
        ))}
        <div className="text-center pt-2">
          <span className="text-[9px] text-white/20">+ mais 8 aulas · 9 treinos · badges</span>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const [showPlatform, setShowPlatform] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-brand-500 font-bold tracking-widest uppercase text-sm">Planos &amp; Preços</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Quanto Custa</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Três caminhos. Escolha onde faz sentido pra você agora — pode subir quando quiser.</p>
          </Reveal>
        </div>

        {/* ── 3 Tiers side by side ── */}
        <Reveal width="100%">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">

            {/* FREE */}
            <div className="rounded-2xl border border-white/5 bg-dark-950 p-6 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comunidade</span>
                <h3 className="text-2xl font-bold text-white mt-1">Grátis</h3>
                <p className="text-gray-500 text-sm mt-1">Entra, conhece, decide depois.</p>
              </div>
              <div className="text-3xl font-bold text-white mb-6">R$ 0</div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Chat geral e dúvidas", "1 conceito educacional por semana", "Ver resultados dos membros", "Notícias do mercado"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_discord_free", { location: "pricing_free" })}
                className="bg-white text-dark-950 hover:bg-gray-200 border-none font-bold"
              >
                Entrar no Discord
              </Button>
            </div>

            {/* VIP */}
            <div className="rounded-2xl border border-white/10 bg-dark-950 p-6 flex flex-col relative">
              <div className="mb-4">
                <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Sinais VIP + Plataforma</span>
                <h3 className="text-2xl font-bold text-white mt-1">VIP</h3>
                <p className="text-gray-500 text-sm mt-1">Calls diários + aulas gravadas pra aprender.</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">R$ 120</span>
                <span className="text-gray-500 text-sm">/mês</span>
                <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                  <span>R$ 480/sem</span>
                  <span>R$ 840/ano <span className="text-green-400 font-bold">(-42%)</span></span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Tudo do Grátis",
                  "Calls diários com entrada, stop e alvo",
                  "Plataforma com 14 aulas gravadas (SMC completo)",
                  "Quiz por aula + PDFs + flashcards",
                  "Chat VIP exclusivo",
                  "Turma, ranking e conquistas (ver)",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${i === 0 ? "text-gray-500" : "text-brand-500"}`} />
                    <span className="text-gray-300 text-sm">{f}</span>
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
                className="border-brand-500/30 hover:bg-brand-500 hover:text-white hover:border-brand-500"
              >
                Assinar VIP
              </Button>
            </div>

            {/* ELITE */}
            <div className="rounded-2xl border-2 border-brand-500/40 bg-gradient-to-b from-brand-500/[0.04] to-dark-950 p-6 flex flex-col relative shadow-[0_0_40px_rgba(255,85,0,0.08)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">Mais Completo</span>
              </div>
              <div className="mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-brand-500" />
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Mentoria Elite 4.0</span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">Elite</h3>
                <p className="text-gray-500 text-sm mt-1">Aprenda a operar sozinho. Pra sempre.</p>
              </div>
              <div className="mb-1">
                <span className="text-gray-500 text-sm line-through">R$ 3.500</span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-white">R$ 2.500</span>
                <span className="text-gray-500 text-sm">/6 meses</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
                  <QrCode className="w-3 h-3 text-brand-500" /><span className="text-[10px] text-gray-300 font-bold">PIX</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
                  <Bitcoin className="w-3 h-3 text-brand-500" /><span className="text-[10px] text-gray-300 font-bold">CRYPTO</span>
                </div>
                <span className="text-[10px] text-gray-500">ou 12x R$249</span>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  "Tudo do VIP (6 meses inclusos)",
                  "Calls ao vivo diárias operando JUNTO com o URA",
                  "Aulas de mesa prop (FundingPips, TopStep, 5%ers)",
                  "Treinos interativos (121+ cenários)",
                  "Corretora conectada · PnL automático",
                  "Publicar + submeter conquistas no mural",
                  "Revisão das suas operações",
                  "WhatsApp exclusivo + sorteio de mesas",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${i === 0 ? "text-gray-500" : "text-brand-500"}`} />
                    <span className="text-gray-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_elite", { location: "pricing_elite" })}
                className="h-12 bg-gradient-to-r from-brand-600 to-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] border-none text-base group"
              >
                Quero ser Elite <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[10px] text-gray-600 text-center mt-2">Abra um ticket no Discord</p>

              {/* Platform preview toggle */}
              <button
                onClick={() => setShowPlatform(!showPlatform)}
                className="mt-4 flex items-center justify-center gap-2 text-[11px] text-brand-500/60 hover:text-brand-500 transition-colors cursor-pointer"
              >
                {showPlatform ? "Esconder" : "Ver a plataforma por dentro"}
                <ChevronDown className={`w-3 h-3 transition-transform ${showPlatform ? "rotate-180" : ""}`} />
              </button>
              {showPlatform && <ElitePlatformPreview />}
            </div>
          </div>
        </Reveal>

        {/* ── Feature comparison table ── */}
        <Reveal delay={0.2} width="100%">
          <div className="max-w-4xl mx-auto mb-16">
            <h4 className="text-center text-lg font-bold text-white mb-6">Comparação detalhada</h4>
            <div className="bg-dark-950 border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_70px_70px_70px] gap-0 border-b border-white/5 px-5 py-3">
                <div />
                <div className="text-center text-[10px] font-bold text-gray-500 uppercase">Grátis</div>
                <div className="text-center text-[10px] font-bold text-gray-400 uppercase">VIP</div>
                <div className="text-center text-[10px] font-bold text-brand-500 uppercase">Elite</div>
              </div>
              {FEATURES.map((row, i) => (
                <div key={i} className={`grid grid-cols-[1fr_70px_70px_70px] gap-0 px-5 py-2.5 ${i !== FEATURES.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                  <span className="text-xs text-gray-400">{row.name}</span>
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
          <div className="max-w-3xl mx-auto text-center bg-dark-950 border border-white/5 p-8 rounded-2xl">
            <div className="inline-flex p-3 bg-brand-500/10 rounded-full mb-4 border border-brand-500/20"><ShieldCheck className="w-8 h-8 text-brand-500" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Garantia Incondicional de 7 Dias</h3>
            <p className="text-gray-400">O risco é todo nosso. Se achar que não valeu, devolvemos 100% do valor.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
