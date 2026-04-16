import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "URA Labs · Trade Nasdaq & Crypto com SMC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph image gerada em runtime pelo Next.js.
 * Aparece em preview de compartilhamento (X, Discord, WhatsApp, LinkedIn).
 * Antes não existia — links compartilhados abriam sem preview.
 */
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse at top left, rgba(255,85,0,0.18) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(255,85,0,0.10) 0%, transparent 60%), #0a0a0b",
          padding: "72px 80px",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* Top: brand + tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #FF5500 0%, #FF8800 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "#000",
              boxShadow: "0 0 48px rgba(255,85,0,0.4)",
            }}
          >
            U
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              display: "flex",
              gap: 8,
            }}
          >
            <span>URA</span>
            <span style={{ color: "#FF5500" }}>LABS</span>
          </div>
          <div
            style={{
              marginLeft: 8,
              fontSize: 12,
              padding: "6px 12px",
              border: "1px solid rgba(255,85,0,0.4)",
              borderRadius: 999,
              color: "#FF8844",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Comunidade ao vivo
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Cansado de ser</span>
            <span>
              <span
                style={{
                  background: "linear-gradient(90deg, #FF5500, #FFAA33)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                liquidez do mercado?
              </span>
            </span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#9ca3af",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Calls diários, mentoria Elite e comunidade de traders sérios. SMC,
            CRT, Cripto e Nasdaq — do zero.
          </div>
        </div>

        {/* Bottom: stats */}
        <div
          style={{
            display: "flex",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#FF5500",
                letterSpacing: "-0.02em",
              }}
            >
              +1.775%
            </span>
            <span
              style={{
                fontSize: 14,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              Março 2026
            </span>
          </div>
          <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#22c55e",
                letterSpacing: "-0.02em",
              }}
            >
              70%
            </span>
            <span
              style={{
                fontSize: 14,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              Acerto nas calls
            </span>
          </div>
          <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              uralabs.com.br
            </span>
            <span
              style={{
                fontSize: 14,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              Entrar grátis no Discord
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
