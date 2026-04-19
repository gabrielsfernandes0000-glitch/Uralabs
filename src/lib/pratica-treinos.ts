/* ────────────────────────────────────────────
   Skills guiadas — 10 treinos com sequência de 3 passos e gráfico real.
   Source of truth pra /elite/pratica/skills e home da Prática.
   ──────────────────────────────────────────── */

export interface GuidedTreino {
  id: string;
  title: string;
  desc: string;
  requiredLesson: string;
  requiredLessonTitle: string;
  module: string;
  moduleColor: string;
  difficulty: "iniciante" | "intermediário" | "avançado";
  type: "identificar" | "decisão" | "execução";
  steps: number;
}

export const GUIDED_TREINOS: GuidedTreino[] = [
  { id: "t-candles",  title: "Leitura de Candle",      desc: "Identifique o que cada candle está dizendo sobre compradores vs vendedores.", requiredLesson: "leitura-candle",   requiredLessonTitle: "Leitura de Candle",       module: "Base",          moduleColor: "#FF5500", difficulty: "iniciante",     type: "identificar", steps: 3 },
  { id: "t-risco",    title: "Calcule o Risco",        desc: "Posicione stop e alvo corretamente. Qual o tamanho do lote?",                 requiredLesson: "risco",            requiredLessonTitle: "Gerenciamento de Risco",  module: "Base",          moduleColor: "#FF5500", difficulty: "iniciante",     type: "decisão",     steps: 3 },
  { id: "t-obs",      title: "Marque os Order Blocks", desc: "Encontre as zonas onde os institucionais se posicionaram.",                   requiredLesson: "order-blocks",     requiredLessonTitle: "Order Blocks",            module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-fvg",      title: "Identifique FVGs",       desc: "Marque os Fair Value Gaps e diga quais serão preenchidos.",                   requiredLesson: "fvg-breaker",      requiredLessonTitle: "FVG & Breaker Blocks",    module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-premium",  title: "Premium ou Discount?",   desc: "Defina as zonas de desconto e premium usando Fibonacci 50%.",                 requiredLesson: "premium-discount", requiredLessonTitle: "Premium & Discount",      module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-liquidez", title: "Onde Está a Liquidez?",  desc: "Mapeie os pools de liquidez que os big players vão buscar.",                  requiredLesson: "liquidez",         requiredLessonTitle: "Liquidez",                module: "Leitura SMC",   moduleColor: "#3B82F6", difficulty: "intermediário", type: "identificar", steps: 3 },
  { id: "t-sessoes",  title: "Qual Sessão Operar?",    desc: "Identifique a sessão e o comportamento esperado do mercado.",                 requiredLesson: "sessoes",          requiredLessonTitle: "Sessões de Mercado",      module: "Estratégia",    moduleColor: "#A855F7", difficulty: "avançado",      type: "decisão",     steps: 3 },
  { id: "t-amd",      title: "Leitura AMD Completa",   desc: "Identifique Acumulação, Manipulação e Distribuição em tempo real.",           requiredLesson: "amd",              requiredLessonTitle: "AMD",                     module: "Estratégia",    moduleColor: "#A855F7", difficulty: "avançado",      type: "decisão",     steps: 3 },
  { id: "t-bias",     title: "Monte o Viés do Dia",    desc: "Com base na estrutura, defina se o dia é bullish ou bearish.",                requiredLesson: "daily-bias",       requiredLessonTitle: "Daily Bias & Judas Swing", module: "Estratégia",   moduleColor: "#A855F7", difficulty: "avançado",      type: "decisão",     steps: 3 },
  { id: "t-entrada",  title: "Execute o Trade",        desc: "Cenário completo: identifique a zona, defina entrada, stop e alvo.",          requiredLesson: "entrada-saida",    requiredLessonTitle: "Entrada & Saída",         module: "Execução",      moduleColor: "#10B981", difficulty: "avançado",      type: "execução",    steps: 3 },
];
