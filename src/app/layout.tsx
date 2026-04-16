import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = "https://www.uralabs.com.br";
// GA4 measurement ID — público por natureza (roda no browser do visitante), então
// vive no código mesmo. Se um dia trocar, env NEXT_PUBLIC_GA_ID sobrescreve.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-DNVKN632RK";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "URA Labs — Trade Nasdaq & Crypto com SMC",
  description:
    "Comunidade de trade ao vivo. Calls diários, mentoria Elite e formação completa em Smart Money Concepts (SMC) e CRT. Cripto, Nasdaq e mesas proprietárias — do zero.",
  keywords: [
    "trading",
    "SMC",
    "smart money concepts",
    "CRT",
    "NASDAQ",
    "crypto",
    "mentoria de trade",
    "URA Labs",
    "mesa proprietária",
    "funded account",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "URA Labs — Trade Nasdaq & Crypto com SMC",
    description:
      "Calls diários, mentoria Elite e comunidade de traders sérios. 70% de acerto em março · +1.775% líquido · 1.700+ traders ativos.",
    type: "website",
    url: SITE_URL,
    siteName: "URA Labs",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "URA Labs — Trade Nasdaq & Crypto com SMC",
    description:
      "Calls diários, mentoria Elite e comunidade de traders sérios. 70% de acerto em março · +1.775% líquido.",
    creator: "@uralabstrading",
    site: "@uralabstrading",
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
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
