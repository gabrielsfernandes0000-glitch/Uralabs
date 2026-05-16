import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseAnon } from "@/lib/supabase";
import type { ModuleData, LessonData } from "@/lib/curriculum";
import { CURRICULUM as FALLBACK_CURRICULUM } from "@/lib/curriculum";

interface DbModule {
  id: string;
  number: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  accent_hex: string | null;
  sort_order: number;
}

interface DbLesson {
  id: string;
  module_id: string;
  sort_order: number;
  title: string;
  subtitle: string | null;
  duration: string | null;
  video_url: string | null;
  pdf_path: string | null;
  has_quiz: boolean;
  has_pdf: boolean;
  quiz: LessonData["quiz"];
  checklist: LessonData["checklist"];
}

function shapeModule(m: DbModule, lessons: DbLesson[]): ModuleData {
  return {
    id: m.id,
    number: m.number,
    title: m.title,
    subtitle: m.subtitle ?? "",
    description: m.description ?? "",
    accentHex: m.accent_hex ?? "#FF5500",
    lessons: lessons
      .filter((l) => l.module_id === m.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map<LessonData>((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.subtitle ?? "",
        duration: l.duration ?? "",
        hasQuiz: l.has_quiz,
        hasPdf: l.has_pdf,
        videoUrl: l.video_url ?? undefined,
        pdfPath: l.pdf_path ?? undefined,
        quiz: l.quiz ?? undefined,
        checklist: l.checklist ?? undefined,
      })),
  };
}

/** Fetch full curriculum (modules + lessons) from Supabase.
 * Falls back to the hardcoded TS curriculum if the query fails, so the site
 * never breaks because of a DB hiccup. Called from server components only.
 *
 * Cached cross-request via `unstable_cache` — catálogo só muda quando admin
 * publica/edita aulas. TTL 1h + tag pra invalidação on-demand quando
 * precisar (revalidateTag("curriculum") em qualquer mutação).
 *
 * Cache key bumped pra v2 em 2026-05-16 quando reseed da paleta dos módulos
 * (warm spectrum brand-aligned) precisou invalidar dados antigos do cache. */
export const getCurriculum = unstable_cache(
  async (): Promise<ModuleData[]> => {
    try {
      const sb = getSupabaseAnon();
      const [modulesRes, lessonsRes] = await Promise.all([
        sb.from("course_modules").select("*").eq("active", true).order("sort_order"),
        sb.from("lessons").select("*").eq("published", true),
      ]);

      if (modulesRes.error || lessonsRes.error) throw modulesRes.error ?? lessonsRes.error;
      if (!modulesRes.data?.length) throw new Error("no modules");

      const modules = modulesRes.data as DbModule[];
      const lessons = (lessonsRes.data ?? []) as DbLesson[];
      return modules.map((m) => shapeModule(m, lessons));
    } catch {
      return FALLBACK_CURRICULUM;
    }
  },
  ["curriculum-v2"],
  { tags: ["curriculum", "curriculum-v2"], revalidate: 3600 },
);

export async function getTotalLessons(): Promise<number> {
  const curr = await getCurriculum();
  return curr.reduce((sum, m) => sum + m.lessons.length, 0);
}

export async function findLessonFromDb(
  lessonId: string,
): Promise<{ lesson: LessonData; mod: ModuleData; index: number } | null> {
  const curr = await getCurriculum();
  for (const mod of curr) {
    const index = mod.lessons.findIndex((l) => l.id === lessonId);
    if (index !== -1) return { lesson: mod.lessons[index], mod, index };
  }
  return null;
}

export async function getAdjacentLessons(
  lessonId: string,
): Promise<{
  prev: { lesson: LessonData; mod: ModuleData } | null;
  next: { lesson: LessonData; mod: ModuleData } | null;
}> {
  const curr = await getCurriculum();
  const flat = curr.flatMap((m) => m.lessons.map((l) => ({ lesson: l, mod: m })));
  const idx = flat.findIndex((x) => x.lesson.id === lessonId);
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx !== -1 && idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
