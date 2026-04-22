import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { callEdgeFunction } from "@/lib/ura-coin";

export const runtime = "nodejs";

interface ProgressResponse {
  progress: {
    completedLessons: string[];
    quizScores: Record<string, number>;
    checklists: Record<string, number[]>;
    preps: Record<string, unknown>;
    trades: unknown[];
    streak: number;
    bestStreak: number;
    lastActivityDate: string | null;
    accountBalance?: number;
    onboardingCompletedAt?: string | null;
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const res = await callEdgeFunction<ProgressResponse>("user-progress", {
    user_id: session.userId,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { patch?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.patch || typeof body.patch !== "object") {
    return NextResponse.json({ error: "patch required" }, { status: 400 });
  }

  const res = await callEdgeFunction<ProgressResponse>("user-progress", {
    user_id: session.userId,
    patch: body.patch,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
