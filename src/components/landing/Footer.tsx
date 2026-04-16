import { Flame, Video, MessageCircle, AtSign } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-brand-500 rounded-lg"><Flame className="w-5 h-5 text-white fill-white" /></div>
              <span className="text-xl font-bold text-white">URA <span className="text-brand-500">LABS</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">Sinais diários, mentoria ao vivo e formação completa em Smart Money Concepts. Cripto e NASDAQ.</p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.youtube.com/@uranickk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Video className="w-5 h-5" /></a>
              <a href="https://x.com/uralabstrading" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><AtSign className="w-5 h-5" /></a>
              <a href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#results" className="hover:text-brand-500 transition-colors">Resultados</a></li>
              <li><a href="#about" className="hover:text-brand-500 transition-colors">Sobre</a></li>
              <li><a href="#pricing" className="hover:text-brand-500 transition-colors">Planos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="opacity-70 cursor-not-allowed">Termos de Uso</span></li>
              <li><span className="opacity-70 cursor-not-allowed">Privacidade</span></li>
              <li><a href="https://discord.gg/SrxZSGN6" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8">
          <p className="text-xs text-gray-600 text-justify mb-4">
            <strong>Aviso de Risco:</strong> O trading de criptomoedas, ações e derivativos envolve riscos significativos e pode não ser adequado para todos os investidores. O desempenho passado não é garantia de resultados futuros. O conteúdo fornecido neste site, no canal do YouTube e no Discord é apenas para fins educacionais e não deve ser interpretado como aconselhamento financeiro ou recomendação de investimento. Você é inteiramente responsável por suas próprias decisões de trading.
          </p>
          <div className="text-center text-gray-600 text-sm">&copy; {new Date().getFullYear()} URA LABS. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
