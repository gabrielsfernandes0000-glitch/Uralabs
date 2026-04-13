"use client";

import { useState } from "react";
import {
  Users, Trophy, TrendingUp, Activity, MessageCircle, Flame,
  ThumbsUp, Send, Clock, Star, Eye,
} from "lucide-react";

/* ────────────────────────────────────────────
   Types & Mock Data
   ──────────────────────────────────────────── */

type ViewTab = "mural" | "review" | "ranking";

interface PeerReview {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  type: "trade" | "analysis" | "question";
  title: string;
  body: string;
  image?: string;
  reactions: number;
  comments: number;
  reviewed: boolean;
}

// Mock — will come from Supabase
const MOCK_REVIEWS: PeerReview[] = [];

const REVIEW_TYPES = [
  { id: "trade" as const, label: "Trade Review", desc: "Poste seu trade pra turma analisar", accent: "#10B981" },
  { id: "analysis" as const, label: "Análise", desc: "Compartilhe uma leitura de mercado", accent: "#3B82F6" },
  { id: "question" as const, label: "Dúvida", desc: "Peça ajuda da turma", accent: "#F59E0B" },
];

/* ────────────────────────────────────────────
   Components
   ──────────────────────────────────────────── */

function MuralView() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Users, value: "44", label: "Membros Elite", color: "#ffffff" },
          { icon: Trophy, value: "0", label: "Mesas Aprovadas", color: "#ffffff" },
          { icon: TrendingUp, value: "0", label: "Payouts", color: "#ffffff" },
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-5 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${s.color}25, transparent)` }} />
            <s.icon className="w-5 h-5 mb-3" style={{ color: s.color + "60" }} />
            <p className="text-[26px] font-bold text-white leading-none">{s.value}</p>
            <p className="text-[11px] text-white/35 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievement wall */}
      <div className="group/card rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.10] transition-all duration-300 overflow-hidden relative">
        <div className="p-7">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-4 h-4 text-yellow-500/50" />
            <h2 className="text-[14px] font-semibold text-white/80">Mural de Conquistas</h2>
          </div>

          <div className="flex flex-col items-center py-8">
            <div className="w-14 h-14 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.05] flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white/[0.08]" />
            </div>
            <p className="text-[13px] text-white/30 mb-0.5">O mural ganha vida com a turma</p>
            <p className="text-[11px] text-white/25 max-w-xs text-center">
              Mesas aprovadas, payouts e badges aparecem aqui em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeerReviewView() {
  const [activeType, setActiveType] = useState<"trade" | "analysis" | "question" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
          <Send className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-[20px] font-bold text-white mb-2">Enviado pra turma</h3>
        <p className="text-[13px] text-white/35 mb-6 text-center max-w-sm">
          Seus colegas vão poder comentar e reagir. Você recebe notificação quando tiver feedback.
        </p>
        <button onClick={() => { setSubmitted(false); setActiveType(null); setTitle(""); setBody(""); }}
          className="text-[13px] text-white/30 hover:text-white/60 transition-colors underline">
          Enviar outro
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <div>
        <h3 className="text-[14px] font-semibold text-white/60 mb-4">O que você quer compartilhar?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REVIEW_TYPES.map((type) => (
            <button key={type.id} onClick={() => setActiveType(type.id)}
              className={`relative overflow-hidden text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                activeType === type.id
                  ? "scale-[1.01] shadow-lg"
                  : "border-white/[0.04] hover:border-white/[0.10]"
              }`}
              style={activeType === type.id ? { borderColor: type.accent + "30", backgroundColor: type.accent + "06", boxShadow: `0 4px 20px ${type.accent}10` } : undefined}>
              {activeType === type.id && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${type.accent}50, transparent)` }} />}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: type.accent + "15" }}>
                {type.id === "trade" && <TrendingUp className="w-4.5 h-4.5" style={{ color: type.accent }} />}
                {type.id === "analysis" && <Eye className="w-4.5 h-4.5" style={{ color: type.accent }} />}
                {type.id === "question" && <MessageCircle className="w-4.5 h-4.5" style={{ color: type.accent }} />}
              </div>
              <p className={`text-[14px] font-bold ${activeType === type.id ? "text-white" : "text-white/60"}`}>
                {type.label}
              </p>
              <p className={`text-[11px] mt-0.5 ${activeType === type.id ? "text-white/40" : "text-white/25"}`}>
                {type.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {activeType && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111114] p-6 space-y-4">
          <div>
            <p className="text-[12px] text-white/40 mb-2">Título</p>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeType === "trade" ? "Ex: Long NQ — sweep + engulfing na sessão NY"
                : activeType === "analysis" ? "Ex: Leitura diária — viés bullish pro NQ"
                : "Ex: Como identificar FVG válido vs inválido?"
              }
              className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[14px] text-white/80 placeholder-white/20 focus:outline-none focus:border-white/[0.10] transition-colors" />
          </div>

          <div>
            <p className="text-[12px] text-white/40 mb-2">Descrição</p>
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={
                activeType === "trade" ? "Descreva seu setup: entrada, SL, TP, contexto do mercado. O que deu certo ou errado?"
                : activeType === "analysis" ? "Compartilhe sua leitura: OBs, FVGs, liquidez varrida, sessão. Mostre o raciocínio."
                : "Detalhe sua dúvida. Quanto mais contexto, melhor o feedback."
              }
              className="w-full h-32 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[13px] text-white/70 placeholder-white/15 resize-none focus:outline-none focus:border-white/[0.10] transition-colors" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-white/25">
              {activeType === "trade" && "Dica: inclua screenshot do gráfico"}
              {activeType === "analysis" && "Dica: marque os níveis-chave"}
              {activeType === "question" && "Dica: diga o que você já tentou"}
            </p>
            <button onClick={() => title.trim() && body.trim() && setSubmitted(true)}
              disabled={!title.trim() || !body.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold transition-all ${
                title.trim() && body.trim()
                  ? "bg-brand-500 text-white hover:brightness-110 shadow-lg shadow-brand-500/20"
                  : "bg-white/[0.03] text-white/30 cursor-not-allowed"
              }`}>
              <Send className="w-4 h-4" />
              Enviar pra Turma
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white/60">Feed da Turma</h3>
          <span className="text-[10px] text-white/25 font-mono">{MOCK_REVIEWS.length} posts</span>
        </div>

        {MOCK_REVIEWS.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] flex flex-col items-center py-14">
            <MessageCircle className="w-8 h-8 text-white/[0.06] mb-3" />
            <p className="text-[13px] text-white/30 mb-1">Nenhum post ainda</p>
            <p className="text-[11px] text-white/25 max-w-xs text-center">
              Seja o primeiro a compartilhar um trade, análise ou dúvida com a turma.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-5 hover:border-white/[0.10] hover:bg-[#0a0e18] transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
                  <div className="flex-1">
                    <p className="text-[12px] font-bold text-white/70">{review.author}</p>
                    <p className="text-[10px] text-white/25">{review.timestamp}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    review.type === "trade" ? "bg-green-500/10 text-green-400/60"
                    : review.type === "analysis" ? "bg-blue-500/10 text-blue-400/60"
                    : "bg-yellow-500/10 text-yellow-400/60"
                  }`}>{review.type === "trade" ? "Trade" : review.type === "analysis" ? "Análise" : "Dúvida"}</span>
                </div>
                <h4 className="text-[14px] font-bold text-white/80 mb-1">{review.title}</h4>
                <p className="text-[12px] text-white/40 line-clamp-2">{review.body}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                  <button className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> {review.reactions}
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> {review.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RankingView() {
  // Mock — empty until Supabase
  const rankings = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <div className="group/card rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.10] transition-all duration-300 overflow-hidden relative p-7">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-4 h-4 text-brand-500/50" />
          <h2 className="text-[14px] font-semibold text-white/80">Ranking da Turma</h2>
        </div>

        <div className="space-y-2">
          {rankings.map((pos) => (
            <div key={pos} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.02] transition-all duration-200">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold font-mono ${
                pos === 1 ? "bg-yellow-500/10 text-yellow-500/60" :
                pos === 2 ? "bg-white/[0.04] text-white/40" :
                pos === 3 ? "bg-brand-500/10 text-brand-500/50" :
                "bg-white/[0.02] text-white/30"
              }`}>
                {pos}
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-white/[0.04] rounded" />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.03]">
                  <Star className="w-3 h-3 text-yellow-500/30" />
                  <span className="text-[10px] text-white/25 font-mono">—</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.03]">
                  <Flame className="w-3 h-3 text-brand-500/30" />
                  <span className="text-[10px] text-white/25 font-mono">—</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/30 mt-5">
          Ranking baseado em: aulas completas + quiz scores + presença + trades registrados
        </p>
      </div>

      {/* Scoring explanation */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6">
        <h3 className="text-[14px] font-semibold text-white/70 mb-4">Como funciona o ranking</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Clock, label: "Presença", desc: "Participar das calls", pts: "10 pts/call", color: "#ffffff" },
            { icon: Star, label: "Quiz", desc: "Acertar as perguntas", pts: "5 pts/quiz", color: "#ffffff" },
            { icon: TrendingUp, label: "Trades", desc: "Registrar no diário", pts: "3 pts/trade", color: "#ffffff" },
            { icon: ThumbsUp, label: "Review", desc: "Ajudar colegas", pts: "8 pts/review", color: "#ffffff" },
          ].map((item, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent p-4 hover:border-white/[0.10] transition-all duration-200">
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${item.color}20, transparent)` }} />
              <item.icon className="w-4 h-4 mb-2.5" style={{ color: item.color + "60" }} />
              <p className="text-[12px] font-bold text-white/70">{item.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{item.desc}</p>
              <p className="text-[10px] font-bold font-mono mt-2" style={{ color: item.color + "70" }}>{item.pts}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden group/card rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-white/[0.10] transition-all duration-300 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-white/[0.02] blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_80%_20%,#000_30%,transparent_80%)]" />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-white/40" />
            <span className="text-[10px] text-white/30 font-semibold tracking-[0.25em] uppercase">Ao vivo</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight mb-1">Turma Elite</h1>
          <p className="text-[13px] text-white/40">Resultados reais de traders reais. Turma 4.0.</p>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-2">
        {([
          { id: "mural" as ViewTab, label: "Mural", icon: Trophy },
          { id: "review" as ViewTab, label: "Peer Review", icon: MessageCircle },
          { id: "ranking" as ViewTab, label: "Ranking", icon: Activity },
        ]).map((tab) => {
          const active = view === tab.id;
          return (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl border text-[14px] font-semibold transition-all ${
                active
                  ? "border-white/[0.20] bg-white/[0.05] text-white"
                  : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12] hover:bg-white/[0.02]"
              }`}>
              <tab.icon className={`w-4 h-4 ${active ? "text-brand-500" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {view === "mural" && <MuralView />}
      {view === "review" && <PeerReviewView />}
      {view === "ranking" && <RankingView />}
    </div>
  );
}
