import { getCurriculum } from "@/lib/curriculum.server";
import AulasClient from "./aulas-client";

/* Página não é mais force-dynamic — curriculum.server já tem unstable_cache
   (TTL 1h + tag "curriculum"). Deixar o Next.js cachear o RSC output permite
   scroll restoration funcionar no back navigation (browser e router.back()). */
export const revalidate = 3600;

export default async function AulasPage() {
  const curriculum = await getCurriculum();
  return <AulasClient curriculum={curriculum} />;
}
