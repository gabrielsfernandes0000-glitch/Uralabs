"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, X, Target, RotateCcw, Trophy } from "lucide-react";

/* ────────────────────────────────────────────
   Treino Step Types
   ──────────────────────────────────────────── */

interface BriefingStep {
  type: "briefing";
  title: string;
  body: string;
  chart?: string; // SVG chart description for context
}

interface QuestionStep {
  type: "question";
  title: string;
  context: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ResultStep {
  type: "result";
  title: string;
  body: string;
}

type Step = BriefingStep | QuestionStep | ResultStep;

interface TreinoData {
  id: string;
  title: string;
  module: string;
  moduleColor: string;
  difficulty: string;
  steps: Step[];
}

/* ────────────────────────────────────────────
   Treino Scenarios
   ──────────────────────────────────────────── */

const TREINO_DATA: Record<string, TreinoData> = {
  "t-candles": {
    id: "t-candles", title: "Leitura de Candle", module: "Base", moduleColor: "#FF5500", difficulty: "Iniciante",
    steps: [
      { type: "briefing", title: "Cenário", body: "Você está analisando o NQ (Nasdaq 100 E-mini) no timeframe de 15 minutos durante a sessão de Nova York. O mercado abriu há 30 minutos e você precisa interpretar a ação do preço para decidir se vai operar." },
      { type: "question", title: "Candle com corpo pequeno e pavios longos", context: "Você vê um candle com corpo muito pequeno (quase um doji) e pavios longos dos dois lados, formado exatamente numa zona que você marcou como Order Block.", options: ["Sinal de compra forte — os compradores estão dominando", "Indecisão — compradores e vendedores estão brigando sem vencedor", "Sinal de venda — o preço vai cair", "Esse candle não tem significado nenhum"], correct: 1, explanation: "Candles com corpo pequeno e pavios longos (dojis) mostram que o preço testou altos e baixos mas fechou perto de onde abriu. Em zonas de decisão (OB, FVG), pode preceder um movimento forte. Não é sinal de compra nem venda — é sinal de atenção." },
      { type: "question", title: "Sequência de candles", context: "Você vê 5 candles verdes consecutivos no 15 minutos, todos com corpos grandes e pavios pequenos. Mas ao olhar o diário, o candle do dia ainda é vermelho e o preço está abaixo do equilíbrio.", options: ["Ignoro o diário e opero comprado no 15min", "O contexto maior é bearish — esse rali pode ser só um pullback", "5 candles verdes significa que reverteu, pode comprar", "Troco pra outro ativo porque esse está confuso"], correct: 1, explanation: "Timeframes maiores dão o contexto. Um rali no 15min dentro de um diário bearish pode ser apenas um pullback — não uma reversão. O viés vem do maior (semanal/diário) e a entrada vem do menor (15min/5min). Nunca ignore o contexto." },
      { type: "question", title: "Candle de rejeição", context: "Um candle vermelho com pavio superior muito longo aparece numa zona de premium (acima dos 50% de Fibonacci). O corpo fechou na metade inferior do candle.", options: ["Significa que os vendedores rejeitaram aquele nível — possível reversão bearish", "É apenas um candle normal, não tem significado especial", "Pavio longo pra cima é sinal de compra", "Preciso esperar mais 10 candles pra decidir"], correct: 0, explanation: "Um candle com pavio superior longo em zona de premium mostra que os compradores tentaram empurrar o preço pra cima mas foram rejeitados. O corpo fechando na metade inferior confirma a pressão vendedora. É um dos sinais mais fortes de possível reversão." },
      { type: "question", title: "Leitura multi-timeframe", context: "No gráfico semanal, o candle da semana anterior fechou como um martelo (hammer) com pavio inferior longo na zona de discount. No diário, hoje o preço abriu acima da máxima de ontem.", options: ["Viés bullish — hammer semanal em discount + abertura forte no diário", "Viés bearish — o preço vai voltar a cair", "Sem viés — preciso esperar o candle semanal fechar", "Opero short porque o pavio inferior mostra fraqueza"], correct: 0, explanation: "Hammer semanal em zona de discount mostra que os compradores defenderam aquele nível com força. Preço abrindo acima da máxima do dia anterior no diário confirma o viés bullish. Essa confluência multi-timeframe é um dos setups mais confiáveis." },
    ],
  },
  "t-risco": {
    id: "t-risco", title: "Calcule o Risco", module: "Base", moduleColor: "#FF5500", difficulty: "Iniciante",
    steps: [
      { type: "briefing", title: "Cenário", body: "Você tem uma conta de $25.000 em mesa proprietária. A regra da mesa é: máximo 2% de drawdown diário ($500) e máximo 5% total ($1.250). Você encontrou um setup e precisa calcular o lote correto." },
      { type: "question", title: "Tamanho do risco por trade", context: "Você vai operar NQ (Nasdaq). Seu risco máximo diário é $500. Quantas operações você planeja fazer hoje?", options: ["1 trade com $500 de risco", "2 trades com $250 de risco cada", "5 trades com $100 de risco cada", "Depende — primeiro defino o stop, depois calculo o lote"], correct: 3, explanation: "O tamanho do risco por trade depende do tamanho do stop, não do contrário. Primeiro você encontra o setup, define o stop baseado na estrutura do mercado, e só então calcula o lote pra não ultrapassar 1% da conta ($250)." },
      { type: "question", title: "Stop loss baseado na estrutura", context: "Você identificou um Order Block bullish no NQ em 18.050. O preço atual é 18.080. O fundo do OB está em 18.030.", options: ["Stop em 18.070 — 10 pontos (apertado)", "Stop em 18.025 — abaixo do OB inteiro (50 pontos)", "Stop em 18.000 — número redondo (80 pontos)", "Stop em 18.050 — no topo do OB (30 pontos)"], correct: 1, explanation: "O stop deve ficar abaixo da zona que invalida o setup. Se o OB está entre 18.030-18.050, o stop vai abaixo do OB em 18.025 (com margem). Stop muito apertado dentro do OB vai ser varrido. Stop em número redondo é amador — o institucional sabe que tem stop lá." },
      { type: "question", title: "Cálculo do lote", context: "Seu risco máximo por trade é $250. O stop é de 50 pontos no NQ. No micro NQ (MNQ), cada ponto vale $2.", options: ["2 contratos MNQ (50pts × $2 × 2 = $200)", "3 contratos MNQ (50pts × $2 × 3 = $300)", "2.5 contratos MNQ ($250 exatos)", "Não existe 2.5 contratos — uso 2 e aceito risco menor"], correct: 3, explanation: "Não dá pra operar fração de contrato. Com 2 MNQ o risco é $200 (dentro do limite). Com 3 seria $300 (acima do limite). A resposta correta é arredondar pra baixo: 2 contratos, $200 de risco. Nunca arredonde pra cima — preservar capital é prioridade." },
      { type: "question", title: "Após 2 losses seguidos", context: "Você perdeu 2 trades hoje: -$200 e -$180. Total: -$380 do dia. Seu máximo diário é $500. Aparece outro setup que parece bom.", options: ["Opero com lote normal — ainda tenho $120 de margem", "Opero com lote reduzido (1 MNQ) pra caber no limite", "Paro por hoje — -$380 está perto demais do limite", "Dobro o lote pra recuperar os $380"], correct: 2, explanation: "Com -$380, sobram apenas $120 até o limite. Se operar e perder mais $120, bate o drawdown diário e a mesa pode encerrar. A decisão inteligente é parar, revisar os 2 trades que deram errado, e voltar amanhã com a cabeça fria. O mercado abre todo dia." },
    ],
  },
  "t-obs": {
    id: "t-obs", title: "Marque os Order Blocks", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "Intermediário",
    steps: [
      { type: "briefing", title: "Cenário", body: "Gráfico do NQ 1 hora. O mercado fez um BOS (Break of Structure) bullish e agora está retornando para preencher o desequilíbrio. Você precisa identificar o Order Block válido para uma possível entrada." },
      { type: "question", title: "O que define um Order Block?", context: "O preço quebrou uma estrutura de alta. Agora está voltando. Você vê 4 zonas possíveis no pullback. Qual critério define o OB correto?", options: ["O último candle vermelho antes do movimento de alta que quebrou a estrutura", "Qualquer zona de suporte onde o preço parou antes", "A média móvel de 200 períodos", "O candle com maior volume do dia"], correct: 0, explanation: "Order Block é o último candle de mitigação (oposto à direção) antes do impulso que quebrou a estrutura. Num BOS bullish, é o último candle vermelho antes do movimento de alta. É onde os institucionais se posicionaram." },
      { type: "question", title: "OB válido vs invalidado", context: "Você marcou um OB bullish em 18.100-18.120. O preço voltou, tocou 18.095 (abaixo do OB inteiro) e depois subiu forte.", options: ["O OB foi respeitado — bom sinal", "O OB foi invalidado — o preço passou por ele inteiro", "Não importa se passou, o que importa é que subiu depois", "Preciso ver em timeframe menor pra decidir"], correct: 1, explanation: "Se o preço atravessa o OB inteiro (fecha abaixo), ele é invalidado. O institucional que se posicionou ali já saiu. O que aconteceu provavelmente foi um sweep de liquidez abaixo do OB. Procure o próximo OB válido mais abaixo." },
      { type: "question", title: "Confluência com FVG", context: "Você encontrou um OB bullish em 18.050-18.070. Dentro dessa mesma zona, existe um Fair Value Gap (FVG) entre 18.055-18.065. O preço está em 18.150, voltando.", options: ["Zona forte — OB + FVG na mesma região aumenta a probabilidade", "FVG dentro do OB enfraquece a zona", "Espero o FVG preencher antes de considerar o OB", "Ignoro o FVG e uso só o OB"], correct: 0, explanation: "Quando um OB e um FVG se sobrepõem, a zona ganha confluência. São dois motivos institucionais pro preço reagir ali. Quanto mais confluência (OB + FVG + premium/discount + número redondo), maior a probabilidade." },
      { type: "question", title: "Qual OB usar no multi-timeframe?", context: "No gráfico de 4 horas, existe um OB bearish em 18.300-18.350. No 1 hora, dentro dessa mesma zona, existe um OB bearish menor em 18.320-18.335. O preço está subindo em direção a ambos.", options: ["Uso o OB do 4h (maior e mais significativo)", "Uso o OB do 1h dentro do 4h — entrada mais precisa", "Uso os dois: 4h pra contexto, 1h pra entrada", "Tanto faz, são a mesma zona"], correct: 2, explanation: "Top-down analysis: o OB do 4h dá o contexto (zona de interesse ampla), o OB do 1h dentro dele dá a entrada refinada com stop menor. Você espera o preço chegar no OB do 4h e entra no OB do 1h pra ter melhor risk-reward." },
    ],
  },
  "t-fvg": {
    id: "t-fvg", title: "Identifique FVGs", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "Intermediário",
    steps: [
      { type: "briefing", title: "Cenário", body: "O NQ acabou de fazer um impulso forte de alta no 15 minutos. Três candles consecutivos deixaram gaps entre seus pavios. Você precisa identificar quais FVGs são relevantes e se serão preenchidos." },
      { type: "question", title: "O que é um Fair Value Gap?", context: "Três candles consecutivos: o primeiro tem máxima em 18.100, o segundo (impulso) vai de 18.098 a 18.150, e o terceiro tem mínima em 18.130.", options: ["O FVG está entre 18.100 e 18.130 — o gap entre candle 1 e candle 3", "O FVG é o corpo do candle do meio", "O FVG é a diferença entre abertura e fechamento do impulso", "Não existe FVG nesse exemplo"], correct: 0, explanation: "FVG é o espaço entre o pavio do candle 1 e o pavio do candle 3 que o candle do meio 'pulou'. Nesse caso: máxima do candle 1 (18.100) até mínima do candle 3 (18.130). Esse gap representa desequilíbrio — ordens não preenchidas." },
      { type: "question", title: "FVG que será preenchido", context: "Você vê dois FVGs no gráfico. FVG-A está em zona de premium (acima de 50% Fibonacci). FVG-B está em zona de discount (abaixo de 50%). O viés do dia é bullish.", options: ["FVG-A em premium será preenchido — o preço volta pra corrigir", "FVG-B em discount será preenchido — o preço vai buscar antes de subir", "Ambos serão preenchidos", "Nenhum será preenchido"], correct: 1, explanation: "Com viés bullish, o preço tende a buscar liquidez e preencher gaps em discount antes de continuar subindo. FVGs em zona de discount são mais prováveis de serem preenchidos porque atraem o preço pra uma compra institucional. FVGs em premium num dia bullish são menos relevantes." },
      { type: "question", title: "FVG como zona de entrada", context: "O preço fez um BOS bullish e deixou um FVG entre 18.060-18.080. Agora está retornando. O FVG coincide com um OB na mesma região.", options: ["Espero o preço entrar no FVG e coloco buy limit em 18.070", "Compro agora antes que o preço chegue no FVG", "Espero o FVG ser completamente preenchido (18.060) antes de entrar", "FVG + OB na mesma zona — coloco buy limit no topo do FVG (18.080) com stop abaixo do OB"], correct: 3, explanation: "FVG + OB dá alta confluência. A entrada ideal é no topo do FVG (18.080) com stop abaixo do OB inteiro. Não precisa esperar preencher 100% do gap — muitas vezes o preço reage no início do FVG e sai. Entrar cedo com confirmação de confluência dá melhor RR." },
    ],
  },
  "t-premium": {
    id: "t-premium", title: "Premium ou Discount?", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "Intermediário",
    steps: [
      { type: "briefing", title: "Cenário", body: "Você está analisando o swing do NQ no gráfico de 4 horas. O último swing vai de 17.800 (fundo) a 18.200 (topo). Precisa identificar as zonas de premium e discount para definir onde comprar e onde vender." },
      { type: "question", title: "Onde está o equilíbrio?", context: "Swing de 17.800 a 18.200. Qual é o ponto de equilíbrio (50% Fibonacci)?", options: ["18.100", "18.000", "17.900", "18.050"], correct: 1, explanation: "Equilíbrio = (17.800 + 18.200) / 2 = 18.000. Tudo acima de 18.000 é premium (caro), tudo abaixo é discount (barato). Institucionais compram em discount e vendem em premium." },
      { type: "question", title: "Preço em premium — o que fazer?", context: "O preço está em 18.150 (zona de premium). Seu viés do dia é bearish. Você vê um OB bearish na região.", options: ["Procuro venda — preço em premium + viés bearish + OB = confluência pra short", "Compro porque o preço está subindo", "Espero sair de premium antes de operar", "Premium não importa, só o viés importa"], correct: 0, explanation: "Premium + viés bearish + OB é tripla confluência pra venda. Institucionais vendem em premium e compram em discount. Se o viés é bearish e o preço está em premium com OB, é uma das melhores zonas pra short." },
    ],
  },
  "t-liquidez": {
    id: "t-liquidez", title: "Onde Está a Liquidez?", module: "Leitura SMC", moduleColor: "#3B82F6", difficulty: "Intermediário",
    steps: [
      { type: "briefing", title: "Cenário", body: "O NQ está consolidando há 2 horas no 5 minutos. Existem equal highs (topos iguais) em 18.200 e equal lows (fundos iguais) em 18.100. Você precisa identificar onde está a liquidez e pra onde o preço vai antes de reverter." },
      { type: "question", title: "Onde estão os stops?", context: "Equal highs em 18.200 (3 toques). Equal lows em 18.100 (3 toques). Onde está a maior concentração de stop losses?", options: ["Acima de 18.200 (buy stops dos shorts) e abaixo de 18.100 (sell stops dos longs)", "Só acima de 18.200", "Só abaixo de 18.100", "No meio, em 18.150"], correct: 0, explanation: "Equal highs atraem buy stops (de quem está short com stop acima dos topos) e sell stops abaixo de equal lows (de quem está long com stop abaixo dos fundos). Essas são as duas pools de liquidez que o institucional vai buscar." },
      { type: "question", title: "Judas Swing", context: "O mercado abre a sessão de NY e faz um spike rápido acima de 18.200, varrendo os equal highs. Imediatamente começa a cair com candles de corpo grande.", options: ["A alta era real — compro no pullback", "Judas Swing — o spike varrendo os highs pegou a liquidez e agora o movimento real (bearish) começa", "Espero mais 30 minutos pra confirmar", "Isso é normal, não significa nada"], correct: 1, explanation: "Judas Swing é o movimento falso que varre liquidez na abertura. O spike acima dos equal highs pegou todos os buy stops, dando liquidez pros institucionais montarem posição de venda. O movimento real é o oposto do Judas — nesse caso, bearish." },
    ],
  },
  "t-sessoes": {
    id: "t-sessoes", title: "Qual Sessão Operar?", module: "Estratégia", moduleColor: "#A855F7", difficulty: "Avançado",
    steps: [
      { type: "briefing", title: "Cenário", body: "São 9:00 da manhã (horário de Brasília). O mercado asiático já fechou, Londres está no meio da sessão, e Nova York abre em 30 minutos. Você precisa decidir quando e como operar." },
      { type: "question", title: "Qual sessão tem mais volatilidade no NQ?", context: "Você opera Nasdaq. Cada sessão tem comportamento diferente.", options: ["Ásia (20h-1h BRT) — alta volatilidade", "Londres (4h-9h BRT) — volatilidade moderada", "Nova York (9:30-16h BRT) — maior volatilidade e volume", "Todas têm a mesma volatilidade"], correct: 2, explanation: "O NQ é um contrato americano — a maior volatilidade e volume acontecem na sessão de Nova York (9:30-16h BRT). Ásia tem pouca movimentação no NQ. Londres pode ter bons setups, mas o volume real vem com NY." },
      { type: "question", title: "Comportamento na abertura de NY", context: "NY abre às 9:30 BRT. Os primeiros 15-30 minutos costumam ser voláteis. O que esperar?", options: ["O primeiro movimento da abertura é sempre o movimento do dia", "Os primeiros minutos costumam ter um Judas Swing — movimento falso antes do real", "Sempre entro na primeira candle de NY", "A abertura não é relevante"], correct: 1, explanation: "Os primeiros 15-30 minutos de NY frequentemente têm um Judas Swing — um spike na direção oposta ao movimento real do dia. É a manipulação varrendo liquidez. Por isso a regra é: espere pelo menos 15-30 min após a abertura antes de entrar." },
    ],
  },
  "t-amd": {
    id: "t-amd", title: "Leitura AMD Completa", module: "Estratégia", moduleColor: "#A855F7", difficulty: "Avançado",
    steps: [
      { type: "briefing", title: "Cenário", body: "Sessão de NY no NQ 5 minutos. O mercado está no primeiro 1 hora. Você precisa identificar as 3 fases do padrão AMD (Acumulação, Manipulação, Distribuição) em tempo real e tomar decisões em cada fase." },
      { type: "question", title: "Fase 1 — Acumulação", context: "Os primeiros 30 minutos de NY mostram 6 candles com range apertado, entre 18.080 e 18.100. Sem direção clara. Topos e fundos iguais se formando.", options: ["Acumulação — range apertado enquanto institucionais montam posição silenciosamente", "O mercado está sem tendência — não opero hoje", "Compro no topo do range (18.100)", "Vendo no fundo do range (18.080)"], correct: 0, explanation: "Range apertado nos primeiros 30 minutos = Acumulação. Os institucionais estão montando posição sem mover o preço. A liquidez está se acumulando nos topos e fundos iguais. NÃO opere durante acumulação — espere a manipulação." },
      { type: "question", title: "Fase 2 — Manipulação", context: "Após 30 minutos de range, o preço faz um spike forte pra baixo, quebrando o fundo de 18.080, indo até 18.055. Candle com corpo grande e volume alto.", options: ["Entro vendido — o mercado está caindo", "Manipulação — varreram a liquidez abaixo do range. Agora espero o preço voltar pra dentro do range", "O mercado decidiu: é bearish", "Coloco stop abaixo de 18.055"], correct: 1, explanation: "O spike que varre o fundo do range é a Manipulação — pegaram os sell stops de quem comprou no range. Agora que a liquidez foi varrida, os institucionais têm as ordens que precisavam. Espere o preço voltar pra dentro do range — é o sinal de que a distribuição (movimento real) vai começar." },
      { type: "question", title: "Fase 3 — Distribuição", context: "O preço voltou de 18.055 pra 18.090, entrando de volta no range. Um OB bullish se formou em 18.060-18.070. O candle de reversão tem pavio inferior longo.", options: ["Entro comprado com stop abaixo do OB (18.055) e alvo no topo do range + extensão", "Espero mais confirmação — pode ser outra manipulação", "Entro vendido porque o spike bearish foi forte", "Opero sem stop porque tenho certeza"], correct: 0, explanation: "AMD completo: Acumulação (range) → Manipulação (spike que varre liquidez) → Distribuição (movimento real na direção oposta). Entrada no OB formado na manipulação, stop abaixo do spike, alvo no topo do range e extensão (1.5R a 3R). Esse é o setup institucional por excelência." },
    ],
  },
  "t-bias": {
    id: "t-bias", title: "Monte o Viés do Dia", module: "Estratégia", moduleColor: "#A855F7", difficulty: "Avançado",
    steps: [
      { type: "briefing", title: "Cenário", body: "São 8:30 da manhã BRT. NY abre em 1 hora. Você precisa montar o viés do dia analisando os timeframes maiores (semanal, diário, 4h) antes de operar." },
      { type: "question", title: "Análise semanal", context: "O candle semanal anterior fechou como martelo bullish em zona de discount. A semana atual abriu e está dentro do corpo da vela anterior.", options: ["Viés semanal: bullish — martelo em discount mostra defesa dos compradores", "Viés semanal: bearish — preço ainda está em zona de discount", "Sem viés semanal — preciso esperar a semana fechar", "O semanal não importa pra day trade"], correct: 0, explanation: "Martelo em discount = compradores defenderam o nível com força. Viés semanal bullish. O semanal dá o contexto macro — mesmo pra day trade, operar a favor do viés semanal aumenta a probabilidade." },
      { type: "question", title: "Análise diária", context: "Viés semanal é bullish. No diário, ontem o candle fechou verde acima da máxima do dia anterior. Hoje abriu com gap up pequeno.", options: ["Viés diário: bullish — confirma o semanal", "Viés diário: bearish — gap up vai ser preenchido", "Viés diário: neutro — gap up é inconclusivo", "Mudo o viés semanal por causa do gap"], correct: 0, explanation: "Candle diário fechando acima da máxima anterior + gap up na abertura confirma o viés bullish do semanal. Quando semanal e diário concordam, a probabilidade aumenta significativamente. Busque apenas setups de compra hoje." },
      { type: "question", title: "Decisão final", context: "Viés semanal: bullish. Viés diário: bullish. No 4h, existe um OB bullish em 18.050 com FVG. O preço está em 18.100, acima do equilíbrio. NY abre em 10 minutos.", options: ["Espero o preço puxar até o OB em 18.050 pra comprar — buscar desconto", "Compro agora em 18.100 porque é bullish", "Espero os primeiros 15-30 min de NY pra ver se tem Judas Swing pro OB", "Vendo porque o preço está em premium"], correct: 2, explanation: "Viés é bullish, mas a execução exige paciência. Espere NY abrir, observe se o Judas Swing leva o preço até o OB em 18.050 (desconto). Se chegar lá com confluência (FVG + OB + discount), é a entrada ideal. Comprar em 18.100 seria comprar em premium — contra a lógica institucional mesmo sendo bullish." },
    ],
  },
  "t-entrada": {
    id: "t-entrada", title: "Execute o Trade", module: "Execução", moduleColor: "#10B981", difficulty: "Avançado",
    steps: [
      { type: "briefing", title: "Cenário Completo", body: "Sessão de NY, NQ 5 minutos. Viés diário bullish. O mercado abriu, fez um Judas Swing pra baixo varrendo os lows da sessão asiática, e agora está retornando. Você tem um OB bullish + FVG em zona de discount. É hora de executar." },
      { type: "question", title: "Confirmação de entrada", context: "O preço chegou no OB em 18.050. Está em zona de discount. Tem FVG entre 18.055-18.065. O que você espera antes de entrar?", options: ["Entro imediatamente com buy limit em 18.050", "Espero um candle de rejeição (pavio inferior longo) dentro do OB no 5 minutos", "Espero o preço sair do OB e fazer um novo BOS bullish antes de entrar", "Não entro — o preço caiu, é bearish"], correct: 1, explanation: "A confirmação ideal é um candle de rejeição dentro do OB — mostra que os compradores estão defendendo a zona. Buy limit sem confirmação funciona, mas candle de rejeição dá mais segurança e permite stop mais apertado." },
      { type: "question", title: "Posicionamento do stop", context: "Você decidiu entrar em 18.060 após ver rejeição dentro do OB (18.050-18.070). Onde coloca o stop?", options: ["18.055 — apertado, dentro do OB", "18.045 — abaixo do OB inteiro, com margem", "18.000 — número redondo, bem longe", "18.030 — no meio do nada"], correct: 1, explanation: "Stop abaixo do OB inteiro com margem (18.045). Se o preço passar por todo o OB, ele é invalidado — não faz sentido ter stop dentro. Stop em número redondo (18.000) é previsível e o risco fica grande demais. Stop no meio do nada não tem lógica de estrutura." },
      { type: "question", title: "Alvo e gestão", context: "Entrada em 18.060. Stop em 18.045 (15 pontos de risco). Quanto é 2R de retorno?", options: ["18.075 (15 pontos de lucro)", "18.090 (30 pontos de lucro = 2R)", "18.105 (45 pontos de lucro = 3R)", "18.060 (breakeven)"], correct: 1, explanation: "2R = 2 × risco. Risco = 15 pontos, então 2R = 30 pontos acima da entrada = 18.090. Regra: parcial em 1.5R (18.082), mova stop pro breakeven, e deixe o resto correr até 2R ou 3R." },
      { type: "question", title: "O trade está andando", context: "O preço saiu de 18.060 e está em 18.082 (1.5R). O que você faz?", options: ["Fecho tudo — lucro é lucro", "Parcial de 50% aqui, movo stop pro breakeven, deixo o resto correr", "Não faço nada, espero chegar em 3R", "Aumento a posição porque está dando certo"], correct: 1, explanation: "Em 1.5R: realiza parcial (50%), protege o restante movendo stop pro breakeven (18.060). Assim você garante lucro e dá chance do trade ir até 2R ou 3R com risco zero. Nunca aumente posição em trade aberto — isso é overtrading." },
    ],
  },
};

/* ────────────────────────────────────────────
   Treino Engine — Step by Step
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
    if (step.type === "question") {
      setScore(prev => ({
        correct: prev.correct + (idx === step.correct ? 1 : 0),
        total: prev.total + 1,
      }));
    }
  };

  const handleNext = () => {
    if (isLast) {
      setCurrentStep(treino.steps.length); // show results
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
    const totalQuestions = treino.steps.filter(s => s.type === "question").length;
    const pct = totalQuestions > 0 ? Math.round((score.correct / totalQuestions) * 100) : 0;

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
          <p className="text-[14px] text-white/40 mb-8">{score.correct} de {totalQuestions} decisões corretas</p>

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
    <div className="max-w-2xl mx-auto space-y-6 py-4">
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

      {/* Step content */}
      {step.type === "briefing" && (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-8">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${treino.moduleColor}40, transparent)` }} />
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: treino.moduleColor + "15" }}>
              <Target className="w-4.5 h-4.5" style={{ color: treino.moduleColor }} />
            </div>
            <h2 className="text-[20px] font-bold text-white">{step.title}</h2>
          </div>
          <p className="text-[14px] text-white/50 leading-relaxed">{step.body}</p>

          <button onClick={handleNext} className="mt-8 flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all hover:brightness-110" style={{ backgroundColor: treino.moduleColor }}>
            Começar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step.type === "question" && (
        <div className="space-y-4">
          {/* Question */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#141417] to-[#0e0e10] p-7">
            <h3 className="text-[18px] font-bold text-white mb-3">{step.title}</h3>
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
      )}
    </div>
  );
}
