import { type ComponentProps } from "react";

type ButtonOrAnchorProps = Omit<ComponentProps<"button">, "onClick"> &
  Omit<ComponentProps<"a">, "onClick"> & {
    variant?: "primary" | "secondary" | "outline";
    fullWidth?: boolean;
    href?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  };

export function Button({
  variant = "primary",
  fullWidth = false,
  children,
  className = "",
  href,
  ...props
}: ButtonOrAnchorProps) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-base font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer no-underline";

  const variants = {
    primary:
      "bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] focus:ring-brand-500 border border-transparent",
    secondary:
      "bg-white text-dark-950 hover:bg-gray-100 focus:ring-white border border-transparent",
    outline:
      "bg-transparent border border-gray-700 text-white hover:border-brand-500 hover:text-brand-400 focus:ring-gray-700",
  };

  const w = fullWidth ? "w-full" : "";
  const cls = `${base} ${variants[variant]} ${w} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
