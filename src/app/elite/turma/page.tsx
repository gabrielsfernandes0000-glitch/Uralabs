"use client";

import { useState } from "react";
import {
  Users, Trophy, TrendingUp, Activity, MessageCircle, Flame,
  ThumbsUp, Send, Clock, Star, Eye, Target, Award, Zap,
} from "lucide-react";

/* ────────────────────────────────────────────
   Mock Data — Elite 1.0 members (the OG class)
   Swap for Supabase queries when live
   ──────────────────────────────────────────── */

type ViewTab = "mural" | "review" | "ranking";

interface Member {
  handle: string;
  name: string;
  color: string;
  initials: string;
  turma: "1.0" | "2.0" | "3.0" | "4.0";
}

const MEMBERS: Record<string, Member> = {
  ura:       { handle: "@uranickk",      name: "URA",              color: "#FF5500", initials: "U",  turma: "1.0" },
  mateus:    { handle: "@mateus.trader", name: "Mateus Oliveira",  color: "#3B82F6", initials: "MO", turma: "1.0" },
  jp:        { handle: "@jpgalan",       name: "JP Galán",         color: "#10B981", initials: "JP", turma: "1.0" },
  lucas:     { handle: "@lucas.smc",     name: "Lucas Rocha",      color: "#A855F7", initials: "LR", turma: "1.0" },
  bruna:     { handle: "@bruna.trade",   name: "Bruna Albuquerque",color: "#EC4899", initials: "BA", turma: "1.0" },
  rafa:      { handle: "@rafatrade",     name: "Rafael Costa",     color: "#F59E0B", initials: "RC", turma: "2.0" },
  pedro:     { handle: "@pedrofx",       name: "Pedro Martins",    color: "#06B6D4", initials: "PM", turma: "2.0" },
  thiago:    { handle: "@thiagoprice",   name: "Thiago Prestes",   color: "#EF4444", initials: "TP", turma: "3.0" },
};

interface Achievement {
  member: keyof typeof MEMBERS;
  type: "mesa" | "payout" | "badge" | "milestone";
  title: string;
  detail: string;
  timestamp: string;
  value?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { member: "mateus", type: "payout",    title: "Payout FundingPips",       detail: "Conta $100k — 2º payout",            timestamp: "há 2h",  value: "$2.400" },
  { member: "jp",     type: "mesa",      title: "Aprovado na The 5%ers",    detail: "Hyper Growth · $100k · passou fase 1",timestamp: "há 5h" },
  { member: "bruna",  type: "badge",     title: "Badge Trinity Unlocked",    detail: "10 quiz A+ consecutivos",            timestamp: "há 1d" },
  { member: "lucas",  type: "payout",    title: "Payout TopStep",           detail: "TopStep 50k — 1º payout",            timestamp: "há 1d",  value: "$1.100" },
  { member: "rafa",   type: "milestone", title: "100 trades registrados",    detail: "Win rate 62% · avg RR 1:2.4",        timestamp: "há 2d" },
  { member: "pedro",  type: "mesa",      title: "Aprovado na FundingPips",   detail: "$50k · passou fases 1 e 2",          timestamp: "há 3d" },
  { member: "mateus", type: "badge",     title: "Badge Iron Hand",          detail: "5 dias sem overtrading",             timestamp: "há 4d" },
  { member: "thiago", type: "payout",    title: "Payout MyFundedFutures",   detail: "50k Rally · 3º payout",              timestamp: "há 5d",  value: "$1.850" },
];

interface Post {
  id: string;
  member: keyof typeof MEMBERS;
  type: "trade" | "analysis" | "question";
  timestamp: string;
  title: string;
  body: string;
  reactions: number;
  comments: number;
  pinned?: boolean;
}

const POSTS: Post[] = [
  {
    id: "p1", member: "jp", type: "trade", timestamp: "há 30min",
    title: "Long NQ — sweep da SSL + engulfing no OB 15m",
    body: "Entrei comprado em 18.042 depois do sweep abaixo de 17.985 (SSL do dia). Candle engulfing fechou acima do OB formado na manipulação. Stop em 17.978, alvo BSL em 18.250. Pegou o TP em 1h40 — +3.2R.",
    reactions: 18, comments: 6, pinned: true,
  },
  {
    id: "p2", member: "bruna", type: "analysis", timestamp: "há 2h",
    title: "Leitura pra hoje: viés bearish no NQ",
    body: "Semanal fechou bearish depois do sweep de BSL em 18.400 quarta. Diário tá em premium, FVG bullish abaixo não foi mitigado. Espero pullback até 18.200-18.250 (premium+OB bearish) pra short. Alvo na FVG não mitigada em 17.950.",
    reactions: 24, comments: 11,
  },
  {
    id: "p3", member: "rafa", type: "question", timestamp: "há 3h",
    title: "Como diferenciar sweep real de breakout genuíno?",
    body: "Toda vez que vejo o preço rompendo um high tenho dúvida se vai voltar (sweep) ou continuar (BOS real). O que vocês olham pra decidir? Tamanho do candle de rompimento? Timeframe da estrutura? Me ajudem...",
    reactions: 9, comments: 14,
  },
  {
    id: "p4", member: "lucas", type: "trade", timestamp: "há 6h",
    title: "Short ES — Judas Swing na abertura + SMT divergence",
    body: "Viés bearish no diário. NY abriu com spike up (Judas) varrendo BSL de 6.085. ES fez HH mas NQ não confirmou — SMT clara. Entrei vendido em 6.082 após candle de rejeição. Stop em 6.095, TP em 6.025. Fechou em +4.1R.",
    reactions: 15, comments: 4,
  },
  {
    id: "p5", member: "mateus", type: "analysis", timestamp: "há 8h",
    title: "Por que OB não mitigado sempre tem prioridade",
    body: "Tava revisando trades e notei: de 12 OBs que operei na semana, os 4 não-mitigados deram +R médio de 2.8, enquanto os 8 já testados deram 1.1. Confluência HTF importa mais que tudo. Alguém mais tem dados parecidos?",
    reactions: 31, comments: 9,
  },
  {
    id: "p6", member: "pedro", type: "question", timestamp: "há 12h",
    title: "Dúvida sobre Consequent Encroachment (CE) do FVG",
    body: "No vídeo da aula o URA falou que 50% do FVG (CE) é o ponto mais forte. Mas na prática vejo o preço reagir antes de chegar no CE várias vezes. Vocês esperam sempre o CE ou entram já no top/bottom do FVG com confirmação?",
    reactions: 12, comments: 8,
  },
];

/* ────────────────────────────────────────────
   Reusable avatar
   ──────────────────────────────────────────── */
function Avatar({ member, size = "md" }: { member: Member; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-[11px]", lg: "w-12 h-12 text-[13px]" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold font-mono shrink-0`}
      style={{ background: `linear-gradient(135deg, ${member.color}30, ${member.color}10)`, color: member.color, border: `1px solid ${member.color}40` }}>
      {member.initials}
    </div>
  );
}

/* ────────────────────────────────────────────
   Mural View — achievement feed
   ──────────────────────────────────────────── */

function MuralView() {
  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users,      value: "44",     label: "Membros Elite",    color: "#ffffff" },
          { icon: Trophy,     value: "12",     label: "Mesas Aprovadas",  color: "#F59E0B" },
          { icon: TrendingUp, value: "$47.3k", label: "Payouts acum.",    color: "#10B981" },
          { icon: Flame,      value: "8",      label: "Em streak hoje",   color: "#FF5500" },
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4">
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.color + "80" }} />
            <p className="text-[20px] font-bold text-white leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10.5px] text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievement feed + sidebar (2 col) */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main feed — 2 cols wide */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500/70" />
              <h2 className="text-[13px] font-bold text-white/85">Mural de Conquistas</h2>
            </div>
            <span className="text-[10px] text-white/30 font-mono">{ACHIEVEMENTS.length} esta semana</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {ACHIEVEMENTS.map((a, i) => {
              const m = MEMBERS[a.member];
              const typeStyle = {
                mesa:      { color: "#F59E0B", icon: Award,   label: "MESA" },
                payout:    { color: "#10B981", icon: TrendingUp, label: "PAYOUT" },
                badge:     { color: "#A855F7", icon: Star,    label: "BADGE" },
                milestone: { color: "#3B82F6", icon: Flame,   label: "MILESTONE" },
              }[a.type];
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <Avatar member={m} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-[12.5px] font-bold text-white/90 truncate">{m.name}</p>
                      <span className="text-[10px] text-white/30">{m.handle}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: typeStyle.color + "18", color: typeStyle.color }}>
                        {typeStyle.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-white/70 leading-snug">{a.title}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{a.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {a.value && <p className="text-[13px] font-bold font-mono" style={{ color: typeStyle.color }}>{a.value}</p>}
                    <p className="text-[10px] text-white/25 mt-0.5">{a.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Top members Elite 1.0 + active today */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              <h3 className="text-[12px] font-bold text-white/85">Turma 1.0 · OGs</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {Object.values(MEMBERS).filter(m => m.turma === "1.0").map((m) => (
                <div key={m.handle} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                  <Avatar member={m} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/85 truncate leading-tight">{m.name}</p>
                    <p className="text-[10px] text-white/30">{m.handle}</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/18 text-brand-500">OG</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-green-500" />
              <h3 className="text-[12px] font-bold text-white/85">Ativos agora</h3>
              <span className="ml-auto text-[10px] text-white/30 font-mono">8</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(MEMBERS).slice(0, 8).map((m) => (
                <div key={m.handle} className="relative">
                  <Avatar member={m} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0e0e10]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Peer Review View — post + feed
   ──────────────────────────────────────────── */

function PeerReviewView() {
  const [activeType, setActiveType] = useState<"trade" | "analysis" | "question" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const typeStyle = {
    trade:    { color: "#10B981", icon: TrendingUp,    label: "Trade" },
    analysis: { color: "#3B82F6", icon: Eye,           label: "Análise" },
    question: { color: "#F59E0B", icon: MessageCircle, label: "Dúvida" },
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Feed on left (2 cols) */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[13px] font-bold text-white/70">Feed da Turma</h3>
          <span className="text-[10.5px] text-white/30 font-mono">{POSTS.length} posts</span>
        </div>

        {POSTS.map((post) => {
          const m = MEMBERS[post.member];
          const style = typeStyle[post.type];
          return (
            <div key={post.id} className={`rounded-xl border p-4 hover:bg-white/[0.01] transition-all ${post.pinned ? "bg-[#121218]" : "bg-[#0e0e10]"}`}
              style={{ borderColor: post.pinned ? style.color + "30" : "rgba(255,255,255,0.06)" }}>
              {post.pinned && (
                <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: style.color + "CC" }}>
                  <Flame className="w-3 h-3" fill="currentColor" /> Em alta
                </div>
              )}
              <div className="flex items-start gap-3">
                <Avatar member={m} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[12.5px] font-bold text-white/90">{m.name}</span>
                    <span className="text-[10px] text-white/30">{m.handle}</span>
                    <span className="text-[10px] text-white/25">·</span>
                    <span className="text-[10px] text-white/30">{post.timestamp}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ml-auto"
                      style={{ backgroundColor: style.color + "18", color: style.color }}>
                      {style.label}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-white/95 mb-1 leading-tight">{post.title}</h4>
                  <p className="text-[12px] text-white/50 leading-relaxed line-clamp-3">{post.body}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                    <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/70 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> {post.reactions}
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/70 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                    </button>
                    <button className="ml-auto text-[11px] text-white/30 hover:text-white/70 transition-colors font-medium">
                      Ver thread
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right sidebar — compose + tags */}
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4 sticky top-4">
          {submitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-[14px] font-bold text-white mb-1">Enviado!</h3>
              <p className="text-[11px] text-white/40 max-w-xs mb-4">Colegas vão poder comentar. Você recebe notificação.</p>
              <button onClick={() => { setSubmitted(false); setActiveType(null); setTitle(""); setBody(""); }}
                className="text-[11px] text-white/35 hover:text-white/70 transition-colors">Enviar outro</button>
            </div>
          ) : (
            <>
              <h3 className="text-[12.5px] font-bold text-white/85 mb-3">O que compartilhar?</h3>
              <div className="space-y-1.5 mb-3">
                {(["trade", "analysis", "question"] as const).map((k) => {
                  const style = typeStyle[k];
                  const active = activeType === k;
                  return (
                    <button key={k} onClick={() => setActiveType(k)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                        active ? "shadow-sm" : "border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.02]"
                      }`}
                      style={active ? { borderColor: style.color + "50", backgroundColor: style.color + "10" } : undefined}>
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: style.color + "18" }}>
                        <style.icon className="w-3.5 h-3.5" style={{ color: style.color }} />
                      </div>
                      <span className={`text-[12px] font-semibold ${active ? "text-white" : "text-white/60"}`}>{style.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeType && (
                <>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12px] text-white/80 placeholder-white/25 focus:outline-none focus:border-white/[0.15] transition-colors mb-2" />
                  <textarea value={body} onChange={(e) => setBody(e.target.value)}
                    placeholder="Descreva aqui..."
                    className="w-full h-24 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12px] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.15] transition-colors mb-3" />
                  <button onClick={() => title.trim() && body.trim() && setSubmitted(true)}
                    disabled={!title.trim() || !body.trim()}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[12px] font-bold transition-all ${
                      title.trim() && body.trim() ? "bg-brand-500 text-white hover:brightness-110" : "bg-white/[0.03] text-white/30 cursor-not-allowed"
                    }`}>
                    <Send className="w-3.5 h-3.5" /> Enviar
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4">
          <h3 className="text-[12px] font-bold text-white/85 mb-2.5">Tópicos ativos</h3>
          <div className="flex flex-wrap gap-1.5">
            {["#OB", "#FVG", "#AMD", "#JudasSwing", "#SMT", "#Liquidez", "#MesaProp", "#NQ", "#ES", "#Sessões"].map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/50 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Ranking View
   ──────────────────────────────────────────── */

function RankingView() {
  const ranked = [
    { member: "mateus" as const, pts: 1248, streak: 12, mesas: 2 },
    { member: "jp" as const,     pts: 1134, streak: 8,  mesas: 2 },
    { member: "bruna" as const,  pts: 1087, streak: 15, mesas: 1 },
    { member: "lucas" as const,  pts: 982,  streak: 6,  mesas: 1 },
    { member: "rafa" as const,   pts: 876,  streak: 4,  mesas: 1 },
    { member: "pedro" as const,  pts: 743,  streak: 9,  mesas: 1 },
    { member: "thiago" as const, pts: 698,  streak: 3,  mesas: 1 },
    { member: "ura" as const,    pts: 620,  streak: 18, mesas: 0 },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            <h2 className="text-[13px] font-bold text-white/85">Ranking — Semana atual</h2>
          </div>
          <span className="text-[10px] text-white/30 font-mono">atualiza a cada hora</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {ranked.map((r, i) => {
            const m = MEMBERS[r.member];
            const pos = i + 1;
            const medalColor = pos === 1 ? "#F59E0B" : pos === 2 ? "#D1D5DB" : pos === 3 ? "#CD7F32" : null;
            return (
              <div key={m.handle} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold font-mono shrink-0`}
                  style={medalColor ? { backgroundColor: medalColor + "18", color: medalColor } : { backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                  {pos}
                </span>
                <Avatar member={m} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-white/90 truncate leading-tight">{m.name}</p>
                  <p className="text-[10px] text-white/30">{m.handle} · Turma {m.turma}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-500/10 border border-brand-500/20">
                    <Flame className="w-3 h-3 text-brand-500" />
                    <span className="text-[10px] text-brand-500 font-bold font-mono">{r.streak}d</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="text-[10px] text-yellow-500 font-bold font-mono">{r.mesas}</span>
                  </div>
                  <span className="text-[14px] font-bold text-white font-mono w-14 text-right">{r.pts}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring explanation */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5 h-fit">
        <h3 className="text-[13px] font-bold text-white/85 mb-3">Como pontuar</h3>
        <div className="space-y-2.5">
          {[
            { icon: Clock,      label: "Presença em call", pts: "10 pts", desc: "Por call acompanhada" },
            { icon: Star,       label: "Quiz A+",          pts: "5 pts",  desc: "80%+ de acerto" },
            { icon: TrendingUp, label: "Trade no diário",  pts: "3 pts",  desc: "Cada trade registrado" },
            { icon: ThumbsUp,   label: "Peer review",      pts: "8 pts",  desc: "Comentar trade de colega" },
            { icon: Target,     label: "Treino completo",  pts: "6 pts",  desc: "Score 70%+ no treino" },
            { icon: Flame,      label: "Streak 7 dias",    pts: "25 pts", desc: "Bonus semanal" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white/[0.04] border border-white/[0.05] shrink-0">
                <item.icon className="w-3.5 h-3.5 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white/85 leading-tight">{item.label}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{item.desc}</p>
              </div>
              <span className="text-[10.5px] font-bold font-mono text-brand-500 shrink-0">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────── */

export default function TurmaPage() {
  const [view, setView] = useState<ViewTab>("mural");

  return (
    <div className="space-y-5">
      {/* Compact header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-50" />
            </div>
            <span className="text-[10px] text-red-400 font-bold tracking-[0.2em] uppercase">Ao vivo</span>
          </div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">Turma Elite</h1>
          <p className="text-[12px] text-white/40 mt-0.5">Resultados reais de traders reais · Turmas 1.0 → 4.0</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {([
            { id: "mural" as ViewTab,   label: "Mural",        icon: Trophy },
            { id: "review" as ViewTab,  label: "Peer Review",  icon: MessageCircle },
            { id: "ranking" as ViewTab, label: "Ranking",      icon: Activity },
          ]).map((tab) => {
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
                  active
                    ? "border-white/[0.20] bg-white/[0.05] text-white"
                    : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12]"
                }`}>
                <tab.icon className={`w-3.5 h-3.5 ${active ? "text-brand-500" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {view === "mural"   && <MuralView />}
      {view === "review"  && <PeerReviewView />}
      {view === "ranking" && <RankingView />}
    </div>
  );
}
