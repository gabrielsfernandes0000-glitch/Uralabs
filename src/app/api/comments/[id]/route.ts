import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAnon } from "@/lib/supabase";

export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id: commentId } = await params;
  if (!commentId) return NextResponse.json({ error: "comment_id obrigatório" }, { status: 400 });

  const db = getSupabaseAnon();
  const { data, error } = await db.rpc("delete_lesson_comment", {
    p_user_id: session.userId,
    p_comment_id: commentId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const status = (data as { status: string } | null)?.status;
  if (status === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (status === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(data);
}
