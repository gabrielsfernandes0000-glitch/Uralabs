import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "URA Labs · Trade Nasdaq & Crypto com SMC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph image gerada em runtime pelo Next.js.
 * Aparece em preview de compartilhamento (X, Discord, WhatsApp, LinkedIn).
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
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(255,85,0,0.06) 0%, transparent 60%), #0a0a0b",
          padding: "64px 72px",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* Top: brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "#FF5500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            U
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              display: "flex",
              gap: 6,
            }}
          >
            <span>URA</span>
            <span style={{ color: "#FF5500" }}>Labs</span>
          </div>
          <div
            style={{
              marginLeft: 12,
              fontSize: 13,
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 999,
              color: "rgba(255,255,255,0.65)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "#22C55E",
                display: "block",
              }}
            />
            Comunidade ao vivo
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
              color: "#ffffff",
            }}
          >
            <span>Cansado de ser</span>
            <span style={{ display: "flex", gap: 18 }}>
              <span>liquidez do</span>
              <span style={{ color: "#FF5500" }}>mercado?</span>
            </span>
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.55)",
              maxWidth: 900,
              lineHeight: 1.4,
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
            gap: 40,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              +1.775%
            </span>
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.50)",
                marginTop: 6,
              }}
            >
              Calls em março/2026
            </span>
          </div>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              70%
            </span>
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.50)",
                marginTop: 6,
              }}
            >
              De acerto
            </span>
          </div>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              uralabs.com.br
            </span>
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.50)",
                marginTop: 8,
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
