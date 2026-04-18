import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  Radio, Crosshair, Trophy, Users, BarChart3, Check, ArrowRight, Flame, Zap, Shield,
} from "lucide-react";

export default async function DesbloquearPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Elite users don't need this page — send them back home.
  if (session.isElite) redirect("/elite");

  const eliteFeatures = [
    { icon: Radio,      title: "Calls ao vivo diárias",   desc: "Operações junto com o URA, análise em tempo real + replays gravados", accent: "#FF5500" },
    { icon: Trophy,     title: "Aulas de mesa prop",      desc: "FundingPips, TopStep, 5%ers — estratégias, regras, como passar", accent: "#F59E0B" },
    { icon: Crosshair,  title: "Treinos + Quiz",          desc: "121+ cenários, quiz por aula, flashcards, exercícios práticos",      accent: "#A855F7" },
    { icon: BarChart3,  title: "Corretora conectada",     desc: "Puxa trades, PnL e performance direto da sua conta",                 accent: "#3B82F6" },
    { icon: Users,      title: "Mural + ranking da turma", desc: "Peer review, mural de conquistas, ranking semanal",                 accent: "#10B981" },
    { icon: Shield,     title: "Prioridade no suporte",   desc: "Dúvidas respondidas pelo URA pessoalmente",                          accent: "#EC4899" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/15 bg-[#0e0e10]">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-brand-500/[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_50%_at_60%_20%,#000_40%,transparent_100%)]" />
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <Flame className="w-4 h-4 text-brand-500 fill-brand-500" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-500">Upgrade para Elite</span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold text-white tracking-tight leading-tight max-w-2xl">
            Essa área é <span className="text-brand-500">Elite</span>.
          </h1>
          <p className="text-[14px] md:text-[15px] text-white/50 mt-3 max-w-xl leading-relaxed">
            Você tem acesso às aulas gravadas como VIP. Pra entrar nas calls ao vivo, treinos e comunidade da turma, faz o upgrade pra Elite.
          </p>

          <div className="flex items-center gap-3 mt-7 flex-wrap">
            <a
              href="https://uralabs.com.br/elite"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white text-[14px] font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-500/20"
            >
              <Zap className="w-4 h-4 fill-white" />
              Fazer upgrade pra Elite
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link href="/elite/aulas" className="text-[13px] text-white/40 hover:text-white/70 transition-colors font-medium">
              Voltar pras aulas
            </Link>
          </div>
        </div>
      </div>

      {/* What Elite unlocks */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-5 rounded-full bg-brand-500/60" />
          <h2 className="text-[16px] font-bold text-white tracking-tight">O que Elite destrava</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eliteFeatures.map((f, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] p-5 hover:border-white/[0.12] transition-all">
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${f.accent}35, transparent)` }} />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: f.accent + "15", border: `1px solid ${f.accent}25` }}>
                  <f.icon className="w-4 h-4" style={{ color: f.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white/90 mb-0.5">{f.title}</p>
                  <p className="text-[12px] text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.04]">
          <h2 className="text-[13px] font-bold text-white/85">VIP × Elite</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { label: "Aulas gravadas (currículo SMC completo)",    vip: true,  elite: true },
            { label: "Quiz por aula + flashcards",                 vip: true,  elite: true },
            { label: "PDFs + materiais de apoio",                  vip: true,  elite: true },
            { label: "Dashboard + progresso pessoal",              vip: true,  elite: true },
            { label: "Mural, turma e ranking (visualizar)",        vip: true,  elite: true },
            { label: "Conquistas + skill tree",                    vip: true,  elite: true },
            { label: "Calls ao vivo diárias com o URA",            vip: false, elite: true },
            { label: "Aulas de mesa prop (FundingPips, TopStep…)", vip: false, elite: true },
            { label: "Treinos livres (121+ cenários)",             vip: false, elite: true },
            { label: "Corretora conectada (PnL automático)",       vip: false, elite: true },
            { label: "Peer review + publicar na turma",            vip: false, elite: true },
            { label: "Submeter conquistas (payout, mesa)",         vip: false, elite: true },
            { label: "Suporte direto com URA",                     vip: false, elite: true },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_80px] items-center gap-3 px-5 py-2.5">
              <span className="text-[12.5px] text-white/65">{row.label}</span>
              <span className="text-center">
                {row.vip ? <Check className="w-4 h-4 text-blue-400/80 mx-auto" /> : <span className="text-white/20 text-[11px]">—</span>}
              </span>
              <span className="text-center">
                {row.elite ? <Check className="w-4 h-4 text-brand-500 mx-auto" /> : <span className="text-white/20 text-[11px]">—</span>}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_80px_80px] items-center gap-3 px-5 py-3 bg-white/[0.02]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">Plano</span>
            <span className="text-center text-[11px] font-bold text-blue-400/80 uppercase tracking-wider">VIP</span>
            <span className="text-center text-[11px] font-bold text-brand-500 uppercase tracking-wider">Elite</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <a
          href="https://uralabs.com.br/elite"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] text-brand-500 hover:brightness-125 transition-all font-semibold"
        >
          Ver planos e fazer upgrade
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
