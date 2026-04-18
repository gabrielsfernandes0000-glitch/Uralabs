import { redirect } from "next/navigation";
import { getSession, canAccessPlatform } from "@/lib/session";

export default async function TurmaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!canAccessPlatform(session)) redirect("/login");
  return <>{children}</>;
}
