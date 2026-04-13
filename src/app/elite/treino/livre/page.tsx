"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, X, Shuffle, ArrowRight, Trophy, RotateCcw, Zap } from "lucide-react";

/* ────────────────────────────────────────────
   Banco de Cenários — Treino Livre
   Perguntas aleatórias cobrindo todo o currículo SMC
   ──────────────────────────────────────────── */

interface Scenario {
  id: string;
  category: string;
  title: string;
  context: string;
  options: string[];
  correct: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  // ── Estrutura de Mercado ──
  { id: "s1", category: "Estrutura", title: "BOS vs CHoCH", context: "O preço está em tendência de alta. Fez um novo topo, mas na correção quebrou o último fundo. O que aconteceu?", options: ["BOS — continuação da tendência", "CHoCH — possível mudança de tendência", "Nada relevante — fundos quebram o tempo todo", "Preciso ver o volume pra decidir"], correct: 1, explanation: "Quando o preço quebra o último fundo (low) numa tendência de alta, é um CHoCH (Change of Character) — sinal de que a estrutura pode estar mudando de bullish pra bearish. BOS seria a quebra de um topo (high), confirmando continuação." },
  { id: "s2", category: "Estrutura", title: "Tendência no HTF vs LTF", context: "No diário, a tendência é claramente bearish. No 15 minutos, o preço acabou de fazer um BOS bullish. O que isso representa?", options: ["Reversão — o 15min está certo", "Pullback dentro da tendência bearish do diário", "Os dois timeframes se contradizem, não opero", "O diário está atrasado, confio no 15min"], correct: 1, explanation: "Um BOS bullish no 15min dentro de uma tendência bearish no diário é provavelmente um pullback, não uma reversão. O contexto maior (diário) tem mais peso. Esse pullback pode ser a oportunidade de venda que os institucionais estão usando." },
  { id: "s3", category: "Estrutura", title: "Swing structure vs internal", context: "O preço fez um topo em 18.300, corrigiu até 18.150, e agora está subindo. Você vê um BOS internal (de um topo menor em 18.250) mas o swing high em 18.300 ainda não foi quebrado.", options: ["O mercado é bullish — BOS internal confirma", "Bullish apenas no internal, o swing structure ainda é neutro até quebrar 18.300", "Vendo em 18.250 porque não quebrou o swing", "Internal structure não importa"], correct: 1, explanation: "A internal structure mostra o momentum de curto prazo (bullish), mas o swing structure é o que importa pro viés macro. Até o preço quebrar 18.300 (swing high), o mercado não confirmou continuação bullish no swing. Entradas devem considerar ambas." },

  // ── Order Blocks ──
  { id: "s4", category: "Order Blocks", title: "OB respeitado vs mitigado", context: "O preço voltou ao OB bullish que você marcou. Tocou no topo do OB e está rejeitando. Mas ainda não entrou na metade inferior do OB.", options: ["Entrada boa — o OB está sendo respeitado", "Espero o preço entrar mais no OB (pelo menos 50%) pra entrada com melhor RR", "O OB já falhou se não caiu mais", "Compro no topo do OB com stop apertado"], correct: 1, explanation: "Um OB é mais forte quando o preço penetra pelo menos até a metade dele. Entrada no topo do OB dá RR pior e stop mais apertado (fácil de ser varrido). O ideal é esperar o preço entrar em 50%+ do OB pra ter entrada com desconto e stop abaixo do OB inteiro." },
  { id: "s5", category: "Order Blocks", title: "OB em zona de supply vs demand", context: "Você identificou um OB bearish num gráfico de 1h. Ele está exatamente numa zona de supply do 4h. O preço está subindo em direção a ele.", options: ["Vendo imediatamente — OB + supply é confluência forte", "Espero o preço chegar no OB e mostrar rejeição antes de entrar", "OBs em zonas de supply são invalidados", "Compro porque o preço está subindo"], correct: 1, explanation: "OB + supply zone é confluência forte, mas nunca entre antes do preço chegar na zona e mostrar rejeição (candle de rejeição, sweep). A confluência aumenta a probabilidade, mas a confirmação protege contra falsos sinais." },
  { id: "s6", category: "Order Blocks", title: "Múltiplos OBs — qual usar?", context: "Após um BOS bullish, você vê 3 possíveis OBs no pullback. OB-A é o mais recente (perto do preço atual), OB-B está na metade, e OB-C está lá embaixo perto do fundo.", options: ["OB-A — o mais próximo é o mais relevante", "OB-C — o mais extremo é o mais forte (mais discount)", "Todos são válidos — coloco ordens em todos", "O OB que tem FVG dentro é o melhor, independente da posição"], correct: 3, explanation: "Nem o mais próximo nem o mais extremo — o melhor OB é o que tem mais confluência (FVG dentro, zone de premium/discount alinhada, nível institucional). Um OB com FVG dentro tem desequilíbrio + posição institucional, que é a combinação mais forte." },

  // ── FVG ──
  { id: "s7", category: "FVG", title: "FVG consequent encroachment", context: "Um FVG bullish está entre 18.050 e 18.080. O preço voltou e preencheu até 18.065 (exatamente 50% do FVG) e está reagindo. O que significa?", options: ["O FVG falhou — preencheu demais", "Consequent Encroachment — o preço preencheu 50% do FVG, que é o ponto de equilíbrio. Reação aqui é forte sinal bullish", "Precisa preencher 100% pra ser válido", "50% não tem significado em FVG"], correct: 1, explanation: "Consequent Encroachment (CE) é quando o preço preenche exatamente 50% do FVG. É o ponto de equilíbrio do gap. Reação forte nesse nível é um dos sinais mais precisos do SMC — mostra que os institucionais estão defendendo o fair value." },
  { id: "s8", category: "FVG", title: "FVG invertido", context: "O preço fez um impulso de alta e deixou um FVG bullish. Depois reverteu completamente e fechou abaixo do FVG inteiro. O que acontece com esse FVG?", options: ["Continua válido — pode reagir quando o preço voltar", "Invertido — agora funciona como resistência (supply) em vez de suporte", "Invalidado — apague do gráfico", "Transformou em Order Block"], correct: 1, explanation: "Quando o preço preenche um FVG inteiro e fecha do outro lado, ele se inverte. Um FVG bullish que foi completamente preenchido agora funciona como zona de supply (resistência). O preço pode reagir de volta quando retornar a ele, mas na direção oposta." },

  // ── Liquidez ──
  { id: "s9", category: "Liquidez", title: "Trendline liquidity", context: "O preço fez uma trendline de alta limpa com 4 toques. Muitos traders de análise técnica estão usando ela como suporte. O que o institucional vê?", options: ["Suporte forte — quanto mais toques, mais forte", "Pool de liquidez — sell stops de todo mundo que comprou no suporte da trendline estão logo abaixo", "Trendlines não funcionam no SMC", "Compro no próximo toque da trendline"], correct: 1, explanation: "Trendlines são liquidez. Cada toque coloca mais stops logo abaixo. O institucional sabe que abaixo daquela trendline existe um pool enorme de sell stops. Quando quiser comprar com volume, vai varrer essa trendline pra pegar a liquidez e depois reverter." },
  { id: "s10", category: "Liquidez", title: "Inducement", context: "O preço fez um fundo menor (internal low) durante um pullback bearish. Compradores entraram nesse nível pensando que é suporte. O preço está se aproximando desse nível novamente.", options: ["Compro — é suporte confirmado com 2 toques", "Inducement — esse fundo menor é isca pra atrair compradores e pegar a liquidez antes de cair mais", "O preço vai fazer double bottom e subir", "Esse nível é irrelevante"], correct: 1, explanation: "Inducement é quando um internal low ou high é criado pra atrair traders na direção errada. No SMC, esses níveis internos são iscas — os institucionais vão varrê-los pra pegar a liquidez (sell stops dos compradores) antes de continuar na direção original." },
  { id: "s11", category: "Liquidez", title: "BSL vs SSL", context: "O mercado está em tendência bearish no 4h. Existe BSL (buy-side liquidity) acima de 18.200 e SSL (sell-side liquidity) abaixo de 17.900. Pra qual lado o institucional vai buscar primeiro?", options: ["BSL acima — pra se posicionar vendido com liquidez", "SSL abaixo — pra continuar a tendência bearish", "Pode ir pra qualquer lado aleatoriamente", "Nenhum — o mercado vai ficar lateralizado"], correct: 0, explanation: "Em tendência bearish, o institucional precisa de liquidez pra vender. A BSL (buy stops acima de 18.200) fornece essa liquidez. O preço sobe até a BSL, varre os buy stops, o institucional vende nesse nível, e o preço cai. Manipulação antes da distribuição." },

  // ── Sessões ──
  { id: "s12", category: "Sessões", title: "Kill Zone de NY", context: "São 10:15 da manhã BRT. NY abriu há 45 minutos. Você viu o Judas Swing, o preço está retornando pra zona de demanda. Em quanto tempo precisa achar entrada?", options: ["Sem pressa — posso entrar até as 16h", "A kill zone de NY é entre 9:30 e 11:30 BRT — tenho cerca de 1h15 ainda", "Já perdi o horário — kill zone é só nos primeiros 15 min", "Kill zone não existe no NQ"], correct: 1, explanation: "A kill zone de NY pra NQ é geralmente entre 9:30 e 11:30 BRT (10:30-12:30 horário do leste). Depois desse período, a volatilidade cai e os setups ficam menos confiáveis. Você ainda tem tempo, mas não demore — as melhores entradas saem nos primeiros 1-2h." },
  { id: "s13", category: "Sessões", title: "Overlap Londres-NY", context: "São 9:30 BRT. A sessão de Londres está aberta desde 4h e NY está abrindo agora. O preço está em consolidação há 2 horas.", options: ["Normal — o preço consolida antes de NY", "O overlap Londres-NY (9:30-12:30 BRT) é o período de maior volume — a consolidação provavelmente vai romper agora", "Londres já definiu a direção, não vai mudar", "Consolidação de 2h significa que não vai ter movimento hoje"], correct: 1, explanation: "O overlap entre Londres e NY (9:30-12:30 BRT) é o período de maior volume e volatilidade do dia. É extremamente comum o preço consolidar nas horas antes e romper exatamente no overlap. É aqui que os melhores setups acontecem." },

  // ── AMD ──
  { id: "s14", category: "AMD", title: "Fase de acumulação em range", context: "O preço está num range de 30 pontos há 40 minutos na abertura de NY. Sem direção clara. Um trader iniciante está impaciente e quer entrar logo.", options: ["Ele deveria entrar — quanto mais tempo em range, mais provável o breakout", "Paciência — é acumulação. Entrar agora é apostar. Espere a manipulação e entre na distribuição", "Range significa que não vai ter trade hoje", "Compra no topo, vende no fundo do range"], correct: 1, explanation: "Acumulação é a fase mais perigosa pra operar — o preço vai e volta sem direção. Quem entra aqui está apostando. A sequência correta é: espere o range → espere o spike que varre um lado (manipulação) → entre quando o preço reverter (distribuição). Paciência paga." },
  { id: "s15", category: "AMD", title: "AMD — como saber qual lado vai varrer", context: "O mercado está em acumulação. Equal highs em 18.200 e equal lows em 18.100. Seu viés diário é bullish. Pra qual lado provavelmente vai ser a manipulação?", options: ["Pra cima (varrer os highs) e depois cair", "Pra baixo (varrer os lows) e depois subir", "Pode ser qualquer lado — é imprevisível", "Vai romper dos dois lados"], correct: 1, explanation: "Se o viés é bullish, a manipulação geralmente é bearish — o preço varre os equal lows (pega sell stops), dando liquidez pro institucional comprar, e depois sobe (distribuição bullish). O Judas Swing vai na direção oposta ao viés do dia." },

  // ── Premium & Discount ──
  { id: "s16", category: "Premium/Discount", title: "Operar em equilíbrio?", context: "O preço está exatamente no nível de 50% do último swing (equilíbrio). Não está nem em premium nem em discount. Você vê um setup que parece bom.", options: ["Entro — o setup é bom independente da zona", "Evito — equilíbrio não dá edge. Espero o preço ir pra discount (compra) ou premium (venda)", "Equilíbrio é a melhor zona pra operar", "50% não tem significado no gráfico"], correct: 1, explanation: "Operar no equilíbrio (50%) não dá vantagem estatística. Os institucionais compram em discount (barato) e vendem em premium (caro). No equilíbrio, o RR é neutro. Espere o preço se afastar do 50% na direção que te dá desconto pra entrar." },
  { id: "s17", category: "Premium/Discount", title: "OTE — Optimal Trade Entry", context: "O preço fez um swing high em 18.300 e está corrigindo. Você quer comprar. A retração de Fibonacci 0.618 (sweet spot) está em 18.112 e tem um OB nessa mesma zona.", options: ["Coloco buy limit em 18.112 — OTE + OB é a confluência perfeita", "Compro em 18.200 — não quero esperar tanto", "0.618 é superstição — Fibonacci não funciona", "Espero 0.786 pra ter preço ainda melhor"], correct: 0, explanation: "OTE (Optimal Trade Entry) é a zona entre 0.618 e 0.786 de Fibonacci. Quando coincide com um OB, é a entrada com melhor RR possível. Comprar em 18.200 (50%) desperdiça desconto. 0.786 pode funcionar mas o preço nem sempre chega lá — 0.618 + OB é o sweet spot." },

  // ── Gestão de Trade ──
  { id: "s18", category: "Gestão", title: "Breakeven — quando mover", context: "Você entrou comprado em 18.060 com stop em 18.045 (15pts de risco). O preço está em 18.078 (+18pts, pouco mais de 1R). Já move pro breakeven?", options: ["Sim — qualquer lucro deve ser protegido", "Espero 1.5R (18.082) pra mover pro breakeven e fazer parcial", "Nunca movo pro breakeven — ou bate o alvo ou o stop", "Movo quando sentir que vai reverter"], correct: 1, explanation: "Mover pro breakeven cedo demais (antes de 1R) faz o trade ser stopado por volatilidade normal. A regra: parcial em 1.5R, breakeven no restante. Isso garante lucro e dá espaço pro trade respirar. 'Quando sentir' não é gestão — é emocional." },
  { id: "s19", category: "Gestão", title: "Trade no lucro — cai notícia", context: "Você está comprado no NQ, trade em +2R. Sai uma notícia econômica que faz o mercado picotar com spread alto. O que você faz?", options: ["Fecho tudo imediatamente — notícia é imprevisível", "Já estou em 2R com stop no breakeven — deixo o stop proteger. Se for a favor, bônus", "Aumento a posição na notícia", "Tiro o stop pra dar espaço"], correct: 1, explanation: "Com 2R de lucro e stop no breakeven, você já ganhou. A notícia pode ir a favor e dar 3-4R, ou pode picotar e stopar no breakeven (lucro zero, mas sem perda). Fechar em pânico desperdiça o potencial. NUNCA tire o stop — e nunca aumente posição em notícia." },
  { id: "s20", category: "Gestão", title: "Revenge trading", context: "Você perdeu 2 trades seguidos hoje (-$380 de -$500 máximo). Aparece um setup que visualmente parece bom, mas seu emocional está abalado.", options: ["Opero com lote normal — o setup é bom", "Opero com lote reduzido pra não bater o limite", "Paro por hoje — emocional abalado + perto do limite = receita pra desastre", "Dobro o lote pra recuperar tudo em um trade"], correct: 2, explanation: "A combinação de emocional abalado + perto do limite diário é a receita perfeita pra revenge trading. Mesmo que o setup seja objetivamente bom, seu julgamento está comprometido. Regra do URA: 2 losses consecutivos ou -70% do limite diário = fecha a plataforma. O mercado abre amanhã." },

  // ── SMT Divergence ──
  { id: "s21", category: "SMT", title: "NQ vs ES divergência", context: "O NQ (Nasdaq) fez um novo low, mas o ES (S&P 500) não fez. Os dois ativos são correlacionados. O que isso significa?", options: ["Normal — cada ativo tem seu movimento", "SMT Divergence — o NQ mostrou fraqueza bearish. Se o ES não confirmou o low, o NQ provavelmente vai reverter pra cima", "O ES está atrasado e vai fazer novo low também", "Divergência entre NQ e ES não é relevante"], correct: 1, explanation: "SMT (Smart Money Technique) Divergence: quando ativos correlacionados (NQ/ES, EUR/DXY) divergem, é sinal de manipulação. O NQ fazendo low que o ES não confirma mostra que o low do NQ foi um sweep de liquidez, não um movimento real. Alta probabilidade de reversão bullish." },

  // ── Psicologia ──
  { id: "s22", category: "Psicologia", title: "FOMO depois de perder entrada", context: "Você marcou uma zona de entrada em 18.050. O preço chegou lá enquanto você estava longe da tela. Agora o preço está em 18.120, subindo forte sem você. O que faz?", options: ["Entro agora — ainda está subindo", "FOMO é o pior conselheiro. O setup era em 18.050, não em 18.120. Espero o próximo setup", "Entro com stop apertado em 18.110", "Aumento o lote pra compensar o atraso"], correct: 1, explanation: "Entrar atrasado destrói o RR. Sua entrada era 18.050 com stop em 18.040 (10pts de risco). Entrar em 18.120 com mesmo stop seria 80pts de risco — 8x pior. FOMO (Fear Of Missing Out) é emocional, não lógico. Sempre haverá outro setup." },
  { id: "s23", category: "Psicologia", title: "Overtrading", context: "Você já fez 3 trades hoje: 2 ganhos (+$300) e 1 perda (-$100). Net: +$200. São 14h e você vê outro setup possível. Deve operar?", options: ["Sim — estou no lucro, posso arriscar", "Questionar: esse setup é A+? Ou estou operando por tédio/ganância? Se não for excepcional, paro no verde", "Sempre opero até acabar o horário", "Com 3 trades, preciso fazer pelo menos mais 2 pra ter dados estatísticos"], correct: 1, explanation: "Overtrading é fazer trades medianos depois de já ter batido a meta. +$200 no dia é resultado. Se o 4º setup não for claramente A+ (todas as confluências alinhadas), é melhor parar no verde. A maioria dos traders devolvem o lucro do dia por overtrading à tarde." },

  // ── Candles ──
  { id: "s24", category: "Candles", title: "Engulfing em zona de demanda", context: "O preço chegou numa zona de demanda (OB bullish) no 15min. O último candle é um bullish engulfing — corpo verde que engoliu completamente o candle vermelho anterior.", options: ["Confirmação forte — entro comprado com stop abaixo do engulfing", "Engulfing é bom, mas espero o próximo candle fechar acima do engulfing pra confirmar", "Engulfing não funciona no SMC", "Vendo porque o preço está em zona baixa"], correct: 0, explanation: "Bullish engulfing em zona de demanda é uma das confirmações mais fortes. O corpo verde engolindo o vermelho mostra que os compradores dominaram completamente os vendedores naquele nível. Stop abaixo do engulfing (que coincide com abaixo do OB). Não precisa esperar mais confirmação." },
  { id: "s25", category: "Candles", title: "3 soldiers vs exaustão", context: "O preço subiu com 7 candles verdes consecutivos, cada um menor que o anterior. O momentum está diminuindo. Você está comprado desde o início.", options: ["Mantenho — ainda está subindo", "Sinais de exaustão — candles diminuindo mostram que os compradores estão perdendo força. Considero fechar parcial ou total", "Aumento posição — 7 candles verdes é muito forte", "Espero um candle vermelho pra decidir"], correct: 1, explanation: "Candles consecutivos com corpos diminuindo = exaustão. O volume comprador está secando. Isso geralmente precede uma correção ou reversão. Se você está no lucro, é momento de proteger (parcial, trailing stop). Nunca aumente posição em exaustão." },

  // ── Viés Diário ──
  { id: "s26", category: "Viés", title: "Day of week bias", context: "É segunda-feira. O preço caiu forte na sexta-feira. O candle semanal anterior fechou bearish. O que esperar da segunda?", options: ["Segunda continua o momentum de sexta — vendo na abertura", "Segundas frequentemente fazem o oposto de sexta (rebalanceamento semanal). Espero confirmação antes de operar", "Dia da semana não importa", "Sempre compro na segunda e vendo na sexta"], correct: 1, explanation: "Segundas-feiras frequentemente rebalançam o movimento de sexta. Se sexta caiu forte, segunda pode ter um pullback de alta antes de continuar a tendência. Nunca entre na abertura de segunda assumindo continuação — espere a sessão de NY confirmar o viés do dia." },
  { id: "s27", category: "Viés", title: "News day", context: "Hoje tem FOMC (decisão de juros do Fed) às 15h BRT. São 9h da manhã. O que você faz?", options: ["Opero normalmente até às 15h", "Reduzo exposição ou não opero antes do FOMC — a volatilidade pós-notícia é imprevisível e pode varrer qualquer stop", "FOMC não afeta o NQ", "Abro posição grande antes do FOMC pra pegar o movimento"], correct: 1, explanation: "FOMC é o evento de maior impacto no mercado. O preço costuma ficar em range antes e explodir depois com volatilidade extrema (spreads altos, wicks enormes). Muitos traders profissionais NÃO operam no dia de FOMC, ou operam apenas depois que a volatilidade inicial assentar (30-60 min após)." },

  // ── Mesas Proprietárias ──
  { id: "s28", category: "Mesas", title: "Drawdown diário vs total", context: "Sua mesa tem regra: 2% drawdown diário e 5% total. Você está em -1.8% no dia e -4.2% total. Aparece um setup A+.", options: ["Opero com lote mínimo — o setup é A+", "NÃO opero. Estou a 0.2% do drawdown diário E a 0.8% do total. Um loss pode acabar com a conta", "Opero normal — se é A+ tem que entrar", "Aumento lote pra recuperar os 4.2% de drawdown"], correct: 1, explanation: "Quando você está perto de AMBOS os limites (diário e total), qualquer operação é suicida. Mesmo um setup A+ pode dar loss — e esse loss pode custar a conta inteira. Regra: se está a menos de 1% de qualquer limite de drawdown, PARA. Preservar a conta é mais importante que qualquer setup." },
];

/* ────────────────────────────────────────────
   Shuffle helper
   ──────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ────────────────────────────────────────────
   Treino Livre — Modo Infinito
   ──────────────────────────────────────────── */

export default function TreinoLivrePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Scenario[]>(() => shuffle(SCENARIOS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const scenario = queue[currentIdx];

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    setStats(prev => ({
      correct: prev.correct + (idx === scenario.correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIdx >= queue.length - 1) {
      // Reshuffle and restart
      setQueue(shuffle(SCENARIOS));
      setCurrentIdx(0);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const handleFinish = () => {
    setSessionDone(true);
  };

  const handleRestart = () => {
    setQueue(shuffle(SCENARIOS));
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setStats({ correct: 0, total: 0 });
    setSessionDone(false);
  };

  // Session summary
  if (sessionDone) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-9 h-9 text-brand-500" />
          </div>

          <h2 className="text-[28px] font-bold text-white mb-2">Sessão Encerrada</h2>
          <p className="text-[42px] font-bold text-brand-500 mb-1">{pct}%</p>
          <p className="text-[14px] text-white/40 mb-8">{stats.correct} de {stats.total} decisões corretas</p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/60 font-medium hover:bg-white/[0.06] transition-all">
              <RotateCcw className="w-4 h-4" /> Nova sessão
            </button>
            <button onClick={() => router.push("/elite/pratica")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-[13px] font-bold text-white transition-all hover:brightness-110">
              Voltar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-white/30">Acertos:</span>
            <span className="text-[13px] text-white/70 font-bold font-mono">{stats.correct}/{stats.total}</span>
          </div>
          <button onClick={handleFinish} className="text-[12px] text-white/25 hover:text-white/50 transition-colors">
            Encerrar
          </button>
        </div>
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-3">
        <Shuffle className="w-4 h-4 text-brand-500/50" />
        <span className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">Treino Livre</span>
        <span className="text-[11px] text-white/20">·</span>
        <span className="text-[11px] text-white/25">{scenario.category}</span>
      </div>

      {/* Question */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-7">
        <h3 className="text-[18px] font-bold text-white mb-3">{scenario.title}</h3>
        <p className="text-[13px] text-white/45 leading-relaxed">{scenario.context}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {scenario.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === scenario.correct;
          let borderColor = "border-white/[0.06]";
          let bg = "bg-[#0e0e10]";
          let textColor = "text-white/60";

          if (answered) {
            if (isCorrect) {
              borderColor = "border-green-500/40";
              bg = "bg-green-500/[0.06]";
              textColor = "text-green-400";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-red-500/40";
              bg = "bg-red-500/[0.06]";
              textColor = "text-red-400";
            } else {
              textColor = "text-white/20";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
              className={`w-full text-left px-5 py-4 rounded-xl border ${borderColor} ${bg} ${textColor} transition-all duration-200 ${
                !answered ? "hover:border-white/[0.15] hover:bg-white/[0.02] cursor-pointer" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  answered && isCorrect ? "border-green-500 bg-green-500/20" :
                  answered && isSelected && !isCorrect ? "border-red-500 bg-red-500/20" :
                  isSelected ? "border-white/40" : "border-white/[0.10]"
                }`}>
                  {answered && isCorrect && <Check className="w-3 h-3 text-green-400" />}
                  {answered && isSelected && !isCorrect && <X className="w-3 h-3 text-red-400" />}
                </div>
                <span className="text-[13px] leading-relaxed">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#141417] p-6">
          <p className="text-[12px] text-white/30 uppercase tracking-wider font-semibold mb-2">Explicação</p>
          <p className="text-[13px] text-white/50 leading-relaxed">{scenario.explanation}</p>

          <button onClick={handleNext} className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-[13px] font-bold text-white transition-all hover:brightness-110">
            Próxima <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
