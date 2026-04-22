/* ────────────────────────────────────────────
   Skeleton genérico pra loading.tsx das páginas Elite.
   Estrutura neutra (header + card + grid) que serve
   pra qualquer rota até o conteúdo real carregar.
   ──────────────────────────────────────────── */

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-white/[0.04]" />
          <div className="space-y-2.5">
            <div className="h-3 w-20 rounded bg-white/[0.04]" />
            <div className="h-6 w-32 rounded bg-white/[0.06]" />
            <div className="h-2.5 w-40 rounded bg-white/[0.03]" />
          </div>
        </div>
      </div>

      {/* Action card skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-2.5 w-28 rounded bg-white/[0.03]" />
            <div className="h-5 w-36 rounded bg-white/[0.06]" />
            <div className="h-3 w-44 rounded bg-white/[0.03]" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-5">
            <div className="w-5 h-5 rounded bg-white/[0.04] mb-3" />
            <div className="h-5 w-12 rounded bg-white/[0.06] mb-1" />
            <div className="h-3 w-16 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
