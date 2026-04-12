import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const MODULES = [
  { id: "fundamentos", title: "Fundamentos SMC", subtitle: "Estrutura de Mercado", description: "Estrutura de mercado, liquidez e comportamento institucional.", lessons: 4, completed: 0, duration: "2h 30min", locked: false, number: "01" },
  { id: "order-blocks", title: "Order Blocks & FVG", subtitle: "Zonas Institucionais", description: "Order Blocks, Fair Value Gaps e Breaker Blocks com precisão.", lessons: 3, completed: 0, duration: "1h 45min", locked: false, number: "02" },
  { id: "amd-sessions", title: "AMD & Sessões", subtitle: "Ciclo Institucional", description: "Accumulation, Manipulation, Distribution nas sessões Asiática, Londres e NY.", lessons: 3, completed: 0, duration: "2h 00min", locked: true, number: "03" },
  { id: "crt", title: "Candle Range Theory", subtitle: "Entradas Sniper", description: "Leia a intenção real dentro de um único candle. Técnica diferenciadora.", lessons: 2, completed: 0, duration: "1h 20min", locked: true, number: "04" },
  { id: "gestao-risco", title: "Gestão & Psicologia", subtitle: "Mindset Profissional", description: "Lot sizing, drawdown, revenge trading e o mindset profissional.", lessons: 3, completed: 0, duration: "1h 50min", locked: true, number: "05" },
  { id: "mesas-prop", title: "Mesas Proprietárias", subtitle: "Funded Trader", description: "Aprovação e manutenção de contas funded. Futures vs Forex.", lessons: 2, completed: 0, duration: "1h 30min", locked: true, number: "06" },
];

export default function AulasPage() {
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons, 0);
  const totalCompleted = MODULES.reduce((sum, m) => sum + m.completed, 0);
  const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-brand-500/[0.04] blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_80%_20%,#000_30%,transparent_80%)]" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <span className="text-[9px] text-white/20 font-semibold tracking-[0.3em] uppercase mb-3 block">Turma 4.0</span>
            <h1 className="text-[28px] font-bold text-white tracking-tight mb-1">Currículo Elite</h1>
            <p className="text-[12px] text-white/25">6 módulos · {totalLessons} aulas · Do zero à mesa proprietária</p>
          </div>

          {/* Progress — ring */}
          <div className="flex items-center gap-5">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#FF5500" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress * 1.508} 151`} className="transition-all duration-700" opacity="0.8" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[14px] font-bold text-white/80">{progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-[13px] text-white/60 font-medium">{totalCompleted}/{totalLessons}</p>
              <p className="text-[10px] text-white/20">completas</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modules — list with number as identity ── */}
      <div className="space-y-3">
        {MODULES.map((mod) => {
          const isComplete = mod.completed === mod.lessons && mod.lessons > 0;
          const moduleProgress = mod.lessons > 0 ? (mod.completed / mod.lessons) * 100 : 0;

          return (
            <div
              key={mod.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                mod.locked
                  ? "border-white/[0.02] bg-[#060810] opacity-35"
                  : "border-white/[0.04] bg-[#080b14] hover:border-white/[0.08]"
              }`}
            >
              <div className="relative z-10 flex items-center gap-0">
                {/* Number column — the identity */}
                <div className={`hidden md:flex w-20 shrink-0 items-center justify-center self-stretch border-r transition-colors ${
                  mod.locked ? "border-white/[0.02]" : "border-white/[0.04] group-hover:border-white/[0.06]"
                }`}>
                  {isComplete ? (
                    <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-500/70" />
                    </div>
                  ) : (
                    <span className={`text-[22px] font-bold font-mono transition-colors ${
                      mod.locked ? "text-white/[0.04]" : "text-white/[0.08] group-hover:text-white/[0.15]"
                    }`}>
                      {mod.number}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-5">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="md:hidden text-[11px] text-white/10 font-mono font-bold">{mod.number}</span>
                    <h3 className={`text-[14px] font-bold tracking-tight ${mod.locked ? "text-white/20" : "text-white/80"}`}>
                      {mod.title}
                    </h3>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${mod.locked ? "text-white/[0.06]" : "text-white/15"}`}>
                      {mod.subtitle}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed mb-2.5 ${mod.locked ? "text-white/10" : "text-white/25"}`}>
                    {mod.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] ${mod.locked ? "text-white/[0.06]" : "text-white/15"}`}>{mod.lessons} aulas</span>
                    <span className={`text-[10px] ${mod.locked ? "text-white/[0.06]" : "text-white/15"}`}>{mod.duration}</span>
                    {!mod.locked && mod.completed > 0 && (
                      <span className="text-[10px] text-brand-500/50">{mod.completed}/{mod.lessons}</span>
                    )}
                  </div>
                </div>

                {/* Right — action or lock */}
                <div className="hidden md:flex items-center gap-4 pr-6 shrink-0">
                  {!mod.locked && (
                    <>
                      <div className="w-20">
                        <div className="w-full h-[3px] bg-white/[0.03] rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500/60 rounded-full transition-all" style={{ width: `${moduleProgress}%` }} />
                        </div>
                      </div>
                      <Link
                        href={`/elite/aulas/${mod.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-medium text-white/30 hover:text-white/70 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group/btn"
                      >
                        {mod.completed > 0 ? "Continuar" : "Começar"}
                        <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                      </Link>
                    </>
                  )}
                  {mod.locked && (
                    <span className="px-3 py-1.5 rounded-lg border border-dashed border-white/[0.04] text-[10px] text-white/10">
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
