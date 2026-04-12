import { getSession } from "@/lib/session";
import { avatarUrl } from "@/lib/discord";
import { Calendar, Trophy, Flame, Target, BookOpen, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PerfilPage() {
  const session = (await getSession())!;
  const avatar = avatarUrl(session.userId, session.avatar, 256);
  const displayName = session.globalName || session.username;

  return (
    <div className="space-y-6">
      {/* ── Profile header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        {/* Cover gradient */}
        <div className="h-36 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-purple-500/5 to-blue-500/10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080b14] to-transparent" />
        </div>

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="-mt-14 flex items-end gap-5 mb-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-500/40 to-transparent rounded-2xl blur-md" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt={displayName}
                className="relative w-24 h-24 rounded-2xl object-cover ring-4 ring-[#080b14] shadow-2xl"
              />
            </div>
            <div className="pb-1">
              <h1 className="text-[22px] font-bold text-white tracking-tight">{displayName}</h1>
              <p className="text-[13px] text-white/30">@{session.username}</p>
              <div className="flex gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-lg text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                  <Flame className="w-3 h-3" /> Elite
                </span>
                {session.isVip && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[10px] font-medium text-white/40 uppercase tracking-widest">
                    VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: "Turma", value: "4.0" },
              { icon: BookOpen, label: "Aulas", value: "0/17" },
              { icon: Trophy, label: "Badges", value: "0" },
              { icon: Flame, label: "Streak", value: "0 dias" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <s.icon className="w-4 h-4 text-white/15 mb-2.5" />
                <p className="text-[18px] font-bold text-white leading-none">{s.value}</p>
                <p className="text-[11px] text-white/25 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Goal ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/[0.02] to-transparent" />

        <div className="relative z-10 p-7">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-4 h-4 text-green-500/50" />
            <h2 className="text-[14px] font-semibold text-white/80">Meta do Semestre</h2>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-[13px] text-white/30 mb-1">Nenhuma meta definida</p>
            <p className="text-[11px] text-white/15 mb-5 max-w-xs text-center">
              Ex: &quot;Aprovar mesa $25k&quot; · &quot;3 semanas no verde&quot;
            </p>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/50 font-medium hover:text-green-500 hover:border-green-500/20 transition-all">
              <Zap className="w-3.5 h-3.5" />
              Definir Meta
            </button>
          </div>
        </div>
      </div>

      {/* ── Badges showcase ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080b14]">
        <div className="relative z-10 p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-yellow-500/50" />
              <h2 className="text-[14px] font-semibold text-white/80">Badges</h2>
            </div>
            <Link href="/elite/conquistas" className="text-[11px] text-white/20 hover:text-brand-500 transition-colors flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col items-center py-8">
            <div className="flex gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-11 h-11 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.04]" />
              ))}
            </div>
            <p className="text-[12px] text-white/20">Complete aulas para desbloquear</p>
          </div>
        </div>
      </div>
    </div>
  );
}
