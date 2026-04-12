import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Flame, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function EliteDashboard() {
  const session = (await getSession())!;
  const avatar = avatarUrl(session.userId, session.avatar, 128);
  const displayName = session.globalName || session.username;

  return (
    <div className="space-y-5">
      {/* ── Welcome ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-brand-500/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[200px] bg-blue-600/[0.03] blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_70%_20%,#000_40%,transparent_100%)]" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-500/40 to-transparent rounded-2xl blur-md" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt={displayName} className="relative w-[68px] h-[68px] rounded-2xl object-cover ring-2 ring-white/[0.06] ring-offset-2 ring-offset-[#080b14]" />
            </div>
            <div>
              <p className="text-[12px] text-white/25 font-medium mb-1">Bem-vindo,</p>
              <h1 className="text-[24px] font-bold text-white leading-tight tracking-tight">{displayName}</h1>
              <span className="inline-flex items-center gap-1.5 mt-2 text-[9px] text-brand-500/70 font-semibold tracking-[0.2em] uppercase">
                <Flame className="w-3 h-3" /> Elite 4.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-40" />
            </div>
            <div>
              <p className="text-[9px] text-white/20 font-medium uppercase tracking-wider">Próxima call</p>
              <p className="text-[13px] text-white/70 font-semibold">Amanhã, 10:30</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats — pure typography, no icons ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { value: "0", unit: "/17", label: "Aulas completas", accent: "brand-500" },
          { value: "0", unit: "", label: "Badges conquistadas", accent: "yellow-500" },
          { value: "0", unit: "d", label: "Streak de presença", accent: "red-500" },
          { value: "180", unit: "d", label: "Dias restantes", accent: "blue-500" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-white/[0.04] bg-[#080b14] p-5 group hover:border-white/[0.08] transition-all">
            <div className="flex items-baseline gap-0.5 mb-2">
              <span className="text-[32px] font-bold text-white leading-none tracking-tight">{stat.value}</span>
              <span className="text-[13px] text-white/15 font-medium">{stat.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full bg-${stat.accent}/40`} />
              <span className="text-[11px] text-white/25 font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action cards — minimal, no icons in headers ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/elite/aulas" className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-[#080b14] p-7 hover:border-white/[0.08] transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-white/80 group-hover:text-white transition-colors">Continuar Estudando</h3>
                <p className="text-[11px] text-white/20 mt-0.5">6 módulos · 17 aulas</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/15">Progresso</span>
                <span className="text-white/20 font-mono">0%</span>
              </div>
              <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full w-0" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/elite/conquistas" className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-[#080b14] p-7 hover:border-white/[0.08] transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-white/80 group-hover:text-white transition-colors">Conquistas</h3>
                <p className="text-[11px] text-white/20 mt-0.5">Badges + plaquinhas físicas</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-white/[0.015] border border-white/[0.04]" />
              ))}
              <div className="w-9 h-9 rounded-lg border border-dashed border-white/[0.05] flex items-center justify-center">
                <span className="text-[9px] text-white/10 font-mono">+8</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Meta — clean, no icon ── */}
      <div className="rounded-2xl border border-white/[0.04] bg-[#080b14] p-7">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-4 rounded-full bg-green-500/30" />
          <h2 className="text-[14px] font-semibold text-white/60">Meta do Semestre</h2>
        </div>

        <div className="flex flex-col items-center py-5">
          <div className="w-14 h-14 rounded-xl border border-dashed border-white/[0.06] flex items-center justify-center mb-4">
            <span className="text-[18px] text-white/[0.06] font-bold">?</span>
          </div>
          <p className="text-[12px] text-white/20 mb-1">Nenhuma meta definida</p>
          <p className="text-[10px] text-white/10 mb-5">Ex: &quot;Aprovar mesa $25k&quot; · &quot;3 semanas no verde&quot;</p>
          <button className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[12px] text-white/30 font-medium hover:text-green-500 hover:border-green-500/15 transition-all">
            Definir Meta
          </button>
        </div>
      </div>

      {/* ── Activity — contribution grid style ── */}
      <div className="rounded-2xl border border-white/[0.04] bg-[#080b14] p-7">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-brand-500/30" />
            <h2 className="text-[14px] font-semibold text-white/60">Atividade</h2>
          </div>
          <Link href="/elite/comunidade" className="text-[10px] text-white/15 hover:text-brand-500/60 transition-colors flex items-center gap-1">
            Ver turma <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col items-center py-6">
          {/* Contribution grid */}
          <div className="flex gap-[3px] mb-5">
            {Array.from({ length: 12 }).map((_, week) => (
              <div key={week} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, day) => (
                  <div key={day} className="w-[10px] h-[10px] rounded-[2px] bg-white/[0.02] border border-white/[0.02]" />
                ))}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/15">Sua timeline aparece conforme você interage</p>
        </div>
      </div>
    </div>
  );
}
