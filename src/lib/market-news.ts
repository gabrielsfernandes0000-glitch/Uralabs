/* ────────────────────────────────────────────
   Market News — tipos + mock data pro dashboard Elite.
   Produção: edge function prop-news-sync puxa de Finnhub
   (/calendar/economic + /news) e grava em tabelas Supabase.
   Por enquanto usa mock pra validar o visual.
   ──────────────────────────────────────────── */

export type EventImpact = "high" | "medium" | "low";
export type NewsCategory = "general" | "forex" | "crypto" | "stocks";

export interface EconomicEvent {
  id: string;
  /** Horário BRT — ex: "10:30", "20:30" */
  time: string;
  /** Código do país/região: "US", "EU", "BR", "UK", "CN" */
  country: string;
  /** Nome do evento: "CPI m/m", "Non-Farm Payrolls", "FOMC Rate Decision" */
  event: string;
  impact: EventImpact;
  /** Valor anterior (último release) */
  previous?: string;
  /** Consenso de mercado */
  forecast?: string;
  /** Valor realizado (só depois do release) */
  actual?: string;
  /** Data do evento (YYYY-MM-DD como salvo pelo ingestor — pode divergir do
   *  dia BRT em eventos após ~21:00 BRT se o ingestor usar UTC). Necessário
   *  pra cálculo de timestamp absoluto quando a janela cruza dias. */
  date?: string;
}

export interface MarketNews {
  id: string;
  source: string;
  headline: string;
  summary?: string;
  url: string;
  imageUrl?: string;
  /** ISO timestamp */
  publishedAt: string;
  category: NewsCategory;
  /** Score editorial — high = bancos centrais, geopolítica major, CPI/NFP */
  importance: EventImpact;
}

/* ────────────────────────────────────────────
   Mock — será substituído por fetch à tabela Supabase.
   Mantém dados coerentes com o momento atual pra demo real.
   ──────────────────────────────────────────── */

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

export const MOCK_EVENTS: EconomicEvent[] = [
  { id: "e1", time: "08:30", country: "US",  event: "Core CPI m/m",           impact: "high",   previous: "0.3%",  forecast: "0.2%" },
  { id: "e2", time: "10:00", country: "US",  event: "Pending Home Sales m/m", impact: "medium", previous: "-1.2%", forecast: "0.5%" },
  { id: "e3", time: "14:00", country: "US",  event: "FOMC Rate Decision",     impact: "high",   previous: "4.50%", forecast: "4.25%" },
  { id: "e4", time: "14:30", country: "US",  event: "FOMC Press Conference",  impact: "high" },
  { id: "e5", time: "05:00", country: "EU",  event: "CPI YoY (flash)",        impact: "medium", previous: "2.4%",  forecast: "2.3%" },
  { id: "e6", time: "21:30", country: "CN",  event: "Manufacturing PMI",      impact: "medium", previous: "50.8",  forecast: "50.5" },
];

export const MOCK_NEWS: MarketNews[] = [
  { id: "n1", source: "Bloomberg", headline: "Powell sinaliza corte de 25 bps em reunião desta semana, dizem fontes",
    summary: "Comentários em Jackson Hole reforçam expectativa do mercado. Dot plot pode mostrar mais um corte até dezembro.",
    url: "https://bloomberg.com/...", publishedAt: hoursAgo(2), category: "general", importance: "high" },
  { id: "n2", source: "Reuters", headline: "Bitcoin quebra US$ 105k e renova máxima histórica com ETFs em forte entrada",
    summary: "Fluxo líquido nos spot ETFs ultrapassa US$ 2 bi na semana. BlackRock IBIT lidera.",
    url: "https://reuters.com/...", publishedAt: hoursAgo(3), category: "crypto", importance: "high" },
  { id: "n3", source: "Financial Times", headline: "ECB mantém taxa mas Lagarde abre porta pra cortes em junho",
    summary: "Inflação da zona do euro cede pelo 4º mês seguido. Mercado precifica 3 cortes em 2026.",
    url: "https://ft.com/...", publishedAt: hoursAgo(5), category: "forex", importance: "high" },
  { id: "n4", source: "CNBC", headline: "Nasdaq testa máxima; Nvidia e Broadcom lideram alta de chips de IA",
    summary: "Índice sobe 0.8% com balanços melhores que esperado. SOX em máxima histórica.",
    url: "https://cnbc.com/...", publishedAt: hoursAgo(6), category: "stocks", importance: "medium" },
  { id: "n5", source: "Wall Street Journal", headline: "Trump ameaça tarifas de 100% sobre chips caso TSMC não acelere fábrica no Texas",
    summary: "Setor tech recua no after-hours. Impacto pode chegar a supply chain global.",
    url: "https://wsj.com/...", publishedAt: hoursAgo(8), category: "stocks", importance: "high" },
  { id: "n6", source: "InfoMoney", headline: "Copom indica que Selic deve fechar 2026 em 10%, diz diretor",
    summary: "Comentário em evento no IBMEC. Curva longa brasileira reage com -15bps.",
    url: "https://infomoney.com.br/...", publishedAt: hoursAgo(10), category: "general", importance: "medium" },
  { id: "n7", source: "CoinDesk", headline: "Ethereum aguarda upgrade Pectra; staking rate cai pra 3.1%",
    summary: "Upgrade previsto pra maio traz aumento do validator cap e UX melhor pra carteiras.",
    url: "https://coindesk.com/...", publishedAt: hoursAgo(11), category: "crypto", importance: "medium" },
];

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function impactMeta(impact: EventImpact): { label: string; color: string; dotBg: string } {
  switch (impact) {
    case "high":   return { label: "Alto",   color: "text-brand-500", dotBg: "#FF5500" };
    case "medium": return { label: "Médio",  color: "text-amber-400", dotBg: "#F59E0B" };
    case "low":    return { label: "Baixo",  color: "text-white/35",  dotBg: "rgba(255,255,255,0.25)" };
  }
}

export function countryLabel(country: string): string {
  const labels: Record<string, string> = {
    US: "EUA", EU: "Euro", BR: "Brasil", UK: "Reino Unido", CN: "China", JP: "Japão", CA: "Canadá", AU: "Austrália",
  };
  return labels[country] ?? country;
}

export function categoryMeta(cat: NewsCategory): { label: string; accent: string } {
  // Paleta restrita: categoria é label, não cor. Todos em branco muted.
  const accent = "rgba(255,255,255,0.55)";
  switch (cat) {
    case "general": return { label: "Geral",  accent };
    case "forex":   return { label: "Forex",  accent };
    case "crypto":  return { label: "Crypto", accent };
    case "stocks":  return { label: "Ações",  accent };
  }
}
