/* ────────────────────────────────────────────
   URA Labs · Achievement catalog
   ──────────────────────────────────────────── */

export type Rarity = "bronze" | "silver" | "gold" | "legendary";
export type Category = "learning" | "practice" | "trading" | "community" | "milestone" | "og";

export interface Achievement {
  id: string;
  rarity: Rarity;
  category: Category;
  /** Título curto (1-3 palavras idealmente). */
  label: string;
  /** Uma linha sobre como foi conquistada. */
  detail: string;
  /**
   * true  → a plataforma libera sozinha com base em progresso (aulas, quiz, streak, trades).
   * false → requer validação manual pelo URA (mesas, payouts, OGs).
   */
  autoDistribute: boolean;
  /**
   * Badges de OG guardam o número da turma pra renderização especial no SVG.
   */
  cohort?: string;
}

/** Todos os IDs disponíveis no sistema. Usa como source-of-truth. */
export const ACHIEVEMENTS: Record<string, Achievement> = {
  /* ─── Learning (auto) — progresso nas aulas ─── */
  "first-lesson": {
    id: "first-lesson",
    rarity: "bronze",
    category: "learning",
    label: "Primeiro passo",
    detail: "Completou a primeira aula",
    autoDistribute: true,
  },
  "module-base": {
    id: "module-base",
    rarity: "silver",
    category: "learning",
    label: "Base Completa",
    detail: "Terminou o módulo de fundamentos",
    autoDistribute: true,
  },
  "module-smc": {
    id: "module-smc",
    rarity: "silver",
    category: "learning",
    label: "SMC Completa",
    detail: "Terminou o módulo de Smart Money",
    autoDistribute: true,
  },
  "all-lessons": {
    id: "all-lessons",
    rarity: "gold",
    category: "learning",
    label: "Currículo Completo",
    detail: "Todas as 14 aulas concluídas",
    autoDistribute: true,
  },

  /* ─── Practice (auto) — quiz e treinos ─── */
  "first-quiz-a": {
    id: "first-quiz-a",
    rarity: "bronze",
    category: "practice",
    label: "Primeiro A+",
    detail: "Nota máxima no primeiro quiz",
    autoDistribute: true,
  },
  "quiz-master": {
    id: "quiz-master",
    rarity: "gold",
    category: "practice",
    label: "Quiz Master",
    detail: "10 quizzes com 100%",
    autoDistribute: true,
  },
  "trinity": {
    id: "trinity",
    rarity: "silver",
    category: "practice",
    label: "Trinity",
    detail: "3 A+ seguidos no mesmo módulo",
    autoDistribute: true,
  },

  /* ─── Milestones (auto) — streak e trades ─── */
  "streak-7": {
    id: "streak-7",
    rarity: "bronze",
    category: "milestone",
    label: "7 Dias",
    detail: "Check-in + estudo por 7 dias seguidos",
    autoDistribute: true,
  },
  "streak-30": {
    id: "streak-30",
    rarity: "silver",
    category: "milestone",
    label: "30 Dias",
    detail: "Um mês inteiro consistente",
    autoDistribute: true,
  },
  "streak-100": {
    id: "streak-100",
    rarity: "gold",
    category: "milestone",
    label: "100 Dias",
    detail: "Disciplina de ferro",
    autoDistribute: true,
  },
  "trades-100": {
    id: "trades-100",
    rarity: "silver",
    category: "milestone",
    label: "100 Trades",
    detail: "Cem operações registradas",
    autoDistribute: true,
  },

  /* ─── Trading (manual) — requer validação URA ─── */
  "mesa-fp": {
    id: "mesa-fp",
    rarity: "gold",
    category: "trading",
    label: "Mesa FundingPips",
    detail: "Challenge 2-phase aprovado",
    autoDistribute: false,
  },
  "mesa-ts": {
    id: "mesa-ts",
    rarity: "gold",
    category: "trading",
    label: "Mesa TopStep",
    detail: "Trader Combine aprovado",
    autoDistribute: false,
  },
  "mesa-5ers": {
    id: "mesa-5ers",
    rarity: "gold",
    category: "trading",
    label: "Mesa 5%ers",
    detail: "Hyper Growth aprovado",
    autoDistribute: false,
  },
  "payout-1": {
    id: "payout-1",
    rarity: "gold",
    category: "trading",
    label: "1º Payout",
    detail: "Primeiro saque aprovado",
    autoDistribute: false,
  },
  "payout-10k": {
    id: "payout-10k",
    rarity: "legendary",
    category: "trading",
    label: "$10k em Payouts",
    detail: "Acumulado cinco dígitos",
    autoDistribute: false,
  },

  /* ─── Community (manual) ─── */
  "peer-reviewer": {
    id: "peer-reviewer",
    rarity: "silver",
    category: "community",
    label: "Peer Reviewer",
    detail: "10+ reviews dados na turma",
    autoDistribute: false,
  },
  "mentor": {
    id: "mentor",
    rarity: "gold",
    category: "community",
    label: "Mentor",
    detail: "Ajudou múltiplos membros na jornada",
    autoDistribute: false,
  },

  /* ─── OG (manual, edição limitada) ─── */
  "og-elite": {
    id: "og-elite",
    rarity: "legendary",
    category: "og",
    label: "Elite Member",
    detail: "Entrou na mentoria Elite",
    autoDistribute: false,
  },
  "og-1": {
    id: "og-1",
    rarity: "legendary",
    category: "og",
    label: "OG 1.0",
    detail: "Turma fundadora",
    autoDistribute: false,
    cohort: "1.0",
  },
  "og-2": {
    id: "og-2",
    rarity: "legendary",
    category: "og",
    label: "OG 2.0",
    detail: "Segunda turma Elite",
    autoDistribute: false,
    cohort: "2.0",
  },
  "og-3": {
    id: "og-3",
    rarity: "legendary",
    category: "og",
    label: "OG 3.0",
    detail: "Terceira turma Elite",
    autoDistribute: false,
    cohort: "3.0",
  },
  "og-4": {
    id: "og-4",
    rarity: "legendary",
    category: "og",
    label: "OG 4.0",
    detail: "Turma atual · Elite 4.0",
    autoDistribute: false,
    cohort: "4.0",
  },
};

/** Order inside each section (bronze → legendary). */
const RARITY_ORDER: Record<Rarity, number> = { bronze: 0, silver: 1, gold: 2, legendary: 3 };

/** Agrupa achievements por categoria, ordenadas por raridade. */
export function groupByCategory(): Record<Category, Achievement[]> {
  const out: Record<Category, Achievement[]> = {
    og: [],
    trading: [],
    learning: [],
    practice: [],
    community: [],
    milestone: [],
  };
  for (const a of Object.values(ACHIEVEMENTS)) out[a.category].push(a);
  for (const cat of Object.keys(out) as Category[]) {
    out[cat].sort((x, y) => RARITY_ORDER[x.rarity] - RARITY_ORDER[y.rarity]);
  }
  return out;
}

export function resolveAchievements(ids: string[]): Achievement[] {
  return ids.map((id) => ACHIEVEMENTS[id]).filter((a): a is Achievement => !!a);
}

export const CATEGORY_META: Record<Category, { label: string; sub: string }> = {
  og:        { label: "Edição Limitada", sub: "Exclusivas por turma — nunca mais emitidas" },
  trading:   { label: "Trading",         sub: "Resultados reais — validados pelo URA" },
  learning:  { label: "Aulas",           sub: "Progresso no currículo Elite 4.0" },
  practice:  { label: "Prática",         sub: "Quiz, flashcards e treinos" },
  milestone: { label: "Consistência",    sub: "Disciplina ao longo do tempo" },
  community: { label: "Comunidade",      sub: "Engajamento e presença na turma" },
};

export const RARITY_META: Record<Rarity, { label: string; className: string }> = {
  bronze:    { label: "Bronze",    className: "text-[#C4833F]" },
  silver:    { label: "Prata",     className: "text-[#D1D5DB]" },
  gold:      { label: "Ouro",      className: "text-[#F59E0B]" },
  legendary: { label: "Lendária",  className: "text-[#FF5500]" },
};
