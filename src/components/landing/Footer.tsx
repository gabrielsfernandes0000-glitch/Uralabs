import Link from "next/link";
import { Flame, Video, MessageCircle, AtSign } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/[0.05] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center"><Flame className="w-4 h-4 text-white" strokeWidth={2.5} /></div>
              <span className="text-[15px] font-semibold tracking-tight text-white">URA <span className="text-brand-500">Labs</span></span>
            </div>
            <p className="text-white/55 text-[13px] leading-relaxed max-w-sm">Sinais diários, mentoria ao vivo e formação completa em Smart Money Concepts. Cripto e Nasdaq.</p>
            <div className="flex gap-3 mt-6">
              <a aria-label="YouTube" href="https://www.youtube.com/@uranickk" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md surface-card flex items-center justify-center text-white/55 hover:text-white hover:border-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"><Video className="w-4 h-4" strokeWidth={2} /></a>
              <a aria-label="X (Twitter)" href="https://x.com/uralabstrading" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md surface-card flex items-center justify-center text-white/55 hover:text-white hover:border-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"><AtSign className="w-4 h-4" strokeWidth={2} /></a>
              <a aria-label="Discord" href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md surface-card flex items-center justify-center text-white/55 hover:text-white hover:border-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"><MessageCircle className="w-4 h-4" strokeWidth={2} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-[12px] font-medium mb-3">Navegação</h4>
            <ul className="space-y-2 text-[13px] text-white/55">
              <li><a href="#results" className="hover:text-white transition-colors">Resultados</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Planos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[12px] font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-[13px] text-white/55">
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><a href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.05] pt-8">
          <p className="text-[11px] text-white/35 leading-relaxed mb-4">
            <span className="text-white/55 font-medium">Aviso de risco:</span> O trading de criptomoedas, ações e derivativos envolve riscos significativos e pode não ser adequado para todos os investidores. O desempenho passado não é garantia de resultados futuros. O conteúdo fornecido neste site, no canal do YouTube e no Discord é apenas para fins educacionais e não deve ser interpretado como aconselhamento financeiro ou recomendação de investimento. Você é inteiramente responsável por suas próprias decisões de trading.
          </p>
          <div className="text-center text-white/35 text-[12px]">&copy; {new Date().getFullYear()} URA Labs. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
