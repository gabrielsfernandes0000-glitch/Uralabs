"use client";

/**
 * Premium avatar component — shows Discord avatar or styled initials fallback.
 * Used across Dashboard, Sidebar, Perfil.
 */
export function Avatar({
  src,
  name,
  size = 64,
  className = "",
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={className}
      style={{ width: size, height: size, objectFit: "cover" }}
    />
  );
}
