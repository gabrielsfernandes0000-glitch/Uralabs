import { redirect } from "next/navigation";
import { getSession, canAccessEliteOnly } from "@/lib/session";

export default async function EliteOnlyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!canAccessEliteOnly(session)) redirect("/elite/desbloquear");
  return <>{children}</>;
}
