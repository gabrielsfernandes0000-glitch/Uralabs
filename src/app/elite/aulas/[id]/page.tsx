import Link from "next/link";
import { findLessonFromDb, getAdjacentLessons } from "@/lib/curriculum.server";
import LessonClient from "./lesson-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const found = await findLessonFromDb(id);

  if (!found) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white/30 text-[15px]">Aula não encontrada</p>
        <Link href="/elite/aulas" className="text-brand-500 text-[13px] mt-4 hover:underline">
          Voltar para aulas
        </Link>
      </div>
    );
  }

  const { lesson, mod, index } = found;
  const { prev, next } = await getAdjacentLessons(id);

  return (
    <LessonClient
      lessonId={id}
      lesson={lesson}
      mod={mod}
      index={index}
      prev={prev}
      next={next}
    />
  );
}
