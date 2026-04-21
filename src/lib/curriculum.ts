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
          { question: "Um trader iniciante ganhou R$500 no primeiro dia sem saber nada. Ele quer dobrar o lote amanhã. O que provavelmente vai acontecer?", options: ["Vai ganhar mais — experiência inicial confirma edge pessoal no mercado", "Vai perder tudo — sorte no curto prazo não é consistência de estratégia", "Deve dobrar mesmo — aproveitar a fase boa é estratégia válida", "Resultado normal — flutuação dentro da variância estatística esperada"], correct: 1, explanation: "O mercado é imprevisível no curto prazo. Ganhar sem estratégia é sorte, e sorte não se repete. Quem dobra lote após sorte é o perfil que mais perde dinheiro no longo prazo. A mentoria foca em consistência com estratégia, não em apostar." },
          { question: "Você vê um influencer postando que usa RSI + Médias Móveis e ganha todo dia. Por que a estratégia SMC ignora esses indicadores?", options: ["Indicadores são pagos e o SMC prefere ferramentas gratuitas sempre disponíveis", "Todo mundo usa igual — institucionais sabem onde estão os stops e exploram a previsibilidade", "Indicadores são complicados demais — SMC simplifica a análise pra iniciantes", "Equipe do URA não tem familiaridade com indicadores tradicionais"], correct: 1, explanation: "Indicadores tradicionais usam dados passados e são públicos — todo mundo vê o mesmo sinal. Os institucionais sabem exatamente onde quem usa RSI/MA vai colocar stops e usam isso pra varrer liquidez. SMC rastreia o dinheiro institucional diretamente, em vez de seguir sinais que os big players exploram." },
          { question: "Você perdeu 3 trades seguidos hoje. O que a mentalidade correta manda fazer?", options: ["Aumenta o lote pra recuperar mais rápido o prejuízo acumulado do dia", "Muda de ativo — Nasdaq não está oferecendo setups viáveis hoje", "Fecha a plataforma e respeita o limite diário, revisa depois com cabeça fria", "Continua operando até acertar e sair no positivo antes do fim da sessão"], correct: 2, explanation: "Revenge trading (operar pra recuperar) é o erro #1 de todo trader. Quando o emocional toma conta, a disciplina morre. As regras do URA: perdeu o máximo diário (1%) → sai da tela, locka a conta, revisa depois com a cabeça fria. O mercado abre amanhã." },
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
          { question: "Você está olhando o gráfico de 15 minutos e vê um candle com body muito pequeno e pavios longos dos dois lados. O que isso indica sobre o mercado naquele momento?", chart: "candle-anatomy", options: ["Sinal bullish forte — pavios dos dois lados indicam demanda reprimida saindo", "Indecisão — pavios longos mostram batalha entre compradores e vendedores sem vencedor", "Oportunidade de compra — pavios indicam preço barato na sessão atual", "Candle defeituoso — formação atípica indica erro de timeframe na plataforma"], correct: 1, explanation: "Candles com body pequeno e pavios longos (dojis) mostram que o preço testou altos e baixos mas fechou perto de onde abriu. Isso indica indecisão — nem compradores nem vendedores dominaram. Em zonas de decisão (OB, FVG), esse candle pode preceder um movimento forte." },
          { question: "Você está no gráfico de 1 hora e vê 5 candles verdes consecutivos com bodies grandes. Troca pro diário e vê que o candle do dia ainda está vermelho. O que isso significa?", options: ["Diário defasado — candle 1h reflete o movimento atual mais relevante que o diário", "Conflito de timeframes — contexto maior segue bearish apesar do rali no 1h", "Diário deve ser ignorado — ação no 1h é o que importa pra decisão operacional", "Reversão iminente no 1h — 5 candles verdes costumam marcar exaustão do rally"], correct: 1, explanation: "Timeframes maiores dão o contexto. Um rali no 1h dentro de um candle diário bearish pode ser apenas um pullback — não uma reversão. Isso é top-down analysis: o viés vem do maior (semanal/diário) e a entrada vem do menor (1h/15min). Nunca ignore o contexto." },
          { question: "Qual a diferença prática entre olhar o gráfico no timeframe de 4h vs 5min?", options: ["Nenhuma diferença — preço é o mesmo, apenas a granularidade visual muda", "4h mostra estrutura macro e pontos-chave, 5min mostra detalhes de entrada", "5min é mais preciso — granularidade menor elimina ruído e melhora decisão", "4h é exclusivo pra scalp — timeframe menor não permite decisão rápida"], correct: 1, explanation: "É como um mapa: o 4h é o mapa da cidade (pra onde ir), o 5min é o GPS na rua (como chegar). Você marca OBs e FVGs no 4h/1h, e desce pro 15min/5min pra encontrar a entrada precisa. Operar sem top-down é dirigir sem saber o destino." },
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
          { question: "Observe o gráfico: um setup com entrada, SL a 1R e TP a +3R. Se esse mesmo setup gerar $400 de risco na sua conta de $25.000, deve entrar?", chart: "risk-shield", options: ["Entra — setup 1:3 compensa qualquer valor de risco dentro do limite da conta", "Não entra — $400 é 1.6% da conta, acima do limite 1%, reduz lote pra $250", "Entra se estiver confiante — convicção no setup valida size acima do limite", "Depende do horário — janelas específicas permitem size ampliado na execução"], correct: 1, explanation: "1% de $25.000 = $250. Um trade com risco de $400 = 1.6%, acima do limite — mesmo com RR 1:3 igual ao do gráfico. A solução: reduzir o lote até o risco caber em $250. Setup bom com risco errado continua sendo um trade ruim. Gerenciamento > estratégia." },
          { question: "Você perdeu $150 no primeiro trade do dia (conta de $25K). Encontrou outro setup bom. Quanto pode arriscar nesse segundo trade?", options: ["$250 completo — cada trade tem seu próprio orçamento independente do anterior", "$100 — limite é diário, restam $100 do orçamento total do dia após loss", "$500 pra compensar o loss anterior e sair no positivo da sessão", "Nada — após loss, regra do URA proíbe operar o resto do dia inteiro"], correct: 1, explanation: "O limite de 1% é DIÁRIO, não por trade. Se perdeu $150, restam $100 de risco pro dia ($250 - $150). Se o setup exigir mais que $100 de risco, não entra. E se atingir os $250, acabou o dia. Isso protege seu capital dos dias ruins — e dias ruins são normais." },
          { question: "Você tem 3 contas de mesa proprietária. Na segunda-feira, perdeu 2% na conta A. Na terça, está -0.5% na conta B. É quarta-feira. O que faz?", options: ["Pausa todas as contas até segunda — drawdown no início da semana compromete o restante", "Foca em B (mais longe do limite), reduz A, C só com setup A+ claro", "Opera tudo agressivamente — semana em drawdown exige size maior pra recuperar", "Opera só a conta mais lucrativa — prioriza performance em vez de preservação"], correct: 1, explanation: "A conta A está em -2% na semana (quase no limite de 2.5%). Reduzir risco ou pausar. A conta B tem espaço ainda. A conta C não tem motivo pra arriscar sem setup. Priorizar contas por situação de drawdown é gerenciamento inteligente — não emocional." },
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
          { question: "Observe o gráfico: o preço caiu forte e agora está retornando à zona marcada como 'OB'. O que você espera que aconteça quando o preço atingir essa zona?", chart: "ob-bounce", options: ["Preço passa direto — OB falhou e perdeu função estrutural", "Reação provável — ordens institucionais pendentes tendem a defender a zona", "Impossível prever — retorno à zona é movimento aleatório sem padrão", "Zona expirada — OBs antigos perdem relevância após alguns dias"], correct: 1, explanation: "Order Blocks marcam onde institucionais colocaram ordens grandes. Quando o preço retorna, essas ordens ainda estão lá esperando execução. O preço tende a reagir (pausar ou reverter) nessas zonas. Não é garantia, mas é uma zona de alta probabilidade — especialmente quando confluente com FVG ou liquidez." },
          { question: "Você marcou um OB bullish no gráfico diário. Ao descer pro 15 minutos, encontra 3 OBs menores dentro da mesma zona. Qual deles usar para a entrada?", options: ["O primeiro que aparecer — execução rápida evita perder o movimento principal", "O mais próximo do fundo — máximo desconto dá melhor RR e stop apertado", "Qualquer um — OBs dentro da mesma zona HTF têm validade equivalente", "Nenhum — OBs em LTF dentro de HTF são ruído e não agregam edge"], correct: 1, explanation: "Top-down: o OB do diário dá a zona macro. Dentro dele, o OB do 15min mais profundo (mais perto do fundo da zona) dá o melhor preço de entrada — menor risco, maior R:R. É como usar o zoom: o diário diz ONDE, o 15min diz EXATAMENTE onde." },
          { question: "O preço chegou no seu OB mas não reagiu — passou direto e continuou caindo. O que isso significa?", options: ["OB era falso — zona marcada incorretamente desde o início", "OB mitigado — zona virou Breaker Block e a estrutura mudou de função", "Estratégia OB não funciona — melhor trocar pra indicadores tradicionais", "Oportunidade de reentrada — próximo trade na mesma direção com stop maior"], correct: 1, explanation: "Quando um OB falha (preço passa sem reagir), ele se torna um Breaker Block — a zona muda de função. Um OB bullish quebrado vira resistência. Isso é informação valiosa: a estrutura mudou, o viés pode ter invertido. Adapte-se, não insista." },
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
          { question: "No gráfico, 3 candles criaram um espaço vazio (FVG). O preço subiu forte e agora está voltando. Até onde o preço provavelmente vai antes de continuar subindo?", chart: "fvg-fill", options: ["Até o topo do último candle — retorno apenas pra testar resistência anterior", "Até preencher o FVG — gap funciona como ímã que atrai o preço de volta", "Até o fundo do gráfico — pullbacks em FVG costumam ser profundos", "Não volta — tendência forte invalida retorno pra preencher gaps"], correct: 1, explanation: "O mercado busca eficiência. FVGs são 'buracos' no preço onde não houve troca justa de ordens. O preço tende a retornar e preencher esse gap antes de continuar. É como um ímã — o FVG atrai o preço de volta. Quando o FVG é preenchido e confluente com um OB, é zona de entrada de alta probabilidade." },
          { question: "Você identificou um OB bullish E um FVG na mesma zona do gráfico de 4h. Isso é:", options: ["Redundância — dois conceitos sobrepostos anulam edge do outro", "Confluência dupla — zona de altíssima probabilidade com múltiplos motivos institucionais", "Conflito gráfico — sobreposição confunde a leitura e invalida o setup", "Irrelevante — preço não respeita sobreposições de zonas marcadas"], correct: 1, explanation: "Confluência é o santo graal do SMC. Quando OB + FVG + liquidez varrida + desconto se alinham na mesma zona, a probabilidade sobe drasticamente. Não é um indicador mágico — é lógica: múltiplas razões apontando pra mesma conclusão. Opere apenas setups com confluência." },
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
          { question: "O preço caiu de 18.500 até 18.000 e agora está subindo. Atualmente está em 18.350. O viés diário é bullish. Você deve comprar aqui?", chart: "premium-discount", options: ["Compra — momentum bullish em andamento oferece continuação até o swing high", "Não compra — 18.350 está em Premium acima de 18.250, espera retorno ao Discount", "Compra perto do topo — proximidade do swing high confirma continuação imediata", "Compra em qualquer preço — viés bullish HTF valida entry independente da zona"], correct: 1, explanation: "50% do range (18.000–18.500) = 18.250. O preço em 18.350 está em PREMIUM — zona cara pra comprar. Mesmo com viés bullish, a entrada ideal é em Discount (abaixo de 18.250), onde o R:R é melhor. Comprar em Premium significa stop grande e alvo curto — math não fecha." },
          { question: "Um colega diz: 'Se o viés é bearish, eu vendo em qualquer preço.' O que está errado nessa lógica?", options: ["Lógica está correta — viés bearish valida venda em qualquer zona do range", "Vender em Discount com stop longe e alvo curto destrói RR da operação", "Venda deve ser em Premium — preço caro dá stop curto acima e alvo longo abaixo", "Deveria usar indicadores em vez de P&D — Fibonacci é subjetivo demais"], correct: 2, explanation: "Mesmo com viés correto, a ZONA importa. Vender em Discount significa que o preço já caiu bastante — seu stop fica acima (longe) e seu alvo embaixo (perto). R:R ruim. Venda em Premium: preço caro, stop curto acima, alvo longo embaixo. Viés dá a direção, P&D dá o PREÇO." },
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
          { question: "No gráfico, o preço fez vários lows iguais (linha de suporte). Abaixo dessa linha há stops de milhares de traders retail. O que os institucionais vão fazer?", chart: "liquidity-sweep", options: ["Respeitar o suporte — nível com múltiplos toques tem validade institucional", "Varrer os stops abaixo pra pegar liquidez e depois reverter na direção real", "Ignorar o nível — institucionais não seguem suportes clássicos do retail", "Suporte segura — concentração de compras retail sustenta o nível estruturalmente"], correct: 1, explanation: "Equal lows = liquidez acumulada. Os institucionais PRECISAM dessa liquidez pra executar ordens grandes. O 'suporte forte' é na verdade um ímã de stops. O sweep acontece: preço rompe brevemente, dispara os stops (dando contrapartida pros institucionais), e reverte. É por isso que 'suportes fortes' sempre são rompidos antes de funcionar." },
          { question: "O preço acabou de varrer a liquidez (sweep) abaixo de vários lows e imediatamente voltou pra cima com força. Você deveria:", options: ["Vender short — rompimento do suporte confirma continuação bearish imediata", "Esperar confirmação no LTF e entrar long — sweep + reversão é manipulação antes da distribuição", "Não operar — volatilidade extrema não gera setup operacional confiável", "Comprar imediato sem confirmação — velocidade da reversão exige execução rápida"], correct: 1, explanation: "Sweep de liquidez + reversão = sinal de que os institucionais pegaram o que precisavam. MAS não compre no susto. Desce pro 5min/1min, espera um OB/FVG de confirmação, e entra com stop abaixo do sweep. Operar o sweep sem confirmação é jogar moeda." },
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
          { question: "Observe o gráfico: a sessão de Ásia fez um range apertado. Na abertura de Londres, o preço rompeu acima do Asia High e imediatamente reverteu pra baixo. O que aconteceu?", chart: "session-asia", options: ["Londres confirmou a alta da Ásia — rompimento do Asia High é sinal bullish", "Sweep do Asia High — Londres pegou liquidez acima e reverteu, manipulação típica", "Movimento aleatório — spike e reversão são flutuações sem padrão identificável", "Range da Ásia estava incorretamente marcado — preço rompeu ponto sem significado"], correct: 1, explanation: "A Ásia cria o range (acumulação). Londres frequentemente varre a liquidez de um lado (sweep do Asia High ou Low) e reverte. É o AMD em ação: Ásia = A, Londres sweep = M, NY move = D. Saber que Londres costuma fazer isso muda como você lê a abertura." },
          { question: "São 10:25 da manhã (NY), 5 minutos antes da sua Kill Zone. O preço está parado. O que você faz?", options: ["Entra agora — antecipar o movimento captura os primeiros ticks da KZ", "Espera a Kill Zone (10:30) — primeiros candles revelam a direção da manipulação", "Desiste do dia — preço parado antes de KZ sinaliza falta de volume pra sessão", "Troca de ativo — procura algo mais volátil pra capturar oportunidade imediata"], correct: 1, explanation: "Kill Zones existem por um motivo: é quando o dinheiro institucional entra. Os primeiros minutos da KZ frequentemente mostram a manipulação (falso movimento). Entrar ANTES é operar no escuro. Espere a KZ, observe os primeiros candles, identifique o sweep, e entre na reversão." },
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
          { question: "No gráfico, o preço acumulou (range), depois caiu forte varrendo os lows (sweep), e agora está subindo com força. Em que fase do AMD estamos e o que fazer?", chart: "amd-sweep", options: ["Acumulação ainda em curso — espera mais consolidação antes da direção real", "Fim da M e início da D — sweep confirmou manipulação, procura entrada long", "Distribuição terminando — movimento real está no fim, tarde demais pra entrar", "Movimento aleatório — padrões AMD não se aplicam em todos os dias"], correct: 1, explanation: "O sweep dos lows foi a Manipulação (M) — varreu liquidez das sardinhas. A subida forte marca o início da Distribuição (D) — o movimento real. A entrada ideal é logo após o sweep confirmar (quando o preço volta pra cima com força). Não é 'comprar o fundo' — é comprar a confirmação da reversão pós-manipulação." },
          { question: "Você identificou um AMD. O preço está na fase A (acumulação, range apertado). Um amigo diz pra comprar agora 'porque está barato'. Por que isso é um erro?", options: ["Não é erro — comprar em acumulação antecipa o movimento real da distribuição", "Incerteza da fase A — sweep pode ir pra qualquer lado, comprar ali é apostar", "Fase A sempre continua bullish — compra na acumulação é sempre lucrativa", "Acumulação é prolongada — qualquer momento serve pra entrar com custo médio"], correct: 1, explanation: "A Acumulação é incerteza. Os institucionais ainda estão acumulando — o movimento real (D) ainda não começou. Entrar na A é apostar na direção do sweep. Se o sweep for pra baixo (e sua compra for stopada), você perdeu. ESPERE a M (manipulação/sweep) e entre na D (distribuição). Paciência > ansiedade." },
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
          { question: "Observe o gráfico: o viés diário é bullish, mas na abertura o preço caiu forte (Judas Swing). Muitos traders entraram vendidos achando que ia cair mais. O que aconteceu depois?", chart: "judas-swing", options: ["Continuação bearish — queda forte confirma que o viés diário estava incorreto", "Reversão violenta bullish — Judas varreu stops, curtos foram stopados alimentando o rally", "Lateralização prolongada — preço fica preso após spike sem direção definida", "Judas é ruído — não tem relação com o viés e não afeta o movimento do dia"], correct: 1, explanation: "O Judas Swing engana propositalmente. Nome bíblico: Judas traiu com um beijo — parece amigo mas é inimigo. O falso movimento na abertura varre stops dos bulls impacientes E atrai bears que vendem o 'rompimento'. Quando reverte, os stops dos bears viram combustível pra alta. O viés diário quase sempre vence." },
          { question: "Antes do mercado abrir, você analisa: semanal bullish, diário fez sweep de sell-side liquidity ontem e fechou acima. Qual seu viés pra hoje?", options: ["Bearish — queda de ontem sinaliza continuação vendedora pro dia seguinte", "Bullish — semanal bullish + sweep SSL + close acima = confluência de alta clara", "Neutro — confluência mista exige mais dados antes de decidir direção", "Depende das notícias — calendário econômico supera análise técnica do dia"], correct: 1, explanation: "Daily Bias vem da confluência: (1) semanal dá a tendência macro, (2) o diário fez um sweep de SSL + reverteu = acumulação/manipulação completa, agora distribui pra cima. Isso é o framework completo: top-down + AMD + liquidez. Notícias podem causar volatilidade, mas o viés estrutural é o que importa." },
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
          { question: "No gráfico, o NQ fez um novo high mas o ES (SP500) NÃO confirmou — fez um high mais baixo. O viés era bullish. O que essa divergência te diz?", chart: "smt-diverge", options: ["Irrelevante — NQ e ES são independentes e divergem naturalmente no intraday", "Alerta SMT — NQ pode ter feito falso breakout, high sem confirmação é armadilha", "ES atrasado — índice mais amplo costuma confirmar o movimento no próximo candle", "Sinal pra comprar — força relativa do NQ confirma continuação bullish imediata"], correct: 1, explanation: "NQ e ES são correlacionados — normalmente se movem juntos. Quando um faz novo high e o outro não (SMT), é divergência. Isso sugere que o high do NQ pode ser um sweep de liquidez, não um movimento real. NÃO é um sinal de venda automático, mas é um ALERTA: fique esperto, procure confirmação, reduza exposição se estava comprado." },
          { question: "Você está comprado no NQ com lucro aberto. De repente, percebe SMT: NQ fez novo high mas ES fez lower high. O que fazer?", options: ["Segura a posição — NQ é mais forte e divergência é sinal de força relativa", "Protege a posição — move BE ou tira parcial, se SMT acertar você sai sem risco", "Vende tudo imediatamente — SMT bearish é sinal de reversão iminente definitiva", "Ignora — SMT é subjetivo e não vale ajuste de posição em andamento"], correct: 1, explanation: "SMT não é sinal de pânico, é sinal de proteção. Mova o stop pro breakeven ou tire um parcial. Se o NQ sustenta, ótimo — você continua no trade sem risco. Se reverte, saiu no zero-a-zero em vez de devolver o lucro. SMT é seguro de proteção, não botão de saída." },
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
          { question: "Observe o cenário: sweep da SSL, OB bullish confirmado, preço voltando pra cima com FVG. Onde exatamente você coloca a entrada e o stop?", chart: "entry-setup", options: ["Entry no topo do OB, stop no fundo do candle anterior — stop apertado maximiza RR", "Entry na mitigação do OB, stop abaixo do sweep low — invalidação clara da tese", "Entry aleatório na zona com stop fixo de 10 pontos — execução rápida sem análise", "Evita o setup — confluência de SSL + OB + FVG é complexa e arriscada demais"], correct: 1, explanation: "O stop vai abaixo do sweep porque: se o preço passar abaixo do sweep, o OB foi invalidado e a tese morreu. Colocar o stop acima do sweep (mais apertado) é ganância — vai ser stopado por ruído. Abaixo do sweep = 'se isso for rompido, eu estava errado e saio'. O R:R com TP em +3R precisa que o stop faça sentido estrutural." },
          { question: "Seu setup dá entry em 18.100, SL em 18.050 (50 pontos), TP em 18.250 (150 pontos). Isso é 3R. Mas você 'sente' que pode ir até 18.400. O que faz?", options: ["Move TP pra 18.400 — convicção no trade justifica aumentar a projeção do alvo", "Mantém o plano — TP em 3R, tira parcial lá e deixa runner com stop no BE", "Remove o TP pra deixar o trade correr sem limite definido no plano original", "Cancela o trade — 3R é insuficiente pra justificar o risco inicial da operação"], correct: 1, explanation: "Plano > sentimento. Mover TP baseado em 'feeling' é o início do fim. A solução pro trader que quer mais: parcializa. Tira 70% do lucro no TP original (3R) e deixa 30% correndo com stop no breakeven. Assim garante o lucro E captura o extra sem risco. Best of both worlds." },
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
          { question: "Você está na Fase 2 de uma mesa de $50K, faltando $800 pra aprovar. É sexta-feira, último dia do prazo. Você encontra um setup B+ (não A+). O que faz?", options: ["Entra — prazo apertado justifica aproveitar qualquer setup razoável disponível", "Não entra — setup B+ sob pressão vira revenge trading, compra nova avaliação vale mais", "Dobra o lote — size maior fecha os $800 restantes com trade único bem posicionado", "Opera no celular — execução rápida compensa a falta de qualidade do setup"], correct: 1, explanation: "Esse é o erro que mais reprova gente: forçar trades no final do prazo. A conta de $50K custa ~$300. Se você forçar e perder, vai pro drawdown e perde os $800 que já tinha + a avaliação. NUNCA opere sob pressão de prazo. Se o setup não é A+, melhor comprar outra avaliação. R$300 < R$800 de lucro perdido." },
          { question: "Você tem 3 contas: (A) $10K funded em saque, (B) $25K Fase 2 a 60%, (C) $50K Fase 1 começando. Em qual ordem priorizar?", options: ["C primeiro — conta maior tem maior potencial de lucro no longo prazo", "A → B → C — A próxima do saque, B próxima de aprovar, C pode esperar", "Todas igual — cada conta merece mesmo risco e atenção simultaneamente", "Só A funded — abandona as outras pra focar 100% no que já gera renda"], correct: 1, explanation: "Priorize pelo que está mais próximo do RESULTADO. Conta A (funded em saque) = dinheiro real na sua mão, cuide dela primeiro. Conta B (60% da Fase 2) = quase aprovada, merece atenção. Conta C (começando) = pode esperar, sem pressão. Operar as 3 com mesmo risco dilui foco e aumenta chance de erro nas que importam." },
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
          { question: "Sua conta funded de $25K tem drawdown máximo de 5% ($1.250). Você está em -$900 (-3.6%). Encontra um setup A+ com risco de $300. Entra?", options: ["Entra — setup A+ é raro e deve ser aproveitado independente do drawdown atual", "Reduz lote ou evita — $300 de risco levaria a 4.8% perto do breach, opera com $150", "Para de operar — qualquer drawdown negativo exige pausa até próxima semana", "Dobra pra $600 — size maior recupera drawdown com trade único bem posicionado"], correct: 1, explanation: "Gerenciamento > setup. Mesmo um A+ pode perder. -$900 + $300 de risco = -$1.200 se perder, sobrando apenas $50 antes de perder a conta. Opções: (1) reduzir o lote pela metade ($150 de risco) — se perder, ainda tem margem, (2) não operar até a conta ter mais margem. Conta funded é patrimônio — proteja acima de tudo." },
          { question: "Você tem 4 contas: 2 funded e 2 em avaliação. É terça-feira, você fez -1.2% em todas ontem. Hoje o mercado abriu volátil. Plano de ação?", options: ["Opera todas normalmente — cada dia é independente e drawdown de ontem é passado", "Pausa funded e opera avaliação com risco reduzido — protege patrimônio, custo de avaliar é menor", "Dobra o risco — recuperação rápida exige size maior pra compensar o loss acumulado", "Para a semana inteira — drawdown em múltiplas contas indica momento ruim pra operar"], correct: 1, explanation: "Contas funded = renda. Contas de avaliação = custo. Quando está em drawdown + mercado volátil: proteja o que gera dinheiro (funded) e, se for operar, arrisque o que custa menos perder (avaliação — pior caso, compra outra). Isso é mentalidade de empresário, não de jogador." },
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
