import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade · URA Labs",
  description:
    "Como a URA Labs coleta, usa e protege os dados dos membros e visitantes.",
  robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
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
          Política de privacidade
        </h1>
        <p className="text-gray-400 text-sm mb-12">
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Dados que coletamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Identificação:</strong> nome/username, email e Discord
                user ID fornecidos por você na compra ou ao entrar no servidor.
              </li>
              <li>
                <strong>Pagamento:</strong> valor, método (PIX, cartão, crypto),
                histórico de transações. Dados sensíveis de cartão são processados
                pelas maquininhas (Stripe, Abacate Pay) — nunca passam pelos
                nossos servidores.
              </li>
              <li>
                <strong>Uso do site:</strong> analytics anônimo (páginas visitadas,
                origem do tráfego) via Google Analytics 4, com IP anonimizado.
              </li>
              <li>
                <strong>Atividade no Discord:</strong> status público (online,
                idle), cargos e mensagens em canais públicos. Mensagens privadas
                (DMs) não são coletadas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Para que usamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Liberar e controlar seu acesso aos planos contratados</li>
              <li>Comunicar atualizações, renovações e avisos importantes</li>
              <li>Melhorar o conteúdo e o produto (analytics agregado)</li>
              <li>Cumprir obrigações fiscais e contábeis</li>
            </ul>
            <p>
              <strong>Nunca vendemos seus dados</strong> nem compartilhamos com
              terceiros fora dos serviços essenciais (Stripe, Abacate Pay,
              Supabase, Discord, Google Analytics).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Onde os dados vivem</h2>
            <p>
              Dados de membros e transações ficam hospedados em infraestrutura
              Supabase (servidores em São Paulo, Brasil). Dados de pagamento
              ficam nos provedores (Stripe, Abacate Pay, NOWPayments). Analytics
              ficam no Google Analytics 4.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Seus direitos (LGPD)</h2>
            <p>
              A qualquer momento você pode solicitar:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmação e acesso aos seus dados</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>
                Exclusão dos dados (exceto aqueles que precisamos manter por
                obrigação legal, como registros fiscais)
              </li>
              <li>Portabilidade dos dados pra outro serviço</li>
            </ul>
            <p>
              Pra exercer qualquer direito, abra um ticket no Discord ou escreva
              pelos canais oficiais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Cookies</h2>
            <p>
              Usamos cookies essenciais (sessão, login) e cookies de analytics
              (Google Analytics 4). Você pode bloqueá-los no seu navegador sem
              perder funcionalidades principais do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contato</h2>
            <p>
              Dúvidas ou solicitações relacionadas à privacidade, abra um ticket
              no Discord (categoria &quot;Suporte&quot;).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
