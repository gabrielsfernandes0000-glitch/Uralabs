"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/* ────────────────────────────────────────────
   LessonChart — Didactic chart component

   Each scenario tells a story: numbered steps on the chart
   connect to labeled cards below explaining the WHY.

   Uses lightweight-charts (TradingView engine) for the candles,
   with a custom SVG overlay for zones, phases, and annotations
   that line up exactly with the price/time axes.
   ──────────────────────────────────────────── */

type Time = number;

interface Candle { time: Time; o: number; h: number; l: number; c: number; }

interface Phase {
  kind: "time" | "price";
  start: number;
  end: number;
  color: string;
  label: string;
}

interface Zone {
  startTime: Time;
  endTime: Time;
  topPrice: number;
  bottomPrice: number;
  color: string;
  label: string;
  style?: "solid" | "dashed";
}

interface Level {
  price: number;
  color: string;
  label: string;
  style?: "solid" | "dashed";
  important?: boolean;
}

interface Step { num: string; label: string; color: string; desc: string; }

interface Annotation {
  stepNum: string;
  time: Time;
  price: number;
  offset?: "above" | "below";
}

interface ScenarioData {
  title: string;
  candles: Candle[];
  phases?: Phase[];
  zones?: Zone[];
  levels?: Level[];
  steps?: Step[];
  annotations?: Annotation[];
  height?: number;
}

const BASE = 1744617000;
const t = (n: number) => BASE + n * 300;

/* ────────────────────────────────────────────
   Color Tokens (aligned with Elite platform palette)
   ──────────────────────────────────────────── */
const C = {
  brand:  "#FF5500",  // URA orange — primary accent
  blue:   "#3B82F6",  // Order Blocks
  purple: "#A855F7",  // FVG / imbalance
  gold:   "#F59E0B",  // Sessions / Fibonacci levels
  green:  "#10B981",  // Bullish / discount / distribution
  red:    "#EF4444",  // Bearish / premium / manipulation
  gray:   "#64748B",  // Neutral / structure
} as const;

/* ────────────────────────────────────────────
   SCENARIOS — richer data model with narrative
   ──────────────────────────────────────────── */

const SCENARIOS = {
  /* ────────── 1. AMD — Accumulation, Manipulation, Distribution ────────── */
  "amd-sweep": {
    title: "AMD · Acumulação → Manipulação → Distribuição",
    candles: [
      { time: t(0),  o: 18100, h: 18115, l: 18090, c: 18108 },
      { time: t(1),  o: 18108, h: 18118, l: 18095, c: 18102 },
      { time: t(2),  o: 18102, h: 18120, l: 18092, c: 18115 },
      { time: t(3),  o: 18115, h: 18122, l: 18098, c: 18105 },
      { time: t(4),  o: 18105, h: 18118, l: 18090, c: 18095 },
      { time: t(5),  o: 18095, h: 18112, l: 18088, c: 18108 },
      { time: t(6),  o: 18108, h: 18120, l: 18095, c: 18098 },
      { time: t(7),  o: 18098, h: 18115, l: 18085, c: 18110 },
      { time: t(8),  o: 18110, h: 18118, l: 18092, c: 18100 },
      { time: t(9),  o: 18100, h: 18112, l: 18088, c: 18095 },
      { time: t(10), o: 18095, h: 18100, l: 18055, c: 18060 },
      { time: t(11), o: 18060, h: 18065, l: 18030, c: 18035 },
      { time: t(12), o: 18035, h: 18042, l: 18010, c: 18018 },
      { time: t(13), o: 18018, h: 18025, l: 17985, c: 17992 },
      { time: t(14), o: 17992, h: 18050, l: 17980, c: 18042 },
      { time: t(15), o: 18042, h: 18085, l: 18038, c: 18078 },
      { time: t(16), o: 18078, h: 18115, l: 18072, c: 18108 },
      { time: t(17), o: 18108, h: 18145, l: 18100, c: 18138 },
      { time: t(18), o: 18138, h: 18172, l: 18130, c: 18165 },
      { time: t(19), o: 18165, h: 18200, l: 18158, c: 18192 },
      { time: t(20), o: 18192, h: 18228, l: 18185, c: 18220 },
      { time: t(21), o: 18220, h: 18255, l: 18215, c: 18248 },
    ],
    phases: [
      { kind: "time", start: t(0),  end: t(9),  color: C.purple, label: "Acumulação" },
      { kind: "time", start: t(10), end: t(13), color: C.red,    label: "Manipulação" },
      { kind: "time", start: t(14), end: t(21), color: C.green,  label: "Distribuição" },
    ],
    levels: [
      { price: 18120, color: "rgba(255,255,255,0.25)", label: "Range High", style: "dashed" },
      { price: 18085, color: "rgba(255,255,255,0.25)", label: "Range Low",  style: "dashed" },
      { price: 18250, color: C.green, label: "TP (BSL)", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Acumulação", color: C.purple, desc: "Range apertado. Institucionais posicionando silenciosamente. Não opere aqui — você vira isca." },
      { num: "2", label: "Manipulação", color: C.red,    desc: "Sweep varre os lows, pega sell stops. A liquidez é engolida — é a isca, não o movimento real." },
      { num: "3", label: "Distribuição", color: C.green,  desc: "Reversão com força. Movimento real busca BSL acima do range. Entrada ideal: na reversão." },
    ],
    annotations: [
      { stepNum: "1", time: t(4),  price: 18118, offset: "above" },
      { stepNum: "2", time: t(12), price: 18010, offset: "below" },
      { stepNum: "3", time: t(17), price: 18145, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 2. Order Block bounce ────────── */
  "ob-bounce": {
    title: "Order Block · Zona institucional defendida",
    candles: [
      { time: t(0),  o: 18200, h: 18215, l: 18195, c: 18210 },
      { time: t(1),  o: 18210, h: 18212, l: 18180, c: 18185 },
      { time: t(2),  o: 18185, h: 18240, l: 18182, c: 18235 },
      { time: t(3),  o: 18235, h: 18270, l: 18230, c: 18265 },
      { time: t(4),  o: 18265, h: 18300, l: 18258, c: 18295 },
      { time: t(5),  o: 18295, h: 18325, l: 18288, c: 18318 },
      { time: t(6),  o: 18318, h: 18340, l: 18310, c: 18335 },
      { time: t(7),  o: 18335, h: 18338, l: 18305, c: 18310 },
      { time: t(8),  o: 18310, h: 18315, l: 18280, c: 18285 },
      { time: t(9),  o: 18285, h: 18290, l: 18255, c: 18260 },
      { time: t(10), o: 18260, h: 18265, l: 18230, c: 18235 },
      { time: t(11), o: 18235, h: 18240, l: 18205, c: 18210 },
      { time: t(12), o: 18210, h: 18215, l: 18185, c: 18192 },
      { time: t(13), o: 18192, h: 18242, l: 18188, c: 18238 },
      { time: t(14), o: 18238, h: 18278, l: 18232, c: 18272 },
      { time: t(15), o: 18272, h: 18312, l: 18268, c: 18305 },
      { time: t(16), o: 18305, h: 18350, l: 18298, c: 18342 },
      { time: t(17), o: 18342, h: 18380, l: 18335, c: 18372 },
    ],
    zones: [
      { startTime: t(1), endTime: t(17), topPrice: 18212, bottomPrice: 18180, color: C.blue, label: "OB" },
    ],
    steps: [
      { num: "1", label: "OB formado", color: C.blue,  desc: "Último candle bearish antes do impulso bullish. Marca onde institucionais se posicionaram comprados." },
      { num: "2", label: "Pullback",   color: C.gray,  desc: "Preço retorna pra mitigar a zona. Testa se os institucionais ainda defendem o nível." },
      { num: "3", label: "Reação",     color: C.green, desc: "Engulfing bullish no OB confirma defesa. Entrada aqui, stop abaixo da zona inteira." },
    ],
    annotations: [
      { stepNum: "1", time: t(1),  price: 18180, offset: "below" },
      { stepNum: "2", time: t(12), price: 18185, offset: "below" },
      { stepNum: "3", time: t(13), price: 18242, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 3. FVG — Fair Value Gap fill ────────── */
  "fvg-fill": {
    title: "FVG · Desequilíbrio preenchido",
    candles: [
      { time: t(0),  o: 18100, h: 18115, l: 18090, c: 18110 },
      { time: t(1),  o: 18110, h: 18120, l: 18105, c: 18115 },
      { time: t(2),  o: 18115, h: 18125, l: 18108, c: 18120 },
      { time: t(3),  o: 18120, h: 18190, l: 18118, c: 18185 },
      { time: t(4),  o: 18185, h: 18220, l: 18178, c: 18215 },
      { time: t(5),  o: 18215, h: 18250, l: 18210, c: 18245 },
      { time: t(6),  o: 18245, h: 18265, l: 18238, c: 18258 },
      { time: t(7),  o: 18258, h: 18262, l: 18230, c: 18235 },
      { time: t(8),  o: 18235, h: 18238, l: 18200, c: 18205 },
      { time: t(9),  o: 18205, h: 18210, l: 18178, c: 18182 },
      { time: t(10), o: 18182, h: 18185, l: 18158, c: 18165 },
      { time: t(11), o: 18165, h: 18210, l: 18160, c: 18205 },
      { time: t(12), o: 18205, h: 18245, l: 18200, c: 18240 },
      { time: t(13), o: 18240, h: 18278, l: 18235, c: 18272 },
      { time: t(14), o: 18272, h: 18308, l: 18268, c: 18300 },
    ],
    zones: [
      { startTime: t(2), endTime: t(14), topPrice: 18178, bottomPrice: 18125, color: C.purple, label: "FVG", style: "dashed" },
    ],
    levels: [
      { price: 18152, color: C.purple, label: "CE (50%)", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Impulso deixa gap",  color: C.purple, desc: "Candle grande não preenchido pelos vizinhos. O vácuo é o FVG — ordens institucionais não executadas." },
      { num: "2", label: "Preenchimento",      color: C.gray,   desc: "Preço volta pra dentro do gap. O 50% (Consequent Encroachment) é o ponto de equilíbrio mais forte." },
      { num: "3", label: "Reação",             color: C.green,  desc: "Gap defendido. Movimento continua na direção original, com desconto melhor." },
    ],
    annotations: [
      { stepNum: "1", time: t(3),  price: 18120, offset: "below" },
      { stepNum: "2", time: t(10), price: 18158, offset: "below" },
      { stepNum: "3", time: t(11), price: 18210, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 4. Premium × Discount ────────── */
  "premium-discount": {
    title: "Premium × Discount · Zonas de valor",
    candles: [
      { time: t(0),  o: 18480, h: 18500, l: 18470, c: 18495 },
      { time: t(1),  o: 18495, h: 18498, l: 18460, c: 18465 },
      { time: t(2),  o: 18465, h: 18470, l: 18420, c: 18425 },
      { time: t(3),  o: 18425, h: 18435, l: 18380, c: 18390 },
      { time: t(4),  o: 18390, h: 18400, l: 18340, c: 18350 },
      { time: t(5),  o: 18350, h: 18360, l: 18300, c: 18310 },
      { time: t(6),  o: 18310, h: 18320, l: 18270, c: 18280 },
      { time: t(7),  o: 18280, h: 18290, l: 18240, c: 18250 },
      { time: t(8),  o: 18250, h: 18260, l: 18200, c: 18210 },
      { time: t(9),  o: 18210, h: 18220, l: 18000, c: 18005 },
      { time: t(10), o: 18005, h: 18080, l: 18000, c: 18072 },
      { time: t(11), o: 18072, h: 18150, l: 18068, c: 18142 },
      { time: t(12), o: 18142, h: 18220, l: 18135, c: 18215 },
      { time: t(13), o: 18215, h: 18290, l: 18210, c: 18285 },
      { time: t(14), o: 18285, h: 18360, l: 18280, c: 18350 },
      { time: t(15), o: 18350, h: 18370, l: 18300, c: 18310 },
      { time: t(16), o: 18310, h: 18320, l: 18260, c: 18270 },
    ],
    phases: [
      { kind: "price", start: 18250, end: 18500, color: C.red,   label: "Premium" },
      { kind: "price", start: 18000, end: 18250, color: C.green, label: "Discount" },
    ],
    levels: [
      { price: 18500, color: "rgba(255,255,255,0.30)", label: "Swing High" },
      { price: 18250, color: C.brand, label: "Equilíbrio · 50%", important: true },
      { price: 18000, color: "rgba(255,255,255,0.30)", label: "Swing Low" },
    ],
    steps: [
      { num: "1", label: "Define o range",  color: C.gray,  desc: "Swing High até Swing Low — a distância completa do movimento recente." },
      { num: "2", label: "Equilíbrio 50%",  color: C.brand, desc: "Linha de Fibonacci 50% divide zona cara (premium) de zona barata (discount)." },
      { num: "3", label: "Preço em premium", color: C.red,  desc: "Institucionais vendem em premium. Comprar aqui é pagar caro — espere discount pra entradas de compra." },
    ],
    annotations: [
      { stepNum: "1", time: t(0),  price: 18495, offset: "above" },
      { stepNum: "2", time: t(12), price: 18220, offset: "above" },
      { stepNum: "3", time: t(14), price: 18360, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 5. Liquidity Sweep ────────── */
  "liquidity-sweep": {
    title: "Sweep de liquidez · Triple bottom varrido",
    candles: [
      { time: t(0),  o: 18200, h: 18220, l: 18180, c: 18210 },
      { time: t(1),  o: 18210, h: 18240, l: 18200, c: 18235 },
      { time: t(2),  o: 18235, h: 18250, l: 18180, c: 18185 },
      { time: t(3),  o: 18185, h: 18230, l: 18178, c: 18225 },
      { time: t(4),  o: 18225, h: 18260, l: 18215, c: 18255 },
      { time: t(5),  o: 18255, h: 18270, l: 18182, c: 18188 },
      { time: t(6),  o: 18188, h: 18240, l: 18180, c: 18232 },
      { time: t(7),  o: 18232, h: 18265, l: 18225, c: 18260 },
      { time: t(8),  o: 18260, h: 18275, l: 18185, c: 18190 },
      { time: t(9),  o: 18190, h: 18195, l: 18140, c: 18148 },
      { time: t(10), o: 18148, h: 18152, l: 18120, c: 18128 },
      { time: t(11), o: 18128, h: 18200, l: 18122, c: 18195 },
      { time: t(12), o: 18195, h: 18260, l: 18190, c: 18252 },
      { time: t(13), o: 18252, h: 18310, l: 18248, c: 18305 },
      { time: t(14), o: 18305, h: 18365, l: 18298, c: 18358 },
      { time: t(15), o: 18358, h: 18410, l: 18350, c: 18402 },
    ],
    zones: [
      { startTime: t(0),  endTime: t(10), topPrice: 18185, bottomPrice: 18175, color: C.red, label: "Pool SSL", style: "dashed" },
    ],
    levels: [
      { price: 18120, color: C.red, label: "Sweep Low" },
    ],
    steps: [
      { num: "1", label: "Equal lows formam pool",  color: C.red,   desc: "3 fundos iguais. Sell stops de quem comprou no suporte acumulam logo abaixo." },
      { num: "2", label: "Sweep varre",              color: C.purple, desc: "Candle rompe abaixo de todos os lows. Institucionais pegam a liquidez — não é breakout real." },
      { num: "3", label: "Reversão",                 color: C.green, desc: "Engulfing forte inverte imediatamente. Movimento real começa na direção oposta ao sweep." },
    ],
    annotations: [
      { stepNum: "1", time: t(5),  price: 18180, offset: "below" },
      { stepNum: "2", time: t(10), price: 18120, offset: "below" },
      { stepNum: "3", time: t(11), price: 18200, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 6. Sessions — Asia → London → NY ────────── */
  "session-asia": {
    title: "Sessões · Asia → Londres → NY",
    candles: [
      { time: t(0),  o: 18200, h: 18218, l: 18192, c: 18210 },
      { time: t(1),  o: 18210, h: 18222, l: 18198, c: 18205 },
      { time: t(2),  o: 18205, h: 18220, l: 18195, c: 18215 },
      { time: t(3),  o: 18215, h: 18225, l: 18200, c: 18208 },
      { time: t(4),  o: 18208, h: 18222, l: 18195, c: 18218 },
      { time: t(5),  o: 18218, h: 18228, l: 18202, c: 18210 },
      { time: t(6),  o: 18210, h: 18248, l: 18205, c: 18242 },
      { time: t(7),  o: 18242, h: 18258, l: 18235, c: 18255 },
      { time: t(8),  o: 18255, h: 18260, l: 18210, c: 18215 },
      { time: t(9),  o: 18215, h: 18220, l: 18175, c: 18180 },
      { time: t(10), o: 18180, h: 18185, l: 18145, c: 18150 },
      { time: t(11), o: 18150, h: 18158, l: 18115, c: 18120 },
      { time: t(12), o: 18120, h: 18125, l: 18080, c: 18088 },
      { time: t(13), o: 18088, h: 18095, l: 18050, c: 18058 },
      { time: t(14), o: 18058, h: 18065, l: 18025, c: 18035 },
    ],
    phases: [
      { kind: "time", start: t(0),  end: t(5),  color: C.blue,  label: "Asia" },
      { kind: "time", start: t(6),  end: t(11), color: C.gold,  label: "Londres" },
      { kind: "time", start: t(12), end: t(14), color: C.brand, label: "New York" },
    ],
    levels: [
      { price: 18228, color: "rgba(255,255,255,0.25)", label: "Asia High", style: "dashed" },
      { price: 18192, color: "rgba(255,255,255,0.25)", label: "Asia Low",  style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Asia · range",     color: C.blue,  desc: "Volume baixo, preço lateralizado. Liquidez acumula acima/abaixo do range." },
      { num: "2", label: "Londres · sweep",  color: C.gold,  desc: "Rompe Asia High falsamente, pega buy stops e reverte. É o Judas." },
      { num: "3", label: "NY · continuação", color: C.brand, desc: "Movimento real bearish. New York dá continuidade ao que Londres iniciou." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18195, offset: "below" },
      { stepNum: "2", time: t(7),  price: 18258, offset: "above" },
      { stepNum: "3", time: t(13), price: 18050, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 7. Judas Swing ────────── */
  "judas-swing": {
    title: "Judas Swing · Falso movimento na abertura",
    candles: [
      { time: t(0),  o: 18150, h: 18172, l: 18142, c: 18168 },
      { time: t(1),  o: 18168, h: 18185, l: 18160, c: 18180 },
      { time: t(2),  o: 18180, h: 18198, l: 18175, c: 18192 },
      { time: t(3),  o: 18192, h: 18205, l: 18188, c: 18200 },
      { time: t(4),  o: 18200, h: 18205, l: 18158, c: 18162 },
      { time: t(5),  o: 18162, h: 18168, l: 18130, c: 18135 },
      { time: t(6),  o: 18135, h: 18140, l: 18108, c: 18115 },
      { time: t(7),  o: 18115, h: 18180, l: 18110, c: 18175 },
      { time: t(8),  o: 18175, h: 18230, l: 18170, c: 18225 },
      { time: t(9),  o: 18225, h: 18278, l: 18220, c: 18272 },
      { time: t(10), o: 18272, h: 18325, l: 18268, c: 18318 },
      { time: t(11), o: 18318, h: 18370, l: 18312, c: 18365 },
      { time: t(12), o: 18365, h: 18410, l: 18358, c: 18405 },
    ],
    phases: [
      { kind: "time", start: t(4),  end: t(6),  color: C.red,   label: "Judas (falso)" },
      { kind: "time", start: t(7),  end: t(12), color: C.green, label: "Movimento real" },
    ],
    levels: [
      { price: 18200, color: "rgba(255,255,255,0.30)", label: "Abertura", style: "dashed" },
      { price: 18108, color: C.red, label: "Judas Low", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Viés bullish",    color: C.green, desc: "Pré-market sinaliza alta. Esperado: compras após NY abrir." },
      { num: "2", label: "Judas bearish",   color: C.red,   desc: "NY abre com spike pra baixo. É o movimento oposto ao viés — isca clássica." },
      { num: "3", label: "Reversão real",   color: C.green, desc: "Preço inverte forte na direção do viés original. Essa é a entrada." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18175, offset: "below" },
      { stepNum: "2", time: t(6),  price: 18108, offset: "below" },
      { stepNum: "3", time: t(7),  price: 18180, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 8. SMT Divergence ────────── */
  "smt-diverge": {
    title: "SMT Divergence · NQ × ES",
    candles: [
      { time: t(0),  o: 18200, h: 18230, l: 18190, c: 18225 },
      { time: t(1),  o: 18225, h: 18260, l: 18218, c: 18255 },
      { time: t(2),  o: 18255, h: 18290, l: 18248, c: 18285 },
      { time: t(3),  o: 18285, h: 18320, l: 18278, c: 18310 },
      { time: t(4),  o: 18310, h: 18315, l: 18275, c: 18280 },
      { time: t(5),  o: 18280, h: 18285, l: 18245, c: 18250 },
      { time: t(6),  o: 18250, h: 18270, l: 18240, c: 18265 },
      { time: t(7),  o: 18265, h: 18300, l: 18258, c: 18295 },
      { time: t(8),  o: 18295, h: 18335, l: 18288, c: 18328 },
      { time: t(9),  o: 18328, h: 18332, l: 18290, c: 18295 },
      { time: t(10), o: 18295, h: 18300, l: 18250, c: 18258 },
      { time: t(11), o: 18258, h: 18265, l: 18210, c: 18218 },
      { time: t(12), o: 18218, h: 18225, l: 18170, c: 18180 },
    ],
    levels: [
      { price: 18320, color: "rgba(255,255,255,0.25)", label: "High 1", style: "dashed" },
      { price: 18335, color: C.red, label: "HH · NQ só", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "NQ faz High 1",     color: C.gray,  desc: "Primeiro topo marcado. ES (índice correlacionado) também marca topo próximo." },
      { num: "2", label: "NQ higher high",    color: C.red,   desc: "NQ rompe pra cima, mas ES não confirma — diverge, falhando em fazer HH." },
      { num: "3", label: "Reversão",          color: C.green, desc: "Divergência = manipulação. O HH do NQ foi sweep de liquidez, não movimento real." },
    ],
    annotations: [
      { stepNum: "1", time: t(3),  price: 18320, offset: "above" },
      { stepNum: "2", time: t(8),  price: 18335, offset: "above" },
      { stepNum: "3", time: t(10), price: 18300, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 9. Entry setup — full trade ────────── */
  "entry-setup": {
    title: "Setup completo · Entry · Stop · Alvo",
    candles: [
      { time: t(0),  o: 18200, h: 18215, l: 18190, c: 18208 },
      { time: t(1),  o: 18208, h: 18220, l: 18195, c: 18198 },
      { time: t(2),  o: 18198, h: 18250, l: 18195, c: 18245 },
      { time: t(3),  o: 18245, h: 18280, l: 18240, c: 18275 },
      { time: t(4),  o: 18275, h: 18300, l: 18268, c: 18295 },
      { time: t(5),  o: 18295, h: 18298, l: 18260, c: 18265 },
      { time: t(6),  o: 18265, h: 18270, l: 18228, c: 18232 },
      { time: t(7),  o: 18232, h: 18238, l: 18195, c: 18200 },
      { time: t(8),  o: 18200, h: 18205, l: 18178, c: 18182 },
      { time: t(9),  o: 18182, h: 18230, l: 18175, c: 18225 },
      { time: t(10), o: 18225, h: 18268, l: 18220, c: 18262 },
      { time: t(11), o: 18262, h: 18305, l: 18258, c: 18298 },
      { time: t(12), o: 18298, h: 18345, l: 18292, c: 18340 },
      { time: t(13), o: 18340, h: 18382, l: 18335, c: 18378 },
      { time: t(14), o: 18378, h: 18415, l: 18372, c: 18410 },
    ],
    zones: [
      { startTime: t(1), endTime: t(9), topPrice: 18220, bottomPrice: 18195, color: C.blue, label: "OB + FVG" },
    ],
    levels: [
      { price: 18195, color: C.blue,  label: "Entry",      important: true },
      { price: 18170, color: C.red,   label: "SL · −1R",   style: "dashed" },
      { price: 18420, color: C.green, label: "TP · +3R",   style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Contexto",          color: C.gray,  desc: "Impulse bullish deixa OB na formação. Marca a zona com o último candle bearish." },
      { num: "2", label: "Pullback + sweep",  color: C.purple, desc: "Preço retorna, varre o entry e toca no OB com FVG interno. Confluência tripla." },
      { num: "3", label: "Execução",          color: C.green, desc: "Engulfing confirma. Entry 18.195 · SL 18.170 (−1R) · TP 18.420 (+3R). Alvo: 1:9." },
    ],
    annotations: [
      { stepNum: "1", time: t(1),  price: 18220, offset: "above" },
      { stepNum: "2", time: t(8),  price: 18178, offset: "below" },
      { stepNum: "3", time: t(9),  price: 18230, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 10. Candle anatomy ────────── */
  "candle-anatomy": {
    title: "Leitura de Candle · Corpo × Pavio",
    candles: [
      { time: t(0), o: 18200, h: 18225, l: 18185, c: 18220 },
      { time: t(1), o: 18220, h: 18250, l: 18190, c: 18195 },
      { time: t(2), o: 18195, h: 18210, l: 18192, c: 18208 },
      { time: t(3), o: 18208, h: 18260, l: 18205, c: 18255 },
      { time: t(4), o: 18255, h: 18290, l: 18248, c: 18252 },
      { time: t(5), o: 18252, h: 18285, l: 18250, c: 18280 },
      { time: t(6), o: 18280, h: 18282, l: 18240, c: 18245 },
    ],
    steps: [
      { num: "1", label: "Corpo grande",  color: C.green, desc: "Corpo grande = convicção. Mostra qual lado dominou: verde = compradores, vermelho = vendedores." },
      { num: "2", label: "Doji",          color: C.gold,  desc: "Corpo pequeno com pavios longos = indecisão. Em zona importante, pode preceder reversão." },
      { num: "3", label: "Rejeição",      color: C.red,   desc: "Pavio longo rejeitando um nível = o preço testou e foi empurrado de volta. Sinal de força oposta." },
    ],
    annotations: [
      { stepNum: "1", time: t(3), price: 18260, offset: "above" },
      { stepNum: "2", time: t(4), price: 18290, offset: "above" },
      { stepNum: "3", time: t(6), price: 18240, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 11. Risk shield — 1:3 RR visualization ────────── */
  "risk-shield": {
    title: "Gestão de Risco · Por que 1:3?",
    candles: [
      { time: t(0), o: 18200, h: 18215, l: 18192, c: 18210 },
      { time: t(1), o: 18210, h: 18212, l: 18185, c: 18190 },
      { time: t(2), o: 18190, h: 18195, l: 18170, c: 18175 },
      { time: t(3), o: 18175, h: 18220, l: 18172, c: 18215 },
      { time: t(4), o: 18215, h: 18255, l: 18210, c: 18250 },
      { time: t(5), o: 18250, h: 18290, l: 18245, c: 18285 },
      { time: t(6), o: 18285, h: 18325, l: 18280, c: 18320 },
    ],
    phases: [
      { kind: "price", start: 18155, end: 18175, color: C.red,   label: "Risco · 1R" },
      { kind: "price", start: 18175, end: 18325, color: C.green, label: "Lucro · 3R" },
    ],
    levels: [
      { price: 18175, color: C.blue,  label: "Entry",       important: true },
      { price: 18155, color: C.red,   label: "SL · −1R ($50)", style: "dashed" },
      { price: 18235, color: "rgba(255,255,255,0.20)", label: "+1R" },
      { price: 18295, color: "rgba(255,255,255,0.20)", label: "+2R" },
      { price: 18325, color: C.green, label: "TP · +3R ($150)", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Define 1R",         color: C.blue,  desc: "Distância entre entry e stop = 1R. Nesse trade: 20 pontos = $50 de risco." },
      { num: "2", label: "Parcial em +1.5R",  color: C.gold,  desc: "Realiza 50%, move stop pro breakeven. Garante lucro com risco zero no restante." },
      { num: "3", label: "Target +3R",        color: C.green, desc: "Assimetria mata: 1 win paga 3 losses. Win rate de 40% já é lucrativo com 1:3." },
    ],
    annotations: [
      { stepNum: "1", time: t(3), price: 18175, offset: "below" },
      { stepNum: "2", time: t(4), price: 18255, offset: "above" },
      { stepNum: "3", time: t(6), price: 18325, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 12. BOS continuação ────────── */
  "bos-continuation": {
    title: "BOS · Break of Structure em continuação",
    candles: [
      { time: t(0),  o: 18050, h: 18062, l: 18042, c: 18058 },
      { time: t(1),  o: 18058, h: 18080, l: 18052, c: 18075 },
      { time: t(2),  o: 18075, h: 18092, l: 18068, c: 18088 },
      { time: t(3),  o: 18088, h: 18095, l: 18062, c: 18068 },
      { time: t(4),  o: 18068, h: 18078, l: 18060, c: 18074 },
      { time: t(5),  o: 18074, h: 18110, l: 18072, c: 18105 },
      { time: t(6),  o: 18105, h: 18132, l: 18100, c: 18128 },
      { time: t(7),  o: 18128, h: 18138, l: 18108, c: 18115 },
      { time: t(8),  o: 18115, h: 18125, l: 18102, c: 18120 },
      { time: t(9),  o: 18120, h: 18165, l: 18118, c: 18160 },
      { time: t(10), o: 18160, h: 18180, l: 18152, c: 18175 },
      { time: t(11), o: 18175, h: 18195, l: 18168, c: 18188 },
      { time: t(12), o: 18188, h: 18210, l: 18180, c: 18205 },
    ],
    levels: [
      { price: 18138, color: C.gray, label: "Last HH (alvo BOS)", style: "dashed" },
      { price: 18195, color: C.green, label: "BOS confirmed", important: true },
      { price: 18102, color: C.red, label: "Invalidação (último HL)", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "HL formado",   color: C.blue,  desc: "Após pullback, preço faz Higher Low — estrutura bullish confirmada. Primeiro sinal de continuação." },
      { num: "2", label: "BOS body-close", color: C.green, desc: "Close BODY acima do último HH. BOS real — wick-only não conta. Continuação validada." },
      { num: "3", label: "Extensão",      color: C.brand, desc: "Após BOS, preço segue pra próxima zona de liquidez. Stop fica no último HL (18102)." },
    ],
    annotations: [
      { stepNum: "1", time: t(4),  price: 18060, offset: "below" },
      { stepNum: "2", time: t(9),  price: 18165, offset: "above" },
      { stepNum: "3", time: t(12), price: 18210, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 13. CHoCH reversão ────────── */
  "choch-reversal": {
    title: "CHoCH · Change of Character",
    candles: [
      { time: t(0),  o: 18200, h: 18215, l: 18195, c: 18210 },
      { time: t(1),  o: 18210, h: 18235, l: 18205, c: 18230 },
      { time: t(2),  o: 18230, h: 18260, l: 18225, c: 18255 },
      { time: t(3),  o: 18255, h: 18275, l: 18240, c: 18248 },
      { time: t(4),  o: 18248, h: 18258, l: 18235, c: 18242 },
      { time: t(5),  o: 18242, h: 18285, l: 18240, c: 18278 },
      { time: t(6),  o: 18278, h: 18290, l: 18265, c: 18270 },
      { time: t(7),  o: 18270, h: 18275, l: 18238, c: 18242 },
      { time: t(8),  o: 18242, h: 18248, l: 18220, c: 18225 },
      { time: t(9),  o: 18225, h: 18230, l: 18200, c: 18205 },
      { time: t(10), o: 18205, h: 18212, l: 18180, c: 18185 },
      { time: t(11), o: 18185, h: 18192, l: 18165, c: 18170 },
      { time: t(12), o: 18170, h: 18178, l: 18150, c: 18155 },
    ],
    levels: [
      { price: 18235, color: C.gray, label: "Last HL (alvo CHoCH)", style: "dashed" },
      { price: 18290, color: C.gray, label: "Last HH", style: "dashed" },
      { price: 18220, color: C.red,  label: "CHoCH — fechou abaixo", important: true },
    ],
    steps: [
      { num: "1", label: "Trend bullish",  color: C.green, desc: "HH/HL consecutivos. Mercado em alta clara — longs confortáveis." },
      { num: "2", label: "Falha de HL",     color: C.gold,  desc: "Primeira falha — preço não consegue criar novo HL. Alerta de enfraquecimento." },
      { num: "3", label: "CHoCH confirmado", color: C.red,   desc: "Close abaixo do último HL. Character change. Viés flipa bearish." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18260, offset: "above" },
      { stepNum: "2", time: t(6),  price: 18290, offset: "above" },
      { stepNum: "3", time: t(9),  price: 18200, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 14. Breaker Block ────────── */
  "breaker-block": {
    title: "Breaker Block · OB que falhou vira zona inversa",
    candles: [
      { time: t(0),  o: 18150, h: 18155, l: 18120, c: 18125 },
      { time: t(1),  o: 18125, h: 18130, l: 18095, c: 18102 },
      { time: t(2),  o: 18102, h: 18142, l: 18098, c: 18138 },
      { time: t(3),  o: 18138, h: 18168, l: 18132, c: 18162 },
      { time: t(4),  o: 18162, h: 18175, l: 18148, c: 18155 },
      { time: t(5),  o: 18155, h: 18158, l: 18128, c: 18132 },
      { time: t(6),  o: 18132, h: 18135, l: 18095, c: 18098 },
      { time: t(7),  o: 18098, h: 18105, l: 18075, c: 18082 },
      { time: t(8),  o: 18082, h: 18088, l: 18060, c: 18065 },
      { time: t(9),  o: 18065, h: 18102, l: 18060, c: 18098 },
      { time: t(10), o: 18098, h: 18128, l: 18092, c: 18122 },
      { time: t(11), o: 18122, h: 18135, l: 18115, c: 18128 },
      { time: t(12), o: 18128, h: 18132, l: 18108, c: 18112 },
      { time: t(13), o: 18112, h: 18115, l: 18080, c: 18085 },
    ],
    zones: [
      { startTime: t(0),  endTime: t(5),  topPrice: 18130, bottomPrice: 18115, color: C.blue,  label: "OB bullish (falhou)" },
      { startTime: t(9),  endTime: t(13), topPrice: 18130, bottomPrice: 18115, color: C.red,   label: "Breaker Block (bearish)" },
    ],
    levels: [
      { price: 18060, color: C.gray, label: "Low do movimento", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "OB bullish",     color: C.blue, desc: "OB marcado no candle bearish antes do impulso bullish. Zona de demanda original." },
      { num: "2", label: "OB violado",     color: C.red,  desc: "Preço quebra o OB com force — demanda falhou. Not a valid demand anymore." },
      { num: "3", label: "BB em retest",   color: C.red,  desc: "Preço volta e testa a zona pelo lado oposto. Agora é supply (Breaker Block). Setup short." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18122, offset: "above" },
      { stepNum: "2", time: t(7),  price: 18075, offset: "below" },
      { stepNum: "3", time: t(11), price: 18135, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 15. Equal Highs sweep ────────── */
  "equal-highs": {
    title: "Equal Highs · Pool de liquidez e varrimento",
    candles: [
      { time: t(0),  o: 18100, h: 18155, l: 18098, c: 18150 },
      { time: t(1),  o: 18150, h: 18158, l: 18135, c: 18142 },
      { time: t(2),  o: 18142, h: 18148, l: 18120, c: 18125 },
      { time: t(3),  o: 18125, h: 18155, l: 18122, c: 18152 },
      { time: t(4),  o: 18152, h: 18158, l: 18138, c: 18145 },
      { time: t(5),  o: 18145, h: 18150, l: 18125, c: 18130 },
      { time: t(6),  o: 18130, h: 18157, l: 18128, c: 18150 },
      { time: t(7),  o: 18150, h: 18172, l: 18148, c: 18162 },
      { time: t(8),  o: 18162, h: 18168, l: 18145, c: 18148 },
      { time: t(9),  o: 18148, h: 18155, l: 18128, c: 18135 },
      { time: t(10), o: 18135, h: 18142, l: 18108, c: 18112 },
      { time: t(11), o: 18112, h: 18118, l: 18082, c: 18088 },
      { time: t(12), o: 18088, h: 18092, l: 18055, c: 18062 },
    ],
    levels: [
      { price: 18158, color: C.red, label: "Equal Highs · BSL", style: "dashed", important: true },
      { price: 18172, color: C.red, label: "Sweep topo", style: "dashed" },
    ],
    zones: [
      { startTime: t(0), endTime: t(6), topPrice: 18160, bottomPrice: 18155, color: C.red, label: "Pool de stops" },
    ],
    steps: [
      { num: "1", label: "Equal Highs",   color: C.red,   desc: "Três highs no mesmo nível. Traders colocam stops acima — pool de liquidez se forma." },
      { num: "2", label: "Sweep violento", color: C.gold,  desc: "Preço perfura os highs, caça stops. Wick longo + close de volta abaixo." },
      { num: "3", label: "Reversão",      color: C.green,  desc: "Após sweep, reverte com força. Institucionais pegaram liquidez, agora direção real. Short." },
    ],
    annotations: [
      { stepNum: "1", time: t(3),  price: 18155, offset: "above" },
      { stepNum: "2", time: t(7),  price: 18175, offset: "above" },
      { stepNum: "3", time: t(11), price: 18082, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 16. London Judas Swing ────────── */
  "london-judas": {
    title: "London Judas · Sweep do Asia range + reversão",
    candles: [
      { time: t(0),  o: 18080, h: 18092, l: 18075, c: 18088 },
      { time: t(1),  o: 18088, h: 18095, l: 18082, c: 18085 },
      { time: t(2),  o: 18085, h: 18098, l: 18078, c: 18092 },
      { time: t(3),  o: 18092, h: 18100, l: 18080, c: 18084 },
      { time: t(4),  o: 18084, h: 18092, l: 18076, c: 18090 },
      { time: t(5),  o: 18090, h: 18097, l: 18082, c: 18085 },
      { time: t(6),  o: 18085, h: 18108, l: 18083, c: 18104 },
      { time: t(7),  o: 18104, h: 18122, l: 18100, c: 18118 },
      { time: t(8),  o: 18118, h: 18125, l: 18102, c: 18105 },
      { time: t(9),  o: 18105, h: 18110, l: 18075, c: 18080 },
      { time: t(10), o: 18080, h: 18085, l: 18052, c: 18058 },
      { time: t(11), o: 18058, h: 18062, l: 18032, c: 18038 },
      { time: t(12), o: 18038, h: 18045, l: 18018, c: 18022 },
    ],
    phases: [
      { kind: "time", start: t(0),  end: t(5),  color: C.blue,  label: "Asia" },
      { kind: "time", start: t(6),  end: t(12), color: C.gold,  label: "London" },
    ],
    levels: [
      { price: 18100, color: C.blue, label: "Asia High", style: "dashed" },
      { price: 18075, color: C.blue, label: "Asia Low", style: "dashed" },
      { price: 18125, color: C.red,  label: "Judas sweep", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Asia range",     color: C.blue, desc: "Asia session lateraliza 18075-18100. Range apertado = acumulação silenciosa." },
      { num: "2", label: "Judas sweep",    color: C.red,  desc: "London abre, empurra acima do Asia High, pega buy stops. Armadilha — direção fake." },
      { num: "3", label: "Direção real",   color: C.green, desc: "Reverte violento pra baixo. A direção institucional real era bearish. Short após sweep." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18076, offset: "below" },
      { stepNum: "2", time: t(8),  price: 18127, offset: "above" },
      { stepNum: "3", time: t(11), price: 18030, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 17. Hammer setup ────────── */
  "hammer-demand": {
    title: "Hammer · Rejeição em zona de demanda",
    candles: [
      { time: t(0),  o: 18150, h: 18155, l: 18130, c: 18135 },
      { time: t(1),  o: 18135, h: 18138, l: 18108, c: 18112 },
      { time: t(2),  o: 18112, h: 18115, l: 18088, c: 18092 },
      { time: t(3),  o: 18092, h: 18098, l: 18068, c: 18072 },
      { time: t(4),  o: 18072, h: 18078, l: 18050, c: 18055 },
      { time: t(5),  o: 18055, h: 18078, l: 18025, c: 18072 },
      { time: t(6),  o: 18072, h: 18095, l: 18068, c: 18090 },
      { time: t(7),  o: 18090, h: 18115, l: 18088, c: 18112 },
      { time: t(8),  o: 18112, h: 18138, l: 18108, c: 18132 },
      { time: t(9),  o: 18132, h: 18158, l: 18128, c: 18152 },
      { time: t(10), o: 18152, h: 18175, l: 18148, c: 18170 },
    ],
    zones: [
      { startTime: t(0), endTime: t(10), topPrice: 18075, bottomPrice: 18055, color: C.green, label: "Zona de demanda H4" },
    ],
    levels: [
      { price: 18025, color: C.red,   label: "Low do hammer", style: "dashed" },
      { price: 18078, color: C.green, label: "High do hammer", style: "dashed", important: true },
    ],
    steps: [
      { num: "1", label: "Queda livre",    color: C.red,   desc: "Preço cai agressivo em direção à zona de demanda H4. Atmosfera bearish." },
      { num: "2", label: "Hammer na zona", color: C.gold,  desc: "Candle com pavio longo inferior + corpo pequeno no topo. Compradores rejeitaram violentamente o low." },
      { num: "3", label: "Continuação",    color: C.green, desc: "Após hammer, preço inverte direção. Entry: break do high do hammer. Stop: abaixo do low do pavio." },
    ],
    annotations: [
      { stepNum: "1", time: t(3),  price: 18068, offset: "below" },
      { stepNum: "2", time: t(5),  price: 18025, offset: "below" },
      { stepNum: "3", time: t(9),  price: 18160, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 18. Engulfing bearish em supply ────────── */
  "engulfing-supply": {
    title: "Engulfing bearish · Reversão em zona de supply",
    candles: [
      { time: t(0),  o: 18180, h: 18195, l: 18175, c: 18192 },
      { time: t(1),  o: 18192, h: 18215, l: 18188, c: 18210 },
      { time: t(2),  o: 18210, h: 18235, l: 18205, c: 18232 },
      { time: t(3),  o: 18232, h: 18262, l: 18228, c: 18258 },
      { time: t(4),  o: 18258, h: 18285, l: 18252, c: 18280 },
      { time: t(5),  o: 18280, h: 18298, l: 18275, c: 18295 },
      { time: t(6),  o: 18295, h: 18298, l: 18258, c: 18262 },
      { time: t(7),  o: 18262, h: 18268, l: 18232, c: 18238 },
      { time: t(8),  o: 18238, h: 18245, l: 18215, c: 18220 },
      { time: t(9),  o: 18220, h: 18228, l: 18198, c: 18205 },
      { time: t(10), o: 18205, h: 18212, l: 18180, c: 18188 },
    ],
    zones: [
      { startTime: t(0), endTime: t(10), topPrice: 18300, bottomPrice: 18280, color: C.red, label: "Zona de supply H4" },
    ],
    levels: [
      { price: 18298, color: C.red, label: "High da engulfing", style: "dashed" },
      { price: 18258, color: C.red, label: "Close da engulfing", style: "dashed", important: true },
    ],
    steps: [
      { num: "1", label: "Subida forte",       color: C.green, desc: "Preço sobe em direção à zona de supply H4. Bullish euphoria no final do move." },
      { num: "2", label: "Engulfing bearish",  color: C.red,   desc: "Candle bearish com corpo que engole o bullish anterior. Vendedores absorveram + dominaram." },
      { num: "3", label: "Queda confirmada",   color: C.red,   desc: "Sequência bearish segue. Entry: break do low da engulfing. Stop: acima do high." },
    ],
    annotations: [
      { stepNum: "1", time: t(4),  price: 18288, offset: "above" },
      { stepNum: "2", time: t(6),  price: 18300, offset: "above" },
      { stepNum: "3", time: t(10), price: 18178, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 20. Range Bounds (Premium/Discount) ────────── */
  "range-bounds": {
    title: "Range · Premium e Discount",
    candles: [
      { time: t(0),  o: 18020, h: 18040, l: 18005, c: 18035 },
      { time: t(1),  o: 18035, h: 18055, l: 18025, c: 18050 },
      { time: t(2),  o: 18050, h: 18080, l: 18048, c: 18075 },
      { time: t(3),  o: 18075, h: 18108, l: 18072, c: 18105 },
      { time: t(4),  o: 18105, h: 18135, l: 18100, c: 18125 },
      { time: t(5),  o: 18125, h: 18165, l: 18120, c: 18160 },
      { time: t(6),  o: 18160, h: 18195, l: 18155, c: 18190 },
      { time: t(7),  o: 18190, h: 18198, l: 18165, c: 18170 },
      { time: t(8),  o: 18170, h: 18172, l: 18140, c: 18145 },
      { time: t(9),  o: 18145, h: 18148, l: 18115, c: 18120 },
      { time: t(10), o: 18120, h: 18122, l: 18095, c: 18098 },
      { time: t(11), o: 18098, h: 18105, l: 18075, c: 18080 },
      { time: t(12), o: 18080, h: 18085, l: 18055, c: 18060 },
    ],
    phases: [
      { kind: "price", start: 18100, end: 18200, color: C.red,   label: "Premium · vender" },
      { kind: "price", start: 18000, end: 18100, color: C.green, label: "Discount · comprar" },
    ],
    levels: [
      { price: 18200, color: C.red,  label: "Range High", style: "dashed" },
      { price: 18100, color: C.gold, label: "Equilibrium · 50%", important: true },
      { price: 18000, color: C.green, label: "Range Low", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Discount",    color: C.green, desc: "Metade inferior do range — zona de valor pra longs. Entries aqui dão desconto estrutural." },
      { num: "2", label: "Equilibrium", color: C.gold,  desc: "50% = ponto neutro. Preço atravessa mas raramente é ponto de entrada — sem convicção clara." },
      { num: "3", label: "Premium",     color: C.red,   desc: "Metade superior — zona pra shorts. Comprar aqui é comprar caro; preço tende a voltar ao discount." },
    ],
    annotations: [
      { stepNum: "1", time: t(1),  price: 18025, offset: "below" },
      { stepNum: "2", time: t(4),  price: 18108, offset: "above" },
      { stepNum: "3", time: t(6),  price: 18198, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 21. Fib OTE zone (62-79%) ────────── */
  "fib-ote": {
    title: "OTE · Optimal Trade Entry (62-79%)",
    candles: [
      { time: t(0),  o: 18000, h: 18015, l: 17995, c: 18010 },
      { time: t(1),  o: 18010, h: 18050, l: 18008, c: 18045 },
      { time: t(2),  o: 18045, h: 18090, l: 18042, c: 18085 },
      { time: t(3),  o: 18085, h: 18130, l: 18082, c: 18125 },
      { time: t(4),  o: 18125, h: 18170, l: 18120, c: 18165 },
      { time: t(5),  o: 18165, h: 18205, l: 18158, c: 18200 },
      { time: t(6),  o: 18200, h: 18202, l: 18175, c: 18180 },
      { time: t(7),  o: 18180, h: 18182, l: 18145, c: 18152 },
      { time: t(8),  o: 18152, h: 18155, l: 18115, c: 18118 },
      { time: t(9),  o: 18118, h: 18120, l: 18085, c: 18088 },
      { time: t(10), o: 18088, h: 18095, l: 18058, c: 18068 },
      { time: t(11), o: 18068, h: 18115, l: 18062, c: 18105 },
      { time: t(12), o: 18105, h: 18140, l: 18100, c: 18135 },
      { time: t(13), o: 18135, h: 18175, l: 18130, c: 18168 },
    ],
    phases: [
      { kind: "price", start: 18042, end: 18076, color: C.brand, label: "OTE · 62-79%" },
    ],
    levels: [
      { price: 18200, color: C.gray,  label: "Swing High · 100%", style: "dashed" },
      { price: 18100, color: C.gray,  label: "50%", style: "dashed" },
      { price: 18076, color: C.brand, label: "62%", style: "dashed" },
      { price: 18042, color: C.brand, label: "79%", style: "dashed", important: true },
      { price: 18000, color: C.gray,  label: "Swing Low · 0%", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Swing leg up",   color: C.green, desc: "Movimento bullish de 18000 → 18200. Define o range do retracement." },
      { num: "2", label: "Pullback na OTE", color: C.brand, desc: "Preço corrige e entra na zona 62-79% (18042-18076) — OTE ideal do ICT." },
      { num: "3", label: "Reação + continuação", color: C.green, desc: "Entry na OTE, stop abaixo do 79% (18042). Alvo: retorno ao swing high e BSL acima." },
    ],
    annotations: [
      { stepNum: "1", time: t(5),  price: 18205, offset: "above" },
      { stepNum: "2", time: t(10), price: 18055, offset: "below" },
      { stepNum: "3", time: t(13), price: 18180, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 22. Double Sweep ────────── */
  "double-sweep": {
    title: "Duplo sweep · Liquidez pegada dos dois lados",
    candles: [
      { time: t(0),  o: 18150, h: 18162, l: 18145, c: 18158 },
      { time: t(1),  o: 18158, h: 18170, l: 18155, c: 18165 },
      { time: t(2),  o: 18165, h: 18178, l: 18162, c: 18172 },
      { time: t(3),  o: 18172, h: 18180, l: 18155, c: 18158 },
      { time: t(4),  o: 18158, h: 18162, l: 18138, c: 18140 },
      { time: t(5),  o: 18140, h: 18145, l: 18108, c: 18115 },
      { time: t(6),  o: 18115, h: 18152, l: 18112, c: 18148 },
      { time: t(7),  o: 18148, h: 18170, l: 18145, c: 18165 },
      { time: t(8),  o: 18165, h: 18182, l: 18160, c: 18178 },
      { time: t(9),  o: 18178, h: 18200, l: 18175, c: 18185 },
      { time: t(10), o: 18185, h: 18188, l: 18150, c: 18155 },
      { time: t(11), o: 18155, h: 18158, l: 18120, c: 18125 },
      { time: t(12), o: 18125, h: 18130, l: 18095, c: 18100 },
      { time: t(13), o: 18100, h: 18105, l: 18075, c: 18082 },
    ],
    levels: [
      { price: 18180, color: C.gray, label: "Range High · BSL", style: "dashed" },
      { price: 18138, color: C.gray, label: "Range Low · SSL", style: "dashed" },
      { price: 18108, color: C.red,  label: "Sweep 1 · abaixo", style: "dashed" },
      { price: 18200, color: C.red,  label: "Sweep 2 · acima", style: "dashed", important: true },
    ],
    steps: [
      { num: "1", label: "Range",           color: C.blue, desc: "Preço lateraliza entre 18138 e 18180. SSL abaixo, BSL acima — dois pools de liquidez." },
      { num: "2", label: "Sweep de ambos",  color: C.red,  desc: "Primeiro varre SSL (18108), reverte, varre BSL (18200). Liquidez dos dois lados capturada." },
      { num: "3", label: "Direção real",    color: C.red,  desc: "Após dupla varredura, direção institucional se manifesta. Neste caso, bearish limpa — sem combustível oposto." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18182, offset: "above" },
      { stepNum: "2", time: t(9),  price: 18202, offset: "above" },
      { stepNum: "3", time: t(13), price: 18072, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 23. Trailing Structure ────────── */
  "trailing-structure": {
    title: "Trailing stop · Atrás de cada Higher Low",
    candles: [
      { time: t(0),  o: 18000, h: 18015, l: 17995, c: 18010 },
      { time: t(1),  o: 18010, h: 18025, l: 18005, c: 18020 },
      { time: t(2),  o: 18020, h: 18055, l: 18018, c: 18050 },
      { time: t(3),  o: 18050, h: 18055, l: 18030, c: 18035 },
      { time: t(4),  o: 18035, h: 18075, l: 18032, c: 18070 },
      { time: t(5),  o: 18070, h: 18095, l: 18065, c: 18090 },
      { time: t(6),  o: 18090, h: 18095, l: 18065, c: 18068 },
      { time: t(7),  o: 18068, h: 18110, l: 18065, c: 18105 },
      { time: t(8),  o: 18105, h: 18135, l: 18100, c: 18130 },
      { time: t(9),  o: 18130, h: 18135, l: 18108, c: 18112 },
      { time: t(10), o: 18112, h: 18150, l: 18110, c: 18145 },
      { time: t(11), o: 18145, h: 18175, l: 18140, c: 18170 },
      { time: t(12), o: 18170, h: 18175, l: 18148, c: 18152 },
    ],
    levels: [
      { price: 18030, color: C.gray, label: "HL1 · stop inicial", style: "dashed" },
      { price: 18065, color: C.gray, label: "HL2 · stop sobe", style: "dashed" },
      { price: 18108, color: C.gold, label: "HL3 · lucro garantido", style: "dashed" },
      { price: 18148, color: C.green, label: "HL4 · stop atual", important: true },
    ],
    steps: [
      { num: "1", label: "Entry",          color: C.blue,  desc: "Entry após impulse inicial. Stop abaixo do primeiro HL (18030). Tese: continuação bullish." },
      { num: "2", label: "Move com estrutura", color: C.gold,  desc: "A cada novo HL confirmado, stop sobe pra logo abaixo dele. Segue a estrutura, deixa trade respirar." },
      { num: "3", label: "Lucro locked",   color: C.green, desc: "No HL4 (18148), o stop já tá bem acima do entry. Trade free-roll — só fecha se estrutura quebrar." },
    ],
    annotations: [
      { stepNum: "1", time: t(3),  price: 18028, offset: "below" },
      { stepNum: "2", time: t(6),  price: 18063, offset: "below" },
      { stepNum: "3", time: t(12), price: 18178, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 24. Bias Invalidation ────────── */
  "bias-invalidation": {
    title: "Invalidação de bias · Quando flipar",
    candles: [
      { time: t(0),  o: 18100, h: 18115, l: 18095, c: 18110 },
      { time: t(1),  o: 18110, h: 18130, l: 18108, c: 18125 },
      { time: t(2),  o: 18125, h: 18155, l: 18120, c: 18150 },
      { time: t(3),  o: 18150, h: 18155, l: 18130, c: 18135 },
      { time: t(4),  o: 18135, h: 18170, l: 18132, c: 18165 },
      { time: t(5),  o: 18165, h: 18175, l: 18145, c: 18150 },
      { time: t(6),  o: 18150, h: 18168, l: 18148, c: 18160 },
      { time: t(7),  o: 18160, h: 18162, l: 18130, c: 18135 },
      { time: t(8),  o: 18135, h: 18140, l: 18118, c: 18122 },
      { time: t(9),  o: 18122, h: 18128, l: 18095, c: 18100 },
      { time: t(10), o: 18100, h: 18108, l: 18080, c: 18088 },
      { time: t(11), o: 18088, h: 18092, l: 18062, c: 18068 },
      { time: t(12), o: 18068, h: 18075, l: 18048, c: 18055 },
    ],
    levels: [
      { price: 18175, color: C.gray, label: "Last HH", style: "dashed" },
      { price: 18132, color: C.red,  label: "Last HL · invalidação", style: "dashed", important: true },
      { price: 18122, color: C.red,  label: "CHoCH · close abaixo" },
    ],
    steps: [
      { num: "1", label: "Bias bullish",   color: C.green, desc: "HH/HL consecutivos. Bias estruturado, longs confortáveis em pullbacks." },
      { num: "2", label: "Falha de HH",    color: C.gold,  desc: "Preço não consegue criar novo HH. Alerta — momento de prestar atenção ao próximo HL." },
      { num: "3", label: "CHoCH · flip",   color: C.red,   desc: "Close body abaixo do último HL (18132). Bias invalidado. Flipa pra bearish mecânicamente." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18158, offset: "above" },
      { stepNum: "2", time: t(6),  price: 18172, offset: "above" },
      { stepNum: "3", time: t(9),  price: 18095, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 25. NY Open Reversal ────────── */
  "ny-reversal": {
    title: "NY Open · Drive inicial e reversão",
    candles: [
      { time: t(0),  o: 18050, h: 18058, l: 18045, c: 18052 },
      { time: t(1),  o: 18052, h: 18060, l: 18048, c: 18055 },
      { time: t(2),  o: 18055, h: 18062, l: 18050, c: 18058 },
      { time: t(3),  o: 18058, h: 18060, l: 18048, c: 18052 },
      { time: t(4),  o: 18052, h: 18098, l: 18050, c: 18092 },
      { time: t(5),  o: 18092, h: 18122, l: 18088, c: 18118 },
      { time: t(6),  o: 18118, h: 18135, l: 18110, c: 18115 },
      { time: t(7),  o: 18115, h: 18118, l: 18088, c: 18092 },
      { time: t(8),  o: 18092, h: 18095, l: 18068, c: 18072 },
      { time: t(9),  o: 18072, h: 18075, l: 18045, c: 18050 },
      { time: t(10), o: 18050, h: 18055, l: 18025, c: 18030 },
      { time: t(11), o: 18030, h: 18035, l: 18005, c: 18010 },
      { time: t(12), o: 18010, h: 18018, l: 17988, c: 17995 },
    ],
    phases: [
      { kind: "time", start: t(0),  end: t(3),  color: C.blue, label: "Pré-NY · calmo" },
      { kind: "time", start: t(4),  end: t(6),  color: C.red,  label: "NY drive (manipulation)" },
      { kind: "time", start: t(7),  end: t(12), color: C.green, label: "Direção real" },
    ],
    levels: [
      { price: 18052, color: C.gray, label: "NY open", style: "dashed" },
      { price: 18135, color: C.red,  label: "Drive high · sweep", style: "dashed" },
    ],
    steps: [
      { num: "1", label: "Calmaria pré-NY", color: C.blue,  desc: "Mercado lateralizado antes do NY open. Baixa volatilidade, aguardando catalisador." },
      { num: "2", label: "Drive de abertura", color: C.red,   desc: "NY abre com movimento agressivo up (drive). Pega stops de short e buy orders acima. Manipulation clássica." },
      { num: "3", label: "Reversão real",   color: C.green, desc: "Após pegar liquidez, reverte com força. Direção institucional era bearish. Setup: entry em supply deixada pelo drive." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18045, offset: "below" },
      { stepNum: "2", time: t(6),  price: 18138, offset: "above" },
      { stepNum: "3", time: t(11), price: 18000, offset: "below" },
    ],
    height: 360,
  } satisfies ScenarioData,

  /* ────────── 19. FVG invertido (fills & flips) ────────── */
  "fvg-inverted": {
    title: "FVG Invertido · Gap preenchido vira resistência",
    candles: [
      { time: t(0),  o: 18050, h: 18065, l: 18045, c: 18060 },
      { time: t(1),  o: 18060, h: 18098, l: 18058, c: 18095 },
      { time: t(2),  o: 18095, h: 18115, l: 18090, c: 18112 },
      { time: t(3),  o: 18112, h: 18118, l: 18095, c: 18100 },
      { time: t(4),  o: 18100, h: 18105, l: 18082, c: 18088 },
      { time: t(5),  o: 18088, h: 18092, l: 18068, c: 18072 },
      { time: t(6),  o: 18072, h: 18088, l: 18068, c: 18085 },
      { time: t(7),  o: 18085, h: 18102, l: 18080, c: 18098 },
      { time: t(8),  o: 18098, h: 18108, l: 18092, c: 18095 },
      { time: t(9),  o: 18095, h: 18100, l: 18072, c: 18078 },
      { time: t(10), o: 18078, h: 18082, l: 18055, c: 18062 },
    ],
    zones: [
      { startTime: t(0), endTime: t(10), topPrice: 18090, bottomPrice: 18065, color: C.purple, label: "FVG (depois invertido)" },
    ],
    levels: [
      { price: 18065, color: C.gray,   label: "FVG low", style: "dashed" },
      { price: 18090, color: C.red,    label: "FVG high · rejeição", style: "dashed", important: true },
    ],
    steps: [
      { num: "1", label: "FVG bullish formado", color: C.purple, desc: "Impulso bullish deixa gap de ineficiência entre 18065-18090. Zona de demanda original." },
      { num: "2", label: "100% preenchido",     color: C.gold,   desc: "Preço volta e preenche completamente o FVG, fechando abaixo do low. Ineficiência resolvida." },
      { num: "3", label: "Vira supply",         color: C.red,    desc: "Retest pelo lado inferior agora encontra resistência. FVG bullish invertido = zona de supply." },
    ],
    annotations: [
      { stepNum: "1", time: t(2),  price: 18116, offset: "above" },
      { stepNum: "2", time: t(5),  price: 18068, offset: "below" },
      { stepNum: "3", time: t(8),  price: 18108, offset: "above" },
    ],
    height: 360,
  } satisfies ScenarioData,
} as const;

export type ChartScenario = keyof typeof SCENARIOS;

export function hasLiveChart(chartType: string): chartType is ChartScenario {
  return chartType in SCENARIOS;
}

/* ────────────────────────────────────────────
   Overlay coordinate cache
   ──────────────────────────────────────────── */

interface OverlayState {
  w: number;
  h: number;
  phases: Array<Phase & { x1: number; x2: number; y1: number; y2: number }>;
  zones: Array<Zone & { x1: number; x2: number; y1: number; y2: number }>;
  annotations: Array<Annotation & { x: number; y: number }>;
}

/* ────────────────────────────────────────────
   LessonChart Component
   ──────────────────────────────────────────── */

export function LessonChart({ scenario }: { scenario: ChartScenario }) {
  const data = SCENARIOS[scenario] as ScenarioData;
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]> | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>({ w: 0, h: 0, phases: [], zones: [], annotations: [] });

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let cleanupResize: (() => void) | null = null;

    const init = async () => {
      const { createChart, CandlestickSeries, ColorType } = await import("lightweight-charts");
      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: data.height ?? 340,
        layout: {
          background: { type: ColorType.Solid, color: "#0e0e10" },
          textColor: "rgba(255,255,255,0.40)",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.025)" },
          horzLines: { color: "rgba(255,255,255,0.025)" },
        },
        crosshair: {
          vertLine: { color: "rgba(255,255,255,0.18)", width: 1, style: 3, labelBackgroundColor: "#141417" },
          horzLine: { color: "rgba(255,255,255,0.18)", width: 1, style: 3, labelBackgroundColor: "#141417" },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.05)",
          scaleMargins: { top: 0.12, bottom: 0.12 },
          textColor: "rgba(255,255,255,0.45)",
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.05)",
          timeVisible: false,
          visible: false,
          rightOffset: 2,
          barSpacing: 14,
          fixLeftEdge: true,
          fixRightEdge: true,
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: C.green,
        downColor: C.red,
        borderUpColor: C.green,
        borderDownColor: C.red,
        wickUpColor: C.green,
        wickDownColor: C.red,
      });

      type UTCTimestamp = import("lightweight-charts").UTCTimestamp;

      series.setData(data.candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.o, high: c.h, low: c.l, close: c.c,
      })));

      for (const lvl of data.levels ?? []) {
        series.createPriceLine({
          price: lvl.price,
          color: lvl.color,
          lineWidth: lvl.important ? 2 : 1,
          lineStyle: lvl.style === "dashed" ? 2 : 0,
          axisLabelVisible: true,
          title: lvl.label,
        });
      }

      chart.timeScale().fitContent();
      chartRef.current = chart;
      seriesRef.current = series;

      const recompute = () => {
        if (!containerRef.current || !chartRef.current || !seriesRef.current || disposed) return;
        const w = containerRef.current.clientWidth;
        const h = data.height ?? 340;
        const ts = chart.timeScale();

        const toNum = (v: unknown): number => {
          if (typeof v === "number" && Number.isFinite(v)) return v;
          return 0;
        };

        const phases = (data.phases ?? []).map((p) => {
          if (p.kind === "time") {
            return {
              ...p,
              x1: toNum(ts.timeToCoordinate(p.start as UTCTimestamp)),
              x2: toNum(ts.timeToCoordinate(p.end as UTCTimestamp)),
              y1: 0,
              y2: h,
            };
          }
          return {
            ...p,
            x1: 0,
            x2: w,
            y1: toNum(series.priceToCoordinate(p.end)),
            y2: toNum(series.priceToCoordinate(p.start)),
          };
        });

        const zones = (data.zones ?? []).map((z) => ({
          ...z,
          x1: toNum(ts.timeToCoordinate(z.startTime as UTCTimestamp)),
          x2: toNum(ts.timeToCoordinate(z.endTime as UTCTimestamp)) || w,
          y1: toNum(series.priceToCoordinate(z.topPrice)),
          y2: toNum(series.priceToCoordinate(z.bottomPrice)),
        }));

        const annotations = (data.annotations ?? []).map((a) => ({
          ...a,
          x: toNum(ts.timeToCoordinate(a.time as UTCTimestamp)),
          y: toNum(series.priceToCoordinate(a.price)),
        }));

        setOverlay({ w, h, phases, zones, annotations });
      };

      // Initial compute — multiple passes to handle slow chart mount
      requestAnimationFrame(() => {
        setTimeout(() => { if (!disposed) recompute(); }, 30);
        setTimeout(() => { if (!disposed) recompute(); }, 150);
        setTimeout(() => { if (!disposed) recompute(); }, 400);
      });

      chart.timeScale().subscribeVisibleTimeRangeChange(recompute);

      const ro = new ResizeObserver(() => {
        if (!containerRef.current || disposed) return;
        chart.applyOptions({ width: containerRef.current.clientWidth });
        setTimeout(recompute, 30);
      });
      ro.observe(containerRef.current);
      cleanupResize = () => ro.disconnect();
    };

    init();

    return () => {
      disposed = true;
      if (cleanupResize) cleanupResize();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [data]);

  const stepByNum = new Map((data.steps ?? []).map((s) => [s.num, s]));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.01)] min-h-[460px] flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2.5 bg-[#111114]">
        <div className="w-5 h-5 rounded-[5px] flex items-center justify-center" style={{ backgroundColor: C.brand + "18" }}>
          <Play className="w-2.5 h-2.5" style={{ color: C.brand }} fill="currentColor" />
        </div>
        <span className="text-[12.5px] font-bold text-white tracking-tight">{data.title}</span>
      </div>

      {/* Chart + SVG overlay */}
      <div className="relative">
        <div ref={containerRef} className="w-full" />
        {overlay.w > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={overlay.w}
            height={overlay.h}
            viewBox={`0 0 ${overlay.w} ${overlay.h}`}
            style={{ zIndex: 10 }}
          >
            {/* Phase backgrounds */}
            {overlay.phases.map((p, i) => {
              const w = Math.max(0, p.x2 - p.x1);
              const h = Math.max(0, p.y2 - p.y1);
              if (w === 0 || h === 0) return null;
              const labelY = p.kind === "time" ? 18 : p.y1 + 14;
              const labelX = (p.x1 + p.x2) / 2;
              return (
                <g key={`ph-${i}`}>
                  <rect x={p.x1} y={p.y1} width={w} height={h} fill={p.color} opacity={0.14} />
                  {p.kind === "time" && (
                    <>
                      <line x1={p.x1} y1="0" x2={p.x1} y2={overlay.h} stroke={p.color} strokeWidth="1" opacity="0.35" strokeDasharray="3 3" />
                      <line x1={p.x2} y1="0" x2={p.x2} y2={overlay.h} stroke={p.color} strokeWidth="1" opacity="0.35" strokeDasharray="3 3" />
                    </>
                  )}
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fill={p.color}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                    opacity="0.85"
                    style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}

            {/* Zones (OB, FVG, supply) */}
            {overlay.zones.map((z, i) => {
              const w = Math.max(0, z.x2 - z.x1);
              const h = Math.max(0, z.y2 - z.y1);
              if (w === 0 || h === 0) return null;
              const labelW = Math.max(34, z.label.length * 6 + 12);
              return (
                <g key={`z-${i}`}>
                  <rect
                    x={z.x1}
                    y={z.y1}
                    width={w}
                    height={h}
                    fill={z.color}
                    opacity="0.22"
                    stroke={z.color}
                    strokeWidth="1.5"
                    strokeDasharray={z.style === "dashed" ? "5 3" : undefined}
                    rx="2"
                  />
                  <rect x={z.x1} y={z.y1 - 17} width={labelW} height="14" fill={z.color} rx="2" />
                  <text
                    x={z.x1 + labelW / 2}
                    y={z.y1 - 6}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {z.label}
                  </text>
                </g>
              );
            })}

            {/* Annotations — numbered badges with connector */}
            {overlay.annotations.map((a, i) => {
              const step = stepByNum.get(a.stepNum);
              const color = step?.color ?? C.brand;
              const yOffset = a.offset === "below" ? 28 : -28;
              const badgeY = a.y + yOffset;
              return (
                <g key={`an-${i}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={a.x}
                    y2={badgeY + (yOffset < 0 ? 12 : -12)}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  <circle cx={a.x} cy={badgeY} r="13" fill={color} stroke="#0e0e10" strokeWidth="2.5" />
                  <text
                    x={a.x}
                    y={badgeY + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="800"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {a.stepNum}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Narrative steps — legend below chart */}
      {data.steps && data.steps.length > 0 && (
        <div className="px-5 py-4 border-t border-white/[0.04] bg-[#0a0a0c]">
          <div className={`grid gap-3 ${data.steps.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {data.steps.map((s) => (
              <div key={s.num} className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: s.color + "22", border: `1px solid ${s.color}55` }}
                >
                  <span className="text-[11px] font-extrabold font-mono" style={{ color: s.color }}>{s.num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-white/90 mb-1 leading-tight">{s.label}</p>
                  <p className="text-[11.5px] text-white/45 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
