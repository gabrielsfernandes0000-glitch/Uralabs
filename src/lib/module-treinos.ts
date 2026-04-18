/* ────────────────────────────────────────────
   Module Treinos — shared source of truth
   Maps each treino to the lesson that unlocks it.
   Consumed by /elite/aulas/[id] ("Pratique" section) and /elite/pratica.
   ──────────────────────────────────────────── */

export interface ModuleTreino {
  id: string;
  title: string;
  desc: string;
  requiredLesson: string;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
}

export const MODULE_TREINOS: Record<string, ModuleTreino[]> = {
  base: [
    { id: "t-candles", title: "Leitura de Candle", desc: "Identifique o que cada candle diz sobre compradores vs vendedores.", requiredLesson: "leitura-candle", difficulty: "Iniciante" },
    { id: "t-risco", title: "Calcule o Risco", desc: "Posicione stop e alvo. Qual o tamanho do lote?", requiredLesson: "risco", difficulty: "Iniciante" },
  ],
  "leitura-smc": [
    { id: "t-obs", title: "Marque os Order Blocks", desc: "Encontre as zonas onde os institucionais se posicionaram.", requiredLesson: "order-blocks", difficulty: "Intermediário" },
    { id: "t-fvg", title: "Identifique FVGs", desc: "Marque os Fair Value Gaps e diga quais serão preenchidos.", requiredLesson: "fvg-breaker", difficulty: "Intermediário" },
    { id: "t-premium", title: "Premium ou Discount?", desc: "Defina as zonas usando Fibonacci 50%.", requiredLesson: "premium-discount", difficulty: "Intermediário" },
    { id: "t-liquidez", title: "Onde Está a Liquidez?", desc: "Mapeie os pools que os big players vão buscar.", requiredLesson: "liquidez", difficulty: "Intermediário" },
  ],
  estrategia: [
    { id: "t-sessoes", title: "Qual Sessão Operar?", desc: "Identifique a sessão e o comportamento esperado.", requiredLesson: "sessoes", difficulty: "Avançado" },
    { id: "t-amd", title: "Leitura AMD Completa", desc: "Identifique Acumulação, Manipulação e Distribuição.", requiredLesson: "amd", difficulty: "Avançado" },
    { id: "t-bias", title: "Monte o Viés do Dia", desc: "Defina se o dia é bullish ou bearish.", requiredLesson: "daily-bias", difficulty: "Avançado" },
  ],
  execucao: [
    { id: "t-entrada", title: "Execute o Trade", desc: "Cenário completo: zona, entrada, stop e alvo.", requiredLesson: "entrada-saida", difficulty: "Avançado" },
  ],
};

/** Returns all treinos linked to a specific lesson id. */
export function getTreinosForLesson(lessonId: string): ModuleTreino[] {
  const all = Object.values(MODULE_TREINOS).flat();
  return all.filter((t) => t.requiredLesson === lessonId);
}
