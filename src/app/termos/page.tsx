import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso · URA Labs",
  description:
    "Termos de uso do site URA Labs e das assinaturas VIP e Elite.",
  robots: { index: true, follow: true },
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-dark-950 text-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar pro site
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Termos de uso
        </h1>
        <p className="text-gray-400 text-sm mb-12">
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Sobre nós</h2>
            <p>
              URA Labs é uma comunidade educacional de trade focada em Smart Money
              Concepts (SMC), CRT, Cripto e Nasdaq. Oferecemos conteúdo gratuito
              no Discord e planos pagos de Sinais (VIP) e Mentoria (Elite).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Natureza do conteúdo</h2>
            <p>
              Todo o conteúdo publicado em uralabs.com.br, no canal do YouTube,
              nas redes sociais e no Discord é de caráter <strong>puramente educacional</strong>.
              Não constitui recomendação de investimento, aconselhamento financeiro
              ou promessa de resultado. Você é inteiramente responsável pelas suas
              decisões de trading.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Riscos do trade</h2>
            <p>
              O trading de criptomoedas, ações, futuros e derivativos envolve risco
              de perda total do capital investido. Resultados passados não garantem
              resultados futuros. Não opere com dinheiro que você não pode perder.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Assinaturas VIP e Elite</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>VIP:</strong> acesso aos calls e canais exclusivos pelo
                período contratado (mensal, semestral ou anual). Renovação não é
                automática — ao fim do período o acesso expira.
              </li>
              <li>
                <strong>Elite:</strong> acesso à mentoria, plataforma de aulas e
                comunidade Elite pelo período de 6 meses. Não há renovação automática.
              </li>
              <li>
                <strong>Garantia de 7 dias:</strong> devolução integral do valor
                se solicitada dentro dos 7 primeiros dias corridos da compra,
                via ticket no Discord.
              </li>
              <li>
                Após os 7 dias, o acesso é considerado utilizado e não há
                reembolso proporcional.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Uso da comunidade</h2>
            <p>
              A comunidade Discord é um ambiente compartilhado. Respeite outros
              membros, não compartilhe conteúdo protegido por direitos autorais
              sem autorização, não divulgue seus acessos (login/VIP/Elite) com
              terceiros e não faça cross-sell de outros grupos/mentorias dentro
              do servidor.
            </p>
            <p>
              Violação dessas regras pode resultar em advertência, timeout ou
              banimento sem reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Propriedade intelectual</h2>
            <p>
              Todo conteúdo das aulas, calls, análises e materiais da URA Labs é
              de propriedade da URA Labs. É proibido gravar, redistribuir ou
              comercializar esse conteúdo sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contato</h2>
            <p>
              Qualquer dúvida sobre estes termos, abra um ticket no Discord
              (categoria &quot;Suporte&quot;) ou escreva pro time administrativo
              pelos canais oficiais.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
