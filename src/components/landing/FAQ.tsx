"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FAQS = [
  { q: "Sou iniciante, consigo acompanhar?", a: "Sim! A didática começa do zero. VIP já vem com a plataforma de aulas gravadas (14 aulas do básico ao avançado em SMC), quiz por aula, PDFs e tira-dúvidas no chat. Elite adiciona calls ao vivo, mesa prop e treinos interativos." },
  { q: "Preciso de quanto capital para começar?", a: "Não existe mínimo. Nossos alunos operam contas desde US$ 100 até mais de US$ 50.000. O foco inicial deve ser proteger o capital enquanto aprende." },
  { q: "O que é SMC e CRT?", a: "SMC (Smart Money Concepts) é a leitura dos movimentos de bancos e fundos. CRT (Candle Range Theory) identifica a intenção dentro de um único candle. Juntos, oferecem entradas de altíssima precisão." },
  { q: "As lives ficam gravadas?", a: "Sim! Todas as lives e aulas ficam gravadas na nossa plataforma exclusiva. Você pode assistir e reassistir no seu tempo, além do currículo estruturado com aulas gravadas." },
  { q: "Posso cancelar a assinatura?", a: "Com certeza. Sem burocracia. Se sentir que não é para você, cancela a renovação a qualquer momento." },
  { q: "Procuro dinheiro fácil, o URA Labs é pra mim?", a: "Não. Se procura 'ficar rico semana que vem' ou acha que trading é loteria, não entre. Aqui tratamos trade como profissão — exige estudo, disciplina e gestão de risco." },
  { q: "Já opero mas estou estagnado, vale a pena?", a: "Sim, esse é o perfil ideal. A maioria dos membros Elite já operava mas estava preso em indicadores atrasados. A transição pra leitura institucional (SMC/CRT) é o que destrava a consistência." },
  { q: "Vocês mostram os trades que dão errado?", a: "Sim, tudo. Nosso relatório de março teve 70% de acerto — isso significa 30% de loss. Mostramos tudo porque acreditamos que transparência gera confiança." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.05] rounded-md bg-dark-950 overflow-hidden mb-2 transition-colors hover:border-white/[0.12]">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer gap-4">
        <span className="text-[14px] font-medium text-white">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/60 shrink-0" strokeWidth={2} />
          : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" strokeWidth={2} />}
      </button>
      <div className={`px-5 overflow-hidden transition-all duration-200 ease-out ${open ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
        <p className="text-[13px] text-white/55 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 bg-dark-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md surface-card mb-4">
            <HelpCircle className="w-4 h-4 text-white/60" strokeWidth={2} />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">Dúvidas frequentes</h2>
          <p className="text-[14px] text-white/50">O que mais perguntam antes de entrar.</p>
        </div>
        <div>
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </section>
  );
}
