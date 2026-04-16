"use client";

import { Flame, BookOpen, Target, Play, Lock, Check, ArrowRight, Clock } from "lucide-react";
import { Reveal } from "./Reveal";

/* ── SVG Thumbnails (faithful to the real platform) ── */

function ThumbShell({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: "#0e0e10" }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 70% 70% at 60% 40%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 60% 40%, black 20%, transparent 75%)"
      }} />
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${accent}60 30%, ${accent}40 70%, transparent)`
      }} />
      {children}
      <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: "linear-gradient(to top, #141417, transparent)" }} />
    </div>
  );
}

/* ── Thumbs per lesson ── */

function ThumbIntro({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 30% 60%, ${a}20, transparent 60%)` }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <path d="M 40 190 Q 120 180 180 140 Q 240 100 280 60 Q 320 20 380 10" stroke={a+"40"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="380" cy="10" r="4" fill={a+"70"} />
        <circle cx="380" cy="10" r="10" fill={a+"15"} />
        {[{x:100,y:185},{x:150,y:160},{x:210,y:125},{x:260,y:80},{x:310,y:40}].map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.5+i*0.3} fill={a+"30"} />
        ))}
      </svg>
    </ThumbShell>
  );
}

function ThumbCandle({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${a}15, transparent 60%)` }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <line x1="200" y1="20" x2="200" y2="200" stroke={a+"30"} strokeWidth="2" />
        <rect x="175" y="60" width="50" height="100" fill={a+"25"} stroke={a+"60"} strokeWidth="2" rx="3" />
        <text x="284" y="24" fill={a+"70"} fontSize="10" fontFamily="monospace">HIGH</text>
        <text x="284" y="49" fill={a+"70"} fontSize="10" fontFamily="monospace">OPEN</text>
        <text x="284" y="159" fill={a+"70"} fontSize="10" fontFamily="monospace">CLOSE</text>
        <text x="284" y="189" fill={a+"70"} fontSize="10" fontFamily="monospace">LOW</text>
        {[{x:60,t:70,b:140},{x:90,t:50,b:110},{x:120,t:80,b:160}].map((c,i) => (
          <g key={i}>
            <line x1={c.x} y1={c.t-15} x2={c.x} y2={c.b+15} stroke={a+"20"} strokeWidth="1.5" />
            <rect x={c.x-6} y={c.t} width="12" height={c.b-c.t} fill={a+"20"} stroke={a+"35"} strokeWidth="1" rx="1.5" />
          </g>
        ))}
      </svg>
    </ThumbShell>
  );
}

function ThumbRisco({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <path d="M 140 30 L 200 15 L 260 30 L 260 120 Q 260 170 200 195 Q 140 170 140 120 Z" fill={a+"08"} stroke={a+"35"} strokeWidth="2" />
        <polyline points="185,105 197,118 220,85" stroke={a+"50"} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="290" y="65" fill={a+"80"} fontSize="13" fontFamily="monospace" fontWeight="bold">1%</text>
        <text x="330" y="65" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">/dia</text>
        <text x="290" y="100" fill={a+"80"} fontSize="13" fontFamily="monospace" fontWeight="bold">2.5%</text>
        <text x="342" y="100" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">/sem</text>
        <text x="290" y="135" fill={a+"80"} fontSize="13" fontFamily="monospace" fontWeight="bold">1.5-3R</text>
      </svg>
    </ThumbShell>
  );
}

function ThumbOB({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 45% 40%, ${a}18, transparent 55%)` }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <polyline points="30,170 90,155 140,150 155,120 190,90 230,70 290,55 350,40 380,35" stroke={a+"40"} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <rect x="110" y="115" width="85" height="40" fill={a+"18"} stroke={a+"50"} strokeWidth="1.5" rx="3" />
        <text x="152" y="140" textAnchor="middle" fill={a+"90"} fontSize="14" fontFamily="monospace" fontWeight="bold">OB</text>
        <path d="M 155 155 Q 160 180 175 165 Q 190 150 200 95" stroke={a+"40"} strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <rect x="300" y="80" width="60" height="45" fill={a+"06"} stroke={a+"20"} strokeWidth="1" rx="4" />
        <text x="330" y="100" textAnchor="middle" fill={a+"50"} fontSize="8" fontFamily="monospace">SMART</text>
        <text x="330" y="115" textAnchor="middle" fill={a+"50"} fontSize="8" fontFamily="monospace">MONEY</text>
      </svg>
    </ThumbShell>
  );
}

function ThumbFVG({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <line x1="120" y1="50" x2="120" y2="160" stroke={a+"35"} strokeWidth="2" />
        <rect x="105" y="80" width="30" height="60" fill={a+"30"} stroke={a+"50"} strokeWidth="1.5" rx="2" />
        <rect x="140" y="80" width="80" height="30" fill={a+"12"} stroke={a+"30"} strokeWidth="1" rx="2" strokeDasharray="5 3" />
        <text x="180" y="99" textAnchor="middle" fill={a+"70"} fontSize="12" fontFamily="monospace" fontWeight="bold">FVG</text>
        <line x1="180" y1="20" x2="180" y2="110" stroke={a+"35"} strokeWidth="2" />
        <rect x="165" y="30" width="30" height="50" fill={a+"30"} stroke={a+"50"} strokeWidth="1.5" rx="2" />
        <rect x="280" y="130" width="80" height="35" fill={a+"08"} stroke={a+"25"} strokeWidth="1" rx="3" />
        <text x="320" y="151" textAnchor="middle" fill={a+"55"} fontSize="9" fontFamily="monospace">BREAKER</text>
      </svg>
    </ThumbShell>
  );
}

function ThumbPD({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <rect x="50" y="10" width="300" height="95" fill="#EF444408" stroke="#EF444418" strokeWidth="1" rx="4" />
        <text x="70" y="35" fill="#EF444460" fontSize="11" fontFamily="monospace" fontWeight="bold">PREMIUM</text>
        <line x1="50" y1="110" x2="350" y2="110" stroke={a+"50"} strokeWidth="2" strokeDasharray="8 4" />
        <text x="355" y="114" fill={a+"80"} fontSize="12" fontFamily="monospace" fontWeight="bold">50%</text>
        <rect x="50" y="115" width="300" height="95" fill="#10B98108" stroke="#10B98118" strokeWidth="1" rx="4" />
        <text x="70" y="150" fill="#10B98160" fontSize="11" fontFamily="monospace" fontWeight="bold">DISCOUNT</text>
      </svg>
    </ThumbShell>
  );
}

function ThumbLiquidez({ a }: { a: string }) {
  return (
    <ThumbShell accent={a}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
        <polyline points="30,120 70,115 130,100 190,80 250,70 310,75 370,50" stroke={a+"45"} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <rect x="240" y="20" width="130" height="28" fill="#10B98110" stroke="#10B98130" strokeWidth="1" rx="4" />
        <text x="305" y="39" textAnchor="middle" fill="#10B98170" fontSize="10" fontFamily="monospace" fontWeight="bold">BUY SIDE LQ</text>
        <rect x="30" y="170" width="140" height="28" fill="#EF444410" stroke="#EF444430" strokeWidth="1" rx="4" />
        <text x="100" y="189" textAnchor="middle" fill="#EF444470" fontSize="10" fontFamily="monospace" fontWeight="bold">SELL SIDE LQ</text>
      </svg>
    </ThumbShell>
  );
}

/* ── Lesson card ── */

type PreviewLesson = {
  num: string;
  title: string;
  subtitle: string;
  duration: string;
  accent: string;
  thumb: React.ReactNode;
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
};

function LessonCard({ lesson }: { lesson: PreviewLesson }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        {lesson.thumb}
        {lesson.completed && (
          <div className="absolute top-2.5 left-2.5">
            <div className="w-6 h-6 rounded-full bg-green-500/25 border border-green-500/50 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-400" />
            </div>
          </div>
        )}
        {lesson.current && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: lesson.accent }}>
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <div className="px-3.5 pt-2.5 pb-3 bg-[#141417] flex flex-col">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-[11px] font-bold font-mono shrink-0" style={{ color: lesson.accent+"70" }}>{lesson.num}</span>
          <h3 className="text-[13px] font-bold tracking-tight leading-snug line-clamp-1 text-white/90">{lesson.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-white/25" />
          <span className="text-[9px] text-white/25">{lesson.duration}</span>
          <div className="w-px h-2.5 bg-white/5" />
          <BookOpen className="w-3 h-3 text-white/20" />
          <span className="text-[9px] text-white/20">Quiz</span>
        </div>
      </div>
    </div>
  );
}

/* ── Treino card ── */

type PreviewTreino = {
  title: string;
  desc: string;
  difficulty: string;
  accent: string;
};

function TreinoCard({ treino }: { treino: PreviewTreino }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-3.5 hover:border-white/[0.15] transition-all">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${treino.accent}50, transparent)` }} />
      <div className="flex items-start gap-2.5 mb-1.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: treino.accent+"12" }}>
          <Target className="w-3 h-3" style={{ color: treino.accent+"BB" }} />
        </div>
        <h4 className="text-[12px] font-bold text-white/80 leading-tight">{treino.title}</h4>
      </div>
      <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2 ml-[34px]">{treino.desc}</p>
      <span className="text-[9px] text-white/20 ml-[34px] block mt-1">· {treino.difficulty}</span>
    </div>
  );
}

/* ── Module section header ── */

function ModuleHeader({ num, title, subtitle, color, done, total }: {
  num: string; title: string; subtitle: string; color: string; done: number; total: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color+"80" }} />
      <span className="text-sm font-bold text-white">{title}</span>
      <span className="text-[11px] text-white/35">{subtitle}</span>
      <div className="flex items-center gap-2 ml-auto">
        <div className="w-16 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${(done/total)*100}%`, backgroundColor: color }} />
        </div>
        <span className="text-[10px] text-white/30 font-mono">{done}/{total}</span>
      </div>
    </div>
  );
}

/* ── Data ── */

const MODULE_1_LESSONS: PreviewLesson[] = [
  { num: "01", title: "Introdução ao Trade", subtitle: "O que é trade, como funciona a mentoria, mindset profissional", duration: "20min", accent: "#FF5500", thumb: <ThumbIntro a="#FF5500" />, completed: true },
  { num: "02", title: "Leitura de Candle", subtitle: "Timeframes, o que é um candle, como ler preço", duration: "18min", accent: "#FF5500", thumb: <ThumbCandle a="#FF5500" />, completed: true },
  { num: "03", title: "Gerenciamento de Risco", subtitle: "1% diário, 2.5% semanal — as regras que te mantêm vivo", duration: "22min", accent: "#FF5500", thumb: <ThumbRisco a="#FF5500" />, completed: true },
];

const MODULE_2_LESSONS: PreviewLesson[] = [
  { num: "01", title: "Order Blocks", subtitle: "Zonas institucionais — onde os grandes players se posicionam", duration: "25min", accent: "#3B82F6", thumb: <ThumbOB a="#3B82F6" />, completed: true },
  { num: "02", title: "FVG & Breaker Blocks", subtitle: "Fair Value Gaps, preenchimento e confluência com OB", duration: "20min", accent: "#3B82F6", thumb: <ThumbFVG a="#3B82F6" />, completed: true },
  { num: "03", title: "Premium & Discount", subtitle: "Fibonacci 50% — onde comprar e onde vender", duration: "18min", accent: "#3B82F6", thumb: <ThumbPD a="#3B82F6" />, current: true },
  { num: "04", title: "Liquidez", subtitle: "", duration: "22min", accent: "#3B82F6", thumb: <ThumbLiquidez a="#3B82F6" /> },
];

const MODULE_1_TREINOS: PreviewTreino[] = [
  { title: "Leitura de Candle", desc: "Identifique o que cada candle diz sobre compradores vs vendedores.", difficulty: "Iniciante", accent: "#FF5500" },
  { title: "Calcule o Risco", desc: "Posicione stop e alvo. Qual o tamanho do lote?", difficulty: "Iniciante", accent: "#FF5500" },
];

const MODULE_2_TREINOS: PreviewTreino[] = [
  { title: "Marque os Order Blocks", desc: "Encontre as zonas onde os institucionais se posicionaram.", difficulty: "Intermediário", accent: "#3B82F6" },
  { title: "Identifique FVGs", desc: "Marque os Fair Value Gaps e diga quais serão preenchidos.", difficulty: "Intermediário", accent: "#3B82F6" },
  { title: "Premium ou Discount?", desc: "Defina as zonas usando Fibonacci 50%.", difficulty: "Intermediário", accent: "#3B82F6" },
];

/* ── Main Component ── */

export function ElitePreview() {
  return (
    <section id="platform" className="py-24 bg-dark-900 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
              <Flame className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs font-bold text-brand-500 tracking-wide uppercase">Plataforma Elite 4.0</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Olha por Dentro</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Currículo estruturado do zero ao avançado, com aulas gravadas, exercícios práticos e treinos interativos. Tudo na mesma plataforma.</p>
          </Reveal>
        </div>

        <Reveal delay={0.2} width="100%">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/10 via-white/5 to-brand-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-700" />
            <div className="relative bg-[#0a0a0c] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Browser bar */}
              <div className="h-9 bg-[#1a1a1e] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1 bg-white/[0.04] rounded-md border border-white/5 max-w-[300px] w-full">
                    <Lock className="w-3 h-3 text-green-500/50" />
                    <span className="text-[10px] text-white/30 font-mono truncate">uralabs.com.br/elite/aulas</span>
                  </div>
                </div>
              </div>

              {/* Content — tall, scrollable */}
              <div className="p-4 sm:p-6 max-h-[700px] overflow-y-auto no-scrollbar space-y-8">

                {/* Module pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { num: "01", title: "Base", color: "#FF5500", done: 3, total: 3 },
                    { num: "02", title: "Leitura SMC", color: "#3B82F6", done: 2, total: 4 },
                    { num: "03", title: "Estratégia", color: "#A855F7", done: 0, total: 4 },
                    { num: "04", title: "Execução", color: "#10B981", done: 0, total: 3 },
                    { num: "05", title: "Operação", color: "#EF4444", done: 0, total: 0 },
                  ].map((m, i) => (
                    <div key={i} className={`shrink-0 rounded-xl border p-3 min-w-[120px] ${
                      i <= 1 ? "border-white/[0.10] bg-white/[0.03]" : "border-white/[0.05] bg-[#0e0e10]"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold" style={{ color: m.color+"80" }}>{m.num}</span>
                        <span className="text-[11px] font-bold text-white">{m.title}</span>
                      </div>
                      {m.total > 0 ? (
                        <>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(m.done/m.total)*100}%`, backgroundColor: m.color }} />
                          </div>
                          <p className="text-[9px] text-white/25 mt-1.5">{m.done}/{m.total}</p>
                        </>
                      ) : (
                        <p className="text-[9px] text-white/20 mt-1">Ao vivo</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Module 01: Base ── */}
                <div>
                  <ModuleHeader num="01" title="Base" subtitle="Fundamentos" color="#FF5500" done={3} total={3} />
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mb-4">
                    {MODULE_1_LESSONS.map((l, i) => <div key={i} className="w-[220px] shrink-0"><LessonCard lesson={l} /></div>)}
                  </div>
                  {/* Treinos */}
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <Target className="w-3.5 h-3.5 text-[#FF5500]/60" />
                    <span className="text-[11px] font-semibold text-white/40">Treinos</span>
                    <span className="text-[9px] text-white/20">· {MODULE_1_TREINOS.length} cenários</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {MODULE_1_TREINOS.map((t, i) => <TreinoCard key={i} treino={t} />)}
                  </div>
                </div>

                {/* ── Module 02: Leitura SMC ── */}
                <div>
                  <ModuleHeader num="02" title="Leitura SMC" subtitle="Smart Money Concepts" color="#3B82F6" done={2} total={4} />
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mb-4">
                    {MODULE_2_LESSONS.map((l, i) => <div key={i} className="w-[220px] shrink-0"><LessonCard lesson={l} /></div>)}
                  </div>
                  {/* Treinos */}
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <Target className="w-3.5 h-3.5 text-[#3B82F6]/60" />
                    <span className="text-[11px] font-semibold text-white/40">Treinos</span>
                    <span className="text-[9px] text-white/20">· {MODULE_2_TREINOS.length} cenários</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {MODULE_2_TREINOS.map((t, i) => <TreinoCard key={i} treino={t} />)}
                  </div>
                </div>

                {/* Teaser for more */}
                <div className="text-center py-4 border-t border-white/5">
                  <p className="text-[11px] text-white/25">+ 3 módulos · 6 aulas · 4 treinos adicionais</p>
                  <p className="text-[10px] text-white/15 mt-1">Estratégia · Execução · Operação ao Vivo</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 mb-1">Acesso exclusivo para membros Elite</p>
          <a href="#pricing" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors">
            Quero fazer parte <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
