"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Check, Lock, Clock, BookOpen, FileText, Calendar } from "lucide-react";
import { LessonThumb, lessonThumbKind } from "@/components/elite/LessonThumb";
import type { ModuleData, LessonData } from "@/lib/curriculum";

/* ────────────────────────────────────────────
   Curriculum Data — Elite 4.0 (fetched server-side, injected via props)
   ──────────────────────────────────────────── */

type Lesson = LessonData & { completed: boolean; locked: boolean };
type Module = Omit<ModuleData, "lessons"> & { lessons: Lesson[] };

/* Curriculum data now arrives as a prop (curriculum: ModuleData[]) from
   the server component wrapper at ./page.tsx, which fetches from Supabase. */


/* ────────────────────────────────────────────
   Netflix Card
   ──────────────────────────────────────────── */

function NetflixCard({ lesson, mod, index }: { lesson: Lesson; mod: Module; index: number }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (!lesson.locked) router.push(`/elite/aulas/${lesson.id}`);
  };

  return (
    <div
      className="relative cursor-pointer h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div
        className={`relative overflow-hidden rounded-xl border transition-all duration-300 h-full flex flex-col ${
          lesson.locked
            ? "border-white/[0.04] opacity-45"
            : "border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-0.5"
        }`}
        style={
          hovered && !lesson.locked
            ? { boxShadow: `0 16px 60px ${mod.accentHex}20` }
            : undefined
        }
      >
        {/* Thumbnail area — 16:9 ratio · pictograma sempre 100% visível */}
        <div className="relative aspect-video overflow-hidden">
          <LessonThumb kind={lessonThumbKind(lesson.id)} accent={mod.accentHex} />

          {/* Lock overlay */}
          {lesson.locked && (
            <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.10] flex items-center justify-center">
                <Lock className="w-5 h-5 text-white/40" />
              </div>
            </div>
          )}

          {/* Completed */}
          {lesson.completed && !lesson.locked && (
            <div className="absolute top-2.5 left-2.5">
              <Check className="w-5 h-5 text-green-400" strokeWidth={2} />
            </div>
          )}

          {/* Play on hover */}
          {!lesson.locked && hovered && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: mod.accentHex }}>
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Content — título + subtitle + duração. Altura fixa pra uniformizar cards
            entre módulos (título longo de 2 linhas vs curto de 1 não deixa altura diferente). */}
        <div className="px-4 py-3 bg-[#141417] flex flex-col gap-1.5 min-h-[112px]">
          <h3 className={`text-[14px] font-bold tracking-tight leading-tight line-clamp-2 ${lesson.locked ? "text-white/40" : "text-white"}`}>
            {lesson.title}
          </h3>

          <p className={`text-[11px] leading-relaxed line-clamp-2 flex-1 ${lesson.locked ? "text-white/20" : "text-white/45"}`}>
            {lesson.subtitle}
          </p>

          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-1.5 ${lesson.locked ? "text-white/20" : "text-white/45"}`}>
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">{lesson.duration}</span>
            </div>
            {(lesson.hasQuiz || lesson.hasPdf) && (
              <div className={`flex items-center gap-1.5 ml-auto ${lesson.locked ? "text-white/15" : "text-white/25"}`}>
                {lesson.hasQuiz && <BookOpen className="w-3 h-3" />}
                {lesson.hasPdf && <FileText className="w-3 h-3" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Module Section — grid layout, no horizontal scroll
   ──────────────────────────────────────────── */

function ModuleSection({ mod }: { mod: Module }) {
  const completed = mod.lessons.filter((l) => l.completed).length;
  const total = mod.lessons.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isLive = mod.id === "operacao";

  if (isLive) {
    return (
      <section id={`module-${mod.id}`}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-1 h-7 rounded-full" style={{ backgroundColor: mod.accentHex + "80" }} />
          <h2 className="text-[22px] font-bold text-white tracking-tight">{mod.title}</h2>
          <span className="text-[13px] text-white/40 font-medium">{mod.subtitle}</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#141417]">
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 60% 60% at 70% 30%, ${mod.accentHex}12, transparent)`
          }} />
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-40" />
                </div>
                <span className="text-[12px] font-semibold text-brand-500">Ao Vivo</span>
              </div>
              <h3 className="text-[24px] font-bold text-white mb-3">Calls de Operação</h3>
              <p className="text-[14px] text-white/45 leading-relaxed max-w-lg">
                Calls diárias com o URA, revisão de trades e accountability semanal. Disponível após completar o Módulo 4.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-[11px] text-white/45 mb-1.5">Horário</p>
                <p className="text-[18px] text-white font-bold">10:30 — 12:30</p>
              </div>
              <div className="px-6 py-5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-[11px] text-white/45 mb-1.5">Requer</p>
                <p className="text-[18px] text-white font-bold">Módulo 04</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={`module-${mod.id}`}>
      {/* Section header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-1 h-7 rounded-full" style={{ backgroundColor: mod.accentHex + "80" }} />
        <h2 className="text-[22px] font-bold text-white tracking-tight">{mod.title}</h2>
        <span className="text-[13px] text-white/40 font-medium">{mod.subtitle}</span>
        {total > 0 && (
          <div className="hidden md:flex items-center gap-3 ml-3">
            <div className="w-24 h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: mod.accentHex }} />
            </div>
            <span className="text-[12px] text-white/40 font-mono font-medium">{completed}/{total}</span>
          </div>
        )}
      </div>

      {/* Grid — responsive, no scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {mod.lessons.map((lesson, idx) => (
          <NetflixCard key={lesson.id} lesson={lesson} mod={mod} index={idx} />
        ))}
      </div>

    </section>
  );
}

/* ────────────────────────────────────────────
   Hero — large featured banner
   ──────────────────────────────────────────── */

function Hero({ curriculum }: { curriculum: Module[] }) {
  const router = useRouter();
  const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = curriculum.flatMap((m) => m.lessons).filter((l) => l.completed).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  let next: { lesson: Lesson; mod: Module; idx: number } | null = null;
  for (const mod of curriculum) {
    for (let i = 0; i < mod.lessons.length; i++) {
      if (!mod.lessons[i].completed && !mod.lessons[i].locked) {
        next = { lesson: mod.lessons[i], mod, idx: i };
        break;
      }
    }
    if (next) break;
  }

  const heroAccent = next?.mod.accentHex || "#FF5500";

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08]" style={{ background: "#111114" }}>
      {/* Background effects — subtler */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 80% at 85% 40%, ${heroAccent}12, transparent 60%)`
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, #111114 40%, #111114cc 55%, transparent 80%)"
      }} />

      <div className="relative z-10 px-6 md:px-8 py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left — lesson info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-medium" style={{ color: heroAccent }}>
              Turma 4.0
            </span>
            {next && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[11px] font-medium text-white/55">
                  Módulo {next.mod.number} · Aula {String(next.idx + 1).padStart(2, "0")}
                </span>
              </>
            )}
          </div>

          {next ? (
            <>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight mb-0.5">
                {next.lesson.title}
              </h1>
              <p className="text-[13px] text-white/40 mb-3 max-w-xl leading-relaxed line-clamp-1">{next.lesson.subtitle}</p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => next && router.push(`/elite/aulas/${next.lesson.id}`)}
                  className="interactive-tap flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[13px] font-bold transition-all hover:-translate-y-0.5"
                  style={{ borderColor: heroAccent, color: heroAccent }}>
                  <Play className="w-3.5 h-3.5" />
                  Continuar aula
                </button>
                <div className="flex items-center gap-1.5 text-white/35">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">{next.lesson.duration}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight mb-1">Currículo Elite</h1>
              <p className="text-[13px] text-white/40">5 módulos · {totalLessons} aulas · Do zero à mesa proprietária</p>
            </>
          )}
        </div>

        {/* Right — compact progress */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-[56px] h-[56px]">
            <svg className="w-[56px] h-[56px] -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle cx="28" cy="28" r="24" fill="none" stroke={heroAccent} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${progress * 1.508} 151`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[13px] font-bold text-white">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-[15px] text-white font-bold leading-none">{completedLessons}<span className="text-white/30 font-medium">/{totalLessons}</span></p>
            <p className="text-[11px] text-white/45 mt-1">aulas completas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   Lives Recentes — recorded live sessions (grid + unique thumbs)
   ──────────────────────────────────────────── */

interface LiveRecording {
  id: string;
  title: string;
  date: string;
  duration: string;
  topic: string;
  type: "trade" | "aula" | "revisao";
}

const LIVES_RECENTES: LiveRecording[] = [
  { id: "live-1", title: "Sessão de Trade — NQ", date: "11 Abr", duration: "1h 42min", topic: "AMD na sessão NY, short após manipulação", type: "trade" },
  { id: "live-2", title: "Aula ao Vivo — SMT", date: "09 Abr", duration: "1h 15min", topic: "Divergência NQ/ES confirmando viés bullish", type: "aula" },
  { id: "live-3", title: "Revisão de Trades", date: "07 Abr", duration: "58min", topic: "Revisão das operações da semana dos alunos", type: "revisao" },
  { id: "live-4", title: "Sessão de Trade — NQ", date: "04 Abr", duration: "1h 30min", topic: "Long na sessão London, OB + FVG confluência", type: "trade" },
];

/* Unique thumbnail art per live type */
function LiveThumbArt({ type }: { type: LiveRecording["type"] }) {
  switch (type) {
    case "trade":
      // Live trading — candlesticks + heartbeat line
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Heartbeat / price pulse line */}
          <polyline points="0,100 30,100 45,100 55,60 65,130 75,90 85,95 120,95 140,90 160,50 175,55 195,40 220,45 250,38 280,42 320,30 360,35 400,28"
            stroke="#EF444445" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          {/* Active candles */}
          {[
            { x: 160, o: 55, c: 40, h: 30, l: 65 },
            { x: 195, o: 42, c: 55, h: 35, l: 60 },
            { x: 230, o: 50, c: 38, h: 28, l: 58 },
            { x: 265, o: 40, c: 48, h: 32, l: 55 },
          ].map((c, i) => (
            <g key={i}>
              <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.c < c.o ? "#10B98150" : "#EF444440"} strokeWidth="1.5" />
              <rect x={c.x - 8} y={Math.min(c.o, c.c)} width="16" height={Math.abs(c.c - c.o) || 2}
                fill={c.c < c.o ? "#10B98125" : "transparent"} stroke={c.c < c.o ? "#10B98140" : "#EF444435"} strokeWidth="1" rx="1.5" />
            </g>
          ))}
          {/* Crosshair on current price */}
          <line x1="310" y1="0" x2="310" y2="180" stroke="#EF444418" strokeWidth="1" strokeDasharray="3 4" />
          <line x1="0" y1="32" x2="400" y2="32" stroke="#EF444418" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="310" cy="32" r="4" fill="none" stroke="#EF444450" strokeWidth="1.5" />
        </svg>
      );
    case "aula":
      // Live lesson — whiteboard / presentation feel
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Presentation slide outline */}
          <rect x="60" y="25" width="280" height="130" rx="6" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.15)" strokeWidth="1.5" />
          {/* Content lines — like bullet points */}
          <rect x="85" y="50" width="120" height="4" rx="2" fill="rgba(168,85,247,0.15)" />
          <rect x="85" y="65" width="90" height="4" rx="2" fill="rgba(168,85,247,0.10)" />
          <rect x="85" y="80" width="140" height="4" rx="2" fill="rgba(168,85,247,0.12)" />
          <rect x="85" y="95" width="100" height="4" rx="2" fill="rgba(168,85,247,0.08)" />
          {/* Chart mini diagram on right */}
          <rect x="240" y="45" width="80" height="60" rx="4" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.12)" strokeWidth="1" />
          <polyline points="250,90 260,80 270,85 280,65 290,70 300,55 310,50" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          {/* Pointer / cursor */}
          <circle cx="270" cy="85" r="6" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.30)" strokeWidth="1" />
          <circle cx="270" cy="85" r="2" fill="rgba(168,85,247,0.40)" />
        </svg>
      );
    case "revisao":
      // Review session — checklist / analysis
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Checklist items */}
          {[
            { y: 35, done: true },
            { y: 65, done: true },
            { y: 95, done: false },
            { y: 125, done: false },
          ].map((item, i) => (
            <g key={i}>
              <rect x="100" y={item.y} width="18" height="18" rx="4" fill={item.done ? "#10B98115" : "rgba(255,255,255,0.03)"} stroke={item.done ? "#10B98140" : "rgba(255,255,255,0.08)"} strokeWidth="1.5" />
              {item.done && <polyline points={`${105},${item.y + 10} ${108},${item.y + 13} ${114},${item.y + 6}`} stroke="#10B98170" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="130" y={item.y + 5} width={70 + i * 15} height="4" rx="2" fill={item.done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)"} />
            </g>
          ))}
          {/* Score / result badge */}
          <rect x="260" y="50" width="80" height="75" rx="8" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.18)" strokeWidth="1.5" />
          <text x="300" y="82" textAnchor="middle" fill="rgba(245,158,11,0.50)" fontSize="9" fontFamily="monospace">SCORE</text>
          <text x="300" y="108" textAnchor="middle" fill="rgba(245,158,11,0.70)" fontSize="22" fontFamily="monospace" fontWeight="bold">2/4</text>
        </svg>
      );
  }
}

function LiveCard({ live }: { live: LiveRecording }) {
  const [hovered, setHovered] = useState(false);

  // Tags tipo sem rainbow — todos usam brand como acento unificado.
  // A distinção fica pelo label ("Trade" / "Aula" / "Revisão"), não pela cor.
  const typeColors: Record<string, { accent: string; label: string }> = {
    trade: { accent: "#FF5500", label: "Trade" },
    aula: { accent: "#FF5500", label: "Aula" },
    revisao: { accent: "#FF5500", label: "Revisão" },
  };
  const tc = typeColors[live.type];

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 border-white/[0.06] hover:border-white/[0.15] flex`}
        style={hovered ? { boxShadow: `0 8px 32px ${tc.accent}12` } : undefined}>

        {/* Thumbnail — square, left side */}
        <div className="relative w-[140px] shrink-0 overflow-hidden" style={{ background: "#0e0e10" }}>
          {/* Glow */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${tc.accent}12, transparent 60%)`
          }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)"
          }} />
          {/* Left accent line */}
          <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{
            background: `linear-gradient(to bottom, transparent, ${tc.accent}50 30%, ${tc.accent}30 70%, transparent)`
          }} />

          {/* SVG art — compact version */}
          <LiveThumbArt type={live.type} />

          {/* Play on hover */}
          {hovered && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
                style={{ backgroundColor: tc.accent }}>
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Content — right side */}
        <div className="flex-1 px-4 py-3.5 bg-[#141417] flex flex-col justify-between min-h-[100px]">
          {/* Type + date row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tc.accent }} />
              <span className="text-[11px] font-semibold" style={{ color: tc.accent + "BB" }}>{tc.label}</span>
            </div>
            <div className="flex items-center gap-1 text-white/30">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px]">{live.date}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[13px] font-bold text-white/90 tracking-tight line-clamp-1 mb-1">
            {live.title}
          </h3>

          {/* Topic */}
          <p className="text-[11px] text-white/30 line-clamp-1 flex-1">
            {live.topic}
          </p>

          {/* Duration */}
          <div className="flex items-center gap-1.5 mt-1.5 text-white/25">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium">{live.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivesSection() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-1 h-7 rounded-full bg-red-500/60" />
        <h2 className="text-[22px] font-bold text-white tracking-tight">Lives Recentes</h2>
        <span className="text-[13px] text-white/40 font-medium">Gravações das aulas ao vivo</span>
      </div>

      {/* 2-column grid — horizontal cards, visually distinct from lesson cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {LIVES_RECENTES.map((live) => (
          <LiveCard key={live.id} live={live} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function AulasClient({ curriculum: raw }: { curriculum: ModuleData[] }) {
  // Adorn the server-fetched curriculum with completed/locked state.
  // TODO: wire real completion/lock rules once useProgress moves server-side.
  const curriculum: Module[] = raw.map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => ({ ...l, completed: false, locked: false })),
  }));

  /* Animações .animate-in-up removidas das seções: rodavam toda vez que a
     página montava (inclusive em back navigation), dando sensação de "reload".
     A View Transitions API global já faz crossfade entre rotas, suficiente.
     Mantida só no Hero pra dar um leve respiro no primeiro paint. */
  return (
    <div className="space-y-14">
      <div className="animate-in-up"><Hero curriculum={curriculum} /></div>

      {curriculum.map((mod) => (
        <div key={mod.id}>
          <ModuleSection mod={mod} />
        </div>
      ))}

      <div><LivesSection /></div>

      <div className="text-center py-6">
        <p className="text-[12px] text-white/30">
          Conteúdo exclusivo Elite 4.0 · Aulas gravadas + lives semanais + calls diárias
        </p>
      </div>
    </div>
  );
}
