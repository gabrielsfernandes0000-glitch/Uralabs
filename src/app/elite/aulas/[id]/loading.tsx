export default function AulaDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button */}
      <div className="h-4 w-20 rounded bg-white/[0.03]" />

      {/* Video area */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] aspect-video" />

      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 w-64 rounded bg-white/[0.06]" />
        <div className="h-4 w-96 rounded bg-white/[0.03]" />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-6 h-16" />
      ))}
    </div>
  );
}
