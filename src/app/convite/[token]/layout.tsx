import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ConviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${instrumentSerif.variable} min-h-screen w-full relative overflow-x-hidden`}
      style={{ backgroundColor: "#06060a" }}
    >
      {/* Ambient lighting — sutil, fixo, não parece gurú */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,85,0,0.08), transparent 60%), radial-gradient(ellipse 40% 40% at 50% 100%, rgba(201,164,97,0.05), transparent 70%)",
        }}
      />
      {/* Noise texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Vinheta superior e inferior */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
