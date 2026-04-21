"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Palette, Check, Loader2, Lock, AlertCircle } from "lucide-react";
import { CosmeticBanner, isBannerSlug } from "./CosmeticBanner";
import { AvatarWithCosmetics, normalizeFrameSlug, normalizeAuraSlug } from "./AvatarCosmetics";

interface OwnedCosmetic {
  cosmetic_id: string;
  cosmetic_type: "banner" | "avatar_frame" | "avatar_effect";
  prize_id: string;
  prize_slug: string;
  prize_name: string;
  prize_rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  metadata: Record<string, unknown>;
  acquired_at: string;
  equipped: boolean;
}

const RARITY_META: Record<OwnedCosmetic["prize_rarity"], { label: string; className: string; ring: string }> = {
  common:    { label: "Comum",    className: "text-white/50",    ring: "#52525b" },
  uncommon:  { label: "Incomum",  className: "text-emerald-400", ring: "#10b981" },
  rare:      { label: "Raro",     className: "text-sky-400",     ring: "#38bdf8" },
  epic:      { label: "Épico",    className: "text-purple-400",  ring: "#a855f7" },
  legendary: { label: "Lendário", className: "text-amber-400",   ring: "#f59e0b" },
};

const TYPE_META: Record<OwnedCosmetic["cosmetic_type"], { label: string; description: string }> = {
  banner:         { label: "Banners",          description: "Fundo animado do seu perfil. Aparece no modal, sidebar e cards dos membros." },
  avatar_frame:   { label: "Molduras de avatar", description: "Decoração SVG acima/ao redor do avatar — chifres, coroa, asas, halo." },
  avatar_effect:  { label: "Auras de avatar",   description: "Efeito luminoso pulsando atrás do avatar — fogo, raios, cosmos." },
};

const SAMPLE_AVATAR = "/favicon.ico";

export function PersonalizationSection() {
  const router = useRouter();
  const [items, setItems] = useState<OwnedCosmetic[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [equipError, setEquipError] = useState<string | null>(null);
  const [equipSuccess, setEquipSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => { refetch(); }, []);

  async function refetch() {
    try {
      const res = await fetch("/api/cosmetics", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { cosmetics: OwnedCosmetic[] };
      setItems(data.cosmetics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "erro ao carregar");
    }
  }

  function equip(cosmeticId: string) {
    setPendingId(cosmeticId);
    setEquipError(null);
    setEquipSuccess(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/cosmetics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cosmetic_id: cosmeticId }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error ?? `HTTP ${res.status}`);
        const equipped = items?.find((i) => i.cosmetic_id === cosmeticId);
        setEquipSuccess(`${equipped?.prize_name ?? "Cosmético"} equipado`);
        setTimeout(() => setEquipSuccess(null), 3000);
        await refetch();
        // Força re-render do layout (server component) pro sidebar pegar o novo cosmético equipado
        router.refresh();
      } catch (e) {
        setEquipError(e instanceof Error ? e.message : "erro ao equipar");
        setTimeout(() => setEquipError(null), 5000);
      } finally {
        setPendingId(null);
      }
    });
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-6">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-4 h-4 text-brand-500/60" />
          <h2 className="text-[14px] font-semibold text-white/80">Personalização</h2>
        </div>
        <p className="text-[12px] text-white/40">Erro ao carregar: {error}</p>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-4 h-4 text-brand-500/60" />
          <h2 className="text-[14px] font-semibold text-white/80">Personalização</h2>
        </div>
        <div className="flex items-center gap-2 text-white/30">
          <Loader2 className="w-4 h-4 animate-spin" /> <span className="text-[12px]">Carregando cosméticos…</span>
        </div>
      </div>
    );
  }

  const byType: Record<OwnedCosmetic["cosmetic_type"], OwnedCosmetic[]> = {
    banner: items.filter((i) => i.cosmetic_type === "banner"),
    avatar_frame: items.filter((i) => i.cosmetic_type === "avatar_frame"),
    avatar_effect: items.filter((i) => i.cosmetic_type === "avatar_effect"),
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-7 space-y-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-brand-500/60" />
          <h2 className="text-[14px] font-semibold text-white/80">Personalização</h2>
          <span className="text-[10px] text-white/30 italic hidden md:inline">passe o mouse no card pra ver a animação</span>
        </div>
        <span className="text-[10px] text-white/35 font-mono">{items.length} owned</span>
      </div>

      {equipError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-[12px] text-red-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          Falha ao equipar: {equipError}
        </div>
      )}
      {equipSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 px-3 py-2 text-[12px] text-emerald-300">
          <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          {equipSuccess}
        </div>
      )}

      {(["banner", "avatar_frame", "avatar_effect"] as const).map((type) => {
        const meta = TYPE_META[type];
        const list = byType[type];
        return (
          <div key={type} className="space-y-3">
            <div>
              <h3 className="text-[13px] font-bold text-white/85">{meta.label}</h3>
              <p className="text-[11px] text-white/35 mt-0.5">{meta.description}</p>
            </div>
            {list.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] py-8 text-center">
                <Lock className="w-4 h-4 text-white/20 mx-auto mb-2" />
                <p className="text-[11px] text-white/30">Nenhum ainda. Abre caixas na <a className="text-brand-500/70 hover:text-brand-500" href="/elite/loja">Loja</a> pra conseguir.</p>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                style={{
                  // Browser pula render de cards fora do viewport. Reserva 180px
                  // por card (altura real ~160px + gap) pra scrollbar não pular
                  // quando o grid ultrapassar ~40 itens.
                  contentVisibility: "auto",
                  containIntrinsicSize: "180px",
                }}
              >
                {list.map((c) => (
                  <CosmeticCard
                    key={c.cosmetic_id}
                    cosmetic={c}
                    type={type}
                    onEquip={() => equip(c.cosmetic_id)}
                    pending={pending && pendingId === c.cosmetic_id}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Cache global pra não disparar prefetch duplicado no mesmo slug —
// hover em cima de 10 cards diferentes = 10 prefetches, sem repetir.
const prefetchedFulls = new Set<string>();

function prefetchFull(slug: string) {
  if (prefetchedFulls.has(slug)) return;
  prefetchedFulls.add(slug);
  const img = new Image();
  img.src = `/cosmetics/banners/${slug}.webp`;
}

function CosmeticCard({
  cosmetic, type, onEquip, pending,
}: {
  cosmetic: OwnedCosmetic;
  type: OwnedCosmetic["cosmetic_type"];
  onEquip: () => void;
  pending: boolean;
}) {
  const rarity = RARITY_META[cosmetic.prize_rarity];

  // Decide preview content based on type
  const bannerOK = type === "banner" && isBannerSlug(cosmetic.prize_slug);
  const frameSlug = type === "avatar_frame" ? normalizeFrameSlug(cosmetic.prize_slug) : null;
  const auraSlug = type === "avatar_effect" ? normalizeAuraSlug(cosmetic.prize_slug) : null;

  // Prefetch full do banner no hover — quando URA equipar e for pro /perfil,
  // o full já tá cacheado no browser.
  const onPointerEnter = bannerOK ? () => prefetchFull(cosmetic.prize_slug) : undefined;

  return (
    <div
      onPointerEnter={onPointerEnter}
      className={`group relative overflow-hidden rounded-xl border bg-[#0e0e10] transition-all duration-200 ${
        cosmetic.equipped ? "border-brand-500/40 ring-1 ring-brand-500/20" : "border-white/[0.06] hover:border-white/[0.15] hover:-translate-y-0.5"
      }`}
    >
      {/* Preview area */}
      <div className="relative h-[110px] overflow-hidden flex items-center justify-center" style={{
        background: bannerOK ? "transparent" : "#141417",
      }}>
        {bannerOK && (
          /* hover-only pra não explodir a página com 33 animações concorrentes */
          <CosmeticBanner slug={cosmetic.prize_slug} variant="card" animated="hover" />
        )}
        {(frameSlug || auraSlug) && (
          <div className="relative">
            <AvatarWithCosmetics
              src={SAMPLE_AVATAR}
              name={cosmetic.prize_name}
              size={54}
              frameSlug={frameSlug ? `frame-${frameSlug}` : null}
              auraSlug={auraSlug ? `effect-${auraSlug}` : null}
              animated="hover"
            />
          </div>
        )}
        {!bannerOK && !frameSlug && !auraSlug && (
          <div className="text-white/20 text-[10px] uppercase tracking-widest">preview em breve</div>
        )}
        {cosmetic.equipped && (
          <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-500/90 text-[9px] font-bold uppercase tracking-wider text-white">
            <Check className="w-2.5 h-2.5" /> Equipado
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 border-t border-white/[0.04]">
        <p className="text-[12px] font-bold text-white/90 leading-tight truncate">{cosmetic.prize_name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-[9px] font-bold tracking-[0.15em] uppercase ${rarity.className}`}>{rarity.label}</span>
          {!cosmetic.equipped && (
            <button
              onClick={onEquip}
              disabled={pending}
              className="text-[10px] text-white/40 hover:text-brand-500 transition-colors disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Equipar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
