/**
 * Constrói URL do /elite/diario com pré-preenchimento do form de trade
 * baseado num evento econômico ou notícia.
 *
 * Diário espera params: ?tab=trades&new=1&instrument=X&context=Y&eventId=Z
 */

type TradePrefillOpts = {
  instruments?: string[];
  context?: string;
  sourceKind?: "event" | "news";
  sourceId?: string;
  sourceLabel?: string;
};

export function diarioNewTradeUrl(opts: TradePrefillOpts): string {
  const params = new URLSearchParams();
  params.set("tab", "trades");
  params.set("new", "1");
  if (opts.instruments && opts.instruments.length > 0) {
    params.set("instrument", opts.instruments[0]);
  }
  if (opts.context) params.set("context", opts.context.slice(0, 500));
  if (opts.sourceKind) params.set("sourceKind", opts.sourceKind);
  if (opts.sourceId) params.set("sourceId", opts.sourceId);
  if (opts.sourceLabel) params.set("sourceLabel", opts.sourceLabel.slice(0, 120));
  return `/elite/diario?${params.toString()}`;
}
