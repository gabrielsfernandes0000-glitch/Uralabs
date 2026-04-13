"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────
   LessonChart — Interactive Lightweight Charts for lessons

   Each scenario shows a realistic NQ 5-min chart with
   annotations (price lines, markers) teaching a specific concept.
   ──────────────────────────────────────────── */

export type ChartScenario = keyof typeof SCENARIOS;

interface Candle {
  time: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

interface PriceLine {
  price: number;
  color: string;
  title: string;
  style?: number; // 0=solid, 1=dotted, 2=dashed
}

interface Marker {
  time: number;
  position: "aboveBar" | "belowBar";
  color: string;
  shape: "circle" | "arrowUp" | "arrowDown" | "square";
  text: string;
}

interface ScenarioData {
  candles: Candle[];
  priceLines: PriceLine[];
  markers: Marker[];
  height?: number;
}

/* ────────────────────────────────────────────
   Scenario Data — realistic NQ 5min candles
   ──────────────────────────────────────────── */

const BASE = 1744617000; // base timestamp

function t(offset: number) { return BASE + offset * 300; }

const SCENARIOS = {
  /* ── AMD Sweep — Accumulation → Manipulation → Distribution ── */
  "amd-sweep": {
    candles: [
      // Accumulation — sideways range
      { time: t(0), o: 18100, h: 18115, l: 18090, c: 18108 },
      { time: t(1), o: 18108, h: 18118, l: 18095, c: 18102 },
      { time: t(2), o: 18102, h: 18120, l: 18092, c: 18115 },
      { time: t(3), o: 18115, h: 18122, l: 18098, c: 18105 },
      { time: t(4), o: 18105, h: 18118, l: 18090, c: 18095 },
      { time: t(5), o: 18095, h: 18112, l: 18088, c: 18108 },
      { time: t(6), o: 18108, h: 18120, l: 18095, c: 18098 },
      { time: t(7), o: 18098, h: 18115, l: 18085, c: 18110 },
      { time: t(8), o: 18110, h: 18118, l: 18092, c: 18100 },
      { time: t(9), o: 18100, h: 18112, l: 18088, c: 18095 },
      // Manipulation — sweep down
      { time: t(10), o: 18095, h: 18100, l: 18055, c: 18060 },
      { time: t(11), o: 18060, h: 18065, l: 18030, c: 18035 },
      { time: t(12), o: 18035, h: 18042, l: 18010, c: 18018 },
      { time: t(13), o: 18018, h: 18025, l: 17985, c: 17992 },
      // Distribution — reversal up
      { time: t(14), o: 17992, h: 18050, l: 17980, c: 18042 },
      { time: t(15), o: 18042, h: 18085, l: 18038, c: 18078 },
      { time: t(16), o: 18078, h: 18115, l: 18072, c: 18108 },
      { time: t(17), o: 18108, h: 18145, l: 18100, c: 18138 },
      { time: t(18), o: 18138, h: 18172, l: 18130, c: 18165 },
      { time: t(19), o: 18165, h: 18200, l: 18158, c: 18192 },
      { time: t(20), o: 18192, h: 18228, l: 18185, c: 18220 },
      { time: t(21), o: 18220, h: 18255, l: 18215, c: 18248 },
    ],
    priceLines: [
      { price: 18120, color: "#787b86", title: "Range High", style: 2 },
      { price: 18085, color: "#787b86", title: "Range Low", style: 2 },
      { price: 17980, color: "#ef5350", title: "Sweep Low", style: 2 },
      { price: 18042, color: "#2962ff", title: "Entry (OB)", style: 2 },
      { price: 18250, color: "#26a69a", title: "TP (BSL)", style: 2 },
    ],
    markers: [
      { time: t(0), position: "aboveBar", color: "#A855F7", shape: "square", text: "A" },
      { time: t(10), position: "aboveBar", color: "#EF4444", shape: "square", text: "M" },
      { time: t(14), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Reversão" },
      { time: t(16), position: "aboveBar", color: "#10B981", shape: "square", text: "D" },
    ],
  } satisfies ScenarioData,

  /* ── OB Bounce — Price returns to Order Block ── */
  "ob-bounce": {
    candles: [
      // Setup — impulse up from OB
      { time: t(0), o: 18200, h: 18215, l: 18195, c: 18210 },
      { time: t(1), o: 18210, h: 18212, l: 18180, c: 18185 }, // OB candle (last bearish before impulse)
      { time: t(2), o: 18185, h: 18240, l: 18182, c: 18235 }, // Impulse up
      { time: t(3), o: 18235, h: 18270, l: 18230, c: 18265 },
      { time: t(4), o: 18265, h: 18300, l: 18258, c: 18295 },
      { time: t(5), o: 18295, h: 18325, l: 18288, c: 18318 },
      { time: t(6), o: 18318, h: 18340, l: 18310, c: 18335 },
      // Pullback — retracing to OB
      { time: t(7), o: 18335, h: 18338, l: 18305, c: 18310 },
      { time: t(8), o: 18310, h: 18315, l: 18280, c: 18285 },
      { time: t(9), o: 18285, h: 18290, l: 18255, c: 18260 },
      { time: t(10), o: 18260, h: 18265, l: 18230, c: 18235 },
      { time: t(11), o: 18235, h: 18240, l: 18205, c: 18210 },
      { time: t(12), o: 18210, h: 18215, l: 18185, c: 18190 }, // Touches OB
      // Bounce from OB
      { time: t(13), o: 18190, h: 18240, l: 18185, c: 18235 }, // Engulfing bounce
      { time: t(14), o: 18235, h: 18275, l: 18230, c: 18270 },
      { time: t(15), o: 18270, h: 18310, l: 18265, c: 18305 },
      { time: t(16), o: 18305, h: 18350, l: 18298, c: 18342 },
      { time: t(17), o: 18342, h: 18380, l: 18335, c: 18372 },
    ],
    priceLines: [
      { price: 18212, color: "#3B82F6", title: "OB High", style: 2 },
      { price: 18180, color: "#3B82F6", title: "OB Low", style: 2 },
    ],
    markers: [
      { time: t(1), position: "aboveBar", color: "#3B82F6", shape: "square", text: "OB" },
      { time: t(12), position: "belowBar", color: "#3B82F6", shape: "circle", text: "Toca OB" },
      { time: t(13), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Bounce" },
    ],
  } satisfies ScenarioData,

  /* ── FVG Fill — Fair Value Gap getting filled ── */
  "fvg-fill": {
    candles: [
      { time: t(0), o: 18100, h: 18115, l: 18090, c: 18110 },
      { time: t(1), o: 18110, h: 18120, l: 18105, c: 18115 },
      { time: t(2), o: 18115, h: 18125, l: 18108, c: 18120 }, // Before FVG
      { time: t(3), o: 18120, h: 18190, l: 18118, c: 18185 }, // Big impulse (creates FVG)
      { time: t(4), o: 18185, h: 18220, l: 18178, c: 18215 }, // After FVG
      { time: t(5), o: 18215, h: 18250, l: 18210, c: 18245 },
      { time: t(6), o: 18245, h: 18265, l: 18238, c: 18258 },
      // Pullback to fill FVG
      { time: t(7), o: 18258, h: 18262, l: 18230, c: 18235 },
      { time: t(8), o: 18235, h: 18238, l: 18200, c: 18205 },
      { time: t(9), o: 18205, h: 18210, l: 18178, c: 18182 }, // Fills FVG zone
      { time: t(10), o: 18182, h: 18185, l: 18155, c: 18160 }, // Into FVG
      // Bounce from FVG
      { time: t(11), o: 18160, h: 18205, l: 18155, c: 18200 },
      { time: t(12), o: 18200, h: 18240, l: 18195, c: 18235 },
      { time: t(13), o: 18235, h: 18275, l: 18230, c: 18270 },
      { time: t(14), o: 18270, h: 18305, l: 18265, c: 18298 },
    ],
    priceLines: [
      { price: 18178, color: "#3B82F6", title: "FVG Top", style: 2 },
      { price: 18125, color: "#3B82F6", title: "FVG Bottom", style: 2 },
    ],
    markers: [
      { time: t(3), position: "aboveBar", color: "#3B82F6", shape: "square", text: "FVG" },
      { time: t(10), position: "belowBar", color: "#3B82F6", shape: "circle", text: "Preenchimento" },
      { time: t(11), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Reação" },
    ],
  } satisfies ScenarioData,

  /* ── Premium & Discount — Fibonacci zones ── */
  "premium-discount": {
    candles: [
      // Swing high to low
      { time: t(0), o: 18480, h: 18500, l: 18470, c: 18495 }, // Swing high
      { time: t(1), o: 18495, h: 18498, l: 18460, c: 18465 },
      { time: t(2), o: 18465, h: 18470, l: 18420, c: 18425 },
      { time: t(3), o: 18425, h: 18435, l: 18380, c: 18390 },
      { time: t(4), o: 18390, h: 18400, l: 18340, c: 18350 },
      { time: t(5), o: 18350, h: 18360, l: 18300, c: 18310 },
      { time: t(6), o: 18310, h: 18320, l: 18270, c: 18280 },
      { time: t(7), o: 18280, h: 18290, l: 18240, c: 18250 },
      { time: t(8), o: 18250, h: 18260, l: 18200, c: 18210 },
      { time: t(9), o: 18210, h: 18220, l: 18000, c: 18005 }, // Swing low
      // Rally back — enters premium
      { time: t(10), o: 18005, h: 18080, l: 18000, c: 18072 },
      { time: t(11), o: 18072, h: 18150, l: 18068, c: 18142 },
      { time: t(12), o: 18142, h: 18220, l: 18135, c: 18215 },
      { time: t(13), o: 18215, h: 18290, l: 18210, c: 18285 },
      { time: t(14), o: 18285, h: 18360, l: 18280, c: 18350 }, // Into premium
      // Rejection in premium
      { time: t(15), o: 18350, h: 18370, l: 18300, c: 18310 },
      { time: t(16), o: 18310, h: 18320, l: 18260, c: 18270 },
    ],
    priceLines: [
      { price: 18500, color: "#787b86", title: "Swing High", style: 0 },
      { price: 18000, color: "#787b86", title: "Swing Low", style: 0 },
      { price: 18250, color: "#F59E0B", title: "50% (Equilibrium)", style: 2 },
    ],
    markers: [
      { time: t(0), position: "aboveBar", color: "#EF4444", shape: "square", text: "Premium" },
      { time: t(9), position: "belowBar", color: "#10B981", shape: "square", text: "Discount" },
      { time: t(14), position: "aboveBar", color: "#EF4444", shape: "arrowDown", text: "Zona cara" },
    ],
  } satisfies ScenarioData,

  /* ── Liquidity Sweep — Equal lows swept ── */
  "liquidity-sweep": {
    candles: [
      // Building equal lows (retail "support")
      { time: t(0), o: 18200, h: 18220, l: 18180, c: 18210 },
      { time: t(1), o: 18210, h: 18240, l: 18200, c: 18235 },
      { time: t(2), o: 18235, h: 18250, l: 18180, c: 18185 }, // Low 1
      { time: t(3), o: 18185, h: 18230, l: 18178, c: 18225 },
      { time: t(4), o: 18225, h: 18260, l: 18215, c: 18255 },
      { time: t(5), o: 18255, h: 18270, l: 18182, c: 18188 }, // Low 2 (equal low)
      { time: t(6), o: 18188, h: 18240, l: 18180, c: 18232 },
      { time: t(7), o: 18232, h: 18265, l: 18225, c: 18260 },
      { time: t(8), o: 18260, h: 18275, l: 18185, c: 18190 }, // Low 3 (triple bottom)
      // Sweep — breaks below all lows
      { time: t(9), o: 18190, h: 18195, l: 18140, c: 18148 }, // Sweep candle
      { time: t(10), o: 18148, h: 18152, l: 18120, c: 18128 }, // Deep sweep
      // Instant reversal
      { time: t(11), o: 18128, h: 18200, l: 18122, c: 18195 }, // Engulfing
      { time: t(12), o: 18195, h: 18260, l: 18190, c: 18252 },
      { time: t(13), o: 18252, h: 18310, l: 18248, c: 18305 },
      { time: t(14), o: 18305, h: 18365, l: 18298, c: 18358 },
      { time: t(15), o: 18358, h: 18410, l: 18350, c: 18402 },
    ],
    priceLines: [
      { price: 18178, color: "#EF4444", title: "SSL (Equal Lows)", style: 2 },
      { price: 18120, color: "#EF4444", title: "Sweep Low", style: 1 },
    ],
    markers: [
      { time: t(2), position: "belowBar", color: "#EF4444", shape: "circle", text: "Low 1" },
      { time: t(5), position: "belowBar", color: "#EF4444", shape: "circle", text: "Low 2" },
      { time: t(8), position: "belowBar", color: "#EF4444", shape: "circle", text: "Low 3" },
      { time: t(10), position: "belowBar", color: "#EF4444", shape: "arrowDown", text: "Sweep!" },
      { time: t(11), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Reversão" },
    ],
  } satisfies ScenarioData,

  /* ── Session Asia — Asia range + London sweep ── */
  "session-asia": {
    candles: [
      // Asia session — tight range
      { time: t(0), o: 18200, h: 18218, l: 18192, c: 18210 },
      { time: t(1), o: 18210, h: 18222, l: 18198, c: 18205 },
      { time: t(2), o: 18205, h: 18220, l: 18195, c: 18215 },
      { time: t(3), o: 18215, h: 18225, l: 18200, c: 18208 },
      { time: t(4), o: 18208, h: 18222, l: 18195, c: 18218 },
      { time: t(5), o: 18218, h: 18228, l: 18202, c: 18210 },
      // London open — sweep Asia High then reverse
      { time: t(6), o: 18210, h: 18248, l: 18205, c: 18242 }, // Break above
      { time: t(7), o: 18242, h: 18258, l: 18235, c: 18255 }, // Fake breakout
      { time: t(8), o: 18255, h: 18260, l: 18210, c: 18215 }, // Rejection
      { time: t(9), o: 18215, h: 18220, l: 18175, c: 18180 }, // London reversal
      { time: t(10), o: 18180, h: 18185, l: 18145, c: 18150 },
      { time: t(11), o: 18150, h: 18158, l: 18115, c: 18120 },
      // NY continuation
      { time: t(12), o: 18120, h: 18125, l: 18080, c: 18088 },
      { time: t(13), o: 18088, h: 18095, l: 18050, c: 18058 },
      { time: t(14), o: 18058, h: 18065, l: 18025, c: 18035 },
    ],
    priceLines: [
      { price: 18228, color: "#F59E0B", title: "Asia High", style: 2 },
      { price: 18192, color: "#F59E0B", title: "Asia Low", style: 2 },
    ],
    markers: [
      { time: t(0), position: "aboveBar", color: "#6366F1", shape: "square", text: "Ásia" },
      { time: t(6), position: "aboveBar", color: "#F59E0B", shape: "square", text: "Londres" },
      { time: t(7), position: "aboveBar", color: "#EF4444", shape: "arrowDown", text: "Sweep Asia High" },
      { time: t(12), position: "aboveBar", color: "#FF5500", shape: "square", text: "NY" },
    ],
  } satisfies ScenarioData,

  /* ── Judas Swing — False move at open ── */
  "judas-swing": {
    candles: [
      // Pre-market context — bullish bias
      { time: t(0), o: 18150, h: 18172, l: 18142, c: 18168 },
      { time: t(1), o: 18168, h: 18185, l: 18160, c: 18180 },
      { time: t(2), o: 18180, h: 18198, l: 18175, c: 18192 },
      { time: t(3), o: 18192, h: 18205, l: 18188, c: 18200 },
      // NY open — Judas Swing DOWN (false move)
      { time: t(4), o: 18200, h: 18205, l: 18158, c: 18162 }, // Big drop
      { time: t(5), o: 18162, h: 18168, l: 18130, c: 18135 }, // More drop
      { time: t(6), o: 18135, h: 18140, l: 18108, c: 18115 }, // Sweep lows
      // Reversal — bullish bias wins
      { time: t(7), o: 18115, h: 18180, l: 18110, c: 18175 }, // Engulfing
      { time: t(8), o: 18175, h: 18230, l: 18170, c: 18225 },
      { time: t(9), o: 18225, h: 18278, l: 18220, c: 18272 },
      { time: t(10), o: 18272, h: 18325, l: 18268, c: 18318 },
      { time: t(11), o: 18318, h: 18370, l: 18312, c: 18365 },
      { time: t(12), o: 18365, h: 18410, l: 18358, c: 18405 },
    ],
    priceLines: [
      { price: 18108, color: "#EF4444", title: "Judas Low (Sweep)", style: 2 },
      { price: 18200, color: "#787b86", title: "Open", style: 1 },
    ],
    markers: [
      { time: t(4), position: "aboveBar", color: "#EF4444", shape: "arrowDown", text: "Judas Swing" },
      { time: t(6), position: "belowBar", color: "#EF4444", shape: "circle", text: "Trap" },
      { time: t(7), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Reversão real" },
    ],
  } satisfies ScenarioData,

  /* ── SMT Divergence — NQ vs ES diverging ── */
  "smt-diverge": {
    candles: [
      // NQ making higher high while ES fails
      { time: t(0), o: 18200, h: 18230, l: 18190, c: 18225 },
      { time: t(1), o: 18225, h: 18260, l: 18218, c: 18255 },
      { time: t(2), o: 18255, h: 18290, l: 18248, c: 18285 },
      { time: t(3), o: 18285, h: 18320, l: 18278, c: 18310 }, // NQ high 1
      { time: t(4), o: 18310, h: 18315, l: 18275, c: 18280 },
      { time: t(5), o: 18280, h: 18285, l: 18245, c: 18250 },
      { time: t(6), o: 18250, h: 18270, l: 18240, c: 18265 },
      { time: t(7), o: 18265, h: 18300, l: 18258, c: 18295 },
      { time: t(8), o: 18295, h: 18335, l: 18288, c: 18328 }, // NQ higher high!
      // But then reversal — SMT was right
      { time: t(9), o: 18328, h: 18332, l: 18290, c: 18295 },
      { time: t(10), o: 18295, h: 18300, l: 18250, c: 18258 },
      { time: t(11), o: 18258, h: 18265, l: 18210, c: 18218 },
      { time: t(12), o: 18218, h: 18225, l: 18170, c: 18180 },
    ],
    priceLines: [
      { price: 18320, color: "#787b86", title: "NQ High 1", style: 2 },
      { price: 18335, color: "#EF4444", title: "NQ Higher High (SMT!)", style: 2 },
    ],
    markers: [
      { time: t(3), position: "aboveBar", color: "#787b86", shape: "circle", text: "High 1" },
      { time: t(8), position: "aboveBar", color: "#EF4444", shape: "arrowDown", text: "Higher High (ES falhou)" },
      { time: t(9), position: "aboveBar", color: "#EF4444", shape: "square", text: "Reversão SMT" },
    ],
  } satisfies ScenarioData,

  /* ── Entry Setup — Full setup with entry, SL, TP ── */
  "entry-setup": {
    candles: [
      // Context — sweep + OB
      { time: t(0), o: 18200, h: 18215, l: 18190, c: 18208 },
      { time: t(1), o: 18208, h: 18220, l: 18195, c: 18198 }, // OB candle
      { time: t(2), o: 18198, h: 18250, l: 18195, c: 18245 },
      { time: t(3), o: 18245, h: 18280, l: 18240, c: 18275 },
      { time: t(4), o: 18275, h: 18300, l: 18268, c: 18295 },
      // Pullback to sweep + OB
      { time: t(5), o: 18295, h: 18298, l: 18260, c: 18265 },
      { time: t(6), o: 18265, h: 18270, l: 18228, c: 18232 },
      { time: t(7), o: 18232, h: 18238, l: 18195, c: 18200 }, // Sweeps into OB
      { time: t(8), o: 18200, h: 18205, l: 18178, c: 18182 }, // Deep into OB with FVG
      // Entry + rally to TP
      { time: t(9), o: 18182, h: 18230, l: 18175, c: 18225 }, // Entry candle — engulfing
      { time: t(10), o: 18225, h: 18268, l: 18220, c: 18262 },
      { time: t(11), o: 18262, h: 18305, l: 18258, c: 18298 },
      { time: t(12), o: 18298, h: 18345, l: 18292, c: 18340 },
      { time: t(13), o: 18340, h: 18382, l: 18335, c: 18378 },
      { time: t(14), o: 18378, h: 18415, l: 18372, c: 18410 }, // Hits TP zone
    ],
    priceLines: [
      { price: 18220, color: "#3B82F6", title: "OB High", style: 2 },
      { price: 18195, color: "#3B82F6", title: "OB Low", style: 2 },
      { price: 18195, color: "#2962ff", title: "Entry", style: 0 },
      { price: 18170, color: "#ef5350", title: "Stop Loss (-1R)", style: 2 },
      { price: 18420, color: "#26a69a", title: "Take Profit (+3R)", style: 2 },
    ],
    markers: [
      { time: t(1), position: "aboveBar", color: "#3B82F6", shape: "square", text: "OB" },
      { time: t(8), position: "belowBar", color: "#3B82F6", shape: "circle", text: "Sweep + FVG" },
      { time: t(9), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Entry" },
      { time: t(14), position: "aboveBar", color: "#26a69a", shape: "circle", text: "TP 3R" },
    ],
  } satisfies ScenarioData,

  /* ── Candle Anatomy — Teaching candle reading ── */
  "candle-anatomy": {
    candles: [
      { time: t(0), o: 18200, h: 18225, l: 18185, c: 18220 }, // Bullish with wicks
      { time: t(1), o: 18220, h: 18250, l: 18190, c: 18195 }, // Bearish with wicks
      { time: t(2), o: 18195, h: 18210, l: 18192, c: 18208 }, // Small bullish (indecision)
      { time: t(3), o: 18208, h: 18260, l: 18205, c: 18255 }, // Big bullish (momentum)
      { time: t(4), o: 18255, h: 18290, l: 18248, c: 18252 }, // Doji — long wicks both sides
      { time: t(5), o: 18252, h: 18285, l: 18250, c: 18280 }, // Bullish engulfing
      { time: t(6), o: 18280, h: 18282, l: 18240, c: 18245 }, // Rejection wick
    ],
    priceLines: [],
    markers: [
      { time: t(0), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Bullish" },
      { time: t(1), position: "aboveBar", color: "#EF4444", shape: "arrowDown", text: "Bearish" },
      { time: t(4), position: "aboveBar", color: "#F59E0B", shape: "circle", text: "Doji (indecisão)" },
      { time: t(5), position: "belowBar", color: "#10B981", shape: "arrowUp", text: "Engulfing" },
      { time: t(6), position: "aboveBar", color: "#EF4444", shape: "arrowDown", text: "Rejeição" },
    ],
    height: 350,
  } satisfies ScenarioData,

  /* ── Risk Shield — Showing proper risk management ── */
  "risk-shield": {
    candles: [
      // Good trade — 1R risk, 3R reward
      { time: t(0), o: 18200, h: 18215, l: 18192, c: 18210 },
      { time: t(1), o: 18210, h: 18212, l: 18185, c: 18190 },
      { time: t(2), o: 18190, h: 18195, l: 18170, c: 18175 }, // Entry zone
      { time: t(3), o: 18175, h: 18220, l: 18172, c: 18215 }, // Entry + bounce
      { time: t(4), o: 18215, h: 18255, l: 18210, c: 18250 },
      { time: t(5), o: 18250, h: 18290, l: 18245, c: 18285 },
      { time: t(6), o: 18285, h: 18325, l: 18280, c: 18320 }, // +3R hit
    ],
    priceLines: [
      { price: 18175, color: "#2962ff", title: "Entry", style: 0 },
      { price: 18155, color: "#ef5350", title: "SL -1R ($50)", style: 2 },
      { price: 18235, color: "#787b86", title: "+1R", style: 1 },
      { price: 18295, color: "#787b86", title: "+2R", style: 1 },
      { price: 18325, color: "#26a69a", title: "TP +3R ($150)", style: 2 },
    ],
    markers: [
      { time: t(3), position: "belowBar", color: "#2962ff", shape: "arrowUp", text: "Entry" },
      { time: t(6), position: "aboveBar", color: "#26a69a", shape: "circle", text: "+3R" },
    ],
    height: 350,
  } satisfies ScenarioData,
} as const;

/* ────────────────────────────────────────────
   LessonChart Component
   ──────────────────────────────────────────── */

export function LessonChart({ scenario }: { scenario: ChartScenario }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);

  const data = SCENARIOS[scenario];

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    const init = async () => {
      const { createChart, CandlestickSeries, ColorType, createSeriesMarkers } = await import("lightweight-charts");

      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: data.height ?? 300,
        layout: {
          background: { type: ColorType.Solid, color: "#0a0e1a" },
          textColor: "#787b86",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        },
        grid: {
          vertLines: { color: "#141824" },
          horzLines: { color: "#141824" },
        },
        crosshair: {
          vertLine: { color: "#758696", width: 1, style: 3, labelBackgroundColor: "#2962ff" },
          horzLine: { color: "#758696", width: 1, style: 3, labelBackgroundColor: "#2962ff" },
        },
        rightPriceScale: {
          borderColor: "#1e222d",
          scaleMargins: { top: 0.08, bottom: 0.08 },
        },
        timeScale: {
          borderColor: "#1e222d",
          timeVisible: false,
          rightOffset: 5,
          barSpacing: 16,
          fixLeftEdge: true,
          fixRightEdge: true,
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      type UTCTimestamp = import("lightweight-charts").UTCTimestamp;

      series.setData(data.candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      })));

      // Price lines
      for (const pl of data.priceLines) {
        series.createPriceLine({
          price: pl.price,
          color: pl.color,
          lineWidth: 1,
          lineStyle: pl.style ?? 2,
          axisLabelVisible: true,
          title: pl.title,
        });
      }

      // Markers
      if (data.markers.length > 0) {
        createSeriesMarkers(series, data.markers.map((m) => ({
          time: m.time as UTCTimestamp,
          position: m.position,
          color: m.color,
          shape: m.shape,
          text: m.text,
        })));
      }

      chart.timeScale().fitContent();
      chartRef.current = chart;

      // Resize
      const ro = new ResizeObserver(() => {
        if (containerRef.current && !disposed) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      });
      ro.observe(containerRef.current);

      return () => { ro.disconnect(); };
    };

    init();

    return () => {
      disposed = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0a0e1a] overflow-hidden mb-5">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e222d]" style={{ background: "#141417" }}>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#d1d4dc] font-bold font-mono">NQ1!</span>
          <div className="h-3 w-px bg-[#1e222d]" />
          <span className="text-[11px] text-[#787b86] font-mono">5</span>
          <div className="h-3 w-px bg-[#1e222d]" />
          <span className="text-[10px] text-[#787b86]">Cenário educacional</span>
        </div>
        <span className="text-[9px] text-white/20 font-mono">Interativo — mova o mouse</span>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

/** Check if a chart type has a live chart scenario */
export function hasLiveChart(chartType: string): chartType is ChartScenario {
  return chartType in SCENARIOS;
}
