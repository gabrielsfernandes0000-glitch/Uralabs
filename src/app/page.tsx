import {
  Navbar,
  Hero,
  HowItWorks,
  Results,
  CallPreview,
  DiscordWidget,
  AboutMethod,
  Pricing,
  FAQ,
  Footer,
  FloatingCTA,
  SocialProofToasts,
  StickyBar,
} from "@/components/landing";
import { getLPGuildData } from "@/lib/discord-lp";

export const revalidate = 300;

export default async function Home() {
  const discordData = await getLPGuildData();

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-x-hidden relative">
      <div className="bg-noise" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="fixed inset-0 max-w-7xl mx-auto pointer-events-none z-0 hidden md:block border-l border-r border-white/[0.03]">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.02] -translate-x-1/2" />
      </div>
      <div className="fixed top-1/4 left-0 w-[300px] h-[600px] bg-brand-500/5 blur-[120px] -translate-x-1/2 pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-0 w-[300px] h-[600px] bg-brand-500/3 blur-[120px] translate-x-1/2 pointer-events-none z-0" />

      <Navbar />
      <StickyBar memberCount={discordData.memberCount} onlineCount={discordData.onlineCount} />

      <main className="relative z-10">
        {/* 1. Hook — dor + CTA Discord (grátis) */}
        <Hero onlineCount={discordData.onlineCount} memberCount={discordData.memberCount} />

        {/* 2. Orienta — 3 passos pra tráfego frio entender o caminho */}
        <HowItWorks />

        {/* 3. Community — mostra o Discord (conversão principal pra tráfego frio) */}
        <DiscordWidget data={discordData} />

        {/* 4. Proof — números + trades + testimonials (esquenta pra venda) */}
        <Results />

        {/* 5. Show call format — como rola uma call no VIP */}
        <CallPreview />

        {/* 6. Authority — URA + método + jornada */}
        <AboutMethod />

        {/* 7. Convert — pricing + comparação detalhada + garantia */}
        <Pricing />

        {/* 8. Resolve — FAQ */}
        <FAQ />
      </main>

      <Footer />
      <FloatingCTA />
      <SocialProofToasts messages={discordData.messages} />
    </div>
  );
}
