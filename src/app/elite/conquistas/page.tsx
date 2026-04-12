import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Rarity = "legendary" | "rare" | "uncommon" | "common";

type Badge = {
  id: string;
  name: string;
  desc: string;
  image: string;
  unlocked: boolean;
  hasPlaque?: boolean;
  rarity: Rarity;
};

const BADGES = {
  og: [
    { id: "elite-member", name: "Elite Member", desc: "Entrou na mentoria Elite", image: "/badges/badge-elite-member.png", unlocked: false, hasPlaque: true, rarity: "legendary" as Rarity },
    { id: "og-10", name: "OG 1.0", desc: "Fundador turma 1.0", image: "/badges/badge-og-10.png", unlocked: false, hasPlaque: true, rarity: "legendary" as Rarity },
    { id: "og-20", name: "OG 2.0", desc: "Membro turma 2.0", image: "/badges/badge-og-20.png", unlocked: false, hasPlaque: true, rarity: "legendary" as Rarity },
    { id: "og-30", name: "OG 3.0", desc: "Membro turma 3.0", image: "/badges/badge-og-30.png", unlocked: false, hasPlaque: true, rarity: "legendary" as Rarity },
  ],
  trading: [
    { id: "first-payout", name: "First Payout", desc: "Primeiro saque de mesa funded", image: "/badges/badge-first-payout.png", unlocked: false, hasPlaque: true, rarity: "rare" as Rarity },
    { id: "mesa-approved", name: "Mesa Aprovada", desc: "Aprovado em prop firm", image: "/badges/badge-mesa-approved.png", unlocked: false, rarity: "rare" as Rarity },
    { id: "verde-7", name: "7 No Verde", desc: "7 dias consecutivos no verde", image: "/badges/badge-verde-7.png", unlocked: false, rarity: "uncommon" as Rarity },
  ],
  academic: [
    { id: "first-lesson", name: "Primeira Aula", desc: "Completou a primeira aula", image: "/badges/badge-primeira-aula.png", unlocked: false, rarity: "common" as Rarity },
    { id: "module-complete", name: "Módulo Completo", desc: "Completou um módulo inteiro", image: "/badges/badge-modulo-completo.png", unlocked: false, rarity: "uncommon" as Rarity },
    { id: "quiz-master", name: "Quiz Master", desc: "Gabaritou um quiz", image: "/badges/badge-quiz-master.png", unlocked: false, rarity: "uncommon" as Rarity },
    { id: "all-lessons", name: "Estudante Dedicado", desc: "Todas as aulas completas", image: "/badges/badge-estudante-dedicado.png", unlocked: false, rarity: "rare" as Rarity },
  ],
  community: [
    { id: "presenca-ferro", name: "Presença de Ferro", desc: "90%+ presença nas calls", image: "/badges/badge-presenca-ferro.png", unlocked: false, rarity: "uncommon" as Rarity },
    { id: "professor", name: "Professor", desc: "Ajudou 5+ membros", image: "/badges/badge-professor.png", unlocked: false, rarity: "rare" as Rarity },
    { id: "check-in-30", name: "Check-in Master", desc: "30 check-ins consecutivos", image: "/badges/badge-checkin-master.png", unlocked: false, rarity: "rare" as Rarity },
  ],
};

const RARITY = {
  legendary: { label: "Lendária", color: "text-yellow-400", dot: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]", border: "border-yellow-500/25", hoverBorder: "hover:border-yellow-500/50", glow: "shadow-[0_0_40px_rgba(250,204,21,0.08)]", hoverGlow: "hover:shadow-[0_0_60px_rgba(250,204,21,0.18)]" },
  rare: { label: "Rara", color: "text-blue-400", dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]", border: "border-blue-500/15", hoverBorder: "hover:border-blue-500/35", glow: "", hoverGlow: "hover:shadow-[0_0_30px_rgba(96,165,250,0.1)]" },
  uncommon: { label: "Incomum", color: "text-emerald-400", dot: "bg-emerald-400/70", border: "border-white/[0.05]", hoverBorder: "hover:border-emerald-500/25", glow: "", hoverGlow: "" },
  common: { label: "Comum", color: "text-white/30", dot: "bg-white/25", border: "border-white/[0.04]", hoverBorder: "hover:border-white/[0.1]", glow: "", hoverGlow: "" },
};

const SECTIONS = [
  { key: "og" as const, title: "Edição Limitada", sub: "Exclusivas por turma — nunca mais emitidas", legendary: true },
  { key: "trading" as const, title: "Trading", sub: "Resultados reais no mercado" },
  { key: "academic" as const, title: "Acadêmicas", sub: "Progresso nas aulas" },
  { key: "community" as const, title: "Comunidade", sub: "Engajamento e presença" },
];

function BadgeCard({ badge, large }: { badge: Badge; large?: boolean }) {
  const r = RARITY[badge.rarity];
  const imgSize = large ? 200 : 150;

  const content = (
    <div className={`group relative rounded-2xl border bg-[#0a0d15] transition-all duration-500 overflow-hidden ${
      badge.unlocked
        ? `${r.border} ${r.hoverBorder} ${r.glow} ${r.hoverGlow} hover:-translate-y-1.5`
        : "border-white/[0.03]"
    }`}>
      {/* Legendary: animated gradient shimmer on top edge */}
      {badge.rarity === "legendary" && badge.unlocked && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent animate-pulse-slow" />
      )}

      {/* Plaque — text label, not icon */}
      {badge.hasPlaque && badge.unlocked && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/15">
          <span className="text-[8px] font-bold text-yellow-500/60 uppercase tracking-wider">Plaquinha</span>
        </div>
      )}

      <div className={`relative z-10 flex ${large ? "flex-row items-center gap-8 p-7" : "flex-col items-center p-5 pt-7"}`}>
        {/* Badge image */}
        <div className={`relative shrink-0 transition-transform duration-700 ease-out ${badge.unlocked ? "group-hover:scale-[1.08]" : ""}`}>
          {badge.unlocked ? (
            <Image
              src={badge.image}
              alt={badge.name}
              width={imgSize}
              height={imgSize}
              className="object-contain"
              style={{ width: imgSize, height: imgSize }}
            />
          ) : (
            <div className="relative" style={{ width: imgSize, height: imgSize }}>
              <Image
                src={badge.image}
                alt={badge.name}
                width={imgSize}
                height={imgSize}
                className="object-contain opacity-[0.04] grayscale"
                style={{ width: imgSize, height: imgSize }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white/[0.08]" />
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        <div className={large ? "flex-1" : "text-center mt-4"}>
          {/* Rarity label */}
          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${badge.unlocked ? r.color : "text-white/10"} block ${large ? "mb-1.5" : "mb-1"}`}>
            {r.label}
          </span>

          <h4 className={`font-bold tracking-tight ${badge.unlocked ? "text-white" : "text-white/[0.08]"} ${large ? "text-[22px] mb-2" : "text-[14px] mb-1"}`}>
            {badge.name}
          </h4>

          <p className={`leading-relaxed ${badge.unlocked ? "text-white/50" : "text-white/[0.05]"} ${large ? "text-[13px]" : "text-[11px]"}`}>
            {badge.desc}
          </p>

          {badge.unlocked && large && (
            <span className="inline-block mt-4 text-[11px] text-white/20 group-hover:text-white/40 transition-colors">
              Ver detalhes →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (badge.unlocked) {
    return <Link href={`/elite/conquistas/${badge.id}`} className="block">{content}</Link>;
  }
  return content;
}

export default function ConquistasPage() {
  const allBadges = Object.values(BADGES).flat();
  const unlocked = allBadges.filter((b) => b.unlocked).length;
  const plaques = allBadges.filter((b) => "hasPlaque" in b && b.hasPlaque).length;

  return (
    <div className="space-y-12">
      {/* ── Header — atmospheric ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0a0d15] border border-white/[0.06]">
        {/* Atmospheric glows */}
        <div className="absolute top-[-50%] left-[20%] w-[600px] h-[400px] bg-yellow-500/[0.04] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[10%] w-[400px] h-[300px] bg-brand-500/[0.04] blur-[120px] pointer-events-none" />

        <div className="relative z-10 p-10">
          {/* Title area */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-8">
            <div>
              <h1 className="text-[40px] font-bold text-white tracking-tight leading-none">
                Suas Conquistas
              </h1>
              <p className="text-[14px] text-white/40 mt-3 max-w-md">
                Cada badge conta uma história. As mais raras brilham — literalmente.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[42px] font-bold text-white leading-none tracking-tight">{unlocked}</p>
                <p className="text-[12px] text-white/25 mt-1">de {allBadges.length} badges</p>
              </div>
              <div className="w-px h-14 bg-white/[0.06]" />
              <div>
                <p className="text-[42px] font-bold text-yellow-400/80 leading-none tracking-tight">{plaques}</p>
                <p className="text-[12px] text-yellow-500/30 mt-1">plaquinhas físicas</p>
              </div>
            </div>
          </div>

          {/* Rarity legend — inline, clean */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/[0.04]">
            {(["legendary", "rare", "uncommon", "common"] as Rarity[]).map((r) => (
              <div key={r} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${RARITY[r].dot}`} />
                <span className={`text-[11px] font-medium ${RARITY[r].color}`}>{RARITY[r].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Badge sections ── */}
      {SECTIONS.map((section) => {
        const badges = BADGES[section.key];
        const isLegendary = "legendary" in section && section.legendary;

        return (
          <div key={section.key}>
            {/* Section header */}
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-white/90">{section.title}</h2>
              <p className="text-[12px] text-white/25 mt-0.5">{section.sub}</p>
            </div>

            {/* Grid */}
            <div className={
              isLegendary
                ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            }>
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} large={isLegendary} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
