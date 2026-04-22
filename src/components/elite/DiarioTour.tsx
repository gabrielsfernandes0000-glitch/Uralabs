"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { ProductTour, type TourStep } from "./ProductTour";
import type { Journey } from "@/lib/journey";

interface Props {
  /** Ativa o tour. Controla quando abrir (pós-onboarding, botão "Tour", etc). */
  active: boolean;
  /** Callback quando o user conclui ou pula. Fecha o tour no parent. */
  onDone: () => void;
  /** Troca a jornada pra poder highlightar elementos de cada uma. */
  onJourneyChange?: (j: Journey) => void;
}

/** Espera o próximo animation frame + 250ms — dá tempo do React re-renderizar
 *  o DOM após setJourney, e do `animate-in-up` assentar antes de medir rect. */
function waitForDom(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 250);
    });
  });
}

/**
 * Tour guiado da página /elite/diario. 14 passos:
 *
 *  1. Intro (modal central)
 *  2. Status bar (3 dots)
 *  3. Chips de jornada
 *  4. Prep sheet       ← troca pra "antes" automaticamente
 *  5. Ferramentas pré-trade
 *  6. Import toggle    ← troca pra "durante"
 *  7. Form de trade
 *  8. Trades de hoje
 *  9. Hero KPIs        ← troca pra "depois"
 *  10. Metas
 *  11. Calendar
 *  12. Stats
 *  13. Histórico
 *  14. Outro (modal central)
 *
 * Sem passos "de aviso" redundantes — a troca de jornada é silenciosa e o
 * spotlight cai direto no elemento novo, com 250ms de espera pro DOM montar.
 */
export function DiarioTour({ active, onDone, onJourneyChange }: Props) {
  const { completeTour } = useProgress();
  const [_force, setForce] = useState(0);

  const goTo = (j: Journey) => async () => {
    onJourneyChange?.(j);
    setForce((n) => n + 1);
    await waitForDom();
  };

  const steps: TourStep[] = useMemo(
    () => [
      {
        id: "intro",
        target: "",
        floating: true,
        title: "Bem-vindo ao Diário",
        body:
          "Esse é o centro de disciplina do trader — onde você planeja antes, registra durante e revisa depois do mercado.\n\nVou te mostrar onde cada coisa fica. Leva menos de 1 minuto.",
      },
      {
        id: "status-bar",
        target: "journey-status-bar",
        title: "Status do dia",
        body:
          "3 pontos que mostram se você está pronto pra operar:\n\n• Prep sheet preenchido\n• Readiness (sessão, emoção, drawdown)\n• Tilt (sinais de descontrole)\n\nVerde = OK. Âmbar = atenção. Vermelho = pare.",
        placement: "bottom",
      },
      {
        id: "journeys",
        target: "journey-tabs",
        title: "Três jornadas do dia",
        body:
          "A página muda automaticamente pelo horário BRT:\n\n• Antes (até 10h30) — planejar\n• Durante (10h30 às 17h) — registrar\n• Depois (após 17h e fim de semana) — revisar\n\nPode trocar manual clicando.",
        placement: "bottom",
      },
      {
        id: "prep-sheet",
        target: "prep-sheet",
        title: "Plano pré-mercado",
        body:
          "Define como você está emocionalmente, viés do dia, níveis-chave e plano de ação.\n\nTrader sem plano é casino. Esse é o primeiro hábito.",
        placement: "top",
        onBeforeShow: goTo("antes"),
      },
      {
        id: "tools",
        target: "pre-trade-tools",
        title: "Ferramentas pré-trade",
        body:
          "Calculadora de posição por risco e checklist de confirmação. São opcionais, mas evitam erros básicos.",
        placement: "top",
      },
      {
        id: "import-toggle",
        target: "import-toggle",
        title: "Importar trades (opcional)",
        body:
          "Se conectou corretora, importa automaticamente. Senão, usa CSV do export da corretora.\n\nPode registrar tudo manual também — o form abaixo cobre.",
        placement: "bottom",
        onBeforeShow: goTo("durante"),
      },
      {
        id: "form",
        target: "trade-journal-form",
        title: "Form de registro",
        body:
          "Preenche símbolo, timeframe, direção, preços, setup e (importante) os erros cometidos.\n\nO R-multiple é calculado sozinho. Erros tagueados viram seus dados de evolução.",
        placement: "top",
      },
      {
        id: "today-trades",
        target: "today-trades",
        title: "Trades do dia",
        body:
          "Aparece aqui conforme você registra. Pra detalhes, edit inline ou screenshot, vá pra jornada Depois.",
        placement: "top",
      },
      {
        id: "hero-kpis",
        target: "hero-kpis",
        title: "KPIs do dia e período",
        body:
          "R de hoje, R acumulado na janela, expectancy por trade e streak de disciplina (dia só conta se seguiu o plano + zero erro grave).",
        placement: "bottom",
        onBeforeShow: goTo("depois"),
      },
      {
        id: "goals",
        target: "goals-strip",
        title: "Sua meta semanal",
        body:
          "A meta que você criou no onboarding aparece aqui com progresso em tempo real. Expande pra editar ou criar mais metas.",
        placement: "bottom",
      },
      {
        id: "calendar",
        target: "trade-calendar",
        title: "Calendar P&L",
        body:
          "Cada dia do mês com R total e win/loss. Cor indica intensidade — verde forte = dia foda, vermelho forte = dia ruim.",
        placement: "top",
      },
      {
        id: "stats",
        target: "stats-sections",
        title: "Aprofundar",
        body:
          "Três seções colapsáveis:\n• O que está funcionando/drenando (setups e erros)\n• Quando você opera melhor (dia da semana e hora)\n• Stats completos (win rate, profit factor, extremos)",
        placement: "top",
      },
      {
        id: "history",
        target: "trades-history",
        title: "Histórico com edit inline",
        body:
          "Todos os trades. Clica pra expandir, vê candles do dia, edit inline, apaga. Filtra por setup, erro, símbolo.\n\nPaginado — carrega 10 dias por vez.",
        placement: "top",
      },
      {
        id: "outro",
        target: "",
        floating: true,
        title: "Pronto, é seu",
        body:
          "Você pode reabrir esse tour a qualquer momento no botão \"Tour guiado\" no topo da página.\n\nA disciplina de registrar todo trade é o hábito de maior ROI de um trader. Boa operação.",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onJourneyChange, _force]
  );

  if (!active) return null;

  const handleFinish = async () => {
    await completeTour();
    onDone();
  };

  const handleSkip = async () => {
    await completeTour();
    onDone();
  };

  return <ProductTour steps={steps} onFinish={handleFinish} onSkip={handleSkip} />;
}
