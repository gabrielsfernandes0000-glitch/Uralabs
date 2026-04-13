import { Users, Trophy, TrendingUp, Activity } from "lucide-react";

export default function ComunidadePage() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-blue-500/[0.04] blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_80%_20%,#000_30%,transparent_80%)]" />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-500/60" />
            <span className="text-[10px] text-white/30 font-semibold tracking-[0.25em] uppercase">Ao vivo</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight mb-1">Comunidade Elite</h1>
          <p className="text-[13px] text-white/35">Resultados reais de traders reais. Turma 4.0.</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, value: "44", label: "Membros Elite" },
          { icon: Trophy, value: "0", label: "Mesas Aprovadas" },
          { icon: TrendingUp, value: "0", label: "Payouts" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080b14] p-5">
            <s.icon className="w-4 h-4 text-white/15 mb-3" />
            <p className="text-[24px] font-bold text-white leading-none">{s.value}</p>
            <p className="text-[11px] text-white/25 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Activity feed ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="relative z-10 p-7">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-4 h-4 text-yellow-500/50" />
            <h2 className="text-[14px] font-semibold text-white/80">Mural de Conquistas</h2>
          </div>

          <div className="flex flex-col items-center py-14">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.05] flex items-center justify-center mb-5">
              <Trophy className="w-7 h-7 text-white/[0.06]" />
            </div>
            <p className="text-[13px] text-white/25 mb-1">O mural ganha vida com a turma</p>
            <p className="text-[11px] text-white/15 max-w-xs text-center">Mesas aprovadas, payouts recebidos, streaks e badges — tudo aparece aqui em tempo real</p>
          </div>
        </div>
      </div>

      {/* ── Ranking ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="relative z-10 p-7">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-4 h-4 text-brand-500/50" />
            <h2 className="text-[14px] font-semibold text-white/80">Ranking da Turma</h2>
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((pos) => (
              <div key={pos} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.03] hover:border-white/[0.06] transition-colors">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold font-mono ${
                  pos === 1 ? "bg-yellow-500/10 text-yellow-500/60" :
                  pos === 2 ? "bg-white/[0.04] text-white/30" :
                  pos === 3 ? "bg-brand-500/10 text-brand-500/50" :
                  "bg-white/[0.02] text-white/15"
                }`}>
                  {pos}
                </span>
                <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
                <div className="flex-1">
                  <div className="h-2.5 w-20 bg-white/[0.03] rounded" />
                </div>
                <div className="flex gap-1.5">
                  <div className="w-5 h-5 rounded bg-white/[0.02] border border-white/[0.03]" />
                  <div className="w-5 h-5 rounded bg-white/[0.02] border border-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-white/15 mt-5">Ranking preenchido conforme a turma interage</p>
        </div>
      </div>
    </div>
  );
}
