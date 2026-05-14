// Server component — sem "use client". Mantém estática, só faz fetch
// do PriceTickerTape (async). Antes era "use client" desnecessário
// porque o TickerTape (TV widget) era client; agora não precisa mais.
import Link from "next/link";
import { Radio, Clock, Bell, Trophy } from "lucide-react";
import { TodayEventsBanner } from "@/components/elite/TodayEventsBanner";
import { PriceTickerTape } from "@/components/elite/PriceTickerTape";

function CallsHero() {
  const accent = "#FF5500";
  return (
    <div className="relative overflow-hidden rounded-xl" style={{ background: "#111114" }}>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 80% at 85% 40%, ${accent}12, transparent 60%)`,
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, #111114 40%, #111114cc 55%, transparent 80%)",
      }} />

      <div className="relative z-10 px-6 md:px-8 py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-medium" style={{ color: accent }}>
              Calls Elite
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[11px] text-white/55">
              Ao vivo no Discord com o URA
            </span>
          </div>

          <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight mb-0.5">
            Calls Elite ao vivo
          </h1>
          <p className="text-[13px] text-white/40 mb-3 max-w-xl leading-relaxed">
            Operações diárias com o URA, aulas de mesa prop, Q&A e revisão semanal.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="https://discord.com/channels/@me" target="_blank"
              className="interactive flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[13px] font-bold transition-colors hover:-translate-y-0.5"
              style={{ borderColor: accent, color: accent }}>
              <Bell className="w-3.5 h-3.5" />
              Abrir Discord
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-[56px] h-[56px] rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
            <Radio className="w-5 h-5" style={{ color: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallsPage() {
  return (
    <div className="space-y-8 min-w-0 max-w-full overflow-x-hidden">
      <div className="animate-in-up"><CallsHero /></div>

      <div className="animate-in-up delay-1">
        <PriceTickerTape />
      </div>

      <div className="animate-in-up delay-2">
        <TodayEventsBanner
          title="Eventos que podem virar tema da call"
          subtitle="acompanhe com o URA"
          accent="#FF5500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="animate-in-up delay-2 rounded-xl bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <h3 className="text-[13px] font-semibold text-white/90">Rotina da semana</h3>
          </div>
          <div className="space-y-3">
            {[
              { day: "Seg — Qui", time: "10:30 BRT", label: "Call Operação NY",   desc: "~2h · ao vivo",          color: "#FF5500" },
              { day: "Quarta",    time: "19:00 BRT", label: "Aula de mesa prop", desc: "~1h30 · ao vivo",        color: "rgba(255,255,255,0.45)" },
              { day: "Sexta",     time: "19:00 BRT", label: "Q&A aberto",         desc: "~1h · perguntas ao vivo", color: "rgba(255,255,255,0.45)" },
              { day: "Sáb",       time: "20:00 BRT", label: "Revisão semanal",    desc: "~1h · review de trades", color: "rgba(255,255,255,0.45)" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: r.color + "60" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[11px] font-semibold text-white/45">{r.day}</p>
                    <p className="text-[10px] text-white/25 font-mono">{r.time}</p>
                  </div>
                  <p className="text-[12px] font-semibold text-white/90 leading-tight">{r.label}</p>
                  <p className="text-[10.5px] text-white/35 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-up delay-3 rounded-xl bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-3.5 h-3.5 text-white/55" />
            <h3 className="text-[13px] font-semibold text-white/90">Mesas prop cobertas</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: "FundingPips",       tag: "Challenge 2-phase",       color: "rgba(255,255,255,0.55)" },
              { name: "TopStep",           tag: "Trader Combine",          color: "rgba(255,255,255,0.55)" },
              { name: "The 5%ers",         tag: "Hyper Growth · Bootcamp", color: "rgba(255,255,255,0.55)" },
              { name: "MyFundedFutures",   tag: "Rally · Expert · Starter", color: "rgba(255,255,255,0.55)" },
              { name: "Apex Trader",       tag: "Evaluation",              color: "rgba(255,255,255,0.55)" },
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

      {/* FAQ — preenche o bottom vazio com conteúdo útil pro primeiro acesso */}
      <div className="animate-in-up delay-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Como entrar na call", desc: "Entra no Discord, canal #call-ao-vivo é marcado na sidebar quando o URA abre a sala." },
          { title: "Perdi, tem gravação?", desc: "Sim — sobe em Aulas > Lives Recentes em até 24h com thumbs e descrição." },
          { title: "Qual mesa começar?", desc: "FundingPips pra quem tá começando (2 fases), TopStep pra quem já tem consistência." },
          { title: "Posso pedir análise?", desc: "Traz o gráfico na aba Q&A aberto (Sexta 19h) ou no Discord com foto + contexto." },
        ].map((item, i) => (
          <div key={i} className="rounded-xl surface-card p-4">
            <p className="text-[12px] font-semibold text-white/85 leading-tight">{item.title}</p>
            <p className="text-[11px] text-white/45 leading-relaxed mt-1.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
