/* ────────────────────────────────────────────
   Dicionário PT-BR de explicações de eventos econômicos.
   Finnhub Calendar não devolve descrição, então mantemos esse map
   estático cobrindo os 30+ eventos mais recorrentes (95% dos high/medium).
   ──────────────────────────────────────────── */

export interface EventExplanation {
  /** O que é — 1-2 frases descrevendo o indicador. */
  what: string;
  /** Por que move o mercado — como o trader deve ler. */
  whyMatters: string;
}

/**
 * Lista ordem-sensível: primeiro match vence. Padrões mais específicos primeiro
 * (ex: "core cpi" antes de "cpi"), genéricos por último.
 */
const EXPLANATIONS: Array<{ match: RegExp; exp: EventExplanation }> = [
  {
    match: /\bcore\s+(cpi|pce)\b/i,
    exp: {
      what: "Versão 'core' da inflação, exclui alimentos e energia (componentes voláteis). Métrica que o Fed realmente acompanha.",
      whyMatters: "Acima do consenso = Fed mantém juros altos, dólar forte, ações/cripto pressionadas. Abaixo = expectativa de corte sobe.",
    },
  },
  {
    match: /\bcpi\s+(m\/m|y\/y|yoy|mom)/i,
    exp: {
      what: "Índice de Preços ao Consumidor — inflação mensal (m/m) ou anual (y/y). Principal termômetro de inflação.",
      whyMatters: "Leitura quente = banco central segura juros altos. Fria = abre espaço pra cortes. Move forte dólar, bonds e cripto.",
    },
  },
  {
    match: /\bcpi\b/i,
    exp: {
      what: "Índice de Preços ao Consumidor — mede a inflação ao consumidor final.",
      whyMatters: "Distância da meta do banco central guia a política de juros. Surpresas movem dólar, ações e cripto.",
    },
  },
  {
    match: /\b(non.?farm\s+payrolls?|nfp)\b/i,
    exp: {
      what: "Empregos criados fora do setor agrícola nos EUA no mês. Publicado toda 1ª sexta.",
      whyMatters: "Forte demais = Fed mantém juros altos. Fraco = corte mais próximo. Move muito dólar, ouro e bolsa americana.",
    },
  },
  {
    match: /\badp\s+(employment|nonfarm|non.?farm)/i,
    exp: {
      what: "Estimativa privada de empregos do ADP (setor privado). Publicado 2 dias antes do NFP oficial.",
      whyMatters: "Correlação de ~70% com o NFP. Mercado usa como preview — reação forte se diverge muito do consenso.",
    },
  },
  {
    match: /\b(initial\s+jobless|jobless\s+claims)/i,
    exp: {
      what: "Pedidos semanais de auxílio-desemprego nos EUA. Publicado toda quinta.",
      whyMatters: "Alta consistente = mercado de trabalho esfriando, Fed mais próximo de cortar. Queda = pressão inflacionária.",
    },
  },
  {
    match: /\bunemployment\s+rate/i,
    exp: {
      what: "Taxa de desemprego — % da força de trabalho sem emprego.",
      whyMatters: "Parte do duplo mandato do Fed (preços + emprego). Alta abre caminho pra cortes, baixa mantém juros.",
    },
  },
  {
    match: /fomc\s+(rate|interest|policy|statement)/i,
    exp: {
      what: "Decisão do Fed sobre os Fed Funds Rate. Reunião a cada ~6 semanas (8 por ano).",
      whyMatters: "Preço do dinheiro globalmente. Surpresas vs consenso movem USD, ações, cripto e bonds instantaneamente.",
    },
  },
  {
    match: /fomc\s+minutes/i,
    exp: {
      what: "Ata da última reunião do FOMC. Publicada 3 semanas após a decisão.",
      whyMatters: "Tom hawkish/dovish dos comentários antecipa o próximo passo. Detalhes > decisão em si.",
    },
  },
  {
    match: /fomc\s+(press|conference)/i,
    exp: {
      what: "Coletiva do Powell após a decisão do Fed. Contexto, perspectivas e Q&A com jornalistas.",
      whyMatters: "Palavras do Powell pesam mais que a decisão. 'Hawkish hold' ou 'dovish cut' redefinem o tom do mercado.",
    },
  },
  {
    match: /\bppi\b/i,
    exp: {
      what: "Índice de Preços ao Produtor — inflação no atacado. Antecede o CPI em 1-2 meses.",
      whyMatters: "PPI forte hoje sinaliza CPI forte adiante. Move expectativas de juros com antecedência.",
    },
  },
  {
    match: /\bpce\b/i,
    exp: {
      what: "Personal Consumption Expenditures — métrica de inflação favorita do Fed (vs CPI).",
      whyMatters: "Core PCE é o número que o Fed realmente observa pra decidir juros. Pesa mais que CPI nas decisões.",
    },
  },
  {
    match: /retail\s+sales/i,
    exp: {
      what: "Vendas no varejo no mês — força do consumo americano.",
      whyMatters: "Consumo = 70% do PIB dos EUA. Forte = economia aquecida, Fed mantém juros. Fraco = desaceleração.",
    },
  },
  {
    match: /\b(gdp|produto\s+interno)/i,
    exp: {
      what: "Produto Interno Bruto — crescimento da economia no trimestre (anualizado).",
      whyMatters: "Forte = moeda forte, ações otimistas. Fraco/negativo = recessão iminente, bancos centrais cortam.",
    },
  },
  {
    match: /\bism\s+manufacturing/i,
    exp: {
      what: "ISM Manufacturing PMI — atividade industrial americana. Leitura > 50 = expansão, < 50 = contração.",
      whyMatters: "Abaixo de 50 por meses seguidos = sinal clássico de recessão. Mercado reage forte a viradas.",
    },
  },
  {
    match: /\bism\s+(services|non.?manufacturing)/i,
    exp: {
      what: "ISM Services PMI — atividade do setor de serviços (70% do PIB dos EUA).",
      whyMatters: "Mais relevante que o Manufacturing pra economia americana atual. Virada aqui move mercado mais forte.",
    },
  },
  {
    match: /manufacturing\s+pmi/i,
    exp: {
      what: "PMI industrial — pesquisa com gerentes de compras. Leitura > 50 = expansão, < 50 = contração.",
      whyMatters: "Antecede produção e emprego industrial. Bom pra enxergar ciclos econômicos globais.",
    },
  },
  {
    match: /services\s+pmi/i,
    exp: {
      what: "PMI de serviços — atividade no setor que mais emprega em economias desenvolvidas.",
      whyMatters: "Virada no PMI de serviços sinaliza mudança de ciclo. Mercado observa com atenção.",
    },
  },
  {
    match: /consumer\s+(confidence|sentiment|michigan)/i,
    exp: {
      what: "Confiança/sentimento do consumidor — disposição pra consumir, medida mensalmente.",
      whyMatters: "Queda forte antecipa retração do consumo — principal motor da economia americana.",
    },
  },
  {
    match: /balance\s+of\s+trade|trade\s+balance/i,
    exp: {
      what: "Balança comercial — exportações menos importações. Superávit (+) ou déficit (-).",
      whyMatters: "Superávit fortalece moeda local. Déficits persistentes pressionam pra desvalorização.",
    },
  },
  {
    match: /industrial\s+production/i,
    exp: {
      what: "Produção industrial mensal — output de fábricas, minas e utilities.",
      whyMatters: "Junto com PMI, dá leitura do ciclo industrial. Importante pra commodities e ações cíclicas.",
    },
  },
  {
    match: /\b(housing\s+starts|building\s+permits)/i,
    exp: {
      what: "Inícios de construção e alvarás residenciais — termômetro do imobiliário.",
      whyMatters: "Setor muito sensível a juros. Queda forte sinaliza que o aperto monetário está mordendo.",
    },
  },
  {
    match: /home\s+sales|pending\s+home/i,
    exp: {
      what: "Vendas de imóveis (novos, usados ou pendentes). Atividade no mercado residencial.",
      whyMatters: "Reflete acessibilidade (via juros) e confiança do consumidor. Impacta construtoras e consumo relacionado.",
    },
  },
  {
    match: /durable\s+goods/i,
    exp: {
      what: "Pedidos de bens duráveis — produtos com vida útil > 3 anos (carros, máquinas, aviões).",
      whyMatters: "Antecede investimento empresarial. Voláteis (aviões distorcem), mas core durables é sinal limpo.",
    },
  },
  {
    match: /exports?\s+(yoy|y\/y)/i,
    exp: {
      what: "Variação anual das exportações — comparação com o mesmo mês do ano anterior.",
      whyMatters: "Reflete demanda externa pelo país. Queda forte preocupa exportadores e moeda local.",
    },
  },
  {
    match: /imports?\s+(yoy|y\/y)/i,
    exp: {
      what: "Variação anual das importações — proxy de demanda interna.",
      whyMatters: "Alta nas importações = consumo interno forte. Queda pode sinalizar desaceleração doméstica.",
    },
  },
  {
    match: /ecb\s+(rate|interest|deposit)/i,
    exp: {
      what: "Decisão do Banco Central Europeu sobre juros. Lagarde comanda desde 2019.",
      whyMatters: "Move euro, ações europeias e bunds. Divergência com Fed cria oportunidades em EUR/USD.",
    },
  },
  {
    match: /bank\s+of\s+england|boe\s+(rate|interest)/i,
    exp: {
      what: "Decisão do Banco da Inglaterra sobre juros. Bailey na presidência.",
      whyMatters: "Move libra (GBP). Gilts reagem forte, mercado britânico amplifica qualquer surpresa.",
    },
  },
  {
    match: /boj\s+(rate|interest|policy)|bank\s+of\s+japan/i,
    exp: {
      what: "Decisão do Banco do Japão. Manteve taxa negativa até 2024, ainda é o BC mais dovish do G7.",
      whyMatters: "Qualquer sinal de aperto move JPY forte e gera tsunami em carry trades globais.",
    },
  },
  {
    match: /(bcb|copom|selic)/i,
    exp: {
      what: "Decisão do Copom sobre a Selic (taxa básica brasileira). Reunião a cada 45 dias.",
      whyMatters: "Define o custo do dinheiro no Brasil. Surpresas movem Ibovespa, real e NTNs instantaneamente.",
    },
  },
  {
    match: /crude\s+oil\s+(inventories|stockpiles|stocks)/i,
    exp: {
      what: "Estoques semanais de petróleo (EIA) nos EUA. Publicação toda quarta.",
      whyMatters: "Estoques ↑ vs consenso = excesso de oferta, WTI cai. ↓ = tight supply, WTI sobe.",
    },
  },
  {
    match: /fdi\s+(ytd|yoy)/i,
    exp: {
      what: "Foreign Direct Investment — investimento estrangeiro direto (acumulado ou anual).",
      whyMatters: "Reflete confiança externa no país. Queda forte pressiona moeda e bolsa local.",
    },
  },
  {
    match: /\btic\s+(flows|data)/i,
    exp: {
      what: "Treasury International Capital — fluxo de capital estrangeiro em ativos dos EUA.",
      whyMatters: "Compras de Treasuries por estrangeiros sustentam o dólar. Saída em massa pressiona yields.",
    },
  },
  {
    match: /inflation\s+rate|inflação/i,
    exp: {
      what: "Taxa de inflação geral — variação de preços ao consumidor.",
      whyMatters: "Distância da meta do banco central determina a política de juros. Core importa mais que headline.",
    },
  },
];

/**
 * Retorna explicação PT-BR do evento ou null se não mapeado.
 * Matching por regex — lista ordenada por especificidade.
 */
export function eventExplanation(eventName: string): EventExplanation | null {
  if (!eventName) return null;
  for (const { match, exp } of EXPLANATIONS) {
    if (match.test(eventName)) return exp;
  }
  return null;
}

/**
 * Categoria temática inferida do nome do evento. Útil pra grouping visual.
 */
export type EventCategory = "inflação" | "empregos" | "banco central" | "atividade" | "consumo" | "imobiliário" | "comércio" | "outros";

export function eventCategory(eventName: string): EventCategory {
  const n = eventName.toLowerCase();
  if (/cpi|ppi|pce|inflation|inflação/.test(n)) return "inflação";
  if (/employment|payroll|jobless|unemployment|nfp|adp/.test(n)) return "empregos";
  if (/fomc|ecb|boe|boj|bcb|copom|rate\s+decision|interest\s+rate|monetary/.test(n)) return "banco central";
  if (/pmi|gdp|industrial|manufacturing/.test(n)) return "atividade";
  if (/retail\s+sales|consumer\s+(confidence|sentiment)/.test(n)) return "consumo";
  if (/housing|home\s+sales|building\s+permits/.test(n)) return "imobiliário";
  if (/exports?|imports?|trade\s+balance|balance\s+of\s+trade/.test(n)) return "comércio";
  return "outros";
}

/* ────────────────────────────────────────────
   Surprise — comparação Real vs Consenso pós-release
   ──────────────────────────────────────────── */

/** Parse de string Finnhub pra número. Lida com %, K/M/B, separadores. Retorna null se irreconhecível. */
export function parseEventValue(v?: string): number | null {
  if (!v) return null;
  const cleaned = v.replace(/[,$£€¥\s]/g, "").replace(/%$/, "");
  const match = /^(-?\d+(?:\.\d+)?)\s*([KMB])?$/i.exec(cleaned);
  if (!match) return null;
  const n = Number(match[1]);
  if (!isFinite(n)) return null;
  const suffix = match[2]?.toUpperCase();
  const mult = suffix === "K" ? 1e3 : suffix === "M" ? 1e6 : suffix === "B" ? 1e9 : 1;
  return n * mult;
}

export interface Surprise {
  delta: number;
  /** Label formatado pra exibição: "+0.25pp", "-1.2", "+50K" */
  label: string;
  direction: "up" | "down" | "flat";
  /** True quando forecast tinha sufixo "%" — usa "pp" (pontos percentuais) em vez de unidade bruta */
  isPercent: boolean;
}

/** Compara valor real vs. consenso. Retorna null se não dá pra parsear. */
export function computeSurprise(actual?: string, forecast?: string): Surprise | null {
  const a = parseEventValue(actual);
  const f = parseEventValue(forecast);
  if (a === null || f === null) return null;
  const delta = a - f;
  const isPercent = (actual?.includes("%") || forecast?.includes("%")) ?? false;
  // Threshold: valores em % comparam por 0.01pp, valores absolutos comparam por 0.1% do valor
  const threshold = isPercent ? 0.01 : Math.max(Math.abs(a) * 0.001, 0.001);
  const direction: "up" | "down" | "flat" = Math.abs(delta) < threshold ? "flat" : delta > 0 ? "up" : "down";
  return { delta, label: formatDelta(delta, isPercent), direction, isPercent };
}

function formatDelta(n: number, isPercent: boolean): string {
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  const abs = Math.abs(n);
  const unit = isPercent ? "pp" : "";
  if (abs >= 1e9) return `${sign}${(n / 1e9).toFixed(2)}B${unit}`;
  if (abs >= 1e6) return `${sign}${(n / 1e6).toFixed(2)}M${unit}`;
  if (abs >= 1e3) return `${sign}${(n / 1e3).toFixed(1)}K${unit}`;
  if (abs >= 10) return `${sign}${n.toFixed(1)}${unit}`;
  return `${sign}${n.toFixed(2)}${unit}`;
}

/* ────────────────────────────────────────────
   Bridge — eventos ↔ aulas do currículo por categoria
   ──────────────────────────────────────────── */

/**
 * Mapa estático: categoria de evento → [lessonId] que são úteis pra revisitar antes.
 * Currículo Elite é price-action / SMC puro. Bridge é por tema, não por indicador específico.
 */
const CATEGORY_TO_LESSONS: Record<EventCategory, string[]> = {
  "banco central":  ["daily-bias", "risco", "amd"],      // FOMC/ECB/BoJ: manipulação alta, bias do dia + stop ajustado
  "inflação":       ["daily-bias", "risco"],             // CPI/PPI/PCE: gap + vol na abertura NY
  "empregos":       ["sessoes", "daily-bias", "risco"],  // NFP: movimenta sessão NY agressivo
  "atividade":      ["risco"],                           // PMI/GDP: surpresa pode movimentar
  "consumo":        ["risco"],
  "imobiliário":    [],
  "comércio":       [],
  "outros":         [],
};

/** Aulas recomendadas pra revisar ANTES do evento. */
export function lessonsForCategory(cat: EventCategory): string[] {
  return CATEGORY_TO_LESSONS[cat] ?? [];
}

/** Categorias de evento que essa aula é relevante pra operar. */
export function eventCategoriesForLesson(lessonId: string): EventCategory[] {
  return (Object.entries(CATEGORY_TO_LESSONS) as [EventCategory, string[]][])
    .filter(([, ids]) => ids.includes(lessonId))
    .map(([cat]) => cat);
}

/* ────────────────────────────────────────────
   Bridge — eventos ↔ categorias de treino (prática)
   ──────────────────────────────────────────── */

/**
 * Mapa: categoria de evento → [treinoCategory] que fazem sentido treinar antes.
 * Usa as chaves reais de TREINO_CATEGORIES em lib/treino-scenarios.ts.
 * Events de alto impacto (FOMC/CPI/NFP) priorizam AMD + Gestão + Viés.
 */
const CATEGORY_TO_TREINO: Record<EventCategory, string[]> = {
  "banco central":  ["AMD", "Gestão", "Liquidez", "Viés", "Psicologia"],
  "inflação":       ["AMD", "Gestão", "Timing"],
  "empregos":       ["Sessões", "AMD", "Gestão"],
  "atividade":      ["Viés", "Gestão"],
  "consumo":        ["Estrutura"],
  "imobiliário":    [],
  "comércio":       ["SMT"],
  "outros":         [],
};

/** Categorias de treino recomendadas pro evento. Primeira = mais relevante. */
export function treinoCategoriesForEvent(cat: EventCategory): string[] {
  return CATEGORY_TO_TREINO[cat] ?? [];
}

/* ────────────────────────────────────────────
   Bridge — eventos ↔ instrumentos afetados
   ──────────────────────────────────────────── */

/** Instrumentos afetados pela categoria do evento. Usado pra filtro de watchlist. */
const CATEGORY_TO_INSTRUMENTS: Record<EventCategory, string[]> = {
  "banco central":  ["DXY", "NQ", "ES", "BTC", "ETH", "EUR", "JPY", "GBP", "GOLD"],
  "inflação":       ["DXY", "NQ", "ES", "BTC", "ETH", "GOLD"],
  "empregos":       ["DXY", "NQ", "ES", "GOLD"],
  "atividade":      ["NQ", "ES", "DXY"],
  "consumo":        ["NQ", "ES"],
  "imobiliário":    ["ES"],
  "comércio":       ["DXY"],
  "outros":         [],
};

/** Retorna os tickers que reagem à categoria do evento (conforme país). */
export function instrumentsForEvent(eventName: string, country: string): string[] {
  const cat = eventCategory(eventName);
  const base = CATEGORY_TO_INSTRUMENTS[cat] ?? [];
  // Eventos regionais só afetam moeda regional + possível crossover
  if (country === "EU") return base.filter((i) => ["EUR", "DXY"].includes(i)).concat(["EUR"]);
  if (country === "UK") return base.filter((i) => ["GBP", "DXY"].includes(i)).concat(["GBP"]);
  if (country === "JP") return base.filter((i) => ["JPY", "DXY"].includes(i)).concat(["JPY"]);
  if (country === "BR") return ["BRL", "IBOV"];
  if (country === "CN") return ["CN50", "AUD"];
  return base;
}
