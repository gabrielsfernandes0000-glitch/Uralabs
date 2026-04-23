import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAnon } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type CommentRow = {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted: boolean;
  author_username: string | null;
  author_global_name: string | null;
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: lessonId } = await params;
  if (!lessonId) return NextResponse.json({ error: "lesson_id obrigatório" }, { status: 400 });

  const db = getSupabaseAnon();
  const { data, error } = await db.rpc("fetch_lesson_comments", { p_lesson_id: lessonId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ comments: (data ?? []) as CommentRow[] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Anti-spam: 10 comentários/5min/user. Conversa normal fica bem abaixo,
  // flood automatizado (DoS de UX) trava rápido.
  const allowed = await checkRateLimit(`lesson-comment:${session.userId}`, 10, 300);
  if (!allowed) {
    return NextResponse.json({ error: "Muitos comentários em pouco tempo. Espera um pouco." }, { status: 429 });
  }

  const { id: lessonId } = await params;
  if (!lessonId) return NextResponse.json({ error: "lesson_id obrigatório" }, { status: 400 });

  let body: { body?: string; parent_id?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = (body.body ?? "").trim();
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Comentário deve ter entre 1 e 2000 caracteres" }, { status: 400 });
  }

  const db = getSupabaseAnon();
  const { data, error } = await db.rpc("post_lesson_comment", {
    p_user_id: session.userId,
    p_lesson_id: lessonId,
    p_body: text,
    p_parent_id: body.parent_id ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
