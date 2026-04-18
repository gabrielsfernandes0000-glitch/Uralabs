import { getCurriculum } from "@/lib/curriculum.server";
import AulasClient from "./aulas-client";

export const dynamic = "force-dynamic";

export default async function AulasPage() {
  const curriculum = await getCurriculum();
  return <AulasClient curriculum={curriculum} />;
}
