/**
 * FearGreedGauge — mini-termômetro semicircular pra índices 0-100.
 *
 * Inspirado no gauge do CoinMarketCap, mas com paleta sóbria URA Labs
 * (3 cores funcionais: vermelho/branco-muted/verde, sem rainbow). Cor do
 * arco preenchido segue `fgAccent` — mesma cor do label embaixo, mantém
 * 1 cor por gauge no DOM final.
 *
 * Server-component-safe: zero stateful, só SVG.
 */
export function FearGreedGauge({
  value,
  color,
  size = 80,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  // Clamp 0-100 — defensivo caso API retorne valor inválido.
  const v = Math.max(0, Math.min(100, value));

  // SVG geometry: arco semicircular 180° (topo). Centro horizontal 50, vertical 50.
  // Raio externo 40, espessura 7. viewBox dá folga vertical embaixo pro número.
  const cx = 50;
  const cy = 50;
  const r = 40;
  const stroke = 7;

  // Arco completo (track) — de (10, 50) passando pelo topo até (90, 50).
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  // Comprimento total do arco semicircular = π * r
  const arcLen = Math.PI * r;
  const fillLen = (v / 100) * arcLen;

  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      style={{ display: "block" }}
      aria-hidden
    >
      {/* Track */}
      <path
        d={trackPath}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Fill — usa stroke-dasharray pra revelar % do arco */}
      <path
        d={trackPath}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${fillLen} ${arcLen}`}
      />
      {/* Número centralizado dentro do arco */}
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill="#ffffff"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.round(v)}
      </text>
    </svg>
  );
}
