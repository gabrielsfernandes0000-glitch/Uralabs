export default function AulasLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-10">
        <div className="space-y-3">
          <div className="h-8 w-48 rounded bg-white/[0.06]" />
          <div className="h-4 w-72 rounded bg-white/[0.03]" />
        </div>
      </div>

      {/* Module skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04]" />
            <div className="h-5 w-32 rounded bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="rounded-xl border border-white/[0.06] bg-[#0e0e10] p-5 h-28" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
