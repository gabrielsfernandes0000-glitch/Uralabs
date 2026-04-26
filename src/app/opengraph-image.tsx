import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "URA Labs · Trade Nasdaq & Crypto com SMC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(ellipse 70% 50% at 70% 100%, rgba(34,197,94,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 0% 0%, rgba(255,85,0,0.08) 0%, transparent 60%), #0a0a0b",
          color: "#ffffff",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* LEFT: copy */}
        <div
          style={{
            width: 600,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 40px 56px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: "#FF5500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              U
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                display: "flex",
                gap: 6,
              }}
            >
              <span>URA</span>
              <span style={{ color: "#FF5500" }}>Labs</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                display: "flex",
                flexDirection: "column",
                color: "#ffffff",
              }}
            >
              <span>Calls com plano.</span>
              <span style={{ color: "#FF5500" }}>Não palpite.</span>
            </div>
            <div
              style={{
                fontSize: 19,
                color: "rgba(255,255,255,0.55)",
                maxWidth: 480,
                lineHeight: 1.4,
              }}
            >
              Entrada, stop e alvo definidos antes da execução. Você acompanha
              ao vivo até o resultado fechar.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              background: "rgba(255,85,0,0.10)",
              border: "1px solid rgba(255,85,0,0.40)",
              borderRadius: 999,
              alignSelf: "flex-start",
              fontSize: 17,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#FF5500",
                display: "block",
              }}
            />
            uralabs.com.br
          </div>
        </div>

        {/* RIGHT: motion frame freeze */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background:
              "linear-gradient(180deg, rgba(20,20,24,0.5) 0%, rgba(8,8,10,0.0) 35%, rgba(0,0,0,0.4) 100%), #0a0a0c",
            position: "relative",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* mini chart symbol top-left */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#F7931A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              ₿
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "0.02em",
              }}
            >
              BTCUSDT
            </span>
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 500,
              }}
            >
              · 1m · BYBIT
            </span>
          </div>

          {/* live ticker top-right */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              display: "flex",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 18,
                fontWeight: 700,
                color: "#4ADE80",
                letterSpacing: "-0.01em",
              }}
            >
              126.110
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 600,
                color: "#22C55E",
              }}
            >
              +1.40%
            </span>
          </div>

          {/* Mini candles + lines */}
          <svg
            width="500"
            height="280"
            viewBox="0 0 500 280"
            style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)" }}
          >
            {/* Grid */}
            {[40, 100, 160, 220].map((y) => (
              <line
                key={y}
                x1="20"
                y1={y}
                x2="480"
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
            ))}
            {/* Entry line */}
            <line x1="20" y1="170" x2="480" y2="170" stroke="#FF5500" strokeWidth="2" />
            {/* Stop line */}
            <line x1="20" y1="220" x2="480" y2="220" stroke="#EF4444" strokeWidth="2" strokeDasharray="10 8" />
            {/* Target line */}
            <line x1="20" y1="60" x2="480" y2="60" stroke="#22C55E" strokeWidth="2" strokeDasharray="10 8" />
            {/* Candles */}
            {[
              { x: 80, top: 155, base: 170, w: 18 },
              { x: 130, top: 130, base: 155, w: 18 },
              { x: 180, top: 100, base: 130, w: 18 },
              { x: 230, top: 90, base: 100, w: 18 },
              { x: 280, top: 78, base: 90, w: 18 },
              { x: 340, top: 70, base: 78, w: 18 },
              { x: 400, top: 60, base: 70, w: 18 },
            ].map((c, i) => (
              <g key={i}>
                <line x1={c.x + c.w / 2} y1={c.top - 6} x2={c.x + c.w / 2} y2={c.base + 6} stroke="#22C55E" strokeWidth="1" />
                <rect x={c.x} y={c.top} width={c.w} height={c.base - c.top} fill="#22C55E" rx="1" />
              </g>
            ))}
            {/* Splash circle near final candle */}
            <circle cx="409" cy="60" r="28" fill="none" stroke="#4ADE80" strokeWidth="2" opacity="0.5" />
            <circle cx="409" cy="60" r="18" fill="none" stroke="#4ADE80" strokeWidth="2" opacity="0.8" />
          </svg>

          {/* Badge "Call fechada" centro-bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 22px",
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.45)",
              borderRadius: 12,
              boxShadow: "0 8px 32px -4px rgba(34,197,94,0.25)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "rgba(34,197,94,0.20)",
                border: "1px solid rgba(74,222,128,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5L10 17.5L19 7.5" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                Resultado
              </span>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 1.1,
                }}
              >
                Call fechada
              </span>
            </div>
            <div
              style={{
                width: 1,
                height: 36,
                background: "linear-gradient(180deg, transparent 10%, rgba(34,197,94,0.35) 50%, transparent 90%)",
                marginLeft: 4,
                marginRight: 4,
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 26,
                fontWeight: 700,
                color: "#4ADE80",
                letterSpacing: "-0.01em",
              }}
            >
              +12.9%
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
