/**
 * UraCoinIcon — moeda dourada com a flame URA Labs no centro.
 * Drop-in replacement pro <Coins /> do lucide. Mantém viewBox 24x24.
 * className controla tamanho/cor via currentColor no stroke da borda; o gold
 * do miolo é fixo pra manter identidade visual da moeda.
 */
export function UraCoinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ura-coin-face" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <linearGradient id="ura-coin-flame" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFE4B5" />
        </linearGradient>
      </defs>
      {/* Moeda */}
      <circle cx="12" cy="12" r="10" fill="url(#ura-coin-face)" />
      {/* Borda dourada */}
      <circle cx="12" cy="12" r="10" fill="none" stroke="#92400E" strokeWidth="1.1" opacity="0.65" />
      {/* Anel interno sutil — efeito "cunhagem" */}
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
      {/* Flame URA Labs — proporção do logo da sidebar */}
      <path
        d="M12 6.2 c2.4 2.1 3.6 4.1 3.6 6.1 c0 2.1 -1.6 3.9 -3.6 3.9 c-2 0 -3.6 -1.8 -3.6 -3.9 c0 -1.2 0.5 -2.3 1.3 -3.3 c-0.1 0.8 0.2 1.5 0.8 1.5 c0.7 0 0.9 -0.9 0.6 -2 c-0.2 -0.8 -0.1 -1.6 0.9 -2.3 Z"
        fill="url(#ura-coin-flame)"
      />
    </svg>
  );
}
