import { NextResponse } from "next/server";
import { loadTodayEvents } from "@/lib/events-today";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  const events = await loadTodayEvents(8);
  return NextResponse.json({ events });
}
