import { redirect } from "next/navigation";
import { getSession, canAccessPlatform } from "@/lib/session";
import { EliteSidebar } from "@/components/elite/Sidebar";
import { getUserBalance } from "@/lib/ura-coin";

export default async function EliteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // VIP and Elite both access the platform (VIP gets aulas + dashboard;
  // Elite-only sections enforce an extra check at the page level).
  if (!canAccessPlatform(session)) {
    redirect("/login?error=not_authorized");
  }

  // Saldo URA Coin pra mostrar no sidebar. Falha silenciosa se DB não responder —
  // sidebar simplesmente esconde a pill, plataforma continua navegável.
  let coinBalance: number | undefined;
  try {
    const bal = await getUserBalance(session.userId);
    coinBalance = bal.balance;
  } catch {
    coinBalance = undefined;
  }

  return (
    <div className="min-h-screen bg-dark-950 flex relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,85,0,0.03),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
      </div>

      <EliteSidebar session={session} coinBalance={coinBalance} />

      <main className="relative z-10 flex-1 ml-0 lg:ml-[272px] min-h-screen">
        <div className="px-5 py-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
