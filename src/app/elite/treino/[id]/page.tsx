"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X, Target, RotateCcw, Trophy } from "lucide-react";
import { LessonChart, type ChartScenario } from "@/components/elite/LessonChart";

const STEP_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

/** Shuffle options and return new correct index. Eliminates position bias. */
function shuffleOptions(options: string[], correctIdx: number): { options: string[]; correct: number } {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    options: order.map((i) => options[i]),
    correct: order.indexOf(correctIdx),
  };
}

/* ────────────────────────────────────────────
   Treino Step — cada step tem gráfico + pergunta
   ──────────────────────────────────────────── */

interface TreinoStep {
  chart: ChartScenario;
  title: string;
  context: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface TreinoData {
  id: string;
  title: string;
  module: string;
  moduleColor: string;
  steps: TreinoStep[];
}

/* ────────────────────────────────────────────
   Treino Scenarios — gráfico real + perguntas
   ──────────────────────────────────────────── */

const TREINO_DATA: Record<string, TreinoData> = {
  "t-candles": {
    id: "t-candles", title: "Leitura de Candle", module: "Base", moduleColor: "#FF5500",
    steps: [
      { chart: "candle-anatomy", title: "Anatomia do Candle", context: "No gráfico, o candle destacado tem corpo pequeno e pavios longos nos dois lados. O que esse formato indica?", options: ["Sinal de compra forte — pavios longos indicam demanda reprimida saindo", "Indecisão — pavios dos dois lados mostram batalha sem vencedor claro", "Sinal de venda — corpo pequeno marca topo do movimento bullish", "Padrão sem significado — candle aleatório sem informação operacional"], correct: 1, explanation: "Candles com corpo pequeno e pavios longos (dojis) mostram que o preço testou altos e baixos mas fechou perto de onde abriu. Em zonas de decisão (OB, FVG), pode preceder um movimento forte." },
      { chart: "amd-sweep", title: "Sequência de candles", context: "No gráfico, na fase 'A' os candles são pequenos e o range é apertado. Na fase 'M' os candles viram grandes e bearish. O que essa mudança no tamanho dos candles indica?", options: ["Variação aleatória — tamanho de candle não carrega informação estrutural", "Mudança de momentum — corpos grandes mostram institucionais entrando com força", "Sinal de exaustão — candles grandes em sequência sempre revertem rapidamente", "Precisa de indicadores — price action sozinho não define mudança de momentum"], correct: 1, explanation: "Candles com corpos grandes mostram convicção. Na transição de Acumulação pra Manipulação, os institucionais saem da sombra e movem o preço com força. A mudança de candles pequenos pra grandes é o sinal de que algo está acontecendo." },
      { chart: "entry-setup", title: "Candle de rejeição na zona", context: "Na zona de entrada marcada, apareceu um candle com pavio inferior longo e corpo fechando na metade superior. O que esse formato confirma?", options: ["Formação sem peso — pavios em zonas de entrada não adicionam validação estrutural", "Rejeição bullish — compradores defenderam o nível, zona de demanda sendo respeitada", "Continuação bearish — pavio longo indica teste antes da continuação vendedora", "Aguarda 5 candles — confirmação exige múltiplos candles na mesma direção"], correct: 1, explanation: "Candle com pavio inferior longo em zona de demanda (OB) mostra que os compradores defenderam o nível. O corpo fechando na metade superior confirma a pressão compradora. É um dos melhores sinais de entrada." },
    ],
  },
  "t-risco": {
    id: "t-risco", title: "Calcule o Risco", module: "Base", moduleColor: "#FF5500",
    steps: [
      { chart: "risk-shield", title: "Stop baseado na estrutura", context: "No gráfico, você vai entrar comprado na zona marcada como entrada. Onde colocar o stop?", options: ["Logo acima da entrada — stop apertado maximiza RR em trade bullish", "Abaixo da zona de demanda inteira — invalidação clara se o setup falhar", "Em número redondo como 18.000 — níveis psicológicos seguram o preço consistentemente", "No meio da zona de demanda — equilíbrio entre proteção e espaço pra volatilidade"], correct: 1, explanation: "O stop deve ficar abaixo da zona que invalida o setup. Se o preço passar por toda a zona de demanda, significa que os compradores perderam — não faz sentido manter a posição." },
      { chart: "entry-setup", title: "Risk-Reward", context: "Entrada e alvo marcados no gráfico. Distância até o stop: 20 pontos. Distância até o alvo: 60 pontos acima da entrada. Qual é o RR?", options: ["1:1 — risco e alvo proporcionais", "1:2 — alvo dobra o risco", "1:3 — alvo triplica o risco com 60/20", "1:4 — alvo quadruplica o risco"], correct: 2, explanation: "RR = Alvo / Risco = 60 / 20 = 3. Um RR de 1:3 significa que pra cada $1 arriscado, o potencial é de $3. Regra do URA: mínimo 1.5R, ideal 2-3R." },
    ],
  },
  "t-obs": {
    id: "t-obs", title: "Marque os Order Blocks", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "ob-bounce", title: "Identificando o Order Block", context: "No gráfico, a zona azul marcada como 'OB' foi o último candle bearish antes do impulso de alta. O preço voltou, tocou a zona e reagiu com um candle de engulfing. O que aconteceu?", options: ["Zona ignorada — preço rompeu o OB e continuou em direção contrária à tese", "OB defendido — institucionais mantiveram posição, bounce com engulfing valida a zona", "OB invalidado — retorno ao nível marca exaustão do interesse institucional", "Coincidência gráfica — movimento natural sem relação com a zona marcada"], correct: 1, explanation: "O OB marca onde os institucionais se posicionaram. Quando o preço retorna a essa zona, eles defendem a posição comprando novamente. O bounce com engulfing confirmou que a zona é válida." },
      { chart: "ob-bounce", title: "OB válido vs invalidado", context: "Mesmo gráfico: o preço tocou a zona azul e reagiu com engulfing. Cenário hipotético — se em vez disso o preço tivesse fechado abaixo da borda inferior da zona, o que significaria?", options: ["OB ainda mais forte — segunda tentativa costuma ter reação mais intensa", "OB invalidado — close abaixo da zona inteira prova que institucionais saíram", "Zona permanece válida — OBs mantêm função mesmo após close abaixo da borda", "Melhor ponto de entrada — preço mais barato oferece RR superior"], correct: 1, explanation: "Se o preço fecha abaixo da zona inteira, o OB é invalidado. Os institucionais que estavam posicionados ali já saíram ou foram stopados. Procure o próximo OB válido mais abaixo." },
      { chart: "fvg-fill", title: "OB com FVG — confluência", context: "No gráfico, a zona roxa do FVG está marcada. Cenário: imagine que um OB se sobrepõe exatamente à mesma faixa de preço. O que isso representa?", options: ["Cancelamento mútuo — zonas sobrepostas anulam o valor institucional", "Confluência dupla — OB + FVG na mesma região amplifica probabilidade de reação", "OB enfraquecido — presença do FVG compromete a zona institucional original", "Sem efeito operacional — sobreposição é coincidência sem peso adicional"], correct: 1, explanation: "Quando um OB e um FVG se sobrepõem, a zona ganha confluência dupla. São dois motivos institucionais pro preço reagir ali. Quanto mais confluência, maior a probabilidade." },
    ],
  },
  "t-fvg": {
    id: "t-fvg", title: "Identifique FVGs", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "fvg-fill", title: "O que é o FVG?", context: "No gráfico, há um candle grande de impulso e uma zona roxa marcada como 'FVG' entre o pavio do candle anterior e o pavio do candle seguinte. Por que essa zona é importante?", options: ["Sem importância — gaps em candles são formações comuns e irrelevantes", "Desequilíbrio — FVG marca ordens não preenchidas que atraem o preço de volta", "Resistência técnica — funciona apenas como barreira em testes posteriores", "Exclusivo do diário — FVGs só têm peso em timeframes acima do 4h"], correct: 1, explanation: "FVG (Fair Value Gap) é o espaço que o preço 'pulou' durante o impulso. Representa desequilíbrio — ordens institucionais não preenchidas. O preço tende a voltar pra preencher esse gap antes de continuar na direção original." },
      { chart: "fvg-fill", title: "Preenchimento do FVG", context: "No gráfico, o preço voltou, entrou na zona roxa e reagiu próximo à linha CE (50%) sem chegar no outro extremo. O FVG precisa ser 100% preenchido pra funcionar?", options: ["Sim — FVG sempre precisa ser 100% preenchido pra validar a reação", "Não — reação em CE (50%) ou no topo do FVG é frequente e válida", "Precisa preencher e passar do outro lado — apenas violação completa conta", "Aleatório — nível de preenchimento do FVG não tem padrão operacional"], correct: 1, explanation: "O FVG nem sempre preenche 100%. A linha CE (50%) marcada no gráfico é frequentemente onde o preço reage. Esperar 100% de preenchimento pode fazer você perder a entrada." },
    ],
  },
  "t-premium": {
    id: "t-premium", title: "Premium ou Discount?", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "premium-discount", title: "Identificando as zonas", context: "No gráfico, a linha do 50% está marcada e o preço está acima dela, na metade superior do range. Tendência HTF de baixa. O que fazer?", options: ["Compra — momentum bullish em premium costuma continuar acima do range", "Vende — preço em premium com viés HTF bearish é confluência pra short A+", "Aguarda preço sair do premium — equilíbrio fora da zona oferece setup melhor", "Ignora premium/discount — contexto não influencia decisão direcional"], correct: 1, explanation: "Institucionais vendem em premium e compram em discount. Se o viés é bearish e o preço está em premium, é zona ideal pra procurar venda. A confluência (premium + viés bearish) aumenta a probabilidade." },
    ],
  },
  "t-liquidez": {
    id: "t-liquidez", title: "Onde Está a Liquidez?", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "liquidity-sweep", title: "Pools de liquidez", context: "No gráfico, a zona marcada como 'Pool SSL' tem 3 fundos praticamente iguais no mesmo nível. Onde estão os stops acumulados?", options: ["No meio do range — equilíbrio concentra ordens de ambos os lados", "Abaixo da zona — sell stops de quem comprou nos fundos achando suporte", "Acima da zona — buy stops de shorts que entraram no breakdown formam cluster", "Stops não se acumulam em zonas previsíveis — distribuição é aleatória"], correct: 1, explanation: "Equal lows formam pool de sell-side liquidity (SSL). Cada fundo igual adiciona mais stops logo abaixo — retail compra no 'suporte' e coloca stop pouco abaixo. Os institucionais vão buscar essa liquidez antes de reverter." },
      { chart: "liquidity-sweep", title: "Sweep de liquidez", context: "No gráfico, apareceu um spike rápido que perfurou os 3 fundos iguais e voltou no mesmo candle. O que esse movimento confirma?", options: ["Mercado bearish — perfuração dos fundos confirma continuação vendedora", "Sweep — institucionais pegaram stops e agora têm liquidez pra comprar, movimento real bullish", "Movimento sem significado — spike e retorno é ruído estatístico normal", "Sinal pra vender — candle grande pra baixo marca entrada short ideal"], correct: 1, explanation: "O sweep varrendo os lows pega todos os sell stops acumulados. Esses sell stops são ordens de venda que dão liquidez pros institucionais comprarem. Após o sweep, o movimento real (oposto ao spike) começa." },
    ],
  },
  "t-sessoes": {
    id: "t-sessoes", title: "Qual Sessão Operar?", module: "Estratégia", moduleColor: "#A855F7",
    steps: [
      { chart: "session-asia", title: "Range da Ásia", context: "No gráfico, a área marcada mostra o preço lateralizando sem direção durante a sessão asiática. O que esperar na abertura de NY?", options: ["Irrelevante — range da Ásia é apenas pausa sem peso pras sessões posteriores", "Range define liquidez — NY varre um lado antes de ir na direção oposta", "Continuação garantida — NY sempre segue a direção que Ásia deixou marcada", "Ásia define direção do dia — movimentos posteriores apenas confirmam o viés"], correct: 1, explanation: "O range da Ásia acumula liquidez nos dois extremos. Na abertura de NY, o preço frequentemente varre um lado (sweep da liquidez asiática) antes de fazer o movimento real na direção oposta. É o Judas Swing clássico." },
      { chart: "session-asia", title: "Judas de Londres", context: "No gráfico, Londres abriu, fez um spike acima do Asia High, depois reverteu forte pra baixo, e NY deu continuidade na queda. Quando entrar?", options: ["Entra no spike — momentum forte do rompimento oferece setup bullish imediato", "Espera reversão — após sweep do Asia High, entra short quando NY confirmar a direção real", "Evita o Judas — padrão é errático e não gera setup operacional confiável", "Entra antes do spike — antecipação do movimento captura melhor preço médio"], correct: 1, explanation: "Judas Swing é o movimento falso na abertura. NUNCA entre a favor do Judas. Espere ele varrer a liquidez (no gráfico: sweep do Asia High pela sessão Londres), reverter, e entre na direção oposta com confirmação. O movimento real é o que NY distribuiu depois." },
    ],
  },
  "t-amd": {
    id: "t-amd", title: "Leitura AMD Completa", module: "Estratégia", moduleColor: "#A855F7",
    steps: [
      { chart: "amd-sweep", title: "Fase A — Acumulação", context: "Fase roxa 'ACUMULAÇÃO' marcada com o número 1 no gráfico. Range entre 18.120 e 18.085, candles pequenos, preço sem direção. O que fazer aqui?", options: ["Compra no topo do range — rompimento bullish é iminente após acumulação", "Vende no fundo do range — institucional vai derrubar após acumular posição short", "Não opera — é acumulação, institucionais montam posição, espera a manipulação", "Fecha a tela — sem movimento é sem oportunidade operacional no dia"], correct: 2, explanation: "Acumulação é a fase mais perigosa pra operar. O preço vai e volta sem direção. Os institucionais estão acumulando posição sem mover o preço. A liquidez está se acumulando nos extremos do range. Espere." },
      { chart: "amd-sweep", title: "Fase M — Manipulação", context: "Fase vermelha marcada com o número 2 no gráfico. O preço acabou de perfurar 18.085 com spike forte e candles de corpo grande pra baixo. O que aconteceu?", options: ["Breakout bearish — perfuração do fundo com corpo grande confirma continuação", "Manipulação — sweep dos sell stops pra pegar liquidez, espera reversão bullish", "Range quebrou definitivamente — ambiente bearish estabelecido pra resto da sessão", "Oportunidade short — aumenta lote aproveitando momentum vendedor forte"], correct: 1, explanation: "O spike que varre o fundo do range é a Manipulação. Os institucionais pegaram os sell stops e agora têm a liquidez pra montar posição comprada. A reversão começa na transição pra fase verde (Distribuição)." },
      { chart: "amd-sweep", title: "Fase D — Distribuição", context: "Fase verde marcada com o número 3 no gráfico. Depois do spike pra baixo, o preço inverteu forte e está subindo com candles grandes em direção ao nível 'TP (BSL)'. Onde era a entrada ideal?", options: ["No topo do range quando rompeu — breakout bullish inicial com momentum confirmado", "Na virada M→D — entrada no OB do spike, stop abaixo do low, alvo no TP (BSL)", "Agora no pullback — preço em continuação oferece entry tardio mas ainda válido", "Sem como saber — setup só fica claro após movimento completar, foi sorte"], correct: 1, explanation: "A entrada ideal é na transição entre as fases: quando a Manipulação termina e a Distribuição começa. O último candle bearish do spike forma o OB; stop abaixo do low do spike. Alvo: 'TP (BSL)' marcado no gráfico — o setup AMD completo." },
    ],
  },
  "t-bias": {
    id: "t-bias", title: "Monte o Viés do Dia", module: "Estratégia", moduleColor: "#A855F7",
    steps: [
      { chart: "premium-discount", title: "Análise Premium/Discount", context: "Swing High em 18.500, Swing Low em 18.000, linha do 50% em 18.250. O preço acabou de subir e está no número 3 do gráfico. HTF de alta. O que fazer?", options: ["Compra agora — viés HTF bullish valida qualquer entrada a favor da tendência", "Espera retorno ao discount — preço abaixo de 18.250 é zona ideal pra long a favor do HTF", "Vende em premium — metade superior do range é zona de reversão institucional", "Premium/Discount é irrelevante — HTF bullish sozinho justifica entrada"], correct: 1, explanation: "Viés bullish + preço em premium = zona cara pra comprar. O institucional compra em discount, não em premium. Mesmo com viés correto, espere o preço voltar pra zona verde (discount) pra entrar com melhor preço e RR." },
      { chart: "judas-swing", title: "Judas confirma o viés", context: "No gráfico, o DAILY BIAS é bullish e a fase verde está marcada no início. Na abertura de NY, o preço fez um spike pra BAIXO varrendo o Judas Low (fase vermelha) e depois reverteu forte pra cima. O que isso confirma?", options: ["Judas a favor do viés — movimento inicial confirma a direção bullish do dia", "Judas vai oposto — bearish + viés bullish é confirmação, movimento real é bullish", "Judas cancelou o viés — sweep bearish invalida a tese bullish do dia", "Judas é ruído — spike de abertura não confirma nem invalida viés"], correct: 1, explanation: "O Judas Swing sempre vai na direção oposta ao viés do dia. Se o viés é bullish e o Judas é bearish (varre os lows), é confirmação perfeita. O spike pegou a liquidez abaixo e agora os institucionais vão comprar. O movimento real (bullish) começa — fase verde no gráfico." },
    ],
  },
  "t-entrada": {
    id: "t-entrada", title: "Execute o Trade", module: "Execução", moduleColor: "#10B981",
    steps: [
      { chart: "entry-setup", title: "Confirmação de entrada", context: "No gráfico, o preço chegou na zona marcada e formou um candle com pavio inferior longo. Onde é a entrada e onde é o stop?", options: ["Entry no topo do pavio, stop no meio da zona — RR apertado mas execução rápida", "Entry após o candle de rejeição fechar, stop abaixo da zona de demanda inteira", "Entry imediato no pavio sem esperar confirmação — cada tick de espera custa RR", "Entry após fechamento, stop no meio do pavio do candle de rejeição"], correct: 1, explanation: "Espere o candle de rejeição FECHAR — confirma que os compradores estão defendendo. Entrada após o fechamento. Stop abaixo de toda a zona de demanda. Se o preço passa pela zona toda, o setup falhou." },
      { chart: "entry-setup", title: "Gestão do trade", context: "Alvo marcado no gráfico. O trade está andando a favor e o preço chegou em 1.5R de lucro. O que fazer?", options: ["Fecha tudo — garantir 1.5R é melhor que arriscar devolver o lucro acumulado", "Parcial 50% e move stop pro BE — garante lucro e mantém upside até o alvo", "Mantém posição intacta — alterar o plano em andamento compromete a execução", "Aumenta a posição — trade no lucro confirma convicção e merece exposure maior"], correct: 1, explanation: "Em 1.5R: realiza parcial (50%), protege o restante movendo stop pro breakeven. Assim você garante lucro e dá chance do trade ir até 2R ou 3R com risco zero. Nunca aumente posição em trade aberto." },
      { chart: "amd-sweep", title: "Setup completo AMD", context: "No gráfico: fases 1, 2 e 3 marcadas, com o nível 'TP (BSL)' em 18.250. Entrada na virada entre as fases 2 e 3 em ~18.000, stop em 17.980 (20 pontos abaixo do low do spike), alvo no TP (BSL). Qual o RR aproximado?", options: ["1:1 — distâncias equivalentes de risco e alvo", "1:2 — alvo é o dobro do risco do stop", "1:5+ — stop 20 pontos vs alvo ~250 pontos dá RR extremo na virada M→D", "Impossível calcular — setup AMD exige indicadores adicionais pra RR preciso"], correct: 2, explanation: "Setup AMD: entrada na reversão (~18.000, início da fase verde), stop abaixo do low do sweep (~17.980, ~20 pontos de risco), alvo no 'TP (BSL)' em 18.250 (~250 pontos). RR ≈ 1:12. Mesmo com stop mais largo e parciais, o RR passa fácil de 1:5. É o setup com melhor RR do SMC." },
    ],
  },
};

/* ────────────────────────────────────────────
   Treino Page — Gráfico + Perguntas
   ──────────────────────────────────────────── */

export default function TreinoPage() {
  const router = useRouter();
  const params = useParams();
  const treinoId = params.id as string;

  const treino = TREINO_DATA[treinoId];

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (!treino) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-[16px] text-white/40 mb-4">Treino não encontrado.</p>
        <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-brand-500 hover:text-brand-400 transition-colors">
          Voltar pra Prática
        </button>
      </div>
    );
  }

  const step = treino.steps[currentStep];
  const isLast = currentStep === treino.steps.length - 1;
  const allDone = currentStep >= treino.steps.length;

  // Shuffle options per step — prevents position bias.
  const shuffled = useMemo(
    () => step ? shuffleOptions(step.options, step.correct) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treinoId, currentStep]
  );

  const handleAnswer = (idx: number) => {
    if (answered || !shuffled) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    setScore(prev => ({
      correct: prev.correct + (idx === shuffled.correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (isLast) {
      setCurrentStep(treino.steps.length);
    } else {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore({ correct: 0, total: 0 });
  };

  // Results screen
  if (allDone) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${treino.moduleColor}40, transparent)` }} />

          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: pct >= 70 ? "#10B98115" : "#EF444415" }}>
            {pct >= 70 ? <Trophy className="w-9 h-9 text-green-400" /> : <RotateCcw className="w-9 h-9 text-red-400" />}
          </div>

          <h2 className="text-[28px] font-bold text-white mb-2">{pct >= 70 ? "Aprovado!" : "Tente novamente"}</h2>
          <p className="text-[42px] font-bold mb-1" style={{ color: pct >= 70 ? "#10B981" : "#EF4444" }}>{pct}%</p>
          <p className="text-[14px] text-white/40 mb-8">{score.correct} de {score.total} decisões corretas</p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart} className="interactive-tap flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/60 font-medium hover:bg-white/[0.06] transition-all">
              <RotateCcw className="w-4 h-4" /> Refazer
            </button>
            <button onClick={() => router.push("/elite/pratica")} className="interactive-tap flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white transition-all" style={{ backgroundColor: treino.moduleColor }}>
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header + progress — full width */}
      <div className="animate-in-up space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-white/30">{treino.title}</span>
            <span className="text-[11px] text-white/20 font-mono">{currentStep + 1}/{treino.steps.length}</span>
          </div>
        </div>

        <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / treino.steps.length) * 100}%`, backgroundColor: treino.moduleColor }} />
        </div>
      </div>

      {/* Split: gráfico à esquerda · pergunta + opções à direita (lg+) */}
      <div className="animate-in-up delay-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">
        {/* LEFT — Chart */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`chart-${currentStep}`} {...STEP_TRANSITION} className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <LessonChart scenario={step.chart} />
          </motion.div>
        </AnimatePresence>

        {/* RIGHT — pergunta + opções + explicação (sticky no desktop) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`qa-${currentStep}`}
            {...STEP_TRANSITION}
            transition={{ ...STEP_TRANSITION.transition, delay: 0.04 }}
            className="lg:sticky lg:top-4 space-y-3 self-start"
          >
          <div className="rounded-xl bg-white/[0.02] p-5 min-h-[140px]">
            <h3 className="text-[16px] font-bold text-white mb-2 leading-tight">{step.title}</h3>
            <p className="text-[12.5px] text-white/50 leading-relaxed">{step.context}</p>
          </div>

          <div className="space-y-2">
            {(shuffled?.options ?? step.options).map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === (shuffled?.correct ?? step.correct);
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
                  className={`interactive-tap w-full text-left px-4 py-3 rounded-lg border ${borderColor} ${bg} ${textColor} ${
                    !answered ? "hover:border-white/[0.15] hover:bg-white/[0.02] cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      answered && isCorrect ? "border-green-500 bg-green-500/20" :
                      answered && isSelected && !isCorrect ? "border-red-500 bg-red-500/20" :
                      isSelected ? "border-white/40" : "border-white/[0.10]"
                    }`}>
                      {answered && isCorrect && <Check className="w-2.5 h-2.5 text-green-400" />}
                      {answered && isSelected && !isCorrect && <X className="w-2.5 h-2.5 text-red-400" />}
                    </div>
                    <span className="text-[12.5px] leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl bg-white/[0.02] p-4"
            >
              <p className="text-[10.5px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">Explicação</p>
              <p className="text-[12px] text-white/55 leading-relaxed">{step.explanation}</p>

              <button onClick={handleNext} className="interactive-tap mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-bold text-white hover:brightness-110" style={{ backgroundColor: treino.moduleColor }}>
                {isLast ? "Ver resultado" : "Próxima"} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
