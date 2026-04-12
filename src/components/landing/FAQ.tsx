"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FAQS = [
  { q: "Sou iniciante, consigo acompanhar?", a: "Sim! Embora utilizamos conceitos avançados (SMC/CRT), a didática do URA começa do zero. No VIP, você tem acesso a materiais introdutórios e pode tirar dúvidas diretamente no chat. Além disso, as lives são educativas." },
  { q: "Preciso de quanto capital para começar?", a: "Não existe mínimo, mas recomendamos começar com pouco para validar o aprendizado. Nossos alunos operam contas desde US$ 100 até mais de US$ 50.000. O foco inicial deve ser aprender a proteger o capital." },
  { q: "O que é SMC e CRT?", a: "SMC (Smart Money Concepts) é a leitura dos movimentos institucionais (bancos/fundos). CRT (Candle Range Theory) é uma técnica para identificar a intenção dentro da formação de um único candle. Juntos, eles oferecem entradas de altíssima precisão." },
  { q: "As lives ficam gravadas?", a: "Sim! Todas as lives operacionais e aulas de mentoria ficam gravadas e disponíveis exclusivamente para membros VIP. Você pode assistir no seu tempo." },
  { q: "Posso cancelar a assinatura?", a: "Com certeza. Não acreditamos em prender ninguém. Se você sentir que o conteúdo não é para você, pode cancelar a renovação a qualquer momento sem burocracia." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-lg bg-dark-900/50 overflow-hidden mb-4 transition-all hover:border-brand-500/30">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none">
        <span className="font-semibold text-white">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-brand-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-48 opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
        <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 bg-dark-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-xl mb-4"><HelpCircle className="w-8 h-8 text-brand-500" /></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Dúvidas Frequentes</h2>
          <p className="text-gray-400">Tire suas dúvidas antes de entrar para a elite do trading.</p>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </section>
  );
}
