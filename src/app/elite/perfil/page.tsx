import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { PersonalizationSection } from "@/components/elite/PersonalizationSection";
import { CosmeticBanner } from "@/components/elite/CosmeticBanner";
import { getUserState } from "@/lib/ura-coin";

// Slug check inline pra evitar importar função de module "use client"
// num server component — erro "Attempted to call isBannerSlug() from the server".
const BANNER_SLUGS = new Set([
  // Batch 1
  "diamond-hands", "o-sol-bull", "a-torre-flash", "a-temperanca-rr",
  // Batch 2
  "o-louco-yolo", "a-imperatriz-liquidez", "a-morte-cycle",
  "vegas-lambo",
  "crypto-monastery", "phoenix-rebirth", "dragon-gold",
  "neural-net", "cyber-samurai", "hologram-chart", "matrix-throne",
  "smoke-mirrors", "warrior-king-bull",
  // Batch 3
  "favela-3am", "saci-degen", "copacabana-cyber", "capoeira-bull-vs-bear",
  "leao-dourado", "tigre-neon", "aguia-mercado", "orca-apex",
  "ampulheta-bitcoin", "dojo-samurai",
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
          href={`/cosmetics/banners/${equippedBannerSlug}.webp?v=6x1b`}
          fetchPriority="high"
        />
      )}
      {/* ── Profile header ── banner 6:1 nativo (2400×400), preenche toda a
           largura do container. Safe zone de 70% central garantida nos prompts
           v3, então cover crop nas laterais (quando tiver) nunca perde subject. */}
      <div className="animate-in-up relative overflow-hidden rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 w-full">
        {/* Header com banner + avatar/nome sobrepostos */}
        <div
          className="relative overflow-hidden border-b border-white/[0.05]"
          style={{ aspectRatio: "6 / 1" }}
        >
          {hasBanner ? (
            <>
              <CosmeticBanner slug={equippedBannerSlug} variant="full" />
              {/* Vignette horizontal — fade forte pros cantos p/ transição
                  imperceptível com o bg da página. */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to right, #0e0e10 0%, rgba(14,14,16,0.9) 6%, rgba(14,14,16,0.3) 18%, rgba(14,14,16,0) 34%, rgba(14,14,16,0) 66%, rgba(14,14,16,0.3) 82%, rgba(14,14,16,0.9) 94%, #0e0e10 100%)",
              }} />
              {/* Vignette vertical sutil no topo — suaviza a borda superior. */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, rgba(14,14,16,0.35) 0%, rgba(14,14,16,0) 22%, rgba(14,14,16,0) 100%)",
              }} />
              {/* Fade inferior pra nome/avatar lerem + radial atrás do avatar */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, rgba(14,14,16,0) 0%, rgba(14,14,16,0.12) 55%, rgba(14,14,16,0.5) 85%, rgba(14,14,16,0.85) 100%)",
              }} />
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse 30% 55% at 12% 85%, rgba(0,0,0,0.6), transparent 70%)",
              }} />
            </>
          ) : (
            <div className="absolute inset-0 bg-[#131316]" />
          )}

          {/* Avatar + nome sobrepostos na base */}
          <div className="absolute inset-0 flex items-end p-7 gap-5">
            <div className="shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt={displayName}
                className="w-24 h-24 rounded-xl object-cover"
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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-500">
              <span className="w-1 h-1 rounded-full bg-brand-500" /> Elite 4.0
            </span>
          ) : session.isVip ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/55">
              <span className="w-1 h-1 rounded-full bg-white/55" /> VIP
            </span>
          ) : null}
        </div>

      </div>

      {/* ── Personalização (cosméticos) ── */}
      <div className="animate-in-up delay-1"><PersonalizationSection /></div>
    </div>
  );
}
