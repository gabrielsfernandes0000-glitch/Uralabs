"use client";

/* DashboardHero — wrapper do header do /elite com banner como fundo.
 *
 * Estados:
 * - sem banner equipado OU preferência "ocultar": fallback simples (blur circle
 *   + grid), content flui normal com padding natural.
 * - com banner + preferência "mostrar": aspectRatio 6/1 pra banner preencher
 *   edge-to-edge sem crop, content sobreposto em absolute.
 *
 * Preferência persiste em localStorage.
 */

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CosmeticBanner } from "./CosmeticBanner";

const STORAGE_KEY = "elite-dashboard-banner-hidden";

interface DashboardHeroProps {
  bannerSlug: string | null;
  tierAccent: string;
  children: React.ReactNode;
}

export function DashboardHero({ bannerSlug, tierAccent, children }: DashboardHeroProps) {
  const [hidden, setHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {}
    setHydrated(true);
  }, []);

  function toggle() {
    const next = !hidden;
    setHidden(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
  }

  const showBanner = !!bannerSlug && !hidden;

  // Em mobile, container não usa aspect fixo — banner aparece em altura
  // controlada (~120px) acima do conteúdo em flow. Em md+ volta pro 6/1
  // panorâmico com conteúdo sobreposto edge-to-edge.
  return (
    <div
      className={`animate-in-up relative overflow-hidden rounded-2xl bg-white/[0.02] ${
        showBanner ? "md:aspect-[6/1]" : ""
      }`}
    >
      {showBanner ? (
        <>
          {/* No mobile, banner ocupa só os 120px do topo (h-[120px]) e dá
              espaço pro conteúdo respirar abaixo. Em md+ ocupa o container
              inteiro (aspect 6/1) e conteúdo sobrepõe. */}
          <div className="absolute top-0 left-0 right-0 h-[120px] md:h-full overflow-hidden">
            <CosmeticBanner slug={bannerSlug!} variant="full" />
            {/* Mesmo stack de gradientes do /elite/perfil — URA confirmou que
                prefere esse look. 4 camadas: horizontal edge-fade, vertical
                topo, vertical base forte, radial atrás do avatar. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #0e0e10 0%, rgba(14,14,16,0.9) 6%, rgba(14,14,16,0.3) 18%, rgba(14,14,16,0) 34%, rgba(14,14,16,0) 66%, rgba(14,14,16,0.3) 82%, rgba(14,14,16,0.9) 94%, #0e0e10 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(14,14,16,0.35) 0%, rgba(14,14,16,0) 22%, rgba(14,14,16,0) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(14,14,16,0) 0%, rgba(14,14,16,0.12) 55%, rgba(14,14,16,0.5) 85%, rgba(14,14,16,0.85) 100%)",
              }}
            />
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                background:
                  "radial-gradient(ellipse 30% 55% at 12% 85%, rgba(0,0,0,0.6), transparent 70%)",
              }}
            />
          </div>
        </>
      ) : (
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ backgroundColor: tierAccent + "30" }} />
      )}

      {/* Toggle — só aparece se tem banner equipado (nada pra mostrar/ocultar sem ele).
          Escondido até hidratar pra evitar mismatch SSR. */}
      {hydrated && !!bannerSlug && (
        <button
          type="button"
          onClick={toggle}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-md text-white/70 hover:text-white bg-black/55 hover:bg-black/75 border border-white/10 hover:border-white/20 backdrop-blur-sm shadow-lg transition-all"
          aria-label={hidden ? "Mostrar banner" : "Ocultar banner"}
          title={hidden ? "Mostrar banner" : "Ocultar banner"}
        >
          {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Mobile: conteúdo flui abaixo do banner com padding-top maior pra
          deixar uma sobra do banner aparecendo sob o avatar.
          Desktop (md+): conteúdo sobrepõe banner em absolute positioning. */}
      <div
        className={
          showBanner
            ? "relative md:absolute md:inset-0 z-10 px-5 pt-20 pb-5 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6"
            : "relative z-10 p-5 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6"
        }
      >
        {children}
      </div>
    </div>
  );
}
