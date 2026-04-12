import { Badge3DViewer } from "@/components/elite/Badge3DViewer";
import { ArrowLeft, Package, Calendar } from "lucide-react";
import Link from "next/link";

const BADGE_DATA: Record<string, { name: string; desc: string; image: string; accent: string; category: string; hasPlaque?: boolean; rarity: string }> = {
  "elite-member": { name: "Elite Member", desc: "Entrou na mentoria Elite. Você faz parte de um grupo seleto de traders que decidiram levar a profissão a sério.", image: "/badges/badge-elite-member.png", accent: "#FF5500", category: "Edição Limitada", hasPlaque: true, rarity: "Exclusiva" },
  "og-10": { name: "OG 1.0", desc: "Membro fundador da turma 1.0. Os primeiros a acreditar no projeto. Edição limitada, nunca mais emitida.", image: "/badges/badge-og-10.png", accent: "#FF5500", category: "Edição Limitada", hasPlaque: true, rarity: "Lendária" },
  "og-20": { name: "OG 2.0", desc: "Membro da turma 2.0. Segunda geração de traders Elite.", image: "/badges/badge-og-20.png", accent: "#FF5500", category: "Edição Limitada", hasPlaque: true, rarity: "Lendária" },
  "og-30": { name: "OG 3.0", desc: "Membro da turma 3.0. Terceira geração de traders Elite.", image: "/badges/badge-og-30.png", accent: "#FF5500", category: "Edição Limitada", hasPlaque: true, rarity: "Lendária" },
  "first-payout": { name: "First Payout", desc: "Recebeu o primeiro saque de uma mesa proprietária. Prova real de que o método funciona quando aplicado com disciplina.", image: "/badges/badge-first-payout.png", accent: "#C9A84C", category: "Trading", hasPlaque: true, rarity: "Rara" },
  "mesa-approved": { name: "Mesa Aprovada", desc: "Aprovado em uma mesa proprietária durante a mentoria. A técnica venceu.", image: "/badges/badge-mesa-approved.png", accent: "#10B981", category: "Trading", rarity: "Rara" },
  "verde-7": { name: "7 No Verde", desc: "7 dias consecutivos no verde. Consistência comprovada.", image: "/badges/badge-verde-7.png", accent: "#10B981", category: "Trading", rarity: "Incomum" },
  "first-lesson": { name: "Primeira Aula", desc: "Completou a primeira aula. O primeiro passo da jornada.", image: "/badges/badge-primeira-aula.png", accent: "#06B6D4", category: "Acadêmica", rarity: "Comum" },
  "module-complete": { name: "Módulo Completo", desc: "Completou um módulo inteiro do currículo Elite.", image: "/badges/badge-modulo-completo.png", accent: "#A855F7", category: "Acadêmica", rarity: "Incomum" },
  "quiz-master": { name: "Quiz Master", desc: "Acertou 100% em um quiz de módulo. Domínio técnico comprovado.", image: "/badges/badge-quiz-master.png", accent: "#3B82F6", category: "Acadêmica", rarity: "Incomum" },
  "all-lessons": { name: "Estudante Dedicado", desc: "Assistiu todas as aulas do currículo. Conhecimento completo.", image: "/badges/badge-estudante-dedicado.png", accent: "#14B8A6", category: "Acadêmica", rarity: "Rara" },
  "presenca-ferro": { name: "Presença de Ferro", desc: "Participou de 90%+ das calls no mês. Consistência é o que separa amadores de profissionais.", image: "/badges/badge-presenca-ferro.png", accent: "#FF3300", category: "Comunidade", rarity: "Incomum" },
  "professor": { name: "Professor", desc: "Ajudou 5+ membros no Discord. Líder natural da comunidade.", image: "/badges/badge-professor.png", accent: "#E5E5E5", category: "Comunidade", rarity: "Rara" },
  "check-in-30": { name: "Check-in Master", desc: "30 check-ins semanais consecutivos. Disciplina inabalável.", image: "/badges/badge-checkin-master.png", accent: "#F59E0B", category: "Comunidade", rarity: "Rara" },
};

export default async function BadgeDetailPage({ params }: { params: Promise<{ badgeId: string }> }) {
  const { badgeId } = await params;
  const badge = BADGE_DATA[badgeId];

  if (!badge) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white/30">Badge não encontrada</p>
        <Link href="/elite/conquistas" className="text-brand-500 text-sm mt-4">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/elite/conquistas" className="inline-flex items-center gap-2 text-[12px] text-white/25 hover:text-white/50 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Conquistas
      </Link>

      {/* 3D Badge viewer */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: badge.accent, opacity: 0.06 }} />

        <div className="relative z-10 flex flex-col items-center py-10">
          <Badge3DViewer
            textureUrl={badge.image}
            accentColor={badge.accent}
            name={badge.name}
            size={380}
          />
          <p className="text-[10px] text-white/15 mt-4">Mova o mouse para inclinar · Clique para virar</p>
        </div>
      </div>

      {/* Badge info */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#080b14] p-7">
        <h1 className="text-[22px] font-bold text-white tracking-tight">{badge.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">{badge.category}</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: badge.accent, opacity: 0.6 }}>{badge.rarity}</span>
        </div>

        <p className="text-[13px] text-white/35 leading-relaxed mt-4">{badge.desc}</p>

        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-white/15" />
            <span className="text-[11px] text-white/20">Desbloqueada em —</span>
          </div>
          {badge.hasPlaque && (
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-yellow-500/30" />
              <span className="text-[11px] text-yellow-500/40">Inclui plaquinha física</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
