"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, X, Target, RotateCcw, Trophy } from "lucide-react";
import { LessonChart, type ChartScenario } from "@/components/elite/LessonChart";

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
      { chart: "candle-anatomy", title: "Anatomia do Candle", context: "Observe o gráfico acima. Há candles com corpos grandes e outros com pavios longos. O candle destacado tem corpo pequeno e pavios longos dos dois lados. O que isso indica?", options: ["Sinal de compra forte — compradores dominando", "Indecisão — compradores e vendedores brigando sem vencedor claro", "Sinal de venda — o preço vai cair", "Esse candle não tem significado"], correct: 1, explanation: "Candles com corpo pequeno e pavios longos (dojis) mostram que o preço testou altos e baixos mas fechou perto de onde abriu. Em zonas de decisão (OB, FVG), pode preceder um movimento forte." },
      { chart: "amd-sweep", title: "Sequência de candles", context: "No gráfico, observe a fase marcada com 'A' (Acumulação). Os candles têm corpos pequenos e range apertado. Depois vem a fase 'M' com candles de corpo grande bearish. O que a mudança no tamanho dos candles indica?", options: ["Nada — tamanho de candle é aleatório", "Os candles grandes mostram que os institucionais entraram com força — o momentum mudou", "Candles grandes são sempre fake — vai reverter", "Preciso ver indicadores pra decidir"], correct: 1, explanation: "Candles com corpos grandes mostram convicção. Na transição de Acumulação pra Manipulação, os institucionais saem da sombra e movem o preço com força. A mudança de candles pequenos pra grandes é o sinal de que algo está acontecendo." },
      { chart: "entry-setup", title: "Candle de rejeição na zona", context: "Observe o gráfico na zona de entrada marcada. O candle tem pavio inferior longo e corpo fechando na metade superior. O que esse candle de rejeição confirma?", options: ["Nada — é só um candle", "Os compradores rejeitaram o nível inferior — confirmação de que a zona de demanda está sendo defendida", "O preço vai continuar caindo", "Preciso esperar mais 5 candles pra decidir"], correct: 1, explanation: "Candle com pavio inferior longo em zona de demanda (OB) mostra que os compradores defenderam o nível. O corpo fechando na metade superior confirma a pressão compradora. É um dos melhores sinais de entrada." },
    ],
  },
  "t-risco": {
    id: "t-risco", title: "Calcule o Risco", module: "Base", moduleColor: "#FF5500",
    steps: [
      { chart: "risk-shield", title: "Stop baseado na estrutura", context: "No gráfico acima, observe as zonas marcadas. Se você vai entrar comprado na zona de entrada, onde deve colocar o stop?", options: ["Logo acima da entrada — stop apertado", "Abaixo da zona inteira de demanda — se o preço passar por tudo, o setup é invalidado", "Em um número redondo como 18.000", "No meio da zona de demanda"], correct: 1, explanation: "O stop deve ficar abaixo da zona que invalida o setup. Se o preço passar por toda a zona de demanda, significa que os compradores perderam — não faz sentido manter a posição." },
      { chart: "entry-setup", title: "Risk-Reward", context: "Observe a entrada e o alvo no gráfico. Se o risco (distância até o stop) é de 20 pontos, e o alvo está 60 pontos acima da entrada, qual é o RR?", options: ["1:1", "1:2", "1:3 — 3x o risco de retorno", "1:4"], correct: 2, explanation: "RR = Alvo / Risco = 60 / 20 = 3. Um RR de 1:3 significa que pra cada $1 arriscado, o potencial é de $3. Regra do URA: mínimo 1.5R, ideal 2-3R." },
    ],
  },
  "t-obs": {
    id: "t-obs", title: "Marque os Order Blocks", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "ob-bounce", title: "Identificando o Order Block", context: "No gráfico, observe a zona azul marcada como 'OB'. É o último candle bearish antes do impulso de alta. O preço voltou e tocou essa zona. O que aconteceu?", options: ["O preço ignorou a zona e continuou caindo", "O preço reagiu no OB com um bounce forte — os institucionais defenderam a posição deles", "O OB foi invalidado", "Nada relevante — o preço estava caindo e subiu por acaso"], correct: 1, explanation: "O OB marca onde os institucionais se posicionaram. Quando o preço retorna a essa zona, eles defendem a posição comprando novamente. O bounce com engulfing confirmou que a zona é válida." },
      { chart: "ob-bounce", title: "OB válido vs invalidado", context: "Observe: o preço tocou o OB entre as linhas azuis e reagiu. Se o preço tivesse fechado abaixo da linha 'OB Low', o que significaria?", options: ["O OB seria ainda mais forte", "O OB estaria invalidado — o preço passou por toda a zona, os institucionais desistiram", "Nada, OBs são sempre válidos", "Deveria comprar ainda mais barato"], correct: 1, explanation: "Se o preço fecha abaixo do OB inteiro, ele é invalidado. Os institucionais que estavam posicionados ali já saíram ou foram stopados. Procure o próximo OB válido mais abaixo." },
      { chart: "fvg-fill", title: "OB com FVG — confluência", context: "No gráfico, observe a zona do FVG (Fair Value Gap) marcada em azul. Se houvesse um OB na mesma zona, o que isso significaria?", options: ["As zonas se cancelam", "Confluência — OB + FVG na mesma região aumenta significativamente a probabilidade de reação", "FVG dentro do OB enfraquece a zona", "Não importa se estão juntos"], correct: 1, explanation: "Quando um OB e um FVG se sobrepõem, a zona ganha confluência dupla. São dois motivos institucionais pro preço reagir ali. Quanto mais confluência, maior a probabilidade." },
    ],
  },
  "t-fvg": {
    id: "t-fvg", title: "Identifique FVGs", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "fvg-fill", title: "O que é o FVG?", context: "No gráfico, observe o candle de impulso grande e a zona azul marcada como 'FVG'. O gap é entre o pavio do candle anterior e o pavio do candle seguinte ao impulso. Por que essa zona é importante?", options: ["Não é importante — gaps são normais", "O FVG representa desequilíbrio — ordens não preenchidas que atraem o preço de volta", "É uma zona de resistência apenas", "FVGs só existem no diário"], correct: 1, explanation: "FVG (Fair Value Gap) é o espaço que o preço 'pulou' durante o impulso. Representa desequilíbrio — ordens institucionais não preenchidas. O preço tende a voltar pra preencher esse gap antes de continuar na direção original." },
      { chart: "fvg-fill", title: "Preenchimento do FVG", context: "No gráfico, o preço voltou e entrou na zona do FVG. Observe o candle que toca a zona e reage. O FVG precisa ser 100% preenchido?", options: ["Sim — sempre preenche 100%", "Não — muitas vezes reage em 50% (Consequent Encroachment) ou até no topo do FVG", "Precisa preencher e passar do outro lado", "O preenchimento é aleatório"], correct: 1, explanation: "O FVG nem sempre preenche 100%. O ponto de 50% (Consequent Encroachment) é frequentemente onde o preço reage. Esperar 100% de preenchimento pode fazer você perder a entrada. Observe a reação no início do FVG." },
    ],
  },
  "t-premium": {
    id: "t-premium", title: "Premium ou Discount?", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "premium-discount", title: "Identificando as zonas", context: "No gráfico, observe a linha de equilíbrio (50% Fibonacci) marcada. Tudo acima é premium, tudo abaixo é discount. O preço está na zona de premium. O viés é bearish. O que fazer?", options: ["Comprar — o preço está alto, pode subir mais", "Vender — preço em premium + viés bearish = confluência pra short", "Esperar sair de premium", "Premium não importa pra decisão"], correct: 1, explanation: "Institucionais vendem em premium e compram em discount. Se o viés é bearish e o preço está em premium, é zona ideal pra procurar venda. A confluência (premium + viés bearish) aumenta a probabilidade." },
    ],
  },
  "t-liquidez": {
    id: "t-liquidez", title: "Onde Está a Liquidez?", module: "Leitura SMC", moduleColor: "#3B82F6",
    steps: [
      { chart: "liquidity-sweep", title: "Pools de liquidez", context: "No gráfico, observe os topos iguais (equal highs) e fundos iguais (equal lows) marcados. Onde estão os stop losses acumulados?", options: ["No meio do range", "Acima dos equal highs (buy stops) e abaixo dos equal lows (sell stops)", "Só acima dos highs", "Stops não se acumulam em zonas previsíveis"], correct: 1, explanation: "Equal highs e equal lows são pools de liquidez. Acima dos highs: buy stops de quem está short. Abaixo dos lows: sell stops de quem está long. Os institucionais vão buscar essa liquidez antes de reverter." },
      { chart: "liquidity-sweep", title: "Sweep de liquidez", context: "Observe o spike que varre os lows no gráfico. O preço desceu rápido, pegou os sell stops e voltou. O que isso confirma?", options: ["O mercado é bearish — continuou caindo", "Sweep de liquidez — os institucionais pegaram os stops e agora têm liquidez pra comprar. O movimento real é bullish", "O sweep não tem significado", "Devo vender porque caiu forte"], correct: 1, explanation: "O sweep varrendo os lows pega todos os sell stops acumulados. Esses sell stops são ordens de venda que dão liquidez pros institucionais comprarem. Após o sweep, o movimento real (oposto ao spike) começa." },
    ],
  },
  "t-sessoes": {
    id: "t-sessoes", title: "Qual Sessão Operar?", module: "Estratégia", moduleColor: "#A855F7",
    steps: [
      { chart: "session-asia", title: "Range da Ásia", context: "No gráfico, observe o range formado durante a sessão asiática (área marcada). O preço ficou lateralizado sem direção. O que esperar quando NY abrir?", options: ["Nada — o range da Ásia não importa", "O range da Ásia define a liquidez. NY vai varrer um lado do range antes de ir na direção oposta", "NY sempre continua na mesma direção da Ásia", "A Ásia define a direção do dia"], correct: 1, explanation: "O range da Ásia acumula liquidez nos dois extremos. Na abertura de NY, o preço frequentemente varre um lado (sweep da liquidez asiática) antes de fazer o movimento real na direção oposta. É o Judas Swing clássico." },
      { chart: "judas-swing", title: "Judas Swing", context: "No gráfico, observe o spike na abertura de NY que varre os highs da Ásia e depois reverte forte. Esse é o Judas Swing. Quando você deveria entrar?", options: ["Compro no spike — está subindo forte", "Espero o spike terminar, o preço voltar pra dentro do range, e entro na direção oposta (venda)", "Não opero no Judas Swing — é arriscado demais", "Entro assim que NY abre, antes do spike"], correct: 1, explanation: "O Judas Swing é o movimento falso na abertura. NUNCA entre a favor do Judas. Espere ele varrer a liquidez, reverter, e entre na direção oposta com confirmação (candle de rejeição, OB, etc). O movimento real começa após o Judas." },
    ],
  },
  "t-amd": {
    id: "t-amd", title: "Leitura AMD Completa", module: "Estratégia", moduleColor: "#A855F7",
    steps: [
      { chart: "amd-sweep", title: "Fase A — Acumulação", context: "No gráfico, observe a fase marcada com 'A'. Range apertado, sem direção clara, candles pequenos. O que está acontecendo e o que você deveria fazer?", options: ["Comprar no topo do range", "Vender no fundo do range", "NÃO operar — é acumulação. Os institucionais estão montando posição silenciosamente. Espere a manipulação", "O mercado está morto hoje — fechar a tela"], correct: 2, explanation: "Acumulação é a fase mais perigosa pra operar. O preço vai e volta sem direção. Os institucionais estão acumulando posição sem mover o preço. A liquidez está se acumulando nos extremos do range. Espere." },
      { chart: "amd-sweep", title: "Fase M — Manipulação", context: "No gráfico, observe a fase 'M'. O preço fez um spike bearish forte varrendo os lows do range. Candles de corpo grande pra baixo. O que está acontecendo?", options: ["O mercado é bearish — vendo aqui", "Manipulação — os institucionais varreram os sell stops abaixo do range pra pegar liquidez. Espero a reversão", "O range quebrou — é breakout bearish", "Aumento meu lote short porque é forte"], correct: 1, explanation: "O spike que varre o fundo do range é a Manipulação. Os institucionais pegaram os sell stops e agora têm a liquidez pra montar posição comprada. Observe o marcador 'Reversão' no gráfico — é onde o preço reverte." },
      { chart: "amd-sweep", title: "Fase D — Distribuição", context: "Observe a fase 'D' no gráfico. Após a manipulação bearish e a reversão, o preço sobe forte com candles de corpo grande passando acima do range original. Onde era a entrada ideal?", options: ["No topo do range, quando rompeu", "Na reversão após o sweep (marcador 'Reversão') — entrada no OB formado na manipulação com stop abaixo do spike", "Compro agora que está subindo", "Não havia como saber — foi sorte"], correct: 1, explanation: "A entrada ideal é no ponto de reversão após a manipulação. O OB formado no spike (último candle bearish antes da reversão) é a zona de entrada. Stop abaixo do low do spike. Alvo: extensão acima do range (veja 'TP (BSL)' no gráfico). Esse é o setup AMD completo." },
    ],
  },
  "t-bias": {
    id: "t-bias", title: "Monte o Viés do Dia", module: "Estratégia", moduleColor: "#A855F7",
    steps: [
      { chart: "premium-discount", title: "Análise Premium/Discount", context: "No gráfico, o preço está na zona de discount (abaixo do equilíbrio 50%). A tendência no HTF é bullish. Qual é o viés?", options: ["Bearish — o preço está caindo", "Bullish — preço em discount + tendência HTF bullish = procure compras", "Neutro — espere sair de discount", "O viés não depende de premium/discount"], correct: 1, explanation: "Preço em discount + tendência bullish no HTF = viés bullish forte. É a melhor zona pra comprar — você está comprando 'barato' a favor da tendência. O viés do dia guia todas as suas decisões: só procure setups de compra." },
      { chart: "judas-swing", title: "Judas confirma o viés", context: "O viés é bearish. Na abertura de NY, o preço fez um spike pra cima (Judas Swing bullish) e agora está revertendo. O Judas foi a favor ou contra o viés?", options: ["A favor — o Judas foi bullish, viés é bearish, são opostos", "Contra — o Judas sempre vai na mesma direção do viés", "O Judas sempre vai na direção OPOSTA ao viés. Judas bullish + viés bearish = confirmação. O movimento real é bearish", "O Judas não confirma nada"], correct: 2, explanation: "O Judas Swing vai na direção oposta ao viés do dia. Se o viés é bearish e o Judas é bullish (varre os highs), é confirmação perfeita. O spike pegou a liquidez acima e agora os institucionais vão vender. O movimento real (bearish) começa." },
    ],
  },
  "t-entrada": {
    id: "t-entrada", title: "Execute o Trade", module: "Execução", moduleColor: "#10B981",
    steps: [
      { chart: "entry-setup", title: "Confirmação de entrada", context: "No gráfico, o preço chegou na zona de entrada marcada. Observe o candle de rejeição (pavio longo). Onde é a entrada e onde é o stop?", options: ["Entrada no topo do pavio, stop no meio da zona", "Entrada após o candle de rejeição fechar, stop abaixo da zona de demanda inteira", "Entrada agora sem esperar confirmação", "Stop no pavio do candle de rejeição"], correct: 1, explanation: "Espere o candle de rejeição FECHAR — confirma que os compradores estão defendendo. Entrada após o fechamento. Stop abaixo de toda a zona de demanda. Se o preço passa pela zona toda, o setup falhou." },
      { chart: "entry-setup", title: "Gestão do trade", context: "Observe o alvo marcado no gráfico. O trade está andando a seu favor. O preço chegou em 1.5R de lucro. O que você faz?", options: ["Fecho tudo — lucro é lucro", "Parcial de 50%, movo stop pro breakeven, deixo o resto correr até o alvo", "Não faço nada — espero bater o alvo full", "Aumento a posição porque está dando certo"], correct: 1, explanation: "Em 1.5R: realiza parcial (50%), protege o restante movendo stop pro breakeven. Assim você garante lucro e dá chance do trade ir até 2R ou 3R com risco zero. Nunca aumente posição em trade aberto." },
      { chart: "amd-sweep", title: "Setup completo AMD", context: "Observe todo o gráfico. Identifique: onde foi a Acumulação, onde foi a Manipulação, onde seria a entrada ideal, e onde está o alvo (TP BSL). Qual o RR aproximado desse trade?", options: ["1:1 — risco e alvo iguais", "1:2 — alvo é o dobro do risco", "1:5+ — entrada na reversão pós-manipulation com stop curto e alvo no BSL dá RR extremo", "Impossível calcular sem indicadores"], correct: 2, explanation: "No setup AMD: entrada na reversão (OB do sweep, ~17.992), stop abaixo do low (~17.980, 12 pontos de risco), alvo no BSL (~18.250, 258 pontos). RR = 258/12 ≈ 1:21. Na prática com stop mais largo e TP parcial, dá fácil 1:5+. É o setup com melhor RR do SMC." },
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

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    setScore(prev => ({
      correct: prev.correct + (idx === step.correct ? 1 : 0),
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

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${treino.moduleColor}40, transparent)` }} />

          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: pct >= 70 ? "#10B98115" : "#EF444415" }}>
            {pct >= 70 ? <Trophy className="w-9 h-9 text-green-400" /> : <RotateCcw className="w-9 h-9 text-red-400" />}
          </div>

          <h2 className="text-[28px] font-bold text-white mb-2">{pct >= 70 ? "Aprovado!" : "Tente novamente"}</h2>
          <p className="text-[42px] font-bold mb-1" style={{ color: pct >= 70 ? "#10B981" : "#EF4444" }}>{pct}%</p>
          <p className="text-[14px] text-white/40 mb-8">{score.correct} de {score.total} decisões corretas</p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/60 font-medium hover:bg-white/[0.06] transition-all">
              <RotateCcw className="w-4 h-4" /> Refazer
            </button>
            <button onClick={() => router.push("/elite/pratica")} className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white transition-all" style={{ backgroundColor: treino.moduleColor }}>
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/elite/pratica")} className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/30">{treino.title}</span>
          <span className="text-[11px] text-white/20 font-mono">{currentStep + 1}/{treino.steps.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / treino.steps.length) * 100}%`, backgroundColor: treino.moduleColor }} />
      </div>

      {/* Chart — full width */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <LessonChart scenario={step.chart} />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-6">
        <h3 className="text-[17px] font-bold text-white mb-2">{step.title}</h3>
        <p className="text-[13px] text-white/45 leading-relaxed">{step.context}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {step.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === step.correct;
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
          <p className="text-[13px] text-white/50 leading-relaxed">{step.explanation}</p>

          <button onClick={handleNext} className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110" style={{ backgroundColor: treino.moduleColor }}>
            {isLast ? "Ver resultado" : "Próxima"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
