import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Calendar, Trophy, Flame, Target, BookOpen, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PersonalizationSection } from "@/components/elite/PersonalizationSection";
import { CosmeticBanner } from "@/components/elite/CosmeticBanner";
import { getUserState } from "@/lib/ura-coin";

// Slug check inline pra evitar importar função de module "use client"
// num server component — erro "Attempted to call isBannerSlug() from the server".
const BANNER_SLUGS = new Set([
  // Batch 1
  "diamond-hands", "o-sol-bull", "a-torre-flash", "a-temperanca-rr",
  // Batch 2
  "o-louco-yolo", "a-imperatriz-liquidez", "o-eremita-paciencia", "a-morte-cycle",
  "mesa-trader", "whale-alert", "vegas-lambo",
  "wolfpack-alpha", "crypto-monastery", "phoenix-rebirth", "dragon-gold",
  "neural-net", "cyber-samurai", "hologram-chart", "matrix-throne",
  "golden-gates", "smoke-mirrors", "warrior-king-bull",
]);

export default async function PerfilPage() {
  const session = (await getSession())!;
  const avatar = avatarUrl(session.userId, session.avatar, 256);
  const displayName = session.globalName || session.username;

  // Banner equipado do próprio user — server side pra evitar flash.
  let equippedBannerSlug: string | null = null;
  try {
    const state = await getUserState(session.userId, 0);
    equippedBannerSlug = state.cosmetics.banner?.prize_slug ?? null;
  } catch {
    equippedBannerSlug = null;
  }
  const hasBanner = !!equippedBannerSlug && BANNER_SLUGS.has(equippedBannerSlug);

  return (
    <div className="space-y-6">
      {/* Preload do banner — server component já sabe o slug, então dispara o
          fetch da imagem em paralelo com o HTML (LCP -200-500ms). */}
      {hasBanner && (
        <link
          rel="preload"
          as="image"
          href={`/cosmetics/banners/${equippedBannerSlug}.webp`}
          fetchPriority="high"
        />
      )}
      {/* ── Profile header ── banner na proporção nativa 7:2 pra nunca cortar
           nem deixar borda. Max-w 1008px porque esse é o limite onde o banner
           cabe em altura 288px (nossa âncora visual). Acima disso, banner
           fica centralizado; abaixo, preenche width e altura escala. */}
      <div className="animate-in-up relative overflow-hidden rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
        {/* Header com banner + avatar/nome sobrepostos */}
        <div
          className="relative overflow-hidden border-b border-white/[0.05] mx-auto"
          style={{ aspectRatio: "7 / 2", maxWidth: "1008px", width: "100%" }}
        >
          {hasBanner ? (
            <>
              <CosmeticBanner slug={equippedBannerSlug} variant="full" />
              {/* Fade inferior pra nome/avatar lerem + radial atrás do avatar */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, rgba(14,14,16,0) 0%, rgba(14,14,16,0.12) 55%, rgba(14,14,16,0.5) 85%, rgba(14,14,16,0.85) 100%)",
              }} />
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse 30% 55% at 12% 85%, rgba(0,0,0,0.6), transparent 70%)",
              }} />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-purple-500/5 to-blue-500/10" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-60" />
            </>
          )}

          {/* Avatar + nome sobrepostos na base */}
          <div className="absolute inset-0 flex items-end p-7 gap-5">
            <div className="shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover"
                style={{
                  border: "2px solid #141417",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.55), 0 8px 32px 8px rgba(0,0,0,0.7)",
                }}
              />
            </div>
            <div className="pb-1 min-w-0">
              <h1 className="text-[22px] font-bold text-white tracking-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">{displayName}</h1>
              <p className="text-[13px] text-white/55 truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">@{session.username}</p>
            </div>
          </div>
        </div>

        {/* Strip tier + info */}
        <div className="px-7 py-2.5 border-b border-white/[0.05] bg-[#0e0e10] flex items-center gap-3 flex-wrap">
          {session.isElite ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-500 uppercase tracking-[0.22em]">
              <span className="w-1 h-1 rounded-full bg-brand-500" /> Elite 4.0
            </span>
          ) : session.isVip ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-[0.22em]">
              <span className="w-1 h-1 rounded-full bg-blue-400" /> VIP
            </span>
          ) : null}
        </div>

        {/* Stats 4-up */}
        <div className="p-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: "Turma", value: "4.0", color: "#ffffff" },
              { icon: BookOpen, label: "Aulas", value: "0/17", color: "#ffffff" },
              { icon: Trophy, label: "Badges", value: "0", color: "#ffffff" },
              { icon: Flame, label: "Streak", value: "0 dias", color: "#ffffff" },
            ].map((s, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] p-4 hover:border-white/[0.10] transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${s.color}20, transparent)` }} />
                <s.icon className="w-4 h-4 mb-2.5" style={{ color: s.color + "60" }} />
                <p className="text-[18px] font-bold text-white leading-none">{s.value}</p>
                <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Goal ── */}
      <div className="animate-in-up delay-1 relative overflow-hidden rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/[0.02] to-transparent" />

        <div className="relative z-10 p-7">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-4 h-4 text-green-500/50" />
            <h2 className="text-[14px] font-semibold text-white/80">Meta do Semestre</h2>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-white/20" />
            </div>
            <p className="text-[13px] text-white/30 mb-1">Nenhuma meta definida</p>
            <p className="text-[11px] text-white/30 mb-5 max-w-xs text-center">
              Ex: &quot;Aprovar mesa $25k&quot; · &quot;3 semanas no verde&quot;
            </p>
            <button className="interactive-tap inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/50 font-medium hover:text-green-500 hover:border-green-500/20 transition-all">
              <Zap className="w-3.5 h-3.5" />
              Definir Meta
            </button>
          </div>
        </div>
      </div>

      {/* ── Personalização (cosméticos) ── */}
      <div className="animate-in-up delay-2"><PersonalizationSection /></div>

      {/* ── Badges showcase ── */}
      <div className="animate-in-up delay-3 relative overflow-hidden rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
        <div className="relative z-10 p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-yellow-500/50" />
              <h2 className="text-[14px] font-semibold text-white/80">Badges</h2>
            </div>
            <Link href="/elite/conquistas" className="text-[11px] text-white/30 hover:text-brand-500 transition-colors flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col items-center py-8">
            <div className="flex gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-11 h-11 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.04]" />
              ))}
            </div>
            <p className="text-[12px] text-white/30">Complete aulas para desbloquear</p>
          </div>
        </div>
      </div>
    </div>
  );
}
