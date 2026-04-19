import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAnon } from "@/lib/supabase";

export const runtime = "nodejs";

export interface MuralPost {
  id: string;
  discord_message_id: string;
  user_id: string;
  username: string | null;
  global_name: string | null;
  avatar_url: string | null;
  content: string;
  image_urls: string[];
  message_timestamp: string;
  has_images: boolean;
}

export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get("limit");
  const beforeParam = req.nextUrl.searchParams.get("before");
  const limit = Math.min(Math.max(Number(limitParam ?? 30), 1), 100);

  const db = getSupabaseAnon();
  const { data, error } = await db.rpc("fetch_mural_posts", {
    p_limit: limit,
    p_before: beforeParam ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: (data ?? []) as MuralPost[] });
}
