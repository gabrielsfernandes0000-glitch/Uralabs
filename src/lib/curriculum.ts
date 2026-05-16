/* ────────────────────────────────────────────
   Curriculum Data — Elite 4.0 (fallback)
   ────────────────────────────────────────────
   O DB Supabase é a fonte de verdade. Este arquivo é fallback de emergência
   se a query falhar. Quiz/checklist/flashcards moram só no DB (preenchidos
   via admin CRUD em /elite/aulas no dashboard).
   ──────────────────────────────────────────── */

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  chart?:
    | "amd-sweep"
    | "ob-bounce"
    | "fvg-fill"
    | "premium-discount"
    | "liquidity-sweep"
    | "session-asia"
    | "judas-swing"
    | "smt-diverge"
    | "entry-setup"
    | "candle-anatomy"
    | "risk-shield";
}

export interface LessonData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  hasQuiz: boolean;
  hasPdf: boolean;
  videoUrl?: string;
  pdfPath?: string;
  quiz?: QuizQuestion[];
  checklist?: string[];
}

export interface ModuleData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accentHex: string;
  lessons: LessonData[];
}

/** Helper minimizar boilerplate ao definir lessons de fallback. */
const lesson = (id: string, title: string, subtitle: string, duration: string): LessonData => ({
  id,
  title,
  subtitle,
  duration,
  hasQuiz: true,
  hasPdf: true,
});

export const CURRICULUM: ModuleData[] = [
  {
    id: "base",
    number: "01",
    title: "Base",
    subtitle: "Fundamentos",
    description: "Do zero ao gráfico. Mindset, ferramentas e leitura de preço.",
    accentHex: "#FF5500",
    lessons: [
      lesson("mindset-filosofia", "Mindset, Filosofia SMC e Tipos de Trader", "Por que disciplina vence sorte e por que o varejo perde", "22min"),
      lesson("tradingview-setup", "TradingView — Setup, Ferramentas e PO3", "Configuração clean, ferramentas essenciais, indicador PO3", "20min"),
      lesson("timeframes-top-down", "Timeframes e Análise Top-Down", "Como ler do semanal ao 1 minuto sem se perder", "18min"),
      lesson("candle-mercados", "Candle, Mercados e Notícias 3★", "Anatomia do candle, BingX, NASDAQ e o cuidado com macro", "20min"),
      lesson("gestao-capital-risco", "Gerenciamento de Capital e Risco", "Regra do 1% diário, 2.5% semanal e position sizing", "20min"),
    ],
  },
  {
    id: "leitura-smc",
    number: "02",
    title: "Leitura SMC",
    subtitle: "Tijolos da análise",
    description: "Order Block, FVG, Breaker, liquidez. O vocabulário do Smart Money.",
    accentHex: "#FF6E32",
    lessons: [
      lesson("premium-discount", "Premium & Discount + Fibonacci 50%", "Por que o meio do gráfico é cassino", "20min"),
      lesson("varejo-vs-smart-money", "Varejo vs Smart Money", "Operar contra a manada — o conceito por trás de tudo", "15min"),
      lesson("order-block", "Order Block — +OB, -OB e Refinamento", "O conceito mais importante da estratégia", "22min"),
      lesson("bsl-ssl", "BSL e SSL — Liquidez no Gráfico", "Onde estão os stops e como o mercado os caça", "18min"),
      lesson("fvg", "Fair Value Gap (FVG) + Mitigação", "A ineficiência que o preço sempre volta a preencher", "20min"),
      lesson("ifvg-breaker", "IFVG e Breaker Block", "Os reforços do método — quando FVGs e OBs se invertem", "20min"),
      lesson("heatmap", "Heatmap de Liquidez (crypto)", "Visualizar onde a liquidez está acumulando", "12min"),
    ],
  },
  {
    id: "estrategia",
    number: "03",
    title: "Estratégia & Sessões",
    subtitle: "O GPS do trader",
    description: "AMD, sessões, daily bias, Standard Deviation. Onde e quando operar.",
    accentHex: "#FF8C42",
    lessons: [
      lesson("amd-juda-sweep", "AMD — Ciclo, Juda Swing e Sweep", "O padrão central do mercado em todos os timeframes", "25min"),
      lesson("sessoes-killzones", "As 3 Sessões + Kill Zones + Abertura NY", "Ásia acumula, Londres manipula, NY distribui", "22min"),
      lesson("daily-bias", "Daily Bias — PWH/PWL e PDH/PDL", "O GPS do dia: capturou um lado, busca o outro", "18min"),
      lesson("candle-careca", "Candle Careca e Padrões OHLC", "Ler a abertura e prever o pavio", "12min"),
      lesson("standard-deviation", "Standard Deviation — Setup e Níveis", "Projetando até onde a manipulação vai chegar", "20min"),
      lesson("micro-amd-mmm", "Micro AMD + SD + Market Maker Model", "A entrada sniper e o modelo institucional completo", "18min"),
    ],
  },
  {
    id: "execucao",
    number: "04",
    title: "Execução & Setups",
    subtitle: "Os 3 setups",
    description: "Unicórnio, Continuação, AMD+Sweep. Confluência, R/R, gestão da operação.",
    accentHex: "#E64435",
    lessons: [
      lesson("ordem-marcacao", "Ordem de Marcação + Checklist + Fluxograma", "Antes de clicar: o passo a passo da análise", "18min"),
      lesson("confluencia-setups", "Confluência + Os 3 Setups (visão geral)", "O que é confluência e como ela define probabilidade", "15min"),
      lesson("setup-unicornio", "Setup Unicórnio — Breaker + FVG", "O setup mais raro e preciso da estratégia", "20min"),
      lesson("setup-continuacao", "Setup Continuação — FVG no Fluxo", "CHoCH vs BOS e como surfar tendências fortes", "20min"),
      lesson("setup-amd-sweep", "Setup AMD + Sweep — Sessões", "Como operar a manipulação na abertura de Londres/NY", "20min"),
      lesson("rr-lotes-pavios", "R/R, Lotes, Stop Zero-a-Zero e Pavios", "A matemática da consistência e as armadilhas do mercado", "22min"),
    ],
  },
  {
    id: "mesas-prop",
    number: "05",
    title: "Mesas Proprietárias",
    subtitle: "Escalando capital",
    description: "Como aprovar mesa, drawdown, regras, lotes. Da prova ao saque.",
    accentHex: "#C9A461",
    lessons: [
      lesson("mesa-prop-intro", "Mesa Prop — O Que É + Futuros vs Forex", "Por que mesa prop e qual escolher (Lucid vs FTMO)", "20min"),
      lesson("drawdown-fases", "Drawdown + Regra de Consistência + Fases", "Os 3 tipos de drawdown e como passar da prova ao saque", "22min"),
      lesson("lotes-risk-settings", "Lotes (MNQ vs NQ), Risk Settings e Ordens", "MNQ vs NQ, travas de segurança e ordem a mercado", "20min"),
      lesson("gestao-multi-contas", "Valor de Cada Conta + Gestão Multi-Contas", "Quando arriscar pouco e quando arriscar mais", "12min"),
    ],
  },
  {
    id: "psicologia",
    number: "06",
    title: "Psicologia do Trader",
    subtitle: "Jogo mental",
    description: "60% mental, 40% estratégia. Travas, espiral da morte, hábitos consistentes.",
    accentHex: "#A67C4F",
    lessons: [
      lesson("espiral-da-morte", "Espiral da Morte + Amígdala + Travas", "Como o cérebro te trai e como blindar com travas físicas", "25min"),
      lesson("numero-redondo", "Número Redondo + Lucro Não é Seu + Casos", "Erros reais do URA e o que aprender com eles", "20min"),
      lesson("habitos-trader", "Hábitos do Trader Consistente", "Notion, opere menos, não case com viés", "20min"),
    ],
  },
  {
    id: "aplicacao",
    number: "07",
    title: "Aplicação & Consolidação",
    subtitle: "Da teoria ao gráfico",
    description: "Pirâmide do método, estudo de caso de trade real, próximos passos.",
    accentHex: "#D9BE83",
    lessons: [
      lesson("piramide-conceitos", "A Pirâmide do Operacional + Os 3 Conceitos", "Mapa mental único + P/D, CHoCH/BOS, FVG válido revisitados", "22min"),
      lesson("estudo-caso-trade", "Estudo de Caso — Trade Real do Início ao Fim", "Os 3 setups aplicados num trade real do Nasdaq", "25min"),
      lesson("proximos-passos", "Próximos Passos — Replay, Journal, Evolução", "TradingView Replay, Forex Replay, Notion, comunidade", "15min"),
    ],
  },
];
