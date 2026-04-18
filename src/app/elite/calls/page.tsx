"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radio, Play, Clock, Calendar, ChevronRight, Trophy, BookOpen,
  TrendingUp, Award, Video, Bell,
} from "lucide-react";

/* ────────────────────────────────────────────
   Mock data — replace with live sources (Discord voice state + Supabase)
   ──────────────────────────────────────────── */

const NOW = new Date();

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

const TYPE_STYLE = {
  operacoes: { color: "#EF4444", label: "Operação",  icon: TrendingUp },
  revisao:   { color: "#F59E0B", label: "Revisão",   icon: BookOpen },
  "aula-prop":{ color: "#A855F7", label: "Mesa Prop", icon: Award },
  qa:        { color: "#3B82F6", label: "Q&A",       icon: Bell },
} as const;

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */

export default function CallsPage() {
  const [tab, setTab] = useState<"agenda" | "replays" | "prop">("agenda");
  const liveCall = SCHEDULE.find((c) => c.live);

  const propReplays = REPLAYS.filter((r) => r.type === "aula-prop");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-50" />
            </div>
            <span className="text-[10px] text-red-400 font-bold tracking-[0.2em] uppercase">
              {liveCall ? "Ao vivo agora" : "Próxima call"}
            </span>
          </div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">Calls Elite</h1>
          <p className="text-[12px] text-white/40 mt-0.5">Operações diárias, aulas de mesa prop, Q&A e replays</p>
        </div>

        <div className="flex gap-1.5">
          {([
            { id: "agenda" as const,  label: "Agenda",    icon: Calendar },
            { id: "replays" as const, label: "Replays",   icon: Video },
            { id: "prop" as const,    label: "Mesa Prop", icon: Award },
          ]).map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
                  active ? "border-white/[0.20] bg-white/[0.05] text-white" : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12]"
                }`}>
                <t.icon className={`w-3.5 h-3.5 ${active ? "text-brand-500" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live banner — always visible when a call is live */}
      {liveCall && (
        <a href="#" className="block relative overflow-hidden rounded-2xl border border-red-500/25 bg-[#0e0e10] hover:border-red-500/40 transition-all group">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-red-500/[0.08] blur-[120px] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
          <div className="relative z-10 p-5 md:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/15 border border-red-500/30 shrink-0 relative">
                <Radio className="w-5 h-5 text-red-400" />
                <div className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-red-400">AO VIVO</span>
                  <span className="text-[10px] text-white/30">·</span>
                  <span className="text-[11px] text-white/45 font-medium">URA · {liveCall.durationMin}min</span>
                </div>
                <h2 className="text-[17px] font-bold text-white tracking-tight leading-tight">{liveCall.title}</h2>
                <p className="text-[12px] text-white/45 mt-0.5 line-clamp-1">{liveCall.desc}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white text-[13px] font-bold group-hover:brightness-110 transition-all shrink-0">
              <Play className="w-3.5 h-3.5 fill-white" />
              Entrar
            </div>
          </div>
        </a>
      )}

      {/* Agenda */}
      {tab === "agenda" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <h2 className="text-[13px] font-bold text-white/85">Próximas calls</h2>
              <span className="ml-auto text-[10px] text-white/30 font-mono">{SCHEDULE.length} agendadas</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {SCHEDULE.map((c) => {
                const s = TYPE_STYLE[c.type];
                return (
                  <div key={c.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors ${c.live ? "bg-red-500/[0.03]" : ""}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "15", border: `1px solid ${s.color}25` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: s.color + "18", color: s.color }}>
                          {s.label}
                        </span>
                        {c.live && (
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-400">
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-bold text-white/90 leading-tight">{c.title}</p>
                      <p className="text-[11.5px] text-white/40 mt-0.5 line-clamp-1">{c.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[12px] font-semibold ${c.live ? "text-red-400" : "text-white/70"}`}>{c.when}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 font-mono">{c.durationMin}min</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar: weekly pattern */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <h3 className="text-[12px] font-bold text-white/85">Rotina da semana</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { day: "Seg — Qui", time: "10:30 BRT", label: "Call Operação NY",   desc: "~2h · ao vivo" },
                  { day: "Quarta",    time: "19:00 BRT", label: "Aula de mesa prop", desc: "~1h30 · ao vivo" },
                  { day: "Sexta",     time: "19:00 BRT", label: "Q&A aberto",         desc: "~1h · perguntas ao vivo" },
                  { day: "Sáb",       time: "20:00 BRT", label: "Revisão semanal",    desc: "~1h · review de trades" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-12 shrink-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{r.day}</p>
                      <p className="text-[10px] text-white/25 font-mono mt-0.5">{r.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white/85 leading-tight">{r.label}</p>
                      <p className="text-[10.5px] text-white/35 mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand-500/15 bg-[#0e0e10] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-3.5 h-3.5 text-brand-500" />
                <h3 className="text-[12px] font-bold text-white/85">Receber alerta</h3>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">
                Ative notificações no Discord pra saber quando o URA começar uma call ao vivo.
              </p>
              <Link href="https://discord.com/channels/@me" target="_blank" className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg border border-brand-500/30 bg-brand-500/10 text-[12px] font-bold text-brand-500 hover:bg-brand-500/20 transition-all">
                Ativar no Discord
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Replays */}
      {tab === "replays" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPLAYS.map((r) => {
            const s = TYPE_STYLE[r.type];
            return (
              <button key={r.id} className="group text-left rounded-xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden hover:border-white/[0.15] hover:-translate-y-0.5 transition-all">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#0a0a0c] overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px]" />
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${s.color}18, transparent 65%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${s.color}70, transparent)` }} />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform" style={{ backgroundColor: s.color }}>
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Duration pill */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-[10px] font-bold font-mono text-white/85">
                    {Math.floor(r.durationMin / 60)}h {String(r.durationMin % 60).padStart(2, "0")}min
                  </div>
                  {/* Type pill */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md backdrop-blur-md" style={{ backgroundColor: s.color + "25", border: `1px solid ${s.color}40` }}>
                    <s.icon className="w-2.5 h-2.5" style={{ color: s.color }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.label}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-[13px] font-bold text-white/95 leading-tight line-clamp-1">{r.title}</h3>
                  <p className="text-[11.5px] text-white/40 mt-1 line-clamp-2 leading-relaxed">{r.desc}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-white/30">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10.5px] font-medium">{r.date}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Mesa Prop */}
      {tab === "prop" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <h2 className="text-[13px] font-bold text-white/85">Aulas de Mesa Prop</h2>
                <span className="ml-auto text-[10px] text-white/30 font-mono">{propReplays.length} aulas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                {propReplays.map((r) => (
                  <button key={r.id} className="group text-left rounded-xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden hover:border-purple-500/30 transition-all">
                    <div className="relative aspect-video bg-[#0a0a0c] overflow-hidden">
                      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, #A855F720, transparent 65%)` }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-[13px] font-bold text-white/95 line-clamp-1">{r.title}</h3>
                      <p className="text-[11px] text-white/40 mt-1 line-clamp-2">{r.desc}</p>
                      <div className="flex items-center gap-3 mt-3 text-white/30">
                        <span className="text-[10.5px] font-mono">{r.date}</span>
                        <span className="text-[10.5px] font-mono">{r.durationMin}min</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Firms list */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <h3 className="text-[12px] font-bold text-white/85">Mesas cobertas</h3>
            </div>
            <div className="space-y-2">
              {[
                { name: "FundingPips",       tag: "Challenge 2-phase",     color: "#10B981" },
                { name: "TopStep",           tag: "Trader Combine",        color: "#3B82F6" },
                { name: "The 5%ers",         tag: "Hyper Growth · Bootcamp", color: "#F59E0B" },
                { name: "MyFundedFutures",   tag: "Rally · Expert · Starter", color: "#EC4899" },
                { name: "Apex Trader",       tag: "Evaluation",            color: "#A855F7" },
              ].map((firm, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.04] transition-colors">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: firm.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white/90 leading-tight">{firm.name}</p>
                    <p className="text-[10px] text-white/35 mt-0.5 truncate">{firm.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
