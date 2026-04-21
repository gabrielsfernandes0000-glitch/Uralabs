import { ArrowLeft, Sparkles, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { ACHIEVEMENTS, CATEGORY_META, RARITY_META } from "@/lib/achievements";
import { AchievementBadge } from "@/components/elite/AchievementBadge";

export default async function BadgeDetailPage({ params }: { params: Promise<{ badgeId: string }> }) {
  const { badgeId } = await params;
  const achievement = ACHIEVEMENTS[badgeId];

  if (!achievement) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white/30">Badge não encontrada</p>
        <Link href="/elite/conquistas" className="text-brand-500 text-sm mt-4">Voltar</Link>
      </div>
    );
  }

  const rarity = RARITY_META[achievement.rarity];
  const category = CATEGORY_META[achievement.category];
  const isLegendary = achievement.rarity === "legendary";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/elite/conquistas" className="inline-flex items-center gap-2 text-[12px] text-white/25 hover:text-white/50 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Conquistas
      </Link>

      {/* Hero badge — large render */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full blur-[100px] pointer-events-none" style={{
          backgroundColor: isLegendary ? "#FF5500" : achievement.rarity === "gold" ? "#F59E0B" : achievement.rarity === "silver" ? "#CBD5E1" : "#C4833F",
          opacity: isLegendary ? 0.10 : 0.05,
        }} />
        {isLegendary && (
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: "linear-gradient(90deg, transparent, rgba(255,85,0,0.7), transparent)",
          }} />
        )}
        <div className="relative z-10 flex flex-col items-center py-12">
          <AchievementBadge achievement={achievement} size={240} />
          <span className={`mt-6 text-[10px] font-bold tracking-[0.25em] uppercase ${rarity.className}`}>
            {rarity.label}
          </span>
          <h1 className="text-[28px] md:text-[32px] font-bold text-white tracking-tight mt-1.5 text-center px-6">
            {achievement.label}
          </h1>
          <p className="text-[13px] text-white/40 mt-2 text-center max-w-md px-6">{achievement.detail}</p>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-5">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">Categoria</p>
          <p className="text-[14px] text-white/80 font-bold">{category.label}</p>
          <p className="text-[11px] text-white/35 mt-1 leading-relaxed">{category.sub}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-5">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">Raridade</p>
          <p className={`text-[14px] font-bold ${rarity.className}`}>{rarity.label}</p>
          <p className="text-[11px] text-white/35 mt-1">
            {isLegendary ? "Edição limitada · nunca mais emitida" : "Emissão contínua"}
          </p>
        </div>
      </div>

      {/* Distribution rules */}
      <div className="rounded-2xl bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-3">
          {achievement.autoDistribute ? (
            <>
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              <h3 className="text-[12px] font-bold text-white/85 uppercase tracking-wider">Distribuição automática</h3>
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5 text-yellow-500/70" />
              <h3 className="text-[12px] font-bold text-white/85 uppercase tracking-wider">Validação manual</h3>
            </>
          )}
        </div>
        <p className="text-[12.5px] text-white/55 leading-relaxed">
          {achievement.autoDistribute ? (
            <>
              A plataforma libera essa badge automaticamente quando você cumpre os requisitos.
              Fica registrada no seu perfil assim que o progresso bate no threshold — sem precisar pedir.
            </>
          ) : achievement.category === "og" ? (
            <>
              Edição limitada da turma. Distribuída pelo URA quando você entra na turma correspondente.
              Não é possível conquistar retroativamente.
            </>
          ) : achievement.category === "trading" ? (
            <>
              Requer comprovante (print do painel da mesa ou email de payout). URA valida manualmente
              antes da badge ficar pública no seu perfil.
            </>
          ) : (
            <>
              Reconhecimento concedido pelo URA com base na sua atuação na comunidade.
            </>
          )}
        </p>
      </div>

      {/* Footer hint */}
      <p className="text-center text-[10.5px] text-white/25 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        {achievement.autoDistribute
          ? "Continue acompanhando seu progresso pra desbloquear mais."
          : "Quando conquistar, submeta no Mural da Turma pra validação."}
      </p>
    </div>
  );
}
