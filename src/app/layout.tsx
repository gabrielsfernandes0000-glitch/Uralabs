import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "URA LABS — SMC & CRT Mastery",
  description:
    "O único ecossistema que une Sala de Sinais Ao Vivo com Mentoria Profissional (SMC). Aprenda a operar como Smart Money.",
  keywords: ["trading", "SMC", "CRT", "NASDAQ", "crypto", "mentoria", "URA Labs"],
  openGraph: {
    title: "URA LABS — SMC & CRT Mastery",
    description:
      "Aprenda a Técnica. Lucre no Processo. Mentoria profissional de trade com Smart Money Concepts.",
    type: "website",
    url: "https://www.uralabs.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-dark-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
