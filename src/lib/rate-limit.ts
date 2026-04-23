import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** Extrai IP do cliente das headers. Em prod (Vercel) vem via x-forwarded-for.
 *  Fallback pra "unknown" garante que a key nunca fica null. */
export function getClientIp(req: NextRequest | Request): string {
  const headers = "headers" in req ? req.headers : new Headers();
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for pode ter múltiplos IPs (client, proxy1, proxy2...) — pega o 1º
    return xff.split(",")[0].trim();
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Checa (e registra) um hit de rate limit via RPC do Supabase.
 *  Retorna true se a call é permitida; false se passou do limite. */
export async function checkRateLimit(key: string, maxHits: number, windowSeconds: number): Promise<boolean> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("check_rate_limit", {
      p_key: key,
      p_max_hits: maxHits,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.warn("[rate-limit] RPC error, failing open:", error.message);
      return true; // fail open pra não derrubar prod se Supabase vacilar
    }
    return data === true;
  } catch (err) {
    console.warn("[rate-limit] exception, failing open:", err);
    return true;
  }
}

/** Wrapper pra route handler. Retorna 429 se bloqueado, senão chama `handler`. */
export async function withRateLimit<T>(
  req: NextRequest | Request,
  opts: { scope: string; maxHits: number; windowSeconds: number; keyExtra?: string },
  handler: () => Promise<T>,
): Promise<T | NextResponse> {
  const ip = getClientIp(req);
  const key = `${opts.scope}:${ip}${opts.keyExtra ? `:${opts.keyExtra}` : ""}`;
  const allowed = await checkRateLimit(key, opts.maxHits, opts.windowSeconds);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns segundos." },
      { status: 429, headers: { "Retry-After": String(opts.windowSeconds) } },
    );
  }
  return handler();
}
