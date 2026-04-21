import type { ReactNode } from "react";

/**
 * Cabeçalho de seção de página (nível 1): barra de acento + título grande + subtítulo + slot de meta à direita.
 * Usado em Aulas, Calls, Prática, etc — unifica o visual e economiza boilerplate.
 *
 * Pra headers menores (dentro de cards), use um h3 direto com barra 1.5×5px.
 */
export function SectionHeader({
  accent,
  title,
  subtitle,
  meta,
}: {
  accent: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="w-1 h-7 rounded-full" style={{ backgroundColor: accent + "80" }} />
      <h2 className="text-[22px] font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <span className="text-[13px] text-white/40 font-medium">{subtitle}</span>}
      {meta && <div className="ml-auto">{meta}</div>}
    </div>
  );
}
