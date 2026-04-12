import { Flame, MessageCircle, ShieldAlert, UserX, AlertTriangle, Lock, ArrowRight } from "lucide-react";

const ERRORS: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
  not_in_server: {
    icon: <UserX className="w-5 h-5" />,
    title: "Você não está no servidor",
    desc: "Entre no Discord da URA Labs primeiro.",
  },
  not_elite: {
    icon: <ShieldAlert className="w-5 h-5" />,
    title: "Acesso exclusivo Elite",
    desc: "Você precisa do cargo Elite no Discord. Abra um ticket para saber como.",
  },
  auth_failed: {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Falha na autenticação",
    desc: "Algo deu errado. Tente novamente.",
  },
  invalid_state: {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Sessão expirada",
    desc: "Tente novamente.",
  },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const err = error ? ERRORS[error] : null;

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* ── Layered background ── */}
      <div className="absolute inset-0 bg-[#030508]" />

      {/* Mesh gradient — top right warm */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-brand-500/[0.07] blur-[150px]" />
      {/* Mesh gradient — bottom left cool */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
      {/* Center subtle warm */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-500/[0.03] blur-[100px]" />

      {/* Grid pattern — very subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_30%,transparent_80%)]" />

      {/* Noise */}
      <div className="bg-noise" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[420px] px-6">

        {/* Logo — minimal */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div className="relative">
            <div className="absolute -inset-2 bg-brand-500/20 rounded-2xl blur-xl" />
            <div className="relative p-2.5 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl shadow-2xl">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white tracking-tight">
              URA <span className="text-brand-500">LABS</span>
            </span>
            <span className="text-[9px] text-white/30 font-medium tracking-[0.3em] uppercase -mt-0.5">
              Elite Platform
            </span>
          </div>
        </div>

        {/* ── Glass card ── */}
        <div className="relative">
          {/* Card glow */}
          <div className="absolute -inset-px bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent rounded-2xl" />

          <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] overflow-hidden">
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

            <div className="p-10">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white/30" />
                </div>
              </div>

              {/* Text */}
              <h1 className="text-[22px] font-bold text-white text-center mb-2 tracking-tight">
                Área Exclusiva
              </h1>
              <p className="text-[13px] text-white/40 text-center mb-10 leading-relaxed max-w-[280px] mx-auto">
                Acesso restrito para membros da mentoria Elite. Autentique via Discord para continuar.
              </p>

              {/* Error */}
              {err && (
                <div className="flex items-start gap-3 p-4 mb-8 rounded-xl bg-red-500/[0.06] border border-red-500/[0.1]">
                  <div className="text-red-400/80 mt-0.5 shrink-0">{err.icon}</div>
                  <div>
                    <p className="text-[13px] text-red-400 font-semibold">{err.title}</p>
                    <p className="text-[11px] text-red-400/50 mt-0.5">{err.desc}</p>
                  </div>
                </div>
              )}

              {/* Login button */}
              <a
                href="/api/auth/login"
                className="group flex items-center justify-center gap-3 w-full h-[52px] rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-[14px] transition-all duration-200 shadow-[0_4px_24px_rgba(88,101,242,0.25)] hover:shadow-[0_8px_32px_rgba(88,101,242,0.35)] hover:-translate-y-0.5"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
                Entrar com Discord
                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
              </a>

              {/* Subtext */}
              <p className="text-[11px] text-white/20 text-center mt-5">
                Verificamos seu cargo Elite automaticamente
              </p>
            </div>
          </div>
        </div>

        {/* Bottom link — very subtle */}
        <div className="mt-10 text-center">
          <a
            href="/#pricing"
            className="inline-flex items-center gap-2 text-[12px] text-white/25 hover:text-brand-500/70 transition-colors duration-300"
          >
            Ainda não é Elite? Ver planos
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex items-center justify-center gap-6">
          {["88 membros", "4 turmas", "+800k financiados"].map((text, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-brand-500/30" />
              <span className="text-[10px] text-white/15 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
