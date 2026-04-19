"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radio, Play, Clock, Calendar, ChevronRight, Trophy, BookOpen,
  TrendingUp, Award, Video, Bell, MessageCircle,
} from "lucide-react";

/* ────────────────────────────────────────────
   Mock data — replace with live sources (Discord voice state + Supabase)
   ──────────────────────────────────────────── */

interface ScheduledCall {
  id: string;
  title: string;
  desc: string;
  when: string;
  durationMin: number;
  host: string;
  type: "operacoes" | "revisao" | "aula-prop" | "qa";
  live?: boolean;
}

const SCHEDULE: ScheduledCall[] = [
  { id: "live-now",   title: "Call de Operação — NY Open",      desc: "AMD na sessão NY, análise ao vivo + entradas", when: "Agora",            durationMin: 120, host: "URA", type: "operacoes", live: true },
  { id: "today-2",    title: "Revisão da Semana",                 desc: "Trades dos alunos, feedback direto",            when: "Hoje · 20:00",    durationMin: 60,  host: "URA", type: "revisao" },
  { id: "tomorrow-1", title: "Mesa Prop — FundingPips deep dive", desc: "Regras, armadilhas, como passar a fase 1",      when: "Amanhã · 10:30", durationMin: 90,  host: "URA", type: "aula-prop" },
  { id: "fri-1",      title: "Q&A aberto da turma",               desc: "Perguntas dos alunos, estratégias, psicologia", when: "Sex · 19:00",    durationMin: 60,  host: "URA", type: "qa" },
];

interface Replay {
  id: string;
  title: string;
  desc: string;
  date: string;
  durationMin: number;
  type: "operacoes" | "revisao" | "aula-prop" | "qa";
}

const REPLAYS: Replay[] = [
  { id: "r1", title: "Call Operação NY — Short depois do sweep",  desc: "Entrada curta pós-manipulação, +3.2R",          date: "11 Abr", durationMin: 102, type: "operacoes" },
  { id: "r2", title: "Mesa Prop — TopStep trailing drawdown",      desc: "Como a regra funciona e estratégia pra não quebrar", date: "09 Abr", durationMin: 68,  type: "aula-prop" },
  { id: "r3", title: "Revisão de trades da turma",                 desc: "Erros comuns em OBs + FVGs mal mitigados",      date: "07 Abr", durationMin: 58,  type: "revisao" },
  { id: "r4", title: "Mesa Prop — 5%ers Hyper Growth",             desc: "Scaling agressivo, quando vale a pena",         date: "05 Abr", durationMin: 75,  type: "aula-prop" },
  { id: "r5", title: "Call Operação Londres — OB + FVG confluência", desc: "Long na abertura de Londres, +4.1R",          date: "04 Abr", durationMin: 90,  type: "operacoes" },
  { id: "r6", title: "Q&A — Psicologia do trade",                  desc: "Revenge trading, FOMO, drawdown mental",        date: "01 Abr", durationMin: 62,  type: "qa" },
];

type CallType = "operacoes" | "revisao" | "aula-prop" | "qa";

const TYPE_STYLE: Record<CallType, { color: string; label: string; icon: typeof TrendingUp }> = {
  operacoes:  { color: "#EF4444", label: "Operação",  icon: TrendingUp },
  revisao:    { color: "#F59E0B", label: "Revisão",   icon: BookOpen },
  "aula-prop":{ color: "#A855F7", label: "Mesa Prop", icon: Award },
  qa:         { color: "#3B82F6", label: "Q&A",       icon: MessageCircle },
};

function fmtDuration(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, "0")}min`;
}

/* ────────────────────────────────────────────
   Unique SVG thumb art per call type — mirrors LessonThumb/LiveThumbArt density
   ──────────────────────────────────────────── */

function CallThumbArt({ type }: { type: CallType }) {
  const accent = TYPE_STYLE[type].color;

  switch (type) {
    case "operacoes":
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          <polyline points="0,110 30,108 50,106 70,60 90,135 110,95 140,100 165,90 190,55 215,58 245,42 275,48 305,35 340,40 370,28 400,32"
            stroke={accent + "45"} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          {[
            { x: 165, o: 60, c: 42, h: 32, l: 70 },
            { x: 200, o: 45, c: 60, h: 38, l: 66 },
            { x: 235, o: 55, c: 40, h: 30, l: 62 },
            { x: 270, o: 42, c: 52, h: 34, l: 60 },
            { x: 305, o: 48, c: 36, h: 28, l: 58 },
          ].map((c, i) => (
            <g key={i}>
              <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.c < c.o ? "#10B98155" : accent + "45"} strokeWidth="1.5" />
              <rect x={c.x - 8} y={Math.min(c.o, c.c)} width="16" height={Math.abs(c.c - c.o) || 2}
                fill={c.c < c.o ? "#10B98128" : "transparent"} stroke={c.c < c.o ? "#10B98145" : accent + "38"} strokeWidth="1" rx="1.5" />
            </g>
          ))}
          <line x1="345" y1="0" x2="345" y2="180" stroke={accent + "18"} strokeWidth="1" strokeDasharray="3 4" />
          <line x1="0" y1="34" x2="400" y2="34" stroke={accent + "18"} strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="345" cy="34" r="4" fill="none" stroke={accent + "55"} strokeWidth="1.5" />
          <circle cx="345" cy="34" r="2" fill={accent + "AA"} />
        </svg>
      );

    case "revisao":
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {[
            { y: 35, done: true },
            { y: 65, done: true },
            { y: 95, done: true },
            { y: 125, done: false },
          ].map((item, i) => (
            <g key={i}>
              <rect x="90" y={item.y} width="18" height="18" rx="4" fill={item.done ? accent + "15" : "rgba(255,255,255,0.03)"} stroke={item.done ? accent + "40" : "rgba(255,255,255,0.08)"} strokeWidth="1.5" />
              {item.done && <polyline points={`${95},${item.y + 10} ${98},${item.y + 13} ${104},${item.y + 6}`} stroke={accent + "90"} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="120" y={item.y + 5} width={80 + i * 12} height="4" rx="2" fill={item.done ? accent + "22" : "rgba(255,255,255,0.06)"} />
              <rect x="120" y={item.y + 12} width={50 + i * 8} height="3" rx="1.5" fill={item.done ? accent + "15" : "rgba(255,255,255,0.04)"} />
            </g>
          ))}
          <rect x="260" y="48" width="90" height="80" rx="8" fill={accent + "08"} stroke={accent + "20"} strokeWidth="1.5" />
          <text x="305" y="78" textAnchor="middle" fill={accent + "80"} fontSize="9" fontFamily="monospace" letterSpacing="1">SCORE</text>
          <text x="305" y="108" textAnchor="middle" fill={accent + "DD"} fontSize="26" fontFamily="monospace" fontWeight="bold">3/4</text>
        </svg>
      );

    case "aula-prop":
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Phase tracker */}
          <rect x="60" y="60" width="280" height="60" rx="10" fill={accent + "06"} stroke={accent + "18"} strokeWidth="1.5" />
          {/* 3 phases */}
          {[0, 1, 2].map((i) => {
            const x = 90 + i * 90;
            const active = i <= 1;
            return (
              <g key={i}>
                <circle cx={x} cy="90" r="14" fill={active ? accent + "28" : "rgba(255,255,255,0.03)"} stroke={active ? accent + "70" : "rgba(255,255,255,0.08)"} strokeWidth="1.5" />
                <text x={x} y="95" textAnchor="middle" fill={active ? accent : "rgba(255,255,255,0.25)"} fontSize="12" fontFamily="monospace" fontWeight="bold">{i + 1}</text>
                {i < 2 && (
                  <line x1={x + 14} y1="90" x2={x + 76} y2="90" stroke={active && i === 0 ? accent + "50" : "rgba(255,255,255,0.06)"} strokeWidth="1.5" strokeDasharray={i === 1 ? "2 3" : "none"} />
                )}
                <text x={x} y="142" textAnchor="middle" fill={active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)"} fontSize="9" fontFamily="monospace" letterSpacing="1">
                  {["EVAL", "FUNDED", "PAYOUT"][i]}
                </text>
              </g>
            );
          })}
          {/* Trophy badge */}
          <g transform="translate(330, 32)">
            <circle cx="0" cy="0" r="14" fill={accent + "18"} stroke={accent + "40"} strokeWidth="1.5" />
            <path d="M -6 -4 L -6 -1 Q -6 3 0 3 Q 6 3 6 -1 L 6 -4 M -6 -4 L 6 -4" stroke={accent + "CC"} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <line x1="0" y1="3" x2="0" y2="7" stroke={accent + "CC"} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-4" y1="9" x2="4" y2="9" stroke={accent + "CC"} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "qa":
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Speech bubbles */}
          <g>
            <rect x="60" y="40" width="140" height="40" rx="10" fill={accent + "10"} stroke={accent + "28"} strokeWidth="1.5" />
            <path d="M 80 80 L 75 92 L 95 80 Z" fill={accent + "10"} stroke={accent + "28"} strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="78" y="55" width="70" height="3.5" rx="1.5" fill={accent + "55"} />
            <rect x="78" y="63" width="100" height="3.5" rx="1.5" fill={accent + "35"} />
          </g>
          <g>
            <rect x="200" y="90" width="140" height="40" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
            <path d="M 320 130 L 325 142 L 305 130 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="218" y="105" width="80" height="3.5" rx="1.5" fill="rgba(255,255,255,0.35)" />
            <rect x="218" y="113" width="104" height="3.5" rx="1.5" fill="rgba(255,255,255,0.22)" />
          </g>
          {/* Question mark accent */}
          <g transform="translate(45, 140)" opacity="0.5">
            <circle cx="0" cy="0" r="10" fill="none" stroke={accent + "70"} strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill={accent + "CC"} fontSize="13" fontFamily="monospace" fontWeight="bold">?</text>
          </g>
        </svg>
      );
  }
}

/* ────────────────────────────────────────────
   Hero — matches Aulas premium pattern
   ──────────────────────────────────────────── */

function CallsHero({ liveCall, upcomingCount }: { liveCall?: ScheduledCall; upcomingCount: number }) {
  const isLive = !!liveCall;
  const accent = isLive ? "#EF4444" : "#FF5500";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]" style={{ background: "#111114" }}>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 80% at 85% 40%, ${accent}${isLive ? "18" : "12"}, transparent 60%)`,
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, #111114 40%, #111114cc 55%, transparent 80%)",
      }} />
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
          background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
        }} />
      )}

      <div className="relative z-10 px-6 md:px-8 py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {isLive ? (
              <>
                <div className="relative">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-50" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-400">Ao vivo agora</span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                  URA · {liveCall.durationMin}min
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: accent + "CC" }}>
                  Calls Elite
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                  Operações · Mesa prop · Revisão
                </span>
              </>
            )}
          </div>

          {isLive ? (
            <>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight mb-0.5">
                {liveCall.title}
              </h1>
              <p className="text-[13px] text-white/40 mb-3 max-w-xl leading-relaxed line-clamp-1">{liveCall.desc}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <a href="https://discord.com/channels/@me" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[13px] font-bold transition-all hover:-translate-y-0.5"
                  style={{ borderColor: accent, color: accent }}>
                  <Play className="w-3.5 h-3.5" />
                  Entrar na call
                </a>
                <div className="flex items-center gap-1.5 text-white/35">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">{liveCall.durationMin}min</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight mb-0.5">
                Calls Elite ao vivo
              </h1>
              <p className="text-[13px] text-white/40 mb-3 max-w-xl leading-relaxed">
                Operações diárias com o URA, aulas de mesa prop, Q&A e revisão semanal.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="https://discord.com/channels/@me" target="_blank"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{ backgroundColor: accent, color: "white", boxShadow: `0 4px 20px ${accent}35` }}>
                  <Bell className="w-3.5 h-3.5" />
                  Ativar alerta
                </Link>
                <div className="flex items-center gap-1.5 text-white/35">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">{upcomingCount} agendadas</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right — stat */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-[56px] h-[56px] rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
            <Radio className="w-5 h-5" style={{ color: accent }} />
            {isLive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }} />
            )}
          </div>
          <div>
            <p className="text-[15px] text-white font-bold leading-none">
              {upcomingCount}<span className="text-white/30 font-medium"> calls</span>
            </p>
            <p className="text-[10px] text-white/35 mt-1 uppercase tracking-wider">próximos 7 dias</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Section header — matches Aulas
   ──────────────────────────────────────────── */

function SectionHeader({ accent, title, subtitle, meta }: { accent: string; title: string; subtitle?: string; meta?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="w-1 h-7 rounded-full" style={{ backgroundColor: accent + "80" }} />
      <h2 className="text-[22px] font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <span className="text-[13px] text-white/40 font-medium">{subtitle}</span>}
      {meta && <div className="ml-auto">{meta}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────
   Schedule card — horizontal with thumb art (inspired by LiveCard)
   ──────────────────────────────────────────── */

function ScheduleCard({ call }: { call: ScheduledCall }) {
  const [hovered, setHovered] = useState(false);
  const s = TYPE_STYLE[call.type];
  const isLive = !!call.live;

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-xl border transition-all duration-300 flex"
        style={{
          borderColor: isLive ? s.color + "40" : "rgba(255,255,255,0.06)",
          boxShadow: hovered ? `0 8px 32px ${s.color}18` : undefined,
        }}
      >
        {/* Thumb — left */}
        <div className="relative w-[140px] shrink-0 overflow-hidden" style={{ background: "#0e0e10" }}>
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${s.color}14, transparent 60%)`,
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)",
          }} />
          <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{
            background: `linear-gradient(to bottom, transparent, ${s.color}55 30%, ${s.color}30 70%, transparent)`,
          }} />
          <CallThumbArt type={call.type} />

          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.25em]" style={{ color: s.color }}>Live</span>
            </div>
          )}

          {hovered && isLive && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: s.color }}>
                <Play className="w-5 h-5 ml-0.5" style={{ color: s.color }} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-3.5 bg-[#141417] flex flex-col justify-between min-h-[100px]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.color + "BB" }}>{s.label}</span>
            </div>
            <span className={`text-[11px] font-semibold ${isLive ? "" : "text-white/70"}`} style={isLive ? { color: s.color } : undefined}>
              {call.when}
            </span>
          </div>

          <h3 className="text-[13.5px] font-bold text-white/95 tracking-tight line-clamp-1 mb-1">{call.title}</h3>
          <p className="text-[11px] text-white/35 line-clamp-1 flex-1 leading-relaxed">{call.desc}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-white/30">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">{fmtDuration(call.durationMin)}</span>
            </div>
            <span className="text-[10px] text-white/25 font-mono uppercase tracking-wider">{call.host}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Replay card — Netflix style, matches NetflixCard
   ──────────────────────────────────────────── */

function ReplayCard({ replay }: { replay: Replay }) {
  const [hovered, setHovered] = useState(false);
  const s = TYPE_STYLE[replay.type];

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-300 border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-1"
        style={hovered ? { boxShadow: `0 16px 60px ${s.color}22` } : undefined}
      >
        {/* Thumb */}
        <div className="relative aspect-video overflow-hidden" style={{ background: "#0e0e10" }}>
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${s.color}15, transparent 65%)`,
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at 50% 50%, black 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 30%, transparent 85%)",
          }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`,
          }} />
          <CallThumbArt type={replay.type} />

          {/* Darken bottom for title */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to bottom, transparent 40%, rgba(14,14,16,0.55) 75%, rgba(14,14,16,0.85) 100%)",
          }} />

          {/* Type */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <s.icon className="w-3 h-3" style={{ color: s.color }} strokeWidth={2} />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.25em]" style={{ color: s.color }}>{s.label}</span>
          </div>

          {/* Duration */}
          <div className="absolute top-2.5 right-2.5 text-[10px] font-bold font-mono text-white/70">
            {fmtDuration(replay.durationMin)}
          </div>

          {/* Title overlaid bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3 pt-8 pointer-events-none">
            <h3 className="text-[14px] font-bold text-white tracking-tight leading-tight line-clamp-2"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {replay.title}
            </h3>
          </div>

          {/* Play on hover */}
          {hovered && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center" style={{ borderColor: s.color }}>
                <Play className="w-6 h-6 ml-0.5" style={{ color: s.color }} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-3 bg-[#141417] flex flex-col gap-2">
          <p className="text-[11px] leading-relaxed line-clamp-2 text-white/45">{replay.desc}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/35">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-medium">{replay.date}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1 text-white/30">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{fmtDuration(replay.durationMin)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */

export default function CallsPage() {
  const [tab, setTab] = useState<"agenda" | "replays" | "prop">("agenda");
  const liveCall = SCHEDULE.find((c) => c.live);
  const propReplays = REPLAYS.filter((r) => r.type === "aula-prop");

  const TABS = [
    { id: "agenda" as const,  label: "Agenda",    icon: Calendar },
    { id: "replays" as const, label: "Replays",   icon: Video },
    { id: "prop" as const,    label: "Mesa Prop", icon: Award },
  ];

  return (
    <div className="space-y-10">
      <CallsHero liveCall={liveCall} upcomingCount={SCHEDULE.length} />

      {/* Tabs — pill nav, premium feel */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/[0.06] bg-[#0e0e10] w-fit">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                active ? "bg-white/[0.06] text-white" : "text-white/40 hover:text-white/70"
              }`}>
              <t.icon className={`w-3.5 h-3.5 ${active ? "text-brand-500" : ""}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Agenda */}
      {tab === "agenda" && (
        <div className="space-y-10">
          <section>
            <SectionHeader
              accent="#FF5500"
              title="Próximas calls"
              subtitle="Ao vivo com o URA"
              meta={<span className="text-[12px] text-white/40 font-mono font-medium">{SCHEDULE.length} agendadas</span>}
            />
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-1 gap-3">
                {SCHEDULE.map((c) => <ScheduleCard key={c.id} call={c} />)}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#141417] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <h3 className="text-[12px] font-bold text-white/85 uppercase tracking-wider">Rotina da semana</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { day: "Seg — Qui", time: "10:30 BRT", label: "Call Operação NY",   desc: "~2h · ao vivo",          color: "#EF4444" },
                      { day: "Quarta",    time: "19:00 BRT", label: "Aula de mesa prop", desc: "~1h30 · ao vivo",        color: "#A855F7" },
                      { day: "Sexta",     time: "19:00 BRT", label: "Q&A aberto",         desc: "~1h · perguntas ao vivo", color: "#3B82F6" },
                      { day: "Sáb",       time: "20:00 BRT", label: "Revisão semanal",    desc: "~1h · review de trades", color: "#F59E0B" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                        <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: r.color + "60" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{r.day}</p>
                            <p className="text-[10px] text-white/25 font-mono">{r.time}</p>
                          </div>
                          <p className="text-[12px] font-semibold text-white/90 leading-tight">{r.label}</p>
                          <p className="text-[10.5px] text-white/35 mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-[#141417] p-5">
                  <div className="absolute inset-0" style={{
                    background: "radial-gradient(ellipse 70% 70% at 80% 20%, rgba(255,85,0,0.10), transparent 60%)",
                  }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-3.5 h-3.5 text-brand-500" />
                      <h3 className="text-[12px] font-bold text-white/85 uppercase tracking-wider">Receber alerta</h3>
                    </div>
                    <p className="text-[11px] text-white/45 leading-relaxed mb-3">
                      Ative notificações no Discord pra saber quando o URA começar uma call ao vivo.
                    </p>
                    <Link href="https://discord.com/channels/@me" target="_blank"
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 rounded-lg border border-brand-500 text-[12px] font-bold text-brand-500 hover:bg-brand-500/[0.04] transition-colors">
                      Ativar no Discord
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Replays */}
      {tab === "replays" && (
        <section>
          <SectionHeader
            accent="#EF4444"
            title="Replays"
            subtitle="Gravações das calls recentes"
            meta={<span className="text-[12px] text-white/40 font-mono font-medium">{REPLAYS.length} disponíveis</span>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPLAYS.map((r) => <ReplayCard key={r.id} replay={r} />)}
          </div>
        </section>
      )}

      {/* Mesa Prop */}
      {tab === "prop" && (
        <div className="space-y-10">
          <section>
            <SectionHeader
              accent="#A855F7"
              title="Aulas de Mesa Prop"
              subtitle="FundingPips, TopStep, 5%ers e mais"
              meta={<span className="text-[12px] text-white/40 font-mono font-medium">{propReplays.length} aulas</span>}
            />
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {propReplays.map((r) => <ReplayCard key={r.id} replay={r} />)}
              </div>

              {/* Firms sidebar */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#141417] p-5 h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <h3 className="text-[12px] font-bold text-white/85 uppercase tracking-wider">Mesas cobertas</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "FundingPips",       tag: "Challenge 2-phase",       color: "#10B981" },
                    { name: "TopStep",           tag: "Trader Combine",          color: "#3B82F6" },
                    { name: "The 5%ers",         tag: "Hyper Growth · Bootcamp", color: "#F59E0B" },
                    { name: "MyFundedFutures",   tag: "Rally · Expert · Starter", color: "#EC4899" },
                    { name: "Apex Trader",       tag: "Evaluation",              color: "#A855F7" },
                  ].map((firm, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.04] transition-colors">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: firm.color, boxShadow: `0 0 10px ${firm.color}80` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-white/90 leading-tight">{firm.name}</p>
                        <p className="text-[10px] text-white/35 mt-0.5 truncate">{firm.tag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
