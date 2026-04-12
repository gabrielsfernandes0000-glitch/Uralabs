import {
  Navbar,
  Hero,
  Results,
  TraderEvolution,
  Methodology,
  CourseModules,
  Services,
  About,
  TargetAudience,
  Pricing,
  FAQ,
  Footer,
  FloatingCTA,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-x-hidden relative">
      {/* Global background layers */}
      <div className="bg-noise" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="fixed inset-0 max-w-7xl mx-auto pointer-events-none z-0 hidden md:block border-l border-r border-white/[0.03]">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.02] -translate-x-1/2" />
      </div>
      <div className="fixed top-1/4 left-0 w-[300px] h-[600px] bg-brand-500/5 blur-[120px] -translate-x-1/2 pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-0 w-[300px] h-[600px] bg-blue-500/5 blur-[120px] translate-x-1/2 pointer-events-none z-0" />

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <Results />
        <TraderEvolution />
        <Methodology />
        <CourseModules />
        <Services />
        <About />
        <TargetAudience />
        <Pricing />
        <FAQ />
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}
