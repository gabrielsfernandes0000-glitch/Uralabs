/**
 * URA Labs design tokens — fonte canônica em docs/design-tokens.md
 * Espelho deste arquivo em dashboard/src/lib/tokens.ts. Mudou aqui? Atualize lá.
 */

export const COLORS = {
  bg: "#09090b",
  bg2: "#0e0e10",
  bg3: "#141417",
  line: "rgba(255,255,255,0.06)",
  lineStrong: "rgba(255,255,255,0.12)",

  text: "#fafafa",
  text2: "#a1a1aa",
  text3: "#71717a",
  text4: "#52525b",

  brand: "#FF5500",
  gold: "#C9A461",
  green: "#10b981",
  red: "#ef4444",
} as const;

export const FONTS = {
  sans: "Inter, -apple-system, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  section: 96,
  hero: 160,
} as const;

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const SHADOWS = {
  e0: "none",
  e1: "0 1px 2px rgba(0,0,0,0.4)",
  e2: "0 4px 12px rgba(0,0,0,0.5)",
  glowBrand: "0 0 12px rgba(255,85,0,0.6)",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type ColorToken = keyof typeof COLORS;
export type SpacingToken = keyof typeof SPACING;
export type RadiusToken = keyof typeof RADIUS;
