import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getUserBalance,
  getActiveBoxesWithPrizes,
  getRecentOpenings,
} from "@/lib/ura-coin";
import { StoreClient } from "./store-client";

export const dynamic = "force-dynamic";

export default async function LojaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [balance, boxes, recent] = await Promise.all([
    getUserBalance(session.userId),
    getActiveBoxesWithPrizes(),
    getRecentOpenings(session.userId, 80),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <StoreClient
        initialBalance={balance}
        boxes={boxes}
        recentOpenings={recent}
      />
    </div>
  );
}
