/* ────────────────────────────────────────────
   Curriculum Data — Elite 4.0
   Single source of truth for the entire platform
   ──────────────────────────────────────────── */

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // index of correct option
  /** Explanation shown after answering — teaches the "why" */
  explanation?: string;
  /** If true, render a scenario chart SVG above the question */
  chart?: "amd-sweep" | "ob-bounce" | "fvg-fill" | "premium-discount" | "liquidity-sweep" | "session-asia" | "judas-swing" | "smt-diverge" | "entry-setup" | "candle-anatomy" | "risk-shield";
}

export interface LessonData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  hasQuiz: boolean;
  hasPdf: boolean;
  /** Video URL — Bunny Stream or YouTube unlisted */
  videoUrl?: string;
  /** PDF download path */
  pdfPath?: string;
  /** Quiz questions */
  quiz?: QuizQuestion[];
  /** Practical checklist items */
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

export const CURRICULUM: ModuleData[] = [
  {
    id: "base",
    number: "01",
    title: "Base",
    subtitle: "Fundamentos",
    description: "Do zero ao gráfico. Mindset, ferramentas e gerenciamento de risco.",
    accentHex: "#FF5500",
    lessons: [
      {
        id: "intro",
        title: "Introdução ao Trade",
        subtitle: "O que é trade, como funciona a mentoria, mindset profissional",
        duration: "20min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Um trader iniciante ganhou R$500 no primeiro dia sem saber nada. Ele quer dobrar o lote amanhã. O que provavelmente vai acontecer?", options: ["Vai ganhar mais porque já tem experiência", "Vai perder tudo — sorte no curto prazo não é consistência", "Deve dobrar mesmo, aproveitar a fase boa", "Nada, é normal no trade"], correct: 1, explanation: "O mercado é imprevisível no curto prazo. Ganhar sem estratégia é sorte, e sorte não se repete. Quem dobra lote após sorte é o perfil que mais perde dinheiro no longo prazo. A mentoria foca em consistência com estratégia, não em apostar." },
          { question: "Você vê um influencer postando que usa RSI + Médias Móveis e ganha todo dia. Por que a estratégia SMC ignora esses indicadores?", options: ["Porque são pagos", "Porque todo mundo usa igual — os institucionais sabem onde estão os stops de quem segue indicadores", "Porque são complicados demais", "Porque o URA não aprendeu a usar"], correct: 1, explanation: "Indicadores tradicionais usam dados passados e são públicos — todo mundo vê o mesmo sinal. Os institucionais sabem exatamente onde quem usa RSI/MA vai colocar stops e usam isso pra varrer liquidez. SMC rastreia o dinheiro institucional diretamente, em vez de seguir sinais que os big players exploram." },
          { question: "Você perdeu 3 trades seguidos hoje. O que a mentalidade correta manda fazer?", options: ["Aumentar o lote pra recuperar mais rápido", "Mudar de ativo — Nasdaq não tá bom hoje", "Fechar a plataforma, respeitar o limite diário e revisar as operações depois", "Continuar operando até acertar uma"], correct: 2, explanation: "Revenge trading (operar pra recuperar) é o erro #1 de todo trader. Quando o emocional toma conta, a disciplina morre. As regras do URA: perdeu o máximo diário (1%) → sai da tela, locka a conta, revisa depois com a cabeça fria. O mercado abre amanhã." },
        ],
        checklist: [
          "Baixar e instalar o TradingView",
          "Criar conta gratuita no TradingView",
          "Salvar o calendário econômico no Investing.com",
          "Escrever suas 3 metas para a mentoria",
        ],
      },
      {
        id: "leitura-candle",
        title: "Leitura de Candle",
        subtitle: "Timeframes, o que é um candle, como ler preço no gráfico",
        duration: "18min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Você está olhando o gráfico de 15 minutos e vê um candle com body muito pequeno e pavios longos dos dois lados. O que isso indica sobre o mercado naquele momento?", chart: "candle-anatomy", options: ["O mercado vai subir forte", "Há indecisão — compradores e vendedores estão brigando sem vencedor claro", "É hora de comprar porque o preço está barato", "O candle está quebrado, troque de timeframe"], correct: 1, explanation: "Candles com body pequeno e pavios longos (dojis) mostram que o preço testou altos e baixos mas fechou perto de onde abriu. Isso indica indecisão — nem compradores nem vendedores dominaram. Em zonas de decisão (OB, FVG), esse candle pode preceder um movimento forte." },
          { question: "Você está no gráfico de 1 hora e vê 5 candles verdes consecutivos com bodies grandes. Troca pro diário e vê que o candle do dia ainda está vermelho. O que isso significa?", options: ["O diário está errado", "Os timeframes se contradizem — o contexto maior (diário) ainda é bearish apesar do rali no 1h", "Deve ignorar o diário e operar o 1h", "Significa que vai reverter no 1h"], correct: 1, explanation: "Timeframes maiores dão o contexto. Um rali no 1h dentro de um candle diário bearish pode ser apenas um pullback — não uma reversão. Isso é top-down analysis: o viés vem do maior (semanal/diário) e a entrada vem do menor (1h/15min). Nunca ignore o contexto." },
          { question: "Qual a diferença prática entre olhar o gráfico no timeframe de 4h vs 5min?", options: ["Nenhuma, o preço é o mesmo", "4h mostra a estrutura macro e pontos-chave; 5min mostra detalhes de entrada dentro dessa estrutura", "5min é mais preciso", "4h é melhor pra scalp"], correct: 1, explanation: "É como um mapa: o 4h é o mapa da cidade (pra onde ir), o 5min é o GPS na rua (como chegar). Você marca OBs e FVGs no 4h/1h, e desce pro 15min/5min pra encontrar a entrada precisa. Operar sem top-down é dirigir sem saber o destino." },
        ],
        checklist: [
          "Abrir o NQ (Nasdaq) no TradingView",
          "Alternar entre timeframes: semanal, diário, 4h, 1h, 15min",
          "Identificar 5 candles bullish e 5 bearish no gráfico diário",
          "Anotar: qual timeframe você consegue ler melhor?",
        ],
      },
      {
        id: "risco",
        title: "Gerenciamento de Risco",
        subtitle: "1% diário, 2.5% semanal — as regras que te mantêm vivo",
        duration: "22min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Observe o gráfico: um setup com entrada, SL a 1R e TP a +3R. Se esse mesmo setup gerar $400 de risco na sua conta de $25.000, deve entrar?", chart: "risk-shield", options: ["Sim, setup com 1:3 vale o risco", "Não — $400 é 1.6% da conta, acima do limite de 1% ($250). A forma do setup é boa, mas o tamanho da posição está errado", "Sim, se estiver confiante", "Depende do horário"], correct: 1, explanation: "1% de $25.000 = $250. Um trade com risco de $400 = 1.6%, acima do limite — mesmo com RR 1:3 igual ao do gráfico. A solução: reduzir o lote até o risco caber em $250. Setup bom com risco errado continua sendo um trade ruim. Gerenciamento > estratégia." },
          { question: "Você perdeu $150 no primeiro trade do dia (conta de $25K). Encontrou outro setup bom. Quanto pode arriscar nesse segundo trade?", options: ["$250 de novo — cada trade é independente", "$100 — só o que resta do limite diário de 1% ($250 - $150)", "$500 pra compensar a perda", "Não deve operar mais hoje"], correct: 1, explanation: "O limite de 1% é DIÁRIO, não por trade. Se perdeu $150, restam $100 de risco pro dia ($250 - $150). Se o setup exigir mais que $100 de risco, não entra. E se atingir os $250, acabou o dia. Isso protege seu capital dos dias ruins — e dias ruins são normais." },
          { question: "Você tem 3 contas de mesa proprietária. Na segunda-feira, perdeu 2% na conta A. Na terça, está -0.5% na conta B. É quarta-feira. O que faz?", options: ["Para de operar todas as contas até segunda", "Foca na conta B (mais longe do drawdown), reduz risco na A, não opera a C se não tiver setup", "Opera todas agressivamente pra recuperar", "Só opera a conta que está no lucro"], correct: 1, explanation: "A conta A está em -2% na semana (quase no limite de 2.5%). Reduzir risco ou pausar. A conta B tem espaço ainda. A conta C não tem motivo pra arriscar sem setup. Priorizar contas por situação de drawdown é gerenciamento inteligente — não emocional." },
        ],
        checklist: [
          "Calcular 1% da sua conta (ou conta de mesa)",
          "Definir seu risco máximo semanal (2.5%)",
          "Escrever suas regras pessoais de gerenciamento",
          "Colar as regras na tela do TradingView (texto fixo)",
        ],
      },
    ],
  },
  {
    id: "leitura-smc",
    number: "02",
    title: "Leitura SMC",
    subtitle: "Smart Money Concepts",
    description: "Order Blocks, FVG, Premium & Discount, Liquidez.",
    accentHex: "#3B82F6",
    lessons: [
      {
        id: "order-blocks",
        title: "Order Blocks",
        subtitle: "Zonas institucionais — onde os grandes players se posicionam",
        duration: "25min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Observe o gráfico: o preço caiu forte e agora está retornando à zona marcada como 'OB'. O que você espera que aconteça quando o preço atingir essa zona?", chart: "ob-bounce", options: ["O preço vai passar direto — OB não funciona", "O preço deve reagir (bouncing) porque ali tem ordens institucionais pendentes", "Impossível saber — é aleatório", "O OB já expirou, não vale mais"], correct: 1, explanation: "Order Blocks marcam onde institucionais colocaram ordens grandes. Quando o preço retorna, essas ordens ainda estão lá esperando execução. O preço tende a reagir (pausar ou reverter) nessas zonas. Não é garantia, mas é uma zona de alta probabilidade — especialmente quando confluente com FVG ou liquidez." },
          { question: "Você marcou um OB bullish no gráfico diário. Ao descer pro 15 minutos, encontra 3 OBs menores dentro da mesma zona. Qual deles usar para a entrada?", options: ["O primeiro que aparecer", "O mais próximo do fundo da zona — máximo desconto", "Qualquer um, são todos iguais", "Nenhum, OB de 15min não funciona"], correct: 1, explanation: "Top-down: o OB do diário dá a zona macro. Dentro dele, o OB do 15min mais profundo (mais perto do fundo da zona) dá o melhor preço de entrada — menor risco, maior R:R. É como usar o zoom: o diário diz ONDE, o 15min diz EXATAMENTE onde." },
          { question: "O preço chegou no seu OB mas não reagiu — passou direto e continuou caindo. O que isso significa?", options: ["O OB era falso", "O OB foi mitigado — agora é um Breaker Block e a estrutura mudou", "OBs não funcionam, mude de estratégia", "Coloque outro trade na mesma direção"], correct: 1, explanation: "Quando um OB falha (preço passa sem reagir), ele se torna um Breaker Block — a zona muda de função. Um OB bullish quebrado vira resistência. Isso é informação valiosa: a estrutura mudou, o viés pode ter invertido. Adapte-se, não insista." },
        ],
        checklist: [
          "Marcar 3 Order Blocks no NQ diário",
          "Verificar se o preço reagiu a esses OBs",
          "Marcar 3 Order Blocks no 4h e comparar com o diário",
        ],
      },
      {
        id: "fvg-breaker",
        title: "FVG & Breaker Blocks",
        subtitle: "Fair Value Gaps, preenchimento e confluência com OB",
        duration: "20min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "No gráfico, 3 candles criaram um espaço vazio (FVG). O preço subiu forte e agora está voltando. Até onde o preço provavelmente vai antes de continuar subindo?", chart: "fvg-fill", options: ["Até o topo do último candle", "Até preencher o FVG (o espaço vazio entre os candles)", "Até o fundo do gráfico", "Não vai voltar — só sobe"], correct: 1, explanation: "O mercado busca eficiência. FVGs são 'buracos' no preço onde não houve troca justa de ordens. O preço tende a retornar e preencher esse gap antes de continuar. É como um ímã — o FVG atrai o preço de volta. Quando o FVG é preenchido e confluente com um OB, é zona de entrada de alta probabilidade." },
          { question: "Você identificou um OB bullish E um FVG na mesma zona do gráfico de 4h. Isso é:", options: ["Redundante — escolha um ou outro", "Confluência — zona de altíssima probabilidade porque dois conceitos apontam pro mesmo lugar", "Confuso — melhor não operar", "Irrelevante — preço faz o que quer"], correct: 1, explanation: "Confluência é o santo graal do SMC. Quando OB + FVG + liquidez varrida + desconto se alinham na mesma zona, a probabilidade sobe drasticamente. Não é um indicador mágico — é lógica: múltiplas razões apontando pra mesma conclusão. Opere apenas setups com confluência." },
        ],
        checklist: [
          "Identificar 3 FVGs no NQ 4h",
          "Verificar quais foram preenchidos e quais não",
          "Encontrar um Breaker Block e entender a inversão",
        ],
      },
      {
        id: "premium-discount",
        title: "Premium & Discount",
        subtitle: "Fibonacci 50% — onde comprar e onde vender",
        duration: "18min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "O preço caiu de 18.500 até 18.000 e agora está subindo. Atualmente está em 18.350. O viés diário é bullish. Você deve comprar aqui?", chart: "premium-discount", options: ["Sim, está subindo", "Não — 18.350 está em Premium (acima de 50% = 18.250). Espere o preço voltar pra Discount", "Sim, está perto do topo", "Compre em qualquer preço se o viés é bullish"], correct: 1, explanation: "50% do range (18.000–18.500) = 18.250. O preço em 18.350 está em PREMIUM — zona cara pra comprar. Mesmo com viés bullish, a entrada ideal é em Discount (abaixo de 18.250), onde o R:R é melhor. Comprar em Premium significa stop grande e alvo curto — math não fecha." },
          { question: "Um colega diz: 'Se o viés é bearish, eu vendo em qualquer preço.' O que está errado nessa lógica?", options: ["Nada, ele está certo", "Vender em Discount (preço barato) dá stop curto e alvo longo — mas é contra a lógica de P&D", "Ele deveria vender em Premium — preço caro, onde o R:R é favorável pra short", "Deveria usar indicadores em vez de P&D"], correct: 2, explanation: "Mesmo com viés correto, a ZONA importa. Vender em Discount significa que o preço já caiu bastante — seu stop fica acima (longe) e seu alvo embaixo (perto). R:R ruim. Venda em Premium: preço caro, stop curto acima, alvo longo embaixo. Viés dá a direção, P&D dá o PREÇO." },
        ],
        checklist: [
          "Usar a ferramenta Fibonacci no TradingView",
          "Marcar Premium e Discount no swing atual do NQ diário",
          "Identificar: o preço atual está em Premium ou Discount?",
        ],
      },
      {
        id: "liquidez",
        title: "Liquidez",
        subtitle: "Buy side, sell side — onde as sardinhas estão posicionadas",
        duration: "22min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "No gráfico, o preço fez vários lows iguais (linha de suporte). Abaixo dessa linha há stops de milhares de traders retail. O que os institucionais vão fazer?", chart: "liquidity-sweep", options: ["Respeitar o suporte — ele é forte", "Varrer (sweep) esses stops pra pegar liquidez, depois reverter na direção real", "Nada — eles não controlam o mercado", "O suporte vai segurar porque muita gente comprou ali"], correct: 1, explanation: "Equal lows = liquidez acumulada. Os institucionais PRECISAM dessa liquidez pra executar ordens grandes. O 'suporte forte' é na verdade um ímã de stops. O sweep acontece: preço rompe brevemente, dispara os stops (dando contrapartida pros institucionais), e reverte. É por isso que 'suportes fortes' sempre são rompidos antes de funcionar." },
          { question: "O preço acabou de varrer a liquidez (sweep) abaixo de vários lows e imediatamente voltou pra cima com força. Você deveria:", options: ["Vender — o suporte foi rompido, é queda confirmada", "Esperar confirmação no timeframe menor e procurar entrada de compra — o sweep pode ser a manipulação antes da distribuição", "Não operar — muito volátil", "Comprar imediatamente sem esperar"], correct: 1, explanation: "Sweep de liquidez + reversão = sinal de que os institucionais pegaram o que precisavam. MAS não compre no susto. Desce pro 5min/1min, espera um OB/FVG de confirmação, e entra com stop abaixo do sweep. Operar o sweep sem confirmação é jogar moeda." },
        ],
        checklist: [
          "Marcar Buy Side Liquidity (acima de highs) no NQ",
          "Marcar Sell Side Liquidity (abaixo de lows) no NQ",
          "Observar: algum nível de liquidez foi varrido hoje?",
        ],
      },
    ],
  },
  {
    id: "estrategia",
    number: "03",
    title: "Estratégia",
    subtitle: "Setup Operacional",
    description: "AMD, Sessões, Daily Bias, SMT.",
    accentHex: "#A855F7",
    lessons: [
      {
        id: "sessoes",
        title: "Sessões de Mercado",
        subtitle: "Ásia, Londres, Nova York — horários e comportamento",
        duration: "22min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Observe o gráfico: a sessão de Ásia fez um range apertado. Na abertura de Londres, o preço rompeu acima do Asia High e imediatamente reverteu pra baixo. O que aconteceu?", chart: "session-asia", options: ["Londres confirmou a alta da Ásia", "Londres fez um sweep do Asia High — pegou a liquidez acima e reverteu. Isso é manipulação típica.", "O mercado está aleatório, não dá pra saber", "O range da Ásia era errado"], correct: 1, explanation: "A Ásia cria o range (acumulação). Londres frequentemente varre a liquidez de um lado (sweep do Asia High ou Low) e reverte. É o AMD em ação: Ásia = A, Londres sweep = M, NY move = D. Saber que Londres costuma fazer isso muda como você lê a abertura." },
          { question: "São 10:25 da manhã (NY), 5 minutos antes da sua Kill Zone. O preço está parado. O que você faz?", options: ["Entra agora pra pegar o movimento desde o início", "Espera a Kill Zone (10:30) — os primeiros 5-10 minutos mostram a direção da manipulação", "Não opera hoje — preço parado é sinal ruim", "Troca pra outro ativo mais volátil"], correct: 1, explanation: "Kill Zones existem por um motivo: é quando o dinheiro institucional entra. Os primeiros minutos da KZ frequentemente mostram a manipulação (falso movimento). Entrar ANTES é operar no escuro. Espere a KZ, observe os primeiros candles, identifique o sweep, e entre na reversão." },
        ],
        checklist: [
          "Anotar os horários das 3 sessões no seu fuso",
          "Marcar a range da Ásia no gráfico do NQ",
          "Observar como Londres e NY reagem ao range da Ásia",
        ],
      },
      {
        id: "amd",
        title: "AMD",
        subtitle: "Acumulação, Manipulação, Distribuição — o padrão mestre",
        duration: "25min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "No gráfico, o preço acumulou (range), depois caiu forte varrendo os lows (sweep), e agora está subindo com força. Em que fase do AMD estamos e o que fazer?", chart: "amd-sweep", options: ["Acumulação — espere mais", "Fim da Manipulação / início da Distribuição — procure entrada de compra", "Distribuição terminando — muito tarde pra entrar", "Não é AMD, é movimento aleatório"], correct: 1, explanation: "O sweep dos lows foi a Manipulação (M) — varreu liquidez das sardinhas. A subida forte marca o início da Distribuição (D) — o movimento real. A entrada ideal é logo após o sweep confirmar (quando o preço volta pra cima com força). Não é 'comprar o fundo' — é comprar a confirmação da reversão pós-manipulação." },
          { question: "Você identificou um AMD. O preço está na fase A (acumulação, range apertado). Um amigo diz pra comprar agora 'porque está barato'. Por que isso é um erro?", options: ["Não é erro — comprar barato é sempre bom", "Na fase A, você não sabe pra que lado a manipulação vai varrer — comprar agora pode significar ser stopado no sweep", "A fase A sempre continua subindo", "Porque a Acumulação dura pra sempre"], correct: 1, explanation: "A Acumulação é incerteza. Os institucionais ainda estão acumulando — o movimento real (D) ainda não começou. Entrar na A é apostar na direção do sweep. Se o sweep for pra baixo (e sua compra for stopada), você perdeu. ESPERE a M (manipulação/sweep) e entre na D (distribuição). Paciência > ansiedade." },
        ],
        checklist: [
          "Encontrar 3 padrões AMD completos no NQ 1h (últimos 5 dias)",
          "Marcar A, M e D em cada um",
          "Identificar onde seria a entrada ideal em cada AMD",
        ],
      },
      {
        id: "daily-bias",
        title: "Daily Bias & Judas Swing",
        subtitle: "Como montar viés antes do mercado abrir",
        duration: "20min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Observe o gráfico: o viés diário é bullish, mas na abertura o preço caiu forte (Judas Swing). Muitos traders entraram vendidos achando que ia cair mais. O que aconteceu depois?", chart: "judas-swing", options: ["O preço continuou caindo — o viés estava errado", "O preço reverteu violentamente pra cima — o Judas Swing era a manipulação, e os vendidos foram stopados alimentando a alta", "O preço ficou parado", "O Judas Swing não tem relação com o viés"], correct: 1, explanation: "O Judas Swing engana propositalmente. Nome bíblico: Judas traiu com um beijo — parece amigo mas é inimigo. O falso movimento na abertura varre stops dos bulls impacientes E atrai bears que vendem o 'rompimento'. Quando reverte, os stops dos bears viram combustível pra alta. O viés diário quase sempre vence." },
          { question: "Antes do mercado abrir, você analisa: semanal bullish, diário fez sweep de sell-side liquidity ontem e fechou acima. Qual seu viés pra hoje?", options: ["Bearish — o preço caiu ontem", "Bullish — semanal bullish + diário varreu liquidez e reverteu = viés de alta confirmado", "Neutro — preciso ver mais dados", "Depende das notícias do dia"], correct: 1, explanation: "Daily Bias vem da confluência: (1) semanal dá a tendência macro, (2) o diário fez um sweep de SSL + reverteu = acumulação/manipulação completa, agora distribui pra cima. Isso é o framework completo: top-down + AMD + liquidez. Notícias podem causar volatilidade, mas o viés estrutural é o que importa." },
        ],
        checklist: [
          "Montar o plano do dia antes das 10:00 (antes do mercado abrir)",
          "Definir: bullish ou bearish? Baseado em quê?",
          "Marcar os níveis-chave do dia (liquidez, OBs, FVGs)",
        ],
      },
      {
        id: "smt",
        title: "SMT Divergence",
        subtitle: "Divergência NQ/SP500 — confirmação ou alerta",
        duration: "18min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "No gráfico, o NQ fez um novo high mas o ES (SP500) NÃO confirmou — fez um high mais baixo. O viés era bullish. O que essa divergência te diz?", chart: "smt-diverge", options: ["Nada — são ativos diferentes", "Alerta: o NQ pode estar fazendo um falso breakout. Se o ES não confirma, a alta do NQ pode ser uma armadilha (liquidez grab)", "O ES está atrasado, vai alcançar", "Deve comprar NQ porque está mais forte"], correct: 1, explanation: "NQ e ES são correlacionados — normalmente se movem juntos. Quando um faz novo high e o outro não (SMT), é divergência. Isso sugere que o high do NQ pode ser um sweep de liquidez, não um movimento real. NÃO é um sinal de venda automático, mas é um ALERTA: fique esperto, procure confirmação, reduza exposição se estava comprado." },
          { question: "Você está comprado no NQ com lucro aberto. De repente, percebe SMT: NQ fez novo high mas ES fez lower high. O que fazer?", options: ["Segurar — o NQ é mais forte", "Proteger a posição: mover stop pro zero-a-zero ou parcial. Se o NQ não sustenta o high, a divergência estava certa", "Vender tudo imediatamente", "Ignorar — SMT é subjetivo"], correct: 1, explanation: "SMT não é sinal de pânico, é sinal de proteção. Mova o stop pro breakeven ou tire um parcial. Se o NQ sustenta, ótimo — você continua no trade sem risco. Se reverte, saiu no zero-a-zero em vez de devolver o lucro. SMT é seguro de proteção, não botão de saída." },
        ],
        checklist: [
          "Abrir NQ e ES (SP500) lado a lado no TradingView",
          "Encontrar uma divergência nos últimos 3 dias",
          "Anotar: a divergência confirmou ou negou o movimento?",
        ],
      },
    ],
  },
  {
    id: "execucao",
    number: "04",
    title: "Execução",
    subtitle: "Na Prática",
    description: "Entrada, saída, mesas proprietárias.",
    accentHex: "#10B981",
    lessons: [
      {
        id: "entrada-saida",
        title: "Entrada & Saída",
        subtitle: "Quando apertar o botão — stop, alvo, 1.5-3R",
        duration: "22min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Observe o cenário: sweep da SSL, OB bullish confirmado, preço voltando pra cima com FVG. Onde exatamente você coloca a entrada e o stop?", chart: "entry-setup", options: ["Entry no topo do OB, stop no fundo do candle anterior", "Entry na mitigação do OB (quando o preço toca), stop logo abaixo do sweep low — invalida o OB se for violado", "Entry aleatória na zona, stop a 10 pontos", "Não opero — muito arriscado"], correct: 1, explanation: "O stop vai abaixo do sweep porque: se o preço passar abaixo do sweep, o OB foi invalidado e a tese morreu. Colocar o stop acima do sweep (mais apertado) é ganância — vai ser stopado por ruído. Abaixo do sweep = 'se isso for rompido, eu estava errado e saio'. O R:R com TP em +3R precisa que o stop faça sentido estrutural." },
          { question: "Seu setup dá entry em 18.100, SL em 18.050 (50 pontos), TP em 18.250 (150 pontos). Isso é 3R. Mas você 'sente' que pode ir até 18.400. O que faz?", options: ["Move o TP pra 18.400 — confiança é tudo", "Mantém o plano original: TP 18.250 (3R). Se quiser, tira parcial em 3R e deixa um runner com stop no breakeven", "Remove o TP e deixa correr infinitamente", "Cancela o trade — 3R não é suficiente"], correct: 1, explanation: "Plano > sentimento. Mover TP baseado em 'feeling' é o início do fim. A solução pro trader que quer mais: parcializa. Tira 70% do lucro no TP original (3R) e deixa 30% correndo com stop no breakeven. Assim garante o lucro E captura o extra sem risco. Best of both worlds." },
        ],
        checklist: [
          "Simular 3 entradas em paper trading (conta demo)",
          "Calcular o R:R de cada entrada antes de executar",
          "Anotar: entry, SL, TP, R:R, resultado",
        ],
      },
      {
        id: "mesas-prop",
        title: "Mesas Proprietárias",
        subtitle: "FundingPips, TopStep — fases, regras, qual escolher",
        duration: "25min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Você está na Fase 2 de uma mesa de $50K, faltando $800 pra aprovar. É sexta-feira, último dia do prazo. Você encontra um setup B+ (não A+). O que faz?", options: ["Entra — falta pouco e o prazo tá acabando", "Não entra — setup B+ com pressão de prazo é receita pra revenge trading. Melhor comprar nova avaliação do que forçar", "Dobra o lote pra fechar mais rápido", "Opera no celular rapidamente"], correct: 1, explanation: "Esse é o erro que mais reprova gente: forçar trades no final do prazo. A conta de $50K custa ~$300. Se você forçar e perder, vai pro drawdown e perde os $800 que já tinha + a avaliação. NUNCA opere sob pressão de prazo. Se o setup não é A+, melhor comprar outra avaliação. R$300 < R$800 de lucro perdido." },
          { question: "Você tem 3 contas: (A) $10K funded em saque, (B) $25K Fase 2 a 60%, (C) $50K Fase 1 começando. Em qual ordem priorizar?", options: ["C porque é a maior", "A → B → C. A está mais perto do dinheiro real (saque), B mais perto de aprovar, C pode esperar", "Todas iguais — mesmo risco em cada", "Só opera a funded, abandona as outras"], correct: 1, explanation: "Priorize pelo que está mais próximo do RESULTADO. Conta A (funded em saque) = dinheiro real na sua mão, cuide dela primeiro. Conta B (60% da Fase 2) = quase aprovada, merece atenção. Conta C (começando) = pode esperar, sem pressão. Operar as 3 com mesmo risco dilui foco e aumenta chance de erro nas que importam." },
        ],
        checklist: [
          "Pesquisar FundingPips e TopStep — comparar regras",
          "Definir qual tamanho de conta começar ($10K, $25K, $50K)",
          "Configurar o MetaTrader ou plataforma da mesa",
        ],
      },
      {
        id: "gerenciamento-contas",
        title: "Gerenciamento de Contas",
        subtitle: "Priorizar por fase, drawdown, quando parar",
        duration: "20min",
        hasQuiz: true,
        hasPdf: true,
        quiz: [
          { question: "Sua conta funded de $25K tem drawdown máximo de 5% ($1.250). Você está em -$900 (-3.6%). Encontra um setup A+ com risco de $300. Entra?", options: ["Sim — setup A+ sempre vale", "Depende: se perder, vai pra -$1.200 (4.8%), perigosamente perto do limite. Reduzir lote pra riscar $150 ou esperar dia melhor", "Não — para de operar quando tá negativo", "Entra com $600 pra recuperar mais rápido"], correct: 1, explanation: "Gerenciamento > setup. Mesmo um A+ pode perder. -$900 + $300 de risco = -$1.200 se perder, sobrando apenas $50 antes de perder a conta. Opções: (1) reduzir o lote pela metade ($150 de risco) — se perder, ainda tem margem, (2) não operar até a conta ter mais margem. Conta funded é patrimônio — proteja acima de tudo." },
          { question: "Você tem 4 contas: 2 funded e 2 em avaliação. É terça-feira, você fez -1.2% em todas ontem. Hoje o mercado abriu volátil. Plano de ação?", options: ["Opera todas normalmente — ontem foi ontem", "Pausa as funded (proteger patrimônio), opera as de avaliação com risco reduzido (custo de perder é menor)", "Dobra o risco pra recuperar o loss de ontem", "Não opera nada na semana"], correct: 1, explanation: "Contas funded = renda. Contas de avaliação = custo. Quando está em drawdown + mercado volátil: proteja o que gera dinheiro (funded) e, se for operar, arrisque o que custa menos perder (avaliação — pior caso, compra outra). Isso é mentalidade de empresário, não de jogador." },
        ],
        checklist: [
          "Listar todas as suas contas e o status de cada uma",
          "Ordenar por prioridade (mais próxima do objetivo primeiro)",
          "Definir regra pessoal de drawdown máximo por conta",
        ],
      },
    ],
  },
  {
    id: "operacao",
    number: "05",
    title: "Operação",
    subtitle: "Prática Real",
    description: "Calls ao vivo, revisão de trades, accountability.",
    accentHex: "#EF4444",
    lessons: [],
  },
];

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

/** Find a lesson by ID across all modules */
export function findLesson(lessonId: string): { lesson: LessonData; mod: ModuleData; index: number } | null {
  for (const mod of CURRICULUM) {
    const index = mod.lessons.findIndex((l) => l.id === lessonId);
    if (index !== -1) {
      return { lesson: mod.lessons[index], mod, index };
    }
  }
  return null;
}

/** Get the next lesson after the given ID */
export function getNextLesson(lessonId: string): { lesson: LessonData; mod: ModuleData } | null {
  const allLessons = CURRICULUM.flatMap((m) => m.lessons.map((l) => ({ lesson: l, mod: m })));
  const idx = allLessons.findIndex((x) => x.lesson.id === lessonId);
  if (idx === -1 || idx === allLessons.length - 1) return null;
  return allLessons[idx + 1];
}

/** Get the previous lesson before the given ID */
export function getPrevLesson(lessonId: string): { lesson: LessonData; mod: ModuleData } | null {
  const allLessons = CURRICULUM.flatMap((m) => m.lessons.map((l) => ({ lesson: l, mod: m })));
  const idx = allLessons.findIndex((x) => x.lesson.id === lessonId);
  if (idx <= 0) return null;
  return allLessons[idx - 1];
}

/** Get flat list of all lesson IDs in order */
export function getAllLessonIds(): string[] {
  return CURRICULUM.flatMap((m) => m.lessons.map((l) => l.id));
}

/** Total number of lessons */
export const TOTAL_LESSONS = CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0);
