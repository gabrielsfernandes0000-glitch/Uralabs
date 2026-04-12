import { CheckCircle2, XCircle, ArrowUpRight, MinusCircle, Quote, Lock, TrendingUp, DollarSign, Activity, ArrowRight } from "lucide-react";

const TRADES = [
  { asset: "COTI", type: "LONG", result: "+181%", status: "WIN" },
  { asset: "PUMPFUN", type: "SHORT", result: "+70%", status: "WIN" },
  { asset: "BTC", type: "SHORT", result: "+112%", status: "WIN" },
  { asset: "JCT", type: "SHORT", result: "-70%", status: "LOSS" },
  { asset: "RESOLV", type: "LONG", result: "-100%", status: "LOSS" },
  { asset: "ICP", type: "LONG", result: "-100%", status: "LOSS" },
  { asset: "SOL", type: "LONG", result: "+41%", status: "WIN" },
  { asset: "SUI", type: "LONG", result: "+119%", status: "WIN" },
  { asset: "ETH", type: "LONG", result: "+60%", status: "WIN" },
  { asset: "ASTER", type: "LONG", result: "+75%", status: "WIN" },
  { asset: "ASTER", type: "LONG", result: "+26%", status: "WIN" },
  { asset: "PEPE", type: "SHORT", result: "+68%", status: "WIN" },
  { asset: "FARTCOIN", type: "SHORT", result: "-100%", status: "LOSS" },
  { asset: "SOL", type: "LONG", result: "+50%", status: "WIN" },
  { asset: "ETH", type: "LONG", result: "+34%", status: "WIN" },
  { asset: "XRP", type: "LONG", result: "-100%", status: "LOSS" },
  { asset: "PUMPFUN", type: "LONG", result: "+73%", status: "WIN" },
  { asset: "ETH", type: "LONG", result: "0%", status: "NEUTRAL" },
  { asset: "SEI", type: "LONG", result: "+118%", status: "WIN" },
  { asset: "XRP", type: "LONG", result: "+107%", status: "WIN" },
  { asset: "ADA", type: "LONG", result: "+34%", status: "WIN" },
  { asset: "MANA", type: "LONG", result: "+51%", status: "WIN" },
  { asset: "NIGHT", type: "SHORT", result: "-110%", status: "LOSS" },
  { asset: "SUI", type: "LONG", result: "+120%", status: "WIN" },
  { asset: "PIPPIN", type: "SHORT", result: "+130%", status: "WIN" },
];

function assetIcon(asset: string) {
  if (asset === "BTC") return <DollarSign className="w-5 h-5" />;
  if (asset === "ETH") return <Activity className="w-5 h-5" />;
  return <TrendingUp className="w-5 h-5" />;
}

function assetColor(asset: string) {
  if (asset === "BTC" || asset === "ETH") return "bg-orange-500/10 text-orange-500";
  if (asset === "SOL" || asset === "SUI") return "bg-purple-500/10 text-purple-500";
  if (asset.includes("PUMPFUN")) return "bg-pink-500/10 text-pink-500";
  return "bg-blue-500/10 text-blue-500";
}

export function Results() {
  return (
    <section id="results" className="py-24 bg-dark-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-400 tracking-wide uppercase">Relatório de Performance</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Transparência Total</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Sem letras miúdas. Abaixo você encontra o relatório exato das últimas operações enviadas na área VIP, na ordem em que aconteceram.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-dark-900/50 border border-brand-500/20 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">PnL Total Somado</span>
            <span className="text-5xl font-bold text-brand-500 flex items-center gap-1">+850%<ArrowUpRight className="w-6 h-6 text-brand-500/50" /></span>
            <span className="text-xs text-gray-500 mt-2">Soma bruta das %</span>
          </div>
          <div className="bg-dark-900/50 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Winrate (Taxa de Acerto)</span>
            <span className="text-5xl font-bold text-green-500">72%</span>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 18 Wins</span>
              <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> 7 Loss</span>
            </div>
          </div>
          <div className="bg-dark-900/50 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Crescimento da Banca</span>
            <span className="text-5xl font-bold text-blue-500">+85%</span>
            <span className="text-xs text-gray-500 mt-2 text-center">Gestão de 10% por trade em 45 dias</span>
          </div>
        </div>

        {/* Trade table */}
        <div className="bg-dark-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-24 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-red-500 to-brand-500" />
          <div className="hidden md:grid grid-cols-4 gap-4 p-5 bg-white/5 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div>Ativo</div>
            <div className="text-center">Operação</div>
            <div className="text-right">Resultado (%)</div>
            <div className="text-center">Status</div>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto no-scrollbar">
            {TRADES.map((t, i) => (
              <div key={i} className="group p-5 grid grid-cols-2 md:grid-cols-4 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${assetColor(t.asset)}`}>{assetIcon(t.asset)}</div>
                  <div>
                    <p className="font-bold text-white text-sm md:text-base">{t.asset}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Crypto Futures</p>
                  </div>
                </div>
                <div className="flex justify-end md:justify-center">
                  <span className={`text-xs font-bold px-3 py-1 rounded border uppercase ${t.type === "LONG" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>{t.type}</span>
                </div>
                <div className="text-left md:text-right">
                  <span className="md:hidden text-xs text-gray-500 mr-2">Resultado:</span>
                  <span className={`font-mono font-bold text-lg ${t.status === "WIN" ? "text-green-400" : t.status === "LOSS" ? "text-red-400" : "text-yellow-400"}`}>{t.result}</span>
                </div>
                <div className="flex justify-end md:justify-center">
                  {t.status === "WIN" && <div className="flex items-center gap-2 text-green-500"><CheckCircle2 className="w-5 h-5" /><span className="hidden md:inline text-xs font-bold">WIN</span></div>}
                  {t.status === "LOSS" && <div className="flex items-center gap-2 text-red-500"><XCircle className="w-5 h-5" /><span className="hidden md:inline text-xs font-bold">LOSS</span></div>}
                  {t.status === "NEUTRAL" && <div className="flex items-center gap-2 text-yellow-500"><MinusCircle className="w-5 h-5" /><span className="hidden md:inline text-xs font-bold">0x0</span></div>}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white/5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Lock className="w-4 h-4" />
              <span>Histórico completo disponível no canal #resultados do Discord.</span>
            </div>
            <a href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors">
              Ver comunidade no Discord <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Social proof */}
        <div className="relative w-full mx-auto mt-24">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-brand-500/10 rounded-full"><Quote className="w-8 h-8 text-brand-500 fill-brand-500/20" /></div>
            </div>
            <h3 className="text-3xl font-bold mb-4">A Voz da Comunidade</h3>
            <p className="text-gray-400 max-w-xl mx-auto">Resultados falam mais alto que promessas. Veja o que acontece quando você aplica o método URA LABS com disciplina.</p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-brand-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-700" />
            <div className="relative bg-dark-900/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-2 md:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.postimg.cc/gjckt3jC/Design-sem-nome-(1).png" alt="Feedbacks da Comunidade URA Labs" className="w-full h-auto rounded-xl object-cover border border-white/5 opacity-95 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-dark-900 border border-brand-500/30 px-6 py-2 rounded-full shadow-lg z-20 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-700 border border-dark-900" />
                <div className="w-6 h-6 rounded-full bg-gray-600 border border-dark-900" />
                <div className="w-6 h-6 rounded-full bg-gray-500 border border-dark-900" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Junte-se a +480 alunos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
