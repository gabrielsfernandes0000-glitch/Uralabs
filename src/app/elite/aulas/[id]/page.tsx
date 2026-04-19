import Link from "next/link";
import { findLessonFromDb, getAdjacentLessons } from "@/lib/curriculum.server";
import { getSupabaseAnon } from "@/lib/supabase";
import { eventCategoriesForLesson, eventCategory } from "@/lib/economic-events";
import LessonClient, { type UpcomingEventPreview } from "./lesson-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Busca próximos 7 dias de eventos relevantes pras categorias da aula. Max 3 itens. */
async function loadRelevantEvents(lessonId: string): Promise<UpcomingEventPreview[]> {
  const categories = eventCategoriesForLesson(lessonId);
  if (categories.length === 0) return [];
  try {
    const sb = getSupabaseAnon();
    const todayStr = new Date().toISOString().slice(0, 10);
    const in7 = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
    const { data } = await sb
      .from("economic_events")
      .select("id, event_date, event_time, country, event, impact")
      .gte("event_date", todayStr)
      .lte("event_date", in7)
      .in("impact", ["high", "medium"])
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(30);
    const rows = data ?? [];
    // Filtra in-memory por categoria (Supabase não ajuda aqui pq categoria é derivada do nome)
    return rows
      .filter((r: any) => categories.includes(eventCategory(r.event)))
      .slice(0, 3)
      .map((r: any) => ({
        id: r.id,
        date: r.event_date,
        time: r.event_time ?? "",
        country: r.country,
        event: r.event,
        impact: r.impact as "low" | "medium" | "high",
      }));
  } catch {
    return [];
  }
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
  const [{ prev, next }, upcomingEvents] = await Promise.all([
    getAdjacentLessons(id),
    loadRelevantEvents(id),
  ]);

  return (
    <LessonClient
      lessonId={id}
      lesson={lesson}
      mod={mod}
      index={index}
      prev={prev}
      next={next}
      upcomingEvents={upcomingEvents}
    />
  );
}
